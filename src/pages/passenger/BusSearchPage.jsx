import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MOCK_BUSES, MOCK_ROUTES } from '../../data/mockData';
import Badge from '../../components/common/Badge';

export default function BusSearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'All Corridors' },
    { id: 'Express', label: 'Express Lines' },
    { id: 'Circular', label: 'Circular Ring' },
    { id: 'Shuttle', label: 'Shuttles' },
    { id: 'Regional', label: 'Regional' }
  ];

  const filteredBuses = useMemo(() => {
    return MOCK_BUSES.filter((bus) => {
      const matchesCategory = activeCategory === 'ALL' || bus.category === activeCategory;
      const q = query.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        bus.id.toLowerCase().includes(q) ||
        bus.name.toLowerCase().includes(q) ||
        bus.routeName.toLowerCase().includes(q) ||
        bus.origin.toLowerCase().includes(q) ||
        bus.destination.toLowerCase().includes(q) ||
        bus.currentStop.toLowerCase().includes(q) ||
        bus.nextStop.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-5">
      {/* Search Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Find Bus &amp; Route Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Search small city transit corridors by line code, destination, or current stop.
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="relative flex items-center w-full rounded-2xl bg-surface-container-low border border-surface-container shadow-lg focus-within:border-primary/60 transition-all">
        <div className="pl-4 pr-2 flex items-center pointer-events-none text-primary">
          <span className="material-symbols-outlined text-[24px]">search</span>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by bus # (e.g. 42B), stop, or destination..."
          className="w-full py-3.5 bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="mr-3 p-1 rounded-full text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Filter Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-primary text-on-primary font-bold shadow-md shadow-primary/20'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
        <span>Found <strong className="text-primary font-bold">{filteredBuses.length}</strong> active transit vehicles</span>
        <span className="font-mono">Live GPS feed 1.2s refresh</span>
      </div>

      {/* Bus Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuses.map((bus) => (
          <div
            key={bus.id}
            className="rounded-2xl p-5 bg-surface-container-low border border-surface-container hover:border-primary/50 hover:bg-surface-container transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary-container text-on-primary font-extrabold text-lg flex items-center justify-center shadow-md">
                    {bus.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-base">{bus.name}</h3>
                    <p className="text-xs text-on-surface-variant">{bus.routeName}</p>
                    <span className="text-[10px] text-outline">{bus.type}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-tertiary">{bus.eta}</div>
                  <Badge status={bus.status} text={bus.status === 'ON_TIME' ? 'On Time' : bus.statusText} size="sm" />
                </div>
              </div>

              {/* Waypoints & Occupancy Strip */}
              <div className="mt-4 p-3 rounded-xl bg-surface-container-lowest/70 border border-surface-container space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">trip_origin</span>
                    <span className="truncate">{bus.origin}</span>
                  </div>
                  <span className="material-symbols-outlined text-[14px] text-outline">arrow_forward</span>
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-secondary">flag</span>
                    <span className="truncate">{bus.destination}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-container">
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[15px] text-primary">navigation</span>
                    <span>Approaching: <strong className="text-on-surface font-semibold">{bus.nextStop}</strong></span>
                  </div>
                  <div className="text-tertiary font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">airline_seat_recline_normal</span>
                    <span>{bus.occupancy.available} Seats Open</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bus.occupancy.percentage > 80 ? 'bg-amber-400' : 'bg-tertiary'}`}
                    style={{ width: `${bus.occupancy.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-surface-container">
              <Link
                to={`/passenger/bus/${bus.id}`}
                className="py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-semibold text-center text-on-surface transition"
              >
                Details
              </Link>
              <Link
                to={`/passenger/seat-availability?bus=${bus.id}`}
                className="py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-semibold text-center text-primary transition"
              >
                Seats ({bus.occupancy.available})
              </Link>
              <Link
                to={`/passenger/live-tracking?bus=${bus.id}`}
                className="py-2 rounded-xl bg-primary text-on-primary text-xs font-bold text-center flex items-center justify-center gap-1 hover:bg-primary-fixed-dim transition shadow-md"
              >
                <span className="material-symbols-outlined text-[15px]">radar</span>
                <span>Track</span>
              </Link>
            </div>
          </div>
        ))}

        {filteredBuses.length === 0 && (
          <div className="col-span-full py-12 text-center rounded-2xl bg-surface-container p-6">
            <span className="material-symbols-outlined text-[42px] text-outline mb-2">directions_bus</span>
            <h3 className="text-base font-bold text-on-surface">No matching buses found</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
              Try searching with another keyword like "42B", "Express", "Hospital" or reset your category filters.
            </p>
            <button
              onClick={() => { setQuery(''); setActiveCategory('ALL'); }}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
