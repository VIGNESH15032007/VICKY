import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    preferredRoute: '42B',
    accessibilityNeeds: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [regError, setRegError] = useState(null);

  const { register, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);

    if (formData.password !== formData.confirmPassword) {
      setRegError('Passcodes do not match. Please verify both fields.');
      return;
    }

    if (formData.password.length < 6) {
      setRegError('Passcode must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/passenger', { replace: true });
      }, 1000);
    } catch (err) {
      console.error('Registration error:', err);
      setRegError(err.message || 'Failed to create passenger account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-surface min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-lg flex flex-col">
        {/* Ambient Top Glow Card */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-low p-6 shadow-xl mb-4 border border-surface-container-high/60">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high p-2 flex items-center justify-center shadow-lg border border-primary/20 mb-3">
              <img src="/logo.svg" alt="MetroPulse" className="w-full h-full object-contain" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary-container/20 px-2.5 py-0.5 rounded-full mb-1">
              New Commuter Account
            </span>

            <h1 className="font-headline-lg-mobile text-2xl font-bold text-on-surface tracking-tight">
              Create Passenger Account
            </h1>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-sm mt-1">
              Get personalized live arrival alerts, pin favorite bus stops, and review real-time seat availability.
            </p>
          </div>
        </div>

        {/* Configuration Notice if env vars are missing */}
        {!isConfigured && (
          <div className="mb-4 bg-surface-container p-3 rounded-xl border border-secondary/30 flex items-start gap-2.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">info</span>
            <div>
              <span className="font-semibold text-secondary block">Supabase Auth Registration</span>
              Provide <code className="text-primary font-mono text-[11px]">VITE_SUPABASE_URL</code> and <code className="text-primary font-mono text-[11px]">VITE_SUPABASE_ANON_KEY</code> in <code className="text-primary font-mono text-[11px]">.env.local</code> to create live passenger accounts.
            </div>
          </div>
        )}

        {/* Registration Error Alert */}
        {regError && (
          <div className="mb-4 bg-error-container/20 border border-error/40 text-error p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-shake">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <div className="flex-1">
              <span className="font-bold block">Registration Error</span>
              <span>{regError}</span>
            </div>
          </div>
        )}

        {/* Registration Card Form */}
        <div className="bg-surface-container-high rounded-2xl p-5 sm:p-6 shadow-2xl border border-surface-container-highest">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface" htmlFor="reg-name">
                Full Legal Name
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                  person
                </span>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm rounded-xl pl-11 pr-4 py-2.5 border border-outline-variant/30 focus:outline-none focus:border-primary shadow-inner"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="reg-email">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                    mail
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm rounded-xl pl-9 pr-3 py-2.5 border border-outline-variant/30 focus:outline-none focus:border-primary shadow-inner"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="reg-phone">
                  Phone (SMS Alerts)
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px] pointer-events-none">
                    phone
                  </span>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm rounded-xl pl-9 pr-3 py-2.5 border border-outline-variant/30 focus:outline-none focus:border-primary shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="reg-pw">
                  Create Passcode
                </label>
                <input
                  id="reg-pw"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm rounded-xl px-3.5 py-2.5 border border-outline-variant/30 focus:outline-none focus:border-primary shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface" htmlFor="reg-pw-confirm">
                  Confirm Passcode
                </label>
                <input
                  id="reg-pw-confirm"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-type passcode"
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm rounded-xl px-3.5 py-2.5 border border-outline-variant/30 focus:outline-none focus:border-primary shadow-inner"
                />
              </div>
            </div>

            {/* Primary Frequent Route */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-on-surface">Primary Daily Corridor</label>
              <select
                value={formData.preferredRoute}
                onChange={(e) => setFormData({ ...formData, preferredRoute: e.target.value })}
                className="w-full bg-surface-container-lowest text-on-surface text-sm rounded-xl px-3.5 py-2.5 border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="42B" className="bg-surface-container text-on-surface">Bus 42B - North Express (Central ↔ West Ridge)</option>
                <option value="12A" className="bg-surface-container text-on-surface">Bus 12A - Hillside Shuttle (Greenfield Loop)</option>
                <option value="07" className="bg-surface-container text-on-surface">Bus 07 - Downtown Circular Ring</option>
                <option value="18" className="bg-surface-container text-on-surface">Bus 18 - Valley Link Arterial</option>
              </select>
            </div>

            {/* Accessibility Option */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.accessibilityNeeds}
                onChange={(e) => setFormData({ ...formData, accessibilityNeeds: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded bg-surface-container-lowest border-outline-variant text-tertiary focus:ring-0"
              />
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">accessible</span>
                  Accessibility &amp; Low-Floor Bus Priority
                </span>
                <span className="text-on-surface-variant text-[11px]">Highlight wheelchair bays and step-free transit entries by default.</span>
              </div>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all mt-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  <span>Registering Passenger Profile...</span>
                </>
              ) : isSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[20px] text-on-primary">check_circle</span>
                  <span>Account Created! Entering Portal...</span>
                </>
              ) : (
                <>
                  <span>Create Account &amp; Enter</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Member Redirect */}
        <div className="mt-4 text-center text-xs text-on-surface-variant">
          <span>Already have a civic account? </span>
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
