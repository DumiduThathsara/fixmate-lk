import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit3,
  FileText,
  Flag,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Settings,
  Star,
  Trash2,
  Wallet,
  Wrench,
  XCircle,
  Zap,
} from 'lucide-react';
import BookingChatModal from '../components/BookingChatModal';
import InvoiceModal from '../components/InvoiceModal';
import ReviewModal from '../components/ReviewModal';
import { SRI_LANKA_DISTRICTS } from '../constants/districts';
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

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

export default function CustomerDashboard() {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [viewMode, setViewMode] = useState('bookings'); // 'bookings' | 'profile'
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [disputeBookingId, setDisputeBookingId] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [quoteActionId, setQuoteActionId] = useState(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Valued Customer',
    phone: user?.phone || '',
    district: user?.district || 'Colombo',
    address: user?.address || '',
    avatar: user?.avatar || '',
  });
  const [avatarError, setAvatarError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  useEffect(() => {
    setProfileForm({
      name: user?.name || 'Valued Customer',
      phone: user?.phone || '',
      district: user?.district || 'Colombo',
      address: user?.address || '',
      avatar: user?.avatar || '',
    });
  }, [user]);

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

  const handleBookingUpdated = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
    if (chatBooking?.id === updatedBooking.id) {
      setChatBooking(updatedBooking);
    }
  };

  const handleQuoteResponse = async (bookingId, decision) => {
    setQuoteActionId(bookingId);
    try {
      const updated = await bookingService.respondToQuote(bookingId, decision);
      handleBookingUpdated(updated);
    } catch (err) {
      console.error('Failed to respond to quote:', err);
    } finally {
      setQuoteActionId(null);
    }
  };

  const handleDisputeSubmit = async (e, bookingId) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    try {
      const updated = await bookingService.flagBookingDispute(bookingId, disputeReason);
      handleBookingUpdated(updated);
      setDisputeBookingId(null);
      setDisputeReason('');
    } catch (err) {
      console.error('Failed to flag dispute:', err);
    }
  };

  const handleAvatarChange = (e) => {
    setAvatarError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size >= MAX_AVATAR_BYTES) {
      setAvatarError('Image must be smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfileForm((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarError('');
    setProfileForm((prev) => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg('');

    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        district: profileForm.district,
        address: profileForm.address,
        avatar: profileForm.avatar,
      });
      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update customer profile:', err);
    } finally {
      setProfileSaving(false);
    }
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

  const displayName = user?.name || 'Valued Customer';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={displayName}
              className="h-14 w-14 shrink-0 rounded-full border-2 border-blue-200 object-cover shadow-sm"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-700 text-lg font-bold text-white shadow-sm">
              {getInitials(displayName)}
            </span>
          )}

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {displayName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              {user?.district && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {user.district}
                </span>
              )}
              {user?.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {user.phone}
                </span>
              )}
              {!user?.district && !user?.phone && (
                <span>Track your service requests, upcoming visits, and profile settings.</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode('profile')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Edit3 className="h-4 w-4 text-blue-700" />
            Edit Profile
          </button>

          <Link
            to="/technicians"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Book a New Service
          </Link>
        </div>
      </div>

      {/* Top-Level View Switcher */}
      <div className="mt-6 flex gap-2 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => setViewMode('bookings')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            viewMode === 'bookings'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          My Bookings
        </button>
        <button
          type="button"
          onClick={() => setViewMode('profile')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            viewMode === 'profile'
              ? 'bg-blue-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Settings className="h-4 w-4" />
          My Profile &amp; Settings
        </button>
      </div>

      {viewMode === 'bookings' ? (
        <>
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

          {/* Status Filter Tabs */}
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
                  STATUS_BADGE_STYLES[booking.status] ||
                  'border-slate-200 bg-slate-100 text-slate-700';

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
                          {booking.isEmergency && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                              <Zap className="h-3 w-3" />
                              EMERGENCY
                            </span>
                          )}
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

                        {booking.issuePhoto && (
                          <div className="pt-1">
                            <img
                              src={booking.issuePhoto}
                              alt="Attached issue"
                              className="h-16 w-24 rounded-lg border border-slate-200 object-cover"
                            />
                          </div>
                        )}

                        {/* Pending Repair Estimate Card */}
                        {booking.quote?.status === 'Pending' && (
                          <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
                                Repair Estimate Pending Approval
                              </p>
                              <span className="text-sm font-extrabold text-slate-900">
                                + Rs.{' '}
                                {(
                                  (Number(booking.quote.partsCost) || 0) +
                                  (Number(booking.quote.laborCost) || 0)
                                ).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-700">
                              Parts: Rs. {Number(booking.quote.partsCost).toLocaleString()} + Labor:
                              Rs. {Number(booking.quote.laborCost).toLocaleString()}
                              {booking.quote.note ? ` — ${booking.quote.note}` : ''}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={quoteActionId === booking.id}
                                onClick={() => handleQuoteResponse(booking.id, 'Approved')}
                                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                              >
                                Approve Quote
                              </button>
                              <button
                                type="button"
                                disabled={quoteActionId === booking.id}
                                onClick={() => handleQuoteResponse(booking.id, 'Rejected')}
                                className="rounded-lg border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        )}

                        {booking.quote?.status === 'Approved' && (
                          <p className="text-xs font-semibold text-emerald-700">
                            &#10003; Repair Quote Approved (Parts + Labor: Rs.{' '}
                            {(
                              (Number(booking.quote.partsCost) || 0) +
                              (Number(booking.quote.laborCost) || 0)
                            ).toLocaleString()}
                            )
                          </p>
                        )}

                        {booking.dispute?.isFlagged && (
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {booking.dispute.resolved
                              ? 'Dispute Resolved by Admin'
                              : `Issue Reported: ${booking.dispute.reason}`}
                          </div>
                        )}

                        {disputeBookingId === booking.id && (
                          <form
                            onSubmit={(e) => handleDisputeSubmit(e, booking.id)}
                            className="mt-2 flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row"
                          >
                            <input
                              type="text"
                              required
                              value={disputeReason}
                              onChange={(e) => setDisputeReason(e.target.value)}
                              placeholder="Describe the issue for Admin review..."
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                              >
                                Submit Report
                              </button>
                              <button
                                type="button"
                                onClick={() => setDisputeBookingId(null)}
                                className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
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
                          {(booking.status === 'Pending' || booking.status === 'Accepted') && (
                            <button
                              type="button"
                              onClick={() => setChatBooking(booking)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Chat
                              {booking.messages?.length > 0 && ` (${booking.messages.length})`}
                            </button>
                          )}

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

                          {booking.status === 'Completed' && (
                            <button
                              type="button"
                              onClick={() => setInvoiceBooking(booking)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              <FileText className="h-4 w-4 text-blue-700" />
                              View Receipt
                            </button>
                          )}

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

                          {booking.status === 'Completed' && !booking.dispute?.isFlagged && (
                            <button
                              type="button"
                              onClick={() => {
                                setDisputeBookingId(booking.id);
                                setDisputeReason('');
                              }}
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-600"
                            >
                              <Flag className="h-3.5 w-3.5" />
                              Report Issue
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* My Profile & Settings View */
        <div className="mt-8 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">My Profile &amp; Settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update your contact details, default service address, and profile photo.
          </p>

          {profileSuccessMsg && (
            <div
              role="status"
              className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {profileSuccessMsg}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="mt-6 space-y-6">
            {/* Profile Photo Uploader */}
            <div className="flex flex-col items-start gap-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
              <div className="relative shrink-0">
                {profileForm.avatar ? (
                  <img
                    src={profileForm.avatar}
                    alt={profileForm.name}
                    className="h-24 w-24 rounded-full border-4 border-blue-100 object-cover shadow-sm"
                  />
                ) : (
                  <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-blue-100 bg-blue-700 text-xl font-bold text-white shadow-sm">
                    {getInitials(profileForm.name)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload profile photo"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-700 text-white shadow transition-colors hover:bg-blue-800"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Profile Photo</h3>
                  <p className="text-xs text-slate-500">
                    JPG, PNG, or WEBP under 2MB. Displayed in your dashboard and navbar.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Upload Photo
                  </button>
                  {profileForm.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Photo
                    </button>
                  )}
                </div>
                {avatarError && (
                  <p className="text-xs font-medium text-red-600">{avatarError}</p>
                )}
              </div>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="cust-name"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>
                <input
                  id="cust-name"
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                />
              </div>

              <div>
                <label
                  htmlFor="cust-email"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Email Address{' '}
                  <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                    Read-only
                  </span>
                </label>
                <input
                  id="cust-email"
                  type="email"
                  disabled
                  value={user?.email || 'customer@fixmate.lk'}
                  className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500"
                />
              </div>
            </div>

            {/* Phone & District */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="cust-phone"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Phone Number
                </label>
                <input
                  id="cust-phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="077 123 4567"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                />
              </div>

              <div>
                <label
                  htmlFor="cust-district"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  District
                </label>
                <select
                  id="cust-district"
                  value={profileForm.district}
                  onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                >
                  {SRI_LANKA_DISTRICTS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Default Service Address */}
            <div>
              <label
                htmlFor="cust-address"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Default Service Address
              </label>
              <textarea
                id="cust-address"
                rows={3}
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="No. 42, Galle Road, Dehiwala, Colombo"
                className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={Boolean(reviewBooking)}
        booking={reviewBooking}
        onClose={() => setReviewBooking(null)}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Booking Chat Modal */}
      <BookingChatModal
        isOpen={Boolean(chatBooking)}
        booking={chatBooking}
        currentUserRole="CUSTOMER"
        currentUserName={displayName}
        onClose={() => setChatBooking(null)}
        onBookingUpdated={handleBookingUpdated}
      />

      {/* Digital Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(invoiceBooking)}
        booking={invoiceBooking}
        onClose={() => setInvoiceBooking(null)}
      />
    </div>
  );
}
