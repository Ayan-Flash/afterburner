import { invoke } from '@tauri-apps/api/core';

export interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields: { name: string; value: string; inline: boolean }[];
  timestamp: string;
}

export interface IntegrationConfig {
  discord_webhook_url: string;
  discord_username: string;
  discord_avatar_url: string;
  discord_notify_on_alert: boolean;
  discord_notify_on_high_temp: boolean;
  discord_high_temp_threshold: number;
  obs_enabled: boolean;
  obs_port: number;
  obs_refresh_rate_ms: number;
}

export interface ObsMetric {
  label: string;
  value: string;
  unit: string;
}

export interface ObsPayload {
  gpu_name: string;
  metrics: ObsMetric[];
  timestamp: number;
}

export async function getIntegrationConfig(): Promise<IntegrationConfig> {
  return invoke('get_integration_config');
}

export async function saveIntegrationConfig(config: IntegrationConfig): Promise<void> {
  return invoke('save_integration_config', { config });
}

export async function testDiscordWebhook(webhookUrl: string): Promise<string> {
  return invoke('test_discord_webhook', { webhookUrl });
}

export async function sendDiscordAlert(
  webhookUrl: string,
  gpuName: string,
  metric: string,
  value: number,
  threshold: number,
  severity: string,
): Promise<void> {
  return invoke('send_discord_alert', { webhookUrl, gpuName, metric, value, threshold, severity });
}

export async function sendDiscordReport(webhookUrl: string): Promise<void> {
  return invoke('send_discord_report', { webhookUrl });
}

export async function startObsSource(port: number): Promise<void> {
  return invoke('start_obs_source', { port });
}

export async function stopObsSource(): Promise<void> {
  return invoke('stop_obs_source');
}

export async function isObsRunning(): Promise<boolean> {
  return invoke('is_obs_running');
}
