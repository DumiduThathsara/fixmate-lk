import apiClient from './apiClient';
import { MOCK_TECHNICIANS, SERVICE_CATEGORIES } from '../data/mockData';

const USE_API = import.meta.env.VITE_ENABLE_API === 'true';
const TECHNICIANS_STORAGE_KEY = 'fixmate_technicians';

function normalizeTechnician(tech) {
  return {
    available: true,
    verified: true,
    workingHours: '8:00 AM - 6:00 PM (Mon - Sat)',
    skills: [tech.category, 'Diagnostics', 'Preventive Maintenance'],
    phone: '077 456 7890',
    ...tech,
  };
}

function readStoredTechnicians() {
  try {
    const raw = localStorage.getItem(TECHNICIANS_STORAGE_KEY);
    if (!raw) {
      const seeded = MOCK_TECHNICIANS.map(normalizeTechnician);
      localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed.map(normalizeTechnician)
      : MOCK_TECHNICIANS.map(normalizeTechnician);
  } catch {
    const seeded = MOCK_TECHNICIANS.map(normalizeTechnician);
    localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function writeStoredTechnicians(technicians) {
  localStorage.setItem(TECHNICIANS_STORAGE_KEY, JSON.stringify(technicians));
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
    return [...readStoredTechnicians()]
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
    const filtered = readStoredTechnicians().filter((tech) => {
      if (query) {
        const matchesSkills =
          Array.isArray(tech.skills) &&
          tech.skills.some((s) => s.toLowerCase().includes(query));
        const matchesQuery =
          tech.name.toLowerCase().includes(query) ||
          (tech.bio && tech.bio.toLowerCase().includes(query)) ||
          tech.category.toLowerCase().includes(query) ||
          matchesSkills;
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
 * Fetch a single technician by ID.
 */
export async function getTechnicianById(id) {
  try {
    if (USE_API) {
      const { data } = await apiClient.get(`/technicians/${id}`);
      return data;
    }

    const technicians = readStoredTechnicians();
    const match = technicians.find((t) => t.id === id);
    if (!match) {
      throw new Error('Technician not found.');
    }
    return match;
  } catch (error) {
    console.error('Failed to fetch technician by id:', error);
    throw error;
  }
}

/**
 * Match the logged-in technician from AuthContext or create/return an editable profile record.
 */
export async function getTechnicianByEmailOrUser(user) {
  try {
    if (USE_API) {
      const { data } = await apiClient.get('/technicians/me');
      return data;
    }

    const technicians = readStoredTechnicians();
    const email = user?.email?.toLowerCase();
    const existing = technicians.find(
      (t) =>
        (user?.id && t.id === user.id) ||
        (email && t.email && t.email.toLowerCase() === email)
    );

    if (existing) {
      return existing;
    }

    const newProfile = normalizeTechnician({
      id: user?.id || 'tech-1',
      name: user?.name || 'Kasun Perera',
      email: user?.email || '',
      phone: user?.phone || '077 456 7890',
      category: user?.serviceCategory || 'Plumbing',
      district: user?.district || 'Colombo',
      rating: 4.9,
      reviewCount: 24,
      visitFee: 1500,
      experienceYears: 5,
      verified: true,
      available: true,
      workingHours: '8:00 AM - 6:00 PM (Mon - Sat)',
      skills: [user?.serviceCategory || 'Plumbing', 'Diagnostics', 'Emergency Repairs'],
      bio: 'Verified local technician providing reliable, punctual residential and commercial repairs.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    });

    writeStoredTechnicians([newProfile, ...technicians]);
    return newProfile;
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

    const technicians = readStoredTechnicians();
    let updatedTech = null;

    const next = technicians.map((tech) => {
      if (tech.id === technicianId) {
        updatedTech = { ...tech, available: Boolean(isAvailable) };
        return updatedTech;
      }
      return tech;
    });

    if (updatedTech) {
      writeStoredTechnicians(next);
    }

    return updatedTech || { id: technicianId, available: Boolean(isAvailable) };
  } catch (error) {
    console.error('Failed to update availability:', error);
    throw error;
  }
}

/**
 * Update customizable technician profile fields across the shared store.
 */
export async function updateTechnicianProfile(id, updatedFields) {
  try {
    if (USE_API) {
      const { data } = await apiClient.patch(`/technicians/${id}/profile`, updatedFields);
      return data;
    }

    const technicians = readStoredTechnicians();
    let updatedTech = null;

    const sanitized = {
      ...updatedFields,
      ...(updatedFields.visitFee !== undefined
        ? { visitFee: Number(updatedFields.visitFee) }
        : {}),
      ...(updatedFields.experienceYears !== undefined
        ? { experienceYears: Number(updatedFields.experienceYears) }
        : {}),
      ...(updatedFields.bio !== undefined
        ? { bio: String(updatedFields.bio).trim() }
        : {}),
    };

    const next = technicians.map((tech) => {
      if (tech.id === id) {
        updatedTech = normalizeTechnician({ ...tech, ...sanitized });
        return updatedTech;
      }
      return tech;
    });

    if (!updatedTech) {
      updatedTech = normalizeTechnician({ id, ...sanitized });
      next.unshift(updatedTech);
    }

    writeStoredTechnicians(next);
    return updatedTech;
  } catch (error) {
    console.error('Failed to update technician profile:', error);
    throw error;
  }
}

const technicianService = {
  getCategories,
  getFeaturedTechnicians,
  searchTechnicians,
  getTechnicianById,
  getTechnicianByEmailOrUser,
  updateTechnicianAvailability,
  updateTechnicianProfile,
};

export default technicianService;
