import React from 'react';
import { useMissionStore } from '../stores/missionStore';
import { Drawer, Button, Tag, Space, Divider, Alert } from 'antd';
import {
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Camera,
  Layers,
  ArrowRight,
  WifiOff,
  BatteryWarning,
  Flame,
  ShieldCheck,
} from 'lucide-react';

export const DemoController: React.FC = () => {
  const {
    demoDrawerOpen,
    setDemoDrawerOpen,
    resetDemo,
    jumpToStep,
    injectFault,
    mission,
    telemetry,
  } = useMissionStore();

  const steps = [
    {
      step: 1,
      title: '步骤 1：系统自检与任务启动',
      desc: '逐项运行通信、相机、IMU、六推进器、补光灯、水密自检',
      target: '设备与连接',
    },
    {
      step: 2,
      title: '步骤 2：样点 S01 驾驶舱正常采集',
      desc: '正常光照环境，水下 HUD 仪表、姿态推力、海胆多目标检出',
      target: '作业驾驶舱 (S01)',
    },
    {
      step: 3,
      title: '步骤 3：样点 S02 欠曝与智能复拍',
      desc: '触发背光欠曝告警，主动建议 85% 补光重拍，前后 Split 对比',
      target: '视觉质量门控 (S02)',
    },
    {
      step: 4,
      title: '步骤 4：样点 S03 与数据交接',
      desc: '人工鱼礁样点完成，岸端打包 HXTASK 任务包并移交分析端',
      target: '任务记录与交接',
    },
    {
      step: 5,
      title: '步骤 5：FBDPN 接收与人工复核',
      desc: '自动批量推理入库，进入三栏工作台，修正低置信类别与补框',
      target: '检测与复核工作台',
    },
    {
      step: 6,
      title: '步骤 6：成果报告与成果归档',
      desc: '物种多维统计雷达、代表性影像墙、复拍历程、一键打印报告',
      target: '成果报告交付',
    },
  ];

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 text-white">
          <Zap className="w-4 h-4 text-[#00e5ff]" />
          <span>工况仿真与快速导引台 (Scenario Simulation Deck)</span>
        </div>
      }
      placement="right"
      width={420}
      onClose={() => setDemoDrawerOpen(false)}
      open={demoDrawerOpen}
      styles={{
        header: { background: '#071325', borderBottom: '1px solid rgba(0,229,255,0.2)' },
        body: { background: '#050d1a', color: '#e2e8f0', padding: '16px' },
      }}
    >
      <div className="space-y-5 text-xs">
        {/* Global Reset */}
        <div className="p-3 bg-[rgba(14,30,56,0.8)] border border-[rgba(0,229,255,0.2)] rounded-lg flex items-center justify-between">
          <div>
            <div className="font-semibold text-white">重置仿真环境</div>
            <div className="text-[#94a3b8] text-[11px] mt-0.5">
              恢复初始任务状态、清空临时标记与复核缓存
            </div>
          </div>
          <button
            onClick={() => {
              resetDemo();
              setDemoDrawerOpen(false);
            }}
            className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#00e5ff] text-white hover:text-[#071325] rounded font-medium transition-all flex items-center gap-1.5 shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            一键重置
          </button>
        </div>

        {/* 10-step / 6-phase Jump List */}
        <div>
          <div className="text-[#94a3b8] font-semibold uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>标准作业流程快速导航索引</span>
            <span className="text-[10px] text-[#00e5ff] bg-[rgba(0,229,255,0.1)] px-1.5 py-0.5 rounded">
              支持直接跳段
            </span>
          </div>

          <div className="space-y-2">
            {steps.map((s) => (
              <div
                key={s.step}
                onClick={() => {
                  jumpToStep(s.step);
                  setDemoDrawerOpen(false);
                }}
                className="p-2.5 rounded-lg bg-[#0a182e] hover:bg-[#0f2445] border border-[rgba(0,229,255,0.12)] hover:border-[rgba(0,229,255,0.4)] cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between font-medium text-white group-hover:text-[#00e5ff]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[rgba(0,229,255,0.15)] text-[#00e5ff] flex items-center justify-center text-[10px] font-bold">
                      {s.step}
                    </span>
                    {s.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#64748b] group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-[11px] text-[#94a3b8] mt-1 pl-6">
                  {s.desc}
                </div>
                <div className="mt-1.5 pl-6 flex items-center gap-2">
                  <Tag color="cyan" className="text-[10px] leading-tight">
                    {s.target}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider className="border-[rgba(255,255,255,0.1)] my-2" />

        {/* Fault Injection */}
        <div>
          <div className="text-[#94a3b8] font-semibold uppercase tracking-wider mb-2">
            应急告警与异常仿真注入
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => injectFault('latency')}
              className="p-2 bg-[#0a182e] hover:bg-[#1e293b] border border-[rgba(245,158,11,0.3)] text-[#f59e0b] rounded text-left transition-all"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <WifiOff className="w-3.5 h-3.5" />
                通信高时延
              </div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">注入 145ms 延迟抖动</div>
            </button>

            <button
              onClick={() => injectFault('battery')}
              className="p-2 bg-[#0a182e] hover:bg-[#1e293b] border border-[rgba(239,68,68,0.3)] text-[#ef4444] rounded text-left transition-all"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <BatteryWarning className="w-3.5 h-3.5" />
                动力电量告警
              </div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">注入 18% 欠压告警</div>
            </button>

            <button
              onClick={() => injectFault('thruster')}
              className="p-2 bg-[#0a182e] hover:bg-[#1e293b] border border-[rgba(245,158,11,0.3)] text-[#f59e0b] rounded text-left transition-all"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                T4 负载偏高
              </div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">推进器负载 88%</div>
            </button>

            <button
              onClick={() => injectFault('none')}
              className="p-2 bg-[#0a182e] hover:bg-[#1e293b] border border-[rgba(16,185,129,0.3)] text-[#10b981] rounded text-left transition-all"
            >
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                恢复正常遥测
              </div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">消除所有仿真故障</div>
            </button>
          </div>
        </div>

        {/* Current Mission Info */}
        <div className="bg-[#040a14] p-3 rounded border border-[rgba(255,255,255,0.06)] text-[11px] text-[#94a3b8] space-y-1">
          <div><strong className="text-white">任务编号：</strong>{mission.id}</div>
          <div><strong className="text-white">调查区域：</strong>{mission.area}</div>
          <div><strong className="text-white">适配器：</strong>模拟物理动力学引擎 + URPC预置推理引擎</div>
        </div>
      </div>
    </Drawer>
  );
};
