import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header({ title = 'MetroPulse Transit', subtitle = '', showBack = false, onBack }) {
  const navigate = useNavigate();
  const { user, profile, role, logout } = useAuth();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case 'admin':
        return { label: 'Admin Dispatch', color: 'bg-error-container/40 text-error border-error/30' };
      case 'driver':
        return { label: 'Driver Cockpit', color: 'bg-secondary-container/40 text-secondary border-secondary/30' };
      case 'passenger':
      default:
        return { label: 'Passenger', color: 'bg-primary-container/30 text-primary border-primary/30' };
    }
  };

  const badge = role ? getRoleBadge(role) : null;

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl border-b border-surface-container-high/60 shadow-[0_1px_12px_rgba(0,0,0,0.35)]">
      <div className="h-16 md:h-18 px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Left: Brand or Back Button */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container active:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-surface-container-high p-1 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-colors">
              <img src="/logo.svg" alt="MetroPulse" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-[16px] text-on-surface font-bold tracking-tight">
                  Metro<span className="text-primary">Pulse</span>
                </span>
                {subtitle && (
                  <span className="text-xs text-on-surface-variant hidden sm:inline">
                    • {subtitle}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                </span>
                <span className="text-[10px] text-tertiary tracking-wider font-semibold uppercase">
                  LIVE GPS ACTIVE
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Title on Mobile / Desktop */}
        <div className="hidden md:flex items-center justify-center text-center">
          <span className="text-sm font-semibold text-on-surface-variant truncate">
            {title}
          </span>
        </div>

        {/* Right: Authenticated User Info or Sign In button */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              {badge && (
                <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                  {badge.label}
                </span>
              )}
              
              <div className="relative group flex items-center gap-2">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary font-bold text-xs">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="py-1.5 px-3.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
