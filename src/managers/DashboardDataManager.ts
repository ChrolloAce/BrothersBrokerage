import { DashboardMetrics } from '../types';

export class DashboardDataManager {
  private static instance: DashboardDataManager;

  public static getInstance(): DashboardDataManager {
    if (!DashboardDataManager.instance) {
      DashboardDataManager.instance = new DashboardDataManager();
    }
    return DashboardDataManager.instance;
  }

  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in real app, this would come from API
    return {
      totalClients: 1456,
      activeLeads: 1135,
      monthlyRevenue: 3345,
      completionRate: 60,
      clientsGrowth: 15.3,
      leadsGrowth: 10.2,
      revenueGrowth: -0.5,
      completionGrowth: 8.7
    };
  }

  public async getMonthlyRevenueData(): Promise<Array<{month: string, revenue: number}>> {
    // Mock data for charts
    return [
      { month: 'Jan', revenue: 4000 },
      { month: 'Feb', revenue: 3000 },
      { month: 'Mar', revenue: 5000 },
      { month: 'Apr', revenue: 4500 },
      { month: 'May', revenue: 6000 },
      { month: 'Jun', revenue: 5500 },
      { month: 'Jul', revenue: 7000 },
      { month: 'Aug', revenue: 6500 },
      { month: 'Sep', revenue: 8000 },
      { month: 'Oct', revenue: 7500 },
      { month: 'Nov', revenue: 9000 },
      { month: 'Dec', revenue: 8500 }
    ];
  }

  public async getInvoiceStatistics(): Promise<Array<{name: string, value: number}>> {
    return [
      { name: 'Paid', value: 1135 },
      { name: 'Pending', value: 234 },
      { name: 'Overdue', value: 514 },
      { name: 'Cancelled', value: 345 }
    ];
  }

  public calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  public formatPercentage(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }
} 