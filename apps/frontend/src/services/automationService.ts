import { invoke } from '@tauri-apps/api/core';

export interface Rule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: Trigger;
  conditions: Condition[];
  condition_operator: 'All' | 'Any';
  actions: AutomationAction[];
  cooldown_secs: number;
  gpu_id: string | null;
  created_at: number;
  updated_at: number;
  last_triggered_at: number | null;
  execution_count: number;
}

export type Trigger =
  | { Continuous: { interval_secs: number } }
  | { Event: { tag: string; value?: number } }
  | { Schedule: { cron: string } };

export interface Condition {
  metric: string;
  comparison: 'GreaterThan' | 'GreaterThanOrEqual' | 'LessThan' | 'LessThanOrEqual' | 'Equals' | 'Between' | 'NotBetween';
  value: number;
  value_to: number | null;
}

export type AutomationAction =
  | { SetFanSpeed: { speed_percent: number } }
  | { SetCoreClockOffset: { offset_mhz: number } }
  | { SetMemoryClockOffset: { offset_mhz: number } }
  | { SetPowerLimit: { limit_percent: number } }
  | { ApplyProfile: { profile_name: string } }
  | { TriggerAlert: { severity: string; message: string } }
  | { SendWebhook: { url: string; body_template: string } }
  | { SendNotification: { title: string; message: string } }
  | { LogMessage: { message: string } };

export const automationService = {
  getRules: () => invoke<Rule[]>('get_automation_rules'),

  createRule: (name: string, description: string, triggerType: string, triggerValue: string, gpuId?: string) =>
    invoke<Rule>('create_automation_rule', { name, description, triggerType, triggerValue, gpuId }),

  updateRule: (rule: Rule) => invoke<void>('update_automation_rule', { rule }),

  deleteRule: (ruleId: string) => invoke<void>('delete_automation_rule', { ruleId }),

  toggleRule: (ruleId: string, enabled: boolean) =>
    invoke<void>('toggle_automation_rule', { ruleId, enabled }),

  addCondition: (ruleId: string, metric: string, comparison: string, value: number, valueTo?: number) =>
    invoke<void>('add_automation_condition', { ruleId, metric, comparison, value, valueTo }),

  addAction: (ruleId: string, actionType: string, actionValue: string, actionValue2?: string) =>
    invoke<void>('add_automation_action', { ruleId, actionType, actionValue, actionValue2 }),

  startEngine: () => invoke<void>('start_automation_engine'),

  stopEngine: () => invoke<void>('stop_automation_engine'),
};
