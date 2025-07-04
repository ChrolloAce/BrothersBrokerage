import { useState, useEffect } from 'react';
import { Client } from '../../types/client';
import { ClientManager } from '../../managers/ClientManager';
import { Archive, RotateCcw, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const ClientArchive = () => {
  const [archivedClients, setArchivedClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const clientManager = ClientManager.getInstance();

  useEffect(() => {
    loadArchivedClients();
  }, []);

  const loadArchivedClients = async () => {
    try {
      const allClients = await clientManager.getAllClients(true);
      setArchivedClients(allClients.filter(client => client.isArchived));
    } catch (error) {
      console.error('Error loading archived clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (clientId: string) => {
    try {
      await clientManager.unarchiveClient(clientId);
      await loadArchivedClients();
    } catch (error) {
      console.error('Error unarchiving client:', error);
    }
  };

  const filteredClients = archivedClients.filter(client => {
    if (!searchTerm) return true;
    return client.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           client.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading archived clients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Archive className="w-6 h-6 mr-2" />
            Client Archive
          </h1>
          <p className="text-gray-500">Manage archived clients and restore them if needed</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search archived clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
        />
      </div>

      {/* Client List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No archived clients</h3>
            <p className="text-gray-500">
              {searchTerm ? 'No clients match your search criteria.' : 'All clients are currently active.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Care Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archived Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-gray-600">
                            {client.personalInfo.firstName.charAt(0)}
                            {client.personalInfo.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {client.personalInfo.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.personalInfo.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.careManager.name}</div>
                      <div className="text-sm text-gray-500">{client.careManager.organization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {client.services.slice(0, 2).map((service, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {service.replace('-', ' ')}
                          </span>
                        ))}
                        {client.services.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{client.services.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {client.archivedAt ? format(client.archivedAt, 'MMM dd, yyyy') : 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleUnarchive(client.id)}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientArchive; 