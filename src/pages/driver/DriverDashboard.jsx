import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_BUSES, MOCK_DRIVERS } from '../../data/mockData';

export default function DriverDashboard() {
  const driver = MOCK_DRIVERS[0]; // Marcus Vance
  const bus = MOCK_BUSES.find((b) => b.id === driver.busId) || MOCK_BUSES[0];

  const [checklist, setChecklist] = useState({
    brakes: true,
    lidar: true,
    doors: true,
    battery: true
  });

  const allPassed = Object.values(checklist).every(Boolean);

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8 max-w-5xl mx-auto space-y-6">
      {/* Operator Welcome Cockpit Header */}
      <div className="p-6 rounded-2xl bg-surface-container-high border border-secondary/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
            alt="Marcus Vance"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-secondary/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-on-surface">{driver.name}</h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                {driver.id}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Assigned Vehicle: <strong className="text-primary font-bold">Bus #{bus.id}</strong> ({bus.model})
            </p>
            <p className="text-xs font-mono text-outline mt-1">
              Active Shift: {driver.shiftTime} • Safety Score: <span className="text-tertiary font-bold">{driver.safetyScore}</span>
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <Link
          to="/driver/active-trip"
          className="px-6 py-3 rounded-xl bg-primary text-on-primary font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/30 hover:bg-primary-fixed-dim active:scale-95 transition"
        >
          <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
          <span>Launch Active Trip Cockpit</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>

      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-medium">Completed Runs</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-on-surface font-mono">{driver.tripsToday}</span>
            <span className="text-[10px] text-tertiary block mt-0.5 font-semibold">100% on schedule</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-medium">Average Speed</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-on-surface font-mono">{driver.speedAvg}</span>
            <span className="text-[10px] text-outline block mt-0.5">Urban speed cap 45 km/h</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-medium">Passenger Rating</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-400 font-mono">★ {driver.rating}</span>
            <span className="text-[10px] text-outline block mt-0.5">From 48 reviews</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-xs text-on-surface-variant font-medium">Battery Pack</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-tertiary font-mono">{bus.telemetry.battery}</span>
            <span className="text-[10px] text-outline block mt-0.5">Est. range ~180 km</span>
          </div>
        </div>
      </div>

      {/* Vehicle Pre-Departure Checklist */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-on-surface">Vehicle Telemetry Checklist (Bus #{bus.id})</h2>
            <p className="text-xs text-on-surface-variant">Verify before initiating municipal corridor run</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            allPassed ? 'bg-tertiary-container/30 text-tertiary' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {allPassed ? 'All Systems Verified' : 'Checklist Incomplete'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container border border-surface-container-high cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.brakes}
              onChange={(e) => setChecklist({ ...checklist, brakes: e.target.checked })}
              className="w-4 h-4 rounded text-tertiary focus:ring-0"
            />
            <div className="flex flex-col text-xs">
              <span className="font-bold text-on-surface">Brake Hydraulics &amp; Pneumatics</span>
              <span className="text-on-surface-variant text-[11px]">Pressure nominal at 8.2 bar</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container border border-surface-container-high cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.lidar}
              onChange={(e) => setChecklist({ ...checklist, lidar: e.target.checked })}
              className="w-4 h-4 rounded text-tertiary focus:ring-0"
            />
            <div className="flex flex-col text-xs">
              <span className="font-bold text-on-surface">Ceiling LIDAR &amp; IR Sensors</span>
              <span className="text-on-surface-variant text-[11px]">All 42 seat sensors communicating</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container border border-surface-container-high cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.doors}
              onChange={(e) => setChecklist({ ...checklist, doors: e.target.checked })}
              className="w-4 h-4 rounded text-tertiary focus:ring-0"
            />
            <div className="flex flex-col text-xs">
              <span className="font-bold text-on-surface">Step-Free Entry &amp; Ramps</span>
              <span className="text-on-surface-variant text-[11px]">Hydraulic low-floor ramp operable</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container border border-surface-container-high cursor-pointer select-none">
            <input
              type="checkbox"
              checked={checklist.battery}
              onChange={(e) => setChecklist({ ...checklist, battery: e.target.checked })}
              className="w-4 h-4 rounded text-tertiary focus:ring-0"
            />
            <div className="flex flex-col text-xs">
              <span className="font-bold text-on-surface">GPS Transmitter &amp; Antennas</span>
              <span className="text-on-surface-variant text-[11px]">Lock confirmed ±1.5m accuracy</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
