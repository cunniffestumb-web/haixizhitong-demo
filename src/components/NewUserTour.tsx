import React, { useEffect, useMemo } from 'react';
import { Tour, TourProps, Tag } from 'antd';
import { useTourStore, TourMode } from '../stores/tourStore';
import { useMissionStore } from '../stores/missionStore';
import {
  Compass,
  Anchor,
  Cpu,
  ShieldCheck,
  Video,
  Camera,
  ArrowRight,
  Sliders,
  CheckCircle,
  FileText,
  Sparkles,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export const NewUserTour: React.FC = () => {
  const {
    isTourOpen,
    currentStep,
    tourMode,
    setCurrentStep,
    closeTour,
    completeTour,
  } = useTourStore();

  const {
    platformMode,
    shoreTab,
    analysisTab,
    images,
    loadFullDemoDataset,
    setPlatformMode,
    setShoreTab,
    setAnalysisTab,
  } = useMissionStore();

  // Safe element target getter
  const getTarget = (id: string) => () => (document.getElementById(id) as HTMLElement);

  // Handle switching tabs/platforms when step changes
  const handleStepChange = (step: number) => {
    setCurrentStep(step);

    if (tourMode === 'full') {
      if (step <= 6) {
        if (platformMode !== 'shore' || shoreTab !== 'cockpit') {
          setPlatformMode('shore');
          setShoreTab('cockpit');
        }
      } else if (step === 7 || step === 8) {
        if (platformMode !== 'analysis' || analysisTab !== 'workbench') {
          setPlatformMode('analysis');
          setAnalysisTab('workbench');
        }
        if (images.length === 0) {
          loadFullDemoDataset();
        }
      } else if (step === 9) {
        if (platformMode !== 'analysis' || analysisTab !== 'report') {
          setPlatformMode('analysis');
          setAnalysisTab('report');
        }
      }
    } else if (tourMode === 'shore') {
      if (platformMode !== 'shore' || shoreTab !== 'cockpit') {
        setPlatformMode('shore');
        setShoreTab('cockpit');
      }
    } else if (tourMode === 'analysis') {
      if (images.length === 0) {
        loadFullDemoDataset();
      }
      if (step <= 2) {
        if (platformMode !== 'analysis' || analysisTab !== 'workbench') {
          setPlatformMode('analysis');
          setAnalysisTab('workbench');
        }
      } else {
        if (platformMode !== 'analysis' || analysisTab !== 'report') {
          setPlatformMode('analysis');
          setAnalysisTab('report');
        }
      }
    }
  };

  // Full End-to-End Tour Steps (10 Steps)
  const fullSteps: TourProps['steps'] = useMemo(
    () => [
      {
        title: (
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Compass className="w-4 h-4 text-[#38bdf8]" />
            <span>海析智曈双平台系统</span>
            <Tag color="#0284c7" className="text-[10px] font-mono m-0">v2.4</Tag>
          </div>
        ),
        description: (
          <div className="text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed pt-1">
            <p>
              欢迎使用<strong>海析智曈</strong>！系统面向多源退化水下视界，融合了 <span className="text-[#38bdf8]">ROV 岸端机载控制台</span> 与 <span className="text-[#34d399]">FBDPN 智能生态分析平台</span>，严格遵循 ANSI/ISA-101.01 工业高可靠交互标准。
            </p>
            <div className="text-[11px] text-[#94a3b8] bg-[#070d17] p-1.5 rounded border border-[rgba(148,163,184,0.15)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span>跟随本向导只需 1 分钟，即可掌握软硬件协同全流程！</span>
            </div>
          </div>
        ),
        target: getTarget('tour-brand-header'),
        placement: 'bottomLeft',
      },
      {
        title: (
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Layers className="w-4 h-4 text-[#38bdf8]" />
            <span>双平台一键切换中枢</span>
          </div>
        ),
        description: (
          <div className="text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed pt-1">
            <p>
              在此处可一键在<strong>【ROV 岸端地面控制台】</strong>（巡航/遥测/抓拍/调光）与<strong>【FBDPN 智能分析平台】</strong>（AI 推理/高精复核/统计报告）之间无缝穿梭。
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              右侧胶囊带有琥珀色通知呼吸灯，当有新移交的水下切片或推理就绪时将主动唤醒。
            </p>
          </div>
        ),
        target: getTarget('tour-platform-switcher'),
        placement: 'bottom',
      },
      {
        title: (
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" />
            <span>L0 工业安全监控防线</span>
          </div>
        ),
        description: (
          <div className="text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed pt-1">
            <p>
              深海水下作业的安全基底！常驻监控<strong>母线供电电压 (4S)</strong>、<strong>系留光缆绝缘抗阻 (&gt;100MΩ)</strong>、<strong>舱体水浸探头 (SAFE)</strong> 与<strong>推进器电调心跳</strong>。
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              右侧同时常驻【装填示范数据】与【出航初始态 (0 帧)】快捷切换，方便录屏与答辩演示。
            </p>
          </div>
        ),
        target: getTarget('tour-safety-bar'),
        placement: 'bottom',
      },
      {
        title: (
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Activity className="w-4 h-4 text-[#38bdf8]" />
            <span>工业遥测监控与急停响应</span>
          </div>
        ),
        description: (
          <div className="text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed pt-1">
            <p>
              以 20Hz 实时回传 MAVLink 2.0 遥测：<strong>潜航器在线状态</strong>、<strong>毫秒级光缆延迟</strong>、<strong>下潜深度</strong>、<strong>电子罗盘航向</strong>与<strong>动力电池容量</strong>。
            </p>
            <p className="text-[11px] text-[#ef4444] font-medium flex items-center gap-1">
              <span>右侧红色【急停】按钮可瞬时切断 6 路推进器动力，确保极端险情安全。</span>
            </p>
          </div>
        ),
        target: getTarget('tour-telemetry-safety'),
        placement: 'bottomRight',
      },
      {
        title: (
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Anchor className="w-4 h-4 text-[#38bdf8]" />
            <span>样点巡检规划序列 (S01~S03)</span>
          </div>
        ),
        description: (
          <div className="text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed pt-1">
            <p>
              预置典型生境巡检航线：S01 平坦海床、S02 洼地暗区（欠曝样点）、S03 碎屑岩区。
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              下方实时采集水温、浑浊度 (NTU)、海流与能见度，并详细记录总线控制指令流水。
            </p>
          </div>
        ),
        target: getTarget('tour-sample-sites'),
        placement: 'right',
      },
      {
        title: (
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Video className="w-4 h-4 text-[#38bdf8]" />
            <span>纯净光电监控流 & HUD 抬头姿态仪</span>
          </div>
        ),
        description: (
          <div className="text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed pt-1">
            <p>
              经过 OpenCV 深度修复处理的水下 RTSP 纯净监控流，彻底抹除人工历史标注痕迹。
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              中央叠加战机级 HUD 抬头显示仪（航向刻度滚带、深度指示、十字准星与自然微晃动仿真）。
            </p>
          </div>
        ),
        target: getTarget('tour-video-hud'),
        placement: 'left',
      },
      {
        title: (
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Camera className="w-4 h-4 text-[#38bdf8]" />
            <span>定点抓拍与智能补光复拍闭环</span>
            <Tag color="#d97706" className="text-[10px] m-0">核心实操</Tag>
          </div>
        ),
        description: (
          <div className="text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed pt-1">
            <p>
              飞手操控 ROV 巡航至样点后点击<strong>【定点抓拍】</strong>捕获底片入卷。
            </p>
            <p className="text-[11px] text-[#f59e0b] bg-[rgba(245,158,11,0.12)] p-1.5 rounded border border-[rgba(245,158,11,0.3)]">
              <strong>软硬件闭环亮点</strong>：在暗光欠曝样点 (S02)，系统将触发欠曝预警，一键驱动硬件探照灯爆闪至 85% 强光并执行复拍决策对比！
            </p>
          </div>
        ),
        target: getTarget('tour-capture-actions'),
        placement: 'top',
      },
      {
        title: (
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Cpu className="w-4 h-4 text-[#34d399]" />
            <span>CVAT 级智能复核工作台</span>
            <Tag color="#10b981" className="text-[10px] m-0">AI 分析平台</Tag>
          </div>
        ),
        description: (
          <div className="text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed pt-1">
            <p>
              结束水下巡检后，数据移交至分析平台！工作台集成 FBDPN-SwinT 算法检测成果，展现<strong>海参、海胆、海星、扇贝</strong>高精定位框。
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              支持双图卷帘对比、超高清局部缩放与多目标标注交互，达工业级标注工具水准。
            </p>
          </div>
        ),
        target: getTarget('tour-review-workbench'),
        placement: 'left',
      },
      {
        title: (
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Sliders className="w-4 h-4 text-[#34d399]" />
            <span>置信度阈值调谐与交互工具条</span>
          </div>
        ),
        description: (
          <div className="text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed pt-1">
            <p>
              拖动置信度滑块可实时过滤弱置信目标；支持画框新增、类别修改、单图全部采纳。
            </p>
            <p className="text-[11px] text-[#38bdf8] font-mono">
              支持快捷键：[Space] 漫游画布 / [Ctrl+Z] 撤销纠偏 / [Del] 删除误检。
            </p>
          </div>
        ),
        target: getTarget('tour-threshold-slider'),
        placement: 'bottom',
      },
      {
        title: (
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <FileText className="w-4 h-4 text-[#34d399]" />
            <span>宏观生态统计与专业成果报告</span>
          </div>
        ),
        description: (
          <div className="text-xs text-[#cbd5e1] space-y-1.5 leading-relaxed pt-1">
            <p>
              系统自动汇总海床样区各物种丰度占比、香农多样性指数与生物量估算，生成符合国家渔业与海洋生态规范的<strong>评估成果报告</strong>，并支持一键打印与 PDF 导出。
            </p>
            <div className="text-[11px] text-[#10b981] bg-[rgba(16,185,129,0.15)] p-1.5 rounded border border-[rgba(16,185,129,0.3)] flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
              <span>恭喜！您已掌握海析智曈双平台系统软硬件闭环全流程。</span>
            </div>
          </div>
        ),
        target: getTarget('tour-report-export'),
        placement: 'bottomLeft',
      },
    ],
    []
  );

  // Shore Cockpit Specific Tour Steps (6 Steps)
  const shoreSteps: TourProps['steps'] = useMemo(
    () => [
      {
        title: 'ROV 岸端地面控制台定位',
        description: '专为水下飞手设计的高可靠工业控制台，集成了 L0 安全防御、MAVLink 遥测、实时光电监控与硬件抓拍。',
        target: getTarget('tour-brand-header'),
        placement: 'bottomLeft',
      },
      {
        title: 'L0 工业安全监控防线',
        description: '监测动力母线供电 (4S 16.8V)、系留光缆绝缘阻抗与水密舱防渗漏探头。',
        target: getTarget('tour-safety-bar'),
        placement: 'bottom',
      },
      {
        title: '实时工业遥测与安全急停',
        description: '显示下潜深度、罗盘航向与光缆延迟，右侧常驻推进器紧急停机按钮。',
        target: getTarget('tour-telemetry-safety'),
        placement: 'bottomRight',
      },
      {
        title: '样点规划序列与微环境传感器',
        description: 'S01~S03 样点航线规划，同步监控海水温度、浑浊度、流速与能见度。',
        target: getTarget('tour-sample-sites'),
        placement: 'right',
      },
      {
        title: '光电监控流 HUD 与三维姿态仪',
        description: '纯净 RTSP 水下监控流，叠加战机级 HUD 抬头显示与 6 通道推进器矢量解算。',
        target: getTarget('tour-video-hud'),
        placement: 'left',
      },
      {
        title: '定点抓拍与智能探照灯补光复拍',
        description: '飞手点击定点抓拍；遇暗区欠曝系统自动触发 85% 强光复拍决策与前后效果对比。',
        target: getTarget('tour-capture-actions'),
        placement: 'top',
      },
    ],
    []
  );

  // Analysis Platform Specific Tour Steps (4 Steps)
  const analysisSteps: TourProps['steps'] = useMemo(
    () => [
      {
        title: 'FBDPN 智能生态分析平台',
        description: '接收 ROV 移交的水下样点切片，提供基于 Swin-T 骨干的高精海床生物目标检测与生态评估。',
        target: getTarget('tour-platform-switcher'),
        placement: 'bottom',
      },
      {
        title: 'CVAT 级多目标人工复核工作台',
        description: '直观审查海参、海胆、海星、扇贝定位框，支持多倍率缩放、双图对比与平移漫游。',
        target: getTarget('tour-review-workbench'),
        placement: 'left',
      },
      {
        title: '置信度阈值调谐与标注工具箱',
        description: '滑动动态调整过滤门限 (0.1~0.9)，支持手动画框标注与 Ctrl+Z 历史撤销。',
        target: getTarget('tour-threshold-slider'),
        placement: 'bottom',
      },
      {
        title: '生态多样性评估与成果报告',
        description: '物种丰度统计与香农多样性指数自动计算，一键出具生态调查分析成果报告。',
        target: getTarget('tour-report-export'),
        placement: 'bottomLeft',
      },
    ],
    []
  );

  const activeSteps = useMemo(() => {
    if (tourMode === 'shore') return shoreSteps;
    if (tourMode === 'analysis') return analysisSteps;
    return fullSteps;
  }, [tourMode, fullSteps, shoreSteps, analysisSteps]);

  // When tour starts, ensure correct starting platform
  useEffect(() => {
    if (isTourOpen) {
      if (tourMode === 'full' || tourMode === 'shore') {
        setPlatformMode('shore');
        setShoreTab('cockpit');
      } else if (tourMode === 'analysis') {
        setPlatformMode('analysis');
        setAnalysisTab('workbench');
      }
    }
  }, [isTourOpen, tourMode, setPlatformMode, setShoreTab, setAnalysisTab]);

  return (
    <Tour
      open={isTourOpen}
      current={currentStep}
      onClose={closeTour}
      onChange={handleStepChange}
      steps={activeSteps}
      mask={{
        style: {
          boxShadow: 'inset 0 0 15px rgba(14, 165, 233, 0.35)',
        },
        color: 'rgba(7, 13, 23, 0.78)',
      }}
      rootClassName="haixi-custom-tour"
    />
  );
};
