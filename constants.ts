export const CONFIG = {
  target_cost_per_message: 0.003,
  max_cost_per_message: 0.005,
  alert_threshold: 0.008,
  monthly_budget: 50.00,
  expected_daily_messages: 200,
  large_request_threshold: 15000,
  optimal_calls_per_message: 2,
};

export const BENCHMARKS = {
  before_optimization: {
    cost_per_message: 0.032,
    calls_per_message: 5,
    tokens_per_request: 186304,
  }
};