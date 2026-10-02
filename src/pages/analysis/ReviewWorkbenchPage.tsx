import React, { useState, useRef, useEffect } from 'react';
import { useMissionStore } from '../../stores/missionStore';
import { getAssetUrl } from '../../utils/assetUrl';
import { MarineCategory, DetectionBox } from '../../types';
import confetti from 'canvas-confetti';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Trash2,
  CheckCircle,
  PlusSquare,
  Sparkles,
  Layers,
  Eye,
  EyeOff,
  Sliders,
  Split,
  Tag as TagIcon,
  MousePointer,
  RotateCcw,
  Lock,
  Unlock,
  Crosshair,
  Hand,
  Check,
  CheckCheck,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Button, Slider, Tooltip, message, Radio, Tabs } from 'antd';

export const ReviewWorkbenchPage: React.FC = () => {
  const {
    images,
    activeImageId,
    setActiveImage,
    selectedDetectionId,
    selectDetection,
    updateDetectionCategory,
    updateDetectionBox,
    addDetectionBox,
    deleteDetectionBox,
    confirmDetection,
    confirmAllInImage,
    undoReview,
    redoReview,
    history,
    future,
    modelConfig,
    setModelThreshold,
    setPlatformMode,
    setShoreTab,
    loadFullDemoDataset,
  } = useMissionStore();

  const [queueFilter, setQueueFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<'select' | 'draw' | 'pan'>('select');
  const [compareSplit, setCompareSplit] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [hiddenDetectionIds, setHiddenDetectionIds] = useState<string[]>([]);
  const [lockedDetectionIds, setLockedDetectionIds] = useState<string[]>([]);
  const [rightTab, setRightTab] = useState<'objects' | 'inspector'>('objects');
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [queueCollapsed, setQueueCollapsed] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const activeImg = images.find((i) => i.id === activeImageId) || images[0];

  const filteredQueue = images.filter((img) => {
    if (queueFilter === 'pending') return img.status === 'needs_review' || img.siteId === 'S03';
    if (queueFilter === 'done') return img.status === 'reviewed';
    return true;
  });

  const visibleDetections = (activeImg?.detections || []).filter((d) => {
    if (d.source === 'manual_added' || d.source === 'manual_edited') return true;
    return d.confidence >= modelConfig.confidenceThreshold;
  });

  const selectedDetection = activeImg?.detections.find((d) => d.id === selectedDetectionId);

  // Dynamic Fit to screen handler
  const fitToScreen = React.useCallback(() => {
    if (containerRef.current) {
      const cw = containerRef.current.clientWidth - 28;
      const ch = containerRef.current.clientHeight - 28;
      if (cw > 100 && ch > 100) {
        const fitScale = Math.min(cw / 1920, ch / 1080);
        setScale(Number(Math.max(0.2, fitScale).toFixed(3)));
        setPan({ x: 0, y: 0 });
      }
    }
  }, []);

  // Zoom handlers
  const handleZoomIn = () => setScale((prev) => Math.min(Number((prev * 1.25).toFixed(3)), 4));
  const handleZoomOut = () => setScale((prev) => Math.max(Number((prev / 1.25).toFixed(3)), 0.2));
  const handleResetZoom = () => {
    fitToScreen();
    message.info('已自适应画布最佳显示比例');
  };

  // Auto fit on mount and whenever drawers are expanded or collapsed
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToScreen();
    }, 80);
    return () => clearTimeout(timer);
  }, [queueCollapsed, inspectorCollapsed, fitToScreen]);

  useEffect(() => {
    const handleResize = () => fitToScreen();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitToScreen]);

  // Keyboard shortcut listeners (1-4 change class, Del delete, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === '1') {
        if (selectedDetection && activeImg) {
          updateDetectionCategory(activeImg.id, selectedDetection.id, '海胆');
          message.success('已切换为：海胆 [1]');
        }
      } else if (e.key === '2') {
        if (selectedDetection && activeImg) {
          updateDetectionCategory(activeImg.id, selectedDetection.id, '海参');
          message.success('已切换为：海参 [2]');
        }
      } else if (e.key === '3') {
        if (selectedDetection && activeImg) {
          updateDetectionCategory(activeImg.id, selectedDetection.id, '扇贝');
          message.success('已切换为：扇贝 [3]');
        }
      } else if (e.key === '4') {
        if (selectedDetection && activeImg) {
          updateDetectionCategory(activeImg.id, selectedDetection.id, '海星');
          message.success('已切换为：海星 [4]');
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDetection && activeImg) {
          deleteDetectionBox(activeImg.id, selectedDetection.id);
          selectDetection(null);
          message.info('已剔除选中的检测框');
        }
      } else if (e.key.toLowerCase() === 'b') {
        setMode('draw');
        message.info('已切换至补框模式 (B)');
      } else if (e.key.toLowerCase() === 'v') {
        setMode('select');
        message.info('已切换至选择模式 (V)');
      } else if (e.key.toLowerCase() === 'c') {
        setCompareSplit((prev) => !prev);
      } else if (e.key === 'Enter') {
        if (activeImg) {
          confirmAllInImage(activeImg.id);
          confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
          message.success('整幅影像复核完成并已提交！');
        }
      } else if (e.ctrlKey && e.key === 'z') {
        undoReview();
        message.info('已撤销上一步操作');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDetection, activeImg, updateDetectionCategory, deleteDetectionBox, confirmAllInImage, undoReview]);

  // Canvas Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode === 'draw') {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 1920;
      const y = ((e.clientY - rect.top) / rect.height) * 1080;
      setIsDrawing(true);
      setDrawStart({ x, y });
      setDrawCurrent({ x, y });
    } else {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 1920);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 1080);
      setMouseCoord({ x, y });
    }

    if (isDrawing && drawStart && svgRef.current) {
      if (!rect) return;
      const x = Math.max(0, Math.min(1920, ((e.clientX - rect.left) / rect.width) * 1920));
      const y = Math.max(0, Math.min(1080, ((e.clientY - rect.top) / rect.height) * 1080));
      setDrawCurrent({ x, y });
    } else if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && drawStart && drawCurrent) {
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);
      const w = Math.abs(drawCurrent.x - drawStart.x);
      const h = Math.abs(drawCurrent.y - drawStart.y);

      if (w > 20 && h > 20 && activeImg) {
        addDetectionBox(activeImg.id, [Math.round(x), Math.round(y), Math.round(w), Math.round(h)], '海胆');
        message.success('人工补录目标成功 (默认类别：海胆，按 1-4 随时修改)');
        setRightTab('inspector');
      }
      setIsDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
      setMode('select');
    } else if (isPanning) {
      setIsPanning(false);
    }
  };

  const handleVerifyAll = () => {
    if (activeImg) {
      confirmAllInImage(activeImg.id);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      message.success('当前图像全部目标已通过人工复核确认！数据已同步至普查统计。');
    }
  };

  const toggleHideDetection = (id: string) => {
    setHiddenDetectionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleLockDetection = (id: string) => {
    setLockedDetectionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case '海胆': return '#38bdf8';
      case '海参': return '#f59e0b';
      case '扇贝': return '#10b981';
      case '海星': return '#fb7185';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="w-full h-full flex p-2 gap-2 overflow-hidden bg-[#070d17] select-none text-xs">
      {/* 1. CV TOOL RAIL (CVAT-grade 46px compact toolbar) */}
      <div className="w-[46px] h-full bg-[#0b1523] border border-[rgba(148,163,184,0.14)] rounded flex flex-col items-center py-2.5 gap-2 shrink-0">
        <Tooltip title="选择模式 (快捷键: V)" placement="right">
          <button
            onClick={() => setMode('select')}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              mode === 'select'
                ? 'bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.4)]'
                : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <MousePointer className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip title="补录矩形框 (快捷键: B)" placement="right">
          <button
            onClick={() => setMode('draw')}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              mode === 'draw'
                ? 'bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.4)]'
                : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <PlusSquare className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip title="抓手平移视口 (快捷键: H)" placement="right">
          <button
            onClick={() => setMode('pan')}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              mode === 'pan'
                ? 'bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.4)]'
                : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <Hand className="w-4 h-4" />
          </button>
        </Tooltip>

        <span className="w-5 h-[1px] bg-[rgba(148,163,184,0.15)] my-0.5" />

        <Tooltip title="双目/前后对比分屏 (快捷键: C)" placement="right">
          <button
            onClick={() => setCompareSplit(!compareSplit)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              compareSplit
                ? 'bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.4)]'
                : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <Split className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip title="十字准星标尺" placement="right">
          <button
            onClick={() => setShowCrosshair(!showCrosshair)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              showCrosshair
                ? 'bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.4)]'
                : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip title={queueCollapsed && inspectorCollapsed ? "退出巨幕模式 (恢复标准工作台布局)" : "开启巨幕全景模式 (最大化画布屏幕占比)"} placement="right">
          <button
            onClick={() => {
              const target = !(queueCollapsed && inspectorCollapsed);
              setQueueCollapsed(target);
              setInspectorCollapsed(target);
              message.info(target ? '已开启巨幕全景模式 (画布已最大化)' : '已恢复标准工作台布局');
            }}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              queueCollapsed && inspectorCollapsed
                ? 'bg-[#0ea5e9] text-white shadow-[0_0_12px_#38bdf8]'
                : 'text-[#64748b] hover:text-[#f1f5f9]'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip title="画布重置 100% (Fit)" placement="right">
          <button
            onClick={handleResetZoom}
            className="w-8 h-8 rounded flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </Tooltip>

        <span className="w-5 h-[1px] bg-[rgba(148,163,184,0.15)] my-0.5" />

        <Tooltip title="放大" placement="right">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] transition-all"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </Tooltip>

        <Tooltip title="缩小" placement="right">
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] transition-all"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {/* 2. IMAGE QUEUE DRAWER (Collapsible, w-[240px] or w-9) */}
      {queueCollapsed ? (
        <div
          onClick={() => setQueueCollapsed(false)}
          className="w-9 h-full cockpit-panel flex flex-col items-center justify-between py-3 px-1 cursor-pointer hover:border-[rgba(14,165,233,0.5)] text-[#94a3b8] hover:text-[#38bdf8] transition-all shrink-0 bg-[#0b1523] shadow-sm"
          title="点击展开待复核影像队列"
        >
          <Layers className="w-4 h-4 text-[#38bdf8]" />
          <span className="[writing-mode:vertical-lr] text-xs font-bold tracking-widest text-[#cbd5e1] my-auto py-2">
            待审队列 ({filteredQueue.length})
          </span>
          <ChevronRight className="w-4 h-4 text-[#38bdf8]" />
        </div>
      ) : (
        <div className="w-[240px] h-full cockpit-panel p-2.5 flex flex-col shrink-0 hud-corner">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[rgba(148,163,184,0.18)]">
            <span className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
              待复核影像队列
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#64748b] font-mono font-medium">{filteredQueue.length} 帧</span>
              <Tooltip title="收起列表，为画布腾出更大屏幕占比">
                <button
                  onClick={() => setQueueCollapsed(true)}
                  className="p-1 rounded hover:bg-[#12233b] text-[#64748b] hover:text-[#38bdf8] transition-all ml-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 mb-2 bg-[#070d17] p-0.5 rounded border border-[rgba(148,163,184,0.12)]">
          <button
            onClick={() => setQueueFilter('all')}
            className={`flex-1 py-1 rounded text-[10px] font-mono text-center transition-all ${
              queueFilter === 'all' ? 'bg-[#12233b] text-[#38bdf8] font-medium' : 'text-[#64748b]'
            }`}
          >
            全部 ({images.length})
          </button>
          <button
            onClick={() => setQueueFilter('pending')}
            className={`flex-1 py-1 rounded text-[10px] font-mono text-center transition-all ${
              queueFilter === 'pending' ? 'bg-[#12233b] text-[#f59e0b] font-medium' : 'text-[#64748b]'
            }`}
          >
            待核
          </button>
          <button
            onClick={() => setQueueFilter('done')}
            className={`flex-1 py-1 rounded text-[10px] font-mono text-center transition-all ${
              queueFilter === 'done' ? 'bg-[#12233b] text-[#10b981] font-medium' : 'text-[#64748b]'
            }`}
          >
            已审
          </button>
        </div>

        {/* Image Card List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
          {filteredQueue.map((img) => {
            const isSelected = img.id === activeImageId;
            const unreviewedCount = img.detections.filter((d) => d.reviewStatus === 'unreviewed').length;
            return (
              <div
                key={img.id}
                onClick={() => {
                  setActiveImage(img.id);
                  selectDetection(null);
                }}
                className={`p-2 rounded border cursor-pointer transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#12233b] border-[rgba(14,165,233,0.4)]'
                    : 'bg-[#070d17] border-[rgba(148,163,184,0.1)] hover:border-[rgba(148,163,184,0.2)]'
                }`}
              >
                <img
                  src={getAssetUrl(img.url)}
                  alt={img.filename}
                  className="w-14 h-10 object-cover rounded border border-[rgba(148,163,184,0.15)] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-[11px] font-mono">{img.siteId} 样点</span>
                    {unreviewedCount > 0 ? (
                      <span className="text-[9px] px-1 rounded bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)]">
                        {unreviewedCount} 待审
                      </span>
                    ) : (
                      <span className="text-[9px] px-1 rounded bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.3)]">
                        已通过
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] mt-0.5 font-mono flex items-center justify-between">
                    <span>目标: {img.detections.length} 处</span>
                    <span className="text-[#64748b]">{img.isRecapture ? '复拍' : ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* 3. CENTER COLUMN: HIGH-PRECISION CANAVS WORKSPACE (flex-1) */}
      <div className="flex-1 h-full flex flex-col cockpit-panel overflow-hidden relative">
        {/* Canvas Toolbar Header */}
        <div className="h-10 bg-[#0b1523] border-b border-[rgba(148,163,184,0.14)] px-3 flex items-center justify-between shrink-0 font-mono text-[11px]">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium flex items-center gap-1.5">
              <span className="text-[#38bdf8] font-bold">{activeImg?.siteId}</span>
              <span className="text-[#64748b]">/</span>
              <span className="text-[#cbd5e1]">{activeImg?.filename}</span>
            </span>
            <span className="text-[#334155]">|</span>
            <span className="text-[#64748b]">分辨率: 1920×1080</span>
            <span className="text-[#334155]">|</span>
            <span className="text-[#94a3b8]">缩放: {Math.round(scale * 100)}%</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Undo / Redo */}
            <Tooltip title="撤销 (Ctrl+Z)">
              <button
                onClick={undoReview}
                disabled={history.length === 0}
                className="p-1 text-[#94a3b8] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip title="重做">
              <button
                onClick={redoReview}
                disabled={future.length === 0}
                className="p-1 text-[#94a3b8] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>

            <span className="text-[#334155]">|</span>

            {/* Confidence Threshold Quick Slider */}
            <div className="flex items-center gap-1.5 text-[#94a3b8] text-[10px]">
              <span>置信度过滤:</span>
              <Slider
                min={0.3}
                max={0.9}
                step={0.05}
                value={modelConfig.confidenceThreshold}
                onChange={(val) => setModelThreshold(val)}
                className="w-16 my-0"
              />
              <span className="text-white font-mono">{(modelConfig.confidenceThreshold * 100).toFixed(0)}%</span>
            </div>

            <span className="text-[#334155]">|</span>

            {/* Giant Canvas Mode Toggle Button */}
            <Tooltip title={queueCollapsed && inspectorCollapsed ? "退出巨幕模式 (恢复两侧面板)" : "开启巨幕全景模式 (收起两侧抽屉，最大化画布)"}>
              <button
                onClick={() => {
                  const target = !(queueCollapsed && inspectorCollapsed);
                  setQueueCollapsed(target);
                  setInspectorCollapsed(target);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 border transition-all ${
                  queueCollapsed && inspectorCollapsed
                    ? 'bg-[#0ea5e9] text-white border-[#38bdf8] shadow-[0_0_10px_rgba(14,165,233,0.5)]'
                    : 'bg-[#12233b] text-[#cbd5e1] hover:text-[#38bdf8] border-[rgba(148,163,184,0.25)] hover:border-[rgba(14,165,233,0.4)]'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{queueCollapsed && inspectorCollapsed ? '退出巨幕' : '巨幕全景模式'}</span>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Viewport Canvas Body */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`flex-1 relative overflow-hidden bg-[#050b14] flex items-center justify-center ${
            mode === 'draw' ? 'cursor-crosshair' : mode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          }`}
        >
          {/* Scalable & Pannable Viewport Group */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isPanning || isDrawing ? 'none' : 'transform 0.15s ease-out',
            }}
            className="relative w-[1920px] h-[1080px] shrink-0"
          >
            {/* Background Image or Empty State */}
            {activeImg ? (
              <img
                src={getAssetUrl(activeImg.url)}
                alt="Workbench Canvas"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#070d17]/95 z-30">
                <div className="w-16 h-16 rounded-full bg-[#12233b] border border-[rgba(14,165,233,0.3)] flex items-center justify-center text-[#38bdf8] mb-4">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white">暂无待复核切片数据</h3>
                <p className="text-xs text-[#94a3b8] max-w-md mt-1.5 leading-relaxed">
                  当前尚未在 ROV 岸端控制地面站完成水下样点抓拍或移交。您可以亲自操控下潜抓拍，或者直接装填 12 帧海床全套示范数据：
                </p>
                <div className="flex items-center gap-3 mt-5 font-medium">
                  <button
                    onClick={() => {
                      setPlatformMode('shore');
                      setShoreTab('cockpit');
                    }}
                    className="px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded text-xs transition-all shadow-sm active:scale-95"
                  >
                    前往 ROV 驾驶舱操控抓拍
                  </button>
                  <button
                    onClick={() => loadFullDemoDataset()}
                    className="px-4 py-2 bg-[#12233b] hover:bg-[#1a365d] text-[#38bdf8] border border-[rgba(14,165,233,0.35)] rounded text-xs transition-all active:scale-95"
                  >
                    一键装填 12 帧示范成果
                  </button>
                </div>
              </div>
            )}

            {/* Split Comparison Slider (if active) */}
            {compareSplit && activeImg && (
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${splitPos}%`, borderRight: '2px solid #38bdf8' }}
              >
                <img
                  src={getAssetUrl('/samples/urpc/000_000007.jpg')}
                  alt="Original Raw Underexposed"
                  className="w-[1920px] h-[1080px] max-w-none object-contain filter contrast-75 brightness-75"
                />
                <div className="absolute top-4 left-4 bg-black/80 px-2 py-1 text-xs text-[#f59e0b] font-mono rounded">
                  [对比视角] 原始未增强/欠曝底海图
                </div>
              </div>
            )}

            {/* SVG Bounding Boxes Overlay */}
            <svg
              ref={svgRef}
              viewBox="0 0 1920 1080"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {visibleDetections.map((d) => {
                if (hiddenDetectionIds.includes(d.id)) return null;

                const [x, y, w, h] = d.box;
                const isSelected = d.id === selectedDetectionId;
                const color = getCategoryColor(d.category);

                return (
                  <g
                    key={d.id}
                    className="pointer-events-auto cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectDetection(d.id);
                      setRightTab('inspector');
                    }}
                  >
                    {/* Bounding Box Rect */}
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={isSelected ? `${color}20` : 'transparent'}
                      stroke={color}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Corner Handles if selected */}
                    {isSelected && (
                      <>
                        <circle cx={x} cy={y} r="4" fill="#ffffff" stroke={color} strokeWidth="1.5" />
                        <circle cx={x + w} cy={y} r="4" fill="#ffffff" stroke={color} strokeWidth="1.5" />
                        <circle cx={x} cy={y + h} r="4" fill="#ffffff" stroke={color} strokeWidth="1.5" />
                        <circle cx={x + w} cy={y + h} r="4" fill="#ffffff" stroke={color} strokeWidth="1.5" />
                      </>
                    )}

                    {/* Tag Label Pill */}
                    <rect
                      x={x}
                      y={Math.max(0, y - 26)}
                      width={Math.max(98, w * 0.7)}
                      height="24"
                      fill="rgba(11, 21, 35, 0.96)"
                      stroke={color}
                      strokeWidth="1.2"
                      rx="4"
                    />
                    <text
                      x={x + 7}
                      y={Math.max(18, y - 9)}
                      fill="#f8fafc"
                      fontSize="14"
                      fontWeight="700"
                      fontFamily="sans-serif"
                    >
                      {d.category}
                    </text>
                    <text
                      x={x + 48}
                      y={Math.max(18, y - 9)}
                      fill={color}
                      fontSize="12"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      {(d.confidence * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {/* In-progress drawing preview box */}
              {isDrawing && drawStart && drawCurrent && (
                <rect
                  x={Math.min(drawStart.x, drawCurrent.x)}
                  y={Math.min(drawStart.y, drawCurrent.y)}
                  width={Math.abs(drawCurrent.x - drawStart.x)}
                  height={Math.abs(drawCurrent.y - drawStart.y)}
                  fill="rgba(14, 165, 233, 0.2)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
              )}
            </svg>
          </div>

          {/* Full-bleed Crosshairs (if enabled) */}
          {showCrosshair && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-x-0 h-[1px] bg-[#38bdf8]/40"
                style={{ top: `${((mouseCoord.y / 1080) * 100)}%` }}
              />
              <div
                className="absolute inset-y-0 w-[1px] bg-[#38bdf8]/40"
                style={{ left: `${((mouseCoord.x / 1920) * 100)}%` }}
              />
            </div>
          )}

          {/* Bottom Canvas Status Overlay */}
          <div className="absolute bottom-2 left-3 bg-[#0b1523]/90 backdrop-blur px-3 py-1 rounded text-[11px] text-[#94a3b8] font-mono border border-[rgba(148,163,184,0.15)] pointer-events-none flex items-center gap-3">
            <span>光标: X: {mouseCoord.x} Y: {mouseCoord.y}</span>
            <span className="text-[#475569]">|</span>
            <span>快捷键: 1-4 改类 / Del 删框 / B 补框 / Enter 确认整图</span>
          </div>

          {/* Split Screen Slider Controller (if compare active) */}
          {compareSplit && (
            <div className="absolute bottom-4 inset-x-1/4 bg-[#0b1523]/90 px-4 py-2 rounded-full border border-[rgba(148,163,184,0.2)] flex items-center gap-3">
              <span className="text-[#f59e0b] font-mono text-[11px]">欠曝原图</span>
              <Slider
                min={0}
                max={100}
                value={splitPos}
                onChange={(val) => setSplitPos(val)}
                className="flex-1 my-0"
              />
              <span className="text-[#38bdf8] font-mono text-[11px]">FBDPN 增强图</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. RIGHT COLUMN: OBJECTS TREE & INSPECTOR (Collapsible, w-[325px] or w-9) */}
      {inspectorCollapsed ? (
        <div
          onClick={() => setInspectorCollapsed(false)}
          className="w-9 h-full cockpit-panel flex flex-col items-center justify-between py-3 px-1 cursor-pointer hover:border-[rgba(14,165,233,0.5)] text-[#94a3b8] hover:text-[#38bdf8] transition-all shrink-0 bg-[#0b1523] shadow-sm"
          title="点击展开属性与图层检查器"
        >
          <Sliders className="w-4 h-4 text-[#38bdf8]" />
          <span className="[writing-mode:vertical-lr] text-xs font-bold tracking-widest text-[#cbd5e1] my-auto py-2">
            图层属性 ({visibleDetections.length})
          </span>
          <ChevronLeft className="w-4 h-4 text-[#38bdf8]" />
        </div>
      ) : (
        <div className="w-[325px] h-full cockpit-panel p-2.5 flex flex-col shrink-0 justify-between hud-corner">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header Switcher Tabs with Collapse Button */}
            <div className="flex items-center gap-1 pb-2 border-b border-[rgba(148,163,184,0.18)] mb-2">
              <button
                onClick={() => setRightTab('objects')}
                className={`flex-1 py-1 rounded text-xs font-semibold text-center transition-all ${
                  rightTab === 'objects'
                    ? 'bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.4)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                图层对象 ({visibleDetections.length})
              </button>
              <button
                onClick={() => setRightTab('inspector')}
                className={`flex-1 py-1 rounded text-xs font-semibold text-center transition-all ${
                  rightTab === 'inspector'
                    ? 'bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.4)]'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                属性检查器
              </button>
              <Tooltip title="收起属性栏，为画布腾出更大屏幕占比">
                <button
                  onClick={() => setInspectorCollapsed(true)}
                  className="p-1 rounded hover:bg-[#12233b] text-[#64748b] hover:text-[#38bdf8] transition-all ml-1"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>

          {/* Tab 1: Objects Tree */}
          {rightTab === 'objects' ? (
            <div className="flex-1 overflow-y-auto space-y-1 pr-0.5 font-mono text-xs">
              {visibleDetections.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-[#64748b]">
                  当前画面无目标或低于门限
                </div>
              ) : (
                visibleDetections.map((d, index) => {
                  const isSelected = d.id === selectedDetectionId;
                  const isHidden = hiddenDetectionIds.includes(d.id);
                  const isLocked = lockedDetectionIds.includes(d.id);
                  const color = getCategoryColor(d.category);

                  return (
                    <div
                      key={d.id}
                      onClick={() => selectDetection(d.id)}
                      className={`p-1.5 rounded border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#12233b] border-[rgba(14,165,233,0.4)]'
                          : 'bg-[#070d17] border-[rgba(148,163,184,0.1)] hover:border-[rgba(148,163,184,0.2)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* Eye Visibility Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHideDetection(d.id);
                          }}
                          className={`p-0.5 rounded ${isHidden ? 'text-[#64748b]' : 'text-[#38bdf8]'}`}
                        >
                          {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        {/* Category Badge */}
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${color}18`,
                            color: color,
                            border: `1px solid ${color}40`,
                          }}
                        >
                          #{index + 1} {d.category}
                        </span>

                        <span className="text-[10px] text-white">
                          {(d.confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] px-1 rounded bg-[#0b1523] text-[#64748b] border border-[rgba(148,163,184,0.12)]">
                          {d.source === 'manual_added' ? '补录' : d.source === 'manual_edited' ? '已改' : '模型'}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLockDetection(d.id);
                          }}
                          className={`p-0.5 rounded ${isLocked ? 'text-[#f59e0b]' : 'text-[#475569]'}`}
                        >
                          {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Tab 2: Property Inspector */
            <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-xs pr-0.5">
              {selectedDetection ? (
                <>
                  {/* Selected Target Header */}
                  <div className="bg-[#070d17] p-2 rounded border border-[rgba(148,163,184,0.12)] flex items-center justify-between">
                    <div>
                      <div className="text-[#64748b] text-[10px]">物标实例编号</div>
                      <div className="text-white font-bold">{selectedDetection.id}</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#12233b] text-[#38bdf8] border border-[rgba(14,165,233,0.3)]">
                      {selectedDetection.source === 'manual_added'
                        ? '人工补录'
                        : selectedDetection.source === 'manual_edited'
                        ? '专家修正'
                        : '模型预测'}
                    </span>
                  </div>

                  {/* One-Click Category Buttons (1-4 Hotkeys) */}
                  <div className="bg-[#070d17] p-2 rounded border border-[rgba(148,163,184,0.12)]">
                    <div className="text-[#64748b] text-[10px] mb-1.5 flex items-center justify-between">
                      <span>快捷改类 (按键盘 1-4 秒切)</span>
                      <span className="text-[#38bdf8]">HOTKEYS READY</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { key: '1', name: '海胆', color: '#38bdf8' },
                        { key: '2', name: '海参', color: '#f59e0b' },
                        { key: '3', name: '扇贝', color: '#10b981' },
                        { key: '4', name: '海星', color: '#fb7185' },
                      ].map((item) => {
                        const isCurrent = selectedDetection.category === item.name;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              if (activeImg) {
                                updateDetectionCategory(activeImg.id, selectedDetection.id, item.name as MarineCategory);
                                message.success(`已切换类别为：${item.name}`);
                              }
                            }}
                            className={`p-1.5 rounded flex items-center justify-between border transition-all ${
                              isCurrent
                                ? 'bg-[#12233b] font-bold text-white shadow-sm'
                                : 'bg-[#0b1523] text-[#94a3b8] hover:text-white'
                            }`}
                            style={{
                              borderColor: isCurrent ? item.color : 'rgba(148, 163, 184, 0.12)',
                            }}
                          >
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </span>
                            <span className="text-[10px] px-1 rounded bg-[#070d17] text-[#64748b] font-mono">
                              [{item.key}]
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="bg-[#070d17] p-2 rounded border border-[rgba(148,163,184,0.12)]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#64748b]">置信度评分:</span>
                      <span className="text-white font-bold">
                        {(selectedDetection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#050b14] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0ea5e9]"
                        style={{ width: `${selectedDetection.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Pixel BBox Coordinates */}
                  <div className="bg-[#070d17] p-2 rounded border border-[rgba(148,163,184,0.12)]">
                    <div className="text-[#64748b] text-[10px] mb-1">空间像素坐标 [X, Y, W, H]</div>
                    <div className="grid grid-cols-4 gap-1 text-center text-white font-mono text-[10px]">
                      <div>X: {Math.round(selectedDetection.box[0])}</div>
                      <div>Y: {Math.round(selectedDetection.box[1])}</div>
                      <div>W: {Math.round(selectedDetection.box[2])}</div>
                      <div>H: {Math.round(selectedDetection.box[3])}</div>
                    </div>
                  </div>

                  {/* Single Box Confirmation & Deletion */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => {
                        if (activeImg) {
                          confirmDetection(activeImg.id, selectedDetection.id);
                          message.success('已确认该物标复核无误');
                        }
                      }}
                      className="w-full py-1.5 bg-[#10b981] hover:bg-[#059669] text-white rounded font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      确认该物标无误
                    </button>

                    <button
                      onClick={() => {
                        if (activeImg) {
                          deleteDetectionBox(activeImg.id, selectedDetection.id);
                          selectDetection(null);
                          message.info('已剔除误检目标 (Delete)');
                        }
                      }}
                      className="w-full py-1.5 bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.22)] text-[#ef4444] border border-[rgba(239,68,68,0.3)] rounded font-medium flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      剔除误检目标 (Del)
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center text-[#64748b] p-4 bg-[#070d17] rounded border border-[rgba(148,163,184,0.08)]">
                  <MousePointer className="w-7 h-7 text-[#64748b] opacity-40 mb-2" />
                  <div>请在左侧对象列表或画布中点击选中目标框，或按 B 键拉选新目标</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Verify All Action */}
        <div className="pt-2 border-t border-[rgba(148,163,184,0.14)] space-y-1.5">
          <button
            onClick={handleVerifyAll}
            className="w-full py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium rounded flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            整图复核确认通过 (Enter)
          </button>
          <div className="text-[10px] text-center text-[#64748b]">
            审核确认后，结果自动回流并更新普查统计
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
