import React from 'react';
import { 
  BarChart, 
  Activity, 
  DollarSign, 
  MessageSquare, 
  Cpu, 
  TrendingUp, 
  AlertTriangle,
  PieChart as PieIcon,
  CheckCircle2
} from 'lucide-react';
import { AnalyticsResult } from '../types';
import MetricCard from './MetricCard';
import { HourlyChart, ModelDistributionChart } from './Charts';

interface DashboardProps {
  data: AnalyticsResult;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const { stats, projections, impact, alerts, large_requests } = data;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 }).format(val);
  
  const formatNumber = (val: number) => 
    new Intl.NumberFormat('en-US').format(Math.round(val));

  const formatPct = (val: number) => `${val.toFixed(1)}%`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-200">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Analytics Overview</h2>
           <p className="text-slate-500">Analysis for {stats.total_requests} requests across {stats.unique_dates} days</p>
        </div>
        <button 
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Upload New File
        </button>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="grid gap-4">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`p-4 rounded-lg border flex items-start gap-4 ${
              alert.level === 'CRITICAL' ? 'bg-rose-50 border-rose-100 text-rose-900' :
              alert.level === 'WARNING' ? 'bg-amber-50 border-amber-100 text-amber-900' :
              'bg-blue-50 border-blue-100 text-blue-900'
            }`}>
              <AlertTriangle className={`w-5 h-5 shrink-0 ${
                alert.level === 'CRITICAL' ? 'text-rose-600' :
                alert.level === 'WARNING' ? 'text-amber-600' : 'text-blue-600'
              }`} />
              <div>
                <p className="font-semibold">{alert.message}</p>
                <p className="text-sm opacity-90 mt-1">Action: {alert.action}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Cost per Message" 
          value={formatCurrency(stats.cost_per_message)}
          subValue="Target: $0.0040"
          trend="down"
          trendValue={`-${impact.cost_reduction_pct.toFixed(1)}% vs Benchmark`}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
        />
        <MetricCard 
          title="Total Cost" 
          value={formatCurrency(stats.total_cost)}
          subValue={`Est. Monthly: ${formatCurrency(projections.monthly.cost)}`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard 
          title="Efficiency" 
          value={stats.calls_per_message.toFixed(2)}
          subValue="Calls per message"
          icon={<Activity className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard 
          title="Budget Health" 
          value={formatPct(projections.budget.utilization)}
          subValue={`Remaining: ${formatCurrency(projections.budget.remaining)}`}
          trend={projections.budget.utilization > 80 ? 'down' : 'up'}
          icon={<PieIcon className="w-6 h-6" />}
          color={projections.budget.utilization > 80 ? 'red' : 'green'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2 mb-6">
              <BarChart className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-800">Hourly Usage & Cost</h3>
           </div>
           <div className="h-[300px]">
             <HourlyChart data={data.hourly_stats} />
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2 mb-6">
              <Cpu className="w-5 h-5 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-800">Cost by Model</h3>
           </div>
           <div className="h-[300px]">
             <ModelDistributionChart data={data.model_stats} />
           </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Large Requests Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Large Requests Analysis
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Total Large Requests (&gt;15k tokens)</span>
                <span className="font-bold text-slate-800">{large_requests.count}</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Percentage of Volume</span>
                <span className="font-bold text-slate-800">{large_requests.percentage.toFixed(2)}%</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Cost Impact</span>
                <span className="font-bold text-slate-800">{formatCurrency(large_requests.total_cost)}</span>
             </div>
          </div>
        </div>

        {/* Impact Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Optimization Impact
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-lg">
                <span className="text-emerald-900">Est. Monthly Savings</span>
                <span className="font-bold text-emerald-700">{formatCurrency(impact.monthly_savings)}</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Avg Tokens/Request</span>
                <span className="font-bold text-slate-800">{formatNumber(stats.avg_tokens_per_request)}</span>
             </div>
             <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600">Avg Generation Time</span>
                <span className="font-bold text-slate-800">{stats.avg_generation_time.toFixed(0)}ms</span>
             </div>
          </div>
        </div>

      </div>

      {/* Model Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">Model Performance Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Model Name</th>
                <th className="px-6 py-3 text-right">Requests</th>
                <th className="px-6 py-3 text-right">Avg Cost</th>
                <th className="px-6 py-3 text-right">Total Cost</th>
                <th className="px-6 py-3 text-right">Avg Tokens</th>
              </tr>
            </thead>
            <tbody>
              {data.model_stats.map((model) => (
                <tr key={model.name} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{model.name}</td>
                  <td className="px-6 py-4 text-right">{formatNumber(model.count)}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(model.avg_cost)}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(model.total_cost)}</td>
                  <td className="px-6 py-4 text-right">{formatNumber(model.avg_tokens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
