import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import JobList from './pages/JobList'
import JobDetails from './pages/JobDetails'
import PostJob from './pages/PostJob'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext.jsx'
import FreelancerRoute from './components/FreelancerRoute'
import { Toaster } from 'react-hot-toast'
import ClientJobDetails from './pages/ClientJobDetails'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/jobs" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/jobs"
              element={
                <FreelancerRoute>
                  <JobList />
                </FreelancerRoute>
              }
            />
            <Route
              path="/jobs/:id"
              element={
                <FreelancerRoute>
                  <JobDetails />
                </FreelancerRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-job"
              element={
                <ProtectedRoute role="Client">
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/jobs/:id"
              element={
                <ProtectedRoute role="Client">
                  <ClientJobDetails />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Toaster position="top-right" />
        <Footer />
      </div>
    </AuthProvider>
  )
}
