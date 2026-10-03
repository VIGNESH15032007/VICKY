import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import Modal from '../../components/common/Modal';

export default function RouteManagementPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Route Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Stop Management Modal & state
  const [isStopsModalOpen, setIsStopsModalOpen] = useState(false);
  const [routeStops, setRouteStops] = useState([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [stopFormData, setStopFormData] = useState({
    stopName: '',
    stopOrder: 1,
    latitude: '',
    longitude: '',
  });

  // Route Form State
  const [routeFormData, setRouteFormData] = useState({
    routeNumber: '',
    name: '',
    description: '',
    isActive: true,
  });

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch routes from Supabase
  const fetchRoutes = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRoutes(data);
      }
    } catch (err) {
      console.warn('Error fetching routes from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('route-management-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'routes' },
          () => {
            fetchRoutes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchRoutes]);

  // Handle Add Route (Create)
  const handleAddRoute = async (e) => {
    e.preventDefault();
    if (!routeFormData.routeNumber) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('routes')
        .insert({
          route_number: routeFormData.routeNumber.trim().toUpperCase(),
          name: routeFormData.name.trim() || `Line ${routeFormData.routeNumber}`,
          description: routeFormData.description.trim() || null,
          is_active: routeFormData.isActive,
        })
        .select()
        .single();

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data) {
        setRoutes([data, ...routes]);
      }
      setIsAddModalOpen(false);
      setRouteFormData({
        routeNumber: '',
        name: '',
        description: '',
        isActive: true,
      });
    } catch (err) {
      setFormError(err.message || 'Failed to create route');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Route Modal
  const openEditRouteModal = (route) => {
    setSelectedRoute(route);
    setRouteFormData({
      routeNumber: route.route_number || '',
      name: route.name || '',
      description: route.description || '',
      isActive: route.is_active !== false,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Handle Update Route
  const handleUpdateRoute = async (e) => {
    e.preventDefault();
    if (!selectedRoute) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('routes')
        .update({
          route_number: routeFormData.routeNumber.trim().toUpperCase(),
          name: routeFormData.name.trim(),
          description: routeFormData.description.trim() || null,
          is_active: routeFormData.isActive,
        })
        .eq('id', selectedRoute.id)
        .select()
        .single();

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data) {
        setRoutes(routes.map((r) => (r.id === selectedRoute.id ? data : r)));
      }
      setIsEditModalOpen(false);
      setSelectedRoute(null);
    } catch (err) {
      setFormError(err.message || 'Failed to update route');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Route
  const handleDeleteRoute = async () => {
    if (!selectedRoute) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', selectedRoute.id);

      if (error) {
        alert(`Error deleting route: ${error.message}`);
        return;
      }

      setRoutes(routes.filter((r) => r.id !== selectedRoute.id));
      setIsDeleteModalOpen(false);
      setSelectedRoute(null);
    } catch (err) {
      alert(`Error deleting route: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Route Active
  const toggleRouteStatus = async (route) => {
    const nextStatus = route.is_active === false;
    try {
      const { error } = await supabase
        .from('routes')
        .update({ is_active: nextStatus })
        .eq('id', route.id);

      if (!error) {
        setRoutes(
          routes.map((r) => (r.id === route.id ? { ...r, is_active: nextStatus } : r))
        );
      }
    } catch (err) {
      console.warn('Error toggling route status:', err);
    }
  };

  // Open Route Stops Management Modal
  const openStopsModal = async (route) => {
    setSelectedRoute(route);
    setIsStopsModalOpen(true);
    setLoadingStops(true);
    setEditingStop(null);
    setStopFormData({
      stopName: '',
      stopOrder: 1,
      latitude: '',
      longitude: '',
    });

    try {
      const { data, error } = await supabase
        .from('route_stops')
        .select('*')
        .eq('route_id', route.id)
        .order('stop_order', { ascending: true });

      if (!error && data) {
        setRouteStops(data);
        setStopFormData((prev) => ({
          ...prev,
          stopOrder: data.length + 1,
        }));
      }
    } catch (err) {
      console.warn('Error fetching route stops:', err);
    } finally {
      setLoadingStops(false);
    }
  };

  // Handle Add or Edit Stop
  const handleSaveStop = async (e) => {
    e.preventDefault();
    if (!selectedRoute || !stopFormData.stopName) return;

    try {
      const payload = {
        route_id: selectedRoute.id,
        stop_name: stopFormData.stopName.trim(),
        stop_order: Number(stopFormData.stopOrder) || 1,
        latitude: stopFormData.latitude ? Number(stopFormData.latitude) : null,
        longitude: stopFormData.longitude ? Number(stopFormData.longitude) : null,
      };

      if (editingStop) {
        // Update existing stop
        const { data, error } = await supabase
          .from('route_stops')
          .update(payload)
          .eq('id', editingStop.id)
          .select()
          .single();

        if (error) {
          alert(`Error updating stop: ${error.message}`);
          return;
        }

        setRouteStops(
          routeStops
            .map((s) => (s.id === editingStop.id ? data : s))
            .sort((a, b) => a.stop_order - b.stop_order)
        );
        setEditingStop(null);
      } else {
        // Add new stop
        const { data, error } = await supabase
          .from('route_stops')
          .insert(payload)
          .select()
          .single();

        if (error) {
          alert(`Error creating stop: ${error.message}`);
          return;
        }

        const updated = [...routeStops, data].sort((a, b) => a.stop_order - b.stop_order);
        setRouteStops(updated);
      }

      setStopFormData({
        stopName: '',
        stopOrder: routeStops.length + 2,
        latitude: '',
        longitude: '',
      });
    } catch (err) {
      alert(`Error saving stop: ${err.message}`);
    }
  };

  // Handle Delete Stop
  const handleDeleteStop = async (stopId) => {
    try {
      const { error } = await supabase
        .from('route_stops')
        .delete()
        .eq('id', stopId);

      if (error) {
        alert(`Error deleting stop: ${error.message}`);
        return;
      }

      setRouteStops(routeStops.filter((s) => s.id !== stopId));
    } catch (err) {
      alert(`Error deleting stop: ${err.message}`);
    }
  };

  const filtered = routes.filter((r) => {
    const q = search.toLowerCase();
    const numMatch = r.route_number?.toLowerCase().includes(q);
    const nameMatch = r.name?.toLowerCase().includes(q);
    const descMatch = r.description?.toLowerCase().includes(q);
    return numMatch || nameMatch || descMatch;
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Corridor Route Management
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Configure transit lines, stop sequences, and municipal headway schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search route or line..."
              className="w-full sm:w-64 bg-surface-container-high text-on-surface text-xs rounded-xl pl-9 pr-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={() => {
              setRouteFormData({
                routeNumber: '',
                name: '',
                description: '',
                isActive: true,
              });
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_road</span>
            <span>Create Route</span>
          </button>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 rounded-2xl bg-surface-container-low border border-surface-container text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[42px] text-outline mb-2 block">
              alt_route
            </span>
            <h3 className="font-bold text-base text-on-surface">No Routes Registered</h3>
            <p className="text-xs text-outline mt-1 max-w-sm mx-auto">
              {search
                ? 'No corridors match your search term.'
                : 'No transit corridors exist in the database yet. Click "Create Route" above to register your first line.'}
            </p>
          </div>
        ) : (
          filtered.map((route) => {
            const isActive = route.is_active !== false;

            return (
              <div
                key={route.id}
                className="p-5 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary font-extrabold text-base flex flex-col items-center justify-center shadow-md">
                        <span>{route.route_number}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface text-base">{route.name}</h3>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {route.description || 'Municipal Scheduled Service'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-tertiary-container/30 text-tertiary'
                          : 'bg-surface-container-lowest text-outline'
                      }`}
                    >
                      {isActive ? 'In Service' : 'Suspended'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-outline font-mono pt-3 border-t border-surface-container">
                    <span>Route Code: #{route.route_number}</span>
                    <span>Created: {route.created_at ? new Date(route.created_at).toLocaleDateString() : 'Active'}</span>
                  </div>
                </div>

                {/* Route Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-surface-container gap-2 flex-wrap">
                  <button
                    onClick={() => openStopsModal(route)}
                    className="px-3 py-1.5 rounded-xl bg-primary/20 text-primary text-xs font-bold flex items-center gap-1.5 hover:bg-primary/30 transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                    <span>Manage Stops</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleRouteStatus(route)}
                      className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-bright text-xs text-on-surface-variant hover:text-on-surface transition"
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => openEditRouteModal(route)}
                      className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition"
                      title="Edit Route"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoute(route);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-error-container/30 text-on-surface-variant hover:text-error transition"
                      title="Delete Route"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add Route */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Corridor Line"
      >
        <form onSubmit={handleAddRoute} className="flex flex-col gap-3.5">
          {formError && (
            <div className="p-2.5 rounded-xl bg-error-container/20 border border-error/40 text-error text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Route Code / Line #</label>
              <input
                type="text"
                required
                placeholder="e.g. 42B or R104"
                value={routeFormData.routeNumber}
                onChange={(e) => setRouteFormData({ ...routeFormData, routeNumber: e.target.value.toUpperCase() })}
                className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Corridor Name</label>
              <input
                type="text"
                required
                placeholder="e.g. North Medical Express"
                value={routeFormData.name}
                onChange={(e) => setRouteFormData({ ...routeFormData, name: e.target.value })}
                className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Description / Terminals</label>
            <textarea
              rows={2}
              placeholder="e.g. Central Station to West Ridge Terminal via City Hospital"
              value={routeFormData.description}
              onChange={(e) => setRouteFormData({ ...routeFormData, description: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAddRouteActive"
              checked={routeFormData.isActive}
              onChange={(e) => setRouteFormData({ ...routeFormData, isActive: e.target.checked })}
              className="rounded accent-primary"
            />
            <label htmlFor="isAddRouteActive" className="text-xs text-on-surface cursor-pointer">
              Active corridor in transit network
            </label>
          </div>

          <div className="flex items-center gap-2 pt-3 justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary/90"
            >
              {isSubmitting ? 'Creating...' : 'Create Corridor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Route */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Route ${selectedRoute?.route_number || ''}`}
      >
        <form onSubmit={handleUpdateRoute} className="flex flex-col gap-3.5">
          {formError && (
            <div className="p-2.5 rounded-xl bg-error-container/20 border border-error/40 text-error text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Route Code / Line #</label>
              <input
                type="text"
                required
                value={routeFormData.routeNumber}
                onChange={(e) => setRouteFormData({ ...routeFormData, routeNumber: e.target.value.toUpperCase() })}
                className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Corridor Name</label>
              <input
                type="text"
                required
                value={routeFormData.name}
                onChange={(e) => setRouteFormData({ ...routeFormData, name: e.target.value })}
                className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Description / Terminals</label>
            <textarea
              rows={2}
              value={routeFormData.description}
              onChange={(e) => setRouteFormData({ ...routeFormData, description: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isEditRouteActive"
              checked={routeFormData.isActive}
              onChange={(e) => setRouteFormData({ ...routeFormData, isActive: e.target.checked })}
              className="rounded accent-primary"
            />
            <label htmlFor="isEditRouteActive" className="text-xs text-on-surface cursor-pointer">
              Active corridor in transit network
            </label>
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

      {/* Modal: Delete Route Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Route Deletion"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Are you sure you want to permanently delete corridor line{' '}
            <strong className="text-on-surface">{selectedRoute?.route_number} - {selectedRoute?.name}</strong>?
            Any stops and trips mapped to this route will be impacted.
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
              onClick={handleDeleteRoute}
              className="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-bold shadow-md hover:bg-error/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Route'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Route Stops Management */}
      <Modal
        isOpen={isStopsModalOpen}
        onClose={() => setIsStopsModalOpen(false)}
        title={`Manage Stops: ${selectedRoute?.route_number || ''} - ${selectedRoute?.name || ''}`}
      >
        <div className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* Add / Edit Stop Form */}
          <form onSubmit={handleSaveStop} className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container flex flex-col gap-3">
            <span className="text-xs font-bold text-primary">
              {editingStop ? `Editing Stop #${editingStop.stop_order}` : 'Add New Route Stop'}
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-on-surface">Stop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Hospital Plaza"
                  value={stopFormData.stopName}
                  onChange={(e) => setStopFormData({ ...stopFormData, stopName: e.target.value })}
                  className="bg-surface-container-high text-xs rounded-lg p-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-on-surface">Sequence #</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stopFormData.stopOrder}
                  onChange={(e) => setStopFormData({ ...stopFormData, stopOrder: e.target.value })}
                  className="bg-surface-container-high text-xs rounded-lg p-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-on-surface">Latitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 40.7128"
                  value={stopFormData.latitude}
                  onChange={(e) => setStopFormData({ ...stopFormData, latitude: e.target.value })}
                  className="bg-surface-container-high text-xs rounded-lg p-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-on-surface">Longitude (Optional)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. -74.0060"
                  value={stopFormData.longitude}
                  onChange={(e) => setStopFormData({ ...stopFormData, longitude: e.target.value })}
                  className="bg-surface-container-high text-xs rounded-lg p-2 border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end pt-1">
              {editingStop && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStop(null);
                    setStopFormData({
                      stopName: '',
                      stopOrder: routeStops.length + 1,
                      latitude: '',
                      longitude: '',
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-xs text-on-surface"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary/90"
              >
                {editingStop ? 'Update Stop' : 'Add Stop'}
              </button>
            </div>
          </form>

          {/* Stops Sequence List */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-outline px-1">
              Route Stop Sequence ({routeStops.length} Stops)
            </span>

            {loadingStops ? (
              <div className="py-6 text-center text-xs text-on-surface-variant font-mono animate-pulse">
                Loading stop waypoints from Supabase...
              </div>
            ) : routeStops.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container text-center text-xs text-outline">
                No stops configured for this corridor line yet. Use the form above to add route stops.
              </div>
            ) : (
              <div className="space-y-2">
                {routeStops.map((stop) => (
                  <div
                    key={stop.id}
                    className="p-3 rounded-xl bg-surface-container border border-surface-container-highest flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold font-mono text-xs flex items-center justify-center">
                        {stop.stop_order}
                      </span>
                      <div>
                        <span className="font-semibold text-xs text-on-surface block">{stop.stop_name}</span>
                        {stop.latitude && stop.longitude && (
                          <span className="text-[10px] font-mono text-outline">
                            {Number(stop.latitude).toFixed(4)}, {Number(stop.longitude).toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingStop(stop);
                          setStopFormData({
                            stopName: stop.stop_name,
                            stopOrder: stop.stop_order,
                            latitude: stop.latitude != null ? String(stop.latitude) : '',
                            longitude: stop.longitude != null ? String(stop.longitude) : '',
                          });
                        }}
                        className="p-1 rounded-md hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                        title="Edit Stop"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteStop(stop.id)}
                        className="p-1 rounded-md hover:bg-error-container/30 text-on-surface-variant hover:text-error"
                        title="Delete Stop"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
