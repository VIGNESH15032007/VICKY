import React from 'react';
import { NavLink } from 'react-router-dom';

export default function PassengerBottomNav() {
  const navItems = [
    { label: 'Dashboard', path: '/passenger', icon: 'dashboard', end: true },
    { label: 'Live Track', path: '/passenger/live-tracking', icon: 'radar' },
    { label: 'Search', path: '/passenger/search', icon: 'search' },
    { label: 'Seats', path: '/passenger/seat-availability', icon: 'airline_seat_recline_normal' },
    { label: 'Stops', path: '/passenger/nearby-stops', icon: 'location_on' },
    { label: 'Alerts', path: '/passenger/notifications', icon: 'notifications' },
    { label: 'Feedback', path: '/passenger/feedback', icon: 'rate_review' }
  ];

  return (
    <>
      {/* Mobile & Tablet Frosted Acrylic Bottom Dock */}
      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#120B22]/95 backdrop-blur-xl border-t border-[#3A2868]/50 shadow-[0_-4px_24px_rgba(0,0,0,0.6)] md:hidden">
        <div className="flex justify-around items-center h-16 px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[48px] py-1 transition-all ${
                  isActive
                    ? 'text-primary [filter:drop-shadow(0_0_8px_rgba(208,188,255,0.5))]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-primary mt-0.5"></span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop Responsive Navigation Bar */}
      <nav className="hidden md:flex items-center gap-1 bg-surface-container-low/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-surface-container-high shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-2 rounded-xl text-label-md transition-all ${
                isActive
                  ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined text-[18px]">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
