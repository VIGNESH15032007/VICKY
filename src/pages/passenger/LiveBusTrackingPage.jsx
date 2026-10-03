import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import GoogleMapsProvider from '../../components/map/GoogleMapsProvider';
import BusLiveMap from '../../components/map/BusLiveMap';
import {
  fetchLatestBusLocation,
  subscribeToBusLocations,
  getActiveTripForBus,
  fetchBusDetails,
  fetchRouteAndStopsForTripOrBus,
} from '../../lib/busLocationService';

export default function LiveBusTrackingPage() {
  const { busId: routeBusId } = useParams();
  const [searchParams] = useSearchParams();
  const selectedBusId = routeBusId || searchParams.get('bus') || '42B';
  const tripParam = searchParams.get('trip');

  // Genuine database state — ZERO mock/demo data
  const [busDetails, setBusDetails] = useState({
    id: selectedBusId,
    busNumber: selectedBusId,
    name: `Bus #${selectedBusId}`,
    model: null,
    capacity: null,
  });

  const [routeData, setRouteData] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [liveLocation, setLiveLocation] = useState(null);
  const [activeSpeed, setActiveSpeed] = useState(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [isTrafficActive, setIsTrafficActive] = useState(true);
  const [copiedEta, setCopiedEta] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    let unsubscribe = () => {};

    async function initTracking() {
      try {
        // 1. Fetch real bus details from Supabase public.buses
        const busInfo = await fetchBusDetails(selectedBusId);
        if (!isCancelled && busInfo) {
          setBusDetails(busInfo);
        }

        // 2. Resolve active trip for the bus if tripParam not provided
        let currentTripId = tripParam;
        if (!currentTripId) {
          const trip = await getActiveTripForBus(selectedBusId);
          if (trip?.id) {
            currentTripId = trip.id;
            if (!isCancelled) setActiveTrip(trip);
          }
        }

        // 3. Load real route & stops from Supabase (NEVER mock data)
        const { route, stops } = await fetchRouteAndStopsForTripOrBus({
          tripId: currentTripId,
          busId: selectedBusId,
        });

        if (!isCancelled) {
          setRouteData(route);
          setRouteStops(stops);
        }

        // 4. Fetch the latest genuine location record from public.bus_locations
        const latestLoc = await fetchLatestBusLocation({
          tripId: currentTripId,
          busId: selectedBusId,
        });

        if (!isCancelled) {
          if (latestLoc) {
            setLiveLocation(latestLoc);
            if (latestLoc.speedKph != null) {
              setActiveSpeed(latestLoc.speedKph);
            }
          } else {
            // No location record exists in Supabase yet
            setLiveLocation(null);
            setActiveSpeed(null);
          }
        }

        // 5. Subscribe to Supabase Realtime changes on public.bus_locations & trips
        unsubscribe = subscribeToBusLocations({
          tripId: currentTripId,
          busId: selectedBusId,
          onLocationUpdate: (newLoc) => {
            if (isCancelled) return;
            setLiveLocation(newLoc);
            if (newLoc.speedKph != null) {
              setActiveSpeed(newLoc.speedKph);
            }
            setIsRealtimeActive(true);
            // Pan map camera to updated live position
            setRecenterTrigger((c) => c + 1);
          },
          onStatusChange: ({ isTracking }) => {
            if (isCancelled) return;
            if (!isTracking) {
              // Driver stopped location sharing (State C)
              setLiveLocation(null);
              setActiveSpeed(null);
              setIsRealtimeActive(false);
            }
          },
        });
      } catch (err) {
        console.warn('Bus tracking initialization error:', err);
        if (!isCancelled) {
          setLiveLocation(null);
          setActiveSpeed(null);
        }
      }
    }

    initTracking();

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [tripParam, selectedBusId]);

  const handleShareEta = () => {
    setCopiedEta(true);
    navigator.clipboard?.writeText?.(
      `Live Tracking for Bus #${busDetails.busNumber || selectedBusId} on MetroPulse GPS Tracker.`
    );
    setTimeout(() => setCopiedEta(false), 2000);
  };

  const handleRecenter = () => {
    setRecenterTrigger((c) => c + 1);
  };

  const handleToggleTraffic = () => {
    setIsTrafficActive((prev) => !prev);
  };

  return (
    <div className="flex flex-col w-full relative">
      {/* Map Canvas & Geospatial Real-Time Viewport (Google Maps Integration) */}
      <div className="relative w-full h-[380px] xs:h-[440px] md:h-[500px] overflow-hidden bg-surface-container-lowest select-none border-b border-surface-container-high/40">
        <GoogleMapsProvider>
          <BusLiveMap
            bus={busDetails}
            route={routeData ? { ...routeData, stops: routeStops } : { stops: routeStops }}
            liveLocation={liveLocation}
            activeSpeed={activeSpeed}
            isRealtimeActive={isRealtimeActive}
            recenterTrigger={recenterTrigger}
            onRecenter={handleRecenter}
            isTrafficActive={isTrafficActive}
            onToggleTraffic={handleToggleTraffic}
          />
        </GoogleMapsProvider>
      </div>

      {/* Floating Bottom Sheet Telemetry Deck */}
      <div className="w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto -mt-8 z-30 pb-6">
        <div className="w-full rounded-2xl bg-surface-container-low border border-surface-container-high shadow-2xl p-5 sm:p-6 flex flex-col gap-5">
          {/* Pull Handle */}
          <div className="w-12 h-1 rounded-full bg-outline-variant/60 mx-auto -mt-1 mb-1"></div>

          {/* Header Line Identifier & Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex flex-col items-center justify-center shrink-0 shadow-md">
                <span className="font-extrabold text-base leading-none">{busDetails.busNumber || selectedBusId}</span>
                <span className="text-[9px] uppercase tracking-wider text-secondary leading-tight mt-0.5">Live Bus</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight truncate">
                    {routeData?.name || `Bus Line ${busDetails.busNumber || selectedBusId}`}
                  </h2>
                </div>
                <p className="text-xs text-on-surface-variant truncate">
                  {routeData?.description || (busDetails.model ? `${busDetails.model}` : 'Public Transport Fleet')}
                </p>
              </div>
            </div>

            <Badge
              status={liveLocation ? 'ON_TIME' : 'DELAYED'}
              text={liveLocation ? 'GPS ACTIVE' : 'GPS STANDBY'}
            />
          </div>

          {/* Waiting for driver GPS indicator */}
          {!liveLocation && (
            <div className="w-full px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-300 min-w-0">
                <span className="material-symbols-outlined text-[20px] shrink-0 animate-pulse">satellite_alt</span>
                <div className="min-w-0">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>Waiting for driver GPS...</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  </div>
                  <p className="text-[11px] text-amber-200/80 mt-0.5 truncate">
                    No active coordinates in Supabase. Map will update automatically once driver starts location sharing.
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-200 font-mono shrink-0">
                Line {busDetails.busNumber || selectedBusId}
              </span>
            </div>
          )}

          {/* Telemetry Highlight Banner */}
          <div className="w-full p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${liveLocation ? 'bg-primary-container/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-[22px]">
                  {liveLocation ? 'near_me' : 'satellite_alt'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-on-surface-variant uppercase tracking-wider block">
                  {liveLocation ? 'Active Location Fix' : 'Location Status'}
                </span>
                <span className="text-base font-bold text-on-surface">
                  {liveLocation ? 'Live In-Transit' : 'Waiting for driver GPS...'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant font-mono">
              <div>
                <span className="block text-[10px] text-outline uppercase">Coordinates</span>
                {liveLocation ? (
                  <strong className="text-on-surface text-sm">
                    {liveLocation.latitude.toFixed(5)}, {liveLocation.longitude.toFixed(5)}
                  </strong>
                ) : (
                  <span className="text-amber-300 text-xs font-semibold flex items-center gap-1 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    Waiting for driver GPS...
                  </span>
                )}
              </div>
              <div className="h-6 w-[1px] bg-surface-container-highest"></div>
              <div>
                <span className="block text-[10px] text-outline uppercase">Live Speed</span>
                <strong className="text-on-surface text-sm">
                  {liveLocation && activeSpeed != null ? `${activeSpeed} km/h` : '--'}
                </strong>
              </div>
              <div className="h-6 w-[1px] bg-surface-container-highest"></div>
              <div>
                <span className="block text-[10px] text-outline uppercase">Last Recorded</span>
                <strong className="text-tertiary text-sm">
                  {liveLocation?.recordedAt
                    ? new Date(liveLocation.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : '--:--:--'}
                </strong>
              </div>
              {busDetails.capacity && (
                <>
                  <div className="h-6 w-[1px] bg-surface-container-highest"></div>
                  <div>
                    <span className="block text-[10px] text-outline uppercase">Capacity</span>
                    <strong className="text-primary text-sm">{busDetails.capacity} Seats</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stop Sequence Timeline */}
          {routeStops.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Route Stop Sequence ({routeData?.name || `Line ${busDetails.busNumber || selectedBusId}`})
              </span>

              <div className="relative pl-6 space-y-4 pt-2">
                <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-primary/30"></div>

                {routeStops.map((stop, idx) => (
                  <div key={stop.id || idx} className="relative flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="absolute -left-6 w-5 h-5 rounded-full bg-surface-container-low border-2 border-outline-variant flex items-center justify-center font-bold text-[10px] text-primary">
                        {stop.order || idx + 1}
                      </span>
                      <span className="font-semibold text-on-surface">
                        {stop.name}
                      </span>
                    </div>
                    <div className="text-on-surface-variant font-mono text-[11px]">
                      {stop.lat?.toFixed(4)}, {stop.lng?.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-container/60 border border-surface-container-high text-xs text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-outline">alt_route</span>
              <span>No route stops registered for this line in database. Live position will be plotted directly from driver GPS.</span>
            </div>
          )}

          {/* Quick Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-surface-container">
            <Link
              to="/passenger/search"
              className="py-2.5 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-semibold text-center text-on-surface transition flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Search Other Bus Lines</span>
            </Link>

            <button
              onClick={handleShareEta}
              className="py-2.5 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-semibold text-center text-secondary transition flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>{copiedEta ? 'Copied to Clipboard!' : 'Share Live Tracking'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
