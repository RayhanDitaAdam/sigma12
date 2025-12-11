import React from 'react';

const colorClasses = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

const StatsCard = ({ title, value, color, icon, description }) => {
  return (
    <div className={`rounded-xl border p-6 transition-all duration-300 hover:shadow-md ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && (
            <p className="text-xs mt-2 opacity-75">{description}</p>
          )}
        </div>
        <div className="text-3xl">
          {icon}
        </div>
      </div>
      
      {/* Progress bar for percentage-based stats */}
      {typeof value === 'string' && value.includes('%') && (
        <div className="mt-4">
          <div className="w-full bg-white/50 rounded-full h-2">
            <div 
              className="bg-current h-2 rounded-full" 
              style={{ width: value }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced StatsCard with trend indicator
export const StatsCardWithTrend = ({ title, value, color, icon, trend, trendValue }) => {
  const isPositive = trend === 'up';
  const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
  const trendIcon = isPositive ? '↗' : '↘';

  return (
    <div className={`rounded-xl border p-6 transition-all duration-300 hover:shadow-md ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium opacity-80">{title}</p>
        <div className="text-2xl">{icon}</div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${trendColor}`}>
                {trendIcon} {trendValue}
              </span>
              <span className="text-xs text-gray-500">dari bulan lalu</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;