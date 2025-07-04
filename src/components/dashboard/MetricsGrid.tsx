import { DashboardMetrics } from '../../types';
import MetricCard from './MetricCard';

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  const metricCards = [
    {
      title: 'Total Clients',
      value: metrics.totalClients.toString(),
      growth: metrics.clientsGrowth,
      icon: '👥',
      color: 'blue' as const
    },
    {
      title: 'Monthly Revenue',
      value: `$${metrics.monthlyRevenue.toLocaleString()}`,
      growth: metrics.revenueGrowth,
      icon: '💰',
      color: 'green' as const
    },
    {
      title: 'Completion Rate',
      value: `${metrics.completionRate}%`,
      growth: metrics.completionGrowth,
      icon: '📊',
      color: 'purple' as const
    },
    {
      title: 'Active Leads',
      value: metrics.activeLeads.toString(),
      growth: metrics.leadsGrowth,
      icon: '🎯',
      color: 'orange' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((card, index) => (
        <MetricCard
          key={index}
          title={card.title}
          value={card.value}
          growth={card.growth}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
};

export default MetricsGrid; 