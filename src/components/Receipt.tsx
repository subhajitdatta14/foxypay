import React, { useState, useEffect, useRef } from 'react';
import { MachineScreenState, OrderDetails } from '../types';
import { sound } from '../utils/sound';
import { CheckCircle } from 'lucide-react';

interface ReceiptProps {
  screenState: MachineScreenState;
  order: OrderDetails;
  onOpenDetails: () => void;
  onPrintComplete?: () => void;
  isTearing?: boolean;
  isTorn?: boolean;
  onTear?: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({
  screenState,
  order,
  onOpenDetails,
  onPrintComplete,
  isTearing = false,
  isTorn = false,
  onTear,
}) => {
  // Animation phases:
  // 'idle': Hidden inside the slot
  // 'dispensing': Single continuous CSS extrusion downwards from the slot
  // 'settled': Finished dispensing, remains completely visible as ONE continuous physical sheet
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'dispensing' | 'settled'>('idle');

  // Track the transaction ID that has been dispensed to ensure strict idempotency (never duplicate animation)
  const dispensedTxnIdRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onPrintCompleteRef = useRef(onPrintComplete);

  useEffect(() => {
    onPrintCompleteRef.current = onPrintComplete;
  }, [onPrintComplete]);

  useEffect(() => {
    // Reset if machine is turned OFF or starting a fresh transaction
    if (
      screenState === 'OFF' ||
      screenState === 'BOOTING' ||
      screenState === 'WELCOME' ||
      screenState === 'IDLE_CHOOSE_METHOD' ||
      screenState === 'AWAITING_CARD_TAP' ||
      screenState === 'CARD_DETECTED' ||
      screenState === 'ENTERING_PIN' ||
      screenState === 'AUTHORIZING' ||
      screenState === 'AWAITING_UPI_SCAN'
    ) {
      setAnimationPhase('idle');
      dispensedTxnIdRef.current = '';
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Trigger dispensing sequence ONLY when state transitions to RECEIPT_DISPENSING
    if (screenState === 'RECEIPT_DISPENSING') {
      // Strictly idempotent: if already dispensing or settled for this transaction, DO NOT trigger again
      if (!order.transactionId || dispensedTxnIdRef.current === order.transactionId) {
        return;
      }

      // Mark this transaction as dispensed
      dispensedTxnIdRef.current = order.transactionId;
      setAnimationPhase('dispensing');

      // Play continuous thermal stepper motor and paper feed sounds
      sound.playReceiptDispense();
      const tick1 = setTimeout(() => sound.playPrintTick(), 350);
      const tick2 = setTimeout(() => sound.playPrintTick(), 700);
      const tick3 = setTimeout(() => sound.playPrintTick(), 1050);

      // Settle at 1400ms (matches CSS animation duration)
      timeoutRef.current = setTimeout(() => {
        setAnimationPhase('settled');
        sound.playPrintTick();
        if (onPrintCompleteRef.current) {
          onPrintCompleteRef.current();
        }
      }, 1400);

      return () => {
        clearTimeout(tick1);
        clearTimeout(tick2);
        clearTimeout(tick3);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }

    // If state is COMPLETE, ensure receipt stays visible without re-triggering animation
    if (screenState === 'COMPLETE') {
      if (dispensedTxnIdRef.current === order.transactionId) {
        setAnimationPhase('settled');
      } else if (order.transactionId) {
        dispensedTxnIdRef.current = order.transactionId;
        setAnimationPhase('settled');
      }
    }
  }, [screenState, order.transactionId]);

  // When clicking on the physical paper, trigger tearing and open details
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (animationPhase === 'idle' || isTorn || isTearing) return;
    if (onTear) {
      onTear();
    } else {
      sound.playModalOpen();
      onOpenDetails();
    }
  };

  if (animationPhase === 'idle' || isTorn) return null;

  return (
    <div
      id="dispensed-receipt"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      title={isTearing ? "Tearing receipt..." : "Click receipt to tear"}
      className={`absolute top-[4px] left-1/2 -translate-x-1/2 w-[210px] sm:w-[220px] max-w-[88%] z-20 cursor-pointer select-none overflow-hidden transition-all duration-200 group hover:brightness-105 active:scale-[0.99] touch-manipulation ${
        isTearing
          ? 'animate-receipt-tear'
          : animationPhase === 'dispensing'
          ? 'animate-receipt-feed'
          : 'max-h-[135px] opacity-100'
      }`}
      style={{
        transformOrigin: 'top center',
      }}
    >
      {/* Physical Paper Sheet (Single continuous sheet originating from printer mouth) */}
      <div
        className="w-full bg-[#faf9f5] text-slate-900 border-x border-slate-300 shadow-[0_12px_24px_rgba(0,0,0,0.75),0_2px_6px_rgba(0,0,0,0.4)] flex flex-col justify-between relative"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {/* Subtle thermal paper grain / lighting gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/[0.04] via-transparent to-black/[0.02] pointer-events-none" />

        {/* Paper Content Body - Compact layout ensuring complete receipt visibility */}
        <div className="px-2.5 pt-1.5 pb-0.5 text-slate-900 relative z-10">
          {/* Header */}
          <div className="text-center pb-0.5">
            <div className="text-[9.5px] font-black tracking-wider text-slate-900 uppercase leading-tight">
              FOXY PAY
            </div>
            <div className="text-[7px] text-slate-500 tracking-tight leading-tight mt-0.5">
              {order.dateTimeFull}
            </div>
          </div>

          {/* Dotted divider line */}
          <div className="border-b border-dashed border-slate-400/80 my-0.5" />

          {/* Details (Store, Method, Total, Transaction ID) */}
          <div className="text-[8px] space-y-0.5 text-slate-800 py-0.5">
            <div className="flex justify-between items-center leading-tight">
              <span className="text-slate-500 font-medium">STORE:</span>
              <span className="font-bold text-slate-900">KIOSK #04</span>
            </div>
            <div className="flex justify-between items-center leading-tight">
              <span className="text-slate-500 font-medium">METHOD:</span>
              <span className="font-bold text-slate-900">
                {order.paymentMethod === 'CARD' ? 'CARD' : 'UPI'}
              </span>
            </div>
            <div className="flex justify-between items-center leading-tight">
              <span className="text-slate-500 font-medium">TOTAL :</span>
              <span className="font-black text-slate-950 font-mono text-[9px]">
                ₹ {order.total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center leading-tight">
              <span className="text-slate-500 font-medium">TX ID:</span>
              <span className="font-semibold text-slate-800">
                {order.transactionId.replace('TXN-', '')}
              </span>
            </div>
          </div>

          {/* Dotted divider line */}
          <div className="border-b border-dashed border-slate-400/80 my-0.5" />

          {/* Barcode & PAID Verification Row - Barcode clearly present and prominent */}
          <div className="flex items-center justify-between pt-1 gap-2">
            {/* Real Barcode lines with Transaction ID */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-[1.5px] h-4.5 overflow-hidden">
                {[2, 1, 3, 1, 4, 1, 2, 3, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 3, 1, 4, 2, 1, 3].map(
                  (w, i) => (
                    <div
                      key={i}
                      className="h-full bg-slate-950"
                      style={{ width: `${w}px` }}
                    />
                  )
                )}
              </div>
              <div className="text-[6.5px] text-slate-500 font-mono tracking-wider leading-none">
                {order.transactionId.replace('TXN-', '')}
              </div>
            </div>

            {/* PAID status badge matching reference */}
            <div className="flex items-center gap-1 text-emerald-700 font-black text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 shrink-0 leading-none">
              <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>PAID</span>
            </div>
          </div>

          {/* Subtle click to tear indicator */}
          <div className="mt-1 pt-0.5 border-t border-dashed border-slate-300/80 text-[6.5px] font-mono text-center tracking-wider text-slate-400 group-hover:text-amber-600 transition-colors flex items-center justify-center gap-1 font-semibold">
            <span>✂</span>
            <span>CLICK TO TEAR</span>
          </div>
        </div>

        {/* Sawtooth / Zigzag Torn Paper Edge at the Bottom */}
        <div
          className="w-full h-2 bg-[#faf9f5]"
          style={{
            clipPath:
              'polygon(0% 0%, 2% 100%, 4% 0%, 6% 100%, 8% 0%, 10% 100%, 12% 0%, 14% 100%, 16% 0%, 18% 100%, 20% 0%, 22% 100%, 24% 0%, 26% 100%, 28% 0%, 30% 100%, 32% 0%, 34% 100%, 36% 0%, 38% 100%, 40% 0%, 42% 100%, 44% 0%, 46% 100%, 48% 0%, 50% 100%, 52% 0%, 54% 100%, 56% 0%, 58% 100%, 60% 0%, 62% 100%, 64% 0%, 66% 100%, 68% 0%, 70% 100%, 72% 0%, 74% 100%, 76% 0%, 78% 100%, 80% 0%, 82% 100%, 84% 0%, 86% 100%, 88% 0%, 90% 100%, 92% 0%, 94% 100%, 96% 0%, 98% 100%, 100% 0%)',
          }}
        />
      </div>
    </div>
  );
};
