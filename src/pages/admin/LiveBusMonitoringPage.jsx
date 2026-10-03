import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { fetchAllActiveBusLocations } from '../../lib/busLocationService';
import Badge from '../../components/common/Badge';

export default function LiveBusMonitoringPage() {
  const [buses, setBuses] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMonitoringData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const [busesRes, tripsRes, locsData] = await Promise.all([
        supabase.from('buses').select('*').order('bus_number', { ascending: true }),
        supabase
          .from('trips')
          .select('*, bus:buses(*), route:routes(*), driver:drivers(*, profile:profiles(*))')
          .in('status', ['in_progress', 'active', 'ACTIVE', 'IN_PROGRESS']),
        fetchAllActiveBusLocations(),
      ]);

      setBuses(busesRes.data || []);
      setActiveTrips(tripsRes.data || []);
      setLiveLocations(locsData || []);
    } catch (err) {
      console.warn('Error loading live monitoring data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonitoringData();

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('live-monitoring-wall')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bus_locations' },
          async () => {
            const locs = await fetchAllActiveBusLocations();
            setLiveLocations(locs || []);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'trips' },
          () => {
            loadMonitoringData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadMonitoringData]);

  // Combine buses with their active trip and latest location
  const monitoredUnits = buses.map((bus) => {
    const activeTrip = activeTrips.find((t) => t.bus_id === bus.id);
    const location = liveLocations.find((l) => l.trip_id === activeTrip?.id || l.bus_id === bus.id);
    const isBusActive = bus.is_active !== false;

    return {
      id: bus.bus_number || bus.id.slice(0, 6),
      rawId: bus.id,
      name: bus.model || `Bus #${bus.bus_number || bus.id.slice(0, 6)}`,
      routeName: activeTrip?.route?.name || (activeTrip ? `Route ${activeTrip.route?.route_number || ''}` : 'In Depot'),
      driverName: activeTrip?.driver?.profile?.full_name || 'Standby Driver',
      speed: location?.speed_kph || 0,
      speedLimit: 45,
      status: activeTrip ? 'ON_TIME' : isBusActive ? 'STANDBY' : 'MAINTENANCE',
      statusText: activeTrip ? 'In Service' : isBusActive ? 'At Depot' : 'Maintenance',
      capacity: bus.capacity || 42,
      lastPing: location?.recorded_at ? new Date(location.recorded_at).toLocaleTimeString() : 'No GPS Ping',
    };
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-xs font-semibold text-tertiary uppercase tracking-wider font-mono">
              Live Fleet Telemetry Stream
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mt-0.5">
            Operational Telemetry Monitoring Wall
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Live heads-up display of vehicle speeds, corridor status, driver shifts, and emergency alerts from Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container p-2 px-3 rounded-xl border border-surface-container-high text-xs">
          <span className="material-symbols-outlined text-tertiary text-[18px]">cell_tower</span>
          <span className="font-mono text-on-surface">Supabase Realtime • Active</span>
        </div>
      </div>

      {/* Monitoring Grid */}
      {monitoredUnits.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-surface-container text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[42px] text-outline mb-2 block">
            radar
          </span>
          <h3 className="font-bold text-base text-on-surface">No Vehicles Registered for Monitoring</h3>
          <p className="text-xs text-outline mt-1 max-w-sm mx-auto">
            Once buses are deployed from the Bus Management portal, operational telemetry indicators will display here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monitoredUnits.map((bus) => {
            const isSpeeding = bus.speed > bus.speedLimit;

            return (
              <div
                key={bus.rawId}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-xl ${
                  isSpeeding
                    ? 'bg-error-container/20 border-error/50'
                    : 'bg-surface-container-high border-surface-container-highest'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary font-bold font-mono text-sm flex items-center justify-center">
                        {bus.id}
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface text-sm">{bus.name}</h3>
                        <span className="text-[10px] text-outline">{bus.routeName}</span>
                      </div>
                    </div>
                    <Badge
                      status={bus.status}
                      text={bus.statusText}
                      size="sm"
                    />
                  </div>

                  {/* Telemetry Gauge Display */}
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {/* Speedometer */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        isSpeeding
                          ? 'bg-error-container/40 border-error text-error'
                          : 'bg-surface-container-lowest border-surface-container'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-outline">
                        <span>Speed</span>
                        {isSpeeding && <span className="text-error font-extrabold animate-pulse">OVER LIMIT</span>}
                      </div>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-black font-mono">{bus.speed}</span>
                        <span className="text-[10px] text-outline">/ {bus.speedLimit} km/h</span>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container flex flex-col justify-between">
                      <span className="text-[10px] uppercase font-bold text-outline">Capacity</span>
                      <div className="mt-1">
                        <span className="text-2xl font-black font-mono text-primary">{bus.capacity}</span>
                        <span className="text-[10px] text-outline block">Seats</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Telemetry */}
                <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-[11px] text-outline">
                  <span>Driver: <strong className="text-on-surface">{bus.driverName}</strong></span>
                  <span className="font-mono">{bus.lastPing}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
