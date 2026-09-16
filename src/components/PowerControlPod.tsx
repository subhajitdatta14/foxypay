import React from 'react';
import { Power } from 'lucide-react';
import { sound } from '../utils/sound';

interface PowerControlPodProps {
  isPoweredOn: boolean;
  onTogglePower: () => void;
}

export const PowerControlPod: React.FC<PowerControlPodProps> = ({
  isPoweredOn,
  onTogglePower,
}) => {
  const handleClick = () => {
    onTogglePower();
  };

  return (
    <div
      id="power-control-pod"
      className="flex flex-col justify-between h-full p-2 rounded-xl"
      style={{
        background: '#121418',
        boxShadow:
          'inset 0 2px 6px rgba(0,0,0,0.9), 0 1px 2px rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Physical ON / OFF Button */}
      <button
        id="machine-power-btn"
        type="button"
        onClick={handleClick}
        title={isPoweredOn ? 'Power OFF Machine' : 'Power ON Machine'}
        className={`w-full py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-100 select-none cursor-pointer active:scale-95 border touch-manipulation ${
          isPoweredOn
            ? 'bg-gradient-to-b from-[#2d333b] to-[#1c2127] border-cyan-500/40 shadow-[0_2px_6px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] text-cyan-300 hover:border-cyan-400'
            : 'bg-gradient-to-b from-[#22262d] to-[#16191f] border-slate-700 shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-slate-400 hover:text-white hover:border-slate-500'
        }`}
      >
        <Power
          className={`w-4 h-4 transition-colors ${
            isPoweredOn
              ? 'text-cyan-400 drop-shadow-[0_0_6px_#06b6d4]'
              : 'text-slate-400'
          }`}
        />
        <span className="text-[9px] font-black tracking-widest uppercase">
          ON / OFF
        </span>
      </button>

      {/* Machine Status Plate */}
      <div
        id="machine-status-plate"
        className="w-full mt-1.5 p-1.5 rounded-lg bg-[#0a0c0f] border border-black/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] flex flex-col items-center justify-center text-center select-none"
      >
        {/* LED Light Indicator */}
        <div className="flex items-center gap-1.5 py-0.5">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              isPoweredOn
                ? 'bg-emerald-400 shadow-[0_0_8px_#10b981,0_0_2px_#fff]'
                : 'bg-slate-800 border border-slate-700'
            }`}
          />
          <span className="text-[8px] font-black tracking-wider text-slate-400 uppercase font-mono">
            MACHINE
          </span>
        </div>
      </div>
    </div>
  );
};
