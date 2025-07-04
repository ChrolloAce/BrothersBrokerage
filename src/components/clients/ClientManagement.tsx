import { useState, useEffect } from 'react';
import { Client } from '../../types/client';
import { ClientManager } from '../../managers/ClientManager';
import { Plus, Search, Eye, Edit, Trash2, Mail, Phone, MapPin, User, MoreHorizontal } from 'lucide-react';

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const clientManager = ClientManager.getInstance();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const allClients = await clientManager.getAllClients();
      setClients(allClients.filter(c => !c.isArchived));
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return client.personalInfo.fullName.toLowerCase().includes(searchLower) ||
             client.personalInfo.email.toLowerCase().includes(searchLower) ||
             client.personalInfo.phone.includes(searchTerm);
    }
    return true;
  }).filter(client => {
    if (filterStatus === 'all') return true;
    return client.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 text-sm">Loading clients...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
              <p className="text-sm text-gray-600 mt-1">Manage client information and details</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{filteredClients.length} Clients</span>
                <span>{filteredClients.filter(c => c.status === 'active').length} Active</span>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Client</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Client Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {client.personalInfo.firstName.charAt(0)}{client.personalInfo.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.personalInfo.fullName}</h3>
                    <p className="text-sm text-gray-500">ID: {client.id}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Client Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{client.personalInfo.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{client.personalInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {client.personalInfo.address.city}, {client.personalInfo.address.state}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="truncate">{client.careManager.name}</span>
                </div>
              </div>

              {/* Services */}
              <div className="mt-4">
                <div className="flex flex-wrap gap-1">
                  {client.services.slice(0, 2).map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {service.replace('-', ' ')}
                    </span>
                  ))}
                  {client.services.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{client.services.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  client.status === 'active' ? 'bg-green-100 text-green-700' :
                  client.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {client.status}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600" title="Archive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Created Date */}
              <div className="mt-2 text-xs text-gray-500">
                Created: {new Date(client.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <User className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {selectedClient.personalInfo.firstName.charAt(0)}{selectedClient.personalInfo.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedClient.personalInfo.fullName}</h2>
                    <p className="text-sm text-gray-500">Client ID: {selectedClient.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <p className="text-gray-900">{selectedClient.personalInfo.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedClient.personalInfo.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedClient.personalInfo.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="text-gray-900">
                        {selectedClient.personalInfo.address.street}<br />
                        {selectedClient.personalInfo.address.city}, {selectedClient.personalInfo.address.state} {selectedClient.personalInfo.address.zipCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Care Manager & Services */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Management</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Care Manager</label>
                      <p className="text-gray-900">{selectedClient.careManager.name}</p>
                      <p className="text-sm text-gray-500">{selectedClient.careManager.organization}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Services</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedClient.services.map((service, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                          >
                            {service.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        selectedClient.status === 'active' ? 'bg-green-100 text-green-700' :
                        selectedClient.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {selectedClient.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        selectedClient.case.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        selectedClient.case.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        selectedClient.case.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {selectedClient.case.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement; 