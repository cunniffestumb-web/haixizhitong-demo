import React from 'react';
import { useMissionStore } from '../../stores/missionStore';
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
} from 'lucide-react';
import { Slider, Tooltip } from 'antd';

export const ThrusterVisualizer: React.FC = () => {
  const { thrusters, telemetry, updateLight, sendCommand } = useMissionStore();

  const handleMove = (direction: string) => {
    let summary = '';
    switch (direction) {
      case 'forward':
        summary = '动力控制：全向推进器协同前推 (Forward +1.2m/s)';
        break;
      case 'backward':
        summary = '动力控制：协同倒退后移 (Reverse -0.8m/s)';
        break;
      case 'strafe_left':
        summary = '动力控制：平移左舷横移 (Strafe Left)';
        break;
      case 'strafe_right':
        summary = '动力控制：平移右舷横移 (Strafe Right)';
        break;
      case 'yaw_left':
        summary = '航向微调：左转偏航转向 (Yaw Left -5°)';
        useMissionStore.getState().updateTelemetry({ heading: (telemetry.heading - 5 + 360) % 360 });
        break;
      case 'yaw_right':
        summary = '航向微调：右转偏航转向 (Yaw Right +5°)';
        useMissionStore.getState().updateTelemetry({ heading: (telemetry.heading + 5) % 360 });
        break;
      case 'ascend':
        summary = '垂向控制：垂直双推上浮 (Ascend -0.3m)';
        useMissionStore.getState().updateTelemetry({ depth: Math.max(0.5, telemetry.depth - 0.3) });
        break;
      case 'descend':
        summary = '垂向控制：垂直双推下潜 (Descend +0.3m)';
        useMissionStore.getState().updateTelemetry({ depth: telemetry.depth + 0.3 });
        break;
      default:
        break;
    }

    sendCommand('move', { direction }, summary);
  };

  return (
    <div className="cockpit-panel p-3 flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between text-xs text-[#94a3b8] mb-2 font-semibold">
        <span className="flex items-center gap-1.5 text-white">
          <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
          动力矩阵与操控席 (6-DOF MATRIX)
        </span>
        <span className="text-[10px] text-[#10b981] bg-[rgba(16,185,129,0.12)] px-1.5 py-0.2 rounded border border-[rgba(16,185,129,0.3)] font-mono">
          6/6 在线
        </span>
      </div>

      {/* Thruster Grid */}
      <div className="bg-[#070d17] rounded p-2 border border-[rgba(148,163,184,0.14)] mb-3">
        <div className="grid grid-cols-3 gap-1.5">
          {thrusters.map((t) => (
            <div
              key={t.id}
              className="bg-[#0b1523] p-1.5 rounded border border-[rgba(148,163,184,0.1)] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-white text-[11px]">{t.id}</span>
                <span className="text-[9px] text-[#38bdf8] font-mono">{t.pwm}µs</span>
              </div>
              <div className="text-[9px] text-[#64748b] truncate">{t.role}</div>
              {/* Load Bar */}
              <div className="w-full bg-[#050b14] h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    t.load > 70 ? 'bg-[#ef4444]' : t.load > 45 ? 'bg-[#f59e0b]' : 'bg-[#0ea5e9]'
                  }`}
                  style={{ width: `${t.load}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[8px] text-[#64748b] mt-0.5 font-mono">
                <span>负载</span>
                <span className="text-[#94a3b8]">{t.load}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motion Controls (Virtual Joystick Keypad) */}
      <div className="bg-[#070d17] rounded p-2 border border-[rgba(148,163,184,0.14)] mb-3">
        <div className="text-[10px] text-[#64748b] mb-1.5 font-mono flex items-center justify-between">
          <span>6 自由度手动航行姿态推力微调</span>
          <span className="text-[#38bdf8]">手柄/键盘联动就绪</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Horizontal Movement Cross */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleMove('forward')}
              className="w-8 h-8 rounded bg-[#111f33] hover:bg-[#1a2f4d] border border-[rgba(148,163,184,0.18)] flex items-center justify-center text-white active:scale-95 transition-all"
            >
              <ArrowUp className="w-3.5 h-3.5 text-[#38bdf8]" />
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleMove('strafe_left')}
                className="w-8 h-8 rounded bg-[#111f33] hover:bg-[#1a2f4d] border border-[rgba(148,163,184,0.18)] flex items-center justify-center text-white active:scale-95 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#38bdf8]" />
              </button>
              <button
                onClick={() => handleMove('backward')}
                className="w-8 h-8 rounded bg-[#111f33] hover:bg-[#1a2f4d] border border-[rgba(148,163,184,0.18)] flex items-center justify-center text-white active:scale-95 transition-all"
              >
                <ArrowDown className="w-3.5 h-3.5 text-[#38bdf8]" />
              </button>
              <button
                onClick={() => handleMove('strafe_right')}
                className="w-8 h-8 rounded bg-[#111f33] hover:bg-[#1a2f4d] border border-[rgba(148,163,184,0.18)] flex items-center justify-center text-white active:scale-95 transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8]" />
              </button>
            </div>
          </div>

          {/* Yaw & Vertical Controls */}
          <div className="grid grid-cols-2 gap-1.5 flex-1 max-w-[130px]">
            <Tooltip title="左转偏航">
              <button
                onClick={() => handleMove('yaw_left')}
                className="h-8 rounded bg-[#111f33] hover:bg-[#1a2f4d] border border-[rgba(148,163,184,0.18)] flex items-center justify-center gap-1 text-[10px] text-white active:scale-95 transition-all"
              >
                <RotateCcw className="w-3 h-3 text-[#38bdf8]" />
                左舵
              </button>
            </Tooltip>

            <Tooltip title="右转偏航">
              <button
                onClick={() => handleMove('yaw_right')}
                className="h-8 rounded bg-[#111f33] hover:bg-[#1a2f4d] border border-[rgba(148,163,184,0.18)] flex items-center justify-center gap-1 text-[10px] text-white active:scale-95 transition-all"
              >
                <RotateCw className="w-3 h-3 text-[#38bdf8]" />
                右舵
              </button>
            </Tooltip>

            <Tooltip title="垂直双推上浮">
              <button
                onClick={() => handleMove('ascend')}
                className="h-8 rounded bg-[#111f33] hover:bg-[#1a2f4d] border border-[rgba(148,163,184,0.18)] flex items-center justify-center gap-1 text-[10px] text-[#10b981] active:scale-95 transition-all"
              >
                <ChevronsUp className="w-3.5 h-3.5" />
                上浮
              </button>
            </Tooltip>

            <Tooltip title="垂直双推下潜">
              <button
                onClick={() => handleMove('descend')}
                className="h-8 rounded bg-[#111f33] hover:bg-[#1a2f4d] border border-[rgba(148,163,184,0.18)] flex items-center justify-center gap-1 text-[10px] text-[#38bdf8] active:scale-95 transition-all"
              >
                <ChevronsDown className="w-3.5 h-3.5" />
                下潜
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Auxiliary LED Lighting Controls */}
      <div className="bg-[#070d17] rounded p-2.5 border border-[rgba(148,163,184,0.14)]">
        <div className="flex items-center justify-between text-[11px] text-white font-medium mb-1">
          <span className="flex items-center gap-1 text-[#f59e0b]">
            <Sliders className="w-3.5 h-3.5" />
            深海大功率 LED 补光阵列 (0-100%)
          </span>
          <span className="font-mono text-[#f59e0b] text-[10px]">
            {Math.round((telemetry.lightLeft + telemetry.lightRight) / 2)}%
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
            <span className="w-10">左舷:</span>
            <Slider
              min={0}
              max={100}
              value={telemetry.lightLeft}
              onChange={(val) => updateLight(val, telemetry.lightRight)}
              className="flex-1 my-1"
            />
            <span className="font-mono text-white w-7 text-right">{telemetry.lightLeft}%</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#94a3b8]">
            <span className="w-10">右舷:</span>
            <Slider
              min={0}
              max={100}
              value={telemetry.lightRight}
              onChange={(val) => updateLight(telemetry.lightLeft, val)}
              className="flex-1 my-1"
            />
            <span className="font-mono text-white w-7 text-right">{telemetry.lightRight}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
