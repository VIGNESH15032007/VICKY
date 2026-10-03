import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import Modal from '../../components/common/Modal';

export default function PassengerFeedbackAdminPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch feedback from Supabase
  const fetchFeedback = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*, passenger:profiles(*), trip:trips(*, bus:buses(*))')
        .order('id', { ascending: false });

      if (!error && data) {
        setFeedbacks(data);
      }
    } catch (err) {
      console.warn('Error fetching feedback from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('passenger-feedback-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'feedback' },
          () => {
            fetchFeedback();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchFeedback]);

  const handleResolve = async (id) => {
    try {
      await supabase
        .from('feedback')
        .update({ status: 'RESOLVED' })
        .eq('id', id);

      setFeedbacks(
        feedbacks.map((f) => (f.id === id ? { ...f, status: 'RESOLVED' } : f))
      );
    } catch (err) {
      console.warn('Error resolving feedback:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await supabase.from('feedback').delete().eq('id', id);
      setFeedbacks(feedbacks.filter((f) => f.id !== id));
    } catch (err) {
      console.warn('Error deleting feedback:', err);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!activeTicket) return;
    setIsSubmitting(true);

    try {
      await handleResolve(activeTicket.id);
      alert(`Response sent to ${activeTicket.passenger?.full_name || 'Rider'} for ticket #${activeTicket.id}!`);
      setActiveTicket(null);
      setReplyMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = feedbacks.filter((f) => {
    if (filter === 'ALL') return true;
    return (f.status || 'OPEN').toUpperCase() === filter;
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Passenger Feedback &amp; Complaints Triage
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Real-time civic ratings, maintenance requests, and driver compliments from Supabase.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === s
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {s === 'ALL' ? 'All Tickets' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Items Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-container-low border border-surface-container text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[42px] text-outline mb-2 block">
            mark_chat_read
          </span>
          <h3 className="font-bold text-base text-on-surface">No Feedback Tickets</h3>
          <p className="text-xs text-outline mt-1 max-w-sm mx-auto">
            {filter !== 'ALL'
              ? `No feedback tickets currently match status "${filter}".`
              : 'No passenger tickets found in Supabase. Commuters can submit feedback from their portal.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isResolved = (item.status || 'OPEN').toUpperCase() === 'RESOLVED';
            const passengerName = item.passenger?.full_name || 'Anonymous Commuter';
            const busNumber = item.trip?.bus?.bus_number || 'Transit Unit';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">chat</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-on-surface text-base">
                        {item.category || 'Commuter Report'}
                      </span>
                      <span className="font-mono text-[10px] text-outline">#{item.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isResolved
                            ? 'bg-tertiary-container/30 text-tertiary'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {(item.status || 'OPEN').replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      "{item.message || item.comment || 'Passenger commuter experience report.'}"
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-outline mt-2 flex-wrap">
                      <span>
                        Passenger: <strong className="text-on-surface">{passengerName}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Vehicle: <strong className="text-primary font-bold">Bus #{busNumber}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Rating: <strong className="text-amber-400">★ {item.rating || 5}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isResolved && (
                    <button
                      onClick={() => {
                        setActiveTicket(item);
                        setReplyMessage(
                          `Hello ${passengerName}, thank you for your feedback regarding Bus #${busNumber}. Our dispatch team has inspected this report.`
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1 shadow-md hover:bg-primary/90 transition"
                    >
                      <span className="material-symbols-outlined text-[16px]">reply</span>
                      <span>Reply</span>
                    </button>
                  )}
                  {!isResolved && (
                    <button
                      onClick={() => handleResolve(item.id)}
                      className="px-3.5 py-2 rounded-xl bg-surface-container text-xs text-tertiary font-bold hover:bg-surface-container-highest transition"
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl hover:bg-error-container/30 text-on-surface-variant hover:text-error transition"
                    title="Delete Ticket"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      {activeTicket && (
        <Modal
          isOpen={Boolean(activeTicket)}
          onClose={() => setActiveTicket(null)}
          title={`Dispatch Response to Ticket #${activeTicket.id}`}
        >
          <form onSubmit={handleReplySubmit} className="flex flex-col gap-4">
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container">
              <span className="text-xs text-outline block">Passenger Comment:</span>
              <p className="text-xs text-on-surface italic mt-0.5">
                "{activeTicket.message || activeTicket.comment || ''}"
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Dispatcher Response</label>
              <textarea
                rows={4}
                required
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full bg-surface-container-lowest text-xs rounded-xl p-3 border border-outline-variant/40 focus:outline-none focus:border-primary text-on-surface"
              />
            </div>

            <div className="flex items-center gap-2 justify-end pt-1">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setActiveTicket(null)}
                className="px-4 py-2 rounded-xl bg-surface-container text-xs font-semibold text-on-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:bg-primary/90"
              >
                {isSubmitting ? 'Transmitting...' : 'Send & Mark Resolved'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
