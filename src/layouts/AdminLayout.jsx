import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import ErrorBoundary from '../components/common/ErrorBoundary';

export default function AdminLayout() {
  const [utcTime, setUtcTime] = useState('');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('System Delay: Heavy Weather Protocol');
  const [broadcastMsg, setBroadcastMsg] = useState('All units reduce speed to 40 km/h in West Ridge sector. Safety protocol active.');
  const [selectedZone, setSelectedZone] = useState('riverdale');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, logout, getRedirectPath } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hrs}:${mins}:${secs} UTC`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Safeguard: Ensure non-admin users cannot stay on /admin
  useEffect(() => {
    if (role && role.toLowerCase() !== 'admin') {
      navigate(getRedirectPath(role), { replace: true });
    }
  }, [role, navigate, getRedirectPath]);

  const handleBroadcast = (e) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setIsBroadcastOpen(false);
    }, 1800);
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: 'dashboard', end: true },
    { label: 'Live Monitoring', path: '/admin/live-monitoring', icon: 'radar' },
    { label: 'Buses', path: '/admin/buses', icon: 'directions_bus' },
    { label: 'Drivers', path: '/admin/drivers', icon: 'badge' },
    { label: 'Routes', path: '/admin/routes', icon: 'alt_route' },
    { label: 'Trips', path: '/admin/trips', icon: 'history', matchAlternative: '/admin/trip-history' },
    { label: 'Reports', path: '/admin/reports', icon: 'analytics' },
    { label: 'Feedback', path: '/admin/feedback', icon: 'mark_chat_unread', badge: 2 }
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* Top Command Telemetry Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container-high shadow-lg">
        <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-3">
          {/* Left: Mobile Drawer Trigger + Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container"
              aria-label="Toggle Navigation"
            >
              <span className="material-symbols-outlined text-[24px]">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            <Link to="/admin" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-surface-container-high p-1 flex items-center justify-center border border-error/30">
                <img src="/logo.svg" alt="MetroPulse" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-sm md:text-base font-bold text-on-surface truncate">
                    Admin Dispatch Panel
                  </span>
                  <span className="text-[10px] bg-error-container/40 text-error px-1.5 py-0.5 rounded font-bold uppercase tracking-wider hidden xs:inline">
                    HQ
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-tertiary">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                  <span>ALL SYSTEMS NOMINAL</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Municipal Zone & Live UTC Clock */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-full border border-surface-container-high">
              <span className="material-symbols-outlined text-primary text-[18px]">location_city</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer pr-1"
              >
                <option value="riverdale" className="bg-surface-container-high text-on-surface">Riverdale Metro (Pop: 94k)</option>
                <option value="cedarvale" className="bg-surface-container-high text-on-surface">Cedarvale Valley District</option>
                <option value="oakwood" className="bg-surface-container-high text-on-surface">Oakwood Springs Transit</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-surface-container">
              <span className="material-symbols-outlined text-tertiary text-[14px]">sensors</span>
              <span className="text-xs font-mono text-on-surface-variant font-medium">
                {utcTime}
              </span>
            </div>
          </div>

          {/* Right: Broadcast Button & Role Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-error text-on-error font-label-sm text-xs font-bold shadow-md hover:bg-error/90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">emergency</span>
              <span className="hidden sm:inline">Broadcast</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-error-container/40 border border-error/30 text-error flex items-center justify-center font-bold text-xs">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'A'}
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

        {/* Desktop Admin Horizontal Subnav Bar */}
        <div className="hidden md:flex items-center gap-1 px-6 py-2 bg-surface-container-lowest/80 border-t border-surface-container-high/40 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => {
                const active = isActive || (item.matchAlternative && location.pathname.startsWith(item.matchAlternative));
                return `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`;
              }}
            >
              <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.2 rounded-full bg-error text-on-error text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-surface-container-high border-r border-surface-container-highest p-4 flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
              <span className="font-bold text-on-surface text-sm">Admin Navigation</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 mt-4 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => {
                    const active = isActive || (item.matchAlternative && location.pathname.startsWith(item.matchAlternative));
                    return `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active ? 'bg-primary text-on-primary font-bold' : 'text-on-surface hover:bg-surface-container'
                    }`;
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-error text-on-error text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="pt-4 border-t border-surface-container-highest">
              <span className="text-[11px] text-outline block mb-2 font-mono">{utcTime}</span>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsBroadcastOpen(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-error text-on-error text-xs font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">emergency</span>
                <span>Send Emergency Alert</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-18 md:pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Emergency Broadcast Modal */}
      <Modal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        title="Emergency Transit Broadcast"
      >
        <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
          <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">campaign</span>
            <p className="text-xs leading-relaxed">
              This message will be instantly beamed across all active in-vehicle driver displays, bus shelter LED signs, and commuter apps.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Broadcast Title</label>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-error"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface">Detailed Advisory Notice</label>
            <textarea
              rows={3}
              required
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-error"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsBroadcastOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm font-semibold hover:bg-surface-bright transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={broadcastSent}
              className="flex-1 py-2.5 rounded-xl bg-error text-on-error text-sm font-bold shadow-lg hover:bg-error/90 active:scale-95 transition flex items-center justify-center gap-2"
            >
              {broadcastSent ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Dispatched to Fleet!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Dispatch Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
