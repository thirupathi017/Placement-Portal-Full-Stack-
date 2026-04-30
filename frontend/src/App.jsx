import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import JobListing from './pages/JobListing';
import JobDetails from './pages/JobDetails';
import MyApplications from './pages/MyApplications';
import StudentProfile from './pages/StudentProfile';
import CompanyDashboard from './pages/CompanyDashboard';
import ManageJobs from './pages/ManageJobs';
import PostJob from './pages/PostJob';
import ApplicantsList from './pages/ApplicantsList';
import Interviews from './pages/Interviews';
import CompanyReport from './pages/CompanyReport';
import AdminDashboard from './pages/AdminDashboard';
import StudentManagement from './pages/StudentManagement';
import CompanyManagement from './pages/CompanyManagement';
import PlacementsReport from './pages/PlacementsReport';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pb-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Redirect Root based on Role */}
        <Route path="/" element={
          user?.role === 'STUDENT' ? <Navigate to="/dashboard" /> :
          user?.role === 'COMPANY' ? <Navigate to="/company/dashboard" /> :
          user?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" /> :
          <Navigate to="/login" />
        } />

        {/* Student Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute allowedRoles={['STUDENT']}><JobListing /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute allowedRoles={['STUDENT']}><JobDetails /></ProtectedRoute>} />
        <Route path="/my-applications" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyApplications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentProfile /></ProtectedRoute>} />

        {/* Company Routes */}
        <Route path="/company/dashboard" element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyDashboard /></ProtectedRoute>} />
        <Route path="/company/jobs" element={<ProtectedRoute allowedRoles={['COMPANY']}><ManageJobs /></ProtectedRoute>} />
        <Route path="/company/jobs/new" element={<ProtectedRoute allowedRoles={['COMPANY']}><PostJob /></ProtectedRoute>} />
        <Route path="/company/jobs/:id/edit" element={<ProtectedRoute allowedRoles={['COMPANY']}><PostJob /></ProtectedRoute>} />
        <Route path="/company/jobs/:id/applicants" element={<ProtectedRoute allowedRoles={['COMPANY']}><ApplicantsList /></ProtectedRoute>} />
        <Route path="/company/interviews" element={<ProtectedRoute allowedRoles={['COMPANY']}><Interviews /></ProtectedRoute>} />
        <Route path="/company/reports" element={<ProtectedRoute allowedRoles={['COMPANY']}><CompanyReport /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['ADMIN']}><StudentManagement /></ProtectedRoute>} />
        <Route path="/admin/students/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><StudentProfile /></ProtectedRoute>} />
        <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={['ADMIN']}><CompanyManagement /></ProtectedRoute>} />
        <Route path="/admin/placements" element={<ProtectedRoute allowedRoles={['ADMIN']}><PlacementsReport /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
