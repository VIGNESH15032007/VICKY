import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MOCK_BUSES, generateSeatsData } from '../../data/mockData';
import Modal from '../../components/common/Modal';

export default function SeatAvailabilityPage() {
  const [searchParams] = useSearchParams();
  const selectedBusId = searchParams.get('bus') || '42B';
  const bus = MOCK_BUSES.find((b) => b.id === selectedBusId) || MOCK_BUSES[0];

  const [seats, setSeats] = useState(generateSeatsData());
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState('4s ago');

  const availableCount = seats.filter((s) => !s.isOccupied).length;
  const occupiedCount = seats.filter((s) => s.isOccupied).length;
  const totalCount = seats.length;
  const loadPercentage = ((occupiedCount / totalCount) * 100).toFixed(1);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSync('Just now');
    }, 700);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 md:px-8 max-w-4xl mx-auto space-y-5">
      {/* Top Header & Bus Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
            Seat Availability Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant flex items-center gap-1.5 mt-0.5">
            <span className="material-symbols-outlined text-[16px] text-primary">directions_bus</span>
            <span>Bus {bus.id} • {bus.name} ({bus.type})</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Bus Switcher */}
          <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-surface-container">
            {MOCK_BUSES.slice(0, 3).map((b) => (
              <Link
                key={b.id}
                to={`/passenger/seat-availability?bus=${b.id}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  b.id === bus.id ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {b.id}
              </Link>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            aria-label="Refresh telemetry"
            className="w-10 h-10 rounded-xl bg-surface-container-high border border-surface-container flex items-center justify-center text-on-surface hover:bg-surface-bright transition active:scale-95 shadow-sm"
          >
            <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? 'animate-spin' : ''}`}>
              autorenew
            </span>
          </button>
        </div>
      </div>

      {/* Live Status Pill */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-container-low border border-surface-container shadow-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
          </span>
          <span className="text-xs font-semibold text-tertiary uppercase tracking-wider">Live Ceiling LIDAR &amp; IR Telemetry</span>
        </div>
        <span className="text-xs font-mono text-outline">Updated {lastSync}</span>
      </div>

      {/* 4-Metric Bento Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-[11px] text-on-surface-variant font-medium">Total Cabin</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-on-surface">{totalCount}</span>
            <span className="text-[10px] text-outline block">Seats capacity</span>
          </div>
        </div>

        {/* Free Seats */}
        <div className="p-3.5 rounded-xl bg-surface-container-high border border-primary/40 shadow-md shadow-primary/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-primary font-bold">Free Seats</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          </div>
          <div className="mt-1">
            <span className="text-xl font-extrabold text-primary">{availableCount}</span>
            <span className="text-[10px] text-primary/80 block">Open right now</span>
          </div>
        </div>

        {/* Occupied */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-[11px] text-on-surface-variant font-medium">Occupied</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-outline">{occupiedCount}</span>
            <span className="text-[10px] text-outline block">Active commuters</span>
          </div>
        </div>

        {/* Load % */}
        <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
          <span className="text-[11px] text-on-surface-variant font-medium">Capacity Load</span>
          <div className="mt-1">
            <span className="text-xl font-bold text-on-surface">{loadPercentage}%</span>
            <div className="w-full bg-surface-container-highest rounded-full h-1 mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${Number(loadPercentage) > 75 ? 'bg-amber-400' : 'bg-primary'}`}
                style={{ width: `${loadPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Sensor Info Card */}
      <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-surface-container-low border border-surface-container">
        <div className="flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-primary-container shadow-[0_0_8px_rgba(208,188,255,0.4)]"></span>
            <span className="text-on-surface font-semibold">Available ({availableCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-surface-container-highest"></span>
            <span className="text-outline font-semibold">Occupied ({occupiedCount})</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-tertiary">accessible</span>
            <span className="font-semibold">Priority Accessibility (Row 1)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-surface-container text-outline text-[11px]">
          <span className="material-symbols-outlined text-[16px]">sensors</span>
          <span>Read-only automated occupancy map. Non-reservable municipal fleet. Updated real-time.</span>
        </div>
      </div>

      {/* Cinema / Theater Bus Seating Visualization Canvas */}
      <div className="w-full rounded-2xl bg-surface-container-lowest border border-surface-container-high p-4 sm:p-6 shadow-2xl relative">
        {/* Windshield / Front Header Indicator */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="flex items-center gap-1.5 text-primary/70 text-xs font-bold tracking-widest uppercase mb-1">
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            <span>Front of Bus • Windshield</span>
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
          </div>
          <div className="w-3/4 max-w-xs h-2.5 rounded-t-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
        </div>

        {/* Cabin Front Infrastructure (Driver Pod & Entry Door) */}
        <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-xl bg-surface-container-low border border-surface-container">
          {/* Driver Pod */}
          <div className="flex items-center gap-2.5 bg-surface-container rounded-lg p-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">sports_motorsports</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-outline uppercase tracking-wider block">Operator Cabin</span>
              <span className="text-xs font-bold text-on-surface truncate block">{bus.driver.name}</span>
            </div>
          </div>

          {/* Boarding Door */}
          <div className="flex items-center justify-end gap-2.5 bg-surface-container rounded-lg p-2.5 text-right">
            <div className="min-w-0">
              <span className="text-[10px] text-tertiary uppercase tracking-wider block">Boarding Gate</span>
              <span className="text-xs font-bold text-on-surface truncate block">Front Door</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-[18px]">contactless</span>
            </div>
          </div>
        </div>

        {/* Aisle Subtitle Indicator */}
        <div className="flex justify-between items-center px-4 mb-3 text-[10px] font-bold text-outline tracking-widest uppercase">
          <span>Left Bay (Window / Aisle)</span>
          <span className="text-primary/70">Aisle Walkway</span>
          <span>Right Bay (Aisle / Window)</span>
        </div>

        {/* Seating Layout Canvas */}
        <div className="flex flex-col gap-2.5 relative max-w-md mx-auto">
          {/* Glowing Center Aisle Spine */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-12 w-1 bg-gradient-to-b from-primary/10 via-primary/25 to-primary/10 rounded-full pointer-events-none"></div>

          {/* Render Rows 1 to 9 */}
          {Array.from({ length: 9 }).map((_, rIdx) => {
            const rowNumber = rIdx + 1;
            const rowSeats = seats.filter((s) => s.row === rowNumber);
            const leftSeats = rowSeats.filter((s) => s.side === 'left');
            const rightSeats = rowSeats.filter((s) => s.side === 'right');

            return (
              <div key={rowNumber} className="flex items-center justify-between">
                {/* Left 2 seats */}
                <div className="flex items-center gap-2">
                  {leftSeats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => setSelectedSeat(seat)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                        seat.isOccupied
                          ? 'bg-surface-container-highest text-outline hover:bg-surface-container'
                          : seat.isPriority
                          ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(160,120,255,0.5)] hover:scale-105'
                          : 'bg-primary text-on-primary shadow-md hover:scale-105'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono">{seat.number}</span>
                      {seat.isPriority && (
                        <span className="material-symbols-outlined text-[11px] -mt-1">accessible</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Center Row Indicator */}
                <span className="text-[10px] font-mono text-outline/60">R{rowNumber}</span>

                {/* Right 2 seats */}
                <div className="flex items-center gap-2">
                  {rightSeats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => setSelectedSeat(seat)}
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                        seat.isOccupied
                          ? 'bg-surface-container-highest text-outline hover:bg-surface-container'
                          : seat.isPriority
                          ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(160,120,255,0.5)] hover:scale-105'
                          : 'bg-primary text-on-primary shadow-md hover:scale-105'
                      }`}
                    >
                      <span className="text-xs font-bold font-mono">{seat.number}</span>
                      {seat.isPriority && (
                        <span className="material-symbols-outlined text-[11px] -mt-1">accessible</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Row 10: Rear Bench (6 seats) */}
          <div className="pt-2 border-t border-surface-container mt-2">
            <span className="block text-center text-[10px] text-outline uppercase tracking-wider mb-2">Rear Passenger Bench</span>
            <div className="flex items-center justify-between gap-1.5">
              {seats.filter((s) => s.row === 10).map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => setSelectedSeat(seat)}
                  className={`flex-1 h-10 rounded-xl flex flex-col items-center justify-center transition-all ${
                    seat.isOccupied
                      ? 'bg-surface-container-highest text-outline hover:bg-surface-container'
                      : 'bg-primary text-on-primary shadow-md hover:scale-105'
                  }`}
                >
                  <span className="text-xs font-bold font-mono">{seat.number}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Seat Inspector Modal */}
      <Modal
        isOpen={!!selectedSeat}
        onClose={() => setSelectedSeat(null)}
        title={selectedSeat ? `Seat #${selectedSeat.number} Telemetry` : ''}
      >
        {selectedSeat && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-surface-container">
              <div>
                <span className="text-xs text-on-surface-variant block">Seat Position</span>
                <span className="text-base font-bold text-on-surface capitalize">
                  {selectedSeat.position} • {selectedSeat.side} Bay (Row {selectedSeat.row})
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-on-surface-variant block">Sensor Status</span>
                <span className={`text-sm font-bold ${selectedSeat.isOccupied ? 'text-outline' : 'text-tertiary'}`}>
                  {selectedSeat.isOccupied ? 'Occupied' : 'Open / Available'}
                </span>
              </div>
            </div>

            {selectedSeat.isPriority && (
              <div className="p-3 rounded-xl bg-primary-container/20 border border-primary/40 text-primary flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px]">accessible</span>
                <span className="text-xs font-semibold">Priority Accessible Seating (Reserved for elderly/disabled/parents).</span>
              </div>
            )}

            <div className="text-xs text-on-surface-variant leading-relaxed">
              Ceiling IR LIDAR ping indicates seat is currently <strong>{selectedSeat.isOccupied ? 'detected with passenger weight signature' : 'clear and open for boarding'}</strong> at upcoming stop <strong>{bus.nextStop}</strong>.
            </div>

            <button
              onClick={() => setSelectedSeat(null)}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs"
            >
              Done
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
