import React, { useState } from 'react';
import { useMissionStore } from '../../stores/missionStore';
import {
  Layers,
  Sliders,
  Filter,
  Eye,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Cpu,
  Play,
  CheckCheck,
  Terminal,
} from 'lucide-react';
import { Button, Tag, Slider, message, Modal, Progress } from 'antd';

export const MissionImagesPage: React.FC = () => {
  const {
    images,
    activeImageId,
    setActiveImage,
    setAnalysisTab,
    modelConfig,
    setModelThreshold,
    inferenceState,
    inferenceProgress,
    inferenceLogs,
    runModelInference,
  } = useMissionStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'adopted' | 'review' | 'recapture'>('all');
  const [importModalOpen, setImportModalOpen] = useState(false);

  const filteredImages = images.filter((img) => {
    if (activeFilter === 'adopted') return img.adopted;
    if (activeFilter === 'review') return img.status === 'needs_review' || img.siteId === 'S03';
    if (activeFilter === 'recapture') return img.isRecapture || img.id === 'IMG-S02-DARK';
    return true;
  });

  const handleSimulateImport = () => {
    message.loading({ content: '正在读取图像元数据并调用 FBDPN 差分金字塔推理引擎...', key: 'import' });
    setTimeout(() => {
      message.success({ content: '模拟导入成功：新增 1 组水族箱 Aquarium 测试样帧，检出物标 4 处', key: 'import' });
      setImportModalOpen(false);
    }, 1200);
  };

  return (
    <div className="w-full h-full p-3.5 overflow-y-auto bg-[#070d17] select-none text-xs">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Top Header Card */}
        <div className="cockpit-panel p-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#38bdf8]" />
              任务影像资产库与模型初筛流水线
            </h1>
            <p className="text-[#94a3b8] text-xs mt-0.5">
              管理本次巡检任务所有水下原始帧、大功率补光复拍对比帧与 FBDPN 算法推导切片
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setImportModalOpen(true)}
              className="px-3 py-1.5 bg-[#0b1523] text-[#94a3b8] hover:text-white border border-[rgba(148,163,184,0.18)] rounded font-medium flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              导入外部数据集与标注
            </button>
          </div>
        </div>

        {/* AI Model Inference Execution Strip */}
        <div className="cockpit-panel p-3 bg-[#0b1523] border border-[rgba(148,163,184,0.18)] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#38bdf8]" />
              <span className="font-semibold text-white">FBDPN-SwinT 批量目标检测推理引擎</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.3)] font-mono">
                Swin-Tiny FP16 TensorRT
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={runModelInference}
                disabled={inferenceState === 'running'}
                className="px-3 py-1.5 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded font-medium flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                {inferenceState === 'running' ? '深度推理运算中...' : '启动批量目标检测推理'}
              </button>

              <button
                onClick={() => setAnalysisTab('workbench')}
                className="px-3 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white rounded font-medium flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                进入人工复核工作台
              </button>
            </div>
          </div>

          {/* Progress Bar & Logs */}
          {inferenceState === 'running' && (
            <div className="mt-1">
              <Progress percent={inferenceProgress} strokeColor="#0ea5e9" size="small" />
            </div>
          )}

          <div className="bg-[#070d17] p-2 rounded border border-[rgba(148,163,184,0.1)] font-mono text-[10px] text-[#94a3b8] space-y-0.5">
            {inferenceLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[#38bdf8]">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter & Model Configuration Bar */}
        <div className="cockpit-panel p-2.5 flex items-center justify-between">
          {/* Left: Filter Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#64748b] flex items-center gap-1 font-medium mr-1 text-[11px]">
              <Filter className="w-3.5 h-3.5" />
              视图筛选:
            </span>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                activeFilter === 'all'
                  ? 'bg-[#12233b] text-[#38bdf8] font-medium border border-[rgba(14,165,233,0.3)]'
                  : 'bg-[#070d17] text-[#94a3b8] hover:text-white'
              }`}
            >
              全部影像 ({images.length})
            </button>
            <button
              onClick={() => setActiveFilter('adopted')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                activeFilter === 'adopted'
                  ? 'bg-[#12233b] text-[#38bdf8] font-medium border border-[rgba(14,165,233,0.3)]'
                  : 'bg-[#070d17] text-[#94a3b8] hover:text-white'
              }`}
            >
              主样帧 ({images.filter((i) => i.adopted).length})
            </button>
            <button
              onClick={() => setActiveFilter('review')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                activeFilter === 'review'
                  ? 'bg-[#12233b] text-[#f59e0b] font-medium border border-[rgba(245,158,11,0.3)]'
                  : 'bg-[#070d17] text-[#94a3b8] hover:text-white'
              }`}
            >
              待人工复核队列
            </button>
            <button
              onClick={() => setActiveFilter('recapture')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                activeFilter === 'recapture'
                  ? 'bg-[#12233b] text-[#10b981] font-medium border border-[rgba(16,185,129,0.3)]'
                  : 'bg-[#070d17] text-[#94a3b8] hover:text-white'
              }`}
            >
              复拍对比关联帧
            </button>
          </div>

          {/* Right: Model Threshold Tuning */}
          <div className="flex items-center gap-3 bg-[#070d17] px-3 py-1 rounded border border-[rgba(148,163,184,0.12)] font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-[#64748b]">置信度阈值 (Confidence):</span>
              <Slider
                min={0.1}
                max={0.9}
                step={0.05}
                value={modelConfig.confidenceThreshold}
                onChange={(val) => setModelThreshold(val)}
                className="w-20 my-0"
              />
              <span className="text-white font-medium w-8 text-right">
                {modelConfig.confidenceThreshold.toFixed(2)}
              </span>
            </div>

            <span className="text-[#334155]">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-[#64748b]">NMS IoU:</span>
              <span className="text-white font-medium">{modelConfig.nmsIou.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Image Grid Gallery */}
        {filteredImages.length === 0 ? (
          <div className="cockpit-panel p-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#12233b] border border-[rgba(14,165,233,0.3)] flex items-center justify-center text-[#38bdf8] mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <div className="text-white font-semibold text-sm">暂无符合条件的影像切片</div>
            <div className="text-[#94a3b8] text-xs mt-1 max-w-sm">
              当前任务卷轴尚未抓拍切片或未包含此筛选维度的影像。请在 ROV 驾驶舱完成定点抓拍并移交，或一键装填全套示范数据。
            </div>
            <button
              onClick={() => useMissionStore.getState().loadFullDemoDataset()}
              className="mt-4 px-3 py-1.5 bg-[#12233b] hover:bg-[#1a365d] text-[#38bdf8] border border-[rgba(14,165,233,0.35)] rounded text-xs font-medium transition-all"
            >
              一键装填 12 帧示范成果
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredImages.map((img) => (
            <div
              key={img.id}
              className="cockpit-panel overflow-hidden flex flex-col justify-between group hover:border-[rgba(14,165,233,0.4)] transition-all"
            >
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={img.url}
                  alt={img.filename}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#0b1523]/90 text-white font-mono text-[10px] border border-[rgba(148,163,184,0.2)]">
                    样点 {img.siteId}
                  </span>
                  {img.isRecapture && (
                    <span className="px-1.5 py-0.5 rounded bg-[#10b981] text-black font-bold text-[10px]">
                      复拍新帧
                    </span>
                  )}
                  {img.id === 'IMG-S02-DARK' && (
                    <span className="px-1.5 py-0.5 rounded bg-[#ef4444] text-white font-medium text-[10px]">
                      历史欠曝
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 right-2 bg-[#0b1523]/90 px-2 py-0.5 rounded text-[10px] text-white font-mono border border-[rgba(148,163,184,0.2)]">
                  检出: {img.detections.length} 处
                </div>
              </div>

              <div className="p-2.5">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-white font-medium">{img.id}</span>
                  <span className="text-[#64748b]">{img.timestamp}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 mt-1.5 text-center text-[10px] font-mono bg-[#070d17] p-1.5 rounded border border-[rgba(148,163,184,0.08)]">
                  <div>
                    <span className="text-[#64748b] block">曝光度</span>
                    <span className="text-white font-medium">{img.exposure.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">清晰度</span>
                    <span className="text-white font-medium">{img.sharpness.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">光照</span>
                    <span className="text-[#f59e0b] font-medium">{img.illumination} Lux</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[rgba(148,163,184,0.1)]">
                  <span className="text-[10px] text-[#64748b]">
                    {img.adopted ? '✓ 采纳为主样帧' : '备选存档帧'}
                  </span>
                  <button
                    onClick={() => {
                      setActiveImage(img.id);
                      setAnalysisTab('workbench');
                    }}
                    className="px-2.5 py-1 bg-[#12233b] hover:bg-[#0ea5e9] text-[#38bdf8] hover:text-white rounded border border-[rgba(14,165,233,0.3)] text-xs flex items-center gap-1 transition-all"
                  >
                    <Eye className="w-3 h-3" />
                    进入复核工作台
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Simulated Import Modal */}
      <Modal
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        title="导入外部水下影像数据集 / JSON 结果"
        footer={[
          <Button key="cancel" onClick={() => setImportModalOpen(false)}>
            取消
          </Button>,
          <Button key="import" type="primary" onClick={handleSimulateImport} className="bg-[#0ea5e9] text-white font-medium border-none">
            开始解析与导入
          </Button>,
        ]}
      >
        <div className="space-y-3 text-xs py-2">
          <p className="text-[#94a3b8]">
            支持导入标准 COCO 格式标注 JSON 或 URPC/Aquarium 原始水下生物影像包。
          </p>
          <div className="p-4 border-2 border-dashed border-[rgba(148,163,184,0.25)] rounded-lg text-center bg-[#070d17]">
            <Upload className="w-8 h-8 text-[#38bdf8] mx-auto mb-2 opacity-75" />
            <div className="text-white font-medium">拖拽文件至此处，或点击浏览本地文件</div>
            <div className="text-[#64748b] text-[11px] mt-1">支持 .jpg, .png, .json, .zip 任务包</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
