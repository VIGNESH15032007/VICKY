import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import Modal from '../../components/common/Modal';

export default function DriverManagementPage() {
  const [drivers, setDrivers] = useState([]);
  const [driverProfiles, setDriverProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    licenseNumber: '',
    profileId: '',
    isActive: true,
  });

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load drivers and candidate user profiles from Supabase
  const loadDriversData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const [driversRes, profilesRes] = await Promise.all([
        supabase.from('drivers').select('*, profile:profiles(*)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('full_name', { ascending: true }),
      ]);

      if (!driversRes.error && driversRes.data) {
        setDrivers(driversRes.data);
      }
      if (!profilesRes.error && profilesRes.data) {
        setDriverProfiles(profilesRes.data);
      }
    } catch (err) {
      console.warn('Error loading drivers from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDriversData();

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('driver-management-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'drivers' },
          () => {
            loadDriversData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadDriversData]);

  // Handle Add Driver (Create)
  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!formData.licenseNumber) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        license_number: formData.licenseNumber.trim().toUpperCase(),
        is_active: formData.isActive,
      };

      if (formData.profileId) {
        payload.profile_id = formData.profileId;
      }

      const { data, error } = await supabase
        .from('drivers')
        .insert(payload)
        .select('*, profile:profiles(*)')
        .single();

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data) {
        setDrivers([data, ...drivers]);
      }
      setIsAddModalOpen(false);
      setFormData({
        licenseNumber: '',
        profileId: '',
        isActive: true,
      });
    } catch (err) {
      setFormError(err.message || 'Failed to add driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (drv) => {
    setSelectedDriver(drv);
    setFormData({
      licenseNumber: drv.license_number || '',
      profileId: drv.profile_id || '',
      isActive: drv.is_active !== false,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Handle Edit Driver (Update)
  const handleUpdateDriver = async (e) => {
    e.preventDefault();
    if (!selectedDriver) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        license_number: formData.licenseNumber.trim().toUpperCase(),
        is_active: formData.isActive,
      };

      if (formData.profileId) {
        payload.profile_id = formData.profileId;
      }

      const { data, error } = await supabase
        .from('drivers')
        .update(payload)
        .eq('id', selectedDriver.id)
        .select('*, profile:profiles(*)')
        .single();

      if (error) {
        setFormError(error.message);
        return;
      }

      if (data) {
        setDrivers(drivers.map((d) => (d.id === selectedDriver.id ? data : d)));
      }
      setIsEditModalOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      setFormError(err.message || 'Failed to update driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (drv) => {
    setSelectedDriver(drv);
    setIsDeleteModalOpen(true);
  };

  // Handle Delete Driver
  const handleDeleteDriver = async () => {
    if (!selectedDriver) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', selectedDriver.id);

      if (error) {
        alert(`Error deleting driver: ${error.message}`);
        return;
      }

      setDrivers(drivers.filter((d) => d.id !== selectedDriver.id));
      setIsDeleteModalOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      alert(`Error deleting driver: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Driver Active Status
  const toggleDriverStatus = async (drv) => {
    const nextStatus = drv.is_active === false;
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_active: nextStatus })
        .eq('id', drv.id);

      if (!error) {
        setDrivers(
          drivers.map((d) => (d.id === drv.id ? { ...d, is_active: nextStatus } : d))
        );
      }
    } catch (err) {
      console.warn('Error toggling driver status:', err);
    }
  };

  const filtered = drivers.filter((d) => {
    const q = search.toLowerCase();
    const nameMatch = d.profile?.full_name?.toLowerCase().includes(q);
    const emailMatch = d.profile?.email?.toLowerCase().includes(q);
    const licenseMatch = d.license_number?.toLowerCase().includes(q);
    const idMatch = d.id?.toLowerCase().includes(q);
    return nameMatch || emailMatch || licenseMatch || idMatch;
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Driver Roster &amp; Shifts
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Registered transit operators, license credentials, and dispatch shift states.
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
              placeholder="Search driver or license..."
              className="w-full sm:w-64 bg-surface-container-high text-on-surface text-xs rounded-xl pl-9 pr-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={() => {
              setFormData({
                licenseNumber: '',
                profileId: '',
                isActive: true,
              });
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-primary/20 hover:bg-primary/90 transition shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Register Driver</span>
          </button>
        </div>
      </div>

      {/* Driver Roster Table */}
      <div className="rounded-2xl bg-surface-container-low border border-surface-container overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container border-b border-surface-container-highest text-outline uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">License Number</th>
                <th className="py-3 px-4">Account Profile Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline mb-2 block">
                      badge
                    </span>
                    <p className="font-semibold text-sm text-on-surface">No Drivers Found</p>
                    <p className="text-xs text-outline mt-1">
                      {search
                        ? 'No drivers match your search query.'
                        : 'No drivers registered yet. Register an operator using the button above.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((drv) => {
                  const driverName = drv.profile?.full_name || 'Operator';
                  const driverEmail = drv.profile?.email || 'No email attached';
                  const isActive = drv.is_active !== false;

                  return (
                    <tr key={drv.id} className="hover:bg-surface-container/60 transition">
                      <td className="py-3 px-4 font-bold text-on-surface flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-secondary-container/40 text-secondary flex items-center justify-center font-bold text-xs">
                          {driverName[0]?.toUpperCase() || 'D'}
                        </span>
                        <div>
                          <span>{driverName}</span>
                          <span className="text-[10px] text-outline block">{driverEmail}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-outline font-semibold">
                        {drv.license_number || '—'}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant font-mono text-[11px]">
                        {drv.profile_id ? (
                          <span className="text-primary font-semibold">Linked ({drv.profile_id.slice(0, 8)}...)</span>
                        ) : (
                          <span className="text-outline italic">Unlinked Profile</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-tertiary-container/30 text-tertiary'
                              : 'bg-surface-container-highest text-outline'
                          }`}
                        >
                          {isActive ? 'Active Duty' : 'Off-Duty'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-outline font-mono text-[11px]">
                        {drv.created_at ? new Date(drv.created_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => toggleDriverStatus(drv)}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-bright text-xs text-primary font-semibold transition"
                        >
                          {isActive ? 'Set Off-Duty' : 'Set Active'}
                        </button>
                        <button
                          onClick={() => openEditModal(drv)}
                          className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition"
                          title="Edit Driver"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(drv)}
                          className="p-1 rounded-lg hover:bg-error-container/30 text-on-surface-variant hover:text-error transition"
                          title="Delete Driver"
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

      {/* Modal: Add Driver */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Transit Operator"
      >
        <form onSubmit={handleAddDriver} className="flex flex-col gap-3.5">
          {formError && (
            <div className="p-2.5 rounded-xl bg-error-container/20 border border-error/40 text-error text-xs">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Operator Commercial License #</label>
            <input
              type="text"
              required
              placeholder="e.g. CDL-TX-9842"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Link User Profile (Optional)</label>
            <select
              value={formData.profileId}
              onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">-- No User Profile Linked --</option>
              {driverProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.email} ({p.role || 'user'})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-outline mt-0.5">
              Connect this driver record to an existing authenticated profile.
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isAddDriverActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded accent-primary"
            />
            <label htmlFor="isAddDriverActive" className="text-xs text-on-surface cursor-pointer">
              Active and eligible for route assignment
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
              {isSubmitting ? 'Registering...' : 'Register Operator'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Driver */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Driver Credentials"
      >
        <form onSubmit={handleUpdateDriver} className="flex flex-col gap-3.5">
          {formError && (
            <div className="p-2.5 rounded-xl bg-error-container/20 border border-error/40 text-error text-xs">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Operator Commercial License #</label>
            <input
              type="text"
              required
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface">Link User Profile</label>
            <select
              value={formData.profileId}
              onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
              className="bg-surface-container-lowest text-xs rounded-xl p-2.5 border border-outline-variant/40 text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="">-- No User Profile Linked --</option>
              {driverProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.email} ({p.role || 'user'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isEditDriverActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded accent-primary"
            />
            <label htmlFor="isEditDriverActive" className="text-xs text-on-surface cursor-pointer">
              Active and eligible for route assignment
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

      {/* Modal: Delete Driver */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Driver Removal"
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Are you sure you want to remove operator license{' '}
            <strong className="text-on-surface">{selectedDriver?.license_number}</strong> from
            the active roster?
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
              onClick={handleDeleteDriver}
              className="px-4 py-2 rounded-xl bg-error text-on-error text-xs font-bold shadow-md hover:bg-error/90"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Driver'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
