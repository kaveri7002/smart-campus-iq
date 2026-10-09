import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AttendanceManagement } from './pages/AttendanceManagement';
import { StudentAttendanceView } from './pages/StudentAttendanceView';
import { QRAttendancePage } from './pages/QRAttendancePage';
import { FaceAttendancePage } from './pages/FaceAttendancePage';
import { SMSLogsPage } from './pages/SMSLogsPage';
import { LabManagement } from './pages/LabManagement';
import { ProjectHub } from './pages/ProjectHub';
import { PlacementPortal } from './pages/PlacementPortal';
import { CampusComplaints } from './pages/CampusComplaints';
import { EventsPage } from './pages/EventsPage';
import { DigitalLibrary } from './pages/DigitalLibrary';
import { AdminUserManagement } from './pages/AdminUserManagement';
import { CampusLife } from './pages/CampusLife';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Faculty & Admin Smart Attendance Marking */}
            <Route
              path="attendance"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <AttendanceManagement />
                </ProtectedRoute>
              }
            />

            {/* Student Attendance Breakdown & SMS Feed */}
            <Route
              path="attendance-view"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <StudentAttendanceView />
                </ProtectedRoute>
              }
            />

            {/* QR Attendance Portal (Faculty broadcast & Student Check-in) */}
            <Route path="qr-attendance" element={<QRAttendancePage />} />

            {/* Biometric Face Recognition Attendance */}
            <Route
              path="face-attendance"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <FaceAttendancePage />
                </ProtectedRoute>
              }
            />

            {/* SMS Notification Engine Audit Logs */}
            <Route
              path="sms-logs"
              element={
                <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                  <SMSLogsPage />
                </ProtectedRoute>
              }
            />

            {/* Engineering Labs & Equipment Reservation */}
            <Route path="labs" element={<LabManagement />} />

            {/* Project & Hackathon Collaboration Hub */}
            <Route path="projects" element={<ProjectHub />} />

            {/* Placement & Career Development Portal */}
            <Route path="placements" element={<PlacementPortal />} />

            {/* Campus Complaints Desk */}
            <Route path="complaints" element={<CampusComplaints />} />

            {/* Technical Events & Symposiums */}
            <Route path="events" element={<EventsPage />} />

            {/* Digital Library */}
            <Route path="library" element={<DigitalLibrary />} />

            {/* Admin User Management & Global Policy Settings */}
            <Route
              path="admin-users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUserManagement />
                </ProtectedRoute>
              }
            />

            {/* Campus Navigation, Lost & Found, Emergency */}
            <Route path="campus-life" element={<CampusLife />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
