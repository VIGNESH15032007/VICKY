import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_BUSES, MOCK_ROUTES } from '../../data/mockData';
import Badge from '../../components/common/Badge';

export default function BusDetailsPage() {
  const { id } = useParams();
  const bus = MOCK_BUSES.find((b) => b.id === id) || MOCK_BUSES[0];
  const route = MOCK_ROUTES.find((r) => r.id === bus.routeId) || MOCK_ROUTES[0];

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary font-black text-2xl flex items-center justify-center shadow-lg">
            {bus.id}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-on-surface">{bus.name}</h1>
              <Badge status={bus.status} text={bus.status === 'ON_TIME' ? 'On Schedule' : bus.statusText} />
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">{bus.routeName} • {bus.type}</p>
            <p className="text-xs font-mono text-outline mt-1">Plate: {bus.plateNumber} • Chassis: {bus.model}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/passenger/live-tracking?bus=${bus.id}`}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-2 shadow-md hover:bg-primary-fixed-dim transition"
          >
            <span className="material-symbols-outlined text-[18px]">radar</span>
            <span>Live Track</span>
          </Link>
          <Link
            to={`/passenger/seat-availability?bus=${bus.id}`}
            className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-bright text-primary text-xs font-bold border border-primary/30 transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">airline_seat_recline_normal</span>
            <span>Seats ({bus.occupancy.available})</span>
          </Link>
        </div>
      </div>

      {/* Key Telemetry Metrics Grid (4 items) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Next Stop</span>
          <div className="mt-2">
            <span className="text-base font-bold text-on-surface block truncate">{bus.nextStop}</span>
            <span className="text-xs text-tertiary font-semibold">{bus.eta} away</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Speedometer</span>
          <div className="mt-2">
            <span className="text-base font-bold text-on-surface font-mono">{bus.speed} km/h</span>
            <span className="text-xs text-outline">Limit: {bus.speedLimit} km/h</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Occupancy</span>
          <div className="mt-2">
            <span className="text-base font-bold text-primary">{bus.occupancy.available} Free</span>
            <span className="text-xs text-outline">{bus.occupancy.total} Total Seats</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">Battery Power</span>
          <div className="mt-2">
            <span className="text-base font-bold text-tertiary font-mono">{bus.telemetry.battery}</span>
            <span className="text-xs text-outline">Range ~180km</span>
          </div>
        </div>
      </div>

      {/* Driver Cockpit Profile Card */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={bus.driver.avatar}
            alt={bus.driver.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/40 shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-on-surface">{bus.driver.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono">
                {bus.driver.id}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">Shift: {bus.driver.shift} • Rating: ★ {bus.driver.rating}</p>
          </div>
        </div>

        <Link
          to={`/passenger/feedback?bus=${bus.id}`}
          className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-xs font-semibold text-primary transition shrink-0"
        >
          Rate Driver
        </Link>
      </div>

      {/* Complete Route Stops */}
      <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-on-surface text-base">Full Corridor Schedule ({route.name})</h3>
          <span className="text-xs text-outline">{route.distance} • {route.duration}</span>
        </div>

        <div className="space-y-3">
          {route.stops.map((stop, i) => (
            <div key={stop.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-surface-container-highest text-outline flex items-center justify-center font-mono text-[11px]">
                  {i + 1}
                </span>
                <span className={`font-semibold ${stop.status === 'current' ? 'text-primary font-bold' : 'text-on-surface'}`}>
                  {stop.name}
                </span>
                {stop.status === 'current' && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    Current Stop
                  </span>
                )}
              </div>
              <span className="font-mono text-on-surface-variant">{stop.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
