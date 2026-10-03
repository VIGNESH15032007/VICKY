import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import PassengerLayout from '../layouts/PassengerLayout';
import AdminLayout from '../layouts/AdminLayout';
import DriverLayout from '../layouts/DriverLayout';

// Route Protection
import RoleProtectedRoute from './RoleProtectedRoute';

// Public & Auth Pages
import LandingPage from '../pages/public/LandingPage';
import CommonLoginPage from '../pages/auth/CommonLoginPage';
import RegistrationPage from '../pages/auth/RegistrationPage';

// Passenger Pages
import PassengerDashboard from '../pages/passenger/PassengerDashboard';
import BusSearchPage from '../pages/passenger/BusSearchPage';
import LiveBusTrackingPage from '../pages/passenger/LiveBusTrackingPage';
import BusDetailsPage from '../pages/passenger/BusDetailsPage';
import SeatAvailabilityPage from '../pages/passenger/SeatAvailabilityPage';
import RouteDetailsPage from '../pages/passenger/RouteDetailsPage';
import NearbyBusStopsPage from '../pages/passenger/NearbyBusStopsPage';
import NotificationsPage from '../pages/passenger/NotificationsPage';
import FeedbackPage from '../pages/passenger/FeedbackPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import BusManagementPage from '../pages/admin/BusManagementPage';
import DriverManagementPage from '../pages/admin/DriverManagementPage';
import RouteManagementPage from '../pages/admin/RouteManagementPage';
import LiveBusMonitoringPage from '../pages/admin/LiveBusMonitoringPage';
import TripHistoryPage from '../pages/admin/TripHistoryPage';
import ReportsPage from '../pages/admin/ReportsPage';
import PassengerFeedbackAdminPage from '../pages/admin/PassengerFeedbackAdminPage';

// Driver Pages
import DriverDashboard from '../pages/driver/DriverDashboard';
import ActiveTripPage from '../pages/driver/ActiveTripPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public & Authentication Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<CommonLoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
      </Route>

      {/* Passenger Portal Routes - Protected for Commuters & Admins */}
      <Route element={<RoleProtectedRoute allowedRoles={['passenger', 'admin']} />}>
        <Route path="/passenger" element={<PassengerLayout />}>
          <Route index element={<PassengerDashboard />} />
          <Route path="search" element={<BusSearchPage />} />
          <Route path="live-tracking" element={<LiveBusTrackingPage />} />
          <Route path="live-tracking/:busId" element={<LiveBusTrackingPage />} />
          <Route path="tracking/:busId" element={<LiveBusTrackingPage />} />
          <Route path="bus/:id" element={<BusDetailsPage />} />
          <Route path="seat-availability" element={<SeatAvailabilityPage />} />
          <Route path="route/:id" element={<RouteDetailsPage />} />
          <Route path="nearby-stops" element={<NearbyBusStopsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>
      </Route>

      {/* Admin Dispatch Portal Routes - Strictly Protected for Admin Role Only */}
      <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="buses" element={<BusManagementPage />} />
          <Route path="drivers" element={<DriverManagementPage />} />
          <Route path="routes" element={<RouteManagementPage />} />
          <Route path="live-monitoring" element={<LiveBusMonitoringPage />} />
          <Route path="trips" element={<TripHistoryPage />} />
          <Route path="trip-history" element={<TripHistoryPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="feedback" element={<PassengerFeedbackAdminPage />} />
        </Route>
      </Route>

      {/* Driver Cockpit Portal Routes - Strictly Protected for Driver & Admin */}
      <Route element={<RoleProtectedRoute allowedRoles={['driver', 'admin']} />}>
        <Route path="/driver" element={<DriverLayout />}>
          <Route index element={<DriverDashboard />} />
          <Route path="active-trip" element={<ActiveTripPage />} />
        </Route>
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
