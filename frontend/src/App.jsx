import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import Auth from './pages/Auth';

function ComingSoon({ title, sprint, description }) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <span className="inline-flex items-center rounded-full bg-blue-100 px-3.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
        {sprint}
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-base text-slate-600">
        {description || 'This module is scheduled for implementation in an upcoming sprint.'}
      </p>
      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
        Coming Soon &mdash; FixMate LK Frontend Foundation
      </div>
    </section>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route
                path="/"
                element={
                  <ComingSoon
                    title="FixMate LK Home"
                    sprint="Sprint 1"
                    description="Landing page, service categories, and quick technician search."
                  />
                }
              />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/technicians"
                element={
                  <ComingSoon
                    title="Find Technicians"
                    sprint="Sprint 2"
                    description="Search, filter, and browse verified technicians across Sri Lanka."
                  />
                }
              />
              <Route
                path="/technicians/:id"
                element={
                  <ComingSoon
                    title="Technician Profile"
                    sprint="Sprint 2"
                    description="Detailed technician profile, ratings, availability, and booking."
                  />
                }
              />
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <ComingSoon
                      title="Customer Portal"
                      sprint="Sprint 3"
                      description="Manage service requests, active bookings, and technician reviews."
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                    <ComingSoon
                      title="Technician Portal"
                      sprint="Sprint 4"
                      description="Manage incoming job requests, schedule, and service analytics."
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <ComingSoon
                      title="Admin Dashboard"
                      sprint="Admin Portal"
                      description="Manage platform users, technician verifications, and system oversight."
                    />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
