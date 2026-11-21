import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Briefcase,
  Check,
  CheckCircle2,
  ClipboardList,
  MapPin,
  ShieldCheck,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import adminService from '../services/adminService';

const ADMIN_TABS = [
  { id: 'verifications', label: 'Technician Verification Queue' },
  { id: 'bookings', label: 'All Bookings & Disputes' },
  { id: 'analytics', label: 'District & Category Analytics' },
];

const STATUS_BADGE_STYLES = {
  Pending: 'bg-amber-100 text-amber-800',
  Accepted: 'bg-blue-100 text-blue-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
  Declined: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('verifications');
  const [analytics, setAnalytics] = useState(null);
  const [pendingTechs, setPendingTechs] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [stats, pending, bookings] = await Promise.all([
        adminService.getPlatformAnalytics(),
        adminService.getPendingTechnicians(),
        adminService.getAllPlatformBookings(),
      ]);
      setAnalytics(stats);
      setPendingTechs(pending);
      setAllBookings(bookings);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyTechnician = async (techId, isApproved) => {
    setActionId(techId);
    try {
      await adminService.verifyTechnician(techId, isApproved);
      await loadAdminData();
    } catch (err) {
      console.error('Failed to process technician verification:', err);
    } finally {
      setActionId(null);
    }
  };

  const handleResolveDispute = async (bookingId) => {
    setActionId(bookingId);
    try {
      await adminService.resolveDispute(bookingId);
      await loadAdminData();
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
    } finally {
      setActionId(null);
    }
  };

  const maxDistrictCount = Math.max(
    1,
    ...(analytics?.districtCounts?.map((d) => d.count) || [1])
  );
  const maxCategoryRevenue = Math.max(
    1,
    ...(analytics?.categoryBreakdown?.map((c) => c.revenue) || [1])
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-amber-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Oversight Portal
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            FixMate LK Platform Operations
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Verify technicians, resolve booking disputes, and monitor island-wide analytics.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Platform Revenue
            </span>
            <Wallet className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            Rs. {(analytics?.totalRevenue || 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active Bookings
            </span>
            <Briefcase className="h-5 w-5 text-blue-700" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {analytics?.activeBookingsCount || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Pending Verifications
            </span>
            <UserCheck className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {analytics?.pendingVerificationsCount || 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Open Disputes
            </span>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {analytics?.activeDisputesCount || 0}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {ADMIN_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {loading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-white p-6" />
        ) : (
          <>
            {/* Tab 1: Technician Verification Queue */}
            {activeTab === 'verifications' && (
              <div className="space-y-4">
                {pendingTechs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                    <h3 className="mt-3 text-base font-bold text-slate-900">
                      All technician applications reviewed
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      No pending verifications in the queue right now.
                    </p>
                  </div>
                ) : (
                  pendingTechs.map((tech) => (
                    <article
                      key={tech.id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={tech.avatar}
                          alt={tech.name}
                          className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-bold text-slate-900">{tech.name}</h2>
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                              {tech.category}
                            </span>
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              Pending Verification
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {tech.district}
                            </span>{' '}
                            &bull; {tech.experienceYears} yrs experience &bull; Visit Fee: Rs.{' '}
                            {Number(tech.visitFee).toLocaleString()}
                          </p>
                          <p className="mt-1.5 text-sm text-slate-600">{tech.bio}</p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2.5">
                        <button
                          type="button"
                          disabled={actionId === tech.id}
                          onClick={() => handleVerifyTechnician(tech.id, false)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={actionId === tech.id}
                          onClick={() => handleVerifyTechnician(tech.id, true)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
                        >
                          <Check className="h-4 w-4" />
                          Approve &amp; Verify
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: All Bookings & Dispute Resolution */}
            {activeTab === 'bookings' && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {allBookings.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">No bookings found.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {allBookings.map((b) => (
                      <div
                        key={b.id}
                        className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              #{b.id}
                            </span>
                            <span className="text-sm font-bold text-slate-900">
                              {b.customerName || 'Customer'} &rarr; {b.technicianName}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                STATUS_BADGE_STYLES[b.status] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {b.category} &bull; {b.district} &bull; {b.scheduledDate} &bull; Rs.{' '}
                            {Number(b.visitFee).toLocaleString()}
                          </p>
                          {b.dispute?.isFlagged && (
                            <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Dispute: {b.dispute.reason}
                              {b.dispute.resolved && ' (Resolved)'}
                            </div>
                          )}
                        </div>

                        {b.dispute?.isFlagged && !b.dispute?.resolved && (
                          <button
                            type="button"
                            disabled={actionId === b.id}
                            onClick={() => handleResolveDispute(b.id)}
                            className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: District & Category Analytics */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Districts by Demand */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-700" />
                    <h2 className="text-base font-bold text-slate-900">
                      Top Districts by Booking Demand
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {(analytics?.districtCounts || []).map((item) => {
                      const pct = Math.round((item.count / maxDistrictCount) * 100);
                      return (
                        <div key={item.district}>
                          <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700">
                            <span>{item.district}</span>
                            <span>{item.count} bookings</span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revenue by Service Category */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-amber-500" />
                    <h2 className="text-base font-bold text-slate-900">
                      Revenue by Service Category
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {(analytics?.categoryBreakdown || []).map((item) => {
                      const pct = Math.round((item.revenue / maxCategoryRevenue) * 100);
                      return (
                        <div key={item.category}>
                          <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700">
                            <span>{item.category}</span>
                            <span>Rs. {item.revenue.toLocaleString()}</span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-amber-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
