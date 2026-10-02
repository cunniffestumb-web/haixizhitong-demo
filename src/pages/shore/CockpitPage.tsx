import React, { useEffect } from 'react';
import { useMissionStore } from '../../stores/missionStore';
import { getAssetUrl } from '../../utils/assetUrl';
import { CockpitVideoOverlay } from '../../components/hud/CockpitVideoOverlay';
import { AttitudeIndicator } from '../../components/hud/AttitudeIndicator';
import { ThrusterVisualizer } from '../../components/hud/ThrusterVisualizer';
import { RecaptureModal } from '../../components/hud/RecaptureModal';
import {
  MapPin,
  Thermometer,
  Waves,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  RotateCcw,
  Terminal,
  Activity,
  Camera,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Tooltip, Tag, Button } from 'antd';

export const CockpitPage: React.FC = () => {
  const {
    mission,
    images,
    activeImageId,
    commands,
    telemetry,
    setActiveSite,
    setActiveImage,
    captureCurrentFrame,
    openRecaptureModal,
    handoverToAnalysis,
    simulateOceanMicroDynamics,
    loadFullDemoDataset,
    resetToCleanState,
  } = useMissionStore();

  // Natural subsea micro-dynamics (wave bobbing, micro-jitter on gyro & depth)
  useEffect(() => {
    const timer = setInterval(() => {
      simulateOceanMicroDynamics();
    }, 2400);
    return () => clearInterval(timer);
  }, [simulateOceanMicroDynamics]);

  const activeSite = mission.sampleSites.find((s) => s.id === mission.activeSiteId);

  return (
    <div className="w-full h-full flex flex-col p-2.5 gap-2 overflow-hidden bg-[#070d17] select-none text-xs">
      {/* Top L0 Industrial Safety Bar */}
      <div id="tour-safety-bar" className="w-full h-[36px] bg-[#0b1523] border border-[rgba(148,163,184,0.18)] rounded-md px-3.5 flex items-center justify-between font-mono text-[11px] shrink-0 text-[#94a3b8] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1.5 text-white">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" />
            <span className="font-bold tracking-wide">L0 工业安全监控防线</span>
          </div>
          <span className="text-[#334155]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748b]">母线供电:</span>
            <span className="text-white font-bold">{telemetry.batteryVoltage.toFixed(2)}V (4S)</span>
          </div>
          <span className="text-[#334155]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748b]">系留光缆绝缘:</span>
            <span className="text-[#10b981] font-semibold">&gt;100 MΩ (SAFE)</span>
          </div>
          <span className="text-[#334155]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748b]">舱体水浸探头:</span>
            <span className="text-[#10b981] font-semibold">无渗漏 (0.00V)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748b]">主控舱温:</span>
            <span className="text-[#cbd5e1] font-semibold">21.4°C</span>
          </div>
          <span className="text-[#334155]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748b]">推进器电调:</span>
            <span className="text-[#10b981] font-semibold">6/6 同步在位</span>
          </div>
          <span className="text-[#334155]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748b]">Pixhawk飞控:</span>
            <span className="text-[#38bdf8] font-bold">MAVLink-ARMED</span>
          </div>

          <span className="text-[#334155]">|</span>

          {/* User Requested: Quick Demo Dataset / Reset State Pill placed on the right of this bar */}
          {images.length === 0 ? (
            <Tooltip title="一键装填 12 帧海床多生境巡检切片与 FBDPN-SwinT 算法推理全套成果，快速查验系统全链路业务闭环">
              <button
                onClick={loadFullDemoDataset}
                className="px-2.5 py-1 rounded bg-gradient-to-r from-[#12233b] to-[#1a365d] hover:from-[#1a365d] hover:to-[#23487c] text-[#38bdf8] hover:text-white border border-[rgba(14,165,233,0.45)] text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(14,165,233,0.2)] active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                <span>装填全套示范数据</span>
              </button>
            </Tooltip>
          ) : (
            <Tooltip title="恢复为 ROV 刚下水出航状态 (0 帧)，亲身体验操控定点抓拍与补光复拍">
              <button
                onClick={resetToCleanState}
                className="px-2.5 py-1 rounded bg-[#070d17] hover:bg-[#12233b] text-[#94a3b8] hover:text-[#38bdf8] border border-[rgba(148,163,184,0.3)] text-[11px] font-medium flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>出航初始态 (0 帧)</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Main Cockpit 3-Column Workspace */}
      <div className="flex-1 w-full flex gap-2.5 overflow-hidden min-h-0">
        {/* LEFT COLUMN: Sample Sites & Environmental Telemetry (310px) */}
        <div className="w-[310px] h-full flex flex-col gap-2 shrink-0">
          {/* Sample Sites Card */}
          <div id="tour-sample-sites" className="cockpit-panel p-2.5 flex flex-col shrink-0 hud-corner">
            <div className="text-xs font-bold text-white flex items-center justify-between mb-2 pb-1.5 border-b border-[rgba(148,163,184,0.18)]">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                巡检样点规划序列
              </span>
              <span className="text-[10px] text-[#64748b] font-mono font-medium">3 处点位序列</span>
            </div>

            <div className="space-y-1.5">
              {mission.sampleSites.map((site) => {
                const isActive = site.id === mission.activeSiteId;
                return (
                  <div
                    key={site.id}
                    onClick={() => setActiveSite(site.id)}
                    className={`p-2.5 rounded-md border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#12233b] border-[rgba(14,165,233,0.5)] shadow-[0_0_12px_rgba(14,165,233,0.12)]'
                        : 'bg-[#070d17] border-[rgba(148,163,184,0.14)] hover:border-[rgba(148,163,184,0.3)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-white flex items-center gap-1.5 truncate">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isActive ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]' : 'bg-[#475569]'
                          }`}
                        />
                        <span className="truncate">{site.id} · {site.name}</span>
                      </div>
                      {site.qualityStatus === 'underexposed' ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.2)] text-[#f59e0b] border border-[rgba(245,158,11,0.4)] font-bold shrink-0">
                          需复拍
                        </span>
                      ) : site.status === 'completed' ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(16,185,129,0.18)] text-[#10b981] border border-[rgba(16,185,129,0.35)] font-bold shrink-0">
                          已完成
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0b1523] text-[#94a3b8] border border-[rgba(148,163,184,0.2)] shrink-0 font-medium">
                          采集中
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-[#94a3b8] mt-1.5 flex items-center justify-between font-mono">
                      <span>标定水深: <strong className="text-white">{site.targetDepth}m</strong></span>
                      <span>复拍计数: <strong className="text-white">{site.recaptureCount}</strong>/2</span>
                    </div>

                    {isActive && site.qualityStatus === 'underexposed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRecaptureModal();
                        }}
                        className="w-full mt-2 py-1.5 bg-gradient-to-r from-[#d97706] to-[#b45309] hover:from-[#b45309] hover:to-[#92400e] text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(217,119,6,0.3)]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        环境欠曝告警 · 执行主动补光复拍
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Environmental Sensors */}
          <div className="cockpit-panel p-2.5 flex flex-col shrink-0 hud-corner">
            <div className="text-xs font-bold text-white flex items-center justify-between mb-2 pb-1.5 border-b border-[rgba(148,163,184,0.18)]">
              <span className="flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-[#38bdf8]" />
                水体微环境传感器
              </span>
              <span className="text-[10px] text-[#10b981] font-mono font-bold bg-[rgba(16,185,129,0.15)] px-1.5 py-0.2 rounded border border-[rgba(16,185,129,0.3)]">
                ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#070d17] p-2 rounded-md border border-[rgba(148,163,184,0.14)] shadow-inner">
                <div className="text-[11px] text-[#94a3b8] flex items-center gap-1 font-sans">
                  <Thermometer className="w-3.5 h-3.5 text-[#38bdf8]" />
                  水温
                </div>
                <div className="text-base font-bold text-white mt-1">
                  {mission.environment.waterTemp.toFixed(1)} <span className="text-xs font-normal text-[#94a3b8]">°C</span>
                </div>
              </div>

              <div className="bg-[#070d17] p-2 rounded-md border border-[rgba(148,163,184,0.14)] shadow-inner">
                <div className="text-[11px] text-[#94a3b8] flex items-center gap-1 font-sans">
                  <Activity className="w-3.5 h-3.5 text-[#f59e0b]" />
                  浑浊度
                </div>
                <div className="text-base font-bold text-[#f59e0b] mt-1">
                  {mission.environment.turbidity.toFixed(1)} <span className="text-xs font-normal text-[#94a3b8]">NTU</span>
                </div>
              </div>

              <div className="bg-[#070d17] p-2 rounded-md border border-[rgba(148,163,184,0.14)] shadow-inner">
                <div className="text-[11px] text-[#94a3b8] font-sans">水流流速</div>
                <div className="text-base font-bold text-white mt-1">
                  {mission.environment.currentSpeed.toFixed(2)} <span className="text-xs font-normal text-[#94a3b8]">m/s</span>
                </div>
              </div>

              <div className="bg-[#070d17] p-2 rounded-md border border-[rgba(148,163,184,0.14)] shadow-inner">
                <div className="text-[11px] text-[#94a3b8] font-sans">水体能见度</div>
                <div className="text-base font-bold text-[#10b981] mt-1">
                  {mission.environment.visibility.toFixed(1)} <span className="text-xs font-normal text-[#94a3b8]">m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Command Stream Log */}
          <div className="cockpit-panel p-2.5 flex-1 flex flex-col min-h-0 hud-corner">
            <div className="text-xs font-bold text-white flex items-center justify-between mb-2 pb-1.5 border-b border-[rgba(148,163,184,0.18)]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#38bdf8]" />
                总线指令控制流水
              </span>
              <span className="text-[10px] text-[#64748b] font-mono font-medium">{commands.length} 条已记录</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
              {commands.map((cmd) => (
                <div
                  key={cmd.id}
                  className="bg-[#070d17] p-2 rounded-md border border-[rgba(148,163,184,0.12)] shadow-sm"
                >
                  <div className="flex items-center justify-between text-[#64748b]">
                    <span className="text-[#38bdf8] font-bold">{cmd.id}</span>
                    <span className="text-[10px]">{cmd.timestamp}</span>
                  </div>
                  <div className="text-[#f8fafc] mt-1 leading-snug font-sans text-xs">{cmd.summary}</div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-[#64748b]">回执响应:</span>
                    <span
                      className={`font-semibold ${
                        cmd.status === 'completed'
                          ? 'text-[#10b981]'
                          : cmd.status === 'executing'
                          ? 'text-[#f59e0b]'
                          : 'text-[#38bdf8]'
                      }`}
                    >
                      {cmd.status === 'completed' ? '执行完成 ✓' : cmd.status === 'executing' ? '总线驱动中...' : '指令已下发'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Live Video & Dynamic Filmstrip (flex-1) */}
        <div className="flex-1 h-full flex flex-col gap-2 min-w-0">
          {/* Main Underwater Video Feed with HUD */}
          <div id="tour-video-hud" className="flex-1 min-h-0 relative">
            <CockpitVideoOverlay />
          </div>

          {/* Dynamic Filmstrip of Captured Keyframes */}
          <div className="cockpit-panel p-2.5 h-[122px] shrink-0 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Camera className="w-3.5 h-3.5 text-[#38bdf8]" />
                  实时抓拍影像卷轴 ({images.length} 帧已捕获)
                </span>
                <span className="text-[10px] text-[#64748b]">
                  点击缩略图调入中央席
                </span>
              </div>

              {/* Action Buttons: Capture & Handover */}
              <div id="tour-capture-actions" className="flex items-center gap-2">
                <button
                  onClick={captureCurrentFrame}
                  className="px-2.5 py-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded font-medium text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  定点抓拍 (Capture)
                </button>

                <button
                  id="tour-handover-btn"
                  onClick={handoverToAnalysis}
                  className="px-2.5 py-1 bg-[#10b981] hover:bg-[#059669] text-white rounded font-medium text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  结束巡检·移交分析平台
                </button>
              </div>
            </div>

            {/* Thumbnail Reel */}
            {images.length === 0 ? (
              <div className="h-[70px] w-full border border-dashed border-[rgba(148,163,184,0.18)] rounded flex items-center justify-between px-3.5 bg-[#070d17]/60 text-xs">
                <div className="flex items-center gap-2.5 text-[#94a3b8]">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
                  <span className="text-[11px]">
                    ROV 水下观测席已就绪 | 巡检卷轴当前为空 (0 帧)。操控推进器巡航至样点，点击右侧【📸 定点抓拍】采集现场切片。
                  </span>
                </div>
                <button
                  onClick={captureCurrentFrame}
                  className="px-3 py-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded font-medium text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Camera className="w-3.5 h-3.5" />
                  抓拍样点首帧 ({activeSite?.id})
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                {images.map((img) => {
                  const isSelected = img.id === activeImageId;
                  return (
                    <div
                      key={img.id}
                      onClick={() => setActiveImage(img.id)}
                      className={`h-[70px] aspect-video rounded border shrink-0 cursor-pointer overflow-hidden relative transition-all ${
                        isSelected
                          ? 'border-[#38bdf8] ring-2 ring-[#0ea5e9]/40 z-10'
                          : 'border-[rgba(148,163,184,0.18)] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={getAssetUrl(img.url)} alt={img.filename} className="w-full h-full object-cover" />
                      <div className="absolute top-0 left-0 bg-[#0b1523]/90 px-1 text-[9px] text-white font-mono">
                        {img.siteId}
                      </div>
                      {img.isRecapture && (
                        <div className="absolute top-0 right-0 bg-[#10b981] px-1 text-[8px] text-black font-bold">
                          复拍
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-[#070d17]/85 text-[8px] text-center text-[#94a3b8] font-mono">
                        检出: {img.detections.length}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Attitude Horizon + Thruster Visualizer (340px) */}
        <div id="tour-attitude-thruster" className="w-[340px] h-full flex flex-col gap-2 shrink-0 overflow-y-auto pr-0.5">
          <AttitudeIndicator />
          <ThrusterVisualizer />
        </div>
      </div>

      {/* Recapture Modal for S02 */}
      <RecaptureModal />
    </div>
  );
};
