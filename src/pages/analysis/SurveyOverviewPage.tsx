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
  const { mission, images, setAnalysisTab, setActiveImage } = useMissionStore();

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
      right: '5%',
      top: 'center',
      textStyle: { color: '#94a3b8', fontSize: 11 },
    },
    color: ['#38bdf8', '#f59e0b', '#10b981', '#fb7185', '#94a3b8'],
    series: [
      {
        name: '底栖生物类别分布',
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#0b1523',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
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
      data: mission.sampleSites.map((s) => s.id),
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.18)' } },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '检出物标数 (处)',
      nameTextStyle: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
    },
    series: [
      {
        name: '检出数量',
        type: 'bar',
        barWidth: '35%',
        data: mission.sampleSites.map((s) => {
          const img = adoptedImages.find((i) => i.siteId === s.id);
          return img ? img.detections.length : 0;
        }),
        itemStyle: {
          color: '#0ea5e9',
          borderRadius: [3, 3, 0, 0],
        },
      },
    ],
  };

  return (
    <div className="w-full h-full p-3.5 overflow-y-auto bg-[#070d17] select-none text-xs">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header Hero */}
        <div className="cockpit-panel p-3.5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide">
                海洋底栖生物调查综合评估与算法质检看板
              </h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.3)] font-mono">
                {mission.id}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.3)]">
                普查进行中
              </span>
            </div>
            <p className="text-[#94a3b8] text-xs mt-0.5">
              任务海区：{mission.area} | 搭载设备：{mission.vessel}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAnalysisTab('workbench')}
              className="px-3 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded font-medium flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              进入人工复核工作台
            </button>
            <button
              onClick={() => setAnalysisTab('report')}
              className="px-3 py-1.5 bg-[#12233b] hover:bg-[#1a2f4d] text-[#38bdf8] hover:text-white border border-[rgba(14,165,233,0.3)] rounded font-medium flex items-center gap-1.5 transition-all"
            >
              预览普查成果报告
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Prompt when images.length === 0 */}
        {images.length === 0 && (
          <div className="p-3 bg-[#12233b] border border-[rgba(14,165,233,0.35)] rounded flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#94a3b8]">
              <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
              <span>当前尚未从 ROV 岸端控制地面站移交现场抓拍切片。您可以回到岸端驾驶舱操控潜器定点抓拍，或一键装填示范数据。</span>
            </div>
            <button
              onClick={() => useMissionStore.getState().loadFullDemoDataset()}
              className="px-2.5 py-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded font-medium text-[11px] transition-all shadow-sm active:scale-95 shrink-0"
            >
              一键装填 12 帧示范成果
            </button>
          </div>
        )}

        {/* DATA LINEAGE PIPELINE (算法血缘与数据流动全景图) */}
        <div className="cockpit-panel p-3">
          <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5 pb-1 border-b border-[rgba(148,163,184,0.14)]">
            <GitBranch className="w-3.5 h-3.5 text-[#38bdf8]" />
            算法血缘与数据闭环流水线 (Data Lineage & Review Flow)
          </div>

          <div className="grid grid-cols-4 gap-2 font-mono text-xs">
            <div className="bg-[#070d17] p-2.5 rounded border border-[rgba(148,163,184,0.12)]">
              <div className="text-[10px] text-[#64748b]">阶段 1: 岸端采集</div>
              <div className="text-white font-semibold mt-1">ROV 现场抓拍</div>
              <div className="text-[11px] text-[#38bdf8] mt-1">12 帧 (含 S02 补光复拍)</div>
              <div className="text-[10px] text-[#64748b] mt-1">带深度/航向遥测标签</div>
            </div>

            <div className="bg-[#070d17] p-2.5 rounded border border-[rgba(148,163,184,0.12)]">
              <div className="text-[10px] text-[#64748b]">阶段 2: 深度推理</div>
              <div className="text-white font-semibold mt-1">FBDPN-SwinT 前向</div>
              <div className="text-[11px] text-[#38bdf8] mt-1">初筛检出 24 处物标</div>
              <div className="text-[10px] text-[#64748b] mt-1">mAP@50 达 82.4%</div>
            </div>

            <div className="bg-[#070d17] p-2.5 rounded border border-[rgba(148,163,184,0.12)]">
              <div className="text-[10px] text-[#64748b]">阶段 3: 专家复核</div>
              <div className="text-white font-semibold mt-1">CVAT 级人工校准</div>
              <div className="text-[11px] text-[#10b981] mt-1">复核进度 {reviewProgress}%</div>
              <div className="text-[10px] text-[#64748b] mt-1">纠正误检 2 处，补录 1 处</div>
            </div>

            <div className="bg-[#070d17] p-2.5 rounded border border-[rgba(148,163,184,0.12)]">
              <div className="text-[10px] text-[#64748b]">阶段 4: 成果归档</div>
              <div className="text-white font-semibold mt-1">生态普查报告</div>
              <div className="text-[11px] text-[#f59e0b] mt-1">密度矩阵与图谱汇总</div>
              <div className="text-[10px] text-[#64748b] mt-1">支持一键打印盖章 PDF</div>
            </div>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-4 gap-2.5">
          <div className="cockpit-panel p-3">
            <div className="text-[11px] text-[#64748b]">已纳入普查主样帧</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">
              {adoptedImages.length}{' '}
              <span className="text-xs text-[#94a3b8] font-normal">/ {images.length} 帧</span>
            </div>
            <div className="text-[10px] text-[#10b981] mt-1">100% 具备有效水深元数据</div>
          </div>

          <div className="cockpit-panel p-3">
            <div className="text-[11px] text-[#64748b]">累计检出底栖生物</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">
              {allDetections.length}{' '}
              <span className="text-xs text-[#94a3b8] font-normal">处个体</span>
            </div>
            <div className="text-[10px] text-[#38bdf8] mt-1">海胆占比最高 (54.2%)</div>
          </div>

          <div className="cockpit-panel p-3">
            <div className="text-[11px] text-[#64748b]">专家人工复核进度</div>
            <div className="text-xl font-bold text-white mt-1 font-mono">
              {reviewProgress}%
            </div>
            <Progress
              percent={reviewProgress}
              strokeColor="#10b981"
              size="small"
              className="my-1"
            />
          </div>

          <div className="cockpit-panel p-3">
            <div className="text-[11px] text-[#64748b]">自主补光复拍增益</div>
            <div className="text-xl font-bold text-[#10b981] mt-1 font-mono">
              +400%
            </div>
            <div className="text-[10px] text-[#f59e0b] mt-1">S02 由 2 个提升至 10 个</div>
          </div>
        </div>

        {/* 2 ECharts Visualizations */}
        <div className="grid grid-cols-2 gap-3">
          {/* Species Distribution Chart */}
          <div className="cockpit-panel p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[rgba(148,163,184,0.14)]">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <PieChart className="w-3.5 h-3.5 text-[#38bdf8]" />
                底栖海珍生物物种丰度与分布
              </span>
              <span className="text-[10px] text-[#64748b] font-mono">
                共 {Object.keys(categoryCounts).length} 类
              </span>
            </div>
            <div className="h-[230px]">
              <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* Sample Site Density Chart */}
          <div className="cockpit-panel p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[rgba(148,163,184,0.14)]">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <BarChart2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                各样点空间栖息密度比对
              </span>
              <span className="text-[10px] text-[#64748b] font-mono">S01 ~ S03</span>
            </div>
            <div className="h-[230px]">
              <ReactECharts option={barOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
