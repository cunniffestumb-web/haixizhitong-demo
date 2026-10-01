import React, { useEffect, useState } from 'react';
import { useMissionStore } from '../stores/missionStore';
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
    <header className="h-[62px] bg-[#0b1523] border-b border-[rgba(148,163,184,0.14)] px-4 flex items-center justify-between select-none relative z-50 shadow-sm">
      {/* Left: Brand & Dual-Platform Pill Navigation */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#111f33] border border-[rgba(148,163,184,0.2)] flex items-center justify-center text-[#38bdf8]">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-white flex items-center gap-2">
              海析智曈
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#111f33] text-[#94a3b8] border border-[rgba(148,163,184,0.18)] font-mono">
                v2.4-PRO
              </span>
            </div>
            <div className="text-[10px] text-[#64748b] tracking-wider uppercase font-mono">
              ROV-GCS & FBDPN AI Platform
            </div>
          </div>
        </div>

        {/* Dual-Platform Main Switcher */}
        <div className="flex bg-[#070d17] p-1 rounded-md border border-[rgba(148,163,184,0.14)]">
          <button
            onClick={() => handleSwitchPlatform('shore')}
            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all ${
              platformMode === 'shore'
                ? 'bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.3)] shadow-sm'
                : 'text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            ROV 岸端控制地面站
          </button>

          <button
            onClick={() => handleSwitchPlatform('analysis')}
            className={`relative flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all ${
              platformMode === 'analysis'
                ? 'bg-[#0f2820] text-[#34d399] border border-[rgba(16,185,129,0.3)] shadow-sm'
                : 'text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            FBDPN 智能分析平台
            {hasNewAnalysisData && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f59e0b]" />
              </span>
            )}
          </button>
        </div>

        {/* Sub-navigation tabs based on Platform Mode */}
        <div className="flex items-center gap-1 border-l border-[rgba(148,163,184,0.15)] pl-4">
          {platformMode === 'shore' ? (
            <>
              <button
                onClick={() => setShoreTab('cockpit')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                  shoreTab === 'cockpit'
                    ? 'text-white bg-[#12233b] font-medium border border-[rgba(14,165,233,0.3)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3 text-[#38bdf8]" />
                作业驾驶舱
              </button>
              <button
                onClick={() => setShoreTab('task_center')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                  shoreTab === 'task_center'
                    ? 'text-white bg-[#12233b] font-medium border border-[rgba(14,165,233,0.3)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3 text-[#38bdf8]" />
                任务中心
              </button>
              <button
                onClick={() => setShoreTab('devices')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                  shoreTab === 'devices'
                    ? 'text-white bg-[#12233b] font-medium border border-[rgba(14,165,233,0.3)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Radio className="w-3 h-3 text-[#38bdf8]" />
                设备与自检
              </button>
              <button
                onClick={() => setShoreTab('handover')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                  shoreTab === 'handover'
                    ? 'text-white bg-[#12233b] font-medium border border-[rgba(14,165,233,0.3)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <History className="w-3 h-3 text-[#38bdf8]" />
                记录与封存移交
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setAnalysisTab('images')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                  analysisTab === 'images'
                    ? 'text-white bg-[#0f2820] font-medium border border-[rgba(16,185,129,0.3)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3 text-[#34d399]" />
                任务与影像
              </button>
              <button
                onClick={() => setAnalysisTab('workbench')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                  analysisTab === 'workbench'
                    ? 'text-white bg-[#0f2820] font-medium border border-[rgba(16,185,129,0.3)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3 text-[#34d399]" />
                检测与复核工作台
              </button>
              <button
                onClick={() => setAnalysisTab('overview')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                  analysisTab === 'overview'
                    ? 'text-white bg-[#0f2820] font-medium border border-[rgba(16,185,129,0.3)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <BarChart2 className="w-3 h-3 text-[#34d399]" />
                调查总览
              </button>
              <button
                onClick={() => setAnalysisTab('statistics')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                  analysisTab === 'statistics'
                    ? 'text-white bg-[#0f2820] font-medium border border-[rgba(16,185,129,0.3)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <BarChart2 className="w-3 h-3 text-[#34d399]" />
                调查统计
              </button>
              <button
                onClick={() => setAnalysisTab('report')}
                className={`px-2.5 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                  analysisTab === 'report'
                    ? 'text-white bg-[#0f2820] font-medium border border-[rgba(16,185,129,0.3)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3 text-[#34d399]" />
                成果报告
              </button>
            </>
          )}
        </div>
      </div>

      {/* Center: Live ROV Hardware Communication Masthead */}
      <div className="hidden 2xl:flex items-center gap-3 px-3 py-1 bg-[#070d17] border border-[rgba(148,163,184,0.12)] rounded text-[11px] font-mono text-[#94a3b8]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span>ROV-S6</span>
          <span className="text-[#475569]">|</span>
          <span className="text-[#cbd5e1]">192.168.2.2:14550</span>
        </div>
        <span className="text-[#334155]">/</span>
        <div className="flex items-center gap-1 text-[#cbd5e1]">
          <span className="text-[#64748b]">RTSP:</span>
          <span>1080P@30fps</span>
        </div>
        <span className="text-[#334155]">/</span>
        <div className="flex items-center gap-1 text-[#38bdf8]">
          <span className="text-[#64748b]">FC:</span>
          <span>DEPTH_HOLD</span>
          <span className="px-1 py-0.2 rounded bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.3)] text-[10px]">
            ARMED
          </span>
        </div>
      </div>

      {/* Right: Operational Telemetry & Safety Actions */}
      <div className="flex items-center gap-3">
        {/* Mission Run Timer */}
        <div className="hidden lg:flex flex-col items-end">
          <div className="text-[10px] text-[#64748b] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            潜次运行时间
          </div>
          <div className="text-xs text-[#f1f5f9] font-mono font-medium">
            {formatTimer(seconds)}
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="flex items-center gap-2.5 bg-[#070d17] px-3 py-1.5 rounded border border-[rgba(148,163,184,0.14)] text-xs">
          <Tooltip title="系留光缆延迟 (Tether Latency)">
            <div className="flex items-center gap-1 text-[#94a3b8]">
              <Wifi className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="font-mono text-[#f1f5f9]">{telemetry.tetherLatency}ms</span>
            </div>
          </Tooltip>

          <span className="text-[#334155]">|</span>

          <Tooltip title="水下深度 (Depth)">
            <div className="flex items-center gap-1 text-[#94a3b8]">
              <span className="text-[11px] text-[#64748b]">深度:</span>
              <span className="font-mono text-[#f1f5f9] font-medium">
                {telemetry.depth.toFixed(1)}m
              </span>
            </div>
          </Tooltip>

          <span className="text-[#334155]">|</span>

          <Tooltip title="罗盘航向 (Heading)">
            <div className="flex items-center gap-1 text-[#94a3b8]">
              <Compass className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span className="font-mono text-[#f1f5f9]">{Math.round(telemetry.heading)}°</span>
            </div>
          </Tooltip>

          <span className="text-[#334155]">|</span>

          <Tooltip title={`水密舱水浸状态：正常`}>
            <div className="flex items-center gap-1 text-[#10b981]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">SAFE</span>
            </div>
          </Tooltip>

          <span className="text-[#334155]">|</span>

          <Tooltip title={`动力电池组电压: ${telemetry.batteryVoltage.toFixed(1)}V`}>
            <div className="flex items-center gap-1 text-[#94a3b8]">
              <BatteryCharging
                className="w-3.5 h-3.5"
                style={{ color: getBatteryColor(telemetry.battery) }}
              />
              <span
                className="font-mono font-medium"
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
              className="px-2.5 py-1 bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.25)] text-[#ef4444] border border-[rgba(239,68,68,0.35)] rounded text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
            >
              <AlertTriangle className="w-3 h-3" />
              急停
            </button>
          </Tooltip>
        )}

        {/* Quick Demo Dataset / Reset State Pill */}
        {images.length === 0 ? (
          <Tooltip title="一键装填 12 帧海床多生境巡检切片与 FBDPN-SwinT 算法推理成果，方便评委快速全盘审查">
            <button
              onClick={loadFullDemoDataset}
              className="px-2.5 py-1 rounded bg-[#12233b] hover:bg-[#1a365d] text-[#38bdf8] border border-[rgba(14,165,233,0.4)] text-[11px] font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              装填全套示范数据
            </button>
          </Tooltip>
        ) : (
          <Tooltip title="恢复为 ROV 刚下水出航状态 (0 帧)，亲身体验操控定点抓拍与补光复拍">
            <button
              onClick={resetToCleanState}
              className="px-2.5 py-1 rounded bg-[#070d17] hover:bg-[#12233b] text-[#94a3b8] hover:text-[#38bdf8] border border-[rgba(148,163,184,0.2)] text-[11px] font-medium flex items-center gap-1.5 transition-all active:scale-95"
            >
              <RotateCcw className="w-3 h-3" />
              出航初始态 (0 帧)
            </button>
          </Tooltip>
        )}

        {/* Discreet Settings Dropdown */}
        <Dropdown menu={{ items: settingsMenuItems }} placement="bottomRight" trigger={['click']}>
          <button className="w-7 h-7 rounded bg-[#070d17] border border-[rgba(148,163,184,0.14)] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] hover:border-[rgba(148,163,184,0.3)] transition-all">
            <Settings className="w-3.5 h-3.5" />
          </button>
        </Dropdown>
      </div>
    </header>
  );
};
