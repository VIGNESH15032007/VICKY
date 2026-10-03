import React, { useState } from 'react';
import { MOCK_NOTIFICATIONS } from '../../data/mockData';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState('ALL');

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.category.toUpperCase() === filter.toUpperCase();
  });

  const getIcon = (type) => {
    switch (type) {
      case 'ADVISORY': return { icon: 'alt_route', color: 'text-error', bg: 'bg-error-container/20' };
      case 'WEATHER': return { icon: 'cloud', color: 'text-amber-400', bg: 'bg-amber-500/20' };
      case 'INFO': return { icon: 'electric_bolt', color: 'text-primary', bg: 'bg-primary-container/20' };
      default: return { icon: 'notifications', color: 'text-tertiary', bg: 'bg-tertiary-container/20' };
    }
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Transit Alerts &amp; Advisories
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Real-time municipal notices, route deviations, and weather protocols.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-semibold text-primary transition"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'Detour', 'Operations', 'Fleet Update', 'Notice'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filter === cat ? 'bg-primary text-on-primary font-bold shadow-md' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {cat === 'ALL' ? 'All Alerts' : cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif) => {
          const { icon, color, bg } = getIcon(notif.type);

          return (
            <div
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all flex items-start gap-4 shadow-md ${
                notif.unread
                  ? 'bg-surface-container-high border-primary/40'
                  : 'bg-surface-container-low border-surface-container'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-outline">
                      {notif.category}
                    </span>
                    {notif.unread && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-outline shrink-0">{notif.time}</span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-on-surface mt-1">
                  {notif.title}
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
