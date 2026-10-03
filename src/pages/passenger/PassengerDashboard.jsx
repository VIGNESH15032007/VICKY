import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_BUSES, MOCK_STOPS, MOCK_ROUTES } from '../../data/mockData';
import Badge from '../../components/common/Badge';
import SectorMapPreview from '../../components/map/SectorMapPreview';

export default function PassengerDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/passenger/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/passenger/search');
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome & Ambient Civic Presence */}
      <section className="flex flex-col space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-tertiary text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              Oakridge Metro Zone
            </span>
            <span className="text-xs text-on-surface-variant hidden xs:inline">• Transit Mesh v4.2</span>
          </div>
          <button
            onClick={handleRefresh}
            aria-label="Refresh telemetry"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-bright transition-all active:scale-90"
          >
            <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>
              sync
            </span>
          </button>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <h1 className="font-headline-lg-mobile text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Welcome back, <span className="text-primary font-extrabold">Alex</span>
          </h1>
          <span className="text-xs font-mono text-on-surface-variant">Fri, 08:42 AM</span>
        </div>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          High network reliability today. All municipal corridors fluid.
        </p>
      </section>

      {/* Quick Telemetry Search Bar */}
      <section className="relative">
        <form onSubmit={handleSearch} className="relative flex items-center w-full rounded-2xl bg-surface-container-low border border-surface-container shadow-lg shadow-surface-container-lowest/60 focus-within:border-primary/60 transition-all duration-300">
          <div className="pl-4 pr-2 flex items-center pointer-events-none text-primary">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bus # (e.g. 42B) or route..."
            className="w-full py-3.5 bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
          />
          <div className="pr-2 flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => alert('Voice search activated (Listening for route name...)')}
              aria-label="Voice search"
              className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
            <button
              type="submit"
              aria-label="Filter routes"
              className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center hover:opacity-90 transition-all active:scale-90 shadow-sm"
            >
              <span className="material-symbols-outlined text-[19px]">tune</span>
            </button>
          </div>
        </form>
      </section>

      {/* Live Pulse Metrics Strip (3 Cards) */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Active Fleet */}
        <div className="flex flex-col p-3.5 sm:p-4 rounded-2xl bg-surface-container-low border border-surface-container relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">Active Fleet</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
            </span>
          </div>
          <div className="font-headline-sm text-base sm:text-xl text-on-surface font-extrabold tracking-tight">18 Buses</div>
          <span className="text-[10px] sm:text-xs text-tertiary font-semibold mt-0.5 truncate">100% telemetry</span>
          <div className="absolute -right-3 -bottom-3 opacity-5 pointer-events-none text-on-surface">
            <span className="material-symbols-outlined text-[48px]">directions_bus</span>
          </div>
        </div>

        {/* Reliability Rate */}
        <div className="flex flex-col p-3.5 sm:p-4 rounded-2xl bg-surface-container-low border border-surface-container relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">On-Time</span>
            <span className="material-symbols-outlined text-primary text-[14px]">verified</span>
          </div>
          <div className="font-headline-sm text-base sm:text-xl text-on-surface font-extrabold tracking-tight">94.2%</div>
          <span className="text-[10px] sm:text-xs text-primary font-semibold mt-0.5 truncate">+1.8% vs avg</span>
          <div className="absolute -right-3 -bottom-3 opacity-5 pointer-events-none text-on-surface">
            <span className="material-symbols-outlined text-[48px]">speed</span>
          </div>
        </div>

        {/* Nearest Node */}
        <Link to="/passenger/nearby-stops" className="flex flex-col p-3.5 sm:p-4 rounded-2xl bg-surface-container-low border border-surface-container hover:border-secondary/40 transition relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">Nearest</span>
            <span className="material-symbols-outlined text-secondary text-[14px]">near_me</span>
          </div>
          <div className="font-headline-sm text-base sm:text-xl text-on-surface font-extrabold tracking-tight truncate">Central Sq</div>
          <span className="text-[10px] sm:text-xs text-secondary font-semibold mt-0.5 truncate">180m • 2 min walk</span>
          <div className="absolute -right-3 -bottom-3 opacity-5 pointer-events-none text-on-surface">
            <span className="material-symbols-outlined text-[48px]">pin_drop</span>
          </div>
        </Link>
      </section>

      {/* Live Disruption / Municipal Service Notice */}
      {!alertDismissed && (
        <section className="rounded-2xl p-3.5 sm:p-4 bg-surface-container-low border border-error/20 flex items-start gap-3 relative overflow-hidden shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-error-container/40 text-error flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">alt_route</span>
          </div>
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-error font-bold tracking-wide uppercase">Advisory</span>
              <span className="text-on-surface-variant text-xs">• Line 15 Detour</span>
            </div>
            <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
              River Road resurfacing active. Route 15 skipping Oak Quay stop until 16:00. Commuters use Central Pier.
            </p>
          </div>
          <button
            onClick={() => setAlertDismissed(true)}
            aria-label="Dismiss alert"
            className="text-outline hover:text-on-surface transition-colors shrink-0 p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </section>
      )}

      {/* Active Buses Feed */}
      <section className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">radar</span>
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">Live Approaching Buses</h2>
          </div>
          <Link
            to="/passenger/search"
            className="text-xs font-bold text-primary hover:text-primary-fixed transition-colors flex items-center gap-0.5"
          >
            <span>All Lines</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_BUSES.slice(0, 3).map((bus) => (
            <article
              key={bus.id}
              className="flex flex-col justify-between rounded-2xl p-4 bg-surface-container-low border border-surface-container hover:border-primary/40 hover:bg-surface-container transition-all duration-200 shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-11 px-3 rounded-xl bg-primary-container text-on-primary font-headline-sm text-base flex items-center justify-center font-extrabold tracking-tight shadow-sm">
                      {bus.id}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline-sm text-sm font-bold text-on-surface truncate">{bus.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      </div>
                      <span className="text-xs text-on-surface-variant truncate">To {bus.destination}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-headline-md text-base sm:text-lg text-tertiary font-extrabold tracking-tight">{bus.eta}</span>
                    <Badge status={bus.status} text={bus.status === 'ON_TIME' ? 'On Time' : bus.statusText} size="sm" />
                  </div>
                </div>

                {/* Micro progression details */}
                <div className="mt-4 pt-3 flex flex-col space-y-2 bg-surface-container-lowest/60 -mx-4 p-4 rounded-b-xl border-t border-surface-container">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[16px]">navigation</span>
                      <span>Next: <strong className="font-semibold">{bus.nextStop}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-tertiary font-semibold">
                      <span className="material-symbols-outlined text-[16px]">airline_seat_recline_normal</span>
                      <span>{bus.occupancy.available} seats open</span>
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        bus.occupancy.percentage > 80 ? 'bg-amber-400' : 'bg-tertiary'
                      }`}
                      style={{ width: `${bus.occupancy.percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-outline truncate">{bus.plateNumber} • {bus.type}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/passenger/bus/${bus.id}`}
                        className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-xs font-semibold text-on-surface transition"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/passenger/live-tracking?bus=${bus.id}`}
                        className="h-8 px-3 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center gap-1 hover:bg-primary-fixed-dim transition shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[15px]">location_searching</span>
                        <span>Track</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Interactive Sector Telemetry Radar Snapshot */}
      <section className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">Sector Telemetry Map</h2>
          </div>
          <span className="text-xs text-tertiary font-semibold font-mono">GPS Refresh: 1.2s</span>
        </div>

        {/* Map Container Preview */}
        <div className="relative">
          <SectorMapPreview buses={MOCK_BUSES} />

          {/* Floating Map Action Trigger */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
            <Link
              to="/passenger/live-tracking"
              className="px-4 py-2 rounded-xl bg-surface-container-high/95 backdrop-blur-md border border-outline-variant/40 text-on-surface text-xs font-bold hover:bg-surface-bright transition-all flex items-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">fullscreen</span>
              <span>Full Interactive Fleet Map</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pinned Lines & Stations */}
      <section className="flex flex-col space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">stars</span>
            <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">Pinned Lines &amp; Stations</h2>
          </div>
          <span className="text-xs text-secondary font-semibold">Commuter Favorites</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pinned Route 104 */}
          <Link
            to="/passenger/route/R104"
            className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-container hover:border-primary/40 hover:bg-surface-container transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[22px]">route</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-on-surface truncate">Route 104</span>
                  <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="text-xs text-on-surface-variant truncate">Central Stn → North Market</span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="text-xs font-bold text-tertiary">In 12m</span>
              <span className="text-[11px] text-outline">Freq: 15m</span>
            </div>
          </Link>

          {/* Pinned Stop #14 */}
          <Link
            to="/passenger/nearby-stops"
            className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-surface-container hover:border-secondary/40 hover:bg-surface-container transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-surface-variant flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined text-[22px]">signpost</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-on-surface truncate">Stop #14</span>
                  <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <span className="text-xs text-on-surface-variant truncate">Oakridge Central Interchange</span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className="text-xs font-bold text-primary">2 min walk</span>
              <span className="text-[11px] text-outline">4 Lines active</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Clean Transit Impact */}
      <section className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-surface-container to-surface-container-low border border-surface-container-high relative overflow-hidden flex items-center justify-between shadow-md">
        <div className="flex flex-col space-y-1 z-10 max-w-[70%]">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">energy_savings_leaf</span>
            <span className="text-xs sm:text-sm text-primary font-bold">Clean Transit Impact</span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            You saved <strong className="text-tertiary font-bold">3.4kg CO₂</strong> this week by choosing MetroPulse green loops.
          </p>
        </div>
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary-container/20 flex items-center justify-center text-primary z-10 shrink-0">
          <span className="material-symbols-outlined text-[28px] sm:text-[32px]">eco</span>
        </div>
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
      </section>
    </div>
  );
}
