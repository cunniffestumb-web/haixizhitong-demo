import React, { useState } from 'react';
import { useMissionStore } from '../../stores/missionStore';
import { getAssetUrl } from '../../utils/assetUrl';
import { Modal, Progress, Tag, Button, Alert } from 'antd';
import {
  AlertTriangle,
  Sun,
  Camera,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Split,
  Eye,
  Sparkles,
} from 'lucide-react';

export const RecaptureModal: React.FC = () => {
  const {
    recaptureModalOpen,
    recaptureStep,
    recaptureLogs,
    closeRecaptureModal,
    executeRecapture,
    adoptRecapturedImage,
    skipRecapture,
  } = useMissionStore();

  const [sliderPos, setSliderPos] = useState(50); // percentage 0..100 for split-view comparison

  return (
    <Modal
      open={recaptureModalOpen}
      onCancel={closeRecaptureModal}
      footer={null}
      width={840}
      title={
        <div className="flex items-center gap-2 text-white text-base">
          <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
          <span>视觉辅助复拍决策工作流 (Visual-Assisted Recapture)</span>
          <span className="text-xs px-2 py-0.5 rounded bg-[rgba(245,158,11,0.2)] text-[#f59e0b] border border-[rgba(245,158,11,0.4)] ml-auto mr-6">
            样点 S02 · 欠曝异常
          </span>
        </div>
      }
      styles={{
        content: {
          background: '#071325',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        },
        header: {
          background: 'transparent',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '12px',
        },
        body: { padding: '16px 0 0 0', color: '#e2e8f0' },
      }}
    >
      {/* STEP 1: Prompt & Diagnosis */}
      {recaptureStep === 'prompt' && (
        <div className="space-y-4 text-xs">
          <Alert
            message="智能视觉门控预警：画面欠曝严重"
            description="当前样点 S02 处于深洼背光区域，环境平均照度仅 14 Lux，曝光指数 0.22（严重低于合格门限 0.50）。受低对比度与强噪声影响，FBDPN 在线初筛仅检出 2 个低置信目标，疑似大量漏检。"
            type="warning"
            showIcon
            className="bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.3)] text-[#e2e8f0]"
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Left: Current Dark Image Snapshot */}
            <div className="bg-[#040c17] rounded-lg p-2.5 border border-[rgba(0,229,255,0.15)] flex flex-col">
              <div className="text-[11px] font-semibold text-[#f59e0b] mb-1.5 flex items-center justify-between">
                <span>当前采集原帧 (欠曝状态)</span>
                <span className="text-[10px] text-[#ef4444]">检出数: 2 处</span>
              </div>
              <div className="relative rounded overflow-hidden aspect-video bg-black">
                <img
                  src={getAssetUrl('/samples/urpc/001_000002_underexposed.jpg')}
                  alt="Underexposed S02 frame"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 left-1 bg-black/75 px-1.5 py-0.5 rounded text-[10px] text-white">
                  照度: 14 Lux / 曝光: 0.22
                </div>
              </div>
            </div>

            {/* Right: Suggested Closed-loop Action */}
            <div className="bg-[#09182f] rounded-lg p-3 border border-[rgba(0,229,255,0.2)] flex flex-col justify-between">
              <div>
                <div className="text-white font-semibold text-xs mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#00e5ff]" />
                  系统自适应复拍策略推荐
                </div>
                <div className="space-y-2 text-[#94a3b8]">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[rgba(0,229,255,0.2)] text-[#00e5ff] flex items-center justify-center text-[10px] font-bold">1</span>
                    <span><strong>大功率矩阵补光升档：</strong>将左右双路补光由 40% 快速阶跃至 85%</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[rgba(0,229,255,0.2)] text-[#00e5ff] flex items-center justify-center text-[10px] font-bold">2</span>
                    <span><strong>位姿保持稳拍：</strong>定深 11.5m 悬停 5 秒，待 ISP 自动测光白平衡锁定</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[rgba(0,229,255,0.2)] text-[#00e5ff] flex items-center justify-center text-[10px] font-bold">3</span>
                    <span><strong>二次快门重采：</strong>采集高信噪比底栖全景帧，触发 FBDPN 二次推理</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#050f1d] p-2 rounded text-[11px] text-[#64748b] mt-3">
                * 本样点复拍次数限制：最多 2 次（当前第 1 次申请）。
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(255,255,255,0.1)]">
            <Button onClick={skipRecapture} className="border-[#475569] text-[#94a3b8] hover:text-white">
              跳过复拍 (保留原帧待人工复核)
            </Button>
            <Button
              type="primary"
              onClick={executeRecapture}
              className="bg-gradient-to-r from-[#0284c7] to-[#00e5ff] border-none font-semibold text-[#071325] hover:opacity-90 flex items-center gap-1.5"
            >
              <Sun className="w-4 h-4" />
              一键执行主动复拍
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Executing Animation */}
      {recaptureStep === 'executing' && (
        <div className="py-8 px-4 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[rgba(0,229,255,0.1)] border-2 border-[#00e5ff] border-t-transparent animate-spin flex items-center justify-center mb-2" />
          <div className="text-base font-bold text-white tracking-wide">
            正在执行水下复拍控制序列...
          </div>
          <div className="w-3/4 max-w-md">
            <Progress percent={78} status="active" strokeColor="#00e5ff" showInfo={false} />
          </div>

          <div className="bg-[#050e1c] p-3 rounded-lg border border-[rgba(0,229,255,0.15)] w-full max-w-lg text-left font-mono text-[11px] space-y-1 text-[#94a3b8]">
            {recaptureLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-[#00e5ff]">›</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Comparison View (Split View / Before & After) */}
      {recaptureStep === 'compare' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold flex items-center gap-1.5">
              <Split className="w-4 h-4 text-[#00e5ff]" />
              复拍前后效果双重视图对比 (Split Comparison)
            </span>
            <span className="text-[#10b981] font-mono text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              检出数提升 +400% (2 → 10 处)
            </span>
          </div>

          {/* Interactive Split Image Comparison Container */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-[rgba(0,229,255,0.3)] bg-black select-none">
            {/* Background Image: Recaptured (Bright / After) */}
            <img
              src={getAssetUrl('/samples/urpc/001_000002.jpg')}
              alt="Recaptured frame"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Foreground Image: Underexposed (Dark / Before) clipped by slider */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={getAssetUrl('/samples/urpc/001_000002_underexposed.jpg')}
                alt="Underexposed frame"
                className="w-full h-full object-cover max-w-none"
                style={{ width: '808px', height: '454px' }} // fixed to match parent aspect
              />
            </div>

            {/* Split Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#00e5ff] text-[#071325] flex items-center justify-center font-bold text-[10px] shadow-lg">
                ↔
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-[#f59e0b] border border-[#f59e0b]/40">
              复拍前 (欠曝 14 Lux / 检出 2)
            </div>
            <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-[#10b981] border border-[#10b981]/40">
              复拍后 (补光 82 Lux / 检出 10)
            </div>

            {/* Slider Control for dragging */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />
          </div>

          <div className="text-center text-[11px] text-[#64748b]">
            拖动左右滑块可直观比对复拍前后图像与检测效果
          </div>

          {/* Metric Comparison Table */}
          <div className="grid grid-cols-4 gap-2 bg-[#051020] p-2.5 rounded-lg border border-[rgba(0,229,255,0.15)] text-center font-mono">
            <div>
              <div className="text-[#64748b] text-[10px]">曝光指数 (EXP)</div>
              <div className="text-sm font-bold text-white mt-0.5">
                0.22 <span className="text-[#10b981]">→ 0.78</span>
              </div>
            </div>
            <div>
              <div className="text-[#64748b] text-[10px]">清晰度评分</div>
              <div className="text-sm font-bold text-white mt-0.5">
                0.45 <span className="text-[#10b981]">→ 0.84</span>
              </div>
            </div>
            <div>
              <div className="text-[#64748b] text-[10px]">照度 (Lux)</div>
              <div className="text-sm font-bold text-white mt-0.5">
                14 <span className="text-[#10b981]">→ 82</span>
              </div>
            </div>
            <div>
              <div className="text-[#64748b] text-[10px]">FBDPN 检出目标</div>
              <div className="text-sm font-bold text-white mt-0.5">
                2 <span className="text-[#00e5ff]">→ 10 (海参3,海胆7)</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(255,255,255,0.1)]">
            <Button onClick={skipRecapture} className="border-[#475569] text-[#94a3b8] hover:text-white">
              放弃该复拍帧 (保留原图)
            </Button>
            <Button
              type="primary"
              onClick={adoptRecapturedImage}
              className="bg-gradient-to-r from-[#10b981] to-[#059669] border-none font-semibold text-white flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            >
              <CheckCircle2 className="w-4 h-4" />
              采纳复拍图像并替换主样帧
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
