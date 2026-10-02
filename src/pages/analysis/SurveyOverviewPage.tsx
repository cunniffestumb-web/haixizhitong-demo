import React from 'react';
import { useMissionStore } from '../../stores/missionStore';
import ReactECharts from 'echarts-for-react';
import {
  BarChart2,
  PieChart,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  GitBranch,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { Button, Tag, Progress } from 'antd';

export const SurveyOverviewPage: React.FC = () => {
  const {
    mission,
    images,
    setAnalysisTab,
    setActiveImage,
    inferenceState,
    inferenceProgress,
    inferenceLogs,
    runModelInference,
    loadFullDemoDataset,
  } = useMissionStore();

  const adoptedImages = images.filter((i) => i.adopted);
  const allDetections = adoptedImages.flatMap((i) => i.detections);

  // Calculate species counts
  const categoryCounts: Record<string, number> = {};
  allDetections.forEach((d) => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });

  const reviewedCount = allDetections.filter((d) => d.reviewStatus !== 'unreviewed').length;
  const reviewProgress = allDetections.length > 0 ? Math.round((reviewedCount / allDetections.length) * 100) : 100;

  // Species Doughnut Chart Options
  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} 处 ({d}%)' },
    legend: {
      orient: 'vertical',
      right: '6%',
      top: 'center',
      textStyle: { color: '#cbd5e1', fontSize: 12 },
    },
    color: ['#38bdf8', '#f59e0b', '#10b981', '#fb7185', '#94a3b8'],
    series: [
      {
        name: '底栖生物类别分布',
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#0b1523',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
          },
        },
        data: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
      },
    ],
  };

  // Site Density Bar Chart Options
  const barOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: mission.sampleSites.map((s) => `${s.id} (${s.targetDepth}m)`),
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.18)' } },
      axisLabel: { color: '#cbd5e1', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: '检出物标数 (处)',
      nameTextStyle: { color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } },
      axisLabel: { color: '#cbd5e1', fontSize: 11 },
    },
    series: [
      {
        name: '检出数量',
        type: 'bar',
        barWidth: '38%',
        data: mission.sampleSites.map((s) => {
          const img = adoptedImages.find((i) => i.siteId === s.id);
          return img ? img.detections.length : 0;
        }),
        itemStyle: {
          color: '#0ea5e9',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-[#070d17] select-none text-xs">
      <div className="w-full max-w-[1780px] mx-auto space-y-3.5">
        {/* Header Hero */}
        <div className="cockpit-panel p-4 flex items-center justify-between hud-corner">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-white tracking-wide">
                海洋底栖生物调查综合评估与算法质检看板
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.35)] font-mono font-semibold">
                {mission.id}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[rgba(16,185,129,0.18)] text-[#10b981] border border-[rgba(16,185,129,0.35)] font-bold">
                普查进行中
              </span>
            </div>
            <p className="text-[#94a3b8] text-xs mt-1">
              任务海区：<span className="text-white font-medium">{mission.area}</span> | 搭载设备：<span className="text-white font-medium">{mission.vessel}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAnalysisTab('workbench')}
              className="px-3.5 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <Eye className="w-4 h-4" />
              进入人工复核工作台
            </button>
            <button
              onClick={() => setAnalysisTab('report')}
              className="px-3.5 py-1.5 bg-[#12233b] hover:bg-[#1a2f4d] text-[#38bdf8] hover:text-white border border-[rgba(14,165,233,0.35)] rounded font-semibold flex items-center gap-1.5 transition-all"
            >
              预览普查成果报告
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Prompt when images.length === 0 */}
        {images.length === 0 && (
          <div className="p-3.5 bg-[#12233b] border border-[rgba(14,165,233,0.35)] rounded-md flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2.5 text-[#cbd5e1]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-ping" />
              <span className="text-xs">
                当前尚未从 ROV 岸端控制地面站移交现场抓拍切片。您可以回到岸端驾驶舱操控潜器定点抓拍，或一键装填示范数据。
              </span>
            </div>
            <button
              onClick={loadFullDemoDataset}
              className="px-3 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded font-semibold text-xs transition-all shadow-sm active:scale-95 shrink-0"
            >
              一键装填 12 帧示范成果
            </button>
          </div>
        )}

        {/* FBDPN-SwinT Real-time Inference Trigger / Progress Banner */}
        {images.length > 0 && allDetections.length === 0 && inferenceState !== 'running' && (
          <div className="cockpit-panel p-4 border border-[rgba(14,165,233,0.4)] bg-gradient-to-r from-[#0b1b2d] to-[#0b1523] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-[#12233b] border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] shadow-[0_0_12px_rgba(14,165,233,0.3)]">
                <Sparkles className="w-5 h-5 text-[#38bdf8] animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  ROV 巡检切片已移交入库，待启动 FBDPN-SwinT 批量深度推理
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.2)] text-[#f59e0b] border border-[#f59e0b]/40 font-mono">
                    TensorRT-Ready
                  </span>
                </div>
                <div className="text-xs text-[#94a3b8] mt-0.5">
                  移交切片共 {images.length} 帧，尚未执行目标检测算法前向推理。点击右侧按钮立即调用机载模型计算并生成目标建议框。
                </div>
              </div>
            </div>
            <button
              onClick={runModelInference}
              className="px-4 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white font-bold rounded-md flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.4)] active:scale-95 transition-all text-xs shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              🚀 启动 FBDPN-SwinT 批量深度推理
            </button>
          </div>
        )}

        {/* Inference Progress Display */}
        {inferenceState === 'running' && (
          <div className="cockpit-panel p-4 border border-[rgba(14,165,233,0.5)] bg-[#0c1f38] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-2 text-[#38bdf8]">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
                FBDPN-SwinT TensorRT 深度神经网络正在批量推理中...
              </span>
              <span className="font-mono text-base text-[#38bdf8]">{inferenceProgress}%</span>
            </div>
            <Progress percent={inferenceProgress} strokeColor="#0ea5e9" showInfo={false} />
            <div className="bg-[#070d17] p-2 rounded border border-[rgba(148,163,184,0.12)] font-mono text-[11px] text-[#94a3b8] max-h-24 overflow-y-auto">
              {inferenceLogs.slice(-3).map((log, i) => (
                <div key={i} className="leading-tight text-[#cbd5e1]">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* DATA LINEAGE PIPELINE (算法血缘与数据流动全景图) */}
        <div className="cockpit-panel p-3.5 hud-corner">
          <div className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5 pb-1.5 border-b border-[rgba(148,163,184,0.18)]">
            <GitBranch className="w-3.5 h-3.5 text-[#38bdf8]" />
            算法血缘与数据闭环流水线 (Data Lineage & Review Flow)
          </div>

          <div className="grid grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-[#070d17] p-3 rounded-md border border-[rgba(148,163,184,0.14)] shadow-inner">
              <div className="text-[10px] text-[#64748b] font-bold">阶段 1: 岸端采集</div>
              <div className="text-white font-bold text-sm mt-1">ROV 现场抓拍</div>
              <div className="text-xs text-[#38bdf8] font-bold mt-1">{images.length} 帧切片</div>
              <div className="text-[11px] text-[#94a3b8] mt-1 font-sans">集成水深/航向/微环境元数据</div>
            </div>

            <div className="bg-[#070d17] p-3 rounded-md border border-[rgba(148,163,184,0.14)] shadow-inner">
              <div className="text-[10px] text-[#64748b] font-bold">阶段 2: 深度推理</div>
              <div className="text-white font-bold text-sm mt-1">FBDPN-SwinT 前向</div>
              <div className="text-xs text-[#38bdf8] font-bold mt-1">检出 {allDetections.length} 处物标</div>
              <div className="text-[11px] text-[#94a3b8] mt-1 font-sans">mAP@50 达到 82.4%</div>
            </div>

            <div className="bg-[#070d17] p-3 rounded-md border border-[rgba(148,163,184,0.14)] shadow-inner">
              <div className="text-[10px] text-[#64748b] font-bold">阶段 3: 专家复核</div>
              <div className="text-white font-bold text-sm mt-1">CVAT 级人工校准</div>
              <div className="text-xs text-[#10b981] font-bold mt-1">复核进度 {reviewProgress}%</div>
              <div className="text-[11px] text-[#94a3b8] mt-1 font-sans">纠正误检 2 处，补录 1 处</div>
            </div>

            <div className="bg-[#070d17] p-3 rounded-md border border-[rgba(148,163,184,0.14)] shadow-inner">
              <div className="text-[10px] text-[#64748b] font-bold">阶段 4: 成果归档</div>
              <div className="text-white font-bold text-sm mt-1">生态普查报告</div>
              <div className="text-xs text-[#f59e0b] font-bold mt-1">密度矩阵与图谱汇总</div>
              <div className="text-[11px] text-[#94a3b8] mt-1 font-sans">一键导出科研普查报告</div>
            </div>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="cockpit-panel p-3.5 hud-corner">
            <div className="text-xs text-[#94a3b8] font-medium">已纳入普查主样帧</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {adoptedImages.length}{' '}
              <span className="text-xs text-[#94a3b8] font-normal">/ {images.length} 帧切片</span>
            </div>
            <div className="text-[11px] text-[#10b981] mt-1.5 font-bold">100% 具备有效深度元数据</div>
          </div>

          <div className="cockpit-panel p-3.5 hud-corner">
            <div className="text-xs text-[#94a3b8] font-medium">累计检出底栖生物</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {allDetections.length}{' '}
              <span className="text-xs text-[#94a3b8] font-normal">处生物个体</span>
            </div>
            <div className="text-[11px] text-[#38bdf8] mt-1.5 font-bold">海胆物种占比最高 (54.2%)</div>
          </div>

          <div className="cockpit-panel p-3.5 hud-corner">
            <div className="text-xs text-[#94a3b8] font-medium">专家人工复核进度</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {reviewProgress}%
            </div>
            <Progress
              percent={reviewProgress}
              strokeColor="#10b981"
              size="small"
              className="my-1.5"
            />
          </div>

          <div className="cockpit-panel p-3.5 hud-corner">
            <div className="text-xs text-[#94a3b8] font-medium">自主补光复拍增益</div>
            <div className="text-2xl font-bold text-[#10b981] mt-1 font-mono">
              +400%
            </div>
            <div className="text-[11px] text-[#f59e0b] mt-1.5 font-bold">S02 由 2 个提升至 10 个有效目标</div>
          </div>
        </div>

        {/* 2 ECharts Visualizations */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Species Distribution Chart */}
          <div className="cockpit-panel p-3.5 flex flex-col justify-between hud-corner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(148,163,184,0.18)]">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <PieChart className="w-4 h-4 text-[#38bdf8]" />
                底栖海珍生物物种丰度与分布
              </span>
              <span className="text-[11px] text-[#94a3b8] font-mono">
                共检出 {Object.keys(categoryCounts).length} 类底栖目标
              </span>
            </div>
            <div className="h-[285px]">
              <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* Sample Site Density Chart */}
          <div className="cockpit-panel p-3.5 flex flex-col justify-between hud-corner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(148,163,184,0.18)]">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                <BarChart2 className="w-4 h-4 text-[#38bdf8]" />
                各样点空间栖息密度比对
              </span>
              <span className="text-[11px] text-[#94a3b8] font-mono">样点 S01 ~ S03</span>
            </div>
            <div className="h-[285px]">
              <ReactECharts option={barOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
