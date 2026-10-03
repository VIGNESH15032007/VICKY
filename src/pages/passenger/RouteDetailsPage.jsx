import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_ROUTES, MOCK_BUSES } from '../../data/mockData';

export default function RouteDetailsPage() {
  const { id } = useParams();
  const route = MOCK_ROUTES.find((r) => r.id === id) || MOCK_ROUTES[0];
  const [direction, setDirection] = useState('outbound');

  const activeBuses = MOCK_BUSES.filter((b) => b.routeId === route.id || b.id === '42B');

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8 max-w-5xl mx-auto space-y-6">
      {/* Route Header Banner */}
      <div className="p-6 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary font-black text-xl flex flex-col items-center justify-center shadow-lg">
            <span>{route.code}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider">Line</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-on-surface">{route.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-container/30 text-tertiary text-xs font-bold">
                Active
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {route.origin} ↔ {route.destination}
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-outline mt-2 flex-wrap">
              <span>Distance: <strong className="text-on-surface">{route.distance}</strong></span>
              <span>•</span>
              <span>Trip Time: <strong className="text-on-surface">{route.duration}</strong></span>
              <span>•</span>
              <span>Headway: <strong className="text-primary">{route.frequency}</strong></span>
              <span>•</span>
              <span>Fare: <strong className="text-tertiary">{route.fare}</strong></span>
            </div>
          </div>
        </div>

        {/* Direction Switcher */}
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-surface-container-high">
          <button
            onClick={() => setDirection('outbound')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              direction === 'outbound' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
            }`}
          >
            Outbound
          </button>
          <button
            onClick={() => setDirection('inbound')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              direction === 'inbound' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
            }`}
          >
            Inbound
          </button>
        </div>
      </div>

      {/* Active Fleet on this Corridor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">directions_bus</span>
            <span>Active Buses on this Line ({activeBuses.length})</span>
          </h2>
          <span className="text-xs text-tertiary font-mono">Real-time GPS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeBuses.map((bus) => (
            <div key={bus.id} className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center">
                  {bus.id}
                </div>
                <div>
                  <span className="font-bold text-on-surface text-sm block">{bus.name}</span>
                  <span className="text-xs text-on-surface-variant">At {bus.currentStop}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-tertiary block">{bus.eta}</span>
                <Link
                  to={`/passenger/live-tracking?bus=${bus.id}`}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Track on Map →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stop by Stop Detailed Timeline */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface-container-low border border-surface-container space-y-4">
        <h3 className="font-bold text-on-surface text-base">Route Waypoint Schedule</h3>

        <div className="relative pl-6 space-y-4">
          <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-primary/40"></div>

          {route.stops.map((stop, i) => (
            <div key={stop.id} className="relative flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="absolute -left-6 w-5 h-5 rounded-full bg-surface-container-high border-2 border-primary flex items-center justify-center font-mono text-[10px] text-primary font-bold">
                  {i + 1}
                </span>
                <div>
                  <span className="font-bold text-on-surface text-sm block">{stop.name}</span>
                  <span className="text-[11px] text-outline">Waypoint distance: {stop.distance}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-on-surface font-semibold block">{stop.time}</span>
                <span className="text-[10px] text-tertiary">Scheduled</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
