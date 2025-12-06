export interface CsvRow {
  created_at: string;
  model_permaslug: string;
  cost_total: string | number;
  tokens_prompt: string | number;
  tokens_completion: string | number;
  tokens_reasoning: string | number;
  generation_time_ms: string | number;
  finish_reason_normalized: string;
  [key: string]: any;
}

export interface ProcessedRow {
  date: string;
  hour: number;
  cost_total: number;
  tokens_prompt: number;
  tokens_completion: number;
  tokens_total: number;
  generation_time_ms: number;
  model_permaslug: string;
  is_grok: boolean;
  is_devstral: boolean;
  finish_reason: string;
}

export interface SummaryStats {
  total_requests: number;
  total_cost: number;
  total_tokens: number;
  avg_cost_per_request: number;
  avg_tokens_per_request: number;
  avg_generation_time: number;
  unique_dates: number;
  estimated_messages: number;
  cost_per_message: number;
  calls_per_message: number;
}

export interface ModelStats {
  name: string;
  count: number;
  total_cost: number;
  avg_cost: number;
  avg_tokens: number;
}

export interface HourlyStats {
  hour: number;
  requests: number;
  cost: number;
  avg_tokens: number;
}

export interface Projections {
  daily: { messages: number; cost: number; requests: number };
  monthly: { messages: number; cost: number; requests: number };
  budget: {
    monthly_budget: number;
    projected_monthly: number;
    remaining: number;
    utilization: number;
  };
}

export interface Alert {
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  action: string;
}

export interface AnalyticsResult {
  stats: SummaryStats;
  model_stats: ModelStats[];
  hourly_stats: HourlyStats[];
  projections: Projections;
  alerts: Alert[];
  large_requests: {
    count: number;
    percentage: number;
    total_cost: number;
  };
  impact: {
    cost_reduction_pct: number;
    monthly_savings: number;
  };
}