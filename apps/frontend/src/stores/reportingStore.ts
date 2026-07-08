import { create } from 'zustand';
import type { ReportConfig, ReportSummary, Report } from '../services/reportingService';
import * as reportingService from '../services/reportingService';

interface ReportingState {
  reports: ReportSummary[];
  currentReport: Report | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  generate: (name: string, config: ReportConfig) => Promise<void>;
  loadReport: (id: string) => Promise<void>;
  removeReport: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useReportingStore = create<ReportingState>((set) => ({
  reports: [],
  currentReport: null,
  loading: false,
  generating: false,
  error: null,

  fetchReports: async () => {
    set({ loading: true, error: null });
    try {
      const reports = await reportingService.listReports();
      set({ reports, loading: false });
    } catch (e: any) {
      set({ error: String(e), loading: false });
    }
  },

  generate: async (name: string, config: ReportConfig) => {
    set({ generating: true, error: null });
    try {
      await reportingService.generateReport(name, config);
      const reports = await reportingService.listReports();
      set({ reports, generating: false });
    } catch (e: any) {
      set({ error: String(e), generating: false });
    }
  },

  loadReport: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const report = await reportingService.getReport(id);
      set({ currentReport: report, loading: false });
    } catch (e: any) {
      set({ error: String(e), loading: false });
    }
  },

  removeReport: async (id: string) => {
    try {
      await reportingService.deleteReport(id);
      const reports = await reportingService.listReports();
      set({ reports, currentReport: null });
    } catch (e: any) {
      set({ error: String(e) });
    }
  },

  clearError: () => set({ error: null }),
}));
