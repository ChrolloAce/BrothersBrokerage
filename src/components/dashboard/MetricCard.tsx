import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string;
  growth: number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard = ({ title, value, growth, icon, color }: MetricCardProps) => {
  const isPositiveGrowth = growth > 0;
  const formatGrowth = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const iconColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className={clsx(
          'w-12 h-12 rounded-lg flex items-center justify-center text-xl',
          iconColors[color]
        )}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{title}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className={clsx(
          'flex items-center text-sm font-medium',
          isPositiveGrowth ? 'text-green-600' : 'text-red-600'
        )}>
          {isPositiveGrowth ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          {formatGrowth(growth)}
        </div>
        <div className="text-sm text-gray-500">Since last week</div>
      </div>
    </div>
  );
};

export default MetricCard; 