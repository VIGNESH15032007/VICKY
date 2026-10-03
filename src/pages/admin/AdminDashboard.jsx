import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { fetchAllActiveBusLocations } from '../../lib/busLocationService';
import Badge from '../../components/common/Badge';

export default function AdminDashboard() {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [activeLocations, setActiveLocations] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('Thank you for notifying dispatch. Our maintenance crew has inspected this report.');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Load all operational dashboard data from Supabase
  const loadDashboardData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const [
        busesRes,
        driversRes,
        routesRes,
        tripsRes,
        locationsData,
        feedbackRes,
      ] = await Promise.all([
        supabase.from('buses').select('*').order('created_at', { ascending: false }),
        supabase.from('drivers').select('*, profile:profiles(*)').order('created_at', { ascending: false }),
        supabase.from('routes').select('*').order('created_at', { ascending: false }),
        supabase.from('trips').select('*, bus:buses(*), route:routes(*), driver:drivers(*, profile:profiles(*))').order('created_at', { ascending: false }),
        fetchAllActiveBusLocations(),
        supabase.from('feedback').select('*, passenger:profiles(*), trip:trips(*, bus:buses(*))').order('id', { ascending: false }).limit(10),
      ]);

      const busRows = busesRes.data || [];
      setBuses(busRows);
      setDrivers(driversRes.data || []);
      setRoutes(routesRes.data || []);
      setTrips(tripsRes.data || []);
      setActiveLocations(locationsData || []);
      setFeedbackList(feedbackRes.data || []);

      if (busRows.length > 0 && !selectedBusId) {
        setSelectedBusId(busRows[0].bus_number || busRows[0].id);
      }
    } catch (err) {
      console.warn('Error loading admin telemetry from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBusId]);

  useEffect(() => {
    loadDashboardData();

    // Subscribe to realtime updates for live fleet tracking and new activity
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('admin-dashboard-telemetry')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bus_locations' },
          async () => {
            const locs = await fetchAllActiveBusLocations();
            setActiveLocations(locs || []);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'trips' },
          async () => {
            const { data } = await supabase
              .from('trips')
              .select('*, bus:buses(*), route:routes(*), driver:drivers(*, profile:profiles(*))')
              .order('created_at', { ascending: false });
            if (data) setTrips(data);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'buses' },
          async () => {
            const { data } = await supabase
              .from('buses')
              .select('*')
              .order('created_at', { ascending: false });
            if (data) setBuses(data);
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'feedback' },
          async () => {
            const { data } = await supabase
              .from('feedback')
              .select('*, passenger:profiles(*), trip:trips(*, bus:buses(*))')
              .order('id', { ascending: false })
              .limit(10);
            if (data) setFeedbackList(data);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadDashboardData]);

  // Derived KPI metrics computed strictly from Supabase data
  const metrics = useMemo(() => {
    const totalBuses = buses.length;
    const activeBuses = buses.filter((b) => b.is_active !== false).length;
    const operationalPercent = totalBuses > 0 ? Math.round((activeBuses / totalBuses) * 100) : 100;

    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter((d) => d.is_active !== false).length;

    const totalRoutes = routes.length;
    const activeCorridors = routes.filter((r) => r.is_active !== false).length;

    const liveTrips = trips.filter((t) =>
      ['in_progress', 'active', 'ACTIVE', 'IN_PROGRESS'].includes(t.status)
    ).length;

    const totalRuns = trips.length;

    return {
      activeFleetCount: activeBuses,
      totalFleetCount: totalBuses,
      operationalPercent,
      activeDriversCount: activeDrivers || totalDrivers,
      activeCorridorsCount: activeCorridors || totalRoutes,
      liveTripsCount: liveTrips,
      totalRunsCount: totalRuns,
      networkReliability: totalBuses > 0 ? `${operationalPercent}%` : '100%',
    };
  }, [buses, drivers, routes, trips]);

  // Compute live pinned units for the geospatial grid from genuine Supabase bus_locations & active trips
  const pinnedUnits = useMemo(() => {
    if (!activeLocations || activeLocations.length === 0) {
      return [];
    }

    // Determine coordinate bounding box from actual recorded GPS pings to scale accurately to map canvas
    const lats = activeLocations.map((l) => l.latitude).filter((n) => typeof n === 'number' && !isNaN(n));
    const lngs = activeLocations.map((l) => l.longitude).filter((n) => typeof n === 'number' && !isNaN(n));

    const minLat = lats.length > 0 ? Math.min(...lats) : 0;
    const maxLat = lats.length > 0 ? Math.max(...lats) : 0;
    const minLng = lngs.length > 0 ? Math.min(...lngs) : 0;
    const maxLng = lngs.length > 0 ? Math.max(...lngs) : 0;

    const latSpan = Math.max(maxLat - minLat, 0.001);
    const lngSpan = Math.max(maxLng - minLng, 0.001);

    return activeLocations.map((loc, idx) => {
      // Find matching trip and bus details
      const matchedTrip = trips.find((t) => t.id === loc.trip_id);
      const matchedBus = matchedTrip?.bus || buses.find((b) => b.id === matchedTrip?.bus_id);

      // Safe coordinate projection to 2D percentage visual grid [15%, 85%]
      let xPercent = 50;
      let yPercent = 50;

      if (lats.length > 1 && lngs.length > 1) {
        xPercent = 15 + ((loc.longitude - minLng) / lngSpan) * 70;
        yPercent = 85 - ((loc.latitude - minLat) / latSpan) * 70;
      } else {
        // Deterministic spread based on unit index if single ping
        xPercent = 25 + ((idx * 28) % 55);
        yPercent = 30 + ((idx * 24) % 45);
      }

      const busIdentifier = matchedBus?.bus_number || loc.bus_id || loc.trip_id?.slice(0, 4) || `U${idx + 1}`;

      return {
        id: busIdentifier,
        rawId: loc.id,
        tripId: loc.trip_id,
        busNumber: busIdentifier,
        status: loc.speed_kph > 0 ? 'ON_TIME' : 'STANDBY',
        speed: loc.speed_kph || 0,
        mapCoords: {
          x: Math.max(10, Math.min(90, Math.round(xPercent))),
          y: Math.max(15, Math.min(85, Math.round(yPercent))),
        },
      };
    });
  }, [activeLocations, trips, buses]);

  const handleDismiss = async (id) => {
    try {
      await supabase.from('feedback').delete().eq('id', id);
      setFeedbackList((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.warn('Error deleting feedback ticket:', err);
      setFeedbackList((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!respondingTo) return;
    setIsSubmittingResponse(true);

    try {
      // Mark feedback as RESOLVED in Supabase
      await supabase
        .from('feedback')
        .update({ status: 'RESOLVED' })
        .eq('id', respondingTo.id);

      setFeedbackList((prev) =>
        prev.map((f) => (f.id === respondingTo.id ? { ...f, status: 'RESOLVED' } : f))
      );
      alert(`Dispatch response recorded for Ticket #${respondingTo.id}!`);
      setRespondingTo(null);
    } catch (err) {
      console.warn('Error resolving feedback ticket:', err);
      setRespondingTo(null);
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* KPI Bento Telemetry Grid (6 Metrics) */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Active Fleet */}
        <div className="bg-surface-container p-4 rounded-2xl flex flex-col justify-between border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Active Fleet</span>
            <span className="w-7 h-7 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">directions_bus</span>
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-on-surface">{metrics.activeFleetCount}</span>
              <span className="text-xs text-on-surface-variant">/ {metrics.totalFleetCount}</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${metrics.totalFleetCount > 0 ? 'bg-tertiary' : 'bg-outline'}`}></span>
              <span className="text-[11px] text-tertiary font-semibold">
                {metrics.operationalPercent}% Operational
              </span>
            </div>
          </div>
        </div>

        {/* Verified Drivers */}
        <div className="bg-surface-container p-4 rounded-2xl flex flex-col justify-between border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Shift Drivers</span>
            <span className="w-7 h-7 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-on-surface">{metrics.activeDriversCount}</span>
            <p className="text-[11px] text-on-surface-variant mt-1">Verified on Console</p>
          </div>
        </div>

        {/* Active Corridors */}
        <div className="bg-surface-container p-4 rounded-2xl flex flex-col justify-between border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Corridors</span>
            <span className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">alt_route</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-on-surface">{metrics.activeCorridorsCount}</span>
            <p className="text-[11px] text-on-surface-variant mt-1">Core Lines Active</p>
          </div>
        </div>

        {/* Live Trips */}
        <div className="bg-surface-container p-4 rounded-2xl flex flex-col justify-between border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Live Trips</span>
            <span className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">navigation</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-on-surface">{metrics.liveTripsCount}</span>
            <p className="text-[11px] text-tertiary font-semibold mt-1">
              {metrics.liveTripsCount > 0 ? 'In Transit Now' : 'Standby / Scheduled'}
            </p>
          </div>
        </div>

        {/* Runs Today */}
        <div className="bg-surface-container p-4 rounded-2xl flex flex-col justify-between border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Recorded Runs</span>
            <span className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">history</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-on-surface">{metrics.totalRunsCount}</span>
            <p className="text-[11px] text-tertiary font-semibold mt-1">Total Trips in DB</p>
          </div>
        </div>

        {/* On-Time Rate */}
        <div className="bg-surface-container p-4 rounded-2xl flex flex-col justify-between border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Network Reliability</span>
            <span className="w-7 h-7 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-tertiary">{metrics.networkReliability}</span>
            <p className="text-[11px] text-on-surface-variant mt-1">Target: &gt; 90.0%</p>
          </div>
        </div>
      </section>

      {/* Main Grid: Interactive Positioning Map + Telemetry List */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Panel (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container rounded-2xl border border-surface-container-high overflow-hidden shadow-lg flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-surface-container-high">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <h2 className="font-bold text-base text-on-surface">Live Fleet Positioning (Geospatial Grid)</h2>
            </div>
            <span className="text-xs bg-surface-container-high px-2.5 py-0.5 rounded-full text-on-surface-variant font-mono">
              {pinnedUnits.length} Units Pinned
            </span>
          </div>

          {/* Interactive Map Visual */}
          <div className="relative w-full h-72 sm:h-80 bg-surface-container-lowest map-grid-pattern overflow-hidden">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M 30 50 Q 150 180 320 120 T 560 210" fill="none" stroke="#2c2834" strokeWidth="12" />
              <path d="M 30 50 Q 150 180 320 120 T 560 210" fill="none" stroke="#8b5cf6" strokeWidth="3" strokeDasharray="5,5" opacity="0.8" />
              <path d="M 120 20 L 140 320" fill="none" stroke="#211e2a" strokeWidth="8" />
              <path d="M 400 30 C 380 180 410 260 440 320" fill="none" stroke="#211e2a" strokeWidth="10" />
            </svg>

            {/* Empty state when no live units are currently pinging */}
            {pinnedUnits.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-surface-container-lowest/70 backdrop-blur-[2px]">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high/80 border border-primary/30 flex items-center justify-center text-primary mb-3 shadow-lg">
                  <span className="material-symbols-outlined text-[26px] animate-pulse">radar</span>
                </div>
                <h3 className="text-sm font-bold text-on-surface">No Active GPS Telemetry Pings Recorded</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mt-1 leading-relaxed">
                  When drivers launch an active trip in the Driver Cockpit and enable GPS sharing, real-time vehicle markers will dynamically pin across this corridor grid.
                </p>
              </div>
            )}

            {/* Interactive Bus Markers on Map - Safely guarded against undefined coordinates */}
            {pinnedUnits.map((bus) => {
              const isSelected = bus.id === selectedBusId;
              const xPos = bus?.mapCoords?.x ?? 50;
              const yPos = bus?.mapCoords?.y ?? 50;

              return (
                <button
                  key={bus.id}
                  onClick={() => setSelectedBusId(bus.id)}
                  className={`absolute flex flex-col items-center transition-transform hover:scale-125 z-10 ${
                    isSelected ? 'scale-125 z-20' : ''
                  }`}
                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                >
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold shadow-lg flex items-center gap-1 ${
                      bus.status === 'ON_TIME'
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-highest text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[12px]">directions_bus</span>
                    <span>{bus.id}</span>
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full shadow-md mt-0.5 ${
                      bus.status === 'ON_TIME' ? 'bg-tertiary' : 'bg-amber-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-surface-container-high/60 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
            <span>
              Selected Unit:{' '}
              <strong className="text-primary font-bold">
                {selectedBusId || (buses[0]?.bus_number || 'None selected')}
              </strong>
            </span>
            <Link to={`/admin/live-monitoring`} className="text-primary font-semibold hover:underline">
              Open Full Monitoring Wall →
            </Link>
          </div>
        </div>

        {/* Fleet List & Quick Action Center (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Quick Fleet Telemetry Stream */}
          <div className="bg-surface-container rounded-2xl border border-surface-container-high p-4 flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-outline">
                Fleet Vehicle Registry
              </h3>
              <span className="text-[11px] text-on-surface-variant font-mono">{buses.length} Units</span>
            </div>

            {buses.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface-container-low border border-surface-container text-center flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-outline text-[32px] mb-2">directions_bus</span>
                <p className="text-xs font-semibold text-on-surface">No Vehicles Registered</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Deploy buses into Supabase using the quick action button below.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {buses.map((b) => {
                  const busCode = b.bus_number || b.id.slice(0, 6);
                  const isSelected = selectedBusId === busCode;
                  const isBusActive = b.is_active !== false;

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBusId(busCode)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-surface-container-highest border-primary/50'
                          : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary font-mono text-xs font-bold">
                            #{busCode}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-on-surface leading-tight">
                              {b.model || 'Standard CityBus'}
                            </p>
                            <p className="text-[10px] text-on-surface-variant">
                              Capacity: {b.capacity || 42} seats
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            status={isBusActive ? 'ON_TIME' : 'MAINTENANCE'}
                            text={isBusActive ? 'In Service' : 'Maintenance'}
                            size="sm"
                          />
                          <p className="text-[10px] font-mono text-on-surface-variant mt-0.5">
                            Status: {isBusActive ? 'Active' : 'Depot'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Admin Actions Bento */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-outline px-1">
              Quick Admin Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/admin/buses"
                className="bg-surface-container hover:bg-surface-container-high p-3.5 rounded-xl border border-surface-container-high flex items-center gap-2.5 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">add_circle</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate">Add New Bus</p>
                  <p className="text-[10px] text-on-surface-variant truncate">Fleet registry</p>
                </div>
              </Link>

              <Link
                to="/admin/drivers"
                className="bg-surface-container hover:bg-surface-container-high p-3.5 rounded-xl border border-surface-container-high flex items-center gap-2.5 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate">Assign Driver</p>
                  <p className="text-[10px] text-on-surface-variant truncate">Shift rosters</p>
                </div>
              </Link>

              <Link
                to="/admin/routes"
                className="bg-surface-container hover:bg-surface-container-high p-3.5 rounded-xl border border-surface-container-high flex items-center gap-2.5 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">alt_route</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate">Manage Routes</p>
                  <p className="text-[10px] text-on-surface-variant truncate">Stops &amp; timings</p>
                </div>
              </Link>

              <Link
                to="/admin/feedback"
                className="bg-surface-container hover:bg-surface-container-high p-3.5 rounded-xl border border-surface-container-high flex items-center gap-2.5 transition group"
              >
                <div className="w-9 h-9 rounded-xl bg-error-container/20 text-error flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">mark_chat_unread</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface truncate">Complaints</p>
                  <p className="text-[10px] text-on-surface-variant truncate">Review reports</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Field Feedback & Alerts Live Stream */}
      <section className="bg-surface-container rounded-2xl border border-surface-container-high p-5 shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">mark_chat_unread</span>
            <h3 className="font-bold text-base text-on-surface">Field Feedback &amp; Alerts Live Stream</h3>
          </div>
          <span className="text-xs text-primary font-mono font-semibold">Live Intake</span>
        </div>

        {feedbackList.length === 0 ? (
          <div className="p-8 rounded-xl bg-surface-container-low border border-surface-container text-center flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-outline text-[32px] mb-2">chat_bubble_outline</span>
            <p className="text-xs font-semibold text-on-surface">No Passenger Feedback Tickets</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Incoming commuter ratings and maintenance reports from the Passenger portal will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackList.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-on-surface">
                      {item.category || 'Transit Experience'}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        item.status === 'RESOLVED'
                          ? 'bg-tertiary-container/30 text-tertiary'
                          : 'bg-primary-container/20 text-primary'
                      }`}
                    >
                      {item.status || 'OPEN'}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 italic">
                    "{item.message || item.comment || 'Passenger commuter feedback report.'}"
                  </p>
                  <span className="text-[10px] text-outline mt-2 block">
                    Rating: ★ {item.rating || 5} • Passenger: {item.passenger?.full_name || 'Rider'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-surface-container">
                  <button
                    onClick={() => setRespondingTo(item)}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center gap-1 hover:bg-primary/90 transition"
                  >
                    <span className="material-symbols-outlined text-[14px]">reply</span>
                    <span>Respond</span>
                  </button>
                  <button
                    onClick={() => handleDismiss(item.id)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-xs text-outline hover:text-on-surface transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Response Modal */}
      {respondingTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-surface-container-high rounded-2xl border border-surface-container-highest p-5 shadow-2xl">
            <h4 className="font-bold text-base text-on-surface mb-2">
              Dispatch Response to Ticket #{respondingTo.id}
            </h4>
            <p className="text-xs text-on-surface-variant mb-4">
              Category: <strong>{respondingTo.category || 'General'}</strong> (Rating: ★ {respondingTo.rating || 5})
            </p>

            <form onSubmit={handleSendResponse} className="flex flex-col gap-3">
              <textarea
                rows={3}
                required
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="w-full bg-surface-container-lowest text-xs rounded-xl p-3 border border-outline-variant/40 focus:outline-none focus:border-primary text-on-surface"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  disabled={isSubmittingResponse}
                  onClick={() => setRespondingTo(null)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResponse}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary/90"
                >
                  {isSubmittingResponse ? 'Saving...' : 'Dispatch Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
