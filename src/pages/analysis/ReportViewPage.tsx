import React, { useState } from 'react';
import { useMissionStore } from '../../stores/missionStore';
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  MapPin,
  Anchor,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button, Tag, message } from 'antd';

export const ReportViewPage: React.FC = () => {
  const { mission, images, modelConfig } = useMissionStore();

  const [notes, setNotes] = useState(
    '本次黄海北部示范区海洋牧场 A 区调查成果显示：底栖生境群落结构稳定，S01 浅水样点海胆分布密集；S02 深洼礁缝通过自主大功率补光复拍消除欠曝隐患；S03 人工鱼礁生境多样性良好，经人工复核审定，数据完备，达标结题。'
  );

  const adoptedImages = images.filter((i) => i.adopted);
  const allDetections = adoptedImages.flatMap((i) => i.detections);

  const counts: Record<string, number> = { 海胆: 0, 海参: 0, 扇贝: 0, 海星: 0 };
  allDetections.forEach((d) => {
    counts[d.category] = (counts[d.category] || 0) + 1;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      reportId: `REP-${mission.id}`,
      generatedAt: new Date().toISOString(),
      mission,
      summary: notes,
      speciesCounts: counts,
      totalDetections: allDetections.length,
      modelConfig,
      keyframes: adoptedImages.map((img) => ({
        id: img.id,
        siteId: img.siteId,
        url: img.url,
        detections: img.detections,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mission.id}_survey_report.json`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('已导出完整成果报告数据 JSON');
  };

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-[#070d17] select-none text-xs">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Top Floating Action Bar (Hidden when printing) */}
        <div className="no-print cockpit-panel p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00e5ff]" />
            <div>
              <span className="text-white font-bold text-sm">
                成果报告预览与标准化交付
              </span>
              <span className="text-[#94a3b8] text-xs ml-2">
                支持 A4 打印规格排版与另存为 PDF
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleExportJSON}
              className="bg-[#0b2447] text-white border-[rgba(0,229,255,0.3)] hover:text-[#00e5ff] flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              导出报告 JSON
            </Button>
            <Button
              type="primary"
              onClick={handlePrint}
              className="bg-gradient-to-r from-[#0284c7] to-[#00e5ff] text-[#071325] font-bold border-none flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
            >
              <Printer className="w-4 h-4" />
              打印 / 另存为 PDF
            </Button>
          </div>
        </div>

        {/* PRINTABLE REPORT DOCUMENT (White on print, Tech Navy in preview) */}
        <div className="report-page-container bg-[#08172c] text-[#e2e8f0] p-8 rounded-xl border border-[rgba(0,229,255,0.25)] shadow-2xl space-y-6">
          {/* Header */}
          <div className="border-b-2 border-[#00e5ff] pb-4 flex items-start justify-between">
            <div>
              <div className="text-[11px] font-mono tracking-widest text-[#00e5ff] uppercase font-bold">
                SEASIGHT HAIPENG-FBDPN SURVEY REPORT
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wide mt-1">
                海洋牧场 A 区生物资源 ROV 调查与 FBDPN 智能评估报告
              </h1>
              <div className="text-xs text-[#94a3b8] mt-1 flex items-center gap-4 font-mono">
                <span>任务编号: {mission.id}</span>
                <span>调查日期: 2026-10-01</span>
                <span>调查席位: {mission.operator}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 bg-[rgba(16,185,129,0.2)] text-[#10b981] border border-[#10b981] rounded font-mono font-bold text-xs">
                已人工终审合格
              </span>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="report-section space-y-2">
            <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
              一、调查概述与结论摘要 (Executive Summary)
            </h2>
            <div className="bg-[#051121] p-3 rounded-lg border border-[rgba(0,229,255,0.1)] text-xs text-[#cbd5e1] leading-relaxed">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-none text-xs text-[#cbd5e1] resize-none outline-none leading-relaxed"
                title="点击可编辑修改总结说明"
              />
            </div>
          </div>

          {/* Section 2: ROV Vehicle & Dive Telemetry */}
          <div className="report-section space-y-2">
            <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
              二、潜航器作业参数与水文环境 (ROV Dive Parameters)
            </h2>
            <div className="grid grid-cols-4 gap-2 font-mono text-xs">
              <div className="bg-[#051121] p-2.5 rounded border border-[rgba(0,229,255,0.1)]">
                <span className="text-[#64748b] block text-[10px]">巡检潜航器</span>
                <span className="text-white font-bold">{mission.vessel}</span>
              </div>
              <div className="bg-[#051121] p-2.5 rounded border border-[rgba(0,229,255,0.1)]">
                <span className="text-[#64748b] block text-[10px]">水深跨度</span>
                <span className="text-white font-bold">{mission.environment.depthRange}</span>
              </div>
              <div className="bg-[#051121] p-2.5 rounded border border-[rgba(0,229,255,0.1)]">
                <span className="text-[#64748b] block text-[10px]">平均水温</span>
                <span className="text-white font-bold">{mission.environment.waterTemp.toFixed(1)} °C</span>
              </div>
              <div className="bg-[#051121] p-2.5 rounded border border-[rgba(0,229,255,0.1)]">
                <span className="text-[#64748b] block text-[10px]">水体能见度</span>
                <span className="text-[#10b981] font-bold">{mission.environment.visibility.toFixed(1)} m</span>
              </div>
            </div>
          </div>

          {/* Section 3: Representative Keyframes */}
          <div className="report-section space-y-2">
            <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
              三、典型样带代表性影像与复拍对比 (Representative Keyframes)
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {/* S01 Normal */}
              <div className="bg-[#051121] p-2 rounded border border-[rgba(0,229,255,0.15)] flex flex-col">
                <img
                  src="/samples/urpc/000_000001.jpg"
                  alt="S01 Keyframe"
                  className="rounded aspect-video object-cover mb-1.5"
                />
                <span className="font-bold text-white">S01: 浅水砂质底栖样帧</span>
                <span className="text-[#64748b] text-[10px] font-mono mt-0.5">
                  正常光照 · 检出海胆 11 处 · 曝光 0.72
                </span>
              </div>

              {/* S02 Recaptured */}
              <div className="bg-[#051121] p-2 rounded border border-[rgba(16,185,129,0.3)] flex flex-col">
                <img
                  src="/samples/urpc/001_000002.jpg"
                  alt="S02 Recaptured"
                  className="rounded aspect-video object-cover mb-1.5"
                />
                <span className="font-bold text-white flex items-center gap-1">
                  S02: 补光复拍增强样帧
                  <Tag color="green" className="text-[9px]">85%补光</Tag>
                </span>
                <span className="text-[#10b981] text-[10px] font-mono mt-0.5">
                  由欠曝 2 处跃升至 10 处 (海参3,海胆7)
                </span>
              </div>

              {/* S03 Reviewed */}
              <div className="bg-[#051121] p-2 rounded border border-[rgba(0,229,255,0.15)] flex flex-col">
                <img
                  src="/samples/urpc/003_000004.jpg"
                  alt="S03 Reviewed"
                  className="rounded aspect-video object-cover mb-1.5"
                />
                <span className="font-bold text-white flex items-center gap-1">
                  S03: 人工鱼礁复核样帧
                  <Tag color="cyan" className="text-[9px]">已审定</Tag>
                </span>
                <span className="text-[#64748b] text-[10px] font-mono mt-0.5">
                  海星/海胆共存 · 完成低置信度修正
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Species Census Table */}
          <div className="report-section space-y-2">
            <h2 className="text-sm font-bold text-[#00e5ff] uppercase tracking-wider flex items-center gap-2">
              四、审定底栖生物物种统计核算表 (Verified Species Census)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border border-[rgba(0,229,255,0.2)]">
                <thead className="bg-[#051428] text-[#00e5ff]">
                  <tr>
                    <th className="p-2 border-b border-[rgba(0,229,255,0.2)]">生物类别</th>
                    <th className="p-2 border-b border-[rgba(0,229,255,0.2)]">拉丁学名/代号</th>
                    <th className="p-2 border-b border-[rgba(0,229,255,0.2)]">复核审定数量 (处)</th>
                    <th className="p-2 border-b border-[rgba(0,229,255,0.2)]">相对丰度占比</th>
                    <th className="p-2 border-b border-[rgba(0,229,255,0.2)]">生境健康评价</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
                  <tr>
                    <td className="p-2 font-bold text-white">海胆 (Echinus)</td>
                    <td className="p-2 text-[#94a3b8]">Strongylocentrotus</td>
                    <td className="p-2 text-[#00e5ff] font-bold">{counts['海胆']} 处</td>
                    <td className="p-2">
                      {allDetections.length > 0 ? ((counts['海胆'] / allDetections.length) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="p-2 text-[#10b981]">群落优势种 / 良好</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white">海参 (Holothurian)</td>
                    <td className="p-2 text-[#94a3b8]">Apostichopus japonicus</td>
                    <td className="p-2 text-[#00e5ff] font-bold">{counts['海参']} 处</td>
                    <td className="p-2">
                      {allDetections.length > 0 ? ((counts['海参'] / allDetections.length) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="p-2 text-[#10b981]">深凹基质分布 / 优质</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white">扇贝 (Scallop)</td>
                    <td className="p-2 text-[#94a3b8]">Patinopecten yessoensis</td>
                    <td className="p-2 text-[#00e5ff] font-bold">{counts['扇贝']} 处</td>
                    <td className="p-2">
                      {allDetections.length > 0 ? ((counts['扇贝'] / allDetections.length) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="p-2 text-[#94a3b8]">砂质底层零星分布</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-white">海星 (Starfish)</td>
                    <td className="p-2 text-[#94a3b8]">Asterias amurensis</td>
                    <td className="p-2 text-[#00e5ff] font-bold">{counts['海星']} 处</td>
                    <td className="p-2">
                      {allDetections.length > 0 ? ((counts['海星'] / allDetections.length) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="p-2 text-[#f59e0b]">敌害生物 / 需关注</td>
                  </tr>
                  <tr className="bg-[#051121] font-bold">
                    <td className="p-2 text-white">总计</td>
                    <td className="p-2 text-[#94a3b8]">4 大核心底栖门类</td>
                    <td className="p-2 text-[#10b981]">{allDetections.length} 处物标</td>
                    <td className="p-2 text-white">100.0%</td>
                    <td className="p-2 text-[#00e5ff]">牧场生态整体健康</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Model Provenance & Sign-off */}
          <div className="report-section grid grid-cols-2 gap-4 pt-2 border-t border-[rgba(255,255,255,0.1)] text-xs">
            <div className="space-y-1 font-mono text-[#94a3b8]">
              <div className="font-bold text-white">算法模型溯源与参数配置:</div>
              <div>模型版本: {modelConfig.version} ({modelConfig.parameterCount})</div>
              <div>检测基准: URPC2020 (AP50: {modelConfig.ap50}, AP75: {modelConfig.ap75})</div>
              <div>主干网络: {modelConfig.backbone}</div>
            </div>

            <div className="flex flex-col items-end justify-center font-mono">
              <div className="text-[#94a3b8]">报告审定人（电子签章）：</div>
              <div className="text-lg font-serif font-bold text-white mt-1 border-b border-white pb-0.5 px-4">
                海析智曈专家评定组
              </div>
              <div className="text-[10px] text-[#64748b] mt-1">
                生成时间：{new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
