import apiClient from './apiClient';

const BOOKINGS_STORAGE_KEY = 'fixmate_bookings';
const USE_API = import.meta.env.VITE_ENABLE_API === 'true';

const INITIAL_SEED_BOOKINGS = [
  {
    id: 'bk-1001',
    customerId: 'demo-customer',
    customerName: 'Amaya Perera',
    customerPhone: '077 245 8890',
    technicianId: 'tech-1',
    technicianName: 'Kasun Perera',
    category: 'Plumbing',
    district: 'Colombo',
    scheduledDate: '2026-11-24',
    timeSlot: '09:00 AM - 11:00 AM',
    serviceAddress: 'No. 42, Galle Road, Dehiwala, Colombo',
    issueDescription: 'Kitchen sink pipe leakage and low water pressure in upstairs bathroom.',
    visitFee: 1500,
    status: 'Pending',
    hasReviewed: false,
    isEmergency: true,
    issuePhoto: null,
    messages: [
      {
        id: 'msg-1',
        senderRole: 'CUSTOMER',
        senderName: 'Amaya Perera',
        text: 'Water is dripping steadily under the kitchen sink. Please bring standard PVC fittings.',
        timestamp: '2026-11-21T08:35:00Z',
      },
    ],
    quote: { partsCost: 0, laborCost: 0, note: '', status: 'None' },
    dispute: { isFlagged: false, reason: '', resolved: false },
    createdAt: '2026-11-21T08:30:00Z',
  },
  {
    id: 'bk-1002',
    customerId: 'demo-customer',
    customerName: 'Dilshan Fernando',
    customerPhone: '071 834 1120',
    technicianId: 'tech-2',
    technicianName: 'Nimal Silva',
    category: 'Electrical',
    district: 'Gampaha',
    scheduledDate: '2026-11-23',
    timeSlot: '02:00 PM - 04:00 PM',
    serviceAddress: 'No. 18/3, Negombo Road, Wattala, Gampaha',
    issueDescription: 'Main distribution breaker trips intermittently when AC is turned on.',
    visitFee: 1800,
    status: 'Accepted',
    hasReviewed: false,
    isEmergency: false,
    issuePhoto: null,
    messages: [
      {
        id: 'msg-2',
        senderRole: 'TECHNICIAN',
        senderName: 'Nimal Silva',
        text: 'I will inspect the 32A MCB and load balance when I arrive at 2:00 PM.',
        timestamp: '2026-11-20T15:00:00Z',
      },
    ],
    quote: {
      partsCost: 2200,
      laborCost: 1500,
      note: 'Replace faulty 32A Hager MCB and tighten neutral busbar connections.',
      status: 'Pending',
    },
    dispute: { isFlagged: false, reason: '', resolved: false },
    createdAt: '2026-11-20T14:15:00Z',
  },
  {
    id: 'bk-1003',
    customerId: 'demo-customer',
    customerName: 'Sachini Jayawardena',
    customerPhone: '076 512 3349',
    technicianId: 'tech-3',
    technicianName: 'Ruwan Jayawardena',
    category: 'AC Repair',
    district: 'Kandy',
    scheduledDate: '2026-11-15',
    timeSlot: '10:00 AM - 12:00 PM',
    serviceAddress: 'No. 75, Peradeniya Road, Kandy',
    issueDescription: '12,000 BTU split AC full chemical wash and refrigerant top-up.',
    visitFee: 2500,
    status: 'Completed',
    hasReviewed: false,
    isEmergency: false,
    issuePhoto: null,
    messages: [],
    quote: {
      partsCost: 3000,
      laborCost: 2000,
      note: 'R32 refrigerant top-up and indoor coil chemical wash.',
      status: 'Approved',
    },
    dispute: { isFlagged: false, reason: '', resolved: false },
    createdAt: '2026-11-12T10:00:00Z',
  },
  {
    id: 'bk-1004',
    customerId: 'demo-customer',
    customerName: 'Nuwan Wickramasinghe',
    customerPhone: '077 908 4412',
    technicianId: 'tech-4',
    technicianName: 'Tharindu Bandara',
    category: 'Carpentry',
    district: 'Galle',
    scheduledDate: '2026-11-08',
    timeSlot: '01:00 PM - 03:00 PM',
    serviceAddress: 'No. 11, Wakwella Road, Galle',
    issueDescription: 'Teak main entrance door hinge alignment and smart lock installation.',
    visitFee: 1500,
    status: 'Completed',
    hasReviewed: true,
    isEmergency: false,
    issuePhoto: null,
    messages: [],
    quote: { partsCost: 0, laborCost: 0, note: '', status: 'None' },
    dispute: { isFlagged: false, reason: '', resolved: false },
    review: {
      rating: 5,
      comment: 'Punctual, neat workmanship, and completed the lock fitting smoothly.',
      submittedAt: '2026-11-08T16:45:00Z',
    },
    createdAt: '2026-11-05T09:20:00Z',
  },
];

function normalizeBooking(booking) {
  return {
    isEmergency: false,
    issuePhoto: null,
    messages: [],
    quote: { partsCost: 0, laborCost: 0, note: '', status: 'None' },
    dispute: { isFlagged: false, reason: '', resolved: false },
    ...booking,
    messages: Array.isArray(booking.messages) ? booking.messages : [],
    quote: {
      partsCost: 0,
      laborCost: 0,
      note: '',
      status: 'None',
      ...(booking.quote || {}),
    },
    dispute: {
      isFlagged: false,
      reason: '',
      resolved: false,
      ...(booking.dispute || {}),
    },
  };
}

function readStoredBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_BOOKINGS));
      return INITIAL_SEED_BOOKINGS.map(normalizeBooking);
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map(normalizeBooking)
      : INITIAL_SEED_BOOKINGS.map(normalizeBooking);
  } catch {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_BOOKINGS));
    return INITIAL_SEED_BOOKINGS.map(normalizeBooking);
  }
}

function writeStoredBookings(bookings) {
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
}

/**
 * Retrieve all bookings for the logged-in customer.
 */
export async function getCustomerBookings(customerId) {
  try {
    if (USE_API) {
      const { data } = await apiClient.get('/bookings/customer', {
        params: customerId ? { customerId } : undefined,
      });
      return data;
    }

    const bookings = readStoredBookings();
    return bookings.filter(
      (b) => !customerId || b.customerId === 'demo-customer' || b.customerId === customerId
    );
  } catch (error) {
    console.error('Failed to fetch customer bookings:', error);
    throw error;
  }
}

/**
 * Retrieve bookings for the technician portal.
 */
export async function getTechnicianBookings(technicianId) {
  try {
    if (USE_API) {
      const { data } = await apiClient.get('/bookings/technician', {
        params: technicianId ? { technicianId } : undefined,
      });
      return data;
    }

    return readStoredBookings();
  } catch (error) {
    console.error('Failed to fetch technician bookings:', error);
    throw error;
  }
}

/**
 * Create a new service booking.
 */
export async function createBooking(bookingData) {
  try {
    if (USE_API) {
      const { data } = await apiClient.post('/bookings', bookingData);
      return data;
    }

    const bookings = readStoredBookings();
    const newBooking = normalizeBooking({
      id: `bk-${Date.now()}`,
      status: 'Pending',
      hasReviewed: false,
      createdAt: new Date().toISOString(),
      ...bookingData,
    });
    const updated = [newBooking, ...bookings];
    writeStoredBookings(updated);
    return newBooking;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
}

/**
 * Cancel a pending booking.
 */
export async function cancelBooking(bookingId) {
  try {
    if (USE_API) {
      const { data } = await apiClient.patch(`/bookings/${bookingId}/cancel`);
      return data;
    }

    const bookings = readStoredBookings();
    let updatedBooking = null;

    const nextBookings = bookings.map((booking) => {
      if (booking.id === bookingId) {
        updatedBooking = { ...booking, status: 'Cancelled' };
        return updatedBooking;
      }
      return booking;
    });

    if (!updatedBooking) {
      throw new Error('Booking not found.');
    }

    writeStoredBookings(nextBookings);
    return updatedBooking;
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    throw error;
  }
}

const ALLOWED_TECH_STATUSES = ['Accepted', 'Declined', 'Completed'];

/**
 * Update a booking's status from the Technician Portal (Accepted, Declined, Completed).
 */
export async function updateBookingStatus(bookingId, newStatus) {
  if (!ALLOWED_TECH_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status transition: ${newStatus}`);
  }

  try {
    if (USE_API) {
      const { data } = await apiClient.patch(`/bookings/${bookingId}/status`, {
        status: newStatus,
      });
      return data;
    }

    const bookings = readStoredBookings();
    let updatedBooking = null;

    const nextBookings = bookings.map((booking) => {
      if (booking.id === bookingId) {
        updatedBooking = { ...booking, status: newStatus };
        return updatedBooking;
      }
      return booking;
    });

    if (!updatedBooking) {
      throw new Error('Booking not found.');
    }

    writeStoredBookings(nextBookings);
    return updatedBooking;
  } catch (error) {
    console.error('Failed to update booking status:', error);
    throw error;
  }
}

/**
 * Submit a star rating and optional comment for a completed booking.
 */
export async function submitReview(bookingId, { rating, comment }) {
  try {
    if (USE_API) {
      const { data } = await apiClient.post(`/bookings/${bookingId}/review`, {
        rating,
        comment,
      });
      return data;
    }

    const bookings = readStoredBookings();
    let updatedBooking = null;

    const nextBookings = bookings.map((booking) => {
      if (booking.id === bookingId) {
        updatedBooking = {
          ...booking,
          hasReviewed: true,
          review: {
            rating: Number(rating),
            comment: (comment || '').trim(),
            submittedAt: new Date().toISOString(),
          },
        };
        return updatedBooking;
      }
      return booking;
    });

    if (!updatedBooking) {
      throw new Error('Booking not found.');
    }

    writeStoredBookings(nextBookings);
    return updatedBooking;
  } catch (error) {
    console.error('Failed to submit review:', error);
    throw error;
  }
}

/**
 * Append a chat message to an active booking.
 */
export async function sendBookingMessage(bookingId, { senderRole, senderName, text }) {
  const cleanText = String(text || '').trim();
  if (!cleanText) {
    throw new Error('Message cannot be empty.');
  }

  try {
    if (USE_API) {
      const { data } = await apiClient.post(`/bookings/${bookingId}/messages`, {
        senderRole,
        senderName,
        text: cleanText,
      });
      return data;
    }

    const bookings = readStoredBookings();
    let updatedBooking = null;

    const nextBookings = bookings.map((booking) => {
      if (booking.id === bookingId) {
        const newMessage = {
          id: `msg-${Date.now()}`,
          senderRole,
          senderName,
          text: cleanText,
          timestamp: new Date().toISOString(),
        };
        updatedBooking = {
          ...booking,
          messages: [...(booking.messages || []), newMessage],
        };
        return updatedBooking;
      }
      return booking;
    });

    if (!updatedBooking) {
      throw new Error('Booking not found.');
    }

    writeStoredBookings(nextBookings);
    return updatedBooking;
  } catch (error) {
    console.error('Failed to send booking message:', error);
    throw error;
  }
}

/**
 * Submit a parts & labor repair quote from the Technician Portal.
 */
export async function submitRepairQuote(bookingId, { partsCost, laborCost, note }) {
  try {
    if (USE_API) {
      const { data } = await apiClient.post(`/bookings/${bookingId}/quote`, {
        partsCost,
        laborCost,
        note,
      });
      return data;
    }

    const bookings = readStoredBookings();
    let updatedBooking = null;

    const nextBookings = bookings.map((booking) => {
      if (booking.id === bookingId) {
        updatedBooking = {
          ...booking,
          quote: {
            partsCost: Number(partsCost) || 0,
            laborCost: Number(laborCost) || 0,
            note: String(note || '').trim(),
            status: 'Pending',
          },
        };
        return updatedBooking;
      }
      return booking;
    });

    if (!updatedBooking) {
      throw new Error('Booking not found.');
    }

    writeStoredBookings(nextBookings);
    return updatedBooking;
  } catch (error) {
    console.error('Failed to submit repair quote:', error);
    throw error;
  }
}

/**
 * Customer responds to a pending repair quote ('Approved' or 'Rejected').
 */
export async function respondToQuote(bookingId, decision) {
  if (decision !== 'Approved' && decision !== 'Rejected') {
    throw new Error('Invalid quote decision.');
  }

  try {
    if (USE_API) {
      const { data } = await apiClient.patch(`/bookings/${bookingId}/quote`, { decision });
      return data;
    }

    const bookings = readStoredBookings();
    let updatedBooking = null;

    const nextBookings = bookings.map((booking) => {
      if (booking.id === bookingId) {
        updatedBooking = {
          ...booking,
          quote: {
            ...(booking.quote || {}),
            status: decision,
          },
        };
        return updatedBooking;
      }
      return booking;
    });

    if (!updatedBooking) {
      throw new Error('Booking not found.');
    }

    writeStoredBookings(nextBookings);
    return updatedBooking;
  } catch (error) {
    console.error('Failed to respond to quote:', error);
    throw error;
  }
}

/**
 * Flag a booking dispute for Admin review.
 */
export async function flagBookingDispute(bookingId, reason) {
  const cleanReason = String(reason || '').trim();
  if (!cleanReason) {
    throw new Error('Please provide a reason for reporting this issue.');
  }

  try {
    if (USE_API) {
      const { data } = await apiClient.post(`/bookings/${bookingId}/dispute`, {
        reason: cleanReason,
      });
      return data;
    }

    const bookings = readStoredBookings();
    let updatedBooking = null;

    const nextBookings = bookings.map((booking) => {
      if (booking.id === bookingId) {
        updatedBooking = {
          ...booking,
          dispute: {
            isFlagged: true,
            reason: cleanReason,
            resolved: false,
          },
        };
        return updatedBooking;
      }
      return booking;
    });

    if (!updatedBooking) {
      throw new Error('Booking not found.');
    }

    writeStoredBookings(nextBookings);
    return updatedBooking;
  } catch (error) {
    console.error('Failed to flag booking dispute:', error);
    throw error;
  }
}

const bookingService = {
  getCustomerBookings,
  getTechnicianBookings,
  createBooking,
  cancelBooking,
  updateBookingStatus,
  submitReview,
  sendBookingMessage,
  submitRepairQuote,
  respondToQuote,
  flagBookingDispute,
};

export default bookingService;
