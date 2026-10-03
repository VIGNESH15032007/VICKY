import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MOCK_BUSES, MOCK_ROUTES } from '../../data/mockData';

export default function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const initialBus = searchParams.get('bus') || '42B';

  const [selectedBus, setSelectedBus] = useState(initialBus);
  const [selectedRoute, setSelectedRoute] = useState('104');
  const [tripWindow, setTripWindow] = useState('today-am');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('AC / Climate');
  const [comment, setComment] = useState('The climate control and seat availability were great on this morning commute!');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState(null);

  const categories = ['Punctuality', 'Cleanliness', 'AC / Climate', 'Driver Courtesy', 'Ride Smoothness', 'Other'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRef(`FB-${Math.floor(1000 + Math.random() * 9000)}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8 max-w-3xl mx-auto space-y-6">
      {/* Toast Confirmation */}
      {submittedRef && (
        <div className="p-4 rounded-2xl bg-surface-container-high border border-tertiary/40 shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-tertiary-container/30 flex items-center justify-center text-tertiary shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">Feedback Synced to Dispatch</h4>
              <p className="text-xs text-on-surface-variant">Thank you! Your feedback has been registered into municipal telemetry triage.</p>
              <div className="flex items-center gap-2 mt-1 text-xs">
                <span className="font-bold text-primary">Ref #{submittedRef}</span>
                <span className="text-outline">•</span>
                <span className="text-on-surface-variant">Under Municipal Review</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSubmittedRef(null)}
            className="text-outline hover:text-on-surface p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 mb-1 text-xs text-tertiary font-bold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          <span>Connected to Fleet Dispatch Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Passenger Bus Feedback
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
          Help improve small city transit. Your ratings directly sync to municipal dispatch and fleet maintenance.
        </p>
      </div>

      {/* Main Feedback Form Card */}
      <div className="p-6 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Trip Selectors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Trip Telemetry Selector</span>
              </span>
              <span className="text-[11px] text-outline font-mono">Live Fleet Link</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Bus selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Transit Vehicle</label>
                <select
                  value={selectedBus}
                  onChange={(e) => setSelectedBus(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  {MOCK_BUSES.map((b) => (
                    <option key={b.id} value={b.id} className="bg-surface-container text-on-surface">
                      Bus {b.id} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Route selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface">Active Corridor</label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="104" className="bg-surface-container text-on-surface">Route 104: Central Station → West Ridge</option>
                  <option value="12" className="bg-surface-container text-on-surface">Route 12: Greenfield Loop</option>
                  <option value="07" className="bg-surface-container text-on-surface">Route 07: Downtown Circular Ring</option>
                </select>
              </div>
            </div>

            {/* Trip Window */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-on-surface">Schedule Window</label>
              <select
                value={tripWindow}
                onChange={(e) => setTripWindow(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="today-am" className="bg-surface-container text-on-surface">Today, Morning Commute (08:15 AM)</option>
                <option value="today-pm" className="bg-surface-container text-on-surface">Today, Afternoon Peak (02:30 PM)</option>
                <option value="yesterday" className="bg-surface-container text-on-surface">Yesterday, Evening Run (06:45 PM)</option>
              </select>
            </div>
          </div>

          {/* Star Rating */}
          <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-surface-container text-center flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Overall Trip Experience Rating
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                  className="p-1 transition-transform hover:scale-125 active:scale-95 text-primary"
                >
                  <span
                    className="material-symbols-outlined text-[32px]"
                    style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-primary">
              {rating === 5 ? 'Exceptional Trip' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : 'Needs Improvement'}
            </span>
          </div>

          {/* Feedback Category Chips */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface">Feedback Category</label>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    category === cat
                      ? 'bg-primary text-on-primary font-bold shadow-md'
                      : 'bg-surface-container hover:bg-surface-bright text-on-surface-variant'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Comments */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Comments &amp; Experience Details</label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell dispatch about bus cleanliness, driver behavior, delays, or AC cooling..."
              className="w-full bg-surface-container-lowest text-on-surface text-xs rounded-xl p-3.5 border border-outline-variant/40 focus:outline-none focus:border-primary leading-relaxed shadow-inner"
            />
          </div>

          {/* Anonymous Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded bg-surface-container-lowest border-outline-variant text-primary"
            />
            <span className="text-xs text-on-surface-variant">Submit feedback anonymously</span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition mt-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                <span>Transmitting to Dispatch Telemetry...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Submit Feedback to City Transit</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
