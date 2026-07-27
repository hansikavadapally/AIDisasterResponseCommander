import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

// Auth pages
import LandingPage from '@/pages/auth/LandingPage';
import CommanderLogin from '@/pages/auth/CommanderLogin';
import CommanderSignup from '@/pages/auth/CommanderSignup';
import ClientLogin from '@/pages/auth/ClientLogin';
import ClientSignup from '@/pages/auth/ClientSignup';

// Layouts
import CommanderLayout from '@/layouts/CommanderLayout';
import ClientLayout from '@/layouts/ClientLayout';

// Commander pages
import CommanderDashboard from '@/pages/commander/CommanderDashboard';
import FleetManagement from '@/pages/commander/FleetManagement';
import ClientRequests from '@/pages/commander/ClientRequests';
import MissionCenter from '@/pages/commander/MissionCenter';
import DisasterMapView from '@/pages/commander/DisasterMapView';
import Analytics from '@/pages/commander/Analytics';
import AIAssistant from '@/pages/commander/AIAssistant';
import NotificationCenter from '@/pages/commander/NotificationCenter';
import CommanderSettings from '@/pages/commander/CommanderSettings';

// Client pages
import ClientDashboard from '@/pages/client/ClientDashboard';
import SubmitComplaint from '@/pages/client/SubmitComplaint';
import ComplaintHistory from '@/pages/client/ComplaintHistory';
import RescueTracking from '@/pages/client/RescueTracking';
import ClientNotifications from '@/pages/client/ClientNotifications';
import ClientProfile from '@/pages/client/ClientProfile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/commander/login" element={<CommanderLogin />} />
          <Route path="/commander/signup" element={<CommanderSignup />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/client/signup" element={<ClientSignup />} />

          {/* Commander */}
          <Route
            path="/commander"
            element={
              <ProtectedRoute role="commander">
                <CommanderLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/commander/dashboard" replace />} />
            <Route path="dashboard" element={<CommanderDashboard />} />
            <Route path="fleet" element={<FleetManagement />} />
            <Route path="requests" element={<ClientRequests />} />
            <Route path="missions" element={<MissionCenter />} />
            <Route path="map" element={<DisasterMapView />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="settings" element={<CommanderSettings />} />
          </Route>

          {/* Client */}
          <Route
            path="/client"
            element={
              <ProtectedRoute role="client">
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/client/dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="submit" element={<SubmitComplaint />} />
            <Route path="history" element={<ComplaintHistory />} />
            <Route path="tracking" element={<RescueTracking />} />
            <Route path="notifications" element={<ClientNotifications />} />
            <Route path="profile" element={<ClientProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
