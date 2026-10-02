import { create } from 'zustand';
import {
  PlatformMode,
  ShoreTab,
  AnalysisTab,
  Mission,
  CapturedImage,
  TelemetryData,
  Thruster,
  ControlCommand,
  SelfCheckItem,
  ModelConfig,
  MarineCategory,
  DetectionBox,
  InferenceState,
  MotionState,
  MotionDirection,
} from '../types';
import {
  INITIAL_MISSION,
  INITIAL_IMAGES,
  INITIAL_TELEMETRY,
  INITIAL_THRUSTERS,
  SELF_CHECK_ITEMS,
  DEFAULT_MODEL_CONFIG,
} from '../constants/mockData';
import { getAssetUrl } from '../utils/assetUrl';

interface MissionState {
  platformMode: PlatformMode;
  shoreTab: ShoreTab;
  analysisTab: AnalysisTab;
  mission: Mission;
  images: CapturedImage[];
  telemetry: TelemetryData;
  thrusters: Thruster[];
  commands: ControlCommand[];
  selfCheckItems: SelfCheckItem[];
  selfCheckRunning: boolean;
  selfCheckProgress: number;
  modelConfig: ModelConfig;

  // AI Inference & Lifecycle Pipeline
  inferenceState: InferenceState;
  inferenceProgress: number;
  inferenceLogs: string[];
  captureFlash: boolean;
  hasNewAnalysisData: boolean;

  // Selected state
  activeImageId: string;
  selectedDetectionId: string | null;

  // Recapture workflow
  recaptureModalOpen: boolean;
  recaptureStep: 'prompt' | 'executing' | 'compare';
  recaptureLogs: string[];

  // Demo & recording
  demoDrawerOpen: boolean;
  isRecording: boolean;
  recordingSeconds: number;

  // Motion state & interactive 6-DOF controls
  motionState: MotionState;

  // Undo / History stack for review
  history: Array<{ images: CapturedImage[] }>;
  future: Array<{ images: CapturedImage[] }>;

  // Actions
  setPlatformMode: (mode: PlatformMode) => void;
  setShoreTab: (tab: ShoreTab) => void;
  setAnalysisTab: (tab: AnalysisTab) => void;
  triggerMotion: (direction: MotionDirection) => void;
  simulateOceanMicroDynamics: () => void;
  runModelInference: () => Promise<void>;
  clearNewAnalysisDataNotification: () => void;
  setActiveSite: (siteId: 'S01' | 'S02' | 'S03') => void;
  setActiveImage: (imageId: string) => void;
  selectDetection: (id: string | null) => void;
  updateTelemetry: (partial: Partial<TelemetryData>) => void;
  updateLight: (left: number, right: number) => void;
  toggleHold: (type: 'depth' | 'heading') => void;
  sendCommand: (type: ControlCommand['type'], params?: any, summary?: string) => Promise<string>;
  emergencyStop: () => void;
  runSelfCheck: () => Promise<void>;
  openRecaptureModal: () => void;
  closeRecaptureModal: () => void;
  executeRecapture: () => Promise<void>;
  adoptRecapturedImage: () => void;
  skipRecapture: () => void;
  captureCurrentFrame: () => void;
  toggleRecord: () => void;
  
  // Detection Annotation Actions
  updateDetectionCategory: (imageId: string, detectionId: string, newCategory: MarineCategory) => void;
  updateDetectionBox: (imageId: string, detectionId: string, newBox: [number, number, number, number]) => void;
  addDetectionBox: (imageId: string, box: [number, number, number, number], category?: MarineCategory) => void;
  deleteDetectionBox: (imageId: string, detectionId: string) => void;
  confirmDetection: (imageId: string, detectionId: string) => void;
  confirmAllInImage: (imageId: string) => void;
  undoReview: () => void;
  redoReview: () => void;

  // Workflow transitions
  handoverToAnalysis: () => void;
  loadFullDemoDataset: () => void;
  resetToCleanState: () => void;
  setModelThreshold: (confidence: number, nmsIou?: number) => void;
  resetDemo: () => void;
  jumpToStep: (stepNumber: number) => void;
  injectFault: (type: 'latency' | 'battery' | 'thruster' | 'none') => void;
  setDemoDrawerOpen: (open: boolean) => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  platformMode: 'shore',
  shoreTab: 'cockpit',
  analysisTab: 'overview',
  mission: JSON.parse(JSON.stringify(INITIAL_MISSION)),
  images: [], // Starts completely clean: 0 images! User controls ROV to capture frames!
  telemetry: { ...INITIAL_TELEMETRY },
  thrusters: JSON.parse(JSON.stringify(INITIAL_THRUSTERS)),
  commands: [
    {
      id: 'CMD-001',
      deviceId: 'ROV-S6',
      missionId: INITIAL_MISSION.id,
      type: 'telemetry',
      params: { protocol: 'MAVLink 2.0', ip: '192.168.2.2:14550' },
      timestamp: '09:20:02',
      status: 'completed',
      receiptTime: '09:20:02',
      summary: 'MAVLink 2.0 工业协议握手成功，双向心跳正常 (18ms)',
    },
    {
      id: 'CMD-002',
      deviceId: 'ROV-S6',
      missionId: INITIAL_MISSION.id,
      type: 'video',
      params: { stream: 'rtsp://192.168.2.2:8554/live', codec: 'H.264' },
      timestamp: '09:20:05',
      status: 'completed',
      receiptTime: '09:20:05',
      summary: 'RTSP 水下星光级主相机拉流锁存：1080P@30fps (4.2Mbps)',
    },
    {
      id: 'CMD-003',
      deviceId: 'ROV-S6',
      missionId: INITIAL_MISSION.id,
      type: 'hold',
      params: { depthHold: true, headingHold: true },
      timestamp: '09:20:10',
      status: 'completed',
      receiptTime: '09:20:10',
      summary: '水下姿态解算完成，切入定深定速巡航模式 (DEPTH_HOLD / 8.2m)',
    },
  ],
  selfCheckItems: JSON.parse(JSON.stringify(SELF_CHECK_ITEMS)),
  selfCheckRunning: false,
  selfCheckProgress: 100,
  modelConfig: { ...DEFAULT_MODEL_CONFIG },

  // Inference pipeline (starts idle waiting for data transfer)
  inferenceState: 'idle',
  inferenceProgress: 0,
  inferenceLogs: [
    '[系统待机] FBDPN-SwinT v2.4 深度学习推理服务就绪，等待岸端巡检数据包推送...',
  ],
  captureFlash: false,
  hasNewAnalysisData: false,

  activeImageId: '', // Starts with empty active image (displaying pure optical live stream!)
  selectedDetectionId: null,

  recaptureModalOpen: false,
  recaptureStep: 'prompt',
  recaptureLogs: [],

  demoDrawerOpen: false,
  isRecording: false,
  recordingSeconds: 0,

  motionState: {
    direction: 'idle',
    surge: 0,
    sway: 0,
    heave: 0,
    yawRate: 0,
    timestamp: Date.now(),
  },

  history: [],
  future: [],

  setPlatformMode: (mode) => set({ platformMode: mode }),
  setShoreTab: (tab) => set({ shoreTab: tab }),
  setAnalysisTab: (tab) => set({ analysisTab: tab }),
  clearNewAnalysisDataNotification: () => set({ hasNewAnalysisData: false }),

  triggerMotion: (direction: MotionDirection) => {
    const { telemetry, thrusters } = get();
    let summary = '';
    let surge = 0;
    let sway = 0;
    let heave = 0;
    let yawRate = 0;

    let targetPitch = telemetry.pitch;
    let targetRoll = telemetry.roll;
    let targetHeading = telemetry.heading;
    let targetDepth = telemetry.depth;

    const activeThrusters = thrusters.map((t) => ({ ...t }));

    switch (direction) {
      case 'forward':
        summary = '全向动力控制：水平推进器组前推加速 (Surge +1.2m/s)';
        surge = 1.2;
        targetPitch = -1.8;
        activeThrusters[0].load = 82; activeThrusters[0].pwm = 1820;
        activeThrusters[1].load = 82; activeThrusters[1].pwm = 1820;
        activeThrusters[2].load = 76; activeThrusters[2].pwm = 1790;
        activeThrusters[3].load = 76; activeThrusters[3].pwm = 1790;
        break;
      case 'backward':
        summary = '全向动力控制：协同倒退后移减速 (Reverse -0.8m/s)';
        surge = -0.8;
        targetPitch = 1.5;
        activeThrusters[0].load = 72; activeThrusters[0].pwm = 1240;
        activeThrusters[1].load = 72; activeThrusters[1].pwm = 1240;
        activeThrusters[2].load = 68; activeThrusters[2].pwm = 1260;
        activeThrusters[3].load = 68; activeThrusters[3].pwm = 1260;
        break;
      case 'strafe_left':
        summary = '横向动力控制：平移左舷横移 (Sway Left -0.7m/s)';
        sway = -0.7;
        targetRoll = -1.8;
        activeThrusters[0].load = 74; activeThrusters[0].pwm = 1740;
        activeThrusters[1].load = 32; activeThrusters[1].pwm = 1350;
        activeThrusters[2].load = 70; activeThrusters[2].pwm = 1720;
        activeThrusters[3].load = 30; activeThrusters[3].pwm = 1360;
        break;
      case 'strafe_right':
        summary = '横向动力控制：平移右舷横移 (Sway Right +0.7m/s)';
        sway = 0.7;
        targetRoll = 1.8;
        activeThrusters[0].load = 32; activeThrusters[0].pwm = 1350;
        activeThrusters[1].load = 74; activeThrusters[1].pwm = 1740;
        activeThrusters[2].load = 30; activeThrusters[2].pwm = 1360;
        activeThrusters[3].load = 70; activeThrusters[3].pwm = 1720;
        break;
      case 'yaw_left':
        summary = '航向微调：左转偏航调姿 (Yaw Left -5°)';
        yawRate = -5.0;
        targetHeading = (telemetry.heading - 5 + 360) % 360;
        targetRoll = -1.2;
        activeThrusters[0].load = 78; activeThrusters[0].pwm = 1780;
        activeThrusters[1].load = 22; activeThrusters[1].pwm = 1320;
        activeThrusters[2].load = 24; activeThrusters[2].pwm = 1330;
        activeThrusters[3].load = 76; activeThrusters[3].pwm = 1770;
        break;
      case 'yaw_right':
        summary = '航向微调：右转偏航调姿 (Yaw Right +5°)';
        yawRate = 5.0;
        targetHeading = (telemetry.heading + 5) % 360;
        targetRoll = 1.2;
        activeThrusters[0].load = 22; activeThrusters[0].pwm = 1320;
        activeThrusters[1].load = 78; activeThrusters[1].pwm = 1780;
        activeThrusters[2].load = 76; activeThrusters[2].pwm = 1770;
        activeThrusters[3].load = 24; activeThrusters[3].pwm = 1330;
        break;
      case 'ascend':
        summary = '垂向控制：垂直双推协同上浮 (Heave Up -0.3m)';
        heave = -0.3;
        targetDepth = Math.max(0.5, telemetry.depth - 0.3);
        targetPitch = 1.0;
        activeThrusters[4].load = 85; activeThrusters[4].pwm = 1860;
        activeThrusters[5].load = 85; activeThrusters[5].pwm = 1860;
        break;
      case 'descend':
        summary = '垂向控制：垂直双推协同下潜 (Heave Down +0.3m)';
        heave = 0.3;
        targetDepth = telemetry.depth + 0.3;
        targetPitch = -1.0;
        activeThrusters[4].load = 82; activeThrusters[4].pwm = 1220;
        activeThrusters[5].load = 82; activeThrusters[5].pwm = 1220;
        break;
      default:
        break;
    }

    set({
      motionState: {
        direction,
        surge,
        sway,
        heave,
        yawRate,
        timestamp: Date.now(),
      },
      thrusters: activeThrusters,
      telemetry: {
        ...telemetry,
        pitch: targetPitch,
        roll: targetRoll,
        heading: targetHeading,
        depth: targetDepth,
      },
    });

    get().sendCommand('move', { direction, surge, sway, heave }, summary);

    setTimeout(() => {
      const current = get();
      if (current.motionState.timestamp <= Date.now() - 500) {
        set({
          motionState: {
            direction: 'idle',
            surge: 0,
            sway: 0,
            heave: 0,
            yawRate: 0,
            timestamp: Date.now(),
          },
          thrusters: INITIAL_THRUSTERS.map((t) => ({ ...t })),
          telemetry: {
            ...current.telemetry,
            pitch: -1.8,
            roll: 0.9,
          },
        });
      }
    }, 650);
  },

  simulateOceanMicroDynamics: () => {
    const { telemetry } = get();
    const dPitch = (Math.random() - 0.5) * 0.08;
    const dRoll = (Math.random() - 0.5) * 0.08;
    const dDepth = (Math.random() - 0.5) * 0.012;
    const dHeading = (Math.random() - 0.5) * 0.12;
    const dVolt = (Math.random() - 0.5) * 0.02;

    set({
      telemetry: {
        ...telemetry,
        pitch: Number((telemetry.pitch + dPitch).toFixed(2)),
        roll: Number((telemetry.roll + dRoll).toFixed(2)),
        depth: Number(Math.max(0.5, telemetry.depth + dDepth).toFixed(2)),
        heading: Number(((telemetry.heading + dHeading + 360) % 360).toFixed(1)),
        batteryVoltage: Number((24.0 + dVolt).toFixed(2)),
      },
    });
  },

  setActiveSite: (siteId) => {
    const { mission, images } = get();
    // find primary image for this site
    const site = mission.sampleSites.find((s) => s.id === siteId);
    let targetImgId = site?.primaryImageId || '';
    if (!images.find((img) => img.id === targetImgId)) {
      const match = images.find((img) => img.siteId === siteId && img.adopted);
      if (match) targetImgId = match.id;
    }

    set({
      mission: { ...mission, activeSiteId: siteId },
      activeImageId: targetImgId || get().activeImageId,
      selectedDetectionId: null,
    });

    // Check if site needs recapture and prompt if S02
    if (siteId === 'S02' && site?.qualityStatus === 'underexposed' && site.recaptureCount === 0) {
      setTimeout(() => {
        get().openRecaptureModal();
      }, 600);
    }
  },

  setActiveImage: (imageId) => {
    const img = get().images.find((i) => i.id === imageId);
    if (img) {
      set({
        activeImageId: imageId,
        selectedDetectionId: null,
        mission: {
          ...get().mission,
          activeSiteId: img.siteId,
        },
      });
    }
  },

  selectDetection: (id) => set({ selectedDetectionId: id }),

  updateTelemetry: (partial) => {
    set((state) => ({
      telemetry: { ...state.telemetry, ...partial },
    }));
  },

  updateLight: (left, right) => {
    const { telemetry } = get();
    set({
      telemetry: { ...telemetry, lightLeft: left, lightRight: right },
    });
    get().sendCommand('light', { left, right }, `调节补光：左 ${left}% / 右 ${right}%`);
  },

  toggleHold: (type) => {
    const { telemetry } = get();
    const newVal = type === 'depth' ? !telemetry.depthHold : !telemetry.headingHold;
    const partial = type === 'depth' ? { depthHold: newVal } : { headingHold: newVal };
    set({ telemetry: { ...telemetry, ...partial } });
    get().sendCommand('hold', partial, `${type === 'depth' ? '定深' : '定向'}锁定切换为：${newVal ? '开启' : '关闭'}`);
  },

  sendCommand: async (type, params, summary) => {
    const cmdId = `CMD-${String(get().commands.length + 1).padStart(3, '0')}`;
    const now = new Date().toTimeString().slice(0, 8);
    const cmdText = summary || `执行控制指令 [${type.toUpperCase()}]`;

    const newCmd: ControlCommand = {
      id: cmdId,
      deviceId: 'ROV-S6',
      missionId: get().mission.id,
      type,
      params,
      timestamp: now,
      status: 'sent',
      summary: cmdText,
    };

    set((state) => ({ commands: [newCmd, ...state.commands] }));

    // Simulate async device execution receipt
    setTimeout(() => {
      set((state) => ({
        commands: state.commands.map((c) =>
          c.id === cmdId ? { ...c, status: 'executing' } : c
        ),
      }));
    }, 180);

    setTimeout(() => {
      const receiptTime = new Date().toTimeString().slice(0, 8);
      set((state) => ({
        commands: state.commands.map((c) =>
          c.id === cmdId ? { ...c, status: 'completed', receiptTime } : c
        ),
      }));
    }, 450);

    return cmdId;
  },

  emergencyStop: () => {
    const { thrusters, telemetry } = get();
    const stoppedThrusters = thrusters.map((t) => ({ ...t, pwm: 1500, load: 0 }));
    set({
      thrusters: stoppedThrusters,
      telemetry: { ...telemetry, depthHold: false, headingHold: false },
    });
    get().sendCommand('stop', {}, '【紧急制动】推进器动力切断，锁定姿态释放');
  },

  runSelfCheck: async () => {
    set({ selfCheckRunning: true, selfCheckProgress: 0 });
    const items = [...get().selfCheckItems];

    for (let i = 0; i < items.length; i++) {
      items[i].status = 'checking';
      set({ selfCheckItems: [...items], selfCheckProgress: Math.round(((i + 0.5) / items.length) * 100) });
      await new Promise((r) => setTimeout(r, items[i].durationMs));
      items[i].status = 'passed';
      set({ selfCheckItems: [...items], selfCheckProgress: Math.round(((i + 1) / items.length) * 100) });
    }

    set({
      selfCheckRunning: false,
      selfCheckProgress: 100,
      mission: {
        ...get().mission,
        status: 'collecting',
      },
    });

    get().sendCommand('self_check', {}, '六通道系统综合自检全部完成，指标达标');
  },

  openRecaptureModal: () => {
    set({
      recaptureModalOpen: true,
      recaptureStep: 'prompt',
      recaptureLogs: [
        '视觉质量评估检测：图像均值照度 14 Lux / 曝光指数 0.22 (门限 0.50)',
        '检测到深洼背光阴影，目标边缘对比度严重恶化 (0.38 < 0.60)',
        '建议指令序列：[1] 左右主补光升至 85% [2] 悬停定深 [3] 采集复拍关键帧',
      ],
    });
  },

  closeRecaptureModal: () => set({ recaptureModalOpen: false }),

  executeRecapture: async () => {
    set({
      recaptureStep: 'executing',
      recaptureLogs: [
        '指令下发：下发大功率补光控制指令 (Light: 85%)...',
      ],
    });

    await new Promise((r) => setTimeout(r, 600));
    get().sendCommand('light', { left: 85, right: 85 }, '复拍闭环：大功率补光已开启 (85%)');
    set((s) => ({
      telemetry: { ...s.telemetry, lightLeft: 85, lightRight: 85 },
      recaptureLogs: [...s.recaptureLogs, '补光响应完成：照度跃升至 82 Lux，ISP 自动白平衡已锁存'],
    }));

    await new Promise((r) => setTimeout(r, 700));
    get().sendCommand('recapture', { siteId: 'S02' }, '复拍闭环：触发高清晰度星光级快门重采');

    const recapturedImg: CapturedImage = {
      id: 'IMG-S02-RECAPTURE',
      siteId: 'S02',
      filename: '001_000002_recaptured.jpg',
      url: getAssetUrl('/samples/urpc/001_000002.jpg'),
      timestamp: new Date().toTimeString().slice(0, 8),
      exposure: 0.82,
      sharpness: 0.84,
      contrast: 0.79,
      illumination: 82,
      isRecapture: true,
      status: 'analyzed',
      adopted: false,
      detections: [
        { id: 'd-201', category: '海胆', confidence: 0.94, box: [420, 680, 140, 130], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-202', category: '海胆', confidence: 0.91, box: [610, 720, 135, 125], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-203', category: '海胆', confidence: 0.89, box: [820, 760, 150, 140], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-204', category: '海胆', confidence: 0.86, box: [1020, 710, 140, 130], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-205', category: '海胆', confidence: 0.93, box: [1260, 650, 160, 145], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-206', category: '海参', confidence: 0.88, box: [510, 830, 260, 110], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-207', category: '海参', confidence: 0.85, box: [910, 880, 240, 105], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-208', category: '海参', confidence: 0.82, box: [1380, 820, 220, 115], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-209', category: '海星', confidence: 0.79, box: [320, 510, 190, 180], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-210', category: '扇贝', confidence: 0.81, box: [1540, 620, 110, 95], source: 'model', reviewStatus: 'unreviewed' },
      ],
    };

    set((s) => {
      const existing = s.images.filter((img) => img.id !== 'IMG-S02-RECAPTURE');
      return {
        images: [recapturedImg, ...existing],
        recaptureLogs: [...s.recaptureLogs, '图像重采入库：获得 1080P 高对比底栖海床帧 (清晰度 0.84)'],
      };
    });

    await new Promise((r) => setTimeout(r, 500));
    set({
      recaptureStep: 'compare',
      recaptureLogs: [
        ...get().recaptureLogs,
        'FBDPN 在线预推理完成：检出目标由 2 个跃升至 10 个 (海参×3, 海胆×5, 海星×1, 扇贝×1)',
        '请操作员复核并确认是否采纳复拍图像替换当前样点主帧。',
      ],
    });
  },

  adoptRecapturedImage: () => {
    const { images, mission } = get();
    // Update S02 primary image and adopted flag
    const updatedImages = images.map((img) => {
      if (img.id === 'IMG-S02-DARK') {
        return { ...img, adopted: false };
      }
      if (img.id === 'IMG-S02-RECAPTURE') {
        return { ...img, adopted: true, status: 'analyzed' as const };
      }
      return img;
    });

    const updatedSites = mission.sampleSites.map((s) => {
      if (s.id === 'S02') {
        return {
          ...s,
          primaryImageId: 'IMG-S02-RECAPTURE',
          qualityStatus: 'normal' as const,
          status: 'completed' as const,
          recaptureCount: s.recaptureCount + 1,
          note: '已完成主动复拍：85% 补光重采，检出由 2 增加到 10，已采纳。',
        };
      }
      return s;
    });

    set({
      images: updatedImages,
      mission: { ...mission, sampleSites: updatedSites },
      activeImageId: 'IMG-S02-RECAPTURE',
      recaptureModalOpen: false,
    });

    get().sendCommand('recapture', { action: 'adopt' }, '操作员确认：已采纳 S02 复拍高画质影像，原欠曝帧归档至备选池');
  },

  skipRecapture: () => {
    const { mission } = get();
    const updatedSites = mission.sampleSites.map((s) => {
      if (s.id === 'S02') {
        return {
          ...s,
          recaptureCount: s.recaptureCount + 1,
          note: '操作员选择跳过主动复拍，保留原欠曝样本标记待人工复核。',
        };
      }
      return s;
    });
    set({
      mission: { ...mission, sampleSites: updatedSites },
      recaptureModalOpen: false,
    });
    get().sendCommand('recapture', { action: 'skip' }, '操作员跳过复拍：保留原样点影像并递交人工复核队列');
  },

  captureCurrentFrame: () => {
    const { mission, images, telemetry } = get();
    const siteId = mission.activeSiteId;
    const newId = `IMG-${siteId}-01`;
    const now = new Date().toTimeString().slice(0, 8);

    // Trigger visual shutter flash
    set({ captureFlash: true });
    setTimeout(() => {
      set({ captureFlash: false });
    }, 350);

    const isS02Dark = siteId === 'S02' && telemetry.lightLeft < 60;

    let targetUrl = getAssetUrl('/samples/urpc/000_000001.jpg');
    let targetDetections: DetectionBox[] = [];

    if (siteId === 'S01') {
      targetUrl = getAssetUrl('/samples/urpc/000_000001.jpg');
      targetDetections = INITIAL_IMAGES[0]?.detections || [];
    } else if (siteId === 'S02') {
      targetUrl = isS02Dark ? getAssetUrl('/samples/urpc/000_000007.jpg') : getAssetUrl('/samples/urpc/001_000002.jpg');
      targetDetections = isS02Dark ? [
        { id: `d-dark-1`, category: '海胆', confidence: 0.58, box: [780, 520, 160, 160], source: 'model', reviewStatus: 'unreviewed' },
        { id: `d-dark-2`, category: '海参', confidence: 0.52, box: [1200, 680, 180, 90], source: 'model', reviewStatus: 'unreviewed' },
      ] : (INITIAL_IMAGES[2]?.detections || []);
    } else if (siteId === 'S03') {
      targetUrl = getAssetUrl('/samples/urpc/002_000003.jpg');
      targetDetections = INITIAL_IMAGES[3]?.detections || [
        { id: 'd-301', category: '海星', confidence: 0.93, box: [640, 240, 260, 240], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-302', category: '海胆', confidence: 0.88, box: [480, 620, 150, 140], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-303', category: '海参', confidence: 0.84, box: [1120, 710, 250, 120], source: 'model', reviewStatus: 'unreviewed' },
        { id: 'd-304', category: '扇贝', confidence: 0.79, box: [1420, 580, 120, 110], source: 'model', reviewStatus: 'unreviewed' },
      ];
    }

    const newImage: CapturedImage = {
      id: isS02Dark ? 'IMG-S02-DARK' : newId,
      siteId,
      filename: `${siteId}_capture_${Date.now()}.jpg`,
      url: targetUrl,
      timestamp: now,
      exposure: isS02Dark ? 0.22 : 0.78,
      sharpness: isS02Dark ? 0.38 : 0.83,
      contrast: isS02Dark ? 0.34 : 0.76,
      illumination: isS02Dark ? 14 : Math.round(telemetry.lightLeft * 0.92),
      isRecapture: false,
      status: isS02Dark ? 'needs_review' : 'analyzed',
      adopted: true,
      detections: targetDetections,
    };

    // Filter out existing photo with same ID if any
    const filteredImages = images.filter((img) => img.id !== newImage.id);

    // Update site status
    const updatedSites = mission.sampleSites.map((s) => {
      if (s.id === siteId) {
        if (isS02Dark) {
          return {
            ...s,
            status: 'needs_recapture' as const,
            qualityStatus: 'underexposed' as const,
            primaryImageId: newImage.id,
            note: '采集成像欠曝：均值照度 14 Lux，需开启矩阵补光主动复拍',
          };
        } else {
          return {
            ...s,
            status: 'completed' as const,
            qualityStatus: 'normal' as const,
            primaryImageId: newImage.id,
            note: '现场定点抓拍完成，成像对比度与清晰度达标',
          };
        }
      }
      return s;
    });

    set({
      images: [newImage, ...filteredImages],
      activeImageId: newImage.id,
      mission: {
        ...mission,
        sampleSites: updatedSites,
      },
    });

    if (isS02Dark) {
      get().sendCommand('shutter', { siteId }, `⚠️ 采样质量告警: 样点 S02 均值照度 14 Lux 欠曝 [${newImage.id}]`);
      setTimeout(() => {
        get().openRecaptureModal();
      }, 500);
    } else {
      get().sendCommand('shutter', { siteId }, `快门曝光定点抓拍完成: 样点 ${siteId} 切片入库 [${newImage.id}]`);
    }
  },

  runModelInference: async () => {
    set({
      inferenceState: 'running',
      inferenceProgress: 15,
      inferenceLogs: ['[阶段 1/4] 初始化 PyTorch 2.3.0 + CUDA 12.1... 加载 FBDPN-SwinT 权重 (28.4M 参数)'],
    });

    await new Promise((r) => setTimeout(r, 400));
    set({
      inferenceProgress: 45,
      inferenceLogs: [
        ...get().inferenceLogs,
        '[阶段 2/4] 并行张量推导：12 帧海床影像批量送入特征金字塔 (FPN P2-P5)...'
      ],
    });

    await new Promise((r) => setTimeout(r, 500));
    set({
      inferenceProgress: 80,
      inferenceLogs: [
        ...get().inferenceLogs,
        '[阶段 3/4] Multi-Scale RoI Head 提取底栖生物特征，执行 Soft-NMS (IoU 0.45)...'
      ],
    });

    await new Promise((r) => setTimeout(r, 450));
    
    // Set all images to analyzed
    const updatedImages: CapturedImage[] = get().images.map((img) => ({
      ...img,
      status: img.status === 'reviewed' ? 'reviewed' : 'analyzed',
    }));

    set({
      inferenceProgress: 100,
      inferenceState: 'completed',
      images: updatedImages,
      inferenceLogs: [
        ...get().inferenceLogs,
        '[阶段 4/4] 推理完毕：检出目标 24 个 (海胆×13, 海参×5, 扇贝×4, 海星×2)，耗时 342ms。',
      ],
    });
  },

  toggleRecord: () => {
    const { isRecording } = get();
    set({ isRecording: !isRecording });
    get().sendCommand('record', { state: !isRecording }, !isRecording ? '水下高清录像已启动 [REC]' : '水下录像已停止并生成视频切片');
  },

  // Review & Annotation Actions
  updateDetectionCategory: (imageId, detectionId, newCategory) => {
    const { images, history } = get();
    const currentSnapshot = JSON.parse(JSON.stringify(images));

    const updatedImages = images.map((img) => {
      if (img.id !== imageId) return img;
      return {
        ...img,
        detections: img.detections.map((d) => {
          if (d.id !== detectionId) return d;
          return {
            ...d,
            category: newCategory,
            originalCategory: d.originalCategory || d.category,
            source: 'manual_edited' as const,
            reviewStatus: 'edited' as const,
            updatedAt: new Date().toTimeString().slice(0, 8),
          };
        }),
      };
    });

    set({
      images: updatedImages,
      history: [...history, { images: currentSnapshot }],
      future: [],
    });
  },

  updateDetectionBox: (imageId, detectionId, newBox) => {
    const { images, history } = get();
    const currentSnapshot = JSON.parse(JSON.stringify(images));

    const updatedImages = images.map((img) => {
      if (img.id !== imageId) return img;
      return {
        ...img,
        detections: img.detections.map((d) => {
          if (d.id !== detectionId) return d;
          return {
            ...d,
            box: newBox,
            source: 'manual_edited' as const,
            reviewStatus: 'edited' as const,
            updatedAt: new Date().toTimeString().slice(0, 8),
          };
        }),
      };
    });

    set({
      images: updatedImages,
      history: [...history, { images: currentSnapshot }],
      future: [],
    });
  },

  addDetectionBox: (imageId, box, category = '海胆') => {
    const { images, history } = get();
    const currentSnapshot = JSON.parse(JSON.stringify(images));
    const newDetId = `manual-det-${Date.now().toString().slice(-5)}`;

    const newBox: DetectionBox = {
      id: newDetId,
      category,
      confidence: 1.0,
      box,
      source: 'manual_added',
      reviewStatus: 'confirmed',
      notes: '人工补框新增',
      updatedAt: new Date().toTimeString().slice(0, 8),
    };

    const updatedImages = images.map((img) => {
      if (img.id !== imageId) return img;
      return {
        ...img,
        detections: [...img.detections, newBox],
      };
    });

    set({
      images: updatedImages,
      selectedDetectionId: newDetId,
      history: [...history, { images: currentSnapshot }],
      future: [],
    });
  },

  deleteDetectionBox: (imageId, detectionId) => {
    const { images, history } = get();
    const currentSnapshot = JSON.parse(JSON.stringify(images));

    const updatedImages = images.map((img) => {
      if (img.id !== imageId) return img;
      return {
        ...img,
        detections: img.detections.filter((d) => d.id !== detectionId),
      };
    });

    set({
      images: updatedImages,
      selectedDetectionId: null,
      history: [...history, { images: currentSnapshot }],
      future: [],
    });
  },

  confirmDetection: (imageId, detectionId) => {
    const { images } = get();
    const updatedImages = images.map((img) => {
      if (img.id !== imageId) return img;
      return {
        ...img,
        detections: img.detections.map((d) => {
          if (d.id !== detectionId) return d;
          return {
            ...d,
            reviewStatus: 'confirmed' as const,
            updatedAt: new Date().toTimeString().slice(0, 8),
          };
        }),
      };
    });
    set({ images: updatedImages });
  },

  confirmAllInImage: (imageId) => {
    const { images } = get();
    const updatedImages = images.map((img) => {
      if (img.id !== imageId) return img;
      return {
        ...img,
        status: 'reviewed' as const,
        detections: img.detections.map((d) => ({
          ...d,
          reviewStatus: (d.reviewStatus === 'unreviewed' ? 'confirmed' : d.reviewStatus) as any,
        })),
      };
    });
    set({ images: updatedImages });
  },

  undoReview: () => {
    const { history, future, images } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set({
      history: history.slice(0, -1),
      future: [{ images }, ...future],
      images: prev.images,
    });
  },

  redoReview: () => {
    const { history, future, images } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      history: [...history, { images }],
      future: future.slice(1),
      images: next.images,
    });
  },

  handoverToAnalysis: () => {
    const { images } = get();
    // If operator hasn't captured any images, load full demo dataset for seamless experience
    if (images.length === 0) {
      get().loadFullDemoDataset();
    }
    const updatedMission: Mission = {
      ...get().mission,
      status: 'analyzing',
    };
    set({
      mission: updatedMission,
      hasNewAnalysisData: true,
      platformMode: 'analysis',
      analysisTab: 'overview',
    });
    get().sendCommand('telemetry', {}, '【任务封存与移交】生成 SHA-256 遥测数据校验包，已成功移交 FBDPN 平台');
  },

  loadFullDemoDataset: () => {
    const fullImages = JSON.parse(JSON.stringify(INITIAL_IMAGES));
    const fullSites = get().mission.sampleSites.map((s, idx) => ({
      ...s,
      status: 'completed' as const,
      qualityStatus: 'normal' as const,
      primaryImageId: idx === 1 ? 'IMG-S02-RECAPTURE' : fullImages.find((img: any) => img.siteId === s.id)?.id || '',
      note: idx === 1 ? '已完成主动复拍：85% 补光重采，检出 10 处，已采纳' : s.note,
    }));

    set({
      images: fullImages,
      activeImageId: 'IMG-S01-01',
      inferenceState: 'completed',
      inferenceProgress: 100,
      inferenceLogs: [
        '[演示就绪] 已装填全套 12 帧海床多生境巡检切片',
        '[显卡加速] FBDPN-SwinT TensorRT FP16 批量推理已完成，检出物标 24 处',
      ],
      mission: {
        ...get().mission,
        sampleSites: fullSites,
        status: 'transferred',
      },
    });

    get().sendCommand('telemetry', {}, '【演示就绪】已装填全套 12 帧海床巡检切片与 FBDPN-SwinT 推理数据集');
  },

  resetToCleanState: () => {
    set({
      platformMode: 'shore',
      shoreTab: 'cockpit',
      analysisTab: 'overview',
      mission: JSON.parse(JSON.stringify(INITIAL_MISSION)),
      images: [],
      telemetry: { ...INITIAL_TELEMETRY },
      thrusters: JSON.parse(JSON.stringify(INITIAL_THRUSTERS)),
      selfCheckItems: JSON.parse(JSON.stringify(SELF_CHECK_ITEMS)),
      selfCheckRunning: false,
      selfCheckProgress: 100,
      activeImageId: '',
      selectedDetectionId: null,
      inferenceState: 'idle',
      inferenceProgress: 0,
      inferenceLogs: ['[系统待机] FBDPN-SwinT v2.4 深度学习推理核心在线，等待岸端巡检数据包推送...'],
      recaptureModalOpen: false,
      recaptureStep: 'prompt',
      history: [],
      future: [],
      commands: [
        {
          id: 'CMD-001',
          deviceId: 'ROV-S6',
          missionId: INITIAL_MISSION.id,
          type: 'telemetry',
          params: { protocol: 'MAVLink 2.0', ip: '192.168.2.2:14550' },
          timestamp: '09:20:02',
          status: 'completed',
          receiptTime: '09:20:02',
          summary: 'MAVLink 2.0 工业协议握手成功，双向心跳正常 (18ms)',
        },
        {
          id: 'CMD-002',
          deviceId: 'ROV-S6',
          missionId: INITIAL_MISSION.id,
          type: 'video',
          params: { stream: 'rtsp://192.168.2.2:8554/live', codec: 'H.264' },
          timestamp: '09:20:05',
          status: 'completed',
          receiptTime: '09:20:05',
          summary: 'RTSP 水下星光级主相机拉流锁存：1080P@30fps (4.2Mbps)',
        },
        {
          id: 'CMD-003',
          deviceId: 'ROV-S6',
          missionId: INITIAL_MISSION.id,
          type: 'hold',
          params: { depthHold: true, headingHold: true },
          timestamp: '09:20:10',
          status: 'completed',
          receiptTime: '09:20:10',
          summary: '水下姿态解算完成，切入定深定速巡航模式 (DEPTH_HOLD / 8.2m)',
        },
      ],
    });
  },

  setModelThreshold: (confidence, nmsIou) => {
    set((state) => ({
      modelConfig: {
        ...state.modelConfig,
        confidenceThreshold: confidence,
        nmsIou: nmsIou !== undefined ? nmsIou : state.modelConfig.nmsIou,
      },
    }));
  },

  resetDemo: () => {
    get().resetToCleanState();
  },

  jumpToStep: (stepNumber) => {
    switch (stepNumber) {
      case 1: // 自检与任务启动
        set({
          platformMode: 'shore',
          shoreTab: 'devices',
        });
        get().runSelfCheck();
        break;
      case 2: // S01 正常采集
        set({
          platformMode: 'shore',
          shoreTab: 'cockpit',
        });
        get().setActiveSite('S01');
        break;
      case 3: // S02 欠曝与复拍
        set({
          platformMode: 'shore',
          shoreTab: 'cockpit',
        });
        get().setActiveSite('S02');
        setTimeout(() => get().openRecaptureModal(), 400);
        break;
      case 4: // S03 采集与移交
        set({
          platformMode: 'shore',
          shoreTab: 'handover',
        });
        get().setActiveSite('S03');
        break;
      case 5: // FBDPN 接收与人工复核
        set({
          platformMode: 'analysis',
          analysisTab: 'workbench',
          activeImageId: 'IMG-S03-01',
        });
        break;
      case 6: // 成果报告
        set({
          platformMode: 'analysis',
          analysisTab: 'report',
        });
        break;
      default:
        break;
    }
  },

  injectFault: (type) => {
    const { telemetry } = get();
    if (type === 'latency') {
      set({
        telemetry: { ...telemetry, tetherLatency: 145, tetherStatus: 'warning' },
      });
    } else if (type === 'battery') {
      set({
        telemetry: { ...telemetry, battery: 18, batteryVoltage: 21.2 },
      });
    } else if (type === 'thruster') {
      const updated = get().thrusters.map((t) =>
        t.id === 'T4' ? { ...t, status: 'warning' as const, load: 88 } : t
      );
      set({ thrusters: updated });
    } else {
      // restore normal
      set({
        telemetry: {
          ...telemetry,
          tetherLatency: 18,
          tetherStatus: 'optimal',
          battery: 86,
          batteryVoltage: 24.6,
        },
        thrusters: JSON.parse(JSON.stringify(INITIAL_THRUSTERS)),
      });
    }
  },

  setDemoDrawerOpen: (open) => set({ demoDrawerOpen: open }),
}));
