
import { AppConfig } from './types';

export const DEFAULT_CONFIG: AppConfig = {
  target_cost_per_message: 0.004,
  max_cost_per_message: 0.008,
  alert_threshold: 0.010,
  monthly_budget: 60.00,
  expected_daily_messages: 400,
  large_request_threshold: 18000,
  optimal_calls_per_message: 2,
  average_messages_per_chat: 4,
  target_cost_per_chat: 0.016,
};

export const BENCHMARKS = {
  before_optimization: {
    cost_per_message: 0.032,
    calls_per_message: 5,
    tokens_per_request: 186304,
  }
};
