import apiClient from './apiClient';
import { MOCK_TECHNICIANS, SERVICE_CATEGORIES } from '../data/mockData';

const USE_API = import.meta.env.VITE_ENABLE_API === 'true';
const TECH_PROFILES_KEY = 'fixmate_tech_profiles';

function readTechProfiles() {
  try {
    const raw = localStorage.getItem(TECH_PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeTechProfiles(profiles) {
  localStorage.setItem(TECH_PROFILES_KEY, JSON.stringify(profiles));
}

/**
 * Fetch available service categories.
 */
export async function getCategories() {
  try {
    if (USE_API) {
      const { data } = await apiClient.get('/categories');
      return data;
    }
    return SERVICE_CATEGORIES;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
}

/**
 * Fetch top-rated featured technicians.
 */
export async function getFeaturedTechnicians(limit = 4) {
  try {
    if (USE_API) {
      const { data } = await apiClient.get('/technicians', {
        params: { featured: true, limit },
      });
      return data;
    }
    return [...MOCK_TECHNICIANS]
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch featured technicians:', error);
    throw error;
  }
}

/**
 * Search, filter, sort, and paginate technicians.
 * Mirrors GET /api/v1/technicians?page=1&limit=6 response shape.
 */
export async function searchTechnicians({
  search = '',
  category = 'All',
  district = 'All',
  minRating = 0,
  maxFee = 5000,
  sortBy = 'rating_desc',
  page = 1,
  limit = 6,
} = {}) {
  try {
    if (USE_API) {
      const { data } = await apiClient.get('/technicians', {
        params: { search, category, district, minRating, maxFee, sortBy, page, limit },
      });
      return data;
    }

    const query = search.trim().toLowerCase();
    const filtered = MOCK_TECHNICIANS.filter((tech) => {
      if (query) {
        const matchesQuery =
          tech.name.toLowerCase().includes(query) ||
          (tech.bio && tech.bio.toLowerCase().includes(query)) ||
          tech.category.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (category && category !== 'All' && tech.category !== category) {
        return false;
      }

      if (district && district !== 'All' && tech.district !== district) {
        return false;
      }

      if (minRating > 0 && tech.rating < Number(minRating)) {
        return false;
      }

      if (maxFee && tech.visitFee > Number(maxFee)) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'fee_asc':
          return a.visitFee - b.visitFee;
        case 'fee_desc':
          return b.visitFee - a.visitFee;
        case 'experience_desc':
          return b.experienceYears - a.experienceYears;
        case 'rating_desc':
        default:
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
      }
    });

    const safeLimit = Math.max(1, Number(limit) || 6);
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));
    const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
    const startIndex = (currentPage - 1) * safeLimit;
    const data = sorted.slice(startIndex, startIndex + safeLimit);

    return {
      data,
      totalItems,
      totalPages,
      currentPage,
    };
  } catch (error) {
    console.error('Failed to search technicians:', error);
    throw error;
  }
}

/**
 * Load a technician's profile settings & availability.
 */
export async function getTechnicianProfile(technicianId, fallback = {}) {
  try {
    if (USE_API) {
      const { data } = await apiClient.get(`/technicians/${technicianId}/profile`);
      return data;
    }

    const key = technicianId || 'default-technician';
    const profiles = readTechProfiles();
    return {
      available: true,
      visitFee: 1500,
      district: fallback.district || 'Colombo',
      bio: 'Experienced and verified local technician providing reliable residential and commercial repairs.',
      ...profiles[key],
    };
  } catch (error) {
    console.error('Failed to load technician profile:', error);
    throw error;
  }
}

/**
 * Toggle technician availability for new bookings.
 */
export async function updateTechnicianAvailability(technicianId, isAvailable) {
  try {
    if (USE_API) {
      const { data } = await apiClient.patch(`/technicians/${technicianId}/availability`, {
        available: isAvailable,
      });
      return data;
    }

    const key = technicianId || 'default-technician';
    const profiles = readTechProfiles();
    const updated = {
      ...(profiles[key] || {}),
      available: Boolean(isAvailable),
    };
    writeTechProfiles({ ...profiles, [key]: updated });
    return updated;
  } catch (error) {
    console.error('Failed to update availability:', error);
    throw error;
  }
}

/**
 * Update technician profile settings (visit fee, bio, district).
 */
export async function updateTechnicianProfile(technicianId, { visitFee, bio, district }) {
  try {
    if (USE_API) {
      const { data } = await apiClient.patch(`/technicians/${technicianId}/profile`, {
        visitFee,
        bio,
        district,
      });
      return data;
    }

    const key = technicianId || 'default-technician';
    const profiles = readTechProfiles();
    const updated = {
      ...(profiles[key] || {}),
      visitFee: Number(visitFee),
      bio: (bio || '').trim(),
      district,
    };
    writeTechProfiles({ ...profiles, [key]: updated });
    return updated;
  } catch (error) {
    console.error('Failed to update technician profile:', error);
    throw error;
  }
}

const technicianService = {
  getCategories,
  getFeaturedTechnicians,
  searchTechnicians,
  getTechnicianProfile,
  updateTechnicianAvailability,
  updateTechnicianProfile,
};

export default technicianService;
