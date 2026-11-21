import { useEffect, useRef, useState } from 'react';
import {
  Briefcase,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  Inbox,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Receipt,
  Settings,
  Star,
  Trash2,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import BookingChatModal from '../components/BookingChatModal';
import TechnicianCard from '../components/TechnicianCard';
import { SRI_LANKA_DISTRICTS } from '../constants/districts';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import technicianService from '../services/technicianService';

const WORKSPACE_TABS = [
  { id: 'requests', label: 'Incoming Requests' },
  { id: 'schedule', label: 'Active Schedule' },
  { id: 'history', label: 'Job History' },
  { id: 'settings', label: 'My Profile & Settings' },
];

const HISTORY_BADGE_STYLES = {
  Completed: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  Declined: 'border-red-200 bg-red-100 text-red-800',
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

export default function TechnicianDashboard() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const [quoteOpenId, setQuoteOpenId] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ partsCost: '', laborCost: '', note: '' });
  const [quoteSaving, setQuoteSaving] = useState(false);

  // Technician Profile & Availability state
  const [techId, setTechId] = useState(user?.id || 'tech-1');
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Kasun Perera',
    phone: user?.phone || '077 456 7890',
    district: user?.district || 'Colombo',
    category: user?.serviceCategory || 'Plumbing',
    experienceYears: 5,
    visitFee: 1500,
    workingHours: '8:00 AM - 6:00 PM (Mon - Sat)',
    skills: ['Plumbing', 'Diagnostics', 'Preventive Maintenance'],
    bio: '',
    avatar: '',
    rating: 4.9,
    reviewCount: 24,
    verified: true,
  });

  const [skillInput, setSkillInput] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      technicianService.getTechnicianByEmailOrUser(user),
      technicianService.getCategories(),
    ])
      .then(async ([profile, cats]) => {
        if (!active) return;
        setTechId(profile.id);
        setCategories(cats);
        setIsAvailable(profile.available ?? true);
        setProfileForm({
          name: profile.name || user?.name || 'Kasun Perera',
          phone: profile.phone || '077 456 7890',
          district: profile.district || 'Colombo',
          category: profile.category || 'Plumbing',
          experienceYears: profile.experienceYears ?? 5,
          visitFee: profile.visitFee ?? 1500,
          workingHours: profile.workingHours || '8:00 AM - 6:00 PM (Mon - Sat)',
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          bio: profile.bio || '',
          avatar: profile.avatar || '',
          rating: profile.rating ?? 4.9,
          reviewCount: profile.reviewCount ?? 0,
          verified: profile.verified ?? true,
        });

        const bookingList = await bookingService.getTechnicianBookings(profile.id);
        if (active) setBookings(bookingList);
      })
      .catch((err) => console.error('Failed to load technician dashboard:', err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id, user?.email]);

  const handleToggleAvailability = async () => {
    const nextValue = !isAvailable;
    setAvailabilitySaving(true);
    try {
      await technicianService.updateTechnicianAvailability(techId, nextValue);
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

  const handleBookingUpdated = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
    if (chatBooking?.id === updatedBooking.id) {
      setChatBooking(updatedBooking);
    }
  };

  const handleSubmitQuote = async (e, bookingId) => {
    e.preventDefault();
    setQuoteSaving(true);
    try {
      const updated = await bookingService.submitRepairQuote(bookingId, quoteForm);
      handleBookingUpdated(updated);
      setQuoteOpenId(null);
      setQuoteForm({ partsCost: '', laborCost: '', note: '' });
    } catch (err) {
      console.error('Failed to submit repair quote:', err);
    } finally {
      setQuoteSaving(false);
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

  const handleAddSkills = () => {
    const tokens = skillInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (tokens.length === 0) return;

    setProfileForm((prev) => {
      const existingLower = new Set(prev.skills.map((s) => s.toLowerCase()));
      const additions = tokens.filter((t) => !existingLower.has(t.toLowerCase()));
      return { ...prev, skills: [...prev.skills, ...additions] };
    });
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setSettingsSavedMsg('');

    try {
      const updated = await technicianService.updateTechnicianProfile(techId, {
        name: profileForm.name,
        phone: profileForm.phone,
        district: profileForm.district,
        category: profileForm.category,
        experienceYears: Number(profileForm.experienceYears),
        visitFee: Number(profileForm.visitFee),
        workingHours: profileForm.workingHours,
        skills: profileForm.skills,
        bio: profileForm.bio,
        avatar: profileForm.avatar,
        available: isAvailable,
      });

      if (updateUser) {
        updateUser({ name: updated.name, avatar: updated.avatar });
      }

      setSettingsSavedMsg('Profile updated! Changes are now live on Find Technicians.');
      setTimeout(() => setSettingsSavedMsg(''), 5000);
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

  const previewTechnician = {
    id: techId,
    name: profileForm.name || 'Your Name',
    category: profileForm.category,
    district: profileForm.district,
    rating: profileForm.rating || 4.9,
    reviewCount: profileForm.reviewCount || 0,
    visitFee: Number(profileForm.visitFee) || 0,
    experienceYears: Number(profileForm.experienceYears) || 1,
    verified: profileForm.verified,
    available: isAvailable,
    avatar: profileForm.avatar,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header & Availability Control */}
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {profileForm.name}
            </h1>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
              {profileForm.category}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              {profileForm.district}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Manage incoming service requests, active jobs, and your public technician profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Edit3 className="h-4 w-4 text-blue-700" />
            Edit Profile
          </button>

          {/* Interactive Availability Toggle Switch */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
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
                {isAvailable ? 'Visible to customers' : 'Paused from new requests'}
              </p>
            </div>
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
                            {job.isEmergency && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold uppercase text-white">
                                <Zap className="h-3 w-3" />
                                EMERGENCY
                              </span>
                            )}
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
                          {job.issuePhoto && (
                            <img
                              src={job.issuePhoto}
                              alt="Customer issue"
                              className="h-16 w-24 rounded-lg border border-slate-200 object-cover"
                            />
                          )}

                          {/* Live Quote Status & Inline Form */}
                          {job.quote?.status === 'Pending' && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                              <Clock className="h-3.5 w-3.5" />
                              Waiting for Customer Approval (Parts: Rs.{' '}
                              {Number(job.quote.partsCost).toLocaleString()} + Labor: Rs.{' '}
                              {Number(job.quote.laborCost).toLocaleString()})
                            </div>
                          )}

                          {job.quote?.status === 'Approved' && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                              Quote Approved &#10003; (Rs.{' '}
                              {(
                                (Number(job.quote.partsCost) || 0) +
                                (Number(job.quote.laborCost) || 0)
                              ).toLocaleString()}
                              )
                            </div>
                          )}

                          {job.quote?.status === 'Rejected' && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                              Quote Rejected by Customer
                            </div>
                          )}

                          {quoteOpenId === job.id && (
                            <form
                              onSubmit={(e) => handleSubmitQuote(e, job.id)}
                              className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                            >
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                                Send Repair Quote
                              </p>
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <input
                                  type="number"
                                  min={0}
                                  required
                                  placeholder="Parts Cost (LKR)"
                                  value={quoteForm.partsCost}
                                  onChange={(e) =>
                                    setQuoteForm({ ...quoteForm, partsCost: e.target.value })
                                  }
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                                />
                                <input
                                  type="number"
                                  min={0}
                                  required
                                  placeholder="Labor Cost (LKR)"
                                  value={quoteForm.laborCost}
                                  onChange={(e) =>
                                    setQuoteForm({ ...quoteForm, laborCost: e.target.value })
                                  }
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                                />
                              </div>
                              <input
                                type="text"
                                required
                                placeholder="Work note (e.g., Replace 32A MCB & wiring)"
                                value={quoteForm.note}
                                onChange={(e) =>
                                  setQuoteForm({ ...quoteForm, note: e.target.value })
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={quoteSaving}
                                  className="rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                                >
                                  {quoteSaving ? 'Sending...' : 'Submit Quote'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setQuoteOpenId(null)}
                                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
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

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setChatBooking(job)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Chat with Customer
                            </button>

                            {job.quote?.status !== 'Approved' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setQuoteOpenId(quoteOpenId === job.id ? null : job.id);
                                  setQuoteForm({
                                    partsCost: job.quote?.partsCost || '',
                                    laborCost: job.quote?.laborCost || '',
                                    note: job.quote?.note || '',
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                              >
                                <Receipt className="h-4 w-4" />
                                Send Repair Quote
                              </button>
                            )}

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

            {/* Tab 4: My Profile & Settings */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
                {/* Profile Form */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 xl:col-span-7">
                  <h2 className="text-lg font-bold text-slate-900">My Profile &amp; Settings</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Customize how your profile appears to customers across FixMate LK.
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

                  <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
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
                            JPG, PNG, or WEBP under 2MB. Clear headshot works best.
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
                              Remove
                            </button>
                          )}
                        </div>
                        {avatarError && (
                          <p className="text-xs font-medium text-red-600">{avatarError}</p>
                        )}
                      </div>
                    </div>

                    {/* Name & Phone */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="tech-name"
                          className="mb-1.5 block text-sm font-semibold text-slate-700"
                        >
                          Full Name
                        </label>
                        <input
                          id="tech-name"
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, name: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="tech-phone"
                          className="mb-1.5 block text-sm font-semibold text-slate-700"
                        >
                          Contact Phone
                        </label>
                        <input
                          id="tech-phone"
                          type="tel"
                          required
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          placeholder="077 123 4567"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                        />
                      </div>
                    </div>

                    {/* Category & District */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="tech-category"
                          className="mb-1.5 block text-sm font-semibold text-slate-700"
                        >
                          Primary Service Category
                        </label>
                        <select
                          id="tech-category"
                          value={profileForm.category}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, category: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
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

                    {/* Experience, Visit Fee, Working Hours */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <div>
                        <label
                          htmlFor="tech-experience"
                          className="mb-1.5 block text-sm font-semibold text-slate-700"
                        >
                          Experience (Years)
                        </label>
                        <input
                          id="tech-experience"
                          type="number"
                          min={0}
                          max={60}
                          required
                          value={profileForm.experienceYears}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, experienceYears: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="tech-visit-fee"
                          className="mb-1.5 block text-sm font-semibold text-slate-700"
                        >
                          Visit Fee (LKR)
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
                          htmlFor="tech-hours"
                          className="mb-1.5 block text-sm font-semibold text-slate-700"
                        >
                          Working Hours
                        </label>
                        <input
                          id="tech-hours"
                          type="text"
                          value={profileForm.workingHours}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, workingHours: e.target.value })
                          }
                          placeholder="8:00 AM - 6:00 PM"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                        />
                      </div>
                    </div>

                    {/* Skills / Specialties */}
                    <div>
                      <label
                        htmlFor="tech-skills"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Skills &amp; Specialties
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="tech-skills"
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkills();
                            }
                          }}
                          placeholder="Type skills separated by commas and click Add"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkills}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add
                        </button>
                      </div>

                      {profileForm.skills.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {profileForm.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                aria-label={`Remove ${skill}`}
                                className="rounded-full text-blue-500 hover:text-blue-800"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Detailed Service Bio */}
                    <div>
                      <label
                        htmlFor="tech-bio"
                        className="mb-1.5 block text-sm font-semibold text-slate-700"
                      >
                        Detailed Service Bio
                      </label>
                      <textarea
                        id="tech-bio"
                        rows={4}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Describe your experience, certifications, tools, and specialties..."
                        className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Mini-Preview Card */}
                <div className="xl:col-span-5">
                  <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-100/70 p-6">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                        Live Customer Card Preview
                      </h3>
                      <p className="text-xs text-slate-500">
                        Updates in real time as you edit your profile.
                      </p>
                    </div>
                    <TechnicianCard technician={previewTechnician} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BookingChatModal
        isOpen={Boolean(chatBooking)}
        booking={chatBooking}
        currentUserRole="TECHNICIAN"
        currentUserName={profileForm.name}
        onClose={() => setChatBooking(null)}
        onBookingUpdated={handleBookingUpdated}
      />
    </div>
  );
}
