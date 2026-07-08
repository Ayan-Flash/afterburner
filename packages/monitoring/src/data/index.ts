export interface MonitorDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface TimeSeries {
  metric: string;
  unit: string;
  data: MonitorDataPoint[];
}

export interface MetricThreshold {
  metric: string;
  warning: number;
  critical: number;
  direction: 'above' | 'below';
}
