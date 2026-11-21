import apiClient from './apiClient';

const TOKEN_KEY = 'token';
const USER_KEY = 'fixmate_user';
const MOCK_USERS_KEY = 'fixmate_mock_users';

const USE_API = import.meta.env.VITE_ENABLE_API === 'true';

function persistSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function createMockJwt(user) {
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })
  );
  return `mock-jwt.${payload}.fixmate-signature`;
}

function getMockRegistry() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMockRegistry(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

/**
 * Authenticate a Customer or Technician.
 */
export async function loginCustomerOrTech(credentials) {
  if (USE_API) {
    const { data } = await apiClient.post('/auth/login', credentials);
    persistSession(data.token, data.user);
    return data;
  }

  const email = (credentials.email || '').trim().toLowerCase();
  const password = credentials.password || '';

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  // Prevent admin accounts from logging in through the public portal in mock mode
  if (email.includes('admin')) {
    throw new Error('Invalid credentials for customer or technician portal.');
  }

  const registry = getMockRegistry();
  const existing = registry.find((u) => u.email.toLowerCase() === email);

  if (existing) {
    if (existing.password && existing.password !== password) {
      throw new Error('Invalid email or password.');
    }
    const user = {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      role: existing.role,
      phone: existing.phone,
      district: existing.district,
      serviceCategory: existing.serviceCategory,
    };
    const token = createMockJwt(user);
    persistSession(token, user);
    return { token, user };
  }

  const inferredRole = email.includes('tech') ? 'TECHNICIAN' : 'CUSTOMER';
  const nameFromEmail = email.split('@')[0].replace(/[._-]+/g, ' ');
  const formattedName = nameFromEmail
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  const user = {
    id: `${inferredRole.toLowerCase()}-${Date.now()}`,
    name: formattedName || (inferredRole === 'TECHNICIAN' ? 'Demo Technician' : 'Demo Customer'),
    email,
    role: inferredRole,
  };

  const token = createMockJwt(user);
  persistSession(token, user);
  return { token, user };
}

/**
 * Register a new Customer or Technician (public signup never assigns ADMIN).
 */
export async function registerUser(userData) {
  const safeRole = userData.role === 'TECHNICIAN' ? 'TECHNICIAN' : 'CUSTOMER';
  const payload = {
    ...userData,
    role: safeRole,
  };

  if (USE_API) {
    const { data } = await apiClient.post('/auth/register', payload);
    persistSession(data.token, data.user);
    return data;
  }

  const email = (payload.email || '').trim().toLowerCase();
  const registry = getMockRegistry();

  if (registry.some((u) => u.email.toLowerCase() === email)) {
    throw new Error('An account with this email already exists.');
  }

  const newUserRecord = {
    id: `${safeRole.toLowerCase()}-${Date.now()}`,
    name: payload.fullName.trim(),
    email,
    phone: payload.phone.trim(),
    district: payload.district,
    role: safeRole,
    ...(safeRole === 'TECHNICIAN' ? { serviceCategory: payload.serviceCategory } : {}),
    password: payload.password,
  };

  saveMockRegistry([...registry, newUserRecord]);

  const user = {
    id: newUserRecord.id,
    name: newUserRecord.name,
    email: newUserRecord.email,
    role: newUserRecord.role,
    phone: newUserRecord.phone,
    district: newUserRecord.district,
    ...(newUserRecord.serviceCategory ? { serviceCategory: newUserRecord.serviceCategory } : {}),
  };

  const token = createMockJwt(user);
  persistSession(token, user);
  return { token, user };
}

/**
 * Authenticate an Administrator via the restricted admin endpoint.
 */
export async function loginAdmin(credentials) {
  if (USE_API) {
    const { data } = await apiClient.post('/auth/admin/login', credentials);
    persistSession(data.token, data.user);
    return data;
  }

  const email = (credentials.email || '').trim().toLowerCase();
  const password = credentials.password || '';

  if (!email || password.length < 6) {
    throw new Error('Valid administrator email and password (min 6 characters) are required.');
  }

  const user = {
    id: 'admin-1',
    name: 'System Administrator',
    email,
    role: 'ADMIN',
  };

  const token = createMockJwt(user);
  persistSession(token, user);
  return { token, user };
}

/**
 * Clear the active authentication session.
 */
export function logout() {
  clearSession();
}

/**
 * Retrieve the currently persisted user if a token exists.
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
 * Update persisted user fields (e.g. name, avatar) after profile customization.
 */
export function updateCurrentUser(partialUser) {
  const current = getCurrentUser();
  if (!current) return null;
  const updated = { ...current, ...partialUser };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
}

const authService = {
  loginCustomerOrTech,
  registerUser,
  loginAdmin,
  logout,
  getCurrentUser,
  updateCurrentUser,
};

export default authService;
