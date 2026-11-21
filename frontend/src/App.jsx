import { BrowserRouter, Route, Routes } from 'react-router-dom';
import FloatingAiWidget from './components/FloatingAiWidget';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import FindTechnicians from './pages/FindTechnicians';
import Home from './pages/Home';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TechnicianProfile from './pages/TechnicianProfile';

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
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/technicians" element={<FindTechnicians />} />
              <Route path="/technicians/:id" element={<TechnicianProfile />} />
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/technician/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                    <TechnicianDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <FloatingAiWidget />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
