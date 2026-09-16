import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { OrderDetails } from '../types';
import { sound } from '../utils/sound';

interface ReceiptDetailsModalProps {
  isOpen: boolean;
  order: OrderDetails;
  onClose: () => void;
  onNewTransaction?: () => void;
}

export const ReceiptDetailsModal: React.FC<ReceiptDetailsModalProps> = ({
  isOpen,
  order,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playKeypadClick('1');

    // Generate formatted receipt text for local file download
    const receiptContent = `
==================================================
                 ${order.storeName}
                 FOXY PAY TERMINAL
            Official Proof of Payment
==================================================
Store:           ${order.storeName}
Order No:        ${order.orderNo}
Date & Time:     ${order.dateTimeFull}
Payment Method:  ${order.paymentMethodLabel}
Status:          ${order.status}
Transaction ID:  ${order.transactionId}
--------------------------------------------------
AMOUNT DUE:      ${formattedTotal}
TOTAL PAID:      ${formattedTotal}
--------------------------------------------------
Barcode ID:      ${order.transactionId}

            Thank you for shopping!
      Please keep this receipt for your records.
==================================================
`.trim();

    // Trigger download to the user's local system
    try {
      const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt-${order.orderNo}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (err) {
      console.error('Failed to trigger download:', err);
    }

    // Also trigger system print dialog if supported
    try {
      window.print();
    } catch {
      // Ignored if window.print is restricted in iframe
    }
  };

  const handleClose = () => {
    sound.playModalClose();
    onClose();
  };

  const formattedTotal = `₹ ${order.total.toFixed(2)}`;

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={handleClose}
    >
      <div
        id="receipt-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm my-auto max-h-[92dvh] flex flex-col bg-[#faf9f5] rounded-2xl shadow-2xl overflow-hidden border border-slate-300 text-slate-900 animate-scaleUp"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {/* Top header with close button */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200 bg-slate-100/80 shrink-0">
          <div>
            <div className="text-xs sm:text-sm font-black text-slate-900 tracking-wider uppercase">
              FOXY PAY RECEIPT
            </div>
            <div className="text-[10px] text-slate-600 font-sans tracking-wide">
              Official Proof of Payment
            </div>
          </div>
          <button
            id="close-receipt-modal-x"
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-slate-300 text-slate-600 hover:text-slate-900 transition-colors no-print cursor-pointer"
            aria-label="Close receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt content */}
        <div className="p-4 sm:p-5 space-y-3 text-xs overflow-y-auto overscroll-contain flex-1">
          <div className="space-y-1.5 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">STORE:</span>
              <span className="font-bold text-slate-900">{order.storeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ORDER NO:</span>
              <span className="font-bold text-slate-900">{order.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">DATE & TIME:</span>
              <span className="text-slate-800">{order.dateTimeFull}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PAYMENT METHOD:</span>
              <span className="font-bold text-slate-900">{order.paymentMethodLabel}</span>
            </div>
          </div>

          {/* Perforated separator */}
          <div className="relative py-1">
            <div className="border-b-2 border-dashed border-slate-300 w-full" />
          </div>

          {/* Amounts */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-600">AMOUNT DUE:</span>
              <span className="text-sm font-semibold text-slate-800">{formattedTotal}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
              <span className="text-sm font-black text-slate-900">TOTAL PAID:</span>
              <span className="text-lg font-black text-emerald-700">{formattedTotal}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500">STATUS:</span>
              <div className="flex items-center gap-1 text-emerald-600 font-black text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{order.status}</span>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className="pt-3 border-t border-dashed border-slate-300 flex flex-col items-center gap-1">
            <div className="w-full flex items-center justify-center gap-[2.5px] h-8 overflow-hidden">
              {[3, 2, 4, 2, 5, 3, 2, 5, 4, 2, 4, 3, 6, 2, 4, 3, 5, 2, 4, 3, 2, 6, 4, 2, 4, 3, 5, 2, 4, 4, 3].map(
                (w, i) => (
                  <div
                    key={i}
                    className="h-full bg-slate-900"
                    style={{ width: `${w}px` }}
                  />
                )
              )}
            </div>
            <div className="text-[9px] text-slate-500 tracking-[0.25em]">
              {order.transactionId}
            </div>
            <div className="text-[9px] font-bold tracking-widest text-slate-600 font-mono text-center mt-1">
              THANK YOU
            </div>
          </div>
        </div>

        {/* Modal footer action buttons - only Print Receipt button */}
        <div className="p-3 sm:p-3.5 bg-slate-100 border-t border-slate-200 no-print shrink-0">
          <button
            id="print-receipt-btn"
            type="button"
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer touch-manipulation"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
