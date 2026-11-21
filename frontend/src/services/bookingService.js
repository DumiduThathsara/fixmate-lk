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
    review: {
      rating: 5,
      comment: 'Punctual, neat workmanship, and completed the lock fitting smoothly.',
      submittedAt: '2026-11-08T16:45:00Z',
    },
    createdAt: '2026-11-05T09:20:00Z',
  },
];

function readStoredBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_BOOKINGS));
      return INITIAL_SEED_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_BOOKINGS;
  } catch {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_BOOKINGS));
    return INITIAL_SEED_BOOKINGS;
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
 * Create a new service booking.
 */
export async function createBooking(bookingData) {
  try {
    if (USE_API) {
      const { data } = await apiClient.post('/bookings', bookingData);
      return data;
    }

    const bookings = readStoredBookings();
    const newBooking = {
      id: `bk-${Date.now()}`,
      status: 'Pending',
      hasReviewed: false,
      createdAt: new Date().toISOString(),
      ...bookingData,
    };
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

const ALLOWED_TECH_STATUSES = ['Accepted', 'Declined', 'Completed'];

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

const bookingService = {
  getCustomerBookings,
  getTechnicianBookings,
  createBooking,
  cancelBooking,
  updateBookingStatus,
  submitReview,
};

export default bookingService;
