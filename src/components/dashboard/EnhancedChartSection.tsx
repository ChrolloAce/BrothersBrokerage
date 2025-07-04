import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MoreHorizontal, TrendingUp, Activity } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const EnhancedChartSection = () => {
  const theme = useTheme();

  const invoiceData = [
    { name: 'Paid', value: 1135, color: theme.colors.success[500] },
    { name: 'Pending', value: 234, color: theme.colors.warning[500] },
    { name: 'Overdue', value: 514, color: theme.colors.danger[500] },
    { name: 'Cancelled', value: 345, color: theme.colors.secondary[400] }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 4000, budgets: 12, clients: 45 },
    { month: 'Feb', revenue: 3000, budgets: 15, clients: 52 },
    { month: 'Mar', revenue: 5000, budgets: 18, clients: 58 },
    { month: 'Apr', revenue: 4500, budgets: 14, clients: 61 },
    { month: 'May', revenue: 6000, budgets: 22, clients: 67 },
    { month: 'Jun', revenue: 5500, budgets: 19, clients: 72 },
    { month: 'Jul', revenue: 7000, budgets: 25, clients: 78 },
    { month: 'Aug', revenue: 6500, budgets: 21, clients: 83 },
    { month: 'Sep', revenue: 8000, budgets: 28, clients: 89 },
    { month: 'Oct', revenue: 7500, budgets: 24, clients: 94 },
    { month: 'Nov', revenue: 9000, budgets: 32, clients: 98 },
    { month: 'Dec', revenue: 8500, budgets: 29, clients: 102 }
  ];

  const workflowData = [
    { name: 'Lead Intake', completed: 142, active: 15 },
    { name: 'Onboarding', completed: 89, active: 8 },
    { name: 'Budget Proc.', completed: 67, active: 12 },
    { name: 'Documents', completed: 134, active: 5 },
    { name: 'Billing', completed: 201, active: 3 }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Invoice Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Invoice Statistics</h3>
            <p className="text-sm text-gray-500">Current month breakdown</p>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={invoiceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {invoiceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="ml-6 space-y-4">
            {invoiceData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500">{item.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
            <p className="text-sm text-gray-500">Monthly performance</p>
          </div>
          <div className="flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12.5%
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-900">$8,500</div>
          <div className="text-sm text-gray-500">December 2023</div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.secondary[200]} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              fontSize={12}
              fill={theme.colors.secondary[600]}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke={theme.colors.primary[500]}
              strokeWidth={3}
              dot={{ fill: theme.colors.primary[500], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: theme.colors.primary[500], strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Workflow Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Workflow Progress</h3>
            <p className="text-sm text-gray-500">Completed vs Active tasks</p>
          </div>
          <div className="flex items-center text-sm text-blue-600">
            <Activity className="w-4 h-4 mr-1" />
            Live Data
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={workflowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.secondary[200]} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              fontSize={12}
              fill={theme.colors.secondary[600]}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              fontSize={12}
              fill={theme.colors.secondary[600]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="completed" fill={theme.colors.success[500]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="active" fill={theme.colors.warning[500]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnhancedChartSection; 