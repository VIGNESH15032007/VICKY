import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

export default function BusManagementPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    busNumber: '',
    model: 'Volvo Electric CityBus 12m',
    capacity: 42,
    isActive: true,
  });

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch buses from Supabase
  const fetchBuses = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setBuses(data);
      }
    } catch (err) {
      console.warn('Error fetching buses from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBuses();

    // Subscribe to realtime changes on buses
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('bus-management-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'buses' },
          () => {
            fetchBuses();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchBuses]);

  // Handle Add Bus (Create)
  const handleAddBus = async (e) => {
    e.preventDefault();
    if (!formData.busNumber) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('buses')
        .insert({
          bus_number: formData.busNumber.trim().toUpperCase(),
          model: formData.model,
          capacity: Number(formData.capacity) || 42,
          is_active: formData.isActive,
        })
        .select()
        .single();

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data) {
        setBuses([data, ...buses]);
      }
      setIsAddModalOpen(false);
      setFormData({
        busNumber: '',
        model: 'Volvo Electric CityBus 12m',
        capacity: 42,
        isActive: true,
      });
    } catch (err) {
      setFormError(err.message || 'Failed to add bus');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (bus) => {
    setSelectedBus(bus);
    setFormData({
      busNumber: bus.bus_number || '',
      model: bus.model || 'Volvo Electric CityBus 12m',
      capacity: bus.capacity || 42,
      isActive: bus.is_active !== false,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Handle Edit Bus (Update)
  const handleUpdateBus = async (e) => {
    e.preventDefault();
    if (!selectedBus) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('buses')
        .update({
          bus_number: formData.busNumber.trim().toUpperCase(),
          model: formData.model,
          capacity: Number(formData.capacity) || 42,
          is_active: formData.isActive,
        })
        .eq('id', selectedBus.id)
        .select()
        .single();

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data) {
        setBuses(buses.map((b) => (b.id === selectedBus.id ? data : b)));
      }
      setIsEditModalOpen(false);
      setSelectedBus(null);
    } catch (err) {
      setFormError(err.message || 'Failed to update bus');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (bus) => {
    setSelectedBus(bus);
    setIsDeleteModalOpen(true);
  };

  // Handle Delete Bus
  const handleDeleteBus = async () => {
    if (!selectedBus) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('buses')
        .delete()
        .eq('id', selectedBus.id);

      if (error) {
        alert(`Error deleting bus: ${error.message}`);
        return;
      }

      setBuses(buses.filter((b) => b.id !== selectedBus.id));
      setIsDeleteModalOpen(false);
      setSelectedBus(null);
    } catch (err) {
      alert(`Error deleting bus: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status (Quick action)
  const toggleBusStatus = async (bus) => {
    const nextStatus = bus.is_active === false;
    try {
      const { error } = await supabase
        .from('buses')
        .update({ is_active: nextStatus })
        .eq('id', bus.id);

      if (!error) {
        setBuses(
          buses.map((b) => (b.id === bus.id ? { ...b, is_active: nextStatus } : b))
        );
      }
    } catch (err) {
      console.warn('Error toggling bus status:', err);
    }
  };

  // Filtered list
  const filtered = buses.filter((b) => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'ACTIVE' && b.is_active !== false) ||
      (filter === 'MAINTENANCE' && b.is_active === false);

    const q = search.toLowerCase();
    const matchesSearch =
      (b.bus_number && b.bus_number.toLowerCase().includes(q)) ||
      (b.model && b.model.toLowerCase().includes(q)) ||
      b.id.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Bus Fleet Management
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Real-time Supabase vehicle registry, deployment states, and maintenance controls.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              busNumber: '',
              model: 'Volvo Electric CityBus 12m',
              capacity: 42,
              isActive: true,
            });
            setFormError(null);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-fixed-dim transition"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Deploy New Bus</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface-container-high border border-surface-container-highest">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'ACTIVE', 'MAINTENANCE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filter === f
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {f === 'ALL' ? 'All Fleet' : f === 'ACTIVE' ? 'In Service' : 'Maintenance'}
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
            placeholder="Search by bus # or model..."
            className="w-full sm:w-64 bg-surface-container-lowest text-on-surface text-xs rounded-xl pl-9 pr-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Fleet Table */}
      <div className="rounded-2xl bg-surface-container-low border border-surface-container overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container border-b border-surface-container-highest text-outline uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Bus ID &amp; Model</th>
                <th className="py-3 px-4">Bus Code</th>
                <th className="py-3 px-4">Passenger Capacity</th>
                <th className="py-3 px-4">Telemetry Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">
                      directions_bus
                    </span>
                    <p className="font-semibold text-sm text-on-surface">No Vehicles Found</p>
                    <p className="text-xs text-outline mt-1">
                      {search
                        ? 'No buses match your search criteria.'
                        : 'No fleet units registered in database yet. Deploy your first vehicle above.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((bus) => {
                  const isBusActive = bus.is_active !== false;

                  return (
                    <tr key={bus.id} className="hover:bg-surface-container/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary font-bold font-mono text-xs flex items-center justify-center">
                            {bus.bus_number ? bus.bus_number.slice(0, 4) : '#'}
                          </span>
                          <div>
                            <span className="font-bold text-on-surface block">
                              Bus #{bus.bus_number || bus.id.slice(0, 6)}
                            </span>
                            <span className="text-[10px] text-outline">
                              {bus.model || 'Standard CityBus'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-on-surface">
                        {bus.bus_number || '—'}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">
                        {bus.capacity || 42} Seats
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          status={isBusActive ? 'ON_TIME' : 'MAINTENANCE'}
                          text={isBusActive ? 'In Service' : 'Maintenance'}
                        />
                      </td>
                      <td className="py-3 px-4 text-outline font-mono text-[11px]">
                        {bus.created_at ? new Date(bus.created_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => toggleBusStatus(bus)}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-bright text-xs text-primary font-semibold transition"
                          title="Toggle active status"
                        >
                          {isBusActive ? 'Set Maintenance' : 'Set Active'}
                        </button>
                        <button
                          onClick={() => openEditModal(bus)}
                          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition"
                          title="Edit Bus"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(bus)}
                          className="p-1 rounded-lg hover:bg-error-container/30 text-on-surface-variant hover:text-error transition"
                          title="Delete Bus"
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

      {/* Modal: Add New Bus */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Deploy New Municipal Bus"
      >
        <form onSubmit={handleAddBus} className="flex flex-col gap-3.5">
          {formError && (
            <div className="p-2.5 rounded-xl bg-error-container/20 border border-error/40 text-error text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Bus Code / Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 42B"
                value={formData.busNumber}
                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value.toUpperCase() })}
                className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Capacity (Seats)</label>
              <input
                type="number"
                min="10"
                max="120"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Vehicle Model &amp; Propulsion</label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="Volvo Electric CityBus 12m">Volvo Electric CityBus 12m (42 Seats)</option>
              <option value="BYD K9 Zero-Emission Electric">BYD K9 Zero-Emission Electric</option>
              <option value="Proterra ZX5 Max High-Capacity">Proterra ZX5 Max High-Capacity</option>
              <option value="Nova Bus LFSe+ Low-Floor">Nova Bus LFSe+ Low-Floor</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded accent-primary"
            />
            <label htmlFor="isActiveCheck" className="text-xs text-on-surface cursor-pointer">
              Deploy immediately into active service
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
              {isSubmitting ? 'Deploying...' : 'Register & Deploy'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Bus */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Bus #${selectedBus?.bus_number || ''}`}
      >
        <form onSubmit={handleUpdateBus} className="flex flex-col gap-3.5">
          {formError && (
            <div className="p-2.5 rounded-xl bg-error-container/20 border border-error/40 text-error text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Bus Code / Number</label>
              <input
                type="text"
                required
                value={formData.busNumber}
                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value.toUpperCase() })}
                className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Capacity (Seats)</label>
              <input
                type="number"
                min="10"
                max="120"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Vehicle Model &amp; Propulsion</label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="Volvo Electric CityBus 12m">Volvo Electric CityBus 12m (42 Seats)</option>
              <option value="BYD K9 Zero-Emission Electric">BYD K9 Zero-Emission Electric</option>
              <option value="Proterra ZX5 Max High-Capacity">Proterra ZX5 Max High-Capacity</option>
              <option value="Nova Bus LFSe+ Low-Floor">Nova Bus LFSe+ Low-Floor</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isEditActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded accent-primary"
            />
            <label htmlFor="isEditActiveCheck" className="text-xs text-on-surface cursor-pointer">
              Active in service
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

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Fleet Deletion"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-on-surface">Bus #{selectedBus?.bus_number}</strong> ({selectedBus?.model}) from
            the Supabase database? This action cannot be undone.
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
              onClick={handleDeleteBus}
              className="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-bold shadow-md hover:bg-error/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Bus'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
