import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_STOPS } from '../../data/mockData';

export default function NearbyBusStopsPage() {
  const [pinnedStops, setPinnedStops] = useState(['ST01']);
  const [directionsModal, setDirectionsModal] = useState(null);

  const togglePin = (stopId) => {
    if (pinnedStops.includes(stopId)) {
      setPinnedStops(pinnedStops.filter((id) => id !== stopId));
    } else {
      setPinnedStops([...pinnedStops, stopId]);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          <span className="text-xs font-semibold text-tertiary uppercase tracking-wider">Device GPS Geo-Located</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Nearby Bus Stops &amp; Hubs
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Transit nodes within walking radius in Oakridge &amp; Riverdale municipal zones.
        </p>
      </div>

      {/* Radar Map Preview Pill */}
      <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">radar</span>
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface block">GPS Geo-Radar Active</span>
            <span className="text-[11px] text-on-surface-variant">Showing 4 bus stops within 1.5 km radius</span>
          </div>
        </div>
        <span className="text-xs text-secondary font-mono font-bold">Accuracy: ±2m</span>
      </div>

      {/* Stops List */}
      <div className="space-y-4">
        {MOCK_STOPS.map((stop) => {
          const isPinned = pinnedStops.includes(stop.id);

          return (
            <div
              key={stop.id}
              className="p-5 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[24px]">signpost</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-on-surface">{stop.name}</h3>
                      {isPinned && (
                        <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant">{stop.zone}</span>
                    <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-primary">
                      <span className="material-symbols-outlined text-[15px]">near_me</span>
                      <span>{stop.distance} • {stop.walkTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePin(stop.id)}
                    aria-label="Pin stop"
                    className={`p-2 rounded-xl border transition ${
                      isPinned
                        ? 'bg-secondary-container/30 border-secondary text-secondary'
                        : 'bg-surface-container border-outline-variant/30 text-outline hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isPinned ? 'star' : 'star_border'}
                    </span>
                  </button>
                  <button
                    onClick={() => alert(`Starting turn-by-turn walking route to ${stop.name} (${stop.distance}).`)}
                    className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-primary-fixed-dim transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">directions_walk</span>
                    <span className="hidden sm:inline">Directions</span>
                  </button>
                </div>
              </div>

              {/* Stop Amenities */}
              <div className="flex items-center gap-2 flex-wrap">
                {stop.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-surface-container text-outline text-[11px] font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>

              {/* Incoming Arrivals Table */}
              <div className="p-3.5 rounded-xl bg-surface-container-lowest/80 border border-surface-container space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
                  Next Approaching Arrivals
                </span>
                <div className="space-y-1.5">
                  {stop.arrivals.map((arr, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-surface-container-highest/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary font-bold text-[11px]">
                          {arr.bus}
                        </span>
                        <span className="text-on-surface font-medium">{arr.route}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-on-surface-variant font-mono">{arr.load} load</span>
                        <span className="font-bold text-tertiary">{arr.eta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
