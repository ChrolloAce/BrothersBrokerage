import { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Building } from 'lucide-react';
import { PersonalInfo, CareManager as CareManagerType, ServiceType } from '../../types/client';
import { ClientManager } from '../../managers/ClientManager';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: () => void;
}

const AddClientModal = ({ isOpen, onClose, onClientAdded }: AddClientModalProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // Personal Info Form
  const [personalInfo, setPersonalInfo] = useState<Partial<PersonalInfo>>({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    disabilities: [],
    specialNeeds: []
  });

  // Care Manager Form
  const [careManager, setCareManager] = useState<Partial<CareManagerType>>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    title: ''
  });

  // Services
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);

  const serviceOptions: { value: ServiceType; label: string; description: string }[] = [
    { value: 'start-up-broker', label: 'Start-Up Broker Services', description: 'Initial broker setup and coordination' },
    { value: 'community-habilitation', label: 'Community Habilitation', description: 'Community integration support' },
    { value: 'sap', label: 'Staff Action Plan (SAP)', description: 'Individualized support planning' },
    { value: 'budgeting', label: 'Budget Management', description: 'Financial planning and oversight' },
    { value: 'case-management', label: 'Case Management', description: 'Comprehensive case coordination' }
  ];

  const handlePersonalInfoChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPersonalInfo(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof PersonalInfo],
          [child]: value
        }
      }));
    } else {
      setPersonalInfo(prev => ({
        ...prev,
        [field]: value,
        ...(field === 'firstName' || field === 'lastName' ? {
          fullName: field === 'firstName' 
            ? `${value} ${prev.lastName || ''}`.trim()
            : `${prev.firstName || ''} ${value}`.trim()
        } : {})
      }));
    }
  };

  const handleCareManagerChange = (field: string, value: string) => {
    setCareManager(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (service: ServiceType) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const clientManager = ClientManager.getInstance();
      
      await clientManager.createClient(
        personalInfo as PersonalInfo,
        { ...careManager, id: Math.random().toString(36).substr(2, 9) } as CareManagerType,
        selectedServices
      );

      onClientAdded();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Error creating client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPersonalInfo({
      firstName: '',
      lastName: '',
      fullName: '',
      email: '',
      phone: '',
      address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
      disabilities: [],
      specialNeeds: []
    });
    setCareManager({
      name: '',
      email: '',
      phone: '',
      organization: '',
      title: ''
    });
    setSelectedServices([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-90vh overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Step Indicator */}
          <div className="flex items-center mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step > stepNumber ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={personalInfo.firstName || ''}
                    onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={personalInfo.lastName || ''}
                    onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={personalInfo.email || ''}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={personalInfo.phone || ''}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={personalInfo.address?.street || ''}
                    onChange={(e) => handlePersonalInfoChange('address.street', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={personalInfo.address?.city || ''}
                    onChange={(e) => handlePersonalInfoChange('address.city', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={personalInfo.address?.state || ''}
                    onChange={(e) => handlePersonalInfoChange('address.state', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={personalInfo.address?.zipCode || ''}
                    onChange={(e) => handlePersonalInfoChange('address.zipCode', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Care Manager */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Care Manager Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Care Manager Name</label>
                <input
                  type="text"
                  value={careManager.name || ''}
                  onChange={(e) => handleCareManagerChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={careManager.email || ''}
                    onChange={(e) => handleCareManagerChange('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={careManager.phone || ''}
                    onChange={(e) => handleCareManagerChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <input
                    type="text"
                    value={careManager.organization || ''}
                    onChange={(e) => handleCareManagerChange('organization', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={careManager.title || ''}
                    onChange={(e) => handleCareManagerChange('title', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Select Services</h3>
              
              <div className="space-y-3">
                {serviceOptions.map((service) => (
                  <div key={service.value} className="border border-gray-200 rounded-lg p-4">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.value)}
                        onChange={() => handleServiceToggle(service.value)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{service.label}</div>
                        <div className="text-sm text-gray-600">{service.description}</div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading || selectedServices.length === 0}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Client'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal; 