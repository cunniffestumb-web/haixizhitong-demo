import React, { useState } from 'react';
import { useMissionStore } from '../../stores/missionStore';
import { getAssetUrl } from '../../utils/assetUrl';
import {
  Crosshair,
  Maximize2,
  Eye,
  EyeOff,
  Sun,
  Shield,
  Layers,
  Camera,
  Video,
} from 'lucide-react';
import { Tooltip } from 'antd';

export const CockpitVideoOverlay: React.FC = () => {
  const {
    mission,
    images,
    activeImageId,
    telemetry,
    motionState,
    isRecording,
    recordingSeconds,
    captureFlash,
    captureCurrentFrame,
    toggleRecord,
    setActiveImage,
  } = useMissionStore();

  const [showBoxes, setShowBoxes] = useState(false);
  const [showHUD, setShowHUD] = useState(true);

  // Dynamic Camera Inertia Transform on 6-DOF controls
  const getCameraTransform = () => {
    switch (motionState.direction) {
      case 'forward':
        return 'scale(1.045) translateY(-8px)';
      case 'backward':
        return 'scale(0.965) translateY(8px)';
      case 'strafe_left':
        return 'translateX(-18px) rotate(-1.2deg)';
      case 'strafe_right':
        return 'translateX(18px) rotate(1.2deg)';
      case 'yaw_left':
        return 'translateX(-26px) perspective(700px) rotateY(-2.5deg)';
      case 'yaw_right':
        return 'translateX(26px) perspective(700px) rotateY(2.5deg)';
      case 'ascend':
        return 'translateY(16px) perspective(700px) rotateX(2deg)';
      case 'descend':
        return 'translateY(-16px) perspective(700px) rotateX(-2deg)';
      default:
        return 'scale(1) translate(0, 0) rotate(0deg)';
    }
  };

  // If a specific captured image was clicked in the reel, inspect that image;
  // Otherwise, render the LIVE real-time optical video stream for the active site!
  const getLiveCameraFeedUrl = () => {
    if (activeImageId) {
      const found = images.find((i) => i.id === activeImageId);
      if (found) return found.url;
    }
    if (mission.activeSiteId === 'S02') {
      return telemetry.lightLeft >= 60 ? '/samples/urpc/001_000002.jpg' : '/samples/urpc/001_000002_underexposed.jpg';
    }
    if (mission.activeSiteId === 'S03') {
      return '/samples/urpc/002_000003.jpg';
    }
    return '/samples/urpc/000_000001.jpg'; // S01 default live view
  };

  const feedUrl = getLiveCameraFeedUrl();
  const activeImg = images.find((i) => i.id === activeImageId);

  // Optical brightness calculation based on ROV auxiliary lighting
  const avgLight = (telemetry.lightLeft + telemetry.lightRight) / 2;
  const brightnessMultiplier = 0.55 + (avgLight / 100) * 0.9;
  const contrastMultiplier = 0.85 + (avgLight / 100) * 0.35;

  const formatRecTime = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '海胆': return '#38bdf8';
      case '海参': return '#f59e0b';
      case '扇贝': return '#10b981';
      case '海星': return '#fb7185';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050b14] rounded-md overflow-hidden border border-[rgba(148,163,184,0.18)] shadow-lg flex items-center justify-center select-none group">
      {/* Background Image (Underwater Camera Feed) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
        <img
          src={getAssetUrl(feedUrl)}
          alt="ROV Underwater Live Optical Stream"
          className="w-full h-full object-cover camera-spring-motion"
          style={{
            transform: getCameraTransform(),
            filter: `brightness(${brightnessMultiplier.toFixed(2)}) contrast(${contrastMultiplier.toFixed(2)})`,
          }}
        />

        {/* Ambient Subtle Vignette & Subsea Caustic Drift */}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,11,20,0.6)] via-transparent to-[rgba(5,11,20,0.45)] pointer-events-none" />
        <div className="absolute inset-0 subsea-ambient-caustics" />
      </div>

      {/* Shutter Flash Animation when capturing */}
      {captureFlash && <div className="shutter-flash" />}

      {/* Real-time Dynamic Motion Vector HUD Pill */}
      {motionState.direction !== 'idle' && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-[#0b1523]/90 backdrop-blur border border-[rgba(14,165,233,0.55)] px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-mono shadow-[0_0_15px_rgba(14,165,233,0.3)] animate-pulse pointer-events-none z-30">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
          <span className="text-[#38bdf8] font-bold">
            {motionState.direction === 'forward' && '⚡ 水平动力全向推力：前推加速 (Surge +1.2 m/s)'}
            {motionState.direction === 'backward' && '⚡ 水平动力协同倒退：减速后移 (Surge -0.8 m/s)'}
            {motionState.direction === 'strafe_left' && '⚡ 矢量横向动力：左舷平移 (Sway -0.7 m/s)'}
            {motionState.direction === 'strafe_right' && '⚡ 矢量横向动力：右舷平移 (Sway +0.7 m/s)'}
            {motionState.direction === 'yaw_left' && '⚡ 差动转向偏航：左舵调姿 (Yaw Rate -5.0 °/s)'}
            {motionState.direction === 'yaw_right' && '⚡ 差动转向偏航：右舵调姿 (Yaw Rate +5.0 °/s)'}
            {motionState.direction === 'ascend' && '⚡ 垂直双推力矩阵：协同上浮 (Heave -0.3 m/s)'}
            {motionState.direction === 'descend' && '⚡ 垂直双推力矩阵：协同下潜 (Heave +0.3 m/s)'}
          </span>
        </div>
      )}

      {/* Precision CAD Detection Bounding Boxes Overlay (only when activeImg is captured & boxes enabled) */}
      {showBoxes && activeImg && (
        <svg
          viewBox="0 0 1920 1080"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          {activeImg.detections.map((d) => {
            const [x, y, w, h] = d.box;
            const color = getCategoryColor(d.category);
            return (
              <g key={d.id}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                />
                <rect
                  x={x}
                  y={Math.max(0, y - 22)}
                  width={Math.max(82, w * 0.6)}
                  height="20"
                  fill="rgba(11, 21, 35, 0.92)"
                  stroke={color}
                  strokeWidth="1"
                  rx="2"
                />
                <text
                  x={x + 5}
                  y={Math.max(14, y - 8)}
                  fill="#f8fafc"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {d.category}
                </text>
                <text
                  x={x + 40}
                  y={Math.max(14, y - 8)}
                  fill={color}
                  fontSize="11"
                  fontWeight="500"
                  fontFamily="monospace"
                >
                  {(d.confidence * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Industrial HUD Overlays (ISA-101 Clean Layout) */}
      {showHUD && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3.5 font-mono text-xs">
          {/* Top HUD Bar */}
          <div className="flex items-center justify-between">
            {/* OSD Left: Camera & Telemetry Specs */}
            <div className="flex items-center gap-2.5 bg-[#0b1523]/80 backdrop-blur-sm px-3 py-1.5 rounded border border-[rgba(148,163,184,0.18)]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[#f1f5f9] font-medium tracking-wide">
                CAM-01 4K OPTICAL
              </span>
              <span className="text-[#475569]">|</span>
              <span className="text-[#38bdf8]">RTSP 1080P@30FPS</span>
              <span className="text-[#475569]">|</span>
              <span className="text-[#94a3b8]">
                {activeImg ? `快照回看 EXP: ${activeImg.exposure.toFixed(2)}` : '实时光电测控流 (LIVE)'}
              </span>
            </div>

            {/* Top Compass Heading Tape */}
            <div className="flex flex-col items-center bg-[#0b1523]/80 backdrop-blur-sm px-4 py-1 rounded border border-[rgba(148,163,184,0.18)]">
              <div className="text-[9px] text-[#64748b] uppercase tracking-wider">
                COMPASS HEADING
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[#475569] text-[10px]">
                  {((Math.round(telemetry.heading) - 20 + 360) % 360)}°
                </span>
                <span className="text-[#38bdf8] font-semibold text-sm tracking-wide">
                  ▲ {Math.round(telemetry.heading)}°
                </span>
                <span className="text-[#475569] text-[10px]">
                  {((Math.round(telemetry.heading) + 20) % 360)}°
                </span>
              </div>
            </div>

            {/* OSD Right: REC & Lighting Indicator */}
            <div className="flex items-center gap-2.5 bg-[#0b1523]/80 backdrop-blur-sm px-3 py-1.5 rounded border border-[rgba(148,163,184,0.18)]">
              {isRecording ? (
                <div className="flex items-center gap-1.5 text-[#ef4444] font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span>REC {formatRecTime(recordingSeconds)}</span>
                </div>
              ) : (
                <div className="text-[#64748b] text-[11px]">STANDBY</div>
              )}
              <span className="text-[#475569]">|</span>
              <div className="flex items-center gap-1 text-[#f59e0b]">
                <Sun className="w-3.5 h-3.5" />
                <span>{avgLight}%</span>
              </div>
            </div>
          </div>

          {/* Center Crosshair (Fine Non-Obtrusive Reticle) */}
          <div className="self-center flex flex-col items-center justify-center opacity-75">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <Crosshair className="w-10 h-10 text-[#38bdf8] opacity-60" strokeWidth={1.2} />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
              <div className="absolute -left-5 w-4 h-[1px] bg-[#38bdf8]" />
              <div className="absolute -right-5 w-4 h-[1px] bg-[#38bdf8]" />
            </div>
          </div>

          {/* Bottom HUD Bar & Depth Tape */}
          <div className="flex items-end justify-between">
            {/* Left Depth Tape */}
            <div className="flex flex-col bg-[#0b1523]/85 backdrop-blur-sm px-3.5 py-2 rounded border border-[rgba(148,163,184,0.18)]">
              <span className="text-[10px] text-[#64748b] uppercase font-mono">深度 (DEPTH)</span>
              <div className="text-xl font-bold text-[#f1f5f9] tracking-tight font-mono">
                {telemetry.depth.toFixed(2)} <span className="text-xs font-normal text-[#94a3b8]">m</span>
              </div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5 font-mono">
                俯仰: {telemetry.pitch > 0 ? `+${telemetry.pitch.toFixed(1)}` : telemetry.pitch.toFixed(1)}° | 翻滚: {telemetry.roll > 0 ? `+${telemetry.roll.toFixed(1)}` : telemetry.roll.toFixed(1)}°
              </div>
            </div>

            {/* Bottom Center: Active Target & Site Info */}
            <div className="bg-[#0b1523]/90 backdrop-blur-sm px-4 py-1.5 rounded border border-[rgba(148,163,184,0.18)] text-center">
              <div className="font-medium text-xs flex items-center gap-2 justify-center">
                <span className="text-[#38bdf8]">样点：{mission.activeSiteId}</span>
                <span className="text-[#475569]">·</span>
                {activeImg ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[#f1f5f9]">
                      已捕获帧 [{activeImg.id}] · 检出目标: {activeImg.detections.length} 处
                    </span>
                    {activeImg.isRecapture && (
                      <span className="px-1.5 py-0.2 rounded bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.3)] text-[10px]">
                        已补光复拍
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImage('');
                      }}
                      className="pointer-events-auto px-2 py-0.5 rounded bg-[#12233b] hover:bg-[#1e3a5f] text-[#38bdf8] border border-[rgba(14,165,233,0.35)] text-[10px] transition-all ml-1 cursor-pointer"
                    >
                      ● 切回水下实时监控流
                    </button>
                  </div>
                ) : (
                  <span className="text-[#10b981] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                    水下实时光电视频流接入中 (1080P@30FPS LIVE)
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Right: Quick Tool Buttons */}
            <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0b1523]/85 backdrop-blur-sm p-1 rounded border border-[rgba(148,163,184,0.18)]">
              {activeImg && (
                <Tooltip title={showBoxes ? '隐藏目标检测框' : '显示目标检测框'}>
                  <button
                    onClick={() => setShowBoxes(!showBoxes)}
                    className={`p-1.5 rounded transition-all ${
                      showBoxes ? 'text-[#38bdf8] bg-[#12233b]' : 'text-[#64748b] hover:text-[#f1f5f9]'
                    }`}
                  >
                    {showBoxes ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </Tooltip>
              )}

              <Tooltip title="水下定点单帧抓拍 (Capture)">
                <button
                  onClick={captureCurrentFrame}
                  className="px-2 py-1 text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded transition-all active:scale-95 flex items-center gap-1 font-mono text-[11px]"
                >
                  <Camera className="w-3.5 h-3.5" />
                  抓拍
                </button>
              </Tooltip>

              <Tooltip title={isRecording ? '停止录像' : '开始水下录像'}>
                <button
                  onClick={toggleRecord}
                  className={`p-1.5 rounded transition-all ${
                    isRecording ? 'text-[#ef4444] bg-[rgba(239,68,68,0.2)]' : 'text-[#94a3b8] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.12)]'
                  }`}
                >
                  <Video className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
