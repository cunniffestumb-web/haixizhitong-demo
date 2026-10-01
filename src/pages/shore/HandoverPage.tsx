import React from 'react';
import { useMissionStore } from '../../stores/missionStore';
import { getAssetUrl } from '../../utils/assetUrl';
import {
  History,
  ArrowRight,
  Download,
  Share2,
  CheckCircle2,
  Package,
  FileText,
  Clock,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button, Tag, Steps, Timeline, message } from 'antd';

export const HandoverPage: React.FC = () => {
  const {
    mission,
    images,
    handoverToAnalysis,
    setActiveImage,
    setShoreTab,
    loadFullDemoDataset,
  } = useMissionStore();

  const handleExportPackage = () => {
    message.loading({ content: '正在生成 HXTASK 标准双平台任务包 ZIP...', key: 'export' });
    setTimeout(() => {
      message.success({
        content: `任务包生成成功：${mission.id}.hxtask.zip (包含 manifest、遥测日志、关键帧图卷、复拍对比与初筛结果)`,
        key: 'export',
        duration: 4,
      });
    }, 1000);
  };

  const adoptedImages = images.filter((img) => img.adopted);
  const totalDetections = adoptedImages.reduce((sum, img) => sum + img.detections.length, 0);

  return (
    <div className="w-full h-full p-4 overflow-y-auto bg-[#070d17] select-none text-xs">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Handover Hero Card */}
        <div className="cockpit-panel p-5 flex items-center justify-between border-[rgba(0,229,255,0.3)] bg-gradient-to-r from-[#07172e] to-[#0a2347]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">
                任务归档、记录审计与智能分析移交
              </h1>
              <Tag color="cyan">{mission.id}</Tag>
            </div>
            <p className="text-[#94a3b8] text-xs mt-1.5 max-w-2xl leading-relaxed">
              {images.length > 0
                ? `ROV 岸端水下数据采集阶段已完成，已捕获 ${images.length} 帧切片（覆盖 ${mission.sampleSites.filter(s => s.status === 'completed').length}/3 样点）。可一键向 FBDPN 平台移交完整任务数据集。`
                : 'ROV 岸端水下巡检作业进行中：当前卷轴尚无捕获帧 (0 / 3 样点)。建议先在作业驾驶舱操控 ROV 巡航并定点抓拍，亦可一键装填全套示范成果直接移交。'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {images.length === 0 && (
              <Button
                onClick={() => setShoreTab('cockpit')}
                className="bg-[#0b2447] text-[#38bdf8] border-[rgba(14,165,233,0.4)] hover:text-white flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                返回驾驶舱抓拍
              </Button>
            )}

            <Button
              onClick={handleExportPackage}
              disabled={images.length === 0}
              className="bg-[#0b2447] text-white border-[rgba(0,229,255,0.3)] hover:text-[#00e5ff] flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
              导出 HXTASK 任务包 (ZIP)
            </Button>

            <Button
              type="primary"
              size="large"
              onClick={handoverToAnalysis}
              className="bg-gradient-to-r from-[#10b981] to-[#059669] hover:opacity-95 text-white font-bold border-none flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"
            >
              <Share2 className="w-4 h-4" />
              {images.length > 0 ? '移交 FBDPN 智能分析平台' : '装填全套示范成果并移交'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-4 gap-4 font-mono">
          <div className="cockpit-panel p-3">
            <div className="text-[#94a3b8] text-[10px]">有效巡检样点</div>
            <div className="text-2xl font-bold text-[#00e5ff] mt-1">
              {mission.sampleSites.filter((s) => s.status === 'completed').length} / 3
            </div>
            <div className="text-[10px] text-[#10b981] mt-0.5">
              {mission.sampleSites.filter((s) => s.status === 'completed').length === 3 ? 'S01、S02、S03 全部覆盖' : '作业推进中'}
            </div>
          </div>

          <div className="cockpit-panel p-3">
            <div className="text-[#94a3b8] text-[10px]">主样帧影像采纳</div>
            <div className="text-2xl font-bold text-white mt-1">{adoptedImages.length} 帧</div>
            <div className="text-[10px] text-[#94a3b8] mt-0.5">包含自主补光复拍对比</div>
          </div>

          <div className="cockpit-panel p-3">
            <div className="text-[#94a3b8] text-[10px]">在线初筛检出物标数</div>
            <div className="text-2xl font-bold text-[#10b981] mt-1">{totalDetections} 处</div>
            <div className="text-[10px] text-[#94a3b8] mt-0.5">海胆、海参、海星多群落</div>
          </div>

          <div className="cockpit-panel p-3">
            <div className="text-[#94a3b8] text-[10px]">视觉质量达标率</div>
            <div className="text-2xl font-bold text-[#f59e0b] mt-1">
              {images.length > 0 ? (mission.sampleSites.some(s => s.qualityStatus === 'underexposed') ? '66.7%' : '100%') : '--'}
            </div>
            <div className="text-[10px] text-[#10b981] mt-0.5">复拍闭环后消除欠曝</div>
          </div>
        </div>

        {/* 2-Columns: Keyframe Inspection & Event Audit Timeline */}
        <div className="grid grid-cols-12 gap-4">
          {/* Keyframe Visual Inventory (Col 7) */}
          <div className="col-span-7 cockpit-panel p-4 space-y-3">
            <div className="text-white font-semibold text-xs pb-2 border-b border-[rgba(0,229,255,0.15)] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#00e5ff]" />
                移交影像集与复拍关联映射表 (Media Manifest)
              </span>
              <span className="text-[#94a3b8] text-[10px]">共 {images.length} 张原始与衍生帧</span>
            </div>

            <div className="space-y-2">
              {images.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[rgba(148,163,184,0.18)] rounded text-[#94a3b8] space-y-2">
                  <p>当前巡检任务尚未记录到水下抓拍帧。</p>
                  <p className="text-[11px] text-[#64748b]">请操控 ROV 巡航至样点并点击【📸 定点抓拍 (Capture)】采集数据，或点击上方装填示范成果。</p>
                </div>
              ) : (
                images.map((img) => (
                <div
                  key={img.id}
                  className="bg-[#051121] p-2.5 rounded-lg border border-[rgba(0,229,255,0.12)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getAssetUrl(img.url)}
                      alt={img.filename}
                      className="w-16 h-10 object-cover rounded border border-[rgba(0,229,255,0.2)]"
                    />
                    <div>
                      <div className="text-white font-bold flex items-center gap-2">
                        <span>{img.id}</span>
                        <Tag color={img.siteId === 'S01' ? 'blue' : img.siteId === 'S02' ? 'gold' : 'purple'}>
                          {img.siteId}
                        </Tag>
                        {img.isRecapture ? (
                          <Tag color="green">复拍新帧</Tag>
                        ) : img.id === 'IMG-S02-DARK' ? (
                          <Tag color="error">历史欠曝帧</Tag>
                        ) : null}
                        {img.adopted ? (
                          <Tag color="cyan">已采纳主帧</Tag>
                        ) : (
                          <Tag color="default">归档备用</Tag>
                        )}
                      </div>
                      <div className="text-[#94a3b8] text-[10px] mt-0.5 font-mono">
                        时间: {img.timestamp} · 曝光: {img.exposure.toFixed(2)} · 清晰度: {img.sharpness.toFixed(2)} · 检出: {img.detections.length} 个
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono text-[#00e5ff]">
                    {img.adopted ? '✓ 移交主池' : '备选池'}
                  </div>
                </div>
              ))
            )}
            </div>
          </div>

          {/* Event Audit Timeline (Col 5) */}
          <div className="col-span-5 cockpit-panel p-4 space-y-3">
            <div className="text-white font-semibold text-xs pb-2 border-b border-[rgba(0,229,255,0.15)] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#00e5ff]" />
                岸端任务作业事件时间线审计 (Audit Trail)
              </span>
              <span className="text-[#10b981] font-mono text-[10px]">全流程保真记录</span>
            </div>

            <Timeline
              className="text-xs pt-2 custom-timeline"
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className="text-white font-bold">09:20:00 任务初始化与六通道自检</div>
                      <div className="text-[#94a3b8] text-[10px]">
                        通信握手通过，IMU 零偏校准完成，ROV-S6 动力下水。
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <div className="text-white font-bold">09:28:15 样点 S01 砂质底栖完成采集</div>
                      <div className="text-[#94a3b8] text-[10px]">
                        水深 8.2m，光照充足，检出海胆密集群落 11 处。
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'gold',
                  children: (
                    <div>
                      <div className="text-white font-bold">09:36:20 样点 S02 触发欠曝预警</div>
                      <div className="text-[#94a3b8] text-[10px]">
                        照度 14 Lux / 曝光指数 0.22，系统推荐大功率补光至 85%。
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className="text-white font-bold">09:39:42 样点 S02 完成主动复拍</div>
                      <div className="text-[#94a3b8] text-[10px]">
                        补光重拍成功，检出目标跃升至 10 处，操作员确认采纳。
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'cyan',
                  children: (
                    <div>
                      <div className="text-white font-bold">09:48:02 样点 S03 人工鱼礁采集完毕</div>
                      <div className="text-[#94a3b8] text-[10px]">
                        水深 12.4m，复杂基底，检出海星、海胆与待复核低置信目标。
                      </div>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <div className="text-white font-bold">当前节点：岸端采集完成，准备移交</div>
                      <div className="text-[#94a3b8] text-[10px]">
                        任务状态变更为已移交，启动 FBDPN 智能分析流水线。
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
