import { BrowserRouter, Route, Routes } from 'react-router-dom';
import FloatingAiWidget from './components/FloatingAiWidget';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import FindTechnicians from './pages/FindTechnicians';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TechnicianProfile from './pages/TechnicianProfile';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex min-h-screen flex-col bg-slate-50 pb-16 md:pb-0">
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <FloatingAiWidget />
            <MobileBottomNav />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
