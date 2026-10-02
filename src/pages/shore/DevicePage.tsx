import React from 'react';
import { useMissionStore } from '../../stores/missionStore';
import {
  Radio,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Wifi,
  Video,
  Terminal,
  Activity,
  Cpu,
  Layers,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { Button, Progress, Tag, Card, Input } from 'antd';

export const DevicePage: React.FC = () => {
  const {
    telemetry,
    thrusters,
    selfCheckItems,
    selfCheckRunning,
    selfCheckProgress,
    runSelfCheck,
    commands,
    mission,
  } = useMissionStore();

  const [hoveredCheckId, setHoveredCheckId] = React.useState<string | null>(null);
  const [hoveredProfileIdx, setHoveredProfileIdx] = React.useState<number | null>(null);

  // Group self-check items into pairs of two for smooth row-wise flex-grow and adjacent yielding
  const itemPairs = React.useMemo(() => {
    const pairs: (typeof selfCheckItems)[] = [];
    for (let i = 0; i < selfCheckItems.length; i += 2) {
      pairs.push(selfCheckItems.slice(i, i + 2));
    }
    return pairs;
  }, [selfCheckItems]);

  const extraSpecsMap: Record<string, { badge: string; highlight: string }> = {
    'chk-1': {
      badge: '全双工以太网链路',
      highlight: 'CRC校验 0 错误 · 链路信噪比 > 42dB · 丢包率 0.00%',
    },
    'chk-2': {
      badge: '星光级低照度成像',
      highlight: 'SONY IMX 传感器 · 视场角 82° · 自动对焦响应 0.12s',
    },
    'chk-3': {
      badge: '高精惯导姿态解算',
      highlight: '9轴姿态解算 100Hz · 静态水深标定 ±0.02m · 零偏已消除',
    },
    'chk-4': {
      badge: '六自由度动力闭环',
      highlight: 'T1~T6 推进器相电流均衡 (< 1.6A) · ESC 反电势稳定',
    },
    'chk-5': {
      badge: '高显色大功率调光',
      highlight: '双路 3000lm 矩阵 (总计 6000lm) · PWM 调光无频闪 · 色温 5500K',
    },
    'chk-6': {
      badge: '舱体保压与绝缘侦测',
      highlight: '舱内负压 0.85atm · 双金触点绝缘阻抗 > 20MΩ (干态绝对安全)',
    },
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-[#070d17] select-none text-xs">
      <div className="max-w-[1720px] mx-auto space-y-4">
        {/* Header Summary */}
        <div className="cockpit-panel p-4 flex items-center justify-between hud-corner">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#00e5ff]" />
              ROV-S6 设备拓扑、通信通道与综合自检中心
            </h1>
            <p className="text-[#94a3b8] text-xs mt-1">
              设备状态：全系统标定完成 · 6 通道推进器在线 · 光纤以太网双向握手稳定 (RTT {telemetry.tetherLatency}ms)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="primary"
              loading={selfCheckRunning}
              onClick={runSelfCheck}
              className="bg-gradient-to-r from-[#0284c7] to-[#00e5ff] text-[#071325] border-none font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {selfCheckRunning ? '正在执行综合自检...' : '重新执行全系统自检'}
            </Button>
          </div>
        </div>

        {/* Self-check Execution Box */}
        <div className="cockpit-panel p-4 hud-corner">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(0,229,255,0.15)]">
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                ROV 岸端六项前置综合自检状态
              </span>
              <span className="text-[#38bdf8] text-[11px] font-mono flex items-center gap-1.5 bg-[#04142b] px-2.5 py-0.5 rounded border border-[rgba(0,229,255,0.2)]">
                <Activity className="w-3 h-3 text-[#00e5ff] animate-pulse" />
                鼠标悬停卡片平滑缩放聚焦 · 相邻框同步让位
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#94a3b8] font-mono">
                自检进度: <strong className="text-[#00e5ff]">{selfCheckProgress}%</strong>
              </span>
              <Progress
                percent={selfCheckProgress}
                strokeColor="#00e5ff"
                showInfo={false}
                className="w-32 my-0"
              />
            </div>
          </div>

          {/* Self-check items rows with smooth hover magnification & adjacent yielding */}
          <div className="space-y-3">
            {itemPairs.map((pair, rowIdx) => (
              <div key={rowIdx} className="flex gap-3 items-stretch">
                {pair.map((item, idx) => {
                  const globalIdx = rowIdx * 2 + idx;
                  const isHovered = hoveredCheckId === item.id;
                  const isSiblingHovered = Boolean(
                    hoveredCheckId &&
                    hoveredCheckId !== item.id &&
                    pair.some((p) => p.id === hoveredCheckId)
                  );
                  const extra = extraSpecsMap[item.id];

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredCheckId(item.id)}
                      onMouseLeave={() => setHoveredCheckId(null)}
                      className={`rounded-lg border p-3.5 transition-all duration-300 ease-out cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isHovered
                          ? 'flex-[1.28] scale-[1.015] z-20 bg-gradient-to-r from-[#0c2a50] to-[#091f3b] border-[#00e5ff] shadow-[0_12px_28px_rgba(0,229,255,0.28)] ring-1 ring-[#00e5ff]'
                          : isSiblingHovered
                          ? 'flex-[0.72] scale-[0.99] opacity-75 bg-[#051326] border-[rgba(148,163,184,0.15)]'
                          : item.status === 'checking'
                          ? 'flex-1 bg-[#0e2a4d] border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                          : item.status === 'passed'
                          ? 'flex-1 bg-[#07172e] border-[rgba(16,185,129,0.3)] hover:border-[#00e5ff]'
                          : 'flex-1 bg-[#07172e] border-[rgba(239,68,68,0.3)]'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-300 ${
                              isHovered
                                ? 'bg-[#00e5ff] text-[#071325] scale-110 shadow-[0_0_8px_#00e5ff]'
                                : 'bg-[rgba(0,229,255,0.15)] text-[#00e5ff]'
                            }`}
                          >
                            {globalIdx + 1}
                          </span>
                          <span
                            className={`transition-all duration-300 ${
                              isHovered ? 'text-sm text-white font-bold tracking-wide' : 'text-xs text-white'
                            }`}
                          >
                            {item.name}
                          </span>
                        </span>

                        {item.status === 'checking' ? (
                          <Tag color="processing" className="text-[10px]">
                            检测中...
                          </Tag>
                        ) : item.status === 'passed' ? (
                          <Tag
                            color="success"
                            className={`transition-all duration-300 flex items-center gap-1 ${
                              isHovered ? 'text-xs font-semibold px-2 py-0.5' : 'text-[10px]'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#10b981]" />
                            正常通过
                          </Tag>
                        ) : (
                          <Tag color="error" className="text-[10px]">
                            异常
                          </Tag>
                        )}
                      </div>

                      {/* Description with enhanced contrast */}
                      <div
                        className={`mt-1 pl-7 transition-all duration-300 ${
                          isHovered
                            ? 'text-xs text-[#e2e8f0] font-medium leading-relaxed'
                            : 'text-[11px] text-[#94a3b8] leading-tight'
                        }`}
                      >
                        {item.description}
                      </div>

                      {/* Main Detail Metric Box */}
                      <div
                        className={`mt-2 pl-7 font-mono rounded transition-all duration-300 ${
                          isHovered
                            ? 'text-xs text-[#38bdf8] font-bold bg-[#030d1a] p-2 border border-[rgba(0,229,255,0.4)] shadow-inner'
                            : 'text-[10px] text-[#00e5ff] bg-[#040e1b] p-1.5 border border-[rgba(0,229,255,0.1)]'
                        }`}
                      >
                        {item.detail}
                      </div>

                      {/* Expanded Dynamic Diagnostic Pill (Appears smoothly when hovered) */}
                      {extra && (
                        <div
                          className={`pl-7 overflow-hidden transition-all duration-300 flex items-center justify-between text-[11px] font-mono ${
                            isHovered
                              ? 'max-h-10 opacity-100 mt-2 pt-1.5 border-t border-[rgba(0,229,255,0.25)]'
                              : 'max-h-0 opacity-0 mt-0 pt-0'
                          }`}
                        >
                          <span className="text-[#10b981] font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                            {extra.badge}
                          </span>
                          <span className="text-[#cbd5e1]">{extra.highlight}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 2-Columns: Connection Channels & Command Receipt Timeline */}
        <div className="grid grid-cols-12 gap-4">
          {/* Connection Channels & Telemetry Endpoints (Col 6) */}
          <div className="col-span-6 cockpit-panel p-4 space-y-3 hud-corner">
            <div className="text-white font-semibold text-xs pb-2 border-b border-[rgba(0,229,255,0.15)] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#00e5ff]" />
                通信通道与网络接口配置档案 (Interface Profiles)
              </span>
              <span className="text-[#10b981] font-mono text-[10px]">双向连通</span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              {[
                {
                  title: '主遥测与心跳通道 (UDP Telemetry)',
                  endpoint: '端点: 192.168.2.1:14550 (MavLink v2.0)',
                  value: '18.2 ms',
                  sub: '心跳 10Hz',
                  valColor: 'text-[#10b981]',
                },
                {
                  title: '高清视频流 (RTSP Video Stream)',
                  endpoint: '端点: rtsp://192.168.2.1:8554/live/cam0',
                  value: '1080P@30',
                  sub: 'H.265 / 4.2Mbps',
                  valColor: 'text-[#00e5ff]',
                },
                {
                  title: '运动与补光控制通道 (TCP Command)',
                  endpoint: '端点: 192.168.2.1:9090 (WebSocket / JSON-RPC)',
                  value: '已就绪',
                  sub: '回执延迟 < 20ms',
                  valColor: 'text-[#10b981]',
                },
                {
                  title: '底层物理引擎适配器 (Adapter Layer)',
                  endpoint: '驱动: MockPhysicsEngineAdapter + URPCInferenceAdapter',
                  value: '仿真与硬件抽象 (HAL)',
                  isTag: true,
                },
              ].map((p, idx) => {
                const isHovered = hoveredProfileIdx === idx;
                const isOtherHovered = hoveredProfileIdx !== null && hoveredProfileIdx !== idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredProfileIdx(idx)}
                    onMouseLeave={() => setHoveredProfileIdx(null)}
                    className={`p-2.5 rounded border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      isHovered
                        ? 'scale-[1.02] bg-gradient-to-r from-[#0c2a50] to-[#071d36] border-[#00e5ff] shadow-[0_6px_18px_rgba(0,229,255,0.22)] z-10'
                        : isOtherHovered
                        ? 'opacity-70 bg-[#040e1b] border-[rgba(0,229,255,0.06)] scale-[0.99]'
                        : 'bg-[#051121] border-[rgba(0,229,255,0.1)] hover:border-[#00e5ff]'
                    }`}
                  >
                    <div>
                      <div
                        className={`font-semibold transition-all duration-200 ${
                          isHovered ? 'text-white text-xs' : 'text-[#f1f5f9]'
                        }`}
                      >
                        {p.title}
                      </div>
                      <div
                        className={`text-[10px] transition-all duration-200 ${
                          isHovered ? 'text-[#38bdf8]' : 'text-[#94a3b8]'
                        }`}
                      >
                        {p.endpoint}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      {p.isTag ? (
                        <Tag color="cyan" className={isHovered ? 'scale-105 shadow-sm' : ''}>
                          {p.value}
                        </Tag>
                      ) : (
                        <>
                          <div className={`font-bold ${p.valColor} ${isHovered ? 'text-xs' : ''}`}>
                            {p.value}
                          </div>
                          <div className="text-[#64748b] text-[10px]">{p.sub}</div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thruster Decomposition & Command Details (Col 6) */}
          <div className="col-span-6 cockpit-panel p-4 space-y-3 hud-corner">
            <div className="text-white font-semibold text-xs pb-2 border-b border-[rgba(0,229,255,0.15)] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#00e5ff]" />
                推进器动力回路与最近控制指令回执
              </span>
              <span className="text-[#94a3b8] font-mono text-[10px]">
                总计 {commands.length} 条指令
              </span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 font-mono text-[10px]">
              {commands.slice(0, 5).map((cmd) => (
                <div
                  key={cmd.id}
                  className="bg-[#051121] hover:bg-[#092244] hover:border-[#00e5ff] hover:scale-[1.01] p-2 rounded border border-[rgba(0,229,255,0.08)] flex items-center justify-between transition-all duration-200 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#00e5ff] font-bold">{cmd.id}</span>
                      <span className="text-white">{cmd.summary}</span>
                    </div>
                    <div className="text-[#64748b] mt-0.5">
                      下发时间: {cmd.timestamp} · 设备: {cmd.deviceId}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span
                      className={`font-semibold ${
                        cmd.status === 'completed'
                          ? 'text-[#10b981]'
                          : cmd.status === 'executing'
                          ? 'text-[#f59e0b]'
                          : 'text-[#38bdf8]'
                      }`}
                    >
                      {cmd.status === 'completed' ? '执行成功 ✓' : cmd.status}
                    </span>
                    {cmd.receiptTime && (
                      <div className="text-[#64748b] text-[9px]">回执: {cmd.receiptTime}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
