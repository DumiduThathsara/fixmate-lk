import apiClient from './apiClient';

export async function getPlatformAnalytics() {
  const { data } = await apiClient.get('/admin/analytics');
  return data;
}

export async function getPendingTechnicians() {
  const { data } = await apiClient.get('/admin/technicians/pending');
  return data;
}

export async function verifyTechnician(techId, isApproved) {
  const { data } = await apiClient.patch(`/admin/technicians/${techId}/verify`, {
    approved: Boolean(isApproved),
  });
  return data;
}

export async function getAllPlatformBookings() {
  const { data } = await apiClient.get('/admin/bookings');
  return data;
}

export async function resolveDispute(bookingId) {
  const { data } = await apiClient.patch(`/admin/bookings/${bookingId}/resolve-dispute`);
  return data;
}

const adminService = {
  getPlatformAnalytics,
  getPendingTechnicians,
  verifyTechnician,
  getAllPlatformBookings,
  resolveDispute,
};

export default adminService;
