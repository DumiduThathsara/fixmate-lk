import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Wrench, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Find Technicians', to: '/technicians' },
  { label: 'Customer Portal', to: '/customer/dashboard' },
  { label: 'Technician Portal', to: '/technician/dashboard' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-slate-900 focus:outline-none"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">
            <Wrench className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">FixMate LK</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth / User Controls */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                {user?.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-7 w-7 rounded-full border border-slate-200 object-cover"
                  />
                )}
                <span className="max-w-[140px] truncate text-sm font-medium text-slate-800">
                  {user?.name}
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                  {role}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              Login / Register
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col space-y-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-2">
              {isAuthenticated ? (
                <div className="space-y-2 border-t border-slate-100 pt-2">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {user?.avatar && (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-7 w-7 shrink-0 rounded-full border border-slate-200 object-cover"
                        />
                      )}
                      <span className="truncate text-sm font-medium text-slate-800">
                        {user?.name}
                      </span>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                      {role}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-lg bg-blue-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
