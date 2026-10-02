import React from 'react';
import { Modal } from 'antd';
import { useTourStore } from '../stores/tourStore';
import {
  Compass,
  Anchor,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

export const TourWelcomeModal: React.FC = () => {
  const { isWelcomeModalOpen, openTour, closeWelcomeModal } = useTourStore();

  return (
    <Modal
      open={isWelcomeModalOpen}
      onCancel={closeWelcomeModal}
      footer={null}
      centered
      width={560}
      className="tour-welcome-modal"
      closable={false}
      maskClosable={true}
    >
      <div className="bg-[#0b1523] border border-[rgba(14,165,233,0.3)] rounded-lg p-5 text-white shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0ea5e9] via-[#10b981] to-[#0ea5e9]" />

        {/* Close icon */}
        <button
          onClick={closeWelcomeModal}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title with Badge */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0c243c] to-[#0b1523] border border-[rgba(14,165,233,0.4)] flex items-center justify-center text-[#38bdf8] shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <Compass className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                欢迎体验海析智曈双平台系统
              </h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(14,165,233,0.18)] text-[#38bdf8] border border-[rgba(14,165,233,0.4)] font-mono font-semibold">
                v2.4-PRO
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              ROV-GCS 机载控制台 & FBDPN 智能生态分析平台
            </p>
          </div>
        </div>

        {/* Introduction text */}
        <p className="text-xs text-[#cbd5e1] leading-relaxed mb-4">
          海析智曈是一套面向复杂水下视界的高可靠工业操作型软件。系统集成了水下光电遥测、机载硬件视觉辅助调光复拍，以及专业级 CVAT 目标复核工作台。建议您开启 <strong className="text-[#38bdf8]">1 分钟交互式新手操作向导</strong>，快速领略软硬件全链路闭环流程。
        </p>

        {/* Two Pillars Preview Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[#070d17] border border-[rgba(148,163,184,0.15)] rounded-md p-3 relative overflow-hidden group hover:border-[rgba(14,165,233,0.4)] transition-all">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#38bdf8] mb-1.5">
              <Anchor className="w-3.5 h-3.5" />
              <span>ROV 岸端地面控制台</span>
            </div>
            <ul className="text-[11px] text-[#94a3b8] space-y-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#10b981] shrink-0" />
                <span>L0 工业安全监控 & MAVLink</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#10b981] shrink-0" />
                <span>实时光电 HUD & 样点巡检抓拍</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#f59e0b] shrink-0" />
                <span>欠曝检测 & 硬件探照灯主动补光</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#070d17] border border-[rgba(148,163,184,0.15)] rounded-md p-3 relative overflow-hidden group hover:border-[rgba(16,185,129,0.4)] transition-all">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#34d399] mb-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>FBDPN 智能分析平台</span>
            </div>
            <ul className="text-[11px] text-[#94a3b8] space-y-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#10b981] shrink-0" />
                <span>Swin-T 批量高精水下目标推理</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#10b981] shrink-0" />
                <span>CVAT 级交互式人工标注复核</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#10b981] shrink-0" />
                <span>物种丰度统计 & 生态报告出具</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(148,163,184,0.15)]">
          <button
            onClick={closeWelcomeModal}
            className="px-3 py-1.5 rounded text-xs text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all cursor-pointer font-medium"
          >
            直接自由探索 (跳过向导)
          </button>

          <button
            onClick={() => openTour('full')}
            className="px-4 py-2 bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7] text-white rounded text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.35)] active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>开启 1 分钟交互式向导</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
