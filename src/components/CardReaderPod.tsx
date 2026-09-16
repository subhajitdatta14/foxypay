import React from 'react';
import { MachineScreenState, TerminalMode } from '../types';
import { Wifi, CreditCard } from 'lucide-react';
import { sound } from '../utils/sound';

interface CardReaderPodProps {
  screenState: MachineScreenState;
  isPoweredOn: boolean;
  onCardTap: () => void;
  mode?: TerminalMode;
}

export const CardReaderPod: React.FC<CardReaderPodProps> = ({
  screenState,
  isPoweredOn,
  onCardTap,
  mode = 'NORMAL',
}) => {
  const isAwaitingTap = isPoweredOn && screenState === 'AWAITING_CARD_TAP';
  const isCardDetected =
    isPoweredOn &&
    (screenState === 'CARD_DETECTED' ||
      screenState === 'ENTERING_PIN' ||
      screenState === 'AUTHORIZING');

  const handleClick = () => {
    if (!isPoweredOn) return;
    if (isAwaitingTap) {
      sound.playCardInsert();
      onCardTap();
    } else {
      sound.playBodyTap();
    }
  };

  return (
    <div
      id="card-reader-pod"
      onClick={handleClick}
      role="button"
      tabIndex={isAwaitingTap ? 0 : -1}
      title={isAwaitingTap ? 'Click/Tap to pay with card' : 'Contactless Card Reader'}
      className={`relative w-full h-full min-h-[195px] sm:min-h-[215px] rounded-xl p-2 sm:p-3 flex flex-col items-center justify-between select-none transition-all duration-200 touch-manipulation ${
        isAwaitingTap
          ? 'cursor-pointer ring-2 ring-emerald-400/90 shadow-[0_0_20px_rgba(16,185,129,0.4),inset_0_2px_6px_rgba(255,255,255,0.2)] animate-pulse'
          : 'cursor-default'
      }`}
      style={{
        background:
          'linear-gradient(180deg, #22262c 0%, #16181c 50%, #101215 100%)',
        border: isAwaitingTap
          ? '2px solid #10b981'
          : '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow:
          'inset 0 1px 1px rgba(255,255,255,0.15), 0 4px 10px rgba(0,0,0,0.6)',
      }}
    >
      {/* Top Label: TAP TO PAY */}
      <div className="text-center pt-0.5 sm:pt-1 w-full px-0.5">
        <div
          className={`text-[8.5px] sm:text-[10px] font-black tracking-wider sm:tracking-widest uppercase transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${
            isAwaitingTap
              ? 'text-emerald-300 drop-shadow-[0_0_6px_#10b981]'
              : isPoweredOn
              ? 'text-slate-300'
              : 'text-slate-600'
          }`}
        >
          TAP TO PAY
        </div>
      </div>

      {/* Center: Contactless NFC Wave Icon */}
      <div className="my-auto flex flex-col items-center justify-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isAwaitingTap
              ? 'bg-emerald-950/60 border border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.6)] scale-110'
              : isPoweredOn
              ? 'bg-slate-800/60 border border-slate-700 text-slate-400'
              : 'bg-slate-900 border border-slate-800 text-slate-700'
          }`}
        >
          {/* Rotated Wifi icon to represent horizontal contactless NFC payment waves ))) */}
          <Wifi className="w-6 h-6 rotate-90" />
        </div>

        {/* Pulsing "TAP HERE" hint when waiting */}
        {isAwaitingTap && (
          <div className="mt-2 text-[8px] sm:text-[9px] font-black text-emerald-400 tracking-wider uppercase animate-bounce">
            CLICK TO TAP
          </div>
        )}
      </div>

      {/* Horizontal glowing LED Indicator Bar */}
      <div className="w-full px-2">
        <div
          className={`w-full h-1.5 rounded-full transition-all duration-300 ${
            !isPoweredOn
              ? 'bg-slate-900 border border-slate-800'
              : isAwaitingTap
              ? 'bg-emerald-400 shadow-[0_0_12px_#10b981] animate-pulse'
              : isCardDetected
              ? 'bg-cyan-400 shadow-[0_0_12px_#06b6d4]'
              : 'bg-slate-700 border border-slate-600/40'
          }`}
        />
      </div>

      {/* Bottom: Stylized Chip / Card Slot Icon */}
      <div className="pb-1 text-center">
        <CreditCard
          className={`w-5 h-5 mx-auto transition-colors ${
            isAwaitingTap
              ? 'text-emerald-400'
              : isPoweredOn
              ? 'text-slate-500'
              : 'text-slate-700'
          }`}
        />
      </div>
    </div>
  );
};
