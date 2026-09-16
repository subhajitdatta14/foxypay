import React from 'react';
import { TerminalMode } from '../types';
import { sound } from '../utils/sound';

interface KeypadProps {
  isPoweredOn: boolean;
  disabled?: boolean;
  onDigitPress: (digit: string) => void;
  onClear: () => void;
  onEnter: () => void;
  mode?: TerminalMode;
}

export const Keypad: React.FC<KeypadProps> = ({
  isPoweredOn,
  disabled = false,
  onDigitPress,
  onClear,
  onEnter,
  mode = 'NORMAL',
}) => {
  const isKeypadDisabled = !isPoweredOn || disabled;

  const handleDigit = (digit: string) => {
    if (isKeypadDisabled) return;
    if (mode === 'RETRO_1987') {
      sound.playRetroKey();
    } else {
      sound.playKeypadClick(digit);
    }
    onDigitPress(digit);
  };

  const handleClear = () => {
    if (isKeypadDisabled) return;
    sound.playClearSound();
    onClear();
  };

  const handleEnter = () => {
    if (isKeypadDisabled) return;
    sound.playEnterSound();
    onEnter();
  };

  const keyBaseClass =
    'relative flex items-center justify-center font-bold select-none cursor-pointer rounded-lg text-sm sm:text-base transition-all duration-75 active:scale-95 shadow-[0_2px_4px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.12)] border border-black/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 touch-manipulation';

  return (
    <div
      id="numeric-keypad"
      className="grid grid-cols-3 gap-1.5 p-2 rounded-xl"
      style={{
        background: '#121418',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.9), 0 1px 2px rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* 1 2 3 */}
      {['1', '2', '3'].map((d) => (
        <button
          key={d}
          id={`keypad-${d}`}
          type="button"
          disabled={isKeypadDisabled}
          onClick={() => handleDigit(d)}
          className={`${keyBaseClass} h-8 sm:h-9 bg-[#23272e] text-white hover:bg-[#2c323a] active:bg-[#1a1d23]`}
        >
          {d}
        </button>
      ))}

      {/* 4 5 6 */}
      {['4', '5', '6'].map((d) => (
        <button
          key={d}
          id={`keypad-${d}`}
          type="button"
          disabled={isKeypadDisabled}
          onClick={() => handleDigit(d)}
          className={`${keyBaseClass} h-8 sm:h-9 bg-[#23272e] text-white hover:bg-[#2c323a] active:bg-[#1a1d23]`}
        >
          {d}
        </button>
      ))}

      {/* 7 8 9 */}
      {['7', '8', '9'].map((d) => (
        <button
          key={d}
          id={`keypad-${d}`}
          type="button"
          disabled={isKeypadDisabled}
          onClick={() => handleDigit(d)}
          className={`${keyBaseClass} h-8 sm:h-9 bg-[#23272e] text-white hover:bg-[#2c323a] active:bg-[#1a1d23]`}
        >
          {d}
        </button>
      ))}

      {/* CLR */}
      <button
        id="keypad-clr"
        type="button"
        disabled={isKeypadDisabled}
        onClick={handleClear}
        className={`${keyBaseClass} h-8 sm:h-9 bg-red-600 text-white hover:bg-red-500 active:bg-red-700 text-xs font-black tracking-wider shadow-[0_2px_6px_rgba(220,38,38,0.4)]`}
      >
        CLR
      </button>

      {/* 0 */}
      <button
        id="keypad-0"
        type="button"
        disabled={isKeypadDisabled}
        onClick={() => handleDigit('0')}
        className={`${keyBaseClass} h-8 sm:h-9 bg-[#23272e] text-white hover:bg-[#2c323a] active:bg-[#1a1d23]`}
      >
        0
      </button>

      {/* ENTER */}
      <button
        id="keypad-enter"
        type="button"
        disabled={isKeypadDisabled}
        onClick={handleEnter}
        className={`${keyBaseClass} h-8 sm:h-9 bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 text-[10px] sm:text-xs font-black tracking-wider shadow-[0_2px_8px_rgba(16,185,129,0.45)]`}
      >
        ENTER
      </button>
    </div>
  );
};
