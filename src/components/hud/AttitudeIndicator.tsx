import React from 'react';
import { useMissionStore } from '../../stores/missionStore';
import { Compass, Lock, Unlock, Navigation } from 'lucide-react';
import { Tooltip } from 'antd';

export const AttitudeIndicator: React.FC = () => {
  const { telemetry, toggleHold } = useMissionStore();

  const roll = telemetry.roll;
  const pitch = telemetry.pitch;
  const heading = telemetry.heading;

  return (
    <div className="cockpit-panel p-3 flex flex-col justify-between hud-corner">
      <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-2 font-bold">
        <span className="flex items-center gap-1.5 text-white">
          <Navigation className="w-3.5 h-3.5 text-[#38bdf8]" />
          姿态仪与罗盘 (ATT & GYRO)
        </span>
        <div className="flex items-center gap-1.5">
          <Tooltip title="定深自控闭环锁定 (Depth Hold)">
            <button
              onClick={() => toggleHold('depth')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 border transition-all ${
                telemetry.depthHold
                  ? 'bg-[rgba(16,185,129,0.18)] text-[#10b981] border-[rgba(16,185,129,0.45)]'
                  : 'bg-[#070d17] text-[#64748b] border-[rgba(148,163,184,0.2)]'
              }`}
            >
              {telemetry.depthHold ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              定深
            </button>
          </Tooltip>

          <Tooltip title="定向自控闭环锁定 (Heading Lock)">
            <button
              onClick={() => toggleHold('heading')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 border transition-all ${
                telemetry.headingHold
                  ? 'bg-[rgba(16,185,129,0.18)] text-[#10b981] border-[rgba(16,185,129,0.45)]'
                  : 'bg-[#070d17] text-[#64748b] border-[rgba(148,163,184,0.2)]'
              }`}
            >
              {telemetry.headingHold ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              定向
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 items-center">
        {/* Left: Artificial Horizon (Pitch & Roll) */}
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28 rounded-full border border-[rgba(148,163,184,0.25)] overflow-hidden bg-[#071322] shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]">
            {/* Horizon Disc that tilts and shifts with pitch & roll */}
            <div
              className="absolute inset-[-40px] transition-transform duration-300 ease-out"
              style={{
                transform: `rotate(${roll}deg) translateY(${pitch * 2.5}px)`,
              }}
            >
              {/* Sky */}
              <div className="w-full h-1/2 bg-gradient-to-b from-[#112a45] to-[#1e4974]" />
              {/* White Horizon Line */}
              <div className="w-full h-[1.5px] bg-white opacity-90 shadow-[0_0_4px_white]" />
              {/* Sea Bed */}
              <div className="w-full h-1/2 bg-gradient-to-b from-[#1f3b34] to-[#0c1f1a]" />
            </div>

            {/* Fixed Central Aircraft / ROV Symbol */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-[1.5px] bg-[#f59e0b] shadow-[0_0_4px_#f59e0b]" />
              <div className="w-2.5 h-2.5 rounded-full border border-[#f59e0b] bg-transparent absolute" />
            </div>

            {/* Pitch degree ticks */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-[8px] text-[rgba(255,255,255,0.7)] font-mono font-bold">
              <span className="mb-2">- 10 -</span>
              <span className="mt-2">- 10 -</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 font-mono text-[11px]">
            <span className="text-[#94a3b8]">
              俯仰: <strong className="text-white text-xs">{pitch > 0 ? `+${pitch.toFixed(1)}` : pitch.toFixed(1)}°</strong>
            </span>
            <span className="text-[#94a3b8]">
              翻滚: <strong className="text-white text-xs">{roll > 0 ? `+${roll.toFixed(1)}` : roll.toFixed(1)}°</strong>
            </span>
          </div>
        </div>

        {/* Right: Heading Compass Dial */}
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28 rounded-full border border-[rgba(148,163,184,0.25)] flex items-center justify-center bg-[#071322] shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]">
            {/* Rotating Compass Ring */}
            <div
              className="absolute inset-0 rounded-full transition-transform duration-300 ease-out"
              style={{
                transform: `rotate(${-heading}deg)`,
              }}
            >
              {/* Compass Cardinal Points */}
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#ef4444] font-mono">
                N
              </span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#cbd5e1] font-mono">
                S
              </span>
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#cbd5e1] font-mono">
                E
              </span>
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-[#cbd5e1] font-mono">
                W
              </span>
              {/* Subtle ticks */}
              <div className="absolute inset-2 rounded-full border border-dashed border-[rgba(148,163,184,0.22)]" />
            </div>

            {/* Static Pointer at Top */}
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[#38bdf8] text-xs font-mono pointer-events-none">
              ▼
            </div>

            {/* Center Digital Heading */}
            <div className="font-mono text-center pointer-events-none z-10">
              <div className="text-base font-bold text-white tracking-tight">
                {Math.round(heading)}°
              </div>
              <div className="text-[9px] text-[#64748b] uppercase font-semibold">HDG</div>
            </div>
          </div>

          <div className="mt-1.5 font-mono text-[11px] text-[#94a3b8]">
            模式: <span className="text-[#10b981] font-semibold">EKF-磁航向校准</span>
          </div>
        </div>
      </div>
    </div>
  );
};


