import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import bookingService from '../services/bookingService';

export default function BookingChatModal({
  isOpen,
  booking,
  currentUserRole,
  currentUserName,
  onClose,
  onBookingUpdated,
}) {
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen || !booking) return null;

  const messages = booking.messages || [];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSending(true);

    try {
      const updated = await bookingService.sendBookingMessage(booking.id, {
        senderRole: currentUserRole,
        senderName: currentUserName,
        text: messageText,
      });
      onBookingUpdated(updated);
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-chat-title"
    >
      <div className="flex h-[34rem] max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="h-5 w-5 text-amber-400" />
            <div>
              <h2 id="booking-chat-title" className="text-sm font-bold">
                Booking Chat &bull; {booking.category}
              </h2>
              <p className="text-xs text-slate-300">
                {currentUserRole === 'TECHNICIAN'
                  ? `Customer: ${booking.customerName || 'Customer'}`
                  : `Technician: ${booking.technicianName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Close chat modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Attached Issue Photo Preview (if present) */}
        {booking.issuePhoto && (
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-2.5">
            <img
              src={booking.issuePhoto}
              alt="Reported issue"
              className="h-12 w-16 rounded-lg border border-slate-200 object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700">Attached Issue Photo</p>
              <p className="truncate text-xs text-slate-500">{booking.issueDescription}</p>
            </div>
          </div>
        )}

        {/* Message List */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-500">No messages yet</p>
              <p className="text-xs">Send a message to coordinate arrival time or parts.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderRole === currentUserRole;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <span className="mb-1 text-[11px] font-medium text-slate-500">
                    {msg.senderName} ({msg.senderRole === 'TECHNICIAN' ? 'Tech' : 'Customer'})
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      isMine
                        ? 'rounded-br-sm bg-blue-700 text-white'
                        : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-200 bg-white p-4">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
