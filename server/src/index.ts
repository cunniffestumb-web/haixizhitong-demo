import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json());

const PORT = 3001;
const DATA_DIR = path.resolve(__dirname, '../../data');
const DIST_DIR = path.resolve(__dirname, '../../dist');
const PUBLIC_DIR = path.resolve(__dirname, '../../public');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Serve public media samples
app.use(express.static(PUBLIC_DIR));

// In-memory mock database state
let missionData = {
  id: 'HX-ROV-20261001-A01',
  name: '海洋牧场 A 区生物资源自主巡检与智能评估',
  code: 'HX-MPA-2026-A1',
  area: '黄海北部国家级海洋牧场示范区 14 号网箱外缘基岩礁区 (38°54′N, 121°38′E)',
  operator: '岸端控制席 01',
  vessel: '海析智曈六推进器深海观测级 ROV-S6',
  status: 'collecting',
  startedAt: '2026-10-01 09:20:00',
  elapsedSeconds: 2435,
};

let telemetryState = {
  depth: 8.24,
  heading: 142.6,
  pitch: -1.8,
  roll: 0.9,
  battery: 86,
  batteryVoltage: 24.6,
  leakAlarm: false,
  tetherStatus: 'optimal',
  tetherLatency: 18,
  cameraFps: 30,
  lightLeft: 40,
  lightRight: 40,
  depthHold: true,
  headingHold: true,
  temperature: 16.8,
  turbidity: 14.2,
  flowVelocity: 0.28,
};

let commandsLog: any[] = [];

// WebSocket Broadcast
function broadcast(data: any) {
  const msg = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// Periodic Telemetry Heartbeat (1 Hz)
setInterval(() => {
  telemetryState.depth += (Math.random() - 0.5) * 0.04;
  telemetryState.heading = (telemetryState.heading + (Math.random() - 0.5) * 0.4 + 360) % 360;
  telemetryState.pitch += (Math.random() - 0.5) * 0.1;
  telemetryState.roll += (Math.random() - 0.5) * 0.1;

  broadcast({
    type: 'TELEMETRY_UPDATE',
    payload: telemetryState,
    timestamp: new Date().toISOString(),
  });
}, 1000);

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'ROV Shore & FBDPN Real-time Event Channel Connected' }));
});

// ==================== RESTful API /api/v1 ====================

// 1. Missions
app.get('/api/v1/missions', (req, res) => {
  res.json({ code: 0, data: [missionData] });
});

app.get('/api/v1/missions/:id', (req, res) => {
  res.json({ code: 0, data: missionData });
});

app.post('/api/v1/missions/:id/transitions', (req, res) => {
  const { toStatus } = req.body;
  missionData.status = toStatus;
  broadcast({ type: 'MISSION_STATUS_CHANGED', payload: { status: toStatus } });
  res.json({ code: 0, message: `任务状态已流转至: ${toStatus}`, data: missionData });
});

// 2. Devices & Control
app.get('/api/v1/devices', (req, res) => {
  res.json({
    code: 0,
    data: [
      {
        id: 'ROV-S6',
        name: '六推进器深海观测级 ROV-S6',
        adapterType: 'mock_physics_engine',
        connected: true,
        ip: '192.168.2.1',
        telemetry: telemetryState,
      },
    ],
  });
});

app.post('/api/v1/devices/:id/connect', (req, res) => {
  res.json({ code: 0, message: '设备握手成功', data: { rtt: 18.2, status: 'connected' } });
});

app.post('/api/v1/devices/:id/self-check', (req, res) => {
  res.json({
    code: 0,
    message: '六项自检全部合格',
    data: {
      passed: true,
      itemsChecked: 6,
      timestamp: new Date().toISOString(),
    },
  });
});

app.post('/api/v1/devices/:id/commands', (req, res) => {
  const { type, params, summary } = req.body;
  const cmdId = `CMD-${String(commandsLog.length + 1).padStart(3, '0')}`;
  const record = {
    id: cmdId,
    deviceId: req.params.id,
    type,
    params,
    summary,
    timestamp: new Date().toTimeString().slice(0, 8),
    status: 'completed',
  };
  commandsLog.unshift(record);

  if (type === 'light' && params) {
    if (params.left !== undefined) telemetryState.lightLeft = params.left;
    if (params.right !== undefined) telemetryState.lightRight = params.right;
  }

  broadcast({ type: 'COMMAND_RECEIPT', payload: record });
  res.json({ code: 0, data: record });
});

// 3. Captures & Recaptures
app.post('/api/v1/missions/:id/captures', (req, res) => {
  const { siteId, isRecapture } = req.body;
  const captureRecord = {
    id: `IMG-${siteId}-${Date.now().toString().slice(-4)}`,
    siteId,
    timestamp: new Date().toTimeString().slice(0, 8),
    isRecapture: !!isRecapture,
    status: 'analyzed',
  };
  broadcast({ type: 'CAPTURE_SAVED', payload: captureRecord });
  res.json({ code: 0, data: captureRecord });
});

app.post('/api/v1/missions/:id/recaptures', (req, res) => {
  const { siteId, action } = req.body;
  broadcast({ type: 'RECAPTURE_ACTION', payload: { siteId, action } });
  res.json({ code: 0, message: `复拍操作执行完成: ${action}` });
});

// 4. Analysis Jobs & Reviews
app.post('/api/v1/analysis/jobs', (req, res) => {
  res.json({
    code: 0,
    data: {
      jobId: `JOB-${Date.now().toString().slice(-6)}`,
      status: 'completed',
      processedFrames: 3,
      totalDetections: 24,
    },
  });
});

app.post('/api/v1/images/:id/reviews', (req, res) => {
  const { detectionId, newCategory, action } = req.body;
  broadcast({
    type: 'REVIEW_UPDATED',
    payload: { imageId: req.params.id, detectionId, newCategory, action },
  });
  res.json({ code: 0, message: '复核记录已持久化' });
});

// 5. Statistics & Report
app.get('/api/v1/missions/:id/statistics', (req, res) => {
  res.json({
    code: 0,
    data: {
      speciesCounts: { 海胆: 19, 海参: 4, 扇贝: 0, 海星: 1 },
      totalDetections: 24,
      reviewProgress: 100,
    },
  });
});

app.get('/api/v1/missions/:id/report', (req, res) => {
  res.json({
    code: 0,
    data: {
      reportId: `REP-${missionData.id}`,
      mission: missionData,
      telemetrySummary: telemetryState,
    },
  });
});

// 6. Export Task Package (ZIP)
app.get('/api/v1/missions/:id/export', (req, res) => {
  try {
    const zip = new AdmZip();

    // manifest.json
    const manifest = {
      format: 'HXTASK-1.0',
      missionId: missionData.id,
      exportedAt: new Date().toISOString(),
      generator: '海析智曈双平台系统 v2.2',
      files: [
        'manifest.json',
        'rov/telemetry.csv',
        'rov/command_log.json',
        'fbdpn/detection_results.json',
        'review/review_records.json',
        'report/report_summary.json',
      ],
    };
    zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf-8'));

    // rov/telemetry.csv
    const telemetryCsv = `timestamp,depth_m,heading_deg,pitch_deg,roll_deg,water_temp_c,turbidity_ntu,battery_pct\n` +
      `09:20:00,8.20,142.0,-1.8,0.9,16.8,14.2,86\n` +
      `09:28:15,8.24,142.6,-1.8,0.9,16.8,14.2,85\n` +
      `09:36:20,11.50,144.2,-2.1,1.1,16.6,15.1,82\n` +
      `09:39:42,11.52,144.0,-2.0,1.0,16.6,15.0,81\n` +
      `09:48:02,12.40,146.5,-1.9,0.8,16.5,14.8,79\n`;
    zip.addFile('rov/telemetry.csv', Buffer.from(telemetryCsv, 'utf-8'));

    // rov/command_log.json
    zip.addFile('rov/command_log.json', Buffer.from(JSON.stringify(commandsLog, null, 2), 'utf-8'));

    // report_summary.json
    zip.addFile('report/report_summary.json', Buffer.from(JSON.stringify({
      mission: missionData,
      status: 'verified',
    }, null, 2), 'utf-8'));

    const buffer = zip.toBuffer();
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=${missionData.id}.hxtask.zip`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ code: 1, message: err.message });
  }
});

// Serve frontend SPA build
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Start Server
server.listen(PORT, () => {
  console.log(`[Haixi Zhitong Dual-Platform Server] Running on http://localhost:${PORT}`);
  console.log(`[WebSocket Server] Ready at ws://localhost:${PORT}/ws`);
});
