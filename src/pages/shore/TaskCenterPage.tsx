import React from 'react';
import { useMissionStore } from '../../stores/missionStore';
import {
  Layers,
  MapPin,
  Calendar,
  User,
  Anchor,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Play,
  Cpu,
} from 'lucide-react';
import { Button, Tag, Card } from 'antd';

export const TaskCenterPage: React.FC = () => {
  const { mission, setShoreTab, setActiveSite } = useMissionStore();

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-[#070d17] select-none text-xs">
      <div className="max-w-[1720px] mx-auto space-y-4">
        {/* Top Header Card */}
        <div className="cockpit-panel p-4 flex items-center justify-between hud-corner">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">
                {mission.name}
              </h1>
              <Tag color="cyan" className="font-mono text-xs">
                {mission.id}
              </Tag>
              <Tag color="green" className="text-xs">
                采集中
              </Tag>
            </div>
            <p className="text-[#94a3b8] text-xs mt-1">
              海域位置：{mission.area}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShoreTab('devices')}
              className="bg-[#0b2447] border-[rgba(0,229,255,0.3)] text-[#00e5ff] hover:text-white hover:bg-[#0284c7]"
            >
              设备自检与标定
            </Button>
            <Button
              type="primary"
              onClick={() => setShoreTab('cockpit')}
              className="bg-gradient-to-r from-[#0284c7] to-[#00e5ff] text-[#071325] border-none font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
            >
              <Play className="w-3.5 h-3.5" />
              进入作业驾驶舱
            </Button>
          </div>
        </div>

        {/* 2-Column: Map Schematic & Mission Details */}
        <div className="grid grid-cols-12 gap-4">
          {/* Survey Area Schematic Map (Col 7) */}
          <div className="col-span-7 cockpit-panel p-4 flex flex-col justify-between hud-corner">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(0,229,255,0.15)]">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00e5ff]" />
                  海洋牧场 A 区调查样带与水深等深线示意图
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[rgba(0,229,255,0.12)] text-[#00e5ff] text-[10px] font-mono border border-[rgba(0,229,255,0.25)]">
                  多波束高精度等深矢量图
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[#94a3b8] text-[11px] font-mono">
                <span className="hidden sm:inline">基准面: WGS-84</span>
                <span className="text-[#334155]">/</span>
                <span>比例尺 1:2000</span>
                <span className="text-[#334155]">/</span>
                <span className="text-[#38bdf8]">样带全长 286m</span>
              </div>
            </div>

            {/* Schematic SVG Map */}
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-[#040c1a] border border-[rgba(0,229,255,0.25)] flex items-center justify-center hud-grid shadow-inner">
              <svg viewBox="0 0 880 480" className="w-full h-full select-none">
                <defs>
                  {/* Bathymetric Depth Layer Gradients */}
                  <linearGradient id="depthShallow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#082245" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#061833" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="depthMid" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#061833" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#041226" stopOpacity="0.95" />
                  </linearGradient>
                  <linearGradient id="depthDeep" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#041226" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#020814" stopOpacity="1" />
                  </linearGradient>

                  {/* Reef Trench Crosshatch Pattern */}
                  <pattern id="reefHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(245, 158, 11, 0.28)" strokeWidth="1.2" />
                  </pattern>

                  {/* Steady Tactical Target Glow for S02 */}
                  <radialGradient id="s02TargetGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(245, 158, 11, 0.22)" />
                    <stop offset="70%" stopColor="rgba(245, 158, 11, 0.05)" />
                    <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
                  </radialGradient>

                  {/* Scale Bar Gradient */}
                  <linearGradient id="scaleRamp" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="35%" stopColor="#0284c7" />
                    <stop offset="70%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#030712" />
                  </linearGradient>
                </defs>

                {/* 1. Depth Bathymetric Bands */}
                <path d="M 0 0 L 880 0 L 880 135 Q 640 165 440 135 T 0 145 Z" fill="url(#depthShallow)" />
                <path d="M 0 145 Q 440 135 640 165 T 880 135 L 880 270 Q 640 305 430 260 T 0 275 Z" fill="url(#depthMid)" />
                <path d="M 0 275 Q 430 260 640 305 T 880 270 L 880 480 L 0 480 Z" fill="url(#depthDeep)" />

                {/* 2. Coordinate Grid Lines & Ticks */}
                <g stroke="rgba(0, 229, 255, 0.08)" strokeWidth="0.8" strokeDasharray="3 3">
                  <line x1="200" y1="0" x2="200" y2="480" />
                  <line x1="450" y1="0" x2="450" y2="480" />
                  <line x1="700" y1="0" x2="700" y2="480" />
                  <line x1="0" y1="110" x2="880" y2="110" />
                  <line x1="0" y1="240" x2="880" y2="240" />
                  <line x1="0" y1="370" x2="880" y2="370" />
                </g>

                {/* Coordinate Markers on Outer Frame */}
                <text x="205" y="14" fill="#64748b" fontSize="9" fontFamily="monospace">121°32.40′E</text>
                <text x="455" y="14" fill="#64748b" fontSize="9" fontFamily="monospace">121°32.70′E</text>
                <text x="705" y="14" fill="#64748b" fontSize="9" fontFamily="monospace">121°33.00′E</text>
                <text x="8" y="114" fill="#64748b" fontSize="9" fontFamily="monospace">38°45.25′N</text>
                <text x="8" y="244" fill="#64748b" fontSize="9" fontFamily="monospace">38°45.05′N</text>
                <text x="8" y="374" fill="#64748b" fontSize="9" fontFamily="monospace">38°44.85′N</text>

                {/* 3. Bathymetric Contour Lines */}
                <path d="M 0 65 Q 260 95 480 65 T 880 75" fill="none" stroke="rgba(56, 189, 248, 0.22)" strokeWidth="1" strokeDasharray="4 3" />
                
                {/* -8.0m Contour Line & Pill */}
                <path d="M 0 145 Q 440 135 640 165 T 880 135" fill="none" stroke="rgba(0, 229, 255, 0.45)" strokeWidth="1.5" />
                <rect x="35" y="136" width="76" height="17" rx="3" fill="#061833" stroke="rgba(0,229,255,0.4)" strokeWidth="1" />
                <text x="73" y="148" fill="#38bdf8" fontSize="9" fontFamily="monospace" textAnchor="middle">等深线 -8.0m</text>

                {/* -10.0m Contour Line & Pill */}
                <path d="M 0 215 Q 280 255 520 205 T 880 220" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1" strokeDasharray="5 3" />
                <rect x="35" y="206" width="80" height="17" rx="3" fill="#041226" stroke="rgba(56,189,248,0.3)" strokeWidth="1" />
                <text x="75" y="218" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="middle">等深线 -10.0m</text>

                {/* -11.5m Contour Line & Pill */}
                <path d="M 0 275 Q 430 260 640 305 T 880 270" fill="none" stroke="rgba(0, 229, 255, 0.55)" strokeWidth="1.5" />
                <rect x="35" y="266" width="80" height="17" rx="3" fill="#041226" stroke="rgba(0,229,255,0.45)" strokeWidth="1" />
                <text x="75" y="278" fill="#00e5ff" fontSize="9" fontFamily="monospace" textAnchor="middle">等深线 -11.5m</text>

                {/* -13.0m Contour Line & Pill */}
                <path d="M 0 370 Q 300 415 560 365 T 880 380" fill="none" stroke="rgba(0, 229, 255, 0.35)" strokeWidth="1.2" strokeDasharray="5 3" />
                <rect x="35" y="361" width="80" height="17" rx="3" fill="#020814" stroke="rgba(0,229,255,0.3)" strokeWidth="1" />
                <text x="75" y="373" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">等深线 -13.0m</text>

                {/* 4. Submerged Depression Reef Topography (深洼礁盘隐蔽区) */}
                {/* Steady target glow zone without any outward flying circles */}
                <circle cx="450" cy="275" r="70" fill="url(#s02TargetGlow)" />
                {/* Outer Depression Rim */}
                <ellipse cx="450" cy="275" rx="140" ry="70" fill="rgba(8, 28, 56, 0.45)" stroke="rgba(245, 158, 11, 0.35)" strokeWidth="1.2" strokeDasharray="5 3" />
                {/* Mid Trench Slope */}
                <ellipse cx="450" cy="275" rx="100" ry="48" fill="rgba(4, 16, 34, 0.65)" stroke="rgba(245, 158, 11, 0.55)" strokeWidth="1.5" />
                {/* Core Deep Bed with Hatch */}
                <ellipse cx="450" cy="275" rx="60" ry="28" fill="url(#reefHatch)" stroke="rgba(245, 158, 11, 0.85)" strokeWidth="1.5" />
                {/* Reef Zone Tag Banner */}
                <g>
                  <rect x="360" y="318" width="180" height="20" rx="3" fill="rgba(6, 18, 36, 0.92)" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="1" />
                  <text x="450" y="332" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">
                    ▲ 重点地貌: 深洼礁盘区 (-11.5m)
                  </text>
                </g>

                {/* 5. ROV Cruise Trajectory */}
                {/* Completed Logged Track: Launch -> S01 -> S02 */}
                <path
                  d="M 85 65 L 195 145 L 450 275"
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="2.5"
                  strokeDasharray="8 4"
                  className="animate-pulse"
                />
                {/* Upcoming Planned Track: S02 -> S03 -> Recovery */}
                <path
                  d="M 450 275 L 690 380 L 815 420"
                  fill="none"
                  stroke="rgba(0, 229, 255, 0.45)"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />

                {/* Mother Vessel Launch Point */}
                <g>
                  <circle cx="85" cy="65" r="5" fill="#38bdf8" />
                  <circle cx="85" cy="65" r="9" fill="none" stroke="#38bdf8" strokeWidth="1" />
                  <text x="100" y="69" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">母船入水工位 DP-01 (0.0m)</text>
                </g>

                {/* Recovery Point */}
                <g>
                  <circle cx="815" cy="420" r="5" fill="#64748b" />
                  <circle cx="815" cy="420" r="9" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="735" y="440" fill="#64748b" fontSize="10" fontFamily="sans-serif">预定回收点 RP-01</text>
                </g>

                {/* 6. Waypoint S01 (浅水砂质底栖) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveSite('S01');
                    setShoreTab('cockpit');
                  }}
                >
                  <line x1="195" y1="124" x2="195" y2="137" stroke="#10b981" strokeWidth="1.5" />
                  <circle cx="195" cy="145" r="14" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="2" />
                  <circle cx="195" cy="145" r="5" fill="#10b981" />
                  {/* Floating Tactical Card */}
                  <rect x="120" y="80" width="150" height="44" rx="4" fill="rgba(6, 20, 36, 0.95)" stroke="#10b981" strokeWidth="1.2" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.5))" />
                  <text x="130" y="96" fill="#ffffff" fontSize="11" fontWeight="bold">S01 浅水砂质底栖</text>
                  <rect x="220" y="86" width="42" height="14" rx="2" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="0.8" />
                  <text x="241" y="96" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">已完结</text>
                  <text x="130" y="114" fill="#94a3b8" fontSize="9" fontFamily="monospace">水深 8.2m · 4K光学达标</text>
                </g>

                {/* 7. Waypoint S02 (深洼背光礁盘) - REDESIGNED: NO FLYING EXPANDING CIRCLE! */}
                <g
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveSite('S02');
                    setShoreTab('cockpit');
                  }}
                >
                  {/* Tactical Reticle Bracket Target (Crisp, Steady, Industrial) */}
                  <line x1="450" y1="242" x2="450" y2="260" stroke="#f59e0b" strokeWidth="1.5" />
                  {/* Outer steady dashed surveillance ring */}
                  <circle cx="450" cy="275" r="22" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
                  {/* Inner tactical lock ring */}
                  <circle cx="450" cy="275" r="13" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="2" />
                  {/* Center ROV Position Core */}
                  <circle cx="450" cy="275" r="4.5" fill="#f59e0b" />
                  
                  {/* Tactical Crosshair Marks */}
                  <line x1="422" y1="275" x2="432" y2="275" stroke="#f59e0b" strokeWidth="1.5" />
                  <line x1="468" y1="275" x2="478" y2="275" stroke="#f59e0b" strokeWidth="1.5" />
                  <line x1="450" y1="253" x2="450" y2="263" stroke="#f59e0b" strokeWidth="1.5" />
                  <line x1="450" y1="287" x2="450" y2="297" stroke="#f59e0b" strokeWidth="1.5" />

                  {/* Heading Indicator (Pointing 143° SE) */}
                  <polygon points="458,285 464,293 452,291" fill="#f59e0b" />

                  {/* High-Contrast Floating Tactical Card */}
                  <rect x="370" y="194" width="160" height="48" rx="4" fill="rgba(12, 22, 38, 0.96)" stroke="#f59e0b" strokeWidth="1.8" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.6))" />
                  <text x="380" y="210" fill="#ffffff" fontSize="11" fontWeight="bold">S02 深洼背光礁盘</text>
                  <rect x="475" y="200" width="48" height="14" rx="2" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="1" />
                  <text x="499" y="210" fill="#f59e0b" fontSize="9" fontWeight="bold" textAnchor="middle">需复拍 ⚠</text>
                  <text x="380" y="226" fill="#f59e0b" fontSize="9" fontFamily="monospace">水深 11.5m · 照度 14Lux 偏低</text>
                  <text x="380" y="236" fill="#94a3b8" fontSize="8" fontFamily="monospace">指引: 启动 3000lm 补光重试</text>
                </g>

                {/* 8. Waypoint S03 (人工鱼礁附着) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveSite('S03');
                    setShoreTab('cockpit');
                  }}
                >
                  <line x1="690" y1="358" x2="690" y2="371" stroke="#00e5ff" strokeWidth="1.5" />
                  <circle cx="690" cy="380" r="14" fill="rgba(0, 229, 255, 0.2)" stroke="#00e5ff" strokeWidth="2" />
                  <circle cx="690" cy="380" r="5" fill="#00e5ff" />
                  {/* Floating Tactical Card */}
                  <rect x="615" y="314" width="150" height="44" rx="4" fill="rgba(6, 20, 36, 0.95)" stroke="#00e5ff" strokeWidth="1.2" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.5))" />
                  <text x="625" y="330" fill="#ffffff" fontSize="11" fontWeight="bold">S03 人工鱼礁附着</text>
                  <rect x="715" y="320" width="42" height="14" rx="2" fill="rgba(0, 229, 255, 0.2)" stroke="#00e5ff" strokeWidth="0.8" />
                  <text x="736" y="330" fill="#00e5ff" fontSize="9" fontWeight="bold" textAnchor="middle">待复核</text>
                  <text x="625" y="348" fill="#94a3b8" fontSize="9" fontFamily="monospace">水深 12.4m · 附着生物密度</text>
                </g>

                {/* 9. Top-Right Nautical Compass Rose */}
                <g transform="translate(830, 48)">
                  <circle cx="0" cy="0" r="22" fill="rgba(5, 16, 32, 0.85)" stroke="rgba(0, 229, 255, 0.35)" strokeWidth="1.2" />
                  <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(0, 229, 255, 0.15)" strokeWidth="0.8" strokeDasharray="2 2" />
                  {/* North Needle */}
                  <polygon points="0,-16 4,0 -4,0" fill="#00e5ff" />
                  {/* South Needle */}
                  <polygon points="0,16 4,0 -4,0" fill="#64748b" />
                  <text x="0" y="-18" fill="#00e5ff" fontSize="8" fontWeight="bold" textAnchor="middle">N</text>
                  <text x="0" y="7" fill="#ffffff" fontSize="7" fontFamily="monospace" textAnchor="middle">143°</text>
                </g>

                {/* 10. Bottom-Right Bathymetric Color Ramp Bar */}
                <g transform="translate(710, 442)">
                  <text x="0" y="-6" fill="#94a3b8" fontSize="8" fontFamily="monospace">水深分层色阶 (m)</text>
                  <rect x="0" y="0" width="130" height="8" rx="2" fill="url(#scaleRamp)" stroke="rgba(0,229,255,0.3)" strokeWidth="0.8" />
                  <text x="0" y="18" fill="#64748b" fontSize="8" fontFamily="monospace">-6m</text>
                  <text x="45" y="18" fill="#64748b" fontSize="8" fontFamily="monospace">-9m</text>
                  <text x="85" y="18" fill="#64748b" fontSize="8" fontFamily="monospace">-12m</text>
                  <text x="130" y="18" fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="end">-15m</text>
                </g>
              </svg>

              {/* Bottom-Left Unified Tactical Legend Bar */}
              <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-[rgba(5,13,26,0.92)] px-3 py-1.5 rounded text-[10px] text-[#94a3b8] font-mono border border-[rgba(0,229,255,0.2)] shadow-md">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="text-[#cbd5e1]">已完结样点</span>
                </div>
                <span className="text-[#334155]">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <span className="text-[#f59e0b] font-medium">需复拍样点</span>
                </div>
                <span className="text-[#334155]">|</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00e5ff]" />
                  <span className="text-[#cbd5e1]">待核查样点</span>
                </div>
                <span className="text-[#334155]">|</span>
                <span className="text-[#38bdf8] font-sans">点击样点标记可直接跳转驾驶舱</span>
              </div>
            </div>
          </div>

          {/* Mission Details & Allocation (Col 5) */}
          <div className="col-span-5 space-y-4">
            {/* Device & Hardware Assignment */}
            <div className="cockpit-panel p-4 hud-corner">
              <div className="text-white font-semibold text-xs mb-3 pb-1.5 border-b border-[rgba(0,229,255,0.15)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-[#00e5ff]" />
                  作业装备与传感器有效载荷分配
                </span>
                <span className="text-[#10b981] font-mono text-[10px]">已标定绑定</span>
              </div>

              <div className="space-y-2 text-[#94a3b8] font-mono">
                <div className="flex items-center justify-between bg-[#061224] p-2 rounded border border-[rgba(0,229,255,0.1)]">
                  <span className="text-white">巡检潜航器</span>
                  <span className="text-[#00e5ff] font-bold">{mission.vessel}</span>
                </div>
                <div className="flex items-center justify-between bg-[#061224] p-2 rounded border border-[rgba(0,229,255,0.1)]">
                  <span>光电复合脐带缆</span>
                  <span className="text-white">150m 零浮力 Kevlar 编织缆</span>
                </div>
                <div className="flex items-center justify-between bg-[#061224] p-2 rounded border border-[rgba(0,229,255,0.1)]">
                  <span>主光学载荷</span>
                  <span className="text-white">4K 星光级星芒低照度变焦云台</span>
                </div>
                <div className="flex items-center justify-between bg-[#061224] p-2 rounded border border-[rgba(0,229,255,0.1)]">
                  <span>水下照明载荷</span>
                  <span className="text-white">双路 3000lm 高显色指数矩阵补光</span>
                </div>
                <div className="flex items-center justify-between bg-[#061224] p-2 rounded border border-[rgba(0,229,255,0.1)]">
                  <span>惯导与深度计</span>
                  <span className="text-white">9轴高精 MEMS IMU + 扩散硅压力计</span>
                </div>
              </div>
            </div>

            {/* Operator Notes */}
            <div className="cockpit-panel p-4 hud-corner">
              <div className="text-white font-semibold text-xs mb-2 flex items-center justify-between">
                <span>水下自主巡检标准作业规程 (SOP & Protocols)</span>
                <span className="text-[#10b981] font-mono text-[10px]">规范准则</span>
              </div>
              <ul className="text-[#94a3b8] space-y-1.5 list-disc list-inside">
                <li>进场航行与初始校验：潜器从 S01 浅水带起步，自动执行微环境探头与光学变焦对焦校准。</li>
                <li>动态光照自适应响应：进入 S02 深洼背光礁缝时，依据视觉质量门控指引及时开启大功率补光复拍。</li>
                <li>全流程审计与成果封存：完成全部预定样点巡检后，执行航次数据打包归档并移交 FBDPN 平台。</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Site Cards Row */}
        <div>
          <div className="text-white font-semibold text-sm mb-2 flex items-center justify-between">
            <span>样点规划与采集详情</span>
            <span className="text-[#94a3b8] text-xs">共 3 处核心样点</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {mission.sampleSites.map((s) => (
              <div
                key={s.id}
                className="cockpit-panel p-3.5 flex flex-col justify-between hover:border-[#00e5ff] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">{s.name}</span>
                    <Tag color={s.status === 'completed' ? 'green' : s.qualityStatus === 'underexposed' ? 'gold' : 'blue'}>
                      {s.qualityStatus === 'underexposed' ? '需复拍' : s.status === 'completed' ? '已完成' : '采集中'}
                    </Tag>
                  </div>
                  <div className="text-[#94a3b8] space-y-1 font-mono text-[11px]">
                    <div>坐标：{s.coordinate}</div>
                    <div>计划水深：{s.targetDepth} 米</div>
                    <div>目标物种：{s.plannedSpecies.join('、')}</div>
                  </div>
                  <p className="mt-2 text-[#94a3b8] bg-[#051121] p-2 rounded border border-[rgba(0,229,255,0.08)]">
                    {s.note}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.1)] flex items-center justify-between">
                  <span className="text-[#64748b] font-mono text-[10px]">
                    复拍计数: {s.recaptureCount}/{s.recaptureMax}
                  </span>
                  <Button
                    size="small"
                    onClick={() => {
                      setActiveSite(s.id);
                      setShoreTab('cockpit');
                    }}
                    className="bg-[#0b2447] text-[#00e5ff] border-[rgba(0,229,255,0.3)] text-xs flex items-center gap-1"
                  >
                    在驾驶舱作业
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
