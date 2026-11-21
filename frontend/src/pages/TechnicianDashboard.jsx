import { useEffect, useState } from 'react';
import {
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Inbox,
  MapPin,
  Phone,
  Settings,
  Star,
  Wallet,
  X,
} from 'lucide-react';
import { SRI_LANKA_DISTRICTS } from '../constants/districts';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import technicianService from '../services/technicianService';

const WORKSPACE_TABS = [
  { id: 'requests', label: 'Incoming Requests' },
  { id: 'schedule', label: 'Active Schedule' },
  { id: 'history', label: 'Job History' },
  { id: 'settings', label: 'Service Settings' },
];

const HISTORY_BADGE_STYLES = {
  Completed: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  Declined: 'border-red-200 bg-red-100 text-red-800',
};

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const technicianId = user?.id || 'default-technician';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

  // Availability & Service Settings state
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    visitFee: 1500,
    district: user?.district || 'Colombo',
    bio: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      bookingService.getTechnicianBookings(technicianId),
      technicianService.getTechnicianProfile(technicianId, { district: user?.district }),
    ])
      .then(([bookingList, profile]) => {
        if (!active) return;
        setBookings(bookingList);
        setIsAvailable(profile.available ?? true);
        setProfileForm({
          visitFee: profile.visitFee ?? 1500,
          district: profile.district || user?.district || 'Colombo',
          bio: profile.bio || '',
        });
      })
      .catch((err) => console.error('Failed to load technician dashboard:', err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [technicianId, user?.district]);

  const handleToggleAvailability = async () => {
    const nextValue = !isAvailable;
    setAvailabilitySaving(true);
    try {
      await technicianService.updateTechnicianAvailability(technicianId, nextValue);
      setIsAvailable(nextValue);
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingBookingId(bookingId);
    try {
      const updated = await bookingService.updateBookingStatus(bookingId, newStatus);
      setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err) {
      console.error('Failed to update booking status:', err);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setSettingsSavedMsg('');

    try {
      const updated = await technicianService.updateTechnicianProfile(technicianId, profileForm);
      setProfileForm({
        visitFee: updated.visitFee,
        district: updated.district,
        bio: updated.bio,
      });
      setSettingsSavedMsg('Service settings saved successfully.');
      setTimeout(() => setSettingsSavedMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save profile settings:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const pendingJobs = bookings.filter((b) => b.status === 'Pending');
  const activeJobs = bookings.filter((b) => b.status === 'Accepted');
  const completedJobs = bookings.filter((b) => b.status === 'Completed');
  const historyJobs = bookings.filter(
    (b) => b.status === 'Completed' || b.status === 'Declined'
  );
  const totalEarnings = completedJobs.reduce(
    (sum, b) => sum + (Number(b.visitFee) || 0),
    0
  );

  const getTabCount = (tabId) => {
    if (tabId === 'requests') return pendingJobs.length;
    if (tabId === 'schedule') return activeJobs.length;
    if (tabId === 'history') return historyJobs.length;
    return null;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header & Availability Control */}
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {user?.name || 'Kasun Perera'}
            </h1>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
              {user?.serviceCategory || 'Plumbing'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              {profileForm.district}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Manage incoming service requests, active jobs, and your service profile.
          </p>
        </div>

        {/* Interactive Availability Toggle Switch */}
        <div className="flex items-center gap-3 self-start rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:self-auto">
          <button
            type="button"
            role="switch"
            aria-checked={isAvailable}
            disabled={availabilitySaving}
            onClick={handleToggleAvailability}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-60 ${
              isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                isAvailable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <div>
            <p
              className={`text-sm font-bold ${
                isAvailable ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {isAvailable ? 'Available for Bookings' : 'Currently Busy'}
            </p>
            <p className="text-xs text-slate-500">
              {isAvailable ? 'Customers can request your services' : 'Paused from new requests'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats Grid (4 Cards) */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              New Requests
            </span>
            <Inbox className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{pendingJobs.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active Jobs
            </span>
            <Briefcase className="h-5 w-5 text-blue-700" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{activeJobs.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Completed Jobs
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{completedJobs.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Earnings
            </span>
            <Wallet className="h-5 w-5 text-slate-700" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            Rs. {totalEarnings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabbed Workspace */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {WORKSPACE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);
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
              {tab.id === 'settings' && <Settings className="h-4 w-4" />}
              <span>{tab.label}</span>
              {count !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Tab 1: Incoming Requests (Pending) */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {pendingJobs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                    <Inbox className="mx-auto h-10 w-10 text-slate-300" />
                    <h3 className="mt-3 text-base font-bold text-slate-900">
                      No incoming requests
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      New customer booking requests will appear here.
                    </p>
                  </div>
                ) : (
                  pendingJobs.map((job) => (
                    <article
                      key={job.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-lg font-bold text-slate-900">
                              {job.customerName || 'Customer Request'}
                            </h2>
                            <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              Pending
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              {job.district}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              {job.scheduledDate}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-slate-400" />
                              {job.timeSlot}
                            </span>
                          </div>

                          <p className="text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">Address:</span>{' '}
                            {job.serviceAddress}
                          </p>
                          <p className="text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">Issue:</span>{' '}
                            {job.issueDescription}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-start justify-between gap-4 border-t border-slate-100 pt-4 lg:items-end lg:border-t-0 lg:pt-0">
                          <div className="lg:text-right">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Visit Fee
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                              Rs. {Number(job.visitFee).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              disabled={updatingBookingId === job.id}
                              onClick={() => handleStatusChange(job.id, 'Declined')}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
                            >
                              <X className="h-4 w-4" />
                              Decline
                            </button>
                            <button
                              type="button"
                              disabled={updatingBookingId === job.id}
                              onClick={() => handleStatusChange(job.id, 'Accepted')}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <Check className="h-4 w-4" />
                              Accept Job
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Active Schedule (Accepted) */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                {activeJobs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                    <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
                    <h3 className="mt-3 text-base font-bold text-slate-900">
                      No active scheduled jobs
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Accepted requests will appear here with customer contact details.
                    </p>
                  </div>
                ) : (
                  activeJobs.map((job) => (
                    <article
                      key={job.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-lg font-bold text-slate-900">
                              {job.customerName || 'Customer'}
                            </h2>
                            <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                              Accepted
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600">
                            <a
                              href={`tel:${(job.customerPhone || '0770000000').replace(/\s+/g, '')}`}
                              className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:underline"
                            >
                              <Phone className="h-4 w-4" />
                              {job.customerPhone || '077 245 8890'}
                            </a>
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              {job.scheduledDate}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-slate-400" />
                              {job.timeSlot}
                            </span>
                          </div>

                          <p className="text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">Full Address:</span>{' '}
                            {job.serviceAddress}
                          </p>
                          <p className="text-sm text-slate-600">
                            <span className="font-semibold text-slate-800">Issue:</span>{' '}
                            {job.issueDescription}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-start justify-between gap-4 border-t border-slate-100 pt-4 lg:items-end lg:border-t-0 lg:pt-0">
                          <div className="lg:text-right">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Visit Fee
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                              Rs. {Number(job.visitFee).toLocaleString()}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={updatingBookingId === job.id}
                            onClick={() => handleStatusChange(job.id, 'Completed')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as Completed
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Job History (Completed & Declined) */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {historyJobs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-slate-300" />
                    <h3 className="mt-3 text-base font-bold text-slate-900">
                      No job history yet
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Completed and declined jobs will appear here.
                    </p>
                  </div>
                ) : (
                  historyJobs.map((job) => (
                    <article
                      key={job.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div className="space-y-2.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-lg font-bold text-slate-900">
                              {job.customerName || 'Customer'}
                            </h2>
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                HISTORY_BADGE_STYLES[job.status] ||
                                'border-slate-200 bg-slate-100 text-slate-700'
                              }`}
                            >
                              {job.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              {job.district}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              {job.scheduledDate}
                            </span>
                          </div>

                          <p className="text-sm text-slate-600">{job.issueDescription}</p>

                          {job.review && (
                            <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <Star
                                    key={idx}
                                    className={`h-4 w-4 ${
                                      idx < job.review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                                <span className="ml-1.5 text-xs font-semibold text-slate-700">
                                  Customer Review ({job.review.rating}/5)
                                </span>
                              </div>
                              {job.review.comment && (
                                <p className="mt-1.5 text-sm italic text-slate-700">
                                  &ldquo;{job.review.comment}&rdquo;
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="lg:text-right">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Visit Fee
                          </p>
                          <p className="text-lg font-bold text-slate-900">
                            Rs. {Number(job.visitFee).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* Tab 4: Service Settings */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">Service Profile Settings</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update your standard visit fee, operating district, and bio shown to customers.
                </p>

                {settingsSavedMsg && (
                  <div
                    role="status"
                    className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    {settingsSavedMsg}
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="mt-6 space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="tech-visit-fee"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Standard Visit Fee (LKR)
                      </label>
                      <input
                        id="tech-visit-fee"
                        type="number"
                        min={500}
                        step={100}
                        required
                        value={profileForm.visitFee}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, visitFee: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="tech-district"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Operating District
                      </label>
                      <select
                        id="tech-district"
                        value={profileForm.district}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, district: e.target.value })
                        }
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

                  <div>
                    <label
                      htmlFor="tech-bio"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Short Bio &amp; Specialties
                    </label>
                    <textarea
                      id="tech-bio"
                      rows={4}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Describe your years of experience, certifications, and key specialties..."
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {profileSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
