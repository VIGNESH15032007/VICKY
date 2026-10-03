import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import PassengerBottomNav from '../components/passenger/PassengerBottomNav';

export default function PassengerLayout() {
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/passenger':
        return { title: 'Passenger Dashboard', subtitle: 'Dashboard' };
      case '/passenger/search':
        return { title: 'Bus & Route Search', subtitle: 'Search' };
      case '/passenger/live-tracking':
        return { title: 'Live Bus Tracking', subtitle: 'Live Track' };
      case '/passenger/seat-availability':
        return { title: 'Seat Availability Telemetry', subtitle: 'Seat Map' };
      case '/passenger/nearby-stops':
        return { title: 'Nearby Bus Stops', subtitle: 'Stops Radar' };
      case '/passenger/notifications':
        return { title: 'Transit Alerts & Notices', subtitle: 'Alerts' };
      case '/passenger/feedback':
        return { title: 'Bus & Service Feedback', subtitle: 'Feedback' };
      default:
        if (location.pathname.includes('/bus/')) return { title: 'Bus Details', subtitle: 'Fleet Telemetry', showBack: true };
        if (location.pathname.includes('/route/')) return { title: 'Route Details', subtitle: 'Corridor Schedule', showBack: true };
        return { title: 'Passenger Portal', subtitle: 'Commuter' };
    }
  };

  const { title, subtitle, showBack } = getPageInfo();

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      <Header title={title} subtitle={subtitle} showBack={showBack} />

      {/* Desktop Sub-Header Navigation */}
      <div className="hidden md:block fixed top-16 md:top-18 inset-x-0 z-40 bg-surface/80 backdrop-blur-md border-b border-surface-container-high/40 py-2.5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Passenger Corridors</span>
            <span className="text-outline text-xs">•</span>
            <span className="text-xs text-on-surface-variant">Oakridge Smart Zone</span>
          </div>
          <PassengerBottomNav />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 md:pt-32 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile Bottom Dock */}
      <PassengerBottomNav />
    </div>
  );
}
