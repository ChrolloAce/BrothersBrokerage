import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoreHorizontal } from 'lucide-react';

const ChartSection = () => {
  const invoiceData = [
    { name: 'Paid', value: 1135, color: '#667EEA' },
    { name: 'Pending', value: 234, color: '#F59E0B' },
    { name: 'Overdue', value: 514, color: '#EF4444' },
    { name: 'Cancelled', value: 345, color: '#6B7280' }
  ];

  const salesData = [
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Invoice Statistics */}
      <div className="chart-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Invoice Statistics</h3>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="ml-6 space-y-3">
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

      {/* Sales Analytics */}
      <div className="chart-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Sales Analytics</h3>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-900">$3,298</div>
          <div className="text-sm text-gray-500">This month</div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#667EEA" 
              strokeWidth={2}
              dot={{ fill: '#667EEA', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartSection; 