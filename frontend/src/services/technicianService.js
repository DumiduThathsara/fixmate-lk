import apiClient from './apiClient';

const SAVED_IDS_CACHE_KEY = 'fixmate_saved_technicians_cache';

function readSavedIdsCache() {
  try {
    const raw = localStorage.getItem(SAVED_IDS_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSavedIdsCache(ids) {
  localStorage.setItem(SAVED_IDS_CACHE_KEY, JSON.stringify(ids));
}

export async function getCategories() {
  const { data } = await apiClient.get('/categories');
  return data;
}

export async function getFeaturedTechnicians(limit = 4) {
  const { data } = await apiClient.get('/technicians/featured', {
    params: { limit },
  });
  return data;
}

export async function searchTechnicians({
  search = '',
  category = 'All',
  district = 'All',
  minRating = 0,
  maxFee = 5000,
  urgentOnly = false,
  sortBy = 'rating_desc',
  page = 1,
  limit = 6,
} = {}) {
  const { data } = await apiClient.get('/technicians', {
    params: {
      search,
      category,
      district,
      minRating,
      maxFee,
      urgentOnly,
      sortBy,
      page,
      limit,
    },
  });
  return data;
}

export async function getTechnicianById(id) {
  const { data } = await apiClient.get(`/technicians/${id}`);
  return data;
}

export async function getTechnicianByEmailOrUser() {
  const { data } = await apiClient.get('/technicians/me');
  return data;
}

export async function updateTechnicianAvailability(_technicianId, isAvailable) {
  const { data } = await apiClient.patch('/technicians/availability', {
    available: Boolean(isAvailable),
  });
  return data;
}

export async function updateTechnicianProfile(_id, updatedFields) {
  const { data } = await apiClient.put('/technicians/profile', updatedFields);
  return data;
}

export function getSavedTechnicianIds() {
  if (!localStorage.getItem('fixmate_token')) {
    return [];
  }
  return readSavedIdsCache();
}

export async function toggleSavedTechnician(techId) {
  const { data } = await apiClient.post(`/users/saved-technicians/${techId}`);
  writeSavedIdsCache(data.savedIds || []);
  return data;
}

export async function getSavedTechnicians() {
  if (!localStorage.getItem('fixmate_token')) {
    return [];
  }
  const { data } = await apiClient.get('/users/saved-technicians');
  writeSavedIdsCache(data.map((t) => t.id));
  return data;
}

const technicianService = {
  getCategories,
  getFeaturedTechnicians,
  searchTechnicians,
  getTechnicianById,
  getTechnicianByEmailOrUser,
  updateTechnicianAvailability,
  updateTechnicianProfile,
  getSavedTechnicianIds,
  toggleSavedTechnician,
  getSavedTechnicians,
};

export default technicianService;
