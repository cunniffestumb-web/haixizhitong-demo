import React, { useEffect, useState } from 'react';
import { useMissionStore } from '../stores/missionStore';
import { useTourStore } from '../stores/tourStore';
import {
  Compass,
  BatteryCharging,
  Wifi,
  Radio,
  SlidersHorizontal,
  Layers,
  BarChart2,
  FileText,
  Anchor,
  Cpu,
  History,
  Eye,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Tooltip, Dropdown, MenuProps, Modal } from 'antd';

export const Header: React.FC = () => {
  const {
    platformMode,
    shoreTab,
    analysisTab,
    mission,
    images,
    telemetry,
    hasNewAnalysisData,
    clearNewAnalysisDataNotification,
    setPlatformMode,
    setShoreTab,
    setAnalysisTab,
    emergencyStop,
    resetDemo,
    loadFullDemoDataset,
    resetToCleanState,
  } = useMissionStore();

  const { openTour } = useTourStore();

  const [seconds, setSeconds] = useState(mission.elapsedSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getBatteryColor = (level: number) => {
    if (level > 40) return '#10b981';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
  };

  const handleSwitchPlatform = (mode: 'shore' | 'analysis') => {
    setPlatformMode(mode);
    if (mode === 'analysis') {
      clearNewAnalysisDataNotification();
    }
  };

  const tourMenuItems: MenuProps['items'] = [
    {
      key: 'tour-full',
      label: (
        <span className="flex items-center gap-2 text-xs text-[#38bdf8] hover:text-white font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
          🚀 全流程核心闭环向导 (软硬件协同 · 10 步)
        </span>
      ),
      onClick: () => openTour('full'),
    },
    {
      type: 'divider',
    },
    {
      key: 'tour-shore',
      label: (
        <span className="flex items-center gap-2 text-xs text-[#94a3b8] hover:text-white">
          <Anchor className="w-3.5 h-3.5 text-[#0ea5e9]" />
          ⚓ ROV 岸端控制台向导 (遥测/抓拍/补光 · 6 步)
        </span>
      ),
      onClick: () => openTour('shore'),
    },
    {
      key: 'tour-analysis',
      label: (
        <span className="flex items-center gap-2 text-xs text-[#94a3b8] hover:text-white">
          <Cpu className="w-3.5 h-3.5 text-[#10b981]" />
          🔬 FBDPN 智能分析平台向导 (AI 复核/报告 · 4 步)
        </span>
      ),
      onClick: () => openTour('analysis'),
    },
  ];

  const settingsMenuItems: MenuProps['items'] = [
    {
      key: 'load-demo',
      label: (
        <span className="flex items-center gap-2 text-xs text-[#38bdf8] hover:text-white font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
          一键装填全套示范成果 (12 帧海床切片)
        </span>
      ),
      onClick: () => {
        loadFullDemoDataset();
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'reset',
      label: (
        <span className="flex items-center gap-2 text-xs text-[#94a3b8] hover:text-white">
          <RotateCcw className="w-3.5 h-3.5 text-[#0ea5e9]" />
          重置为出航初始态 (0 帧·纯净实拍)
        </span>
      ),
      onClick: () => {
        Modal.confirm({
          title: '重置出航初始态',
          content: '是否清空抓拍卷轴并恢复为 ROV 刚下水出航状态 (0 帧)？您可以亲自操控硬件并抓拍水下样点。',
          okText: '确认重置',
          cancelText: '取消',
          okButtonProps: { danger: true },
          onOk: () => resetToCleanState(),
        });
      },
    },
  ];

  return (
    <header className="h-[62px] bg-[#0b1523] border-b border-[rgba(148,163,184,0.18)] px-2 2xl:px-3.5 flex items-center justify-between select-none relative z-50 shadow-md gap-1.5 2xl:gap-2 overflow-x-hidden">
      {/* Left: Brand & Dual-Platform Pill Navigation */}
      <div className="flex items-center gap-2 2xl:gap-3 shrink-0">
        {/* Brand Logo & Title */}
        <div id="tour-brand-header" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#0c243c] to-[#0b1523] border border-[rgba(14,165,233,0.35)] flex items-center justify-center text-[#38bdf8] shadow-[0_0_10px_rgba(14,165,233,0.15)] shrink-0">
            <Eye className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="leading-tight shrink-0 whitespace-nowrap">
            <div className="text-sm font-bold tracking-wide text-white flex items-center gap-1.5">
              <span>海析智曈</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0c1f38] text-[#38bdf8] border border-[rgba(14,165,233,0.35)] font-mono font-semibold tracking-normal">
                v2.4-PRO
              </span>
            </div>
            <div className="hidden min-[1680px]:block text-[9px] text-[#94a3b8] tracking-wider uppercase font-mono font-medium">
              ROV-GCS & FBDPN AI PLATFORM
            </div>
          </div>
        </div>

        {/* Dual-Platform Main Switcher */}
        <div id="tour-platform-switcher" className="flex bg-[#070d17] p-1 rounded-md border border-[rgba(148,163,184,0.18)] shadow-inner shrink-0 whitespace-nowrap">
          <button
            onClick={() => handleSwitchPlatform('shore')}
            className={`flex items-center gap-1.5 px-2.5 py-1 2xl:px-3 2xl:py-1.5 rounded text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              platformMode === 'shore'
                ? 'bg-gradient-to-r from-[#12233b] to-[#162d4c] text-[#38bdf8] border border-[rgba(14,165,233,0.45)] shadow-sm'
                : 'text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
            }`}
          >
            <Anchor className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">ROV 岸端地面控制台</span>
          </button>

          <button
            onClick={() => handleSwitchPlatform('analysis')}
            className={`relative flex items-center gap-1.5 px-2.5 py-1 2xl:px-3 2xl:py-1.5 rounded text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              platformMode === 'analysis'
                ? 'bg-gradient-to-r from-[#0f2820] to-[#14362b] text-[#34d399] border border-[rgba(16,185,129,0.45)] shadow-sm'
                : 'text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">FBDPN 智能分析平台</span>
            {hasNewAnalysisData && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f59e0b]" />
              </span>
            )}
          </button>
        </div>

        {/* Sub-navigation tabs based on Platform Mode */}
        <div className="flex items-center gap-1 2xl:gap-1.5 border-l border-[rgba(148,163,184,0.18)] pl-2 2xl:pl-3 shrink-0 whitespace-nowrap">
          {platformMode === 'shore' ? (
            <>
              <button
                onClick={() => setShoreTab('cockpit')}
                className={`px-2 py-1 2xl:px-2.5 2xl:py-1.5 rounded text-xs transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap shrink-0 ${
                  shoreTab === 'cockpit'
                    ? 'text-white bg-[#12233b] font-semibold border border-[rgba(14,165,233,0.4)] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#070d17]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                <span className="whitespace-nowrap">作业驾驶舱</span>
              </button>
              <button
                onClick={() => setShoreTab('task_center')}
                className={`px-2 py-1 2xl:px-2.5 2xl:py-1.5 rounded text-xs transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap shrink-0 ${
                  shoreTab === 'task_center'
                    ? 'text-white bg-[#12233b] font-semibold border border-[rgba(14,165,233,0.4)] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#070d17]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                <span className="whitespace-nowrap">任务中心</span>
              </button>
              <button
                onClick={() => setShoreTab('devices')}
                className={`px-2 py-1 2xl:px-2.5 2xl:py-1.5 rounded text-xs transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap shrink-0 ${
                  shoreTab === 'devices'
                    ? 'text-white bg-[#12233b] font-semibold border border-[rgba(14,165,233,0.4)] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#070d17]'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                <span className="whitespace-nowrap">设备与自检</span>
              </button>
              <button
                onClick={() => setShoreTab('handover')}
                className={`px-2 py-1 2xl:px-2.5 2xl:py-1.5 rounded text-xs transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap shrink-0 ${
                  shoreTab === 'handover'
                    ? 'text-white bg-[#12233b] font-semibold border border-[rgba(14,165,233,0.4)] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#070d17]'
                }`}
              >
                <History className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                <span className="whitespace-nowrap">记录与移交</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setAnalysisTab('workbench')}
                className={`px-2 py-1 2xl:px-2.5 2xl:py-1.5 rounded text-xs transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap shrink-0 ${
                  analysisTab === 'workbench'
                    ? 'text-white bg-[#0f2820] font-semibold border border-[rgba(16,185,129,0.4)] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#070d17]'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                <span className="whitespace-nowrap">检测与复核</span>
              </button>
              <button
                onClick={() => setAnalysisTab('images')}
                className={`px-2 py-1 2xl:px-2.5 2xl:py-1.5 rounded text-xs transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap shrink-0 ${
                  analysisTab === 'images'
                    ? 'text-white bg-[#0f2820] font-semibold border border-[rgba(16,185,129,0.4)] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#070d17]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                <span className="whitespace-nowrap">任务影像库</span>
              </button>
              <button
                onClick={() => setAnalysisTab('overview')}
                className={`px-2 py-1 2xl:px-2.5 2xl:py-1.5 rounded text-xs transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap shrink-0 ${
                  analysisTab === 'overview'
                    ? 'text-white bg-[#0f2820] font-semibold border border-[rgba(16,185,129,0.4)] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#070d17]'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                <span className="whitespace-nowrap">调查总览</span>
              </button>
              <button
                onClick={() => setAnalysisTab('statistics')}
                className={`px-2 py-1 2xl:px-2.5 2xl:py-1.5 rounded text-xs transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap shrink-0 ${
                  analysisTab === 'statistics'
                    ? 'text-white bg-[#0f2820] font-semibold border border-[rgba(16,185,129,0.4)] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#070d17]'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                <span className="whitespace-nowrap">调查统计</span>
              </button>
              <button
                id="tour-report-export"
                onClick={() => setAnalysisTab('report')}
                className={`px-2 py-1 2xl:px-2.5 2xl:py-1.5 rounded text-xs transition-all flex items-center gap-1 2xl:gap-1.5 whitespace-nowrap shrink-0 ${
                  analysisTab === 'report'
                    ? 'text-white bg-[#0f2820] font-semibold border border-[rgba(16,185,129,0.4)] shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#070d17]'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#34d399] shrink-0" />
                <span className="whitespace-nowrap">成果报告</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Center: Optional Extended Avionics Profile (Visible only on ultra-wide screens >= 1800px) */}
      <div className="hidden min-[1800px]:flex items-center gap-2 px-3 py-1.5 bg-[#070d17] border border-[rgba(148,163,184,0.18)] rounded-md text-[11px] font-mono text-[#cbd5e1] shadow-inner whitespace-nowrap shrink-0">
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="text-[#64748b]">UDP:</span>
          <span className="text-[#94a3b8] whitespace-nowrap">192.168.2.2:14550</span>
        </div>
        <span className="text-[#334155]">/</span>
        <div className="flex items-center gap-1 text-[#38bdf8] whitespace-nowrap shrink-0">
          <span className="text-[#64748b]">RTSP:</span>
          <span className="font-medium whitespace-nowrap">1080P@30fps</span>
        </div>
        <span className="text-[#334155]">/</span>
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          <span className="text-[#64748b]">FC:</span>
          <span className="text-[#cbd5e1] whitespace-nowrap">DEPTH_HOLD</span>
        </div>
      </div>

      {/* Right: Operational Telemetry & Safety Actions */}
      <div className="flex items-center gap-1.5 2xl:gap-2 shrink-0 whitespace-nowrap">
        {/* Mission Run Timer */}
        <div className="hidden min-[1680px]:flex items-center gap-1.5 bg-[#070d17] px-2 py-1 rounded-md border border-[rgba(148,163,184,0.18)] text-xs shadow-inner whitespace-nowrap shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shrink-0" />
          <span className="text-[10px] text-[#94a3b8]">运行</span>
          <span className="text-xs text-[#f8fafc] font-mono font-bold">{formatTimer(seconds)}</span>
        </div>

        {/* Telemetry Strip with ROV Status Capsule */}
        <div id="tour-telemetry-safety" className="flex items-center gap-1.5 2xl:gap-2 bg-[#070d17] px-2 2xl:px-2.5 py-1 rounded-md border border-[rgba(148,163,184,0.18)] text-xs shadow-inner whitespace-nowrap shrink-0">
          <Tooltip title="在线设备: ROV-S6 六推进器深海观测级潜航器 (UDP 192.168.2.2:14550 / DEPTH_HOLD ARMED)">
            <div className="flex items-center gap-1.5 font-mono whitespace-nowrap shrink-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
              </span>
              <span className="font-bold text-white whitespace-nowrap tracking-wide">ROV-S6</span>
              <span className="px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.18)] text-[#10b981] border border-[rgba(16,185,129,0.4)] text-[9px] font-bold whitespace-nowrap">
                ARMED
              </span>
            </div>
          </Tooltip>

          <span className="text-[#334155]">|</span>

          <Tooltip title="系留光缆延迟 (Tether Latency)">
            <div className="flex items-center gap-1 text-[#94a3b8] whitespace-nowrap shrink-0">
              <Wifi className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
              <span className="font-mono text-[#f8fafc] font-medium whitespace-nowrap">{telemetry.tetherLatency}ms</span>
            </div>
          </Tooltip>

          <span className="text-[#334155]">|</span>

          <Tooltip title="水下深度 (Depth)">
            <div className="flex items-center gap-1 whitespace-nowrap shrink-0">
              <span className="text-[11px] text-[#64748b] whitespace-nowrap">深:</span>
              <span className="font-mono text-[#f8fafc] font-bold whitespace-nowrap">
                {telemetry.depth.toFixed(1)}m
              </span>
            </div>
          </Tooltip>

          <span className="hidden min-[1440px]:inline text-[#334155]">|</span>

          <Tooltip title="罗盘航向 (Heading)">
            <div className="hidden min-[1440px]:flex items-center gap-1 text-[#94a3b8] whitespace-nowrap shrink-0">
              <Compass className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span className="font-mono text-[#f8fafc] font-bold whitespace-nowrap">{Math.round(telemetry.heading)}°</span>
            </div>
          </Tooltip>

          <span className="hidden min-[1680px]:inline text-[#334155]">|</span>

          <Tooltip title={`水密舱水浸状态：正常安全无渗漏`}>
            <div className="hidden min-[1680px]:flex items-center gap-1 text-[#10b981] whitespace-nowrap shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono text-[11px] font-bold whitespace-nowrap">SAFE</span>
            </div>
          </Tooltip>

          <span className="text-[#334155]">|</span>

          <Tooltip title={`动力电池组电压: ${telemetry.batteryVoltage.toFixed(1)}V (4S)`}>
            <div className="flex items-center gap-1 text-[#94a3b8] whitespace-nowrap shrink-0">
              <BatteryCharging
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: getBatteryColor(telemetry.battery) }}
              />
              <span
                className="font-mono font-bold whitespace-nowrap"
                style={{ color: getBatteryColor(telemetry.battery) }}
              >
                {telemetry.battery}%
              </span>
            </div>
          </Tooltip>
        </div>

        {/* Emergency Stop Button */}
        {platformMode === 'shore' && (
          <Tooltip title="紧急切断：立即切断 6 通道推进器动力并释放定深锁定">
            <button
              onClick={emergencyStop}
              className="px-2.5 py-1.5 bg-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.28)] text-[#ef4444] border border-[rgba(239,68,68,0.4)] rounded text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm whitespace-nowrap shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap font-bold">急停</span>
            </button>
          </Tooltip>
        )}

        {/* New User Tour / Operations Guide Dropdown */}
        <Dropdown menu={{ items: tourMenuItems }} placement="bottomRight" trigger={['click']}>
          <button
            id="tour-guide-btn"
            className="px-2.5 py-1.5 rounded bg-gradient-to-r from-[#0c243c] to-[#122b48] hover:from-[#122b48] hover:to-[#1a3d66] text-[#38bdf8] hover:text-white border border-[rgba(14,165,233,0.45)] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(14,165,233,0.15)] active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Compass className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
            <span className="whitespace-nowrap font-medium">操作向导</span>
          </button>
        </Dropdown>

        {/* Discreet Settings Dropdown (Includes dataset load & reset options) */}
        <Dropdown menu={{ items: settingsMenuItems }} placement="bottomRight" trigger={['click']}>
          <button className="w-8 h-8 rounded bg-[#070d17] border border-[rgba(148,163,184,0.18)] flex items-center justify-center text-[#64748b] hover:text-[#f8fafc] hover:border-[rgba(148,163,184,0.35)] transition-all shrink-0">
            <Settings className="w-3.5 h-3.5 shrink-0" />
          </button>
        </Dropdown>
      </div>
    </header>
  );
};
