import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import technicianService from '../services/technicianService';

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM',
];

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
}

export default function TechnicianProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  const [technician, setTechnician] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    scheduledDate: '',
    timeSlot: TIME_SLOTS[0],
    serviceAddress: '',
    customerPhone: user?.phone || '',
    issueDescription: '',
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      technicianService.getTechnicianById(id),
      bookingService.getTechnicianBookings(id),
    ])
      .then(([techData, bookingList]) => {
        if (!active) return;
        setTechnician(techData);
        const techReviews = bookingList
          .filter(
            (b) =>
              (b.technicianId === id || b.technicianName === techData.name) &&
              b.status === 'Completed' &&
              b.review
          )
          .map((b) => ({
            id: b.id,
            customerName: b.customerName || 'Verified Customer',
            rating: b.review.rating,
            comment: b.review.comment,
            date: b.scheduledDate,
          }));
        setReviews(techReviews);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Technician profile not found.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!technician) return;

    setBookingError('');
    setSubmittingBooking(true);

    try {
      await bookingService.createBooking({
        customerId: user?.id || 'demo-customer',
        customerName: user?.name || 'Guest Customer',
        customerPhone: bookingForm.customerPhone || user?.phone || '077 000 0000',
        technicianId: technician.id,
        technicianName: technician.name,
        category: technician.category,
        district: technician.district,
        scheduledDate: bookingForm.scheduledDate,
        timeSlot: bookingForm.timeSlot,
        serviceAddress: bookingForm.serviceAddress,
        issueDescription: bookingForm.issueDescription,
        visitFee: technician.visitFee,
      });

      setBookingSuccess(true);
      setBookingForm({
        scheduledDate: '',
        timeSlot: TIME_SLOTS[0],
        serviceAddress: '',
        customerPhone: user?.phone || '',
        issueDescription: '',
      });
    } catch (err) {
      setBookingError(err.message || 'Unable to submit booking. Please try again.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-2xl bg-white p-8 shadow-sm" />
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Technician Not Found</h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <Link
          to="/technicians"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Find Technicians
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/technicians"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Find Technicians
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Technician Profile Details */}
        <div className="space-y-6 lg:col-span-7">
          {/* Profile Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {technician.avatar && !imgError ? (
                <img
                  src={technician.avatar}
                  alt={technician.name}
                  onError={() => setImgError(true)}
                  className="h-24 w-24 shrink-0 rounded-full border-4 border-blue-50 object-cover shadow-sm"
                />
              ) : (
                <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-blue-50 bg-blue-700 text-2xl font-bold text-white shadow-sm">
                  {getInitials(technician.name)}
                </span>
              )}

              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold text-slate-900">{technician.name}</h1>
                  {technician.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      ID Verified
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      technician.available
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        technician.available ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    {technician.available ? 'Available Now' : 'Currently Busy'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-blue-700">
                    <Wrench className="h-4 w-4" />
                    {technician.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {technician.district}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <strong className="text-slate-900">{Number(technician.rating).toFixed(1)}</strong>
                    <span className="text-slate-500">({technician.reviewCount} reviews)</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-sm text-slate-600">
                  <span>
                    <strong className="text-slate-900">{technician.experienceYears}+ years</strong>{' '}
                    experience
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {technician.workingHours || '8:00 AM - 6:00 PM (Mon - Sat)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">About</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {technician.bio ||
                  'Experienced and verified local technician providing reliable residential and commercial services.'}
              </p>
            </div>

            {/* Skills */}
            {Array.isArray(technician.skills) && technician.skills.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                  Skills &amp; Specialties
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {technician.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Past Customer Reviews */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-bold text-slate-900">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No written reviews yet. Book {technician.name} to be the first to leave feedback!
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{rev.customerName}</span>
                      <span className="text-xs text-slate-400">{rev.date}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`h-3.5 w-3.5 ${
                            idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    {rev.comment && (
                      <p className="mt-2 text-sm text-slate-600">&ldquo;{rev.comment}&rdquo;</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Book This Technician Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Standard Visit Fee
                </p>
                <p className="text-2xl font-extrabold text-slate-900">
                  Rs. {Number(technician.visitFee).toLocaleString()}
                  <span className="text-sm font-normal text-slate-500"> / visit</span>
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-blue-700" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">Book This Technician</h2>
            <p className="mt-1 text-xs text-slate-500">
              Send a service request directly to {technician.name}.
            </p>

            {bookingSuccess ? (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h3 className="mt-3 text-base font-bold text-emerald-900">
                  Booking Request Sent!
                </h3>
                <p className="mt-1 text-sm text-emerald-800">
                  Your request has been sent to {technician.name} and is now visible in your
                  Customer Portal.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Link
                    to="/customer/dashboard"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    View My Bookings
                  </Link>
                  <button
                    type="button"
                    onClick={() => setBookingSuccess(false)}
                    className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                  >
                    Book Another Slot
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookSubmit} className="mt-5 space-y-4">
                {bookingError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                    {bookingError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="book-date"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      Preferred Date
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="book-date"
                        type="date"
                        required
                        value={bookingForm.scheduledDate}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, scheduledDate: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="book-slot"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      Time Slot
                    </label>
                    <select
                      id="book-slot"
                      value={bookingForm.timeSlot}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, timeSlot: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="book-phone"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="book-phone"
                      type="tel"
                      required
                      value={bookingForm.customerPhone}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, customerPhone: e.target.value })
                      }
                      placeholder="077 123 4567"
                      className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="book-address"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Service Address
                  </label>
                  <input
                    id="book-address"
                    type="text"
                    required
                    value={bookingForm.serviceAddress}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, serviceAddress: e.target.value })
                    }
                    placeholder="No. 42, Galle Road, Dehiwala"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="book-issue"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Issue Description
                  </label>
                  <textarea
                    id="book-issue"
                    rows={3}
                    required
                    value={bookingForm.issueDescription}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, issueDescription: e.target.value })
                    }
                    placeholder="Briefly describe the repair or installation needed..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="w-full rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingBooking ? 'Sending Request...' : 'Confirm Booking Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
