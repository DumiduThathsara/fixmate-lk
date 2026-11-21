import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { isAuthenticated, role } = useAuth();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const dashboardPath =
    role === 'TECHNICIAN' ? '/technician/dashboard' : '/customer/dashboard';
  const accountPath = isAuthenticated ? dashboardPath : '/auth';

  const items = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Explore', to: '/technicians', icon: Search },
    { label: 'Dashboard', to: dashboardPath, icon: LayoutDashboard },
    { label: 'Account', to: accountPath, icon: User },
  ];

  const isActive = (to) => {
    if (to === '/') return pathname === '/';
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden print:hidden"
    >
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
