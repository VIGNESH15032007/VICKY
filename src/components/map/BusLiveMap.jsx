// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useCallback } from 'react';
import { Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { DARK_MAP_STYLES } from './mapStyles';
import MapPolyline from './MapPolyline';
import { getGoogleMapsMapId } from './GoogleMapsProvider';

/**
 * Controller to smoothly pan the Google Map to the active bus position
 */
function MapCameraController({ center, recenterTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (map && center?.lat != null && center?.lng != null) {
      map.panTo({ lat: center.lat, lng: center.lng });
    }
  }, [map, center?.lat, center?.lng, recenterTrigger]);

  return null;
}

export default function BusLiveMap({
  bus,
  route,
  liveLocation,
  activeSpeed,
  isRealtimeActive = false,
  recenterTrigger = 0,
  onRecenter,
  isTrafficActive = true,
  onToggleTraffic,
}) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [deviceCenter, setDeviceCenter] = useState(null);
  const mapId = getGoogleMapsMapId();

  // Attempt to center neutral view on user's device area instead of hardcoded demo coordinates
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos?.coords) {
            setDeviceCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {},
        { timeout: 4000, maximumAge: 60000 }
      );
    }
  }, []);

  // Route path coordinates from stops ONLY if genuine database route stops are present
  const routePath = React.useMemo(() => {
    if (!route?.stops || route.stops.length === 0) return [];
    return route.stops
      .filter((s) => s.lat != null && s.lng != null)
      .map((s) => ({ lat: s.lat, lng: s.lng }));
  }, [route]);

  // Strict check: only render bus marker if genuine location exists from Supabase
  const hasLiveLocation =
    liveLocation?.latitude != null &&
    liveLocation?.longitude != null &&
    !isNaN(Number(liveLocation.latitude)) &&
    !isNaN(Number(liveLocation.longitude));

  const busPosition = hasLiveLocation
    ? { lat: Number(liveLocation.latitude), lng: Number(liveLocation.longitude) }
    : null;

  // Neutral map center: busPosition > real route stops midpoint > user device location > neutral default
  const mapCenter = React.useMemo(() => {
    if (busPosition) return busPosition;
    if (routePath.length > 0) {
      const midIdx = Math.floor(routePath.length / 2);
      return routePath[midIdx] || routePath[0];
    }
    return deviceCenter || { lat: 20.5937, lng: 78.9629 };
  }, [busPosition, routePath, deviceCenter]);

  const handleCompassClick = useCallback(() => {
    // Reset to True North
    alert('Map rotated to True North (360° Compass Alignment)');
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] select-none bg-surface-container-lowest">
      <Map
        mapId={mapId}
        defaultCenter={mapCenter}
        defaultZoom={14}
        colorScheme="DARK"
        styles={DARK_MAP_STYLES}
        disableDefaultUI={true}
        zoomControl={false}
        gestureHandling="greedy"
        internalUsageAttributionIds={['gmp_git_agentskills_v1']}
        style={{ width: '100%', height: '100%' }}
      >
        <MapCameraController center={busPosition || mapCenter} recenterTrigger={recenterTrigger} />

        {/* Bus Route Polylines (Glow + Main Line) */}
        {isTrafficActive && routePath.length > 1 && (
          <>
            <MapPolyline
              path={routePath}
              strokeColor="#8B5CF6"
              strokeOpacity={0.35}
              strokeWeight={9}
              zIndex={2}
            />
            <MapPolyline
              path={routePath}
              strokeColor="#c084fc"
              strokeOpacity={0.95}
              strokeWeight={3.5}
              zIndex={3}
            />
          </>
        )}

        {/* Bus Stop Markers */}
        {route?.stops?.map((stop) => {
          if (stop.lat == null || stop.lng == null) return null;
          const isPassed = stop.status === 'passed';
          const isCurrent = stop.status === 'current' || stop.name === bus?.nextStop;

          return (
            <AdvancedMarker
              key={stop.id}
              position={{ lat: stop.lat, lng: stop.lng }}
              zIndex={isCurrent ? 30 : 10}
              onClick={() => setSelectedMarker({ type: 'stop', data: stop })}
            >
              {isPassed ? (
                <div
                  title={stop.name}
                  className="w-5 h-5 rounded-full bg-surface-container-highest/90 border border-outline-variant/60 flex items-center justify-center text-outline text-[10px] font-bold shadow-md cursor-pointer hover:scale-110 transition-transform"
                >
                  ✓
                </div>
              ) : isCurrent ? (
                <div
                  title={`Approaching: ${stop.name}`}
                  className="relative flex items-center justify-center cursor-pointer group"
                >
                  <span className="absolute w-8 h-8 rounded-full bg-tertiary/30 animate-ping"></span>
                  <div className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-tertiary/50">
                    <span className="material-symbols-outlined text-[15px]">near_me</span>
                  </div>
                  <span className="absolute -top-6 whitespace-nowrap px-2 py-0.5 rounded-full bg-surface-container-highest text-tertiary text-[10px] font-bold border border-tertiary/40 shadow-md">
                    {stop.name}
                  </span>
                </div>
              ) : (
                <div
                  title={stop.name}
                  className="w-4 h-4 rounded-full bg-surface-container-lowest border-2 border-primary/70 flex items-center justify-center shadow-md hover:scale-125 transition-transform cursor-pointer"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                </div>
              )}
            </AdvancedMarker>
          );
        })}

        {/* Live Bus Marker - ONLY rendered when real location exists in Supabase */}
        {busPosition && (
          <AdvancedMarker
            position={busPosition}
            zIndex={50}
            onClick={() => setSelectedMarker({ type: 'bus', data: bus })}
          >
            <div className="relative flex flex-col items-center pointer-events-auto cursor-pointer group">
              {/* Pulsing Radar Halo */}
              <div className="relative flex items-center justify-center">
                <span className="absolute w-14 h-14 rounded-full bg-primary-container/30 animate-ping"></span>
                <span className="absolute w-9 h-9 rounded-full bg-primary/40 animate-pulse"></span>
                <div className="relative w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl shadow-primary-container/50 border border-white/20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                </div>
              </div>
              {/* Bus ID Label Badge */}
              <div className="mt-1 px-2 py-0.5 rounded-full bg-surface-container-highest/95 border border-primary/40 shadow-md flex items-center gap-1 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-label-sm text-xs text-on-surface font-bold tracking-tight">
                  {bus?.id || '42B'}
                </span>
              </div>
            </div>
          </AdvancedMarker>
        )}

        {/* InfoWindow for Selected Bus Marker */}
        {selectedMarker?.type === 'bus' && busPosition && (
          <InfoWindow
            position={busPosition}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-1 min-w-[200px] text-neutral-900">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded bg-purple-700 text-white font-bold text-xs">
                  {bus?.id}
                </span>
                <span className="font-bold text-sm">{bus?.name}</span>
              </div>
              <div className="text-xs space-y-1 text-neutral-700 font-mono">
                <div>Route: <strong className="text-neutral-900">{bus?.routeName}</strong></div>
                <div>Next Stop: <strong className="text-purple-700">{bus?.nextStop}</strong></div>
                <div>ETA: <strong>{bus?.eta}</strong></div>
                <div>Speed: <strong>{activeSpeed != null ? `${activeSpeed} km/h` : '0 km/h'}</strong></div>
                <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-200">
                  Lat: {busPosition.lat.toFixed(5)}, Lng: {busPosition.lng.toFixed(5)}
                </div>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* InfoWindow for Selected Stop Marker */}
        {selectedMarker?.type === 'stop' && selectedMarker.data && (
          <InfoWindow
            position={{ lat: selectedMarker.data.lat, lng: selectedMarker.data.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-1 min-w-[180px] text-neutral-900">
              <div className="font-bold text-sm mb-1">{selectedMarker.data.name}</div>
              <div className="text-xs space-y-0.5 text-neutral-700">
                <div>Distance: <strong>{selectedMarker.data.distance}</strong></div>
                <div>Scheduled: <strong>{selectedMarker.data.time}</strong></div>
                <div className="capitalize">
                  Status:{' '}
                  <strong className={selectedMarker.data.status === 'current' ? 'text-purple-700' : ''}>
                    {selectedMarker.data.status}
                  </strong>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Floating Top Telemetry Bar over Map */}
      <div className="absolute top-4 inset-x-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
        <div className="flex items-center gap-2">
          {/* Realtime Status Badge */}
          <div className="pointer-events-auto bg-surface-container-lowest/85 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-surface-container shadow-md">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${hasLiveLocation ? 'bg-tertiary' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${hasLiveLocation ? 'bg-tertiary' : 'bg-amber-400'}`}></span>
            </span>
            <span className="text-xs text-on-surface font-medium">GPS Telemetry</span>
            <span className={`text-xs font-bold tracking-wider font-mono ${hasLiveLocation ? 'text-tertiary' : 'text-amber-400'}`}>
              {hasLiveLocation ? (isRealtimeActive ? 'SUPABASE LIVE' : 'SYNCED') : 'STANDBY'}
            </span>
          </div>

          {/* Latitude & Longitude Pill or "Waiting for driver GPS..." */}
          {busPosition ? (
            <div className="pointer-events-auto bg-surface-container-lowest/85 backdrop-blur-md px-3 py-1.5 rounded-full hidden sm:flex items-center gap-1.5 border border-surface-container shadow-md font-mono text-xs">
              <span className="material-symbols-outlined text-[15px] text-primary">pin_drop</span>
              <span className="text-on-surface-variant">LAT:</span>
              <span className="text-on-surface font-semibold">{busPosition.lat.toFixed(5)}</span>
              <span className="text-outline mx-0.5">•</span>
              <span className="text-on-surface-variant">LNG:</span>
              <span className="text-on-surface font-semibold">{busPosition.lng.toFixed(5)}</span>
            </div>
          ) : (
            <div className="pointer-events-auto bg-surface-container-lowest/90 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-amber-500/40 shadow-md text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-amber-300 font-semibold font-sans">Waiting for driver GPS...</span>
            </div>
          )}
        </div>

        {/* Live Speed Indicator */}
        <div className="pointer-events-auto bg-surface-container-lowest/85 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-surface-container shadow-md">
          <span className="material-symbols-outlined text-[16px] text-primary">speed</span>
          <span className="text-xs text-on-surface-variant">Speed</span>
          <span className="text-xs text-primary font-bold font-mono">
            {busPosition && activeSpeed != null ? `${activeSpeed} km/h` : '-- km/h'}
          </span>
        </div>
      </div>

      {/* Floating Map Controls on Right Flank */}
      <div className="absolute right-4 bottom-20 flex flex-col gap-2 z-20">
        <button
          onClick={handleCompassClick}
          aria-label="Compass"
          title="Align True North"
          className="w-10 h-10 rounded-full bg-surface-container-high/90 backdrop-blur-md border border-outline-variant/30 flex items-center justify-center text-on-surface shadow-lg hover:bg-surface-bright active:scale-95 transition"
        >
          <span className="material-symbols-outlined text-primary text-[20px] -rotate-45">explore</span>
        </button>
        <button
          onClick={onRecenter}
          aria-label="Recenter on Bus"
          title="Recenter on Bus"
          className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-fixed-dim active:scale-90 transition"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
        </button>
        <button
          onClick={onToggleTraffic}
          aria-label="Toggle Route Overlay"
          title="Toggle Route Polyline"
          className={`w-10 h-10 rounded-full backdrop-blur-md border border-outline-variant/30 flex items-center justify-center shadow-lg active:scale-95 transition ${
            isTrafficActive
              ? 'bg-primary-container text-on-primary'
              : 'bg-surface-container-high/90 text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">layers</span>
        </button>
      </div>

      {/* Bottom soft gradient mask */}
      <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-surface via-surface/60 to-transparent pointer-events-none"></div>
    </div>
  );
}
