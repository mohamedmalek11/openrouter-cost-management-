export const CONFIG = {
  target_cost_per_message: 0.004,
  max_cost_per_message: 0.008,
  alert_threshold: 0.0010,
  monthly_budget: 60.00,
  expected_daily_messages: 400,
  large_request_threshold: 18000,
  optimal_calls_per_message: 2,
};

export const BENCHMARKS = {
  before_optimization: {
    cost_per_message: 0.032,
    calls_per_message: 5,
    tokens_per_request: 186304,
  }
};
