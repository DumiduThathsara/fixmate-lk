import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';

export default function NotificationBell() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    let active = true;
    notificationService.getNotifications(role).then((items) => {
      if (active) setNotifications(items);
    });
    return () => {
      active = false;
    };
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    const updated = await notificationService.markAllAsRead(role);
    setNotifications(updated);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-bold text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-500">
                You&apos;re all caught up!
              </p>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  to={item.link || '/'}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 transition-colors hover:bg-slate-50 ${
                    !item.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    {!item.read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{item.message}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
