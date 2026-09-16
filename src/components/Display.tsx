import React from 'react';
import {
  MachineScreenState,
  TerminalMode,
  PaymentMethod,
  OrderDetails,
} from '../types';
import { CreditCard, QrCode, CheckCircle2, Cpu, Terminal } from 'lucide-react';
import { DynamicQRCode } from './DynamicQRCode';

interface DisplayProps {
  screenState: MachineScreenState;
  paymentMethod: PaymentMethod | null;
  onSelectPaymentMethod: (method: PaymentMethod | null) => void;
  amount: number;
  rawInput: string;
  pin: string;
  mode: TerminalMode;
  retroPhase: 'BOOT1' | 'BOOT2' | 'READY';
  isPoked: boolean;
  onNewPayment: () => void;
  order: OrderDetails;
  isReceiptTorn?: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  screenState,
  paymentMethod,
  onSelectPaymentMethod,
  amount,
  rawInput,
  pin,
  mode,
  retroPhase,
  isPoked,
  onNewPayment,
  order,
  isReceiptTorn = false,
}) => {
  const formattedAmount =
    rawInput && parseFloat(rawInput) > 0
      ? parseFloat(rawInput).toFixed(2)
      : amount > 0
      ? amount.toFixed(2)
      : '0.00';

  // MACHINE POKE MESSAGE (Only when machine is ON)
  if (isPoked && screenState !== 'OFF') {
    return (
      <div
        id="terminal-screen-poked"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-3 sm:p-4 overflow-hidden border border-cyan-400/50 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95),0_0_15px_rgba(6,182,212,0.25)] bg-gradient-to-b from-[#08121f] via-[#04080e] to-[#020509] text-white font-sans select-none flex flex-col items-center justify-center animate-fadeIn text-center"
      >
        {/* Subtle CRT scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(6,182,212,0.2) 0px, rgba(6,182,212,0.2) 1px, transparent 1px, transparent 3px)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center gap-1.5">
          <div className="text-3xl sm:text-4xl animate-bounce mb-0.5">😄</div>
          <div className="text-sm sm:text-base font-black tracking-wide text-cyan-300 font-mono px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
            HEY! I’M WORKING 😄
          </div>
          <div className="text-[9px] sm:text-[10px] text-emerald-400 font-mono tracking-widest uppercase mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>TERMINAL ACTIVE</span>
          </div>
        </div>
      </div>
    );
  }

  // 1. DEVELOPER DIAGNOSTICS MODE
  if (mode === 'DEVELOPER') {
    return (
      <div
        id="terminal-screen-developer"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-3 sm:p-4 overflow-hidden border border-cyan-500/40 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95),0_0_15px_rgba(6,182,212,0.2)] bg-[#050b14] text-cyan-200 font-mono select-none flex flex-col justify-between"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.4) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold tracking-widest text-cyan-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>DIAGNOSTIC MODE</span>
            </div>
            <div className="text-[9px] text-cyan-400/80 font-bold uppercase">
              STATUS: ONLINE
            </div>
          </div>

          <div className="py-2 space-y-1 text-[10px] sm:text-[11px]">
            <div className="flex justify-between text-cyan-300">
              <span>CARD READER SENSOR:</span>
              <span className="font-bold text-emerald-400">ACTIVE [OK]</span>
            </div>
            <div className="flex justify-between text-cyan-300">
              <span>UPI QR GENERATOR:</span>
              <span className="font-bold text-emerald-400">ONLINE [OK]</span>
            </div>
            <div className="flex justify-between text-cyan-300">
              <span>NUMERIC KEYPAD 0-9:</span>
              <span className="font-bold text-emerald-400">CONNECTED</span>
            </div>
            <div className="flex justify-between text-cyan-300">
              <span>THERMAL RECEIPT FEEDER:</span>
              <span className="font-bold text-emerald-400">READY</span>
            </div>
            <div className="flex justify-between text-cyan-400/70 text-[9px] pt-1 border-t border-cyan-500/20">
              <span>INPUT BUFFER:</span>
              <span className="font-bold">{rawInput || 'EMPTY'}</span>
            </div>
          </div>

          <div className="text-[8px] sm:text-[9px] tracking-wider text-cyan-400/60 flex items-center justify-between border-t border-cyan-500/20 pt-1">
            <span>COMMAND READY</span>
            <span className="opacity-80">PRESS CLR TO EXIT</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. RETRO 1987 MODE
  if (mode === 'RETRO_1987') {
    return (
      <div
        id="terminal-screen-retro"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-3 sm:p-4 overflow-hidden border-2 border-emerald-500/60 shadow-[inset_0_4px_18px_rgba(0,0,0,0.98),0_0_20px_rgba(16,185,129,0.3)] bg-[#031408] text-[#33ff66] font-mono select-none crt-scanlines animate-crt-flicker flex flex-col justify-between"
      >
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between text-[10px] tracking-wider border-b border-emerald-500/30 pb-1">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#33ff66]" />
              <span className="font-bold tracking-wider">RETRO TERMINAL</span>
            </div>
            <span className="px-1 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold">
              14072003
            </span>
          </div>

          <div className="my-auto py-2 text-center flex flex-col items-center justify-center space-y-1.5">
            <div className="text-xl sm:text-2xl font-black tracking-widest text-[#33ff66] drop-shadow-[0_0_10px_rgba(51,255,102,0.85)]">
              FOXY PAY
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-emerald-300 drop-shadow-[0_0_6px_rgba(51,255,102,0.5)]">
              SMART • FAST • SIMPLE PAY
            </div>
            <div className="w-28 h-px bg-emerald-500/40 my-1" />
            <div className="text-[10px] sm:text-[11px] tracking-wider text-emerald-200 font-semibold">
              Developed by <span className="text-[#33ff66] font-bold">SUBHAJIT DATTA</span>
            </div>
            <div className="text-[9px] sm:text-[10px] tracking-[0.16em] text-emerald-400/90 font-mono">
              16th SEPTEMBER 2026
            </div>
          </div>

          <div className="text-[8px] sm:text-[9px] tracking-wider text-emerald-400/70 flex items-center justify-between border-t border-emerald-500/20 pt-1">
            <span>SYS OK</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. MACHINE OFF STATE
  if (screenState === 'OFF') {
    return (
      <div
        id="terminal-screen-off"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-3 sm:p-4 overflow-hidden border border-black/80 shadow-[inset_0_6px_16px_rgba(0,0,0,0.98)] bg-[#090b0e] select-none flex flex-col items-center justify-center"
      >
        {/* Subtle dark glass specular reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center opacity-30">
          <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center mb-1">
            <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>
          <div className="text-[9px] tracking-[0.25em] text-slate-500 uppercase font-mono">
            POWER OFF
          </div>
          <div className="text-[8px] tracking-wider text-slate-600 mt-1 font-mono">
            PRESS ON/OFF BUTTON TO START
          </div>
        </div>
      </div>
    );
  }

  // 4. BOOT / POWER SEQUENCE
  if (screenState === 'BOOTING') {
    return (
      <div
        id="terminal-screen-boot"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-4 overflow-hidden border border-cyan-900/60 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] bg-[#04080e] text-cyan-300 font-mono select-none flex flex-col justify-between"
      >
        <div className="flex items-center justify-between border-b border-cyan-800/40 pb-1 text-[9px] tracking-widest text-cyan-400">
          <span>FOXY PAY v3.0</span>
          <span className="animate-pulse">BOOTING...</span>
        </div>
        <div className="my-auto text-center space-y-2">
          <div className="text-xs font-bold tracking-widest text-cyan-200">
            INITIALIZING HARDWARE
          </div>
          <div className="w-3/4 mx-auto h-1.5 bg-cyan-950 rounded-full overflow-hidden border border-cyan-800">
            <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-emerald-400 animate-pulse" />
          </div>
          <div className="text-[9px] text-cyan-400/70 tracking-wider">
            SENSORS ONLINE • DISPLAY READY
          </div>
        </div>
        <div className="text-[8px] text-cyan-500/50 text-center tracking-widest">
          STANDBY...
        </div>
      </div>
    );
  }

  // 5. WELCOME STATE (Brief transition)
  if (screenState === 'WELCOME') {
    return (
      <div
        id="terminal-screen-welcome"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-4 overflow-hidden border border-cyan-800/40 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] bg-[#04080e] text-cyan-300 font-sans select-none flex flex-col items-center justify-center animate-fadeIn"
      >
        <div className="text-emerald-400 text-lg sm:text-xl font-bold tracking-wide">
          WELCOME
        </div>
        <div className="text-[10px] text-cyan-300/80 tracking-widest font-mono uppercase mt-1">
          FOXY PAY ONLINE
        </div>
      </div>
    );
  }

  // 6. CARD FLOW: AWAITING CARD TAP
  if (screenState === 'AWAITING_CARD_TAP') {
    return (
      <div
        id="terminal-screen-awaiting-card"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-3 overflow-hidden border border-cyan-500/50 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95),0_0_12px_rgba(6,182,212,0.25)] bg-[#040912] text-white font-sans select-none flex flex-col justify-between text-center"
      >
        <div className="text-[10px] tracking-widest font-mono text-cyan-400 uppercase font-bold">
          AMOUNT CONFIRMED
        </div>
        <div className="my-auto space-y-1">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            ₹ {formattedAmount}
          </div>
          <div className="py-1 px-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-extrabold text-cyan-200">
            <CreditCard className="w-4 h-4 text-cyan-300" />
            <span>PLEASE TAP YOUR CARD</span>
          </div>
          <div className="text-[9px] text-cyan-400/90 font-mono tracking-wide mt-1">
            ➔ TAP ON THE READER TO THE RIGHT
          </div>
        </div>
        <div className="text-[8px] text-slate-400 font-mono">
          PRESS CLR ON KEYPAD TO CANCEL
        </div>
      </div>
    );
  }

  // 7. CARD DETECTED
  if (screenState === 'CARD_DETECTED') {
    return (
      <div
        id="terminal-screen-card-detected"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-3 overflow-hidden border border-emerald-500/60 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] bg-[#040e0b] text-white font-sans select-none flex flex-col items-center justify-center text-center space-y-2"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="text-base sm:text-lg font-black tracking-wide text-emerald-300">
          CARD DETECTED
        </div>
        <div className="text-[10px] text-emerald-400/80 font-mono tracking-widest">
          READING CHIP DATA...
        </div>
      </div>
    );
  }

  // 8. CARD FLOW: ENTER 4-DIGIT PIN
  if (screenState === 'ENTERING_PIN') {
    return (
      <div
        id="terminal-screen-pin"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-3 overflow-hidden border border-cyan-500/60 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] bg-[#040912] text-white font-sans select-none flex flex-col justify-between text-center"
      >
        <div>
          <div className="text-[10px] tracking-widest font-mono text-cyan-400 uppercase font-bold">
            SECURITY VERIFICATION
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-white mt-0.5">
            ENTER 4-DIGIT PIN
          </div>
        </div>

        {/* Masked PIN dots: ● ● ● ● */}
        <div className="my-auto flex items-center justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                  isFilled
                    ? 'border-cyan-300 bg-cyan-400 shadow-[0_0_10px_#06b6d4]'
                    : 'border-slate-600 bg-slate-900/80'
                }`}
              >
                {isFilled && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
              </div>
            );
          })}
        </div>

        <div className="space-y-0.5">
          <div className="text-[9px] text-cyan-300 font-mono font-bold tracking-wide">
            {pin.length === 4
              ? 'PRESS ENTER ON KEYPAD'
              : 'ENTER PIN ON KEYPAD (0-9)'}
          </div>
          <div className="text-[8px] text-slate-400 font-mono">
            PRESS CLR TO RETURN TO AMOUNT
          </div>
        </div>
      </div>
    );
  }

  // 9. AUTHORIZING PAYMENT
  if (screenState === 'AUTHORIZING') {
    return (
      <div
        id="terminal-screen-authorizing"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-3 overflow-hidden border border-cyan-500/60 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] bg-[#040912] text-white font-sans select-none flex flex-col items-center justify-center text-center space-y-2.5"
      >
        <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin shadow-[0_0_12px_rgba(6,182,212,0.4)]" />
        <div className="text-sm sm:text-base font-black tracking-wider text-cyan-200">
          AUTHORIZING...
        </div>
        <div className="text-[9px] text-cyan-400/70 font-mono tracking-widest">
          CONNECTING TO PAYMENT GATEWAY
        </div>
      </div>
    );
  }

  // 10. UPI FLOW: SCAN TO PAY (REAL SCANNABLE QR CODE)
  if (screenState === 'AWAITING_UPI_SCAN') {
    const upiUri = `upi://pay?pa=demostore@bank&pn=Self%20Checkout&am=${parseFloat(
      formattedAmount
    ).toFixed(2)}&cu=INR`;

    return (
      <div
        id="terminal-screen-upi-qr"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-2.5 overflow-hidden border border-purple-500/60 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95),0_0_15px_rgba(168,85,247,0.25)] bg-[#080410] text-white font-sans select-none flex flex-col items-center justify-between text-center"
      >
        <div className="text-[10px] tracking-widest font-mono text-purple-300 uppercase font-bold">
          SCAN TO PAY
        </div>

        {/* Real Scannable QR Code */}
        <div className="my-auto flex flex-col items-center">
          <DynamicQRCode value={upiUri} size={92} />
          <div className="text-xs font-black font-mono text-white mt-1">
            ₹ {formattedAmount}
          </div>
        </div>

        <div className="text-[7.5px] sm:text-[8px] text-purple-300/80 font-mono">
          Demo Simulation • Verifying payment...
        </div>
      </div>
    );
  }

  // 11. PAYMENT SUCCESSFUL
  if (screenState === 'PAYMENT_SUCCESSFUL') {
    return (
      <div
        id="terminal-screen-success"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-3 overflow-hidden border border-emerald-500/70 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95),0_0_20px_rgba(16,185,129,0.35)] bg-[#03120a] text-white font-sans select-none flex flex-col items-center justify-center text-center space-y-1.5 animate-fadeIn"
      >
        <div className="w-9 h-9 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_12px_#10b981]">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="text-sm sm:text-base font-black tracking-wide text-emerald-300">
          PAYMENT SUCCESSFUL ✓
        </div>
        <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
          ₹ {formattedAmount}
        </div>
        <div className="text-[9px] text-emerald-400/90 font-mono tracking-widest animate-pulse">
          DISPENSING RECEIPT...
        </div>
      </div>
    );
  }

  // 12. RECEIPT DISPENSING / COMPLETE
  if (screenState === 'RECEIPT_DISPENSING' || screenState === 'COMPLETE') {
    // When tear receipt is done, machine screen only shows NEW PAYMENT
    if (isReceiptTorn) {
      return (
        <div
          id="terminal-screen-complete"
          className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-4 overflow-hidden border border-cyan-600/50 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] bg-gradient-to-b from-[#060b12] via-[#04080e] to-[#020509] text-white font-sans select-none flex flex-col items-center justify-center text-center"
        >
          {/* Subtle CRT scanline effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, rgba(6,182,212,0.2) 0px, rgba(6,182,212,0.2) 1px, transparent 1px, transparent 3px)',
            }}
          />
          {/* Subtle glass reflection highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.07] to-transparent rounded-t-xl pointer-events-none" />

          <div className="relative z-10 w-full flex flex-col items-center justify-center my-auto">
            <button
              id="screen-new-payment-btn"
              type="button"
              onClick={onNewPayment}
              className="w-full max-w-[210px] py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:via-teal-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-black tracking-widest uppercase shadow-[0_0_16px_rgba(6,182,212,0.45)] transition-all active:scale-95 cursor-pointer border border-cyan-400/40 hover:border-cyan-300"
            >
              NEW PAYMENT
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        id="terminal-screen-complete"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-3 overflow-hidden border border-cyan-600/50 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] bg-[#040a12] text-white font-sans select-none flex flex-col justify-between text-center"
      >
        <div className="flex items-center justify-center gap-1 text-[10px] tracking-widest font-mono text-emerald-400 uppercase font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>TRANSACTION COMPLETE</span>
        </div>

        <div className="my-auto space-y-1">
          <div className="text-lg sm:text-xl font-black font-mono text-white">
            ₹ {order.total.toFixed(2)}
          </div>
          <div className="text-[10px] text-cyan-300/90 font-mono">
            {order.paymentMethod === 'CARD' ? 'CARD PAYMENT' : 'UPI PAYMENT'} • PAID
          </div>
          <div className="text-[9px] text-slate-400 font-mono">
            RECEIPT ISSUED BELOW
          </div>
        </div>

        {/* Small "NEW PAYMENT" button */}
        <div className="pt-1">
          <button
            id="screen-new-payment-btn"
            type="button"
            onClick={onNewPayment}
            className="w-full py-1 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-[10px] sm:text-xs font-black tracking-wider uppercase shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all active:scale-95 cursor-pointer"
          >
            NEW PAYMENT
          </button>
        </div>
      </div>
    );
  }

  // 13. CHOOSE PAYMENT METHOD SCREEN (When CARD/UPI not yet selected)
  if (!paymentMethod) {
    return (
      <div
        id="terminal-screen"
        className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-2.5 sm:p-3 overflow-hidden border border-black/70 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] bg-gradient-to-b from-[#060b12] via-[#04080e] to-[#020509] text-white font-sans select-none flex flex-col justify-between"
      >
        {/* Subtle CRT scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(6,182,212,0.2) 0px, rgba(6,182,212,0.2) 1px, transparent 1px, transparent 3px)',
          }}
        />
        {/* Subtle glass reflection highlight */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.07] to-transparent rounded-t-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top Header: WELCOME (only stay welcome, not need welcome logo) */}
          <div className="text-center">
            <div className="text-emerald-300 font-extrabold text-xs sm:text-sm tracking-wide">
              WELCOME
            </div>
            <div className="text-[8.5px] sm:text-[9.5px] tracking-[0.14em] text-cyan-300/90 font-mono uppercase font-semibold mt-0.5">
              CHOOSE YOUR PAYMENT METHOD
            </div>
          </div>

          {/* Two Selectable Cards: CARD vs UPI */}
          <div className="grid grid-cols-2 gap-2.5 my-auto py-2">
            {/* CARD Card */}
            <button
              id="display-select-card"
              type="button"
              onClick={() => onSelectPaymentMethod('CARD')}
              className="relative rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer bg-[#08121a]/90 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-950/50 hover:scale-[1.02] active:scale-95 shadow-[0_2px_10px_rgba(6,182,212,0.15)]"
            >
              <CreditCard className="w-6 h-6 text-cyan-400" />
              <span className="text-xs font-black tracking-wider text-cyan-200">
                CARD
              </span>
            </button>

            {/* UPI Card */}
            <button
              id="display-select-upi"
              type="button"
              onClick={() => onSelectPaymentMethod('UPI')}
              className="relative rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer bg-[#120a1c]/90 border border-purple-500/40 hover:border-purple-400 hover:bg-purple-950/50 hover:scale-[1.02] active:scale-95 shadow-[0_2px_10px_rgba(168,85,247,0.15)]"
            >
              <QrCode className="w-6 h-6 text-purple-400" />
              <span className="text-xs font-black tracking-wider text-purple-200">
                UPI
              </span>
            </button>
          </div>

          {/* Prompt instruction */}
          <div className="text-center text-[8px] sm:text-[9px] font-mono text-slate-400/80 tracking-widest uppercase pb-0.5">
            SELECT CARD OR UPI TO ENTER AMOUNT
          </div>
        </div>
      </div>
    );
  }

  // 14. ENTER AMOUNT SCREEN (Opens after selecting CARD or UPI - no card/upi options here)
  return (
    <div
      id="terminal-screen"
      className="relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-2.5 sm:p-3 overflow-hidden border border-black/70 shadow-[inset_0_4px_16px_rgba(0,0,0,0.95)] bg-gradient-to-b from-[#060b12] via-[#04080e] to-[#020509] text-white font-sans select-none flex flex-col justify-between"
    >
      {/* Subtle CRT scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(6,182,212,0.2) 0px, rgba(6,182,212,0.2) 1px, transparent 1px, transparent 3px)',
        }}
      />
      {/* Subtle glass reflection highlight */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.07] to-transparent rounded-t-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Header: WELCOME */}
        <div className="text-center">
          <div className="text-emerald-300 font-extrabold text-xs sm:text-sm tracking-wide">
            WELCOME
          </div>
          <div className="text-[8.5px] sm:text-[9.5px] tracking-[0.14em] text-cyan-300/90 font-mono uppercase font-semibold mt-0.5">
            ENTER AMOUNT ({paymentMethod})
          </div>
        </div>

        {/* Amount Box */}
        <div
          id="screen-amount-box"
          className="relative w-full rounded-xl bg-[#020509]/90 border border-cyan-500/50 p-2.5 sm:p-3 px-4 flex items-center justify-between shadow-[inset_0_2px_8px_rgba(0,0,0,0.9),0_0_12px_rgba(6,182,212,0.15)] my-auto"
        >
          <span className="text-lg sm:text-xl font-bold font-mono text-cyan-400">
            ₹
          </span>
          <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-wider">
            {formattedAmount}
          </span>
        </div>

        {/* Micro subtext with Back button */}
        <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-slate-400/80 tracking-wide mt-0.5 px-0.5">
          <button
            type="button"
            id="display-back-to-methods"
            onClick={() => onSelectPaymentMethod(null)}
            className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
          >
            ← BACK
          </button>
          <span>
            {parseFloat(formattedAmount) <= 0
              ? 'Enter amount on keypad'
              : 'Press ENTER on keypad'}
          </span>
        </div>
      </div>
    </div>
  );
};
