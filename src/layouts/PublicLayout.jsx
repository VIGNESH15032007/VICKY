import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, logout } = useAuth();
  const isAuth = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRolePortalPath = (r) => {
    switch (r?.toLowerCase()) {
      case 'admin':
        return '/admin';
      case 'driver':
        return '/driver';
      case 'passenger':
      default:
        return '/passenger';
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high p-1 flex items-center justify-center border border-primary/20 group-hover:border-primary transition-colors">
              <img src="/logo.svg" alt="MetroPulse" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-sm text-lg font-extrabold tracking-tight text-on-surface">
                  Metro<span className="text-primary">Pulse</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary bg-tertiary-container/20 px-1.5 py-0.5 rounded border border-tertiary/30">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant leading-none hidden xs:block">
                Small City Real-Time Mobility
              </p>
            </div>
          </Link>

          {/* Quick Navigation on Landing */}
          {!isAuth && (
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-3.5 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-lg">Home</Link>
              <Link to="/passenger/live-tracking" className="px-3.5 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition">Track Bus</Link>
              <Link to="/passenger/search" className="px-3.5 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition">Routes</Link>
              <Link to="/passenger/nearby-stops" className="px-3.5 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition">Nearby Stops</Link>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getRolePortalPath(role)}
                  className="px-3.5 py-1.5 text-xs font-bold text-on-primary bg-primary rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">dashboard</span>
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-surface-container transition"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <>
                {location.pathname !== '/login' && (
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container rounded-xl transition"
                  >
                    Sign In
                  </Link>
                )}
                
                {location.pathname !== '/register' && (
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-semibold text-on-primary bg-primary hover:bg-primary-fixed-dim active:scale-95 rounded-xl shadow-md transition"
                  >
                    Register
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-surface-container-high/60 bg-surface-container-lowest/60 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary"></span>
            <span>MetroPulse Smart Transit Mesh v4.2 • Riverdale & Oakridge City</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/passenger" className="hover:text-primary transition-colors">Passenger Portal</Link>
            <Link to="/driver" className="hover:text-primary transition-colors">Driver Console</Link>
            <Link to="/admin" className="hover:text-primary transition-colors">Admin Dispatch</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Unified Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
