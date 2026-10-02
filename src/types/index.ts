export type PlatformMode = 'shore' | 'analysis';

export type ShoreTab = 'cockpit' | 'task_center' | 'devices' | 'handover';

export type AnalysisTab = 'overview' | 'images' | 'workbench' | 'statistics' | 'report';

export type MarineCategory = '海胆' | '海参' | '扇贝' | '海星' | '鱼' | '水母';

export interface DetectionBox {
  id: string;
  category: MarineCategory;
  confidence: number;
  box: [number, number, number, number]; // [x, y, w, h] in 1920x1080 coordinates
  source: 'model' | 'manual_added' | 'manual_edited';
  reviewStatus: 'unreviewed' | 'confirmed' | 'edited' | 'deleted';
  originalCategory?: MarineCategory;
  originalConfidence?: number;
  notes?: string;
  updatedAt?: string;
}

export interface CapturedImage {
  id: string;
  siteId: 'S01' | 'S02' | 'S03';
  filename: string;
  url: string;
  timestamp: string;
  exposure: number;     // 0..1
  sharpness: number;    // 0..1
  contrast: number;     // 0..1
  illumination: number; // lux (approx 0..100)
  isRecapture: boolean;
  recaptureOfId?: string;
  recaptureReason?: string;
  status: 'raw' | 'analyzed' | 'needs_review' | 'reviewed';
  detections: DetectionBox[];
  adopted?: boolean;
}

export interface RecaptureEvent {
  id: string;
  timestamp: string;
  siteId: string;
  reason: string;
  actionTaken: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeDetectionsCount: number;
  afterDetectionsCount: number;
  adopted: boolean;
  operatorNotes?: string;
}

export interface SampleSite {
  id: 'S01' | 'S02' | 'S03';
  name: string;
  code: string;
  coordinate: string;
  targetDepth: number;
  plannedSpecies: string[];
  status: 'pending' | 'collecting' | 'completed' | 'needs_recapture';
  recaptureCount: number;
  recaptureMax: number;
  qualityStatus: 'normal' | 'underexposed' | 'blurry';
  primaryImageId: string;
  note: string;
}

export interface Mission {
  id: string;
  name: string;
  code: string;
  area: string;
  operator: string;
  vessel: string;
  status: 'draft' | 'self_check' | 'collecting' | 'transferred' | 'analyzing' | 'reviewing' | 'archived';
  startedAt: string;
  elapsedSeconds: number;
  environment: {
    waterTemp: number;
    turbidity: number;
    currentSpeed: number;
    depthRange: string;
    visibility: number;
  };
  sampleSites: SampleSite[];
  activeSiteId: 'S01' | 'S02' | 'S03';
}

export interface TelemetryData {
  depth: number;
  heading: number;
  pitch: number;
  roll: number;
  battery: number;
  batteryVoltage: number;
  leakAlarm: boolean;
  tetherStatus: 'optimal' | 'warning' | 'lost';
  tetherLatency: number;
  cameraFps: number;
  lightLeft: number;
  lightRight: number;
  depthHold: boolean;
  headingHold: boolean;
  temperature: number;
  turbidity: number;
  flowVelocity: number;
}

export interface Thruster {
  id: 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';
  role: string;
  pwm: number;
  load: number;
  status: 'normal' | 'warning' | 'offline';
}

export interface ControlCommand {
  id: string;
  deviceId: string;
  missionId: string;
  type: 'move' | 'light' | 'hold' | 'stop' | 'recapture' | 'shutter' | 'record' | 'self_check' | 'telemetry' | 'video';
  params?: any;
  timestamp: string;
  status: 'sent' | 'executing' | 'completed' | 'failed' | 'cancelled';
  receiptTime?: string;
  summary: string;
}

export interface SelfCheckItem {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
  detail: string;
  durationMs: number;
}

export interface ModelConfig {
  version: string;
  name: string;
  confidenceThreshold: number;
  nmsIou: number;
  categories: string[];
  ap: number;
  ap50: number;
  ap75: number;
  ar100: number;
  backbone: string;
  parameterCount: string;
}

export type InferenceState = 'idle' | 'running' | 'completed';

export type MotionDirection =
  | 'forward'
  | 'backward'
  | 'strafe_left'
  | 'strafe_right'
  | 'yaw_left'
  | 'yaw_right'
  | 'ascend'
  | 'descend'
  | 'idle';

export interface MotionState {
  direction: MotionDirection;
  surge: number; // 前进/后退速度 m/s
  sway: number;  // 左右横移速度 m/s
  heave: number; // 上浮/下潜速度 m/s
  yawRate: number; // 偏航角速度 deg/s
  timestamp: number;
}

