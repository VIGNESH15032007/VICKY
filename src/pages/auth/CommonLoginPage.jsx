import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CommonLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [targetDestination, setTargetDestination] = useState('');

  const { login, isConfigured } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both your transit identity email and passcode.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const result = await login(email, password);
      setAuthSuccess(true);
      setTargetDestination(result.redirectPath);

      // Automatic role-based redirect based on role in public.profiles table
      setTimeout(() => {
        navigate(result.redirectPath, { replace: true });
      }, 700);
    } catch (err) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Authentication failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-surface min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md flex flex-col">
        {/* Dynamic Ambient Glow Behind Form Header */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-surface-container-low p-6 shadow-xl mb-4 border border-surface-container-high/60">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>

          {/* Branding & Header Section */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-container-high p-2 flex items-center justify-center shadow-lg border border-primary/20">
                <img src="/logo.svg" alt="MetroPulse Logo" className="w-full h-full object-contain" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-tertiary"></span>
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-highest/60 text-secondary mb-2 text-xs">
              <span className="material-symbols-outlined text-[14px]">sensors</span>
              <span className="font-semibold tracking-wide">Small City Real-Time Mobility Portal</span>
            </div>

            <h2 className="font-headline-lg-mobile text-2xl font-bold text-on-surface tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant max-w-sm mt-1 leading-relaxed">
              Unified transit access for passengers, drivers, and municipal dispatchers.
            </p>
          </div>
        </div>

        {/* Configuration Notice if env vars are missing */}
        {!isConfigured && (
          <div className="mb-4 bg-surface-container p-3.5 rounded-xl border border-secondary/30 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">info</span>
            <div className="text-xs text-on-surface-variant leading-relaxed">
              <span className="font-semibold text-secondary block mb-0.5">Supabase Auth Integration Ready</span>
              Set <code className="text-primary font-mono text-[11px] bg-surface-container-lowest px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-primary font-mono text-[11px] bg-surface-container-lowest px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in your environment to authenticate live accounts.
            </div>
          </div>
        )}

        {/* Role-Based Auto Routing Info Pill */}
        <div className="bg-surface-container p-3.5 rounded-xl mb-4 shadow-sm border border-surface-container-high flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-secondary-container/40 text-secondary shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-label-md text-xs text-secondary font-semibold flex items-center gap-1.5">
              <span>Automatic Role Verification</span>
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
              Upon login, your role is fetched from <code className="text-primary font-mono text-[10px]">public.profiles</code> to redirect you to your assigned portal.
            </p>
          </div>
        </div>

        {/* Error Alert Banner */}
        {authError && (
          <div className="mb-4 bg-error-container/20 border border-error/40 text-error p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-shake">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
            <div className="flex-1">
              <span className="font-bold block">Authentication Notice</span>
              <span>{authError}</span>
            </div>
          </div>
        )}

        {/* Unified Authentication Card */}
        <div className="bg-surface-container-high rounded-2xl p-5 sm:p-6 shadow-2xl border border-surface-container-highest">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface" htmlFor="transit-email">
                  Transit Identity (Email)
                </label>
                <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-tertiary">verified</span> Civic SSO
                </span>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                  alternate_email
                </span>
                <input
                  id="transit-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commuter@riverdale.org"
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm rounded-xl pl-11 pr-4 py-3 border border-outline-variant/30 focus:outline-none focus:border-primary shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-on-surface" htmlFor="transit-password">
                  Secure Passcode
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset instructions will be sent via Supabase Auth when configured.');
                  }}
                  className="text-xs text-primary hover:text-secondary-fixed transition-colors"
                >
                  Forgot passcode?
                </a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  id="transit-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-sm rounded-xl pl-11 pr-11 py-3 border border-outline-variant/30 focus:outline-none focus:border-primary shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 p-1 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Device & Security */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded bg-surface-container-lowest border-outline-variant text-primary focus:ring-0"
                />
                <span className="text-xs text-on-surface-variant">Remember this device</span>
              </label>
              <span className="text-[10px] text-tertiary flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Encrypted 256-bit
              </span>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading || authSuccess}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition-all mt-1 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  <span>Verifying Transit Credentials...</span>
                </>
              ) : authSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[20px] text-on-primary">check_circle</span>
                  <span>Role Verified • Redirecting to {targetDestination}...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Registration Redirection Card */}
        <div className="mt-4 bg-surface-container p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm border border-surface-container-high">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">commute</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">New passenger?</p>
              <p className="text-xs text-on-surface-variant truncate">Create a Passenger Account</p>
            </div>
          </div>
          <Link
            to="/register"
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-high text-primary hover:bg-surface-bright text-xs font-semibold transition flex items-center gap-1 shrink-0"
          >
            <span>Register</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </Link>
        </div>

        {/* Security & Architecture Badge */}
        <div className="mt-6 flex flex-col items-center justify-center text-center gap-1 text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-tertiary">bolt</span>
            <span className="font-semibold tracking-wider uppercase text-outline text-[10px]">Supabase Auth &amp; Profiles Engine</span>
          </div>
          <p className="text-[11px] text-outline">
            Real-time role resolution via public.profiles table
          </p>
        </div>
      </div>
    </div>
  );
}
