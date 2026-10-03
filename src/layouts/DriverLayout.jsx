import React from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DriverLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const isActiveTrip = location.pathname === '/driver/active-trip';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Driver Cockpit Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/60 shadow-lg">
        <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-3">
          {/* Left: Brand & Cockpit State */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/driver" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-surface-container-high p-1 flex items-center justify-center border border-secondary/40">
                <img src="/logo.svg" alt="MetroPulse" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-sm md:text-base font-bold text-on-surface truncate">
                    Driver Telemetry Console
                  </span>
                  <span className="text-[10px] bg-secondary-container/40 text-secondary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider hidden xs:inline">
                    Cockpit
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                  </span>
                  <span className="text-[10px] text-tertiary tracking-wider font-semibold uppercase">
                    GPS LOCKED (±1.5m)
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Pill (Cockpit vs Dashboard) */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-2xl border border-surface-container">
            <NavLink
              to="/driver"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-secondary text-on-secondary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/driver/active-trip"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive ? 'bg-primary text-on-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              <span>Active Trip</span>
            </NavLink>
          </div>

          {/* Right: Driver Identity & Sign Out */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 pr-1 text-right">
              <div>
                <p className="text-xs font-bold text-on-surface leading-tight">
                  {profile?.full_name || 'Driver Console'}
                </p>
                <p className="text-[10px] font-mono text-secondary">
                  {user?.email || '#DRV-8492 • Bus 42B'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-xl bg-secondary-container/40 border border-secondary/30 text-secondary flex items-center justify-center font-bold text-xs">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'D'}
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 md:pt-20 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
