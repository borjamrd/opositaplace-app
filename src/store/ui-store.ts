import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DashboardSections {
  studyFeedback: boolean;
  selectiveProcessTimeline: boolean;
  studySessionsChart: boolean;
  srsWidget: boolean;
  failedQuestions: boolean;
}

interface UiState {
  dashboardSections: DashboardSections;
  toggleDashboardSection: (section: keyof DashboardSections) => void;
  setDashboardSection: (section: keyof DashboardSections, isVisible: boolean) => void;
  reset: () => void;
}

const initialDashboardSections: DashboardSections = {
  studyFeedback: true,
  selectiveProcessTimeline: true,
  studySessionsChart: true,
  srsWidget: true,
  failedQuestions: true,
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      dashboardSections: initialDashboardSections,
      toggleDashboardSection: (section) =>
        set((state) => ({
          dashboardSections: {
            ...state.dashboardSections,
            [section]: !state.dashboardSections[section],
          },
        })),
      setDashboardSection: (section, isVisible) =>
        set((state) => ({
          dashboardSections: {
            ...state.dashboardSections,
            [section]: isVisible,
          },
        })),
      reset: () =>
        set({
          dashboardSections: initialDashboardSections,
        }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
