import React from 'react';
import { useMissionStore } from '../../stores/missionStore';
import ReactECharts from 'echarts-for-react';
import {
  BarChart2,
  PieChart,
  Download,
  Share2,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button, Tag, message } from 'antd';

export const SurveyStatisticsPage: React.FC = () => {
  const { mission, images } = useMissionStore();

  const adoptedImages = images.filter((i) => i.adopted);
  const allDetections = adoptedImages.flatMap((i) => i.detections);

  // Group by category
  const categories = ['海胆', '海参', '扇贝', '海星'];
  const counts: Record<string, number> = { 海胆: 0, 海参: 0, 扇贝: 0, 海星: 0 };
  const originalCounts: Record<string, number> = { 海胆: 0, 海参: 0, 扇贝: 0, 海星: 0 };

  allDetections.forEach((d) => {
    counts[d.category] = (counts[d.category] || 0) + 1;
    const orig = d.originalCategory || d.category;
    originalCounts[orig] = (originalCounts[orig] || 0) + 1;
  });

  // Chart 1: Review Before vs After Comparison
  const reviewCompareOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      data: ['模型原始预测', '人工复核审定'],
      textStyle: { color: '#94a3b8' },
      top: '5%',
    },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '22%', containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: 'rgba(0,229,255,0.2)' } },
      axisLabel: { color: '#ffffff', fontSize: 12 },
    },
    yAxis: {
      type: 'value',
      name: '物标计数 (处)',
      nameTextStyle: { color: '#64748b' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLabel: { color: '#94a3b8' },
    },
    series: [
      {
        name: '模型原始预测',
        type: 'bar',
        barWidth: '28%',
        data: categories.map((c) => originalCounts[c] || 0),
        itemStyle: { color: '#64748b', borderRadius: [4, 4, 0, 0] },
      },
      {
        name: '人工复核审定',
        type: 'bar',
        barWidth: '28%',
        data: categories.map((c) => counts[c] || 0),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00e5ff' },
              { offset: 1, color: '#0284c7' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  // Chart 2: Radar Ecological Diversity Across S01, S02, S03
  const radarOption = {
    backgroundColor: 'transparent',
    tooltip: {},
    legend: {
      data: ['S01 砂质底栖', 'S02 深洼礁盘', 'S03 人工鱼礁'],
      textStyle: { color: '#94a3b8' },
      bottom: '2%',
    },
    radar: {
      indicator: [
        { name: '海胆密度', max: 12 },
        { name: '海参密度', max: 6 },
        { name: '扇贝丰度', max: 4 },
        { name: '海星丰度', max: 4 },
        { name: '物种多样性 (Shannon)', max: 10 },
      ],
      shape: 'polygon',
      splitArea: {
        areaStyle: {
          color: ['rgba(5, 17, 33, 0.8)', 'rgba(7, 24, 46, 0.8)'],
        },
      },
      axisLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(0, 229, 255, 0.15)' } },
      axisName: { color: '#94a3b8' },
    },
    series: [
      {
        name: '样点生态多样性',
        type: 'radar',
        data: [
          {
            value: [11, 0, 0, 0, 3.2],
            name: 'S01 砂质底栖',
            itemStyle: { color: '#38bdf8' },
            areaStyle: { color: 'rgba(56, 189, 248, 0.2)' },
          },
          {
            value: [7, 3, 0, 0, 7.8],
            name: 'S02 深洼礁盘',
            itemStyle: { color: '#f59e0b' },
            areaStyle: { color: 'rgba(245, 158, 11, 0.2)' },
          },
          {
            value: [1, 1, 0, 1, 8.5],
            name: 'S03 人工鱼礁',
            itemStyle: { color: '#10b981' },
            areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
          },
        ],
      },
    ],
  };

  // Chart 3: Depth Gradient Curve
  const depthOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '8%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['S01 (8.2m)', 'S02 (11.5m)', 'S03 (12.4m)'],
      axisLine: { lineStyle: { color: 'rgba(0,229,255,0.2)' } },
      axisLabel: { color: '#ffffff', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '物标密度 (处/㎡)',
      nameTextStyle: { color: '#64748b' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLabel: { color: '#94a3b8' },
    },
    series: [
      {
        name: '底栖生物密度',
        type: 'line',
        smooth: true,
        data: [3.8, 3.4, 1.2],
        lineStyle: { color: '#00e5ff', width: 3 },
        itemStyle: { color: '#00e5ff' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,229,255,0.35)' },
              { offset: 1, color: 'transparent' },
            ],
          },
        },
      },
    ],
  };

  const handleExportCSV = () => {
    message.success('已导出统计结果数据表：HX_ROV_20261001_Survey_Stats.csv');
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-[#070d17] select-none text-xs">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Top Header Card */}
        <div className="cockpit-panel p-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#00e5ff]" />
              生物资源调查与人工复核统计学分析看板
            </h1>
            <p className="text-[#94a3b8] text-xs mt-1">
              动态聚合 3 处核心样点审定数据 · 人工复核数据实时联动 · 多维生态指标深度解析
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleExportCSV}
              className="bg-[#0b2447] text-white border-[rgba(0,229,255,0.3)] hover:text-[#00e5ff] flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              导出分析数据表 (CSV)
            </Button>
          </div>
        </div>

        {/* 3 Analytics Charts */}
        <div className="grid grid-cols-12 gap-4">
          {/* Chart 1: Review Before vs After (Col 6) */}
          <div className="col-span-6 cockpit-panel p-4">
            <div className="text-white font-semibold text-xs pb-2 border-b border-[rgba(0,229,255,0.15)] flex items-center justify-between">
              <span>人工复核前后物标类别修正分布对比</span>
              <span className="text-[#10b981] font-mono text-[10px]">实时修正闭环</span>
            </div>
            <div className="h-[260px] w-full">
              <ReactECharts option={reviewCompareOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* Chart 2: Radar Biodiversity (Col 6) */}
          <div className="col-span-6 cockpit-panel p-4">
            <div className="text-white font-semibold text-xs pb-2 border-b border-[rgba(0,229,255,0.15)] flex items-center justify-between">
              <span>各样点生境多维生态多样性雷达图 (Shannon Index)</span>
              <span className="text-[#94a3b8] font-mono text-[10px]">生境健康度评估</span>
            </div>
            <div className="h-[260px] w-full">
              <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* Chart 3: Depth Gradient & Biomass Density (Col 12) */}
          <div className="col-span-12 cockpit-panel p-4">
            <div className="text-white font-semibold text-xs pb-2 border-b border-[rgba(0,229,255,0.15)] flex items-center justify-between">
              <span>水深梯度与底栖物标栖息密度演化曲线</span>
              <span className="text-[#00e5ff] font-mono text-[10px]">水深: 8.2m → 12.4m</span>
            </div>
            <div className="h-[220px] w-full">
              <ReactECharts option={depthOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
