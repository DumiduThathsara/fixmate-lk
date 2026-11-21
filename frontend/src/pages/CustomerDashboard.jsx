import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  Plus,
  Star,
  Wallet,
  Wrench,
  XCircle,
} from 'lucide-react';
import ReviewModal from '../components/ReviewModal';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';

const FILTER_TABS = [
  { id: 'All', label: 'All' },
  { id: 'Active', label: 'Active' },
  { id: 'Completed', label: 'Completed' },
  { id: 'Cancelled', label: 'Cancelled' },
];

const STATUS_BADGE_STYLES = {
  Pending: 'border-amber-200 bg-amber-100 text-amber-800',
  Accepted: 'border-blue-200 bg-blue-100 text-blue-800',
  Completed: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  Cancelled: 'border-red-200 bg-red-100 text-red-800',
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    bookingService
      .getCustomerBookings(user?.id)
      .then((data) => {
        if (active) setBookings(data);
      })
      .catch((err) => console.error('Failed to load bookings:', err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      const updated = await bookingService.cancelBooking(bookingId);
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setConfirmCancelId(null);
    } catch (err) {
      console.error('Error cancelling booking:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const handleReviewSubmitted = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  };

  const totalBookings = bookings.length;
  const activeCount = bookings.filter(
    (b) => b.status === 'Pending' || b.status === 'Accepted'
  ).length;
  const completedBookings = bookings.filter((b) => b.status === 'Completed');
  const completedCount = completedBookings.length;
  const totalSpent = completedBookings.reduce((sum, b) => sum + (Number(b.visitFee) || 0), 0);

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') {
      return booking.status === 'Pending' || booking.status === 'Accepted';
    }
    return booking.status === activeTab;
  });

  const getTabCount = (tabId) => {
    if (tabId === 'All') return totalBookings;
    if (tabId === 'Active') return activeCount;
    if (tabId === 'Completed') return completedCount;
    return bookings.filter((b) => b.status === 'Cancelled').length;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {user?.name || 'Valued Customer'}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track your service requests, upcoming technician visits, and completed jobs.
          </p>
        </div>

        <Link
          to="/technicians"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          Book a New Service
        </Link>
      </div>

      {/* Summary Stats Cards (4-column grid) */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Bookings
            </span>
            <ClipboardList className="h-5 w-5 text-blue-700" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{totalBookings}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active / Upcoming
            </span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{activeCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Completed Jobs
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{completedCount}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Spent
            </span>
            <Wallet className="h-5 w-5 text-slate-700" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            Rs. {totalSpent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {getTabCount(tab.id)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Booking List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Wrench className="h-10 w-10 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              No {activeTab === 'All' ? '' : activeTab.toLowerCase()} bookings found
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Need help with plumbing, electrical, AC servicing, or repairs? Find a verified
              technician near you.
            </p>
            <Link
              to="/technicians"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
            >
              Find Technicians
            </Link>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const badgeStyle =
              STATUS_BADGE_STYLES[booking.status] || 'border-slate-200 bg-slate-100 text-slate-700';

            return (
              <article
                key={booking.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-lg font-bold text-slate-900">
                        {booking.technicianName}
                      </h2>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {booking.category}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeStyle}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {booking.district}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {booking.scheduledDate}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {booking.timeSlot}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Address:</span>{' '}
                      {booking.serviceAddress}
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">Issue:</span>{' '}
                      {booking.issueDescription}
                    </p>
                  </div>

                  {/* Right Side: Visit Fee & Contextual Actions */}
                  <div className="flex shrink-0 flex-col items-start justify-between gap-4 border-t border-slate-100 pt-4 lg:items-end lg:border-t-0 lg:pt-0">
                    <div className="lg:text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Visit Fee
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        Rs. {Number(booking.visitFee).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {booking.status === 'Pending' &&
                        (confirmCancelId === booking.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-red-700">
                              Confirm cancel?
                            </span>
                            <button
                              type="button"
                              disabled={cancellingId === booking.id}
                              onClick={() => handleCancelBooking(booking.id)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              {cancellingId === booking.id ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(null)}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(booking.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel Request
                          </button>
                        ))}

                      {booking.status === 'Completed' && !booking.hasReviewed && (
                        <button
                          type="button"
                          onClick={() => setReviewBooking(booking)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-sm transition-colors hover:bg-amber-400"
                        >
                          <Star className="h-4 w-4" />
                          Leave a Review
                        </button>
                      )}

                      {booking.status === 'Completed' && booking.hasReviewed && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          Reviewed &#10003;
                          {booking.review?.rating ? ` (${booking.review.rating}/5)` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={Boolean(reviewBooking)}
        booking={reviewBooking}
        onClose={() => setReviewBooking(null)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
