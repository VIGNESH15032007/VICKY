import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_BUSES, MOCK_ROUTES } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useDriverGpsTracking } from '../../hooks/useDriverGpsTracking';

export default function ActiveTripPage() {
  const [searchParams] = useSearchParams();
  const busParam = searchParams.get('bus') || '42B';
  const tripParam = searchParams.get('trip');

  const { user, profile } = useAuth();
  const bus = MOCK_BUSES.find((b) => b.id === busParam) || MOCK_BUSES[0];
  const route = MOCK_ROUTES.find((r) => r.id === bus.routeId) || MOCK_ROUTES[0];

  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(2); // Willow Creek
  const [fallbackSpeed, setFallbackSpeed] = useState(36);
  const [onScheduleSecs, setOnScheduleSecs] = useState(12);
  const [paxCount, setPaxCount] = useState(28);
  const [announcementPlayed, setAnnouncementPlayed] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);

  // Hook for Driver GPS Location Tracking and Supabase sync
  const {
    isTracking,
    isStarting,
    permissionStatus,
    lastLocation,
    lastSentTime,
    updateCount,
    errorMessage,
    startTracking,
    stopTracking,
  } = useDriverGpsTracking({
    busId: bus.id,
    initialTripId: tripParam,
  });

  const currentStop = route.stops[currentWaypointIdx] || route.stops[2];

  // Active speed: real GPS speed when available and tracking, otherwise fallback
  const displaySpeed = isTracking && lastLocation?.speed != null ? lastLocation.speed : fallbackSpeed;

  const handleNextWaypoint = () => {
    if (currentWaypointIdx < route.stops.length - 1) {
      setCurrentWaypointIdx((idx) => idx + 1);
      setPaxCount((p) => Math.max(5, Math.min(42, p + Math.floor(Math.random() * 5) - 2)));
    } else {
      // Completed terminal run: stop GPS tracking and reset
      stopTracking();
      alert('Trip Completed at Terminal! Resetting route sequence and stopping location sharing.');
      setCurrentWaypointIdx(0);
    }
  };

  const handlePlayChime = () => {
    setAnnouncementPlayed(true);
    setTimeout(() => setAnnouncementPlayed(false), 2000);
  };

  const speedPercentage = Math.min(100, (displaySpeed / 45) * 100);

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8 max-w-4xl mx-auto space-y-4">
      {/* Driver & Vehicle Telemetry Cockpit Strip */}
      <section className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-lg border border-surface-container-high/60">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                badge
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-sm sm:text-base text-on-surface font-bold truncate">
                  {profile?.full_name || 'Marcus Vance'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono">
                  {user?.email || '#DRV-8492'}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant truncate">
                {bus.model} • Bus #{bus.id}
              </p>
            </div>
          </div>

          {/* Route Badge Pill */}
          <div className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary-container flex items-center gap-1.5 shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[18px]">directions_bus</span>
            <span className="font-bold text-xs sm:text-sm tracking-wide">LINE {bus.id}</span>
          </div>
        </div>

        {/* Telemetry & Route Destination */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container bg-surface-container/50 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className={`absolute inline-flex h-full w-full rounded-full ${isTracking ? 'bg-tertiary animate-ping opacity-80' : 'bg-outline opacity-40'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isTracking ? 'bg-tertiary' : 'bg-outline'}`}></span>
            </span>
            <span className="text-xs text-tertiary font-bold tracking-tight truncate font-mono">
              {isTracking
                ? `GPS ACTIVE (±${lastLocation?.accuracy ?? '1.5'}m) • LIVE FEED`
                : 'GPS STANDBY • SHARING PAUSED'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant truncate text-xs">
            <span className="material-symbols-outlined text-[16px] text-primary">route</span>
            <span className="font-semibold text-on-surface truncate">{route.name}</span>
          </div>
        </div>
      </section>

      {/* Real-Time GPS Location Sharing Controls & Status Deck */}
      <section className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-surface-container-high shadow-xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isTracking ? 'bg-tertiary-container/30 text-tertiary' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              <span className={`material-symbols-outlined text-[22px] ${isTracking ? 'animate-pulse' : ''}`}>
                {isTracking ? 'satellite_alt' : 'location_disabled'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-on-surface">Real-Time GPS Location Sharing</h3>
                {isTracking ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/40 text-tertiary text-[10px] font-extrabold uppercase tracking-wide border border-tertiary/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
                    Location Sharing Active
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-outline text-[10px] font-semibold uppercase">
                    Standby
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                Transmits device coordinates via browser Geolocation to Supabase Realtime for passengers.
              </p>
            </div>
          </div>

          {/* Action Button: Start Location Sharing / Stop Location Sharing */}
          <div className="shrink-0">
            {isTracking ? (
              <button
                type="button"
                onClick={stopTracking}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-error-container/40 text-error border border-error/50 hover:bg-error hover:text-on-error font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">stop_circle</span>
                <span>Stop Location Sharing</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startTracking}
                disabled={isStarting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed-dim font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-95 transition disabled:opacity-60"
              >
                {isStarting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Acquiring GPS Fix...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">my_location</span>
                    <span>Start Location Sharing</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Telemetry Status HUD Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-surface-container border border-surface-container-high/60">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-outline">GPS Permission</span>
            <span className={`text-xs font-semibold capitalize flex items-center gap-1.5 mt-1 ${
              permissionStatus === 'granted'
                ? 'text-tertiary font-bold'
                : permissionStatus === 'denied'
                ? 'text-error font-bold'
                : 'text-on-surface'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                permissionStatus === 'granted' ? 'bg-tertiary' : permissionStatus === 'denied' ? 'bg-error' : 'bg-outline'
              }`}></span>
              {permissionStatus === 'granted' ? 'Granted' : permissionStatus === 'denied' ? 'Denied' : 'Prompt'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container border border-surface-container-high/60 font-mono">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-outline font-sans">Current Coordinates</span>
            <span className="text-xs text-on-surface font-bold block mt-1 truncate">
              {lastLocation
                ? `${lastLocation.latitude.toFixed(5)}, ${lastLocation.longitude.toFixed(5)}`
                : 'Awaiting fix...'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container border border-surface-container-high/60">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-outline">Last Synced</span>
            <span className="text-xs text-on-surface font-semibold block mt-1 font-mono">
              {lastSentTime ? lastSentTime.toLocaleTimeString() : (isTracking ? 'Sending sync...' : 'Standby')}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container border border-surface-container-high/60">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-outline">Accuracy &amp; Pings</span>
            <span className="text-xs text-tertiary font-bold block mt-1 font-mono">
              {lastLocation ? `±${lastLocation.accuracy}m (${updateCount} pings)` : 'Inactive'}
            </span>
          </div>
        </div>

        {/* User-friendly Error or Sync Notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-surface-container-highest/60 border border-outline-variant/40 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[18px] text-amber-400 shrink-0">info</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
      </section>

      {/* Next Stop Hero Cockpit Banner */}
      <section className="relative overflow-hidden bg-surface-container rounded-2xl p-5 shadow-2xl border border-surface-container-high">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-widest text-primary-fixed-dim flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[16px] animate-pulse">near_me</span>
              Target Waypoint
            </span>

            {/* Schedule Buffer Indicator */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/30 text-tertiary text-xs font-bold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              ON SCHEDULE (+{onScheduleSecs}s)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight uppercase mt-0.5">
            {currentStop.name}
          </h2>

          <div className="flex items-center gap-4 mt-1 text-on-surface-variant text-xs flex-wrap font-mono">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">straighten</span>
              <span className="font-bold text-on-surface text-sm">450 m</span>
            </div>
            <span className="text-outline-variant font-bold">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">timer</span>
              <span className="font-bold text-on-surface text-sm">1m 45s</span>
            </div>
            <span className="text-outline-variant font-bold">•</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-tertiary">groups</span>
              <span className="font-bold text-tertiary text-sm">8 Boarding</span>
            </div>
          </div>
        </div>
      </section>

      {/* Speedometer & Live Occupancy Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Telemetry Speedometer Gauge */}
        <div className="bg-surface-container-low rounded-2xl p-5 flex flex-col justify-between shadow-lg border border-surface-container">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-wider">Speedometer</span>
            <span className="material-symbols-outlined text-[20px] text-primary">speed</span>
          </div>

          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight font-mono">
              {displaySpeed}
            </span>
            <span className="text-sm font-bold text-on-surface-variant font-mono">km/h</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${speedPercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant font-mono">
              <span>0</span>
              <span className="text-error font-medium">Limit: 45 km/h</span>
            </div>
          </div>
        </div>

        {/* Onboard Occupancy Barometer */}
        <div className="bg-surface-container-low rounded-2xl p-5 flex flex-col justify-between shadow-lg border border-surface-container">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-xs font-bold uppercase tracking-wider">Pax Load Barometer</span>
            <span className="material-symbols-outlined text-[20px] text-secondary">airline_seat_recline_normal</span>
          </div>

          <div className="my-2 flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black text-on-surface tracking-tight font-mono">
              {paxCount}
            </span>
            <span className="text-sm text-on-surface-variant font-mono">/ 42 seats ({42 - paxCount} Free)</span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-500"
                style={{ width: `${(paxCount / 42) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center text-xs text-on-surface-variant font-mono">
              <span>LIDAR Telemetry Synced</span>
              <span className="text-tertiary font-bold">{((paxCount / 42) * 100).toFixed(0)}% Capacity</span>
            </div>
          </div>
        </div>
      </section>

      {/* Driver Controls Cockpit Actions */}
      <section className="p-5 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-2xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-outline">
          Operator Action Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Waypoint Advance */}
          <button
            onClick={handleNextWaypoint}
            className="py-3.5 px-4 rounded-xl bg-primary text-on-primary font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary-fixed-dim active:scale-95 transition"
          >
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>Arrive &amp; Advance Next Stop</span>
          </button>

          {/* Passenger Chime */}
          <button
            onClick={handlePlayChime}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition ${
              announcementPlayed
                ? 'bg-tertiary text-on-tertiary border-tertiary'
                : 'bg-surface-container hover:bg-surface-bright text-on-surface border-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">campaign</span>
            <span>{announcementPlayed ? 'Chime Broadcasted!' : 'Next Stop Audio Chime'}</span>
          </button>

          {/* Delay / Emergency Alert */}
          <button
            onClick={() => setEmergencyActive(!emergencyActive)}
            className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              emergencyActive
                ? 'bg-error text-on-error animate-pulse'
                : 'bg-surface-container hover:bg-surface-bright text-error border border-error/30'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">emergency</span>
            <span>{emergencyActive ? 'Emergency Active' : 'Report Delay / Incident'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
