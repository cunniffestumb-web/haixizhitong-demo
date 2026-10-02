import React, { useEffect } from 'react';
import { useMissionStore } from '../../stores/missionStore';
import { MotionDirection } from '../../types';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  RotateCw,
  ChevronsUp,
  ChevronsDown,
  Sliders,
  Cpu,
  Compass,
  Zap,
} from 'lucide-react';
import { Slider, Tooltip } from 'antd';

export const ThrusterVisualizer: React.FC = () => {
  const { thrusters, telemetry, motionState, triggerMotion, updateLight } = useMissionStore();

  // Keyboard shortcut listener for full WASD / QE / RF flight stick controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'w' || e.key === 'ArrowUp') {
        e.preventDefault();
        triggerMotion('forward');
      } else if (key === 's' || e.key === 'ArrowDown') {
        e.preventDefault();
        triggerMotion('backward');
      } else if (key === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        triggerMotion('strafe_left');
      } else if (key === 'd' || e.key === 'ArrowRight') {
        e.preventDefault();
        triggerMotion('strafe_right');
      } else if (key === 'q') {
        e.preventDefault();
        triggerMotion('yaw_left');
      } else if (key === 'e') {
        e.preventDefault();
        triggerMotion('yaw_right');
      } else if (key === 'r') {
        e.preventDefault();
        triggerMotion('ascend');
      } else if (key === 'f') {
        e.preventDefault();
        triggerMotion('descend');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerMotion]);

  const isDir = (dir: MotionDirection) => motionState.direction === dir;

  return (
    <div className="cockpit-panel p-3 flex flex-col justify-between hud-corner">
      {/* Title */}
      <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-2 font-bold">
        <span className="flex items-center gap-1.5 text-white">
          <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
          动力矩阵与操控席 (6-DOF MATRIX)
        </span>
        <span className="text-[10px] text-[#10b981] bg-[rgba(16,185,129,0.15)] px-2 py-0.5 rounded border border-[rgba(16,185,129,0.35)] font-mono font-bold">
          6/6 推进器在线
        </span>
      </div>

      {/* Thruster Grid */}
      <div className="bg-[#070d17] rounded-md p-2 border border-[rgba(148,163,184,0.14)] mb-2.5 shadow-inner">
        <div className="grid grid-cols-3 gap-1.5">
          {thrusters.map((t) => {
            const isSpiking = t.load > 65;
            return (
              <div
                key={t.id}
                className={`p-1.5 rounded border flex flex-col justify-between transition-all duration-200 ${
                  isSpiking
                    ? 'bg-[#12233b] border-[rgba(14,165,233,0.6)] shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                    : 'bg-[#0b1523] border-[rgba(148,163,184,0.12)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-[11px]">{t.id}</span>
                  <span
                    className={`text-[10px] font-mono font-semibold ${
                      isSpiking ? 'text-[#38bdf8] font-bold' : 'text-[#64748b]'
                    }`}
                  >
                    {t.pwm}µs
                  </span>
                </div>
                <div className="text-[9px] text-[#94a3b8] truncate font-medium">{t.role}</div>
                {/* Load Bar */}
                <div className="w-full bg-[#050b14] h-2 rounded-full mt-1.5 overflow-hidden border border-[rgba(148,163,184,0.1)]">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${
                      t.load > 70
                        ? 'bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]'
                        : t.load > 45
                        ? 'bg-[#0ea5e9]'
                        : 'bg-[#0284c7]'
                    }`}
                    style={{ width: `${t.load}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] mt-1 font-mono">
                  <span className="text-[#64748b]">负载</span>
                  <span className={isSpiking ? 'text-[#38bdf8] font-bold' : 'text-[#94a3b8]'}>
                    {t.load}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motion Controls (Virtual Joystick Keypad with Keyboard Mapping) */}
      <div className="bg-[#070d17] rounded-md p-2.5 border border-[rgba(148,163,184,0.14)] mb-2.5 shadow-inner">
        {/* Dynamic Velocity Telemetry Status Pill */}
        <div className="flex items-center justify-between text-[10px] font-mono bg-[#0b1523] px-2.5 py-1 rounded border border-[rgba(148,163,184,0.15)] mb-2.5 shadow-sm">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                motionState.direction !== 'idle'
                  ? 'bg-[#10b981] animate-ping'
                  : 'bg-[#0ea5e9]'
              }`}
            />
            <span className="text-[#64748b]">矢量态:</span>
            <span className="text-[#38bdf8] font-bold truncate">
              {motionState.direction === 'forward' && '前推加速 (Surge +1.2m/s)'}
              {motionState.direction === 'backward' && '倒退后移 (Surge -0.8m/s)'}
              {motionState.direction === 'strafe_left' && '左舷平移 (Sway -0.7m/s)'}
              {motionState.direction === 'strafe_right' && '右舷平移 (Sway +0.7m/s)'}
              {motionState.direction === 'yaw_left' && '左舵转向 (Yaw -5°)'}
              {motionState.direction === 'yaw_right' && '右舵转向 (Yaw +5°)'}
              {motionState.direction === 'ascend' && '垂直上浮 (Heave -0.3m)'}
              {motionState.direction === 'descend' && '垂直下潜 (Heave +0.3m)'}
              {motionState.direction === 'idle' && '定深巡航·姿态自稳就绪'}
            </span>
          </div>
          <span className="text-[9px] text-[#94a3b8] font-mono shrink-0 pl-1">
            支持键盘联动
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Horizontal Movement Cross (WASD) */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => triggerMotion('forward')}
              title="前推 (W 或 ↑)"
              className={`w-10 h-8 rounded-md flex flex-col items-center justify-center transition-all active:scale-95 border ${
                isDir('forward')
                  ? 'bg-[#0ea5e9] text-white border-white shadow-[0_0_12px_#38bdf8]'
                  : 'bg-[#111f33] hover:bg-[#1a2f4d] border-[rgba(148,163,184,0.22)] text-white'
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className="text-[8px] font-mono text-[#94a3b8] leading-none mt-0.5">W</span>
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => triggerMotion('strafe_left')}
                title="左舷平移 (A 或 ←)"
                className={`w-10 h-8 rounded-md flex flex-col items-center justify-center transition-all active:scale-95 border ${
                  isDir('strafe_left')
                    ? 'bg-[#0ea5e9] text-white border-white shadow-[0_0_12px_#38bdf8]'
                    : 'bg-[#111f33] hover:bg-[#1a2f4d] border-[rgba(148,163,184,0.22)] text-white'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="text-[8px] font-mono text-[#94a3b8] leading-none mt-0.5">A</span>
              </button>
              <button
                onClick={() => triggerMotion('backward')}
                title="倒退后移 (S 或 ↓)"
                className={`w-10 h-8 rounded-md flex flex-col items-center justify-center transition-all active:scale-95 border ${
                  isDir('backward')
                    ? 'bg-[#0ea5e9] text-white border-white shadow-[0_0_12px_#38bdf8]'
                    : 'bg-[#111f33] hover:bg-[#1a2f4d] border-[rgba(148,163,184,0.22)] text-white'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="text-[8px] font-mono text-[#94a3b8] leading-none mt-0.5">S</span>
              </button>
              <button
                onClick={() => triggerMotion('strafe_right')}
                title="右舷平移 (D 或 →)"
                className={`w-10 h-8 rounded-md flex flex-col items-center justify-center transition-all active:scale-95 border ${
                  isDir('strafe_right')
                    ? 'bg-[#0ea5e9] text-white border-white shadow-[0_0_12px_#38bdf8]'
                    : 'bg-[#111f33] hover:bg-[#1a2f4d] border-[rgba(148,163,184,0.22)] text-white'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span className="text-[8px] font-mono text-[#94a3b8] leading-none mt-0.5">D</span>
              </button>
            </div>
          </div>

          {/* Yaw & Vertical Controls (QE / RF) */}
          <div className="grid grid-cols-2 gap-1.5 flex-1 max-w-[145px]">
            <Tooltip title="左转偏航调姿 (快捷键 Q)">
              <button
                onClick={() => triggerMotion('yaw_left')}
                className={`h-8 rounded-md flex items-center justify-center gap-1 text-[11px] font-semibold transition-all active:scale-95 border ${
                  isDir('yaw_left')
                    ? 'bg-[#0ea5e9] text-white border-white shadow-[0_0_12px_#38bdf8]'
                    : 'bg-[#111f33] hover:bg-[#1a2f4d] border-[rgba(148,163,184,0.22)] text-white'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#38bdf8]" />
                左舵 <span className="text-[9px] text-[#94a3b8] font-mono">[Q]</span>
              </button>
            </Tooltip>

            <Tooltip title="右转偏航调姿 (快捷键 E)">
              <button
                onClick={() => triggerMotion('yaw_right')}
                className={`h-8 rounded-md flex items-center justify-center gap-1 text-[11px] font-semibold transition-all active:scale-95 border ${
                  isDir('yaw_right')
                    ? 'bg-[#0ea5e9] text-white border-white shadow-[0_0_12px_#38bdf8]'
                    : 'bg-[#111f33] hover:bg-[#1a2f4d] border-[rgba(148,163,184,0.22)] text-white'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5 text-[#38bdf8]" />
                右舵 <span className="text-[9px] text-[#94a3b8] font-mono">[E]</span>
              </button>
            </Tooltip>

            <Tooltip title="垂直双推协同上浮 (快捷键 R)">
              <button
                onClick={() => triggerMotion('ascend')}
                className={`h-8 rounded-md flex items-center justify-center gap-1 text-[11px] font-semibold transition-all active:scale-95 border ${
                  isDir('ascend')
                    ? 'bg-[#10b981] text-white border-white shadow-[0_0_12px_#10b981]'
                    : 'bg-[#111f33] hover:bg-[#1a2f4d] border-[rgba(148,163,184,0.22)] text-[#10b981]'
                }`}
              >
                <ChevronsUp className="w-4 h-4" />
                上浮 <span className="text-[9px] text-[#94a3b8] font-mono">[R]</span>
              </button>
            </Tooltip>

            <Tooltip title="垂直双推协同下潜 (快捷键 F)">
              <button
                onClick={() => triggerMotion('descend')}
                className={`h-8 rounded-md flex items-center justify-center gap-1 text-[11px] font-semibold transition-all active:scale-95 border ${
                  isDir('descend')
                    ? 'bg-[#0ea5e9] text-white border-white shadow-[0_0_12px_#38bdf8]'
                    : 'bg-[#111f33] hover:bg-[#1a2f4d] border-[rgba(148,163,184,0.22)] text-[#38bdf8]'
                }`}
              >
                <ChevronsDown className="w-4 h-4" />
                下潜 <span className="text-[9px] text-[#94a3b8] font-mono">[F]</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Auxiliary LED Lighting Controls */}
      <div className="bg-[#070d17] rounded-md p-2.5 border border-[rgba(148,163,184,0.14)] shadow-inner">
        <div className="flex items-center justify-between text-xs text-white font-bold mb-1.5">
          <span className="flex items-center gap-1.5 text-[#f59e0b]">
            <Sliders className="w-3.5 h-3.5" />
            深海大功率 LED 补光阵列 (0-100%)
          </span>
          <span className="font-mono text-[#f59e0b] text-[11px] font-bold">
            {Math.round((telemetry.lightLeft + telemetry.lightRight) / 2)}% 亮度
          </span>
        </div>

        <div className="space-y-1.5 font-sans">
          <div className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
            <span className="w-10 font-medium">左舷:</span>
            <Slider
              min={0}
              max={100}
              value={telemetry.lightLeft}
              onChange={(val) => updateLight(val, telemetry.lightRight)}
              className="flex-1 my-1"
            />
            <span className="font-mono font-bold text-white w-8 text-right">{telemetry.lightLeft}%</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
            <span className="w-10 font-medium">右舷:</span>
            <Slider
              min={0}
              max={100}
              value={telemetry.lightRight}
              onChange={(val) => updateLight(telemetry.lightLeft, val)}
              className="flex-1 my-1"
            />
            <span className="font-mono font-bold text-white w-8 text-right">{telemetry.lightRight}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

