const NOTIFICATIONS_KEY = 'fixmate_notifications';

const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    targetRole: 'CUSTOMER',
    title: 'Technician Accepted Your Request',
    message: 'Nimal Silva accepted your Electrical booking. Share PIN 4829 when he arrives.',
    link: '/customer/dashboard',
    read: false,
    createdAt: '2026-11-21T10:15:00Z',
  },
  {
    id: 'notif-2',
    targetRole: 'CUSTOMER',
    title: 'Repair Quote Ready',
    message: 'Nimal Silva sent a repair estimate of Rs. 3,700 for your review.',
    link: '/customer/dashboard',
    read: false,
    createdAt: '2026-11-21T10:20:00Z',
  },
  {
    id: 'notif-3',
    targetRole: 'TECHNICIAN',
    title: 'New Emergency Request',
    message: 'Amaya Perera requested urgent Plumbing assistance in Colombo.',
    link: '/technician/dashboard',
    read: false,
    createdAt: '2026-11-21T08:30:00Z',
  },
  {
    id: 'notif-4',
    targetRole: 'ADMIN',
    title: 'Pending Technician Verifications',
    message: '2 new technician applications are awaiting ID verification.',
    link: '/admin/dashboard',
    read: false,
    createdAt: '2026-11-21T07:45:00Z',
  },
];

function readStoredNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(SEED_NOTIFICATIONS));
      return SEED_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_NOTIFICATIONS;
  } catch {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(SEED_NOTIFICATIONS));
    return SEED_NOTIFICATIONS;
  }
}

function writeStoredNotifications(list) {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
}

export async function getNotifications(role) {
  const all = readStoredNotifications();
  if (!role) return all;
  return all.filter((n) => n.targetRole === role || n.targetRole === 'ALL');
}

export async function addNotification({ targetRole = 'CUSTOMER', title, message, link = '/' }) {
  const all = readStoredNotifications();
  const next = [
    {
      id: `notif-${Date.now()}`,
      targetRole,
      title,
      message,
      link,
      read: false,
      createdAt: new Date().toISOString(),
    },
    ...all,
  ];
  writeStoredNotifications(next);
  return next[0];
}

export async function markAllAsRead(role) {
  const all = readStoredNotifications();
  const next = all.map((n) =>
    !role || n.targetRole === role || n.targetRole === 'ALL' ? { ...n, read: true } : n
  );
  writeStoredNotifications(next);
  return getNotifications(role);
}

const notificationService = {
  getNotifications,
  addNotification,
  markAllAsRead,
};

export default notificationService;
