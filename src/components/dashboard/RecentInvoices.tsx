import { useState, useEffect } from 'react';
import { Invoice } from '../../types';
import { format } from 'date-fns';
import { Filter, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

const RecentInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    // Mock data - in real app, this would come from an API
    const mockInvoices: Invoice[] = [
      {
        id: '#2455499',
        clientId: '1',
        clientName: 'Esther Howard',
        amount: 180,
        status: 'paid',
        dueDate: new Date('2023-07-15'),
        services: ['start-up-broker'],
        billingPeriod: 'July 2023'
      },
      {
        id: '#2455500',
        clientId: '2',
        clientName: 'Jenny Wilson',
        amount: 244,
        status: 'pending',
        dueDate: new Date('2023-07-16'),
        services: ['community-habilitation'],
        billingPeriod: 'July 2023'
      },
      {
        id: '#2455501',
        clientId: '3',
        clientName: 'Guy Hawkins',
        amount: 198,
        status: 'paid',
        dueDate: new Date('2023-07-17'),
        services: ['sap'],
        billingPeriod: 'July 2023'
      },
      {
        id: '#2455502',
        clientId: '4',
        clientName: 'Kristin Watson',
        amount: 350,
        status: 'overdue',
        dueDate: new Date('2023-07-18'),
        services: ['budgeting'],
        billingPeriod: 'July 2023'
      }
    ];
    
    setInvoices(mockInvoices);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID/Client Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service/Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-gray-600">
                        {invoice.clientName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                      <div className="text-sm text-gray-500">{invoice.clientName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.services.join(', ')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(invoice.dueDate, 'dd/MM/yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={clsx(
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    getStatusColor(invoice.status)
                  )}>
                    {getStatusText(invoice.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${invoice.amount}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentInvoices; 