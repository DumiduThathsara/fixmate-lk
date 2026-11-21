import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Find Technicians', to: '/technicians' },
  { label: 'Join as a Technician', to: '/auth' },
];

const POPULAR_SERVICES = [
  'Plumbing',
  'Electrical',
  'AC Servicing',
  'Carpentry',
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1: Brand Summary */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-white">
                <Wrench className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight">FixMate LK</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Connecting Sri Lankan homes and businesses with trusted, verified technicians for
              fast, reliable maintenance and repair services.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Popular Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Popular Services
            </h3>
            <ul className="mt-4 space-y-2.5">
              {POPULAR_SERVICES.map((service) => (
                <li key={service}>
                  <Link
                    to={`/technicians?service=${encodeURIComponent(service)}`}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} FixMate LK. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
