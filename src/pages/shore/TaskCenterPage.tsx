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
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Top Header Card */}
        <div className="cockpit-panel p-4 flex items-center justify-between">
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
          <div className="col-span-7 cockpit-panel p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(0,229,255,0.15)]">
              <span className="text-white font-semibold text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00e5ff]" />
                海洋牧场 A 区调查样带与水深等深线示意图
              </span>
              <span className="text-[#64748b] text-[11px] font-mono">
                比例尺 1:2000 / 本地矢量渲染
              </span>
            </div>

            {/* Schematic SVG Map */}
            <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-[#061528] border border-[rgba(0,229,255,0.2)] flex items-center justify-center hud-grid">
              <svg viewBox="0 0 800 450" className="w-full h-full">
                {/* Bathymetric Contour Lines */}
                <path
                  d="M 50 120 Q 200 180 400 140 T 750 160"
                  fill="none"
                  stroke="rgba(0, 229, 255, 0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text x="60" y="115" fill="#64748b" fontSize="10" fontFamily="monospace">
                  等深线 -8m
                </text>

                <path
                  d="M 40 240 Q 240 310 450 250 T 760 270"
                  fill="none"
                  stroke="rgba(0, 229, 255, 0.25)"
                  strokeWidth="1.5"
                />
                <text x="50" y="235" fill="#64748b" fontSize="10" fontFamily="monospace">
                  等深线 -11m
                </text>

                <path
                  d="M 50 360 Q 260 410 500 370 T 750 380"
                  fill="none"
                  stroke="rgba(0, 229, 255, 0.15)"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text x="60" y="355" fill="#64748b" fontSize="10" fontFamily="monospace">
                  等深线 -13m
                </text>

                {/* Submarine Reef Outlines */}
                <ellipse cx="440" cy="270" rx="90" ry="45" fill="rgba(14, 40, 77, 0.5)" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" />
                <text x="390" y="275" fill="#f59e0b" fontSize="11" fontFamily="sans-serif">
                  深洼礁盘隐蔽区
                </text>

                {/* ROV Cruise Trajectory Line */}
                <path
                  d="M 180 140 L 440 270 L 650 370"
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />

                {/* Site S01 Marker */}
                <g
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveSite('S01');
                    setShoreTab('cockpit');
                  }}
                >
                  <circle cx="180" cy="140" r="16" fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2" />
                  <circle cx="180" cy="140" r="6" fill="#10b981" />
                  <rect x="130" y="90" width="100" height="34" rx="4" fill="rgba(5, 13, 26, 0.85)" stroke="#10b981" strokeWidth="1" />
                  <text x="140" y="105" fill="#ffffff" fontSize="11" fontWeight="bold">S01 砂质底栖</text>
                  <text x="140" y="118" fill="#10b981" fontSize="9" fontFamily="monospace">水深 8.2m · 已完结</text>
                </g>

                {/* Site S02 Marker */}
                <g
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveSite('S02');
                    setShoreTab('cockpit');
                  }}
                >
                  <circle cx="440" cy="270" r="20" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2" className="animate-ping" />
                  <circle cx="440" cy="270" r="7" fill="#f59e0b" />
                  <rect x="390" y="210" width="110" height="36" rx="4" fill="rgba(5, 13, 26, 0.9)" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="400" y="226" fill="#ffffff" fontSize="11" fontWeight="bold">S02 深洼礁盘</text>
                  <text x="400" y="239" fill="#f59e0b" fontSize="9" fontFamily="monospace">水深 11.5m · 需复拍 ⚠</text>
                </g>

                {/* Site S03 Marker */}
                <g
                  className="cursor-pointer group"
                  onClick={() => {
                    setActiveSite('S03');
                    setShoreTab('cockpit');
                  }}
                >
                  <circle cx="650" cy="370" r="16" fill="rgba(0, 229, 255, 0.2)" stroke="#00e5ff" strokeWidth="2" />
                  <circle cx="650" cy="370" r="6" fill="#00e5ff" />
                  <rect x="590" y="315" width="120" height="36" rx="4" fill="rgba(5, 13, 26, 0.85)" stroke="#00e5ff" strokeWidth="1" />
                  <text x="600" y="331" fill="#ffffff" fontSize="11" fontWeight="bold">S03 人工鱼礁附着</text>
                  <text x="600" y="344" fill="#00e5ff" fontSize="9" fontFamily="monospace">水深 12.4m · 待复核</text>
                </g>
              </svg>

              <div className="absolute bottom-2 left-2 bg-[rgba(5,13,26,0.85)] px-2.5 py-1 rounded text-[10px] text-[#94a3b8] font-mono border border-[rgba(0,229,255,0.15)]">
                点击示意图样点标记可直接跳转驾驶舱对应点位
              </div>
            </div>
          </div>

          {/* Mission Details & Allocation (Col 5) */}
          <div className="col-span-5 space-y-4">
            {/* Device & Hardware Assignment */}
            <div className="cockpit-panel p-4">
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
            <div className="cockpit-panel p-4">
              <div className="text-white font-semibold text-xs mb-2">
                数字媒体赛项操作指引与注意要点
              </div>
              <ul className="text-[#94a3b8] space-y-1.5 list-disc list-inside">
                <li>按计划从 S01 浅水带起步，确认光学自动对焦与底质成像质量。</li>
                <li>进入 S02 深洼背光样点时，应依据视觉质量门控指引及时开启补光复拍。</li>
                <li>完成全部 3 处样点采集后，点击任务记录与交接栏目，一键移交智能分析平台。</li>
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
