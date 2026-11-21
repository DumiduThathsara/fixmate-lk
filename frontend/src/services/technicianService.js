import apiClient from './apiClient';
import { MOCK_TECHNICIANS, SERVICE_CATEGORIES } from '../data/mockData';

const USE_API = import.meta.env.VITE_ENABLE_API === 'true';

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

const technicianService = {
  getCategories,
  getFeaturedTechnicians,
  searchTechnicians,
};

export default technicianService;
