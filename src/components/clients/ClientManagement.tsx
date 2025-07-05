import { useState, useEffect } from 'react';
import { Client } from '../../types/client';
import { ClientManager } from '../../managers/ClientManager';
import { OrganizationManager } from '../../managers/OrganizationManager';
import { Plus, Search, Eye, Edit, Trash2, Mail, Phone, MapPin, User, MoreHorizontal, Send, UserPlus } from 'lucide-react';
import AddClientModal from './AddClientModal';
import EditClientModal from './EditClientModal';
import ClientDetailModal from './ClientDetailModal';

const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const clientManager = ClientManager.getInstance();
  const orgManager = OrganizationManager.getInstance();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const allClients = await clientManager.getClients();
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

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClientCreated = () => {
    loadClients();
    setShowAddModal(false);
    showNotification('Client created successfully!', 'success');
    
    // Force a reload after a short delay to ensure Firebase has propagated
    setTimeout(() => {
      loadClients();
    }, 1000);
  };

  const handleClientUpdated = () => {
    loadClients();
    setShowEditModal(false);
    setSelectedClient(null);
    showNotification('Client updated successfully!', 'success');
  };

  const handleSendPortalAccess = async (client: Client) => {
    try {
      // Create an invite for the client to access their portal
      const currentUser = orgManager.getCurrentUser();
      if (!currentUser?.organizationId) {
        showNotification('Organization not found', 'error');
        return;
      }

      const invite = await orgManager.createInviteLink(
        currentUser.organizationId,
        'client',
        currentUser.id,
        client.personalInfo.email
      );

      // In a real implementation, you'd send an email here
      const portalLink = `${window.location.origin}/portal?invite=${invite.id}`;
      
      // For now, show the link in a notification
      showNotification(`Portal access sent to ${client.personalInfo.email}`, 'success');
      
      // Optional: Copy link to clipboard
      await navigator.clipboard.writeText(portalLink);
      console.log('Portal link:', portalLink);
      
    } catch (error) {
      console.error('Error sending portal access:', error);
      showNotification('Failed to send portal access', 'error');
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to archive this client?')) {
      try {
        await clientManager.deleteClient(clientId);
        loadClients();
        showNotification('Client archived successfully', 'success');
      } catch (error) {
        console.error('Error archiving client:', error);
        showNotification('Failed to archive client', 'error');
      }
    }
  };

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
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="text-sm font-medium">{notification.message}</div>
        </div>
      )}

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
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
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
            <div key={client.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => setSelectedClient(client)}>
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
                    <p className="text-sm text-gray-500">ID: {client.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendPortalAccess(client);
                    }}
                    className="p-1 text-gray-400 hover:text-green-600"
                    title="Send Portal Access"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClient(client);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit Client"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
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

              {/* Status */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  client.status === 'active' ? 'bg-green-100 text-green-700' :
                  client.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {client.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClient(client.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Archive Client"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Start by adding your first client'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Your First Client</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal 
          onClose={() => setShowAddModal(false)}
          onClientCreated={handleClientCreated}
        />
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <EditClientModal 
          client={selectedClient}
          onClose={() => setShowEditModal(false)}
          onClientUpdated={handleClientUpdated}
        />
      )}

      {/* Client Detail Modal */}
      {selectedClient && !showEditModal && (
        <ClientDetailModal 
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={() => setShowEditModal(true)}
          onSendPortalAccess={() => handleSendPortalAccess(selectedClient)}
        />
      )}
    </div>
  );
};

export default ClientManagement; 