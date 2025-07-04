import { useState } from 'react';
import { Client, PIPELINE_STAGES } from '../../types/client';
import { ClientManager } from '../../managers/ClientManager';
import { 
  X, User, Mail, Phone, MapPin, Building, FileText, 
  Clock, CheckCircle, Plus, Archive, Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface ClientDetailModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated: () => void;
}

const ClientDetailModal = ({ client, isOpen, onClose, onClientUpdated }: ClientDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents' | 'case'>('overview');
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const clientManager = ClientManager.getInstance();

  if (!isOpen) return null;

  const currentStage = PIPELINE_STAGES[client.pipelineStage];
  const completedMilestones = client.case.milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = client.case.milestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setLoading(true);
    try {
      await clientManager.addCaseNote(client.id, newNote, 'general');
      setNewNote('');
      onClientUpdated();
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveClient = async () => {
    if (confirm(`Are you sure you want to archive ${client.personalInfo.fullName}?`)) {
      try {
        await clientManager.archiveClient(client.id);
        onClientUpdated();
        onClose();
      } catch (error) {
        console.error('Error archiving client:', error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'case', label: 'Case Details', icon: Activity },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {client.personalInfo.firstName.charAt(0)}{client.personalInfo.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{client.personalInfo.fullName}</h1>
                <p className="text-blue-100">{client.case.title}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(client.case.priority)}`}>
                    {client.case.priority} priority
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleArchiveClient}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Archive Client"
              >
                <Archive className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Current Stage */}
          <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Current Stage: {currentStage.title}</h3>
                <p className="text-sm text-blue-100">{currentStage.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-blue-100">Progress</div>
              </div>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-3">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-blue-500" />
                      <span className="text-gray-700">{client.personalInfo.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-green-500" />
                      <span className="text-gray-700">{client.personalInfo.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-3 text-red-500" />
                      <span className="text-gray-700">
                        {client.personalInfo.address.street}, {client.personalInfo.address.city}, {client.personalInfo.address.state} {client.personalInfo.address.zipCode}
                      </span>
                    </div>
                    {client.personalInfo.disabilities && client.personalInfo.disabilities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Disabilities:</p>
                        <div className="flex flex-wrap gap-2">
                          {client.personalInfo.disabilities.map((disability, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                              {disability}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {client.services.map((service, index) => (
                      <div key={index} className="flex items-center p-3 bg-white rounded-lg border border-blue-200">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="font-medium text-gray-900">{service.replace('-', ' ').toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Care Manager & Case Info */}
              <div className="space-y-6">
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Care Manager
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900">{client.careManager.name}</p>
                      <p className="text-sm text-gray-600">{client.careManager.title}</p>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-blue-500" />
                      <span className="text-gray-700">{client.careManager.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-3 text-green-500" />
                      <span className="text-gray-700">{client.careManager.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-3 text-purple-500" />
                      <span className="text-gray-700">{client.careManager.organization}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-orange-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{completedMilestones}</div>
                      <div className="text-sm text-gray-600">Completed Milestones</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{client.timeline.length}</div>
                      <div className="text-sm text-gray-600">Timeline Events</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{client.budgets.length}</div>
                      <div className="text-sm text-gray-600">Budgets</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{client.documents.length}</div>
                      <div className="text-sm text-gray-600">Documents</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Add Note */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Timeline Note
                </h3>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note to the timeline..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={loading || !newNote.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {client.timeline.map((event) => (
                  <div key={event.id} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <span className="text-sm text-gray-500">
                          {format(event.date, 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-700">{event.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        {event.author}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Document Management</h3>
                <p className="text-gray-500">Document upload and management features will be implemented here.</p>
              </div>
            </div>
          )}

          {/* Case Tab */}
          {activeTab === 'case' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Case Title</label>
                    <p className="text-gray-900">{client.case.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Broker</label>
                    <p className="text-gray-900">{client.case.assignedBroker}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <p className="text-gray-900">{format(client.case.startDate, 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(client.case.priority)}`}>
                      {client.case.priority}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{client.case.description}</p>
                </div>
              </div>

              {/* Milestones */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
                <div className="space-y-3">
                  {client.case.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-5 h-5 mr-3 ${
                        milestone.status === 'completed' ? 'text-green-500' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                        <p className="text-xs text-gray-500">
                          Target: {format(milestone.targetDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        milestone.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailModal; 