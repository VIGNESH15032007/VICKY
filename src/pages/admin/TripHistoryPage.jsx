import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import Modal from '../../components/common/Modal';

export default function TripHistoryPage() {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Form state
  const [tripFormData, setTripFormData] = useState({
    busId: '',
    routeId: '',
    driverId: '',
    status: 'in_progress',
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load trips, buses, routes, drivers from Supabase
  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const [tripsRes, busesRes, routesRes, driversRes] = await Promise.all([
        supabase
          .from('trips')
          .select('*, bus:buses(*), route:routes(*), driver:drivers(*, profile:profiles(*))')
          .order('created_at', { ascending: false }),
        supabase.from('buses').select('*').order('bus_number', { ascending: true }),
        supabase.from('routes').select('*').order('route_number', { ascending: true }),
        supabase.from('drivers').select('*, profile:profiles(*)').order('id', { ascending: true }),
      ]);

      if (!tripsRes.error && tripsRes.data) {
        setTrips(tripsRes.data);
      }
      if (!busesRes.error && busesRes.data) {
        setBuses(busesRes.data);
      }
      if (!routesRes.error && routesRes.data) {
        setRoutes(routesRes.data);
      }
      if (!driversRes.error && driversRes.data) {
        setDrivers(driversRes.data);
      }
    } catch (err) {
      console.warn('Error loading trips data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('trips-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'trips' },
          () => {
            loadData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadData]);

  // Create Trip
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!tripFormData.busId) {
      setFormError('Please select a vehicle to assign to this trip.');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        bus_id: tripFormData.busId,
        status: tripFormData.status,
      };
      if (tripFormData.routeId) payload.route_id = tripFormData.routeId;
      if (tripFormData.driverId) payload.driver_id = tripFormData.driverId;

      const { data, error } = await supabase
        .from('trips')
        .insert(payload)
        .select('*, bus:buses(*), route:routes(*), driver:drivers(*, profile:profiles(*))')
        .single();

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data) {
        setTrips([data, ...trips]);
      }
      setIsCreateModalOpen(false);
      setTripFormData({
        busId: '',
        routeId: '',
        driverId: '',
        status: 'in_progress',
      });
    } catch (err) {
      setFormError(err.message || 'Failed to dispatch trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (trip) => {
    setSelectedTrip(trip);
    setTripFormData({
      busId: trip.bus_id || '',
      routeId: trip.route_id || '',
      driverId: trip.driver_id || '',
      status: trip.status || 'in_progress',
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Update Trip
  const handleUpdateTrip = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        status: tripFormData.status,
      };
      if (tripFormData.busId) payload.bus_id = tripFormData.busId;
      if (tripFormData.routeId) payload.route_id = tripFormData.routeId;
      if (tripFormData.driverId) payload.driver_id = tripFormData.driverId;

      const { data, error } = await supabase
        .from('trips')
        .update(payload)
        .eq('id', selectedTrip.id)
        .select('*, bus:buses(*), route:routes(*), driver:drivers(*, profile:profiles(*))')
        .single();

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data) {
        setTrips(trips.map((t) => (t.id === selectedTrip.id ? data : t)));
      }
      setIsEditModalOpen(false);
      setSelectedTrip(null);
    } catch (err) {
      setFormError(err.message || 'Failed to update trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Trip
  const handleDeleteTrip = async () => {
    if (!selectedTrip) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', selectedTrip.id);

      if (error) {
        alert(`Error deleting trip: ${error.message}`);
        return;
      }

      setTrips(trips.filter((t) => t.id !== selectedTrip.id));
      setIsDeleteModalOpen(false);
      setSelectedTrip(null);
    } catch (err) {
      alert(`Error deleting trip: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCSV = () => {
    if (trips.length === 0) {
      alert('No trips recorded to export.');
      return;
    }
    const headers = ['Trip ID', 'Bus Number', 'Route Name', 'Driver', 'Status', 'Date'];
    const rows = trips.map((t) => [
      t.id,
      t.bus?.bus_number || t.bus_id || '',
      t.route?.name || t.route?.route_number || '',
      t.driver?.profile?.full_name || t.driver_id || '',
      t.status || '',
      t.created_at || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trips_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = trips.filter((t) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && ['in_progress', 'active', 'ACTIVE'].includes(t.status)) ||
      (statusFilter === 'COMPLETED' && t.status === 'completed') ||
      (statusFilter === 'STANDBY' && t.status === 'standby');

    const q = search.toLowerCase();
    const busMatch = t.bus?.bus_number?.toLowerCase().includes(q) || t.bus_id?.toLowerCase().includes(q);
    const routeMatch = t.route?.name?.toLowerCase().includes(q) || t.route?.route_number?.toLowerCase().includes(q);
    const driverMatch = t.driver?.profile?.full_name?.toLowerCase().includes(q);
    const idMatch = t.id?.toLowerCase().includes(q);

    return matchesStatus && (busMatch || routeMatch || driverMatch || idMatch);
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Municipal Trips Management
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Dispatch, monitor live runs, and view completed transit logs in Supabase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-semibold text-primary border border-outline-variant/30 flex items-center gap-1.5 transition"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setTripFormData({
                busId: buses[0]?.id || '',
                routeId: routes[0]?.id || '',
                driverId: drivers[0]?.id || '',
                status: 'in_progress',
              });
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Dispatch Trip</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-surface-container-high border border-surface-container-highest flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'ACTIVE', 'STANDBY', 'COMPLETED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === s
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {s === 'ALL' ? 'All Trips' : s}
            </button>
          ))}
        </div>

        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bus #, route, or driver..."
            className="w-full sm:w-64 bg-surface-container-lowest text-on-surface text-xs rounded-xl pl-9 pr-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="rounded-2xl bg-surface-container-low border border-surface-container overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container border-b border-surface-container-highest text-outline uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Trip ID</th>
                <th className="py-3 px-4">Bus Vehicle</th>
                <th className="py-3 px-4">Corridor Route</th>
                <th className="py-3 px-4">Assigned Operator</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Logged At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">
                      navigation
                    </span>
                    <p className="font-semibold text-sm text-on-surface">No Trips Found</p>
                    <p className="text-xs text-outline mt-1">
                      {search
                        ? 'No trips match your search filters.'
                        : 'No transit runs registered in the database yet. Click "Dispatch Trip" to start one.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((trip) => {
                  const busNumber = trip.bus?.bus_number || trip.bus_id?.slice(0, 6) || '—';
                  const routeName = trip.route?.name || trip.route?.route_number || 'Unassigned';
                  const driverName = trip.driver?.profile?.full_name || 'Assigned on Shift';
                  const isActive = ['in_progress', 'active', 'ACTIVE'].includes(trip.status);

                  return (
                    <tr key={trip.id} className="hover:bg-surface-container/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-outline">
                        #{trip.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-on-surface block">Bus #{busNumber}</span>
                        <span className="text-[10px] text-outline">{trip.bus?.model || 'CityBus'}</span>
                      </td>
                      <td className="py-3 px-4 text-on-surface">
                        <span className="font-medium block">{routeName}</span>
                        {trip.route?.route_number && (
                          <span className="text-[10px] text-outline font-mono">Line {trip.route.route_number}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant font-medium">
                        {driverName}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-primary-container text-on-primary font-mono'
                              : trip.status === 'completed'
                              ? 'bg-tertiary-container/30 text-tertiary'
                              : 'bg-surface-container-highest text-outline'
                          }`}
                        >
                          {trip.status?.replace('_', ' ').toUpperCase() || 'STANDBY'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-outline text-[11px]">
                        {trip.created_at ? new Date(trip.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(trip)}
                          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition"
                          title="Edit Trip"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTrip(trip);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1 rounded-lg hover:bg-error-container/30 text-on-surface-variant hover:text-error transition"
                          title="Delete Trip"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Dispatch New Trip */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Dispatch New Municipal Trip"
      >
        <form onSubmit={handleCreateTrip} className="flex flex-col gap-3.5">
          {formError && (
            <div className="p-2.5 rounded-xl bg-error-container/20 border border-error/40 text-error text-xs">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Assign Bus Vehicle</label>
            <select
              required
              value={tripFormData.busId}
              onChange={(e) => setTripFormData({ ...tripFormData, busId: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">-- Select a Bus Vehicle --</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  Bus #{b.bus_number || b.id.slice(0, 6)} ({b.model || 'CityBus'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Assign Corridor Route</label>
            <select
              value={tripFormData.routeId}
              onChange={(e) => setTripFormData({ ...tripFormData, routeId: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">-- Select Corridor Route (Optional) --</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  Line {r.route_number} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Assign Driver</label>
            <select
              value={tripFormData.driverId}
              onChange={(e) => setTripFormData({ ...tripFormData, driverId: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">-- Select Driver (Optional) --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.profile?.full_name || 'Operator'} (License: {d.license_number || 'CDL'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Trip Initial Status</label>
            <select
              value={tripFormData.status}
              onChange={(e) => setTripFormData({ ...tripFormData, status: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="in_progress">In Progress (Active Telemetry)</option>
              <option value="standby">Standby (Scheduled at Depot)</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-3 justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary/90"
            >
              {isSubmitting ? 'Dispatching...' : 'Dispatch Trip'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Trip */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Trip #${selectedTrip?.id?.slice(0, 8) || ''}`}
      >
        <form onSubmit={handleUpdateTrip} className="flex flex-col gap-3.5">
          {formError && (
            <div className="p-2.5 rounded-xl bg-error-container/20 border border-error/40 text-error text-xs">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Vehicle</label>
            <select
              value={tripFormData.busId}
              onChange={(e) => setTripFormData({ ...tripFormData, busId: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  Bus #{b.bus_number || b.id.slice(0, 6)} ({b.model || 'CityBus'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Route</label>
            <select
              value={tripFormData.routeId}
              onChange={(e) => setTripFormData({ ...tripFormData, routeId: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">-- No Route --</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  Line {r.route_number} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Status</label>
            <select
              value={tripFormData.status}
              onChange={(e) => setTripFormData({ ...tripFormData, status: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="in_progress">In Progress</option>
              <option value="standby">Standby</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-3 justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary/90"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Trip Deletion"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Are you sure you want to permanently delete Trip{' '}
            <strong className="text-on-surface">#{selectedTrip?.id?.slice(0, 8)}</strong> from
            the Supabase database?
          </p>

          <div className="flex items-center gap-2 justify-end pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDeleteTrip}
              className="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-bold shadow-md hover:bg-error/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Trip'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
