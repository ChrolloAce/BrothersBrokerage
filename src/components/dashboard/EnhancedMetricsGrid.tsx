import { DashboardMetrics } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target,
  FileText,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';

interface EnhancedMetricsGridProps {
  metrics: DashboardMetrics;
}

const EnhancedMetricsGrid = ({ metrics }: EnhancedMetricsGridProps) => {
  const theme = useTheme();

  const primaryMetrics = [
    {
      id: 'clients',
      title: 'Total Clients',
      value: metrics.totalClients,
      growth: metrics.clientsGrowth,
      icon: Users,
      color: theme.colors.primary[500],
      bgColor: theme.colors.primary[50],
      description: 'Active clients in system',
      trend: metrics.clientsGrowth > 0 ? 'up' : 'down'
    },
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: metrics.monthlyRevenue,
      growth: metrics.revenueGrowth,
      icon: DollarSign,
      color: theme.colors.success[500],
      bgColor: theme.colors.success[50],
      description: 'This month earnings',
      trend: metrics.revenueGrowth > 0 ? 'up' : 'down',
      prefix: '$'
    },
    {
      id: 'completion',
      title: 'Completion Rate',
      value: metrics.completionRate,
      growth: metrics.completionGrowth,
      icon: CheckCircle,
      color: theme.colors.chart.purple,
      bgColor: '#F3F4F6',
      description: 'Workflow completion',
      trend: metrics.completionGrowth > 0 ? 'up' : 'down',
      suffix: '%'
    },
    {
      id: 'leads',
      title: 'Active Leads',
      value: metrics.activeLeads,
      growth: metrics.leadsGrowth,
      icon: Target,
      color: theme.colors.warning[500],
      bgColor: theme.colors.warning[50],
      description: 'Leads in pipeline',
      trend: metrics.leadsGrowth > 0 ? 'up' : 'down'
    }
  ];

  const workflowMetrics = [
    {
      id: 'pending-budgets',
      title: 'Pending Budgets',
      value: 12,
      icon: FileText,
      color: theme.broker.workflow.budgetProcessing,
      bgColor: theme.colors.warning[50],
      description: 'Awaiting approval'
    },
    {
      id: 'scheduled-meetings',
      title: 'Scheduled Meetings',
      value: 8,
      icon: Calendar,
      color: theme.broker.workflow.clientOnboarding,
      bgColor: theme.colors.primary[50],
      description: 'This week'
    },
    {
      id: 'overdue-documents',
      title: 'Overdue Documents',
      value: 3,
      icon: Clock,
      color: theme.colors.danger[500],
      bgColor: theme.colors.danger[50],
      description: 'Need follow-up'
    }
  ];

  const formatValue = (value: number, prefix?: string, suffix?: string) => {
    const formatted = prefix === '$' ? value.toLocaleString() : value.toString();
    return `${prefix || ''}${formatted}${suffix || ''}`;
  };

  const formatGrowth = (growth: number) => {
    const sign = growth > 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryMetrics.map((metric) => (
          <div
            key={metric.id}
            className="relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{ backgroundColor: metric.color }}
            />
            
            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: metric.bgColor }}
                >
                  <metric.icon 
                    className="w-6 h-6"
                    style={{ color: metric.color }}
                  />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatValue(metric.value, metric.prefix, metric.suffix)}
                  </div>
                  <div className="text-sm text-gray-500">{metric.title}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${
                      metric.trend === 'down' ? 'rotate-180' : ''
                    }`} />
                    {formatGrowth(metric.growth)}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {metric.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workflowMetrics.map((metric) => (
          <div
            key={metric.id}
            className="relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div 
              className="absolute inset-0 opacity-5"
              style={{ backgroundColor: metric.color }}
            />
            
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {metric.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {metric.description}
                  </div>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: metric.bgColor }}
                >
                  <metric.icon 
                    className="w-6 h-6"
                    style={{ color: metric.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedMetricsGrid; 