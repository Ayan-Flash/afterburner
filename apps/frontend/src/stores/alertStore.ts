import { create } from 'zustand';
import type { AlertEvent, AlertRule } from '../services';

interface AlertStore {
  alerts: AlertEvent[];
  rules: AlertRule[];
  unacknowledgedCount: number;

  setAlerts: (alerts: AlertEvent[]) => void;
  addAlert: (alert: AlertEvent) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAlerts: () => void;
  setRules: (rules: AlertRule[]) => void;
  addRule: (rule: AlertRule) => void;
  removeRule: (ruleId: string) => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  rules: [],
  unacknowledgedCount: 0,

  setAlerts: (alerts) =>
    set({
      alerts,
      unacknowledgedCount: alerts.filter((a) => !a.acknowledged).length,
    }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [...state.alerts, alert].slice(-200),
      unacknowledgedCount: state.unacknowledgedCount + 1,
    })),

  acknowledgeAlert: (alertId) =>
    set((state) => {
      const alerts = state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a));
      return {
        alerts,
        unacknowledgedCount: alerts.filter((a) => !a.acknowledged).length,
      };
    }),

  clearAlerts: () => set({ alerts: [], unacknowledgedCount: 0 }),

  setRules: (rules) => set({ rules }),

  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),

  removeRule: (ruleId) =>
    set((state) => ({ rules: state.rules.filter((r) => r.id !== ruleId) })),
}));
