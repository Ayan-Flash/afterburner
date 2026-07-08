import { invoke } from '@tauri-apps/api/core';

export interface BrandingConfig {
  app_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  custom_css: string;
  show_branding: boolean;
}

export interface CentralizedServerConfig {
  enabled: boolean;
  server_url: string;
  api_key: string;
  sync_interval_secs: number;
  auto_register: boolean;
  machine_name: string;
  sync_policies: boolean;
  sync_reports: boolean;
  sync_profiles: boolean;
}

export interface EnterpriseConfig {
  branding: BrandingConfig;
  centralized: CentralizedServerConfig;
  policies_enabled: boolean;
  enforcement_level: 'Recommended' | 'Enforced' | 'Strict';
}

export interface GroupPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  target: PolicyTarget;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  created_at: number;
  updated_at: number;
}

export type PolicyTarget =
  | { AllGpus: Record<string, never> }
  | { ByVendor: string }
  | { ByGpuIds: string[] }
  | { ByGroup: string };

export type PolicyCondition =
  | { TemperatureAbove: { threshold: number } }
  | { TemperatureBelow: { threshold: number } }
  | { UsageAbove: { percent: number } }
  | { PowerAbove: { watts: number } }
  | { Always: Record<string, never> };

export type PolicyAction =
  | { SetFanSpeed: { speed_percent: number } }
  | { SetPowerLimit: { limit_percent: number } }
  | { ApplyProfile: { profile_name: string } }
  | { EnableMonitoring: Record<string, never> }
  | { DisableMonitoring: Record<string, never> }
  | { LogEvent: { message: string } };

export async function getEnterpriseConfig(): Promise<EnterpriseConfig> {
  return invoke('get_enterprise_config');
}

export async function saveEnterpriseConfig(config: EnterpriseConfig): Promise<void> {
  return invoke('save_enterprise_config', { config });
}

export async function listGroupPolicies(): Promise<GroupPolicy[]> {
  return invoke('list_group_policies');
}

export async function createGroupPolicy(name: string, description: string, target: PolicyTarget): Promise<GroupPolicy> {
  return invoke('create_group_policy', { name, description, target });
}

export async function updateGroupPolicy(policy: GroupPolicy): Promise<void> {
  return invoke('update_group_policy', { policy });
}

export async function deleteGroupPolicy(id: string): Promise<void> {
  return invoke('delete_group_policy', { id });
}

export async function toggleGroupPolicy(id: string, enabled: boolean): Promise<void> {
  return invoke('toggle_group_policy', { id, enabled });
}
