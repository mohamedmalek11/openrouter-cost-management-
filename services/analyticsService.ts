
import Papa from 'papaparse';
import { 
  CsvRow, 
  ProcessedRow, 
  AnalyticsResult, 
  SummaryStats, 
  ModelStats,
  HourlyStats,
  Projections,
  Alert,
  AppConfig
} from '../types';
import { BENCHMARKS } from '../constants';

const parseNumber = (val: string | number): number => {
  if (typeof val === 'number') return val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

export const processCsvData = (file: File, config: AppConfig): Promise<AnalyticsResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawRows = results.data as CsvRow[];
          if (!rawRows.length) throw new Error("File is empty");
          
          const processedData = rawRows.map(processRow);
          const analytics = analyzeData(processedData, config);
          resolve(analytics);
        } catch (e) {
          reject(e);
        }
      },
      error: (error) => reject(error)
    });
  });
};

const processRow = (row: CsvRow): ProcessedRow => {
  const dateObj = new Date(row.created_at);
  const model = row.model_permaslug || 'unknown';
  
  return {
    date: dateObj.toISOString().split('T')[0],
    hour: dateObj.getHours(),
    cost_total: parseNumber(row.cost_total),
    tokens_prompt: parseNumber(row.tokens_prompt),
    tokens_completion: parseNumber(row.tokens_completion),
    tokens_total: parseNumber(row.tokens_prompt) + parseNumber(row.tokens_completion),
    generation_time_ms: parseNumber(row.generation_time_ms),
    model_permaslug: model,
    is_grok: model.toLowerCase().includes('grok'),
    is_devstral: model.toLowerCase().includes('devstral'),
    finish_reason: row.finish_reason_normalized || 'unknown'
  };
};

const analyzeData = (data: ProcessedRow[], config: AppConfig): AnalyticsResult => {
  // 1. Summary Stats
  const total_requests = data.length;
  const total_cost = data.reduce((sum, r) => sum + r.cost_total, 0);
  const total_tokens = data.reduce((sum, r) => sum + r.tokens_total, 0);
  const devstral_count = data.filter(r => r.is_devstral).length;
  
  // Logic from python script: if no devstral, fallback to avoid div/0, but ideally we use devstral
  // If devstral count is 0, we assume 1 message = 1 request as fallback or 0
  const estimated_messages = devstral_count > 0 ? devstral_count : total_requests; 
  
  // Calculate chats
  const estimated_chats = estimated_messages / config.average_messages_per_chat;
  
  const stats: SummaryStats = {
    total_requests,
    total_cost,
    total_tokens,
    avg_cost_per_request: total_cost / total_requests,
    avg_tokens_per_request: data.reduce((sum, r) => sum + r.tokens_prompt, 0) / total_requests,
    avg_generation_time: data.reduce((sum, r) => sum + r.generation_time_ms, 0) / total_requests,
    unique_dates: new Set(data.map(r => r.date)).size,
    estimated_messages,
    estimated_chats,
    cost_per_message: estimated_messages > 0 ? total_cost / estimated_messages : 0,
    cost_per_chat: estimated_chats > 0 ? total_cost / estimated_chats : 0,
    calls_per_message: estimated_messages > 0 ? total_requests / estimated_messages : 0,
  };

  // 2. Model Analysis
  const modelMap = new Map<string, { count: number; cost: number; tokens: number }>();
  data.forEach(r => {
    const current = modelMap.get(r.model_permaslug) || { count: 0, cost: 0, tokens: 0 };
    modelMap.set(r.model_permaslug, {
      count: current.count + 1,
      cost: current.cost + r.cost_total,
      tokens: current.tokens + r.tokens_prompt
    });
  });

  const model_stats: ModelStats[] = Array.from(modelMap.entries()).map(([name, val]) => ({
    name: name.split('/').pop() || name, // Clean name
    count: val.count,
    total_cost: val.cost,
    avg_cost: val.cost / val.count,
    avg_tokens: val.tokens / val.count
  })).sort((a, b) => b.total_cost - a.total_cost);

  // 3. Hourly Analysis
  const hourlyMap = new Map<number, { count: number; cost: number; tokens: number }>();
  for (let i = 0; i < 24; i++) hourlyMap.set(i, { count: 0, cost: 0, tokens: 0 });
  
  data.forEach(r => {
    const current = hourlyMap.get(r.hour)!;
    hourlyMap.set(r.hour, {
      count: current.count + 1,
      cost: current.cost + r.cost_total,
      tokens: current.tokens + r.tokens_prompt
    });
  });

  const hourly_stats: HourlyStats[] = Array.from(hourlyMap.entries()).map(([hour, val]) => ({
    hour,
    requests: val.count,
    cost: val.cost,
    avg_tokens: val.count > 0 ? val.tokens / val.count : 0
  })).sort((a, b) => a.hour - b.hour);

  // 4. Large Requests
  const largeReqs = data.filter(r => r.tokens_prompt > config.large_request_threshold);
  const large_requests = {
    count: largeReqs.length,
    percentage: (largeReqs.length / total_requests) * 100,
    total_cost: largeReqs.reduce((sum, r) => sum + r.cost_total, 0)
  };

  // 5. Projections
  const datesCount = stats.unique_dates || 1;
  const daily_messages = stats.estimated_messages / datesCount;
  const projected_monthly_cost = stats.cost_per_message * daily_messages * 30;

  const projections: Projections = {
    daily: {
      messages: daily_messages,
      cost: stats.cost_per_message * daily_messages,
      requests: stats.calls_per_message * daily_messages
    },
    monthly: {
      messages: daily_messages * 30,
      cost: projected_monthly_cost,
      requests: stats.calls_per_message * daily_messages * 30
    },
    budget: {
      monthly_budget: config.monthly_budget,
      projected_monthly: projected_monthly_cost,
      remaining: config.monthly_budget - projected_monthly_cost,
      utilization: (projected_monthly_cost / config.monthly_budget) * 100
    }
  };

  // 6. Impact & Benchmarks
  const impact = {
    cost_reduction_pct: ((BENCHMARKS.before_optimization.cost_per_message - stats.cost_per_message) / BENCHMARKS.before_optimization.cost_per_message) * 100,
    monthly_savings: (BENCHMARKS.before_optimization.cost_per_message - stats.cost_per_message) * config.expected_daily_messages * 30
  };

  // 7. Alerts
  const alerts: Alert[] = [];
  
  if (stats.cost_per_message > config.alert_threshold) {
    alerts.push({
      level: 'CRITICAL',
      message: `High Cost per Message ($${stats.cost_per_message.toFixed(4)})`,
      action: 'Check large requests & reduce iterations'
    });
  } else if (stats.cost_per_message > config.max_cost_per_message) {
    alerts.push({
      level: 'WARNING',
      message: `Cost exceeds acceptable limit ($${stats.cost_per_message.toFixed(4)})`,
      action: 'Monitor performance & optimize tool descriptions'
    });
  }

  // Cost per chat alert (using average messages factor)
  if (stats.cost_per_chat > config.target_cost_per_chat) {
    alerts.push({
       level: 'WARNING',
       message: `Cost per Chat ($${stats.cost_per_chat.toFixed(4)}) exceeds target ($${config.target_cost_per_chat.toFixed(4)})`,
       action: 'Review conversation length and tool usage'
    });
  }

  if (projections.budget.utilization > 100) {
    alerts.push({
      level: 'CRITICAL',
      message: `Budget Overflow Projected (${projections.budget.utilization.toFixed(1)}%)`,
      action: 'Reduce costs or increase budget'
    });
  } else if (projections.budget.utilization > 80) {
    alerts.push({
      level: 'WARNING',
      message: `Budget Utilization High (${projections.budget.utilization.toFixed(1)}%)`,
      action: 'Monitor daily usage'
    });
  }

  if (stats.calls_per_message > config.optimal_calls_per_message + 1) {
    alerts.push({
      level: 'WARNING',
      message: `High Calls per Message (${stats.calls_per_message.toFixed(2)})`,
      action: 'Review tool descriptions & enforce single search rule'
    });
  }

  return {
    stats,
    model_stats,
    hourly_stats,
    projections,
    alerts,
    large_requests,
    impact,
    config
  };
};
