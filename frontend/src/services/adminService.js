import apiClient from './apiClient';
import { MOCK_TECHNICIANS } from '../data/mockData';

const USE_API = import.meta.env.VITE_ENABLE_API === 'true';
const TECHNICIANS_STORAGE_KEY = 'fixmate_technicians';
const BOOKINGS_STORAGE_KEY = 'fixmate_bookings';
const MOCK_USERS_KEY = 'fixmate_mock_users';

const PENDING_APPLICANT_SEEDS = [
  {
    id: 'tech-pending-1',
    name: 'Gayan Madhushanka',
    category: 'Plumbing',
    district: 'Gampaha',
    rating: 4.7,
    reviewCount: 12,
    visitFee: 1400,
    experienceYears: 5,
    verified: false,
    available: true,
    phone: '077 623 9012',
    bio: 'Specialist in domestic plumbing, pressure pump repairs, and solar hot-water piping.',
    avatar: 'https://randomuser.me/api/portraits/men/83.jpg',
  },
  {
    id: 'tech-pending-2',
    name: 'Kavinda Rajapaksha',
    category: 'Electrical',
    district: 'Kandy',
    rating: 4.8,
    reviewCount: 19,
    visitFee: 1600,
    experienceYears: 6,
    verified: false,
    available: true,
    phone: '071 445 7821',
    bio: 'NVQ Level 4 certified electrician for residential wiring, DB upgrades, and inverter installs.',
    avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
  },
];

function readTechnicians() {
  try {
    const raw = localStorage.getItem(TECHNICIANS_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [...MOCK_TECHNICIANS];
    const hasSeededPending = list.some((t) => t.id === 'tech-pending-1');
    if (!hasSeededPending) {
      const merged = [...PENDING_APPLICANT_SEEDS, ...list];
      localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return list;
  } catch {
    return [...PENDING_APPLICANT_SEEDS, ...MOCK_TECHNICIANS];
  }
}

function writeTechnicians(list) {
  localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(list));
}

function readBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeBookings(list) {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(list));
}

function readUsersCount() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    const registered = raw ? JSON.parse(raw).length : 0;
    return 140 + registered;
  } catch {
    return 140;
  }
}

/**
 * Aggregate platform-wide KPIs, district demand, and category revenue.
 */
export async function getPlatformAnalytics() {
  try {
    if (USE_API) {
      const { data } = await apiClient.get('/admin/analytics');
      return data;
    }

    const technicians = readTechnicians().filter((t) => !t.rejected);
    const bookings = readBookings();

    const verifiedTechniciansCount = technicians.filter((t) => t.verified).length;
    const pendingVerificationsCount = technicians.filter((t) => !t.verified).length;
    const activeBookingsCount = bookings.filter(
      (b) => b.status === 'Pending' || b.status === 'Accepted'
    ).length;
    const activeDisputesCount = bookings.filter(
      (b) => b.dispute?.isFlagged && !b.dispute?.resolved
    ).length;

    const totalRevenue = bookings
      .filter((b) => b.status === 'Completed')
      .reduce((sum, b) => {
        const quoteTotal =
          b.quote?.status === 'Approved'
            ? (Number(b.quote.partsCost) || 0) + (Number(b.quote.laborCost) || 0)
            : 0;
        return sum + (Number(b.visitFee) || 0) + quoteTotal;
      }, 0);

    const districtMap = {};
    const categoryMap = {};

    bookings.forEach((b) => {
      if (b.district) {
        districtMap[b.district] = (districtMap[b.district] || 0) + 1;
      }
      if (b.category) {
        const quoteTotal =
          b.quote?.status === 'Approved'
            ? (Number(b.quote.partsCost) || 0) + (Number(b.quote.laborCost) || 0)
            : 0;
        const amount =
          b.status === 'Completed' ? (Number(b.visitFee) || 0) + quoteTotal : Number(b.visitFee) || 0;
        categoryMap[b.category] = (categoryMap[b.category] || 0) + amount;
      }
    });

    const districtCounts = Object.entries(districtMap)
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count);

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalUsers: readUsersCount() + technicians.length,
      verifiedTechniciansCount,
      pendingVerificationsCount,
      activeBookingsCount,
      activeDisputesCount,
      totalRevenue,
      districtCounts,
      categoryBreakdown,
    };
  } catch (error) {
    console.error('Failed to load platform analytics:', error);
    throw error;
  }
}

/**
 * Retrieve technicians awaiting verification.
 */
export async function getPendingTechnicians() {
  try {
    if (USE_API) {
      const { data } = await apiClient.get('/admin/technicians/pending');
      return data;
    }
    return readTechnicians().filter((t) => !t.verified && !t.rejected);
  } catch (error) {
    console.error('Failed to fetch pending technicians:', error);
    throw error;
  }
}

/**
 * Approve or reject a technician verification request.
 */
export async function verifyTechnician(techId, isApproved) {
  try {
    if (USE_API) {
      const { data } = await apiClient.patch(`/admin/technicians/${techId}/verify`, {
        approved: isApproved,
      });
      return data;
    }

    const technicians = readTechnicians();
    const next = isApproved
      ? technicians.map((t) => (t.id === techId ? { ...t, verified: true, rejected: false } : t))
      : technicians.filter((t) => t.id !== techId);

    writeTechnicians(next);
    return { techId, verified: isApproved };
  } catch (error) {
    console.error('Failed to verify technician:', error);
    throw error;
  }
}

/**
 * Retrieve all platform bookings for oversight and dispute resolution.
 */
export async function getAllPlatformBookings() {
  try {
    if (USE_API) {
      const { data } = await apiClient.get('/admin/bookings');
      return data;
    }
    return readBookings();
  } catch (error) {
    console.error('Failed to fetch platform bookings:', error);
    throw error;
  }
}

/**
 * Mark a flagged booking dispute as resolved.
 */
export async function resolveDispute(bookingId) {
  try {
    if (USE_API) {
      const { data } = await apiClient.patch(`/admin/bookings/${bookingId}/resolve-dispute`);
      return data;
    }

    const bookings = readBookings();
    let updatedBooking = null;

    const next = bookings.map((b) => {
      if (b.id === bookingId) {
        updatedBooking = {
          ...b,
          dispute: {
            ...(b.dispute || {}),
            resolved: true,
          },
        };
        return updatedBooking;
      }
      return b;
    });

    writeBookings(next);
    return updatedBooking;
  } catch (error) {
    console.error('Failed to resolve dispute:', error);
    throw error;
  }
}

const adminService = {
  getPlatformAnalytics,
  getPendingTechnicians,
  verifyTechnician,
  getAllPlatformBookings,
  resolveDispute,
};

export default adminService;
