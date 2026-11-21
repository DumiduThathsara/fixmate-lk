import apiClient from './apiClient';

const TOKEN_KEY = 'fixmate_token';
const USER_KEY = 'fixmate_user';

function persistSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Authenticate a Customer or Technician via POST /api/v1/auth/login.
 */
export async function loginCustomerOrTech(credentials) {
  const { data } = await apiClient.post('/auth/login', {
    email: credentials.email,
    password: credentials.password,
  });
  persistSession(data.token, data.user);
  return data;
}

/**
 * Register a new Customer or Technician via POST /api/v1/auth/register.
 */
export async function registerUser(userData) {
  const payload = {
    fullName: userData.fullName,
    email: userData.email,
    phone: userData.phone,
    district: userData.district,
    role: userData.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'CUSTOMER',
    serviceCategory: userData.serviceCategory,
    password: userData.password,
  };
  const { data } = await apiClient.post('/auth/register', payload);
  persistSession(data.token, data.user);
  return data;
}

/**
 * Authenticate an Administrator via POST /api/v1/auth/admin/login.
 */
export async function loginAdmin(credentials) {
  const { data } = await apiClient.post('/auth/admin/login', {
    email: credentials.email,
    password: credentials.password,
  });
  persistSession(data.token, data.user);
  return data;
}

/**
 * Clear the active authentication session.
 */
export function logout() {
  clearSession();
}

/**
 * Synchronously read the cached user session if a token exists.
 */
export function getCurrentUser() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const rawUser = localStorage.getItem(USER_KEY);
    if (!token || !rawUser) {
      return null;
    }
    return JSON.parse(rawUser);
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Fetch the authenticated user's latest profile from GET /api/v1/users/me.
 */
export async function fetchCurrentUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const { data } = await apiClient.get('/users/me');
  localStorage.setItem(USER_KEY, JSON.stringify(data));
  return data;
}

/**
 * Update persisted user fields locally after technician profile edit.
 */
export function updateCurrentUser(partialUser) {
  const current = getCurrentUser();
  if (!current) return null;
  const updated = { ...current, ...partialUser };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Update the logged-in user's profile via PUT /api/v1/users/profile.
 */
export async function updateUserProfile(updatedFields) {
  const { data } = await apiClient.put('/users/profile', updatedFields);
  localStorage.setItem(USER_KEY, JSON.stringify(data));
  return data;
}

const authService = {
  loginCustomerOrTech,
  registerUser,
  loginAdmin,
  logout,
  getCurrentUser,
  fetchCurrentUser,
  updateCurrentUser,
  updateUserProfile,
};

export default authService;
