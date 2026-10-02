import { create } from 'zustand';

export type TourMode = 'full' | 'shore' | 'analysis';

interface TourState {
  isTourOpen: boolean;
  currentStep: number;
  tourMode: TourMode;
  isWelcomeModalOpen: boolean;
  
  // Actions
  openTour: (mode?: TourMode) => void;
  closeTour: () => void;
  setCurrentStep: (step: number) => void;
  openWelcomeModal: () => void;
  closeWelcomeModal: () => void;
  completeTour: () => void;
}

const STORAGE_KEY = 'haixi_zhitong_tour_completed_v1';

export const useTourStore = create<TourState>((set) => ({
  isTourOpen: false,
  currentStep: 0,
  tourMode: 'full',
  // Check if first-time user
  isWelcomeModalOpen: typeof window !== 'undefined' ? !localStorage.getItem(STORAGE_KEY) : false,

  openTour: (mode = 'full') => {
    set({
      isTourOpen: true,
      currentStep: 0,
      tourMode: mode,
      isWelcomeModalOpen: false,
    });
  },

  closeTour: () => {
    set({ isTourOpen: false });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  },

  setCurrentStep: (step: number) => {
    set({ currentStep: step });
  },

  openWelcomeModal: () => {
    set({ isWelcomeModalOpen: true });
  },

  closeWelcomeModal: () => {
    set({ isWelcomeModalOpen: false });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  },

  completeTour: () => {
    set({ isTourOpen: false });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  },
}));
