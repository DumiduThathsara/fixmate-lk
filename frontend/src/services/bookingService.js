import apiClient from './apiClient';

export async function getCustomerBookings() {
  const { data } = await apiClient.get('/bookings/customer');
  return data;
}

export async function getTechnicianBookings() {
  const token = localStorage.getItem('fixmate_token');
  const rawUser = localStorage.getItem('fixmate_user');
  if (!token || !rawUser) {
    return [];
  }
  try {
    const user = JSON.parse(rawUser);
    if (user?.role !== 'TECHNICIAN') {
      return [];
    }
    const { data } = await apiClient.get('/bookings/technician');
    return data;
  } catch {
    return [];
  }
}

export async function createBooking(bookingData) {
  const { data } = await apiClient.post('/bookings', bookingData);
  return data;
}

export async function cancelBooking(bookingId) {
  const { data } = await apiClient.patch(`/bookings/${bookingId}/cancel`);
  return data;
}

export async function updateBookingStatus(bookingId, newStatus) {
  const { data } = await apiClient.patch(`/bookings/${bookingId}/status`, {
    status: newStatus,
  });
  return data;
}

export async function verifyStartOtpAndBeginJob(bookingId, enteredOtp) {
  const { data } = await apiClient.post(`/bookings/${bookingId}/verify-otp`, {
    otp: String(enteredOtp || '').trim(),
  });
  return data;
}

export async function submitRepairQuote(bookingId, { partsCost, laborCost, note }) {
  const { data } = await apiClient.post(`/bookings/${bookingId}/quote`, {
    partsCost: Number(partsCost) || 0,
    laborCost: Number(laborCost) || 0,
    note,
  });
  return data;
}

export async function respondToQuote(bookingId, decision) {
  const { data } = await apiClient.patch(`/bookings/${bookingId}/quote/respond`, {
    decision,
  });
  return data;
}

export async function getBookingMessages(bookingId) {
  const { data } = await apiClient.get(`/bookings/${bookingId}/messages`);
  return data;
}

export async function sendBookingMessage(bookingId, { senderRole, senderName, text }) {
  const { data } = await apiClient.post(`/bookings/${bookingId}/messages`, {
    senderRole,
    senderName,
    text,
  });
  return data;
}

export async function submitReview(bookingId, { rating, comment }) {
  const { data } = await apiClient.post(`/bookings/${bookingId}/review`, {
    rating: Number(rating),
    comment,
  });
  return data;
}

export async function flagBookingDispute(bookingId, reason) {
  const { data } = await apiClient.post(`/bookings/${bookingId}/dispute`, {
    reason,
  });
  return data;
}

export function validatePromoCode(code, baseAmount = 1500) {
  const normalized = String(code || '').trim().toUpperCase();
  const amount = Math.max(0, Number(baseAmount) || 0);

  if (normalized === 'FIRST500') {
    const discountAmount = Math.min(500, amount);
    return {
      valid: true,
      code: 'FIRST500',
      discountAmount,
      label: 'Rs. 500 First Booking Discount',
    };
  }

  if (normalized === 'FIX10') {
    const discountAmount = Math.round(amount * 0.1);
    return {
      valid: true,
      code: 'FIX10',
      discountAmount,
      label: '10% FixMate Loyalty Discount',
    };
  }

  return {
    valid: false,
    code: normalized,
    discountAmount: 0,
    label: 'Invalid or expired promo code.',
  };
}

const bookingService = {
  getCustomerBookings,
  getTechnicianBookings,
  createBooking,
  cancelBooking,
  updateBookingStatus,
  verifyStartOtpAndBeginJob,
  submitRepairQuote,
  respondToQuote,
  getBookingMessages,
  sendBookingMessage,
  submitReview,
  flagBookingDispute,
  validatePromoCode,
};

export default bookingService;
