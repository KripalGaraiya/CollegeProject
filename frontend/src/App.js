import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import PrincipalDashboard from './pages/principal/Dashboard';
import PrincipalStudents from './pages/principal/Students';
import PrincipalTeachers from './pages/principal/Teachers';
import PrincipalDepartments from './pages/principal/Departments';
import PrincipalNotices from './pages/principal/Notices';
import PrincipalLeaves from './pages/principal/Leaves';
import StudentProfile from './pages/principal/StudentProfile';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherResults from './pages/teacher/Results';
import TeacherLeave from './pages/teacher/Leave';
import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';
import StudentFees from './pages/student/Fees';
import StudentResults from './pages/student/Results';
import StudentNotices from './pages/student/Notices';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  return children;
};

// Redirect based on role
const RoleRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={`/${user.role}`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRedirect />} />
          
          {/* Principal Routes */}
          <Route path="/principal" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/principal/students" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalStudents />
            </ProtectedRoute>
          } />
          <Route path="/principal/students/:id" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/principal/teachers" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalTeachers />
            </ProtectedRoute>
          } />
          <Route path="/principal/departments" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalDepartments />
            </ProtectedRoute>
          } />
          <Route path="/principal/notices" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalNotices />
            </ProtectedRoute>
          } />
          <Route path="/principal/leaves" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalLeaves />
            </ProtectedRoute>
          } />
          
          {/* Teacher Routes */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher/attendance" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherAttendance />
            </ProtectedRoute>
          } />
          <Route path="/teacher/results" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherResults />
            </ProtectedRoute>
          } />
          <Route path="/teacher/leave" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLeave />
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentAttendance />
            </ProtectedRoute>
          } />
          <Route path="/student/fees" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentFees />
            </ProtectedRoute>
          } />
          <Route path="/student/results" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentResults />
            </ProtectedRoute>
          } />
          <Route path="/student/notices" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentNotices />
            </ProtectedRoute>
          } />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
