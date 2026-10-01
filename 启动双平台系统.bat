@echo off
chcp 65001 >nul
title 海析智瞳双平台软件系统 - 本地服务
echo ========================================================
echo   海析智瞳 - ROV岸端控制与FBDPN智能分析双平台系统
echo   访问地址: http://localhost:3001
echo ========================================================
echo.
cd /d "%~dp0"
if not exist "dist" (
    echo [1/2] 正在编译前端资产...
    call npm run build
)
echo [2/2] 正在启动本地服务与WebSocket数据管道...
call npm start
pause
