import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MOCK_BUSES, MOCK_ROUTES, SYSTEM_INFO } from '../../data/mockData';
import Badge from '../../components/common/Badge';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [origin, setOrigin] = useState('Central Station');
  const [destination, setDestination] = useState('West Ridge Terminal');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/passenger/search?q=${encodeURIComponent(searchQuery || origin)}`);
  };

  const swapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background">
      {/* Top Status Announcement Bar */}
      <div className="bg-surface-container-lowest border-b border-surface-container py-2 px-4 text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-tertiary-container/30 text-tertiary border border-tertiary/40">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-1.5 animate-ping"></span>
              GPS FEED ONLINE
            </span>
            <span>Serving Riverdale &amp; Oakridge Municipal Transit Corridors</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Fleet Tracked: <strong className="text-tertiary font-bold">{SYSTEM_INFO.networkReliability}</strong></span>
            <span className="hidden sm:inline">Active Buses: <strong className="text-primary font-bold">{SYSTEM_INFO.activeFleetCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Hero Section with Glassmorphism */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 px-4 md:px-8 border-b border-surface-container-high/60">
        {/* Ambient Glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute top-20 right-10 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/90 border border-primary/30 text-primary w-fit text-xs font-semibold shadow-sm">
                <span className="material-symbols-outlined text-[16px]">sensors</span>
                <span>REAL-TIME PUBLIC TRANSPORT FOR SMALL CITIES</span>
              </div>

              <h1 className="font-headline-xl text-3xl sm:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.12]">
                Track Your Bus. <br />
                <span className="bg-gradient-to-r from-primary via-primary-fixed to-secondary bg-clip-text text-transparent">
                  Travel Smarter.
                </span>
              </h1>

              <p className="font-body-lg text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Live GPS telemetry, second-by-second countdowns, sensor-verified seat availability, and instant route notices — engineered for modern municipal transit.
              </p>

              {/* Quick Route Search Form Card */}
              <div className="bg-surface-container-high/90 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-surface-container-highest shadow-2xl">
                <form onSubmit={handleSearch} className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
                    {/* Origin */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Boarding Stop</label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-primary text-[18px]">radio_button_checked</span>
                        <input
                          type="text"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          placeholder="Current location or stop..."
                          className="w-full bg-surface-container-lowest text-on-surface rounded-xl pl-9 pr-3 py-2.5 text-sm border border-outline-variant/40 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Swap button on desktop */}
                    <button
                      type="button"
                      onClick={swapLocations}
                      aria-label="Swap directions"
                      className="hidden sm:flex absolute left-1/2 top-7 -translate-x-1/2 w-8 h-8 rounded-full bg-surface-container-highest hover:bg-surface-bright text-primary border border-surface-container flex items-center justify-center transition-transform hover:rotate-180 z-10"
                    >
                      <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                    </button>

                    {/* Destination */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Destination</label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-secondary text-[18px]">location_on</span>
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="Destination stop or landmark..."
                          className="w-full bg-surface-container-lowest text-on-surface rounded-xl pl-9 pr-3 py-2.5 text-sm border border-outline-variant/40 focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                      <span>18 Active buses running right now</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:bg-primary-fixed-dim transition active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">search</span>
                      <span>Find Buses</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Action Badges */}
              <div className="flex items-center gap-2.5 flex-wrap pt-2">
                <span className="text-xs text-on-surface-variant">Popular Corridors:</span>
                <Link to="/passenger/bus/42B" className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-primary transition">
                  Bus 42B (North Express)
                </Link>
                <Link to="/passenger/bus/12A" className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-secondary transition">
                  Bus 12A (Greenfield)
                </Link>
                <Link to="/passenger/bus/07" className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-tertiary transition">
                  Bus 07 (Downtown Ring)
                </Link>
              </div>
            </div>

            {/* Hero Right Visual: Live Telemetry Preview Card */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="rounded-2xl bg-surface-container-high/80 border border-primary/30 p-5 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-80"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-tertiary">Live Radar Active</span>
                  </div>
                  <span className="text-xs font-mono text-outline">±1.5m accuracy</span>
                </div>

                {/* Featured Live Bus Card */}
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary font-extrabold text-lg flex items-center justify-center shadow-md">
                        42B
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-on-surface">Blue Express</h4>
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        </div>
                        <p className="text-xs text-on-surface-variant">Central Stn → West Ridge</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-tertiary tracking-tight">3 min</div>
                      <Badge status="ON_TIME" text="On Schedule" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-container text-xs text-on-surface-variant">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">navigation</span>
                      <span>Next: <strong className="text-on-surface">Willow Creek</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-tertiary font-medium">
                      <span className="material-symbols-outlined text-[16px]">airline_seat_recline_normal</span>
                      <span>14 Seats Open</span>
                    </div>
                  </div>

                  {/* Seat Bar */}
                  <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                    <div className="bg-tertiary h-full rounded-full w-[66.7%]"></div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      to="/passenger/live-tracking"
                      className="flex-1 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary-fixed-dim transition shadow-md"
                    >
                      <span className="material-symbols-outlined text-[16px]">location_searching</span>
                      <span>Live Track Map</span>
                    </Link>
                    <Link
                      to="/passenger/seat-availability"
                      className="px-3.5 py-2 rounded-xl bg-surface-container text-primary hover:bg-surface-bright text-xs font-semibold transition"
                    >
                      Seat Map
                    </Link>
                  </div>
                </div>

                {/* Second Bus Ticker */}
                <div className="mt-3 p-3 rounded-xl bg-surface-container flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary-container font-bold">12A</span>
                    <span className="text-on-surface font-medium">Hillside Shuttle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold">7 min</span>
                    <Badge status="DELAYED" text="+4m" size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Role Portals Card Section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Unified Civic Mobility</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface mt-1">
            Built for Passengers, Drivers &amp; City Operators
          </h2>
          <p className="text-sm text-on-surface-variant max-w-lg mx-auto mt-2">
            Experience role-tailored dashboards powered by a unified real-time telemetry mesh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Passenger Portal */}
          <div className="p-6 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex flex-col justify-between hover:border-primary/60 transition-all group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[28px]">commute</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Passenger Portal</h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Live GPS route maps, instant bus arrival countdowns, 42-seat LIDAR occupancy radar, nearby bus stops, and direct municipal feedback.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-on-surface">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                  <span>Interactive Real-time Map View</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                  <span>Seat Availability Barometer</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                  <span>Walking Directions to Stops</span>
                </li>
              </ul>
            </div>
            <Link
              to="/passenger"
              className="mt-6 w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-primary-fixed-dim transition shadow-md"
            >
              <span>Explore Passenger Portal</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Driver Cockpit */}
          <div className="p-6 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex flex-col justify-between hover:border-secondary/60 transition-all group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/20 text-secondary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[28px]">badge</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Driver Telemetry Cockpit</h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Active trip heads-up console, target stop distance &amp; ETA countdown, live speedometer gauge with speed alerts, and passenger boarding count.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-on-surface">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                  <span>Waypoint Navigation &amp; ETA Clock</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                  <span>Digital Telemetry Speedometer</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                  <span>1-Tap Next Stop Dispatch</span>
                </li>
              </ul>
            </div>
            <Link
              to="/driver"
              className="mt-6 w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-secondary-fixed transition shadow-md"
            >
              <span>Launch Driver Console</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Admin Dispatch */}
          <div className="p-6 rounded-2xl bg-surface-container-high border border-outline-variant/40 flex flex-col justify-between hover:border-error/60 transition-all group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-error-container/20 text-error flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">Admin Dispatch Command</h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Full fleet oversight, interactive geospatial multi-unit positioning, emergency public broadcast dispatcher, driver rosters, and trip reports.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-on-surface">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                  <span>Fleet Management &amp; Driver Rosters</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                  <span>Public Emergency Broadcast System</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
                  <span>Live Feedback &amp; Complaint Triage</span>
                </li>
              </ul>
            </div>
            <Link
              to="/admin"
              className="mt-6 w-full py-2.5 rounded-xl bg-error text-on-error font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-error/90 transition shadow-md"
            >
              <span>Open Admin Dispatch</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
