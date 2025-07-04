import EnhancedMetricsGrid from '../components/dashboard/EnhancedMetricsGrid';
import EnhancedChartSection from '../components/dashboard/EnhancedChartSection';
import WorkflowOverview from '../components/dashboard/WorkflowOverview';
import RecentInvoices from '../components/dashboard/RecentInvoices';
import { DashboardDataManager } from '../managers/DashboardDataManager';
import { useEffect, useState } from 'react';
import { DashboardMetrics } from '../types';

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dataManager = new DashboardDataManager();
        const dashboardMetrics = await dataManager.getDashboardMetrics();
        setMetrics(dashboardMetrics);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <span className="text-gray-500 ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">Error loading dashboard data</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Metrics Grid */}
      <EnhancedMetricsGrid metrics={metrics} />
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Charts Section - Takes 2/3 width */}
        <div className="xl:col-span-2">
          <EnhancedChartSection />
        </div>
        
        {/* Workflow Overview - Takes 1/3 width */}
        <div className="xl:col-span-1">
          <WorkflowOverview />
        </div>
      </div>
      
      {/* Recent Invoices */}
      <RecentInvoices />
    </div>
  );
};

export default Dashboard; 