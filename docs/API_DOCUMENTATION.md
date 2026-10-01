# 海析智瞳双平台系统 API 接口与协议规范文档 (v2.2)

## 一、接口基础约定

- **基础 URL**：`http://localhost:3001/api/v1`
- **长连接 WebSocket**：`ws://localhost:3001/ws`
- **数据格式**：`application/json; charset=utf-8`
- **通用响应结构**：
  ```json
  {
    "code": 0,
    "message": "执行成功说明",
    "data": {}
  }
  ```

---

## 二、RESTful API 接口清单

### 1. 任务管理 (Missions)

#### `GET /api/v1/missions`
- **说明**：获取当前系统内所有调查任务列表。
- **响应示例**：
  ```json
  {
    "code": 0,
    "data": [
      {
        "id": "HX-ROV-20261001-A01",
        "name": "海洋牧场 A 区生物资源自主巡检与智能评估",
        "code": "HX-MPA-2026-A1",
        "status": "collecting",
        "startedAt": "2026-10-01 09:20:00"
      }
    ]
  }
  ```

#### `POST /api/v1/missions/:id/transitions`
- **说明**：执行任务状态机流转。
- **请求体**：
  ```json
  {
    "toStatus": "transferred"
  }
  ```
- **状态枚举**：`draft` | `self_check` | `collecting` | `transferred` | `analyzing` | `reviewing` | `archived`

---

### 2. 设备控制与自检 (Devices & Control)

#### `POST /api/v1/devices/:id/self-check`
- **说明**：触发潜航器六通道前置综合自检。
- **返回**：通信链路、4K云台、IMU/深度计、六推进器、矩阵补光、水密舱体 6 项自检通过明细。

#### `POST /api/v1/devices/:id/commands`
- **说明**：向指定 ROV 设备下发控制指令。
- **请求体**：
  ```json
  {
    "type": "light",
    "params": {
      "left": 85,
      "right": 85
    },
    "summary": "复拍闭环：大功率补光升至 85%"
  }
  ```
- **响应示例**：
  ```json
  {
    "code": 0,
    "data": {
      "id": "CMD-003",
      "deviceId": "ROV-S6",
      "type": "light",
      "status": "completed",
      "receiptTime": "09:39:42"
    }
  }
  ```

---

### 3. 图像采集与主动复拍 (Captures & Recaptures)

#### `POST /api/v1/missions/:id/captures`
- **说明**：保存当前水下高清快照或关键帧。
- **请求体**：
  ```json
  {
    "siteId": "S01",
    "isRecapture": false
  }
  ```

#### `POST /api/v1/missions/:id/recaptures`
- **说明**：执行视觉辅助主动复拍控制动作。
- **请求体**：
  ```json
  {
    "siteId": "S02",
    "action": "adopt" 
  }
  ```
- **说明**：`action` 可取 `execute`（执行复拍序列）、`adopt`（采纳复拍图像并替换主帧）、`skip`（跳过复拍保留原帧）。

---

### 4. 智能分析与人工复核 (Analysis & Review)

#### `POST /api/v1/images/:id/reviews`
- **说明**：保存人工复核对目标物标的类别修改、坐标调整或新增/删除记录。
- **请求体**：
  ```json
  {
    "detectionId": "d-303",
    "newCategory": "海星",
    "action": "modify_class"
  }
  ```

---

### 5. 任务包导入与导出 (Task Packages)

#### `GET /api/v1/missions/:id/export`
- **说明**：导出符合 `HXTASK-1.0` 规范的标准 ZIP 压缩归档任务包。
- **文件流**：`Content-Type: application/zip`，包含文件清单：
  - `manifest.json`：全局元数据与 SHA-256 清单
  - `rov/telemetry.csv`：航行遥测数据时序表
  - `rov/command_log.json`：控制指令下发与回执时间线
  - `fbdpn/detection_results.json`：深度学习初筛目标结果
  - `review/review_records.json`：人工复核审计轨迹
  - `report/report_summary.json`：结题报告统计聚合

---

## 三、WebSocket 实时通信协议

客户端连接至 `ws://localhost:3001/ws` 后，服务端按 1Hz 频率推送高频遥测心跳，并在关键操作触发时立即广播事件。

### 1. 遥测广播 (`TELEMETRY_UPDATE`)
```json
{
  "type": "TELEMETRY_UPDATE",
  "payload": {
    "depth": 8.24,
    "heading": 142.6,
    "pitch": -1.8,
    "roll": 0.9,
    "battery": 86,
    "batteryVoltage": 24.6,
    "tetherLatency": 18,
    "cameraFps": 30,
    "lightLeft": 40,
    "lightRight": 40
  },
  "timestamp": "2026-10-01T09:28:15.120Z"
}
```

### 2. 指令回执广播 (`COMMAND_RECEIPT`)
```json
{
  "type": "COMMAND_RECEIPT",
  "payload": {
    "id": "CMD-004",
    "deviceId": "ROV-S6",
    "type": "recapture",
    "summary": "复拍闭环：触发高清晰度星光级快门重采",
    "status": "completed"
  }
}
```
