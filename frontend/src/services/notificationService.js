import apiClient from './apiClient';

export async function getNotifications(role) {
  if (!localStorage.getItem('fixmate_token')) {
    return [];
  }
  const { data } = await apiClient.get('/notifications', {
    params: role ? { role } : undefined,
  });
  return data;
}

export async function markAllAsRead(role) {
  if (!localStorage.getItem('fixmate_token')) {
    return [];
  }
  const { data } = await apiClient.patch('/notifications/read-all', null, {
    params: role ? { role } : undefined,
  });
  return data;
}

const notificationService = {
  getNotifications,
  markAllAsRead,
};

export default notificationService;
