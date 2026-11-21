import { Printer, Wrench, X } from 'lucide-react';

export default function InvoiceModal({ isOpen, booking, onClose }) {
  if (!isOpen || !booking) return null;

  const visitFee = Number(booking.visitFee) || 0;
  const hasApprovedQuote = booking.quote?.status === 'Approved';
  const partsCost = hasApprovedQuote ? Number(booking.quote.partsCost) || 0 : 0;
  const laborCost = hasApprovedQuote ? Number(booking.quote.laborCost) || 0 : 0;
  const totalPaid = visitFee + partsCost + laborCost;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs print:bg-white print:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl print:border-0 print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-4 text-white print:bg-white print:text-slate-900">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
              <Wrench className="h-4 w-4" />
            </span>
            <div>
              <h2 id="invoice-modal-title" className="text-base font-bold">
                FixMate LK Digital Receipt
              </h2>
              <p className="text-xs text-slate-300 print:text-slate-500">
                Invoice #{booking.id.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white print:hidden"
            aria-label="Close invoice"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            <div>
              <p className="font-semibold uppercase tracking-wide text-slate-400">Customer</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {booking.customerName || 'Valued Customer'}
              </p>
              <p className="text-slate-600">{booking.district}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-slate-400">Technician</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{booking.technicianName}</p>
              <p className="text-slate-600">{booking.category}</p>
            </div>
          </div>

          <div className="text-xs text-slate-600">
            <p>
              <strong className="text-slate-800">Service Date:</strong> {booking.scheduledDate} (
              {booking.timeSlot})
            </p>
            <p className="mt-1">
              <strong className="text-slate-800">Address:</strong> {booking.serviceAddress}
            </p>
          </div>

          {/* Itemized Breakdown */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Amount (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2.5 text-slate-700">Technician Visit &amp; Inspection Fee</td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                    Rs. {visitFee.toLocaleString()}
                  </td>
                </tr>
                {hasApprovedQuote && (
                  <>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700">
                        Parts &amp; Materials
                        {booking.quote?.note ? ` (${booking.quote.note})` : ''}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                        Rs. {partsCost.toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-slate-700">Repair Labor Charge</td>
                      <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                        Rs. {laborCost.toLocaleString()}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-blue-50/70">
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">Total Paid</td>
                  <td className="px-4 py-3 text-right text-base font-extrabold text-blue-700">
                    Rs. {totalPaid.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
