import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { HourlyStats, ModelStats } from '../types';

interface HourlyChartProps {
  data: HourlyStats[];
}

export const HourlyChart: React.FC<HourlyChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="hour" 
          tickFormatter={(tick) => `${tick}:00`} 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          yAxisId="left" 
          orientation="left" 
          stroke="#64748b" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          stroke="#94a3b8" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `$${val}`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
          }}
        />
        <Bar yAxisId="left" dataKey="requests" name="Requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="right" dataKey="cost" name="Cost ($)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface ModelDistChartProps {
  data: ModelStats[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const ModelDistributionChart: React.FC<ModelDistChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="total_cost"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
           formatter={(value: number) => `$${value.toFixed(4)}`}
           contentStyle={{ 
            backgroundColor: '#fff', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
          }}
        />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  );
};