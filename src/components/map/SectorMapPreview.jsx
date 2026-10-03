import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { DARK_MAP_STYLES } from './mapStyles';
import GoogleMapsProvider, { getGoogleMapsMapId, isGoogleMapsConfigured } from './GoogleMapsProvider';
import { fetchAllActiveBusLocations, subscribeToBusLocations } from '../../lib/busLocationService';

function SectorMapInner({ buses }) {
  const navigate = useNavigate();
  const mapId = getGoogleMapsMapId();
  const [liveLocations, setLiveLocations] = useState([]);
  const [deviceCenter, setDeviceCenter] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    // Detect device center if permitted
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos?.coords && !isCancelled) {
            setDeviceCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {},
        { timeout: 4000, maximumAge: 60000 }
      );
    }

    // Fetch genuine active locations from Supabase
    fetchAllActiveBusLocations().then((locs) => {
      if (!isCancelled && locs) {
        setLiveLocations(locs);
      }
    });

    const unsubscribe = subscribeToBusLocations({
      onLocationUpdate: () => {
        if (!isCancelled) {
          fetchAllActiveBusLocations().then((locs) => {
            if (!isCancelled && locs) setLiveLocations(locs);
          });
        }
      },
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, []);

  const defaultCenter = liveLocations.length > 0
    ? { lat: liveLocations[0].latitude, lng: liveLocations[0].longitude }
    : (deviceCenter || { lat: 20.5937, lng: 78.9629 });

  return (
    <div className="relative w-full h-full">
      <Map
        mapId={mapId}
        defaultCenter={defaultCenter}
        defaultZoom={13}
        colorScheme="DARK"
        styles={DARK_MAP_STYLES}
        disableDefaultUI={true}
        gestureHandling="cooperative"
        internalUsageAttributionIds={['gmp_git_agentskills_v1']}
        style={{ width: '100%', height: '100%' }}
      >
        {liveLocations.map((loc) => {
          if (!loc.latitude || !loc.longitude) return null;
          const matchedBus = (buses || []).find((b) => b.id === loc.busNumber || b.bus_number === loc.busNumber);
          const busLabel = loc.busNumber || matchedBus?.bus_number || matchedBus?.id || 'Bus';

          return (
            <AdvancedMarker
              key={loc.id || `${loc.latitude}-${loc.longitude}`}
              position={{ lat: loc.latitude, lng: loc.longitude }}
              onClick={() => navigate(`/passenger/tracking/${loc.busNumber || matchedBus?.id || loc.id}`)}
            >
              <div
                title={`Track Bus ${busLabel}`}
                className="flex items-center gap-1.5 cursor-pointer group pointer-events-auto"
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-primary/40"></span>
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-extrabold text-[11px] shadow-lg group-hover:scale-110 transition-transform">
                    {busLabel}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-surface-container-high/90 backdrop-blur-md border border-primary/30 text-on-surface text-[11px] font-semibold shadow-md whitespace-nowrap group-hover:text-primary transition-colors">
                  {loc.speedKph != null ? `${loc.speedKph} km/h` : 'Live GPS'}
                </span>
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>

      {/* Subtle bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface/80 via-transparent to-transparent pointer-events-none"></div>

      {/* Floating Info Pill */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <span className="px-2.5 py-1 rounded-full bg-surface-container-low/90 backdrop-blur-md border border-surface-container text-[11px] text-on-surface font-medium shadow flex items-center gap-1.5">
          {liveLocations.length > 0 ? (
            <>
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span>{liveLocations.length} active GPS {liveLocations.length === 1 ? 'bus' : 'buses'} online • Tap pin to track</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Waiting for driver GPS • Standby</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export default function SectorMapPreview({ buses = [] }) {
  const isConfigured = isGoogleMapsConfigured();

  const fallback = (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-center bg-surface-container-lowest">
      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-2">
        <span className="material-symbols-outlined text-[24px]">map</span>
      </div>
      <p className="text-xs font-semibold text-on-surface">Sector Telemetry Map</p>
      <p className="text-[11px] text-on-surface-variant max-w-xs mt-1">
        Configure <code className="text-primary font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="text-primary font-mono">.env.local</code> to activate live radar view.
      </p>
    </div>
  );

  return (
    <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-surface-container-lowest border border-surface-container shadow-xl">
      {isConfigured ? (
        <GoogleMapsProvider fallback={fallback}>
          <SectorMapInner buses={buses} />
        </GoogleMapsProvider>
      ) : (
        fallback
      )}
    </div>
  );
}
