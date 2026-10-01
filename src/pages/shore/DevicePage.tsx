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

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-[#070d17] select-none text-xs">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header Summary */}
        <div className="cockpit-panel p-4 flex items-center justify-between">
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
        <div className="cockpit-panel p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(0,229,255,0.15)]">
            <span className="text-white font-semibold text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              ROV 岸端六项前置综合自检状态
            </span>
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

          <div className="grid grid-cols-2 gap-3">
            {selfCheckItems.map((item, idx) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border transition-all ${
                  item.status === 'checking'
                    ? 'bg-[#0e2a4d] border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                    : item.status === 'passed'
                    ? 'bg-[#07172e] border-[rgba(16,185,129,0.3)]'
                    : 'bg-[#07172e] border-[rgba(239,68,68,0.3)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[rgba(0,229,255,0.15)] text-[#00e5ff] flex items-center justify-center text-[10px] font-mono font-bold">
                      {idx + 1}
                    </span>
                    {item.name}
                  </span>
                  {item.status === 'checking' ? (
                    <Tag color="processing" className="text-[10px]">
                      检测中...
                    </Tag>
                  ) : item.status === 'passed' ? (
                    <Tag color="success" className="text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      正常通过
                    </Tag>
                  ) : (
                    <Tag color="error" className="text-[10px]">
                      异常
                    </Tag>
                  )}
                </div>

                <div className="text-[#94a3b8] text-[11px] mt-1 pl-7">
                  {item.description}
                </div>

                <div className="mt-2 pl-7 text-[10px] font-mono text-[#00e5ff] bg-[#040e1b] p-1.5 rounded border border-[rgba(0,229,255,0.1)]">
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Columns: Connection Channels & Command Receipt Timeline */}
        <div className="grid grid-cols-12 gap-4">
          {/* Connection Channels & Telemetry Endpoints (Col 6) */}
          <div className="col-span-6 cockpit-panel p-4 space-y-3">
            <div className="text-white font-semibold text-xs pb-2 border-b border-[rgba(0,229,255,0.15)] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#00e5ff]" />
                通信通道与网络接口配置档案 (Interface Profiles)
              </span>
              <span className="text-[#10b981] font-mono text-[10px]">双向连通</span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="bg-[#051121] p-2 rounded border border-[rgba(0,229,255,0.1)] flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">主遥测与心跳通道 (UDP Telemetry)</div>
                  <div className="text-[#94a3b8] text-[10px]">端点: 192.168.2.1:14550 (MavLink v2.0)</div>
                </div>
                <div className="text-right">
                  <div className="text-[#10b981] font-bold">18.2 ms</div>
                  <div className="text-[#64748b] text-[10px]">心跳 10Hz</div>
                </div>
              </div>

              <div className="bg-[#051121] p-2 rounded border border-[rgba(0,229,255,0.1)] flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">高清视频流 (RTSP Video Stream)</div>
                  <div className="text-[#94a3b8] text-[10px]">端点: rtsp://192.168.2.1:8554/live/cam0</div>
                </div>
                <div className="text-right">
                  <div className="text-[#00e5ff] font-bold">1080P@30</div>
                  <div className="text-[#64748b] text-[10px]">H.265 / 4.2Mbps</div>
                </div>
              </div>

              <div className="bg-[#051121] p-2 rounded border border-[rgba(0,229,255,0.1)] flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">运动与补光控制通道 (TCP Command)</div>
                  <div className="text-[#94a3b8] text-[10px]">端点: 192.168.2.1:9090 (WebSocket / JSON-RPC)</div>
                </div>
                <div className="text-right">
                  <div className="text-[#10b981] font-bold">已就绪</div>
                  <div className="text-[#64748b] text-[10px]">回执延迟 &lt; 20ms</div>
                </div>
              </div>

              <div className="bg-[#051121] p-2 rounded border border-[rgba(0,229,255,0.1)] flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">底层物理引擎适配器 (Adapter Layer)</div>
                  <div className="text-[#94a3b8] text-[10px]">驱动: MockPhysicsEngineAdapter + URPCInferenceAdapter</div>
                </div>
                <div className="text-right">
                  <Tag color="cyan">比赛演示适配</Tag>
                </div>
              </div>
            </div>
          </div>

          {/* Thruster Decomposition & Command Details (Col 6) */}
          <div className="col-span-6 cockpit-panel p-4 space-y-3">
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
                  className="bg-[#051121] p-2 rounded border border-[rgba(0,229,255,0.08)] flex items-center justify-between"
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
