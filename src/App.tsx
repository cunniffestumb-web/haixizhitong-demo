import React, { useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';
import { useMissionStore } from './stores/missionStore';
import { PlatformMode, ShoreTab, AnalysisTab } from './types';
import { Header } from './components/Header';
import { CockpitPage } from './pages/shore/CockpitPage';
import { TaskCenterPage } from './pages/shore/TaskCenterPage';
import { DevicePage } from './pages/shore/DevicePage';
import { HandoverPage } from './pages/shore/HandoverPage';
import { SurveyOverviewPage } from './pages/analysis/SurveyOverviewPage';
import { MissionImagesPage } from './pages/analysis/MissionImagesPage';
import { ReviewWorkbenchPage } from './pages/analysis/ReviewWorkbenchPage';
import { SurveyStatisticsPage } from './pages/analysis/SurveyStatisticsPage';
import { ReportViewPage } from './pages/analysis/ReportViewPage';
import { NewUserTour } from './components/NewUserTour';
import { TourWelcomeModal } from './components/TourWelcomeModal';
import './styles/theme.css';

export const App: React.FC = () => {
  const { platformMode, shoreTab, analysisTab, setPlatformMode, setShoreTab, setAnalysisTab } = useMissionStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') as PlatformMode | null;
    const tab = params.get('tab');
    if (mode === 'shore' || mode === 'analysis') {
      setPlatformMode(mode);
    }
    if (mode === 'shore' && tab) {
      setShoreTab(tab as ShoreTab);
    } else if (mode === 'analysis' && tab) {
      setAnalysisTab(tab as AnalysisTab);
    }
  }, [setPlatformMode, setShoreTab, setAnalysisTab]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#0ea5e9',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorBgBase: '#070d17',
          colorBgContainer: '#0b1523',
          colorBgElevated: '#111f33',
          colorBorder: 'rgba(148, 163, 184, 0.14)',
          colorText: '#f1f5f9',
          colorTextSecondary: '#94a3b8',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif',
          borderRadius: 4,
        },
      }}
    >
      <div className="w-screen h-screen flex flex-col bg-[#070d17] overflow-hidden select-none">
        {/* Unified Dual-Platform Top Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-hidden relative">
          {platformMode === 'shore' ? (
            <>
              {shoreTab === 'cockpit' && <CockpitPage />}
              {shoreTab === 'task_center' && <TaskCenterPage />}
              {shoreTab === 'devices' && <DevicePage />}
              {shoreTab === 'handover' && <HandoverPage />}
            </>
          ) : (
            <>
              {analysisTab === 'images' && <MissionImagesPage />}
              {analysisTab === 'workbench' && <ReviewWorkbenchPage />}
              {analysisTab === 'overview' && <SurveyOverviewPage />}
              {analysisTab === 'statistics' && <SurveyStatisticsPage />}
              {analysisTab === 'report' && <ReportViewPage />}
            </>
          )}
        </main>

        {/* Global Interactive New User Onboarding Tour & Welcome Dialog */}
        <NewUserTour />
        <TourWelcomeModal />
      </div>
    </ConfigProvider>
  );
};

export default App;
