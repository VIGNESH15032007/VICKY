import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { MOCK_REPORTS } from '../../data/mockData';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    busCount: 0,
    routeCount: 0,
    tripCount: 0,
    feedbackCount: 0,
  });

  useEffect(() => {
    async function loadStats() {
      if (!isSupabaseConfigured()) return;
      try {
        const [busesRes, routesRes, tripsRes, feedbackRes] = await Promise.all([
          supabase.from('buses').select('*', { count: 'exact', head: true }),
          supabase.from('routes').select('*', { count: 'exact', head: true }),
          supabase.from('trips').select('*', { count: 'exact', head: true }),
          supabase.from('feedback').select('*', { count: 'exact', head: true }),
        ]);

        setStats({
          busCount: busesRes.count || 0,
          routeCount: routesRes.count || 0,
          tripCount: tripsRes.count || 0,
          feedbackCount: feedbackRes.count || 0,
        });
      } catch (e) {
        console.warn('Error loading report stats:', e);
      }
    }
    loadStats();
  }, []);

  const weeklyData = MOCK_REPORTS?.ridershipWeekly || [];
  const maxWeekly = weeklyData.length > 0 ? Math.max(...weeklyData.map((d) => d.count || 1)) : 1000;

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Transit Analytics &amp; Reports
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
          Civic mobility telemetry trends, ridership volume, and on-time performance metrics.
        </p>
      </div>

      {/* Database Telemetry KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest">
          <span className="text-xs text-on-surface-variant font-medium">Buses in Database</span>
          <span className="text-2xl font-black text-on-surface block mt-1">{stats.busCount}</span>
          <span className="text-[10px] text-tertiary">Fleet Registry</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest">
          <span className="text-xs text-on-surface-variant font-medium">Active Corridors</span>
          <span className="text-2xl font-black text-primary block mt-1">{stats.routeCount}</span>
          <span className="text-[10px] text-primary">Lines Mapped</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest">
          <span className="text-xs text-on-surface-variant font-medium">Recorded Trips</span>
          <span className="text-2xl font-black text-secondary block mt-1">{stats.tripCount}</span>
          <span className="text-[10px] text-secondary">Logged in DB</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest">
          <span className="text-xs text-on-surface-variant font-medium">Passenger Feedback</span>
          <span className="text-2xl font-black text-amber-400 block mt-1">{stats.feedbackCount}</span>
          <span className="text-[10px] text-amber-400">Total Tickets</span>
        </div>
      </div>

      {/* Environmental & Efficiency Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant font-medium block">Weekly CO₂ Offset</span>
            <span className="text-2xl font-black text-tertiary mt-1 block">{MOCK_REPORTS?.co2OffsetKg || '4,280'} kg</span>
            <span className="text-[10px] text-outline">Vs. private car equivalent</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">eco</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant font-medium block">Electric Fleet Share</span>
            <span className="text-2xl font-black text-primary mt-1 block">{MOCK_REPORTS?.electricFleetShare || '65%'}</span>
            <span className="text-[10px] text-outline">Target: 80% by 2027</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">electric_meter</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant font-medium block">Average Headway</span>
            <span className="text-2xl font-black text-secondary mt-1 block">{MOCK_REPORTS?.avgHeadwayMin || 12} min</span>
            <span className="text-[10px] text-outline">Peak hour corridor average</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">schedule</span>
          </div>
        </div>
      </div>

      {/* Weekly Ridership Chart */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-on-surface">Weekly Ridership Volume</h2>
            <p className="text-xs text-on-surface-variant">Daily passenger counts across all municipal corridors</p>
          </div>
          <span className="text-xs font-mono font-bold text-primary">103,970 Total Riders</span>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6 pb-2 grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 border-b border-surface-container">
          {weeklyData.map((item) => {
            const heightPct = Math.max(8, Math.min(100, Math.round(((item.count || 0) / maxWeekly) * 100)));

            return (
              <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-mono text-outline opacity-0 group-hover:opacity-100 transition-opacity">
                  {((item.count || 0) / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full max-w-[42px] bg-primary rounded-t-xl group-hover:bg-primary/80 transition-all shadow-md shadow-primary/20"
                  style={{ height: `${heightPct}%` }}
                ></div>
                <span className="text-xs font-semibold text-on-surface-variant">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly On-Time Trend Grid */}
      <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-container shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-bold text-on-surface">Punctuality by Hour of Day</h2>
          <p className="text-xs text-on-surface-variant">On-time arrival percentage across peak and off-peak runs</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {(MOCK_REPORTS?.onTimeTrend || []).map((t) => (
            <div key={t.time} className="p-3 rounded-xl bg-surface-container text-center border border-surface-container-high">
              <span className="text-[11px] font-mono text-outline block">{t.time}</span>
              <strong className={`text-sm font-bold block mt-1 ${t.rate > 92 ? 'text-tertiary' : 'text-amber-400'}`}>
                {t.rate}%
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
