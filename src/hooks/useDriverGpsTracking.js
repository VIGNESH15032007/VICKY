import { useState, useEffect, useRef, useCallback } from 'react';
import {
  findOrCreateActiveTrip,
  recordDriverLocation,
  calculateDistanceMeters,
} from '../lib/busLocationService';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

// Minimum interval between database writes (5 seconds)
const MIN_UPDATE_INTERVAL_MS = 5000;
// Maximum heartbeat interval before sending update even if stationary (10 seconds)
const HEARTBEAT_INTERVAL_MS = 10000;
// Minimum movement distance in meters to qualify as significant movement
const SIGNIFICANT_DISTANCE_METERS = 15;

export function useDriverGpsTracking({ busId = '42B', initialTripId = null } = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // prompt | granted | denied | unsupported
  const [lastLocation, setLastLocation] = useState(null);
  const [lastSentTime, setLastSentTime] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);

  const watchIdRef = useRef(null);
  const lastSentTimeRef = useRef(null);
  const lastSentCoordsRef = useRef(null);
  const activeTripRef = useRef(null);
  const isTrackingRef = useRef(false);

  // Synchronize ref with state
  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  // Check browser permission status if supported
  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setPermissionStatus('unsupported');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          setPermissionStatus(result.state);
          result.onchange = () => {
            setPermissionStatus(result.state);
            if (result.state === 'denied' && isTrackingRef.current) {
              stopTracking();
              setErrorMessage('Location permission was revoked in browser settings.');
            }
          };
        })
        .catch(() => {
          // Fallback if permissions.query fails
        });
    }
  }, []);

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    const currentTrip = activeTripRef.current;
    if (currentTrip?.tripId && isSupabaseConfigured()) {
      try {
        await supabase
          .from('trips')
          .update({ status: 'standby' })
          .eq('id', currentTrip.tripId);
      } catch (e) {
        console.warn('Error setting trip status to standby on stop:', e);
      }
    }

    setIsTracking(false);
    setIsStarting(false);
    isTrackingRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const handlePositionSuccess = useCallback(async (position) => {
    const { latitude, longitude, accuracy, speed, heading } = position.coords;
    const timestamp = position.timestamp || Date.now();

    const currentCoords = {
      latitude,
      longitude,
      accuracy: Math.round(accuracy * 10) / 10,
      speed: speed != null && speed >= 0 ? Math.round(speed * 3.6) : 0, // km/h
      heading: heading != null && !isNaN(heading) ? Math.round(heading) : 0,
      timestamp,
    };

    // Update real-time local display immediately
    setLastLocation(currentCoords);
    setPermissionStatus('granted');
    setIsStarting(false);
    setIsTracking(true);
    isTrackingRef.current = true;
    setErrorMessage(null);

    // Rate-limiting / Throttling logic
    const now = Date.now();
    const timeSinceLast = lastSentTimeRef.current ? now - lastSentTimeRef.current : Infinity;

    let shouldSend = false;

    if (lastSentTimeRef.current === null) {
      // First GPS fix: send immediately
      shouldSend = true;
    } else if (timeSinceLast >= MIN_UPDATE_INTERVAL_MS) {
      const distance = lastSentCoordsRef.current
        ? calculateDistanceMeters(
            lastSentCoordsRef.current.latitude,
            lastSentCoordsRef.current.longitude,
            latitude,
            longitude
          )
        : Infinity;

      // Send if significant movement (>= 15m) or heartbeat interval reached (>= 10s)
      if (distance >= SIGNIFICANT_DISTANCE_METERS || timeSinceLast >= HEARTBEAT_INTERVAL_MS) {
        shouldSend = true;
      }
    }

    if (shouldSend) {
      const currentTrip = activeTripRef.current;
      if (currentTrip?.tripId) {
        const result = await recordDriverLocation({
          tripId: currentTrip.tripId,
          busId: currentTrip.busId,
          latitude,
          longitude,
          speedKph: currentCoords.speed,
          heading: currentCoords.heading,
          timestamp,
        });

        if (result.success) {
          lastSentTimeRef.current = now;
          lastSentCoordsRef.current = { latitude, longitude };
          setLastSentTime(new Date(now));
          setUpdateCount((c) => c + 1);
        } else if (result.error) {
          setErrorMessage(`Sync Notice: ${result.error}`);
        }
      }
    }
  }, []);

  const handlePositionError = useCallback((err) => {
    setIsStarting(false);
    let userMsg = 'An unknown GPS error occurred.';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        userMsg = 'GPS location permission denied. Please allow location access in your browser.';
        setPermissionStatus('denied');
        stopTracking();
        break;
      case err.POSITION_UNAVAILABLE:
        userMsg = 'GPS location information unavailable. Ensure your device GPS is turned on.';
        break;
      case err.TIMEOUT:
        userMsg = 'GPS signal request timed out. Retrying location lock...';
        break;
      default:
        userMsg = err.message || userMsg;
        break;
    }

    setErrorMessage(userMsg);
  }, [stopTracking]);

  const startTracking = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setErrorMessage('Geolocation is not supported by your browser.');
      setPermissionStatus('unsupported');
      return;
    }

    setIsStarting(true);
    setErrorMessage(null);

    // 1. Resolve or verify active trip in Supabase
    let trip = activeTripRef.current;
    if (!trip) {
      const tripResult = await findOrCreateActiveTrip({ busNumber: busId, tripId: initialTripId });
      if (tripResult.success) {
        trip = { tripId: tripResult.tripId, busId: tripResult.busId };
        setActiveTrip(trip);
        activeTripRef.current = trip;
        if (isSupabaseConfigured()) {
          supabase
            .from('trips')
            .update({ status: 'in_progress' })
            .eq('id', trip.tripId)
            .then(() => {});
        }
      } else {
        setErrorMessage(
          tripResult.error || 'No active trip found for this bus. Connecting local GPS stream...'
        );
      }
    }

    // 2. Start watching position with high accuracy
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    };

    try {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionSuccess,
        handlePositionError,
        options
      );
    } catch (err) {
      setIsStarting(false);
      setErrorMessage(`Failed to initialize geolocation: ${err.message}`);
    }
  }, [busId, initialTripId, handlePositionSuccess, handlePositionError]);

  return {
    isTracking,
    isStarting,
    permissionStatus,
    lastLocation,
    lastSentTime,
    updateCount,
    errorMessage,
    activeTrip,
    startTracking,
    stopTracking,
  };
}
