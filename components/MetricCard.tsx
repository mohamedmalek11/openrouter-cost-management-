import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subValue, 
  trend, 
  trendValue, 
  icon,
  color = 'blue' 
}) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
            {icon}
          </div>
        )}
      </div>
      
      {(subValue || trendValue) && (
        <div className="flex items-center gap-2 text-sm">
          {trendValue && (
            <span className={`
              font-medium
              ${trend === 'up' ? 'text-emerald-600' : ''}
              ${trend === 'down' ? 'text-rose-600' : ''}
              ${trend === 'neutral' ? 'text-slate-500' : ''}
            `}>
              {trendValue}
            </span>
          )}
          {subValue && (
            <span className="text-slate-400">{subValue}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;