import { useState } from 'react';
import { ClientManager } from '../../managers/ClientManager';
import { OrganizationManager } from '../../managers/OrganizationManager';
import { Client, ServiceType, CasePriority } from '../../types/client';
import { X, User, MapPin, Loader2 } from 'lucide-react';

interface AddClientModalProps {
  onClose: () => void;
  onClientCreated: () => void;
}

const AddClientModal = ({ onClose, onClientCreated }: AddClientModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Personal Info (Required)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Address (Optional)
    street: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Care Manager (Optional)
    careManagerName: '',
    careManagerEmail: '',
    careManagerPhone: '',
    careManagerOrganization: '',
    careManagerTitle: '',
    
    // Services and Case Info
    services: [] as ServiceType[],
    priority: 'medium' as CasePriority,
    caseDescription: ''
  });

  const clientManager = ClientManager.getInstance();
  const orgManager = OrganizationManager.getInstance();

  const serviceOptions: { value: ServiceType; label: string }[] = [
    { value: 'start-up-broker', label: 'Start-up Broker' },
    { value: 'community-habilitation', label: 'Community Habilitation' },
    { value: 'sap', label: 'Supported Apartment Program' },
    { value: 'budgeting', label: 'Budgeting Services' },
    { value: 'case-management', label: 'Case Management' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleServiceToggle = (service: ServiceType) => {
    const isSelected = formData.services.includes(service);
    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(s => s !== service)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    }
  };

  const generateClientId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const currentUser = orgManager.getCurrentUser();
      if (!currentUser?.organizationId) {
        throw new Error('No organization found. Please ensure you are logged in.');
      }

      // Validate required fields only
      if (!formData.firstName.trim()) {
        throw new Error('First name is required');
      }

      if (!formData.lastName.trim()) {
        throw new Error('Last name is required');
      }

      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Default services if none selected
      const selectedServices: ServiceType[] = formData.services.length > 0 ? formData.services : ['case-management'];

      // Create client data structure with defaults
      const clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = {
        organizationId: currentUser.organizationId,
        personalInfo: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || '',
          address: {
            street: formData.street.trim() || '',
            city: formData.city.trim() || '',
            state: formData.state.trim() || '',
            zipCode: formData.zipCode.trim() || '',
            country: 'USA'
          },
                     dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date(),
          disabilities: [],
          specialNeeds: []
        },
        careManager: {
          id: generateClientId(),
          name: formData.careManagerName.trim() || 'Not Assigned',
          email: formData.careManagerEmail.trim() || '',
          phone: formData.careManagerPhone.trim() || '',
          organization: formData.careManagerOrganization.trim() || '',
          title: formData.careManagerTitle.trim() || 'Case Manager'
        },
        services: selectedServices,
        status: 'active',
        pipelineStage: 'lead-intake',
        case: {
          id: generateClientId(),
          clientId: '', // Will be set after client creation
          title: `${formData.firstName.trim()} ${formData.lastName.trim()} - Case`,
          description: formData.caseDescription.trim() || `Case for ${formData.firstName.trim()} ${formData.lastName.trim()}`,
          priority: formData.priority,
          status: 'open',
          assignedBroker: currentUser.displayName || 'System',
          startDate: new Date(),
          notes: [],
          milestones: []
        },
        documents: [],
        budgets: [],
        timeline: [],
        isArchived: false
      };

      console.log('Creating client with data:', clientData);

      // Create the client
      const newClient = await clientManager.createClient(clientData);
      
      console.log('Client created successfully:', newClient);

      // Update the case with the actual client ID
      await clientManager.updateClient(newClient.id, {
        case: {
          ...newClient.case,
          clientId: newClient.id
        }
      });

      console.log('Client case updated with client ID');

      onClientCreated();
    } catch (error) {
      console.error('Error creating client:', error);
      setError(error instanceof Error ? error.message : 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information - Required */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information <span className="text-red-500 ml-1">*</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Address - Optional */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Address <span className="text-sm text-gray-500 font-normal">(Optional)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="IL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="60601"
                  />
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Services <span className="text-sm text-gray-500 font-normal">(Optional - Case Management added by default)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceOptions.map((service) => (
                  <label key={service.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service.value)}
                      onChange={() => handleServiceToggle(service.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{service.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Case Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Case Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Case Description
                  </label>
                  <textarea
                    value={formData.caseDescription}
                    onChange={(e) => handleInputChange('caseDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the client's needs and case details..."
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Creating Client...' : 'Create Client'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal; 