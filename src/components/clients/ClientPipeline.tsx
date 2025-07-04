import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Client, PIPELINE_STAGES, PipelineStage, CustomPipeline, DEFAULT_PIPELINES } from '../../types/client';
import { ClientManager } from '../../managers/ClientManager';
import { Plus, Search, Users, Settings, CheckSquare, Square, User, Phone, Mail, MapPin, ChevronDown, Move, Eye, List, Grid } from 'lucide-react';

const ClientPipeline = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [bulkMoveStage, setBulkMoveStage] = useState<PipelineStage>('lead-intake');
  const [availablePipelines] = useState<CustomPipeline[]>(DEFAULT_PIPELINES);
  const [currentPipeline, setCurrentPipeline] = useState<CustomPipeline>(DEFAULT_PIPELINES[0]);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [availableClients, setAvailableClients] = useState<Client[]>([]);
  const [selectedForImport, setSelectedForImport] = useState<Set<string>>(new Set());
  const clientManager = ClientManager.getInstance();

  useEffect(() => {
    loadClients();
    loadAvailableClients();
  }, [currentPipeline.id]);

  const loadAvailableClients = async () => {
    try {
      const allClients = await clientManager.getAllClients();
      // Show clients not currently in any pipeline
      const unassignedClients = allClients.filter(c => !c.isArchived && !c.pipelineId);
      setAvailableClients(unassignedClients);
    } catch (error) {
      console.error('Error loading available clients:', error);
    }
  };

  const loadClients = async () => {
    try {
      const allClients = await clientManager.getAllClients();
      // Only show clients assigned to current pipeline
      const pipelineClients = allClients.filter(c => !c.isArchived && c.pipelineId === currentPipeline.id);
      setClients(pipelineClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newStage = destination.droppableId as PipelineStage;
    
    try {
      await clientManager.moveClientToPipelineStage(draggableId, newStage);
      await loadClients();
      
      const client = clients.find(c => c.id === draggableId);
      const stageConfig = PIPELINE_STAGES[newStage];
      if (client) {
        showNotification(`${client.personalInfo.fullName} moved to ${stageConfig.title}`, 'success');
      }
    } catch (error) {
      console.error('Error moving client:', error);
      showNotification('Cannot move client to this stage. Please check workflow requirements.', 'error');
    }
  };

  const handleClientPositionChange = async (clientId: string, newStage: PipelineStage) => {
    try {
      await clientManager.moveClientToPipelineStage(clientId, newStage);
      await loadClients();
      setSelectedClient(prev => prev ? {...prev, pipelineStage: newStage} : null);
      showNotification('Client position updated successfully!', 'success');
    } catch (error) {
      showNotification('Error updating client position', 'error');
    }
  };

  const handleClientStatusChange = async (clientId: string, newStatus: 'active' | 'pending' | 'inactive') => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        client.status = newStatus;
        await loadClients();
        setSelectedClient(prev => prev ? {...prev, status: newStatus} : null);
        showNotification('Client status updated successfully!', 'success');
      }
    } catch (error) {
      showNotification('Error updating client status', 'error');
    }
  };

  const handleClientPriorityChange = async (clientId: string, newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    try {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        client.case.priority = newPriority;
        await loadClients();
        setSelectedClient(prev => prev ? {...prev, case: {...prev.case, priority: newPriority}} : null);
        showNotification('Client priority updated successfully!', 'success');
      }
    } catch (error) {
      showNotification('Error updating client priority', 'error');
    }
  };

  const handleBulkMove = async () => {
    if (selectedClients.size === 0) {
      showNotification('No clients selected', 'error');
      return;
    }

    try {
      const movePromises = Array.from(selectedClients).map(clientId => 
        clientManager.moveClientToPipelineStage(clientId, bulkMoveStage)
      );
      
      await Promise.all(movePromises);
      await loadClients();
      setSelectedClients(new Set());
      setBulkActionMode(false);
      const stageName = currentPipeline.stages.find(s => s.id === bulkMoveStage)?.title || 'Unknown Stage';
      showNotification(`${selectedClients.size} clients moved to ${stageName}`, 'success');
    } catch (error) {
      console.error('Bulk move error:', error);
      showNotification('Error moving some clients', 'error');
    }
  };

  const handleImportClients = async () => {
    if (selectedForImport.size === 0) {
      showNotification('No clients selected', 'error');
      return;
    }

    try {
      // Assign selected clients to current pipeline
      for (const clientId of selectedForImport) {
        const client = availableClients.find(c => c.id === clientId);
        if (client) {
          client.pipelineId = currentPipeline.id;
          client.pipelineStage = currentPipeline.stages[0].id as PipelineStage; // First stage
        }
      }
      
      await loadClients();
      await loadAvailableClients();
      setSelectedForImport(new Set());
      setShowClientSelector(false);
      showNotification(`${selectedForImport.size} clients added to ${currentPipeline.name}`, 'success');
    } catch (error) {
      console.error('Import clients error:', error);
      showNotification('Error importing clients', 'error');
    }
  };

  const toggleImportSelection = (clientId: string) => {
    const newSelection = new Set(selectedForImport);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedForImport(newSelection);
  };

  const toggleClientSelection = (clientId: string) => {
    const newSelection = new Set(selectedClients);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedClients(newSelection);
  };

  const toggleAllSelection = () => {
    const filteredClients = getAllFilteredClients();
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredClients.map(c => c.id)));
    }
  };

  const getClientsForStage = (stage: PipelineStage): Client[] => {
    return clients
      .filter(client => client.pipelineStage === stage)
      .filter(client => {
        if (searchTerm) {
          return client.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 client.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
      })
      .filter(client => {
        if (filterStatus === 'all') return true;
        return client.status === filterStatus;
      });
  };

  const getAllFilteredClients = (): Client[] => {
    return clients
      .filter(client => !client.isArchived)
      .filter(client => {
        if (searchTerm) {
          return client.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 client.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return true;
      })
      .filter(client => {
        if (filterStatus === 'all') return true;
        return client.status === filterStatus;
      });
  };

  const getTotalClients = () => clients.filter(c => !c.isArchived).length;
  const getActiveClients = () => clients.filter(c => c.status === 'active' && !c.isArchived).length;

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 text-sm">Loading pipeline...</span>
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

      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Pipelines</h1>
              <p className="text-sm text-gray-600 mt-1">Manage client workflow progression and track status</p>
            </div>
                          <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{getTotalClients()} Total</span>
                  <span>{getActiveClients()} Active</span>
                  {selectedClients.size > 0 && (
                    <span className="text-blue-600 font-medium">{selectedClients.size} Selected</span>
                  )}
                </div>
                
                {/* Pipeline Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Pipeline:</span>
                  <div className="relative">
                    <select
                      value={currentPipeline.id}
                      onChange={(e) => {
                        const pipeline = availablePipelines.find(p => p.id === e.target.value);
                        if (pipeline) {
                          setCurrentPipeline(pipeline);
                          setSelectedClients(new Set());
                          setBulkActionMode(false);
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none min-w-40"
                    >
                      {availablePipelines.map(pipeline => (
                        <option key={pipeline.id} value={pipeline.id}>
                          {pipeline.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => setShowClientSelector(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    title="Manage Pipelines"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode('pipeline')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'pipeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setBulkActionMode(!bulkActionMode)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  bulkActionMode 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {bulkActionMode ? 'Exit Bulk' : 'Bulk Actions'}
              </button>
              <button
                onClick={() => setShowClientSelector(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Import Clients</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
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

            {/* Enhanced Bulk Actions */}
            {bulkActionMode && selectedClients.size > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Move {selectedClients.size} clients to:</span>
                <div className="relative">
                  <select
                    value={bulkMoveStage}
                    onChange={(e) => setBulkMoveStage(e.target.value as PipelineStage)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none min-w-48"
                  >
                    {currentPipeline.stages.map(stage => (
                      <option key={stage.id} value={stage.id}>
                        {stage.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <button
                  onClick={handleBulkMove}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Move className="w-4 h-4" />
                  <span>Move</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline or List View */}
      <div className="p-6 h-[calc(100vh-200px)]">
        {viewMode === 'pipeline' ? (
          // Pipeline View - Taller containers
          <div className="overflow-x-auto h-full">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex space-x-6 min-w-max h-full">
                {currentPipeline.stages
                  .sort((a, b) => a.order - b.order)
                  .map((stageConfig) => {
                    const stageClients = getClientsForStage(stageConfig.id as PipelineStage);
                    
                    return (
                      <div key={stageConfig.id} className="bg-white rounded-lg border border-gray-200 w-80 flex-shrink-0 h-full flex flex-col">
                        {/* Clean Stage Header */}
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">{stageConfig.title}</h3>
                              <p className="text-xs text-gray-500 mt-1 truncate">{stageConfig.description}</p>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                              <span className="text-xs text-gray-500">{stageClients.length}</span>
                              <div 
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: stageConfig.color }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Droppable Area - Full height */}
                        <Droppable droppableId={stageConfig.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`p-3 flex-1 overflow-y-auto space-y-3 ${
                                snapshot.isDraggingOver ? 'bg-blue-50' : ''
                              }`}
                            >
                              {stageClients.map((client, index) => (
                                <Draggable
                                  key={client.id}
                                  draggableId={client.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`bg-white border rounded-lg p-3 cursor-pointer transition-all ${
                                        snapshot.isDragging 
                                          ? 'shadow-lg border-blue-300' 
                                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                      } ${
                                        selectedClients.has(client.id) ? 'ring-2 ring-blue-500 border-blue-300' : ''
                                      }`}
                                      onClick={() => bulkActionMode ? toggleClientSelection(client.id) : setSelectedClient(client)}
                                    >
                                      {/* Clean Client Card */}
                                      <div className="space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                                            {bulkActionMode && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleClientSelection(client.id);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                                              >
                                                {selectedClients.has(client.id) ? 
                                                  <CheckSquare className="w-4 h-4" /> : 
                                                  <Square className="w-4 h-4" />
                                                }
                                              </button>
                                            )}
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                              <span className="text-sm font-medium text-gray-700">
                                                {client.personalInfo.firstName.charAt(0)}{client.personalInfo.lastName.charAt(0)}
                                              </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <h4 className="text-sm font-medium text-gray-900 truncate">{client.personalInfo.fullName}</h4>
                                              <p className="text-xs text-gray-500 truncate">ID: {client.id}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-1 flex-shrink-0">
                                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                                              client.case.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                              client.case.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                              client.case.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                              'bg-green-100 text-green-700'
                                            }`}>
                                              {client.case.priority}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="space-y-1">
                                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                                            <Mail className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{client.personalInfo.email}</span>
                                          </div>
                                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                                            <Phone className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{client.personalInfo.phone}</span>
                                          </div>
                                        </div>

                                        {/* Care Manager */}
                                        <div className="text-xs text-gray-600">
                                          <span className="font-medium">Manager:</span> 
                                          <span className="truncate ml-1">{client.careManager.name}</span>
                                        </div>

                                        {/* Status & Progress */}
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between text-xs">
                                            <span className={`px-2 py-1 rounded font-medium ${
                                              client.status === 'active' ? 'bg-green-100 text-green-700' :
                                              client.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                              'bg-red-100 text-red-700'
                                            }`}>
                                              {client.status}
                                            </span>
                                            <span className="text-gray-500">
                                              {new Date(client.createdAt).toLocaleDateString()}
                                            </span>
                                          </div>

                                          {/* Progress Bar */}
                                          <div>
                                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                              <span>Progress</span>
                                              <span>
                                                {client.case.milestones.filter(m => m.status === 'completed').length}/{client.case.milestones.length}
                                              </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1">
                                              <div 
                                                className="bg-blue-500 h-1 rounded-full transition-all"
                                                style={{ 
                                                  width: `${client.case.milestones.length > 0 ? 
                                                    (client.case.milestones.filter(m => m.status === 'completed').length / client.case.milestones.length) * 100 
                                                    : 0}%` 
                                                }}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              
                              {stageClients.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                  <div className="text-sm">No clients</div>
                                  <div className="text-xs mt-1">Drag clients here</div>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
              </div>
            </DragDropContext>
          </div>
        ) : (
          // Enhanced List View with Bulk Actions
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {bulkActionMode && (
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={toggleAllSelection}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {selectedClients.size === getAllFilteredClients().length && getAllFilteredClients().length > 0 ? 
                            <CheckSquare className="w-4 h-4" /> : 
                            <Square className="w-4 h-4" />
                          }
                        </button>
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getAllFilteredClients().map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      {bulkActionMode && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleClientSelection(client.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {selectedClients.has(client.id) ? 
                              <CheckSquare className="w-4 h-4" /> : 
                              <Square className="w-4 h-4" />
                            }
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {client.personalInfo.firstName.charAt(0)}{client.personalInfo.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{client.personalInfo.fullName}</div>
                            <div className="text-sm text-gray-500">{client.personalInfo.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: (currentPipeline.stages.find(s => s.id === client.pipelineStage)?.color || '#6B7280') + '20',
                            color: currentPipeline.stages.find(s => s.id === client.pipelineStage)?.color || '#6B7280'
                          }}
                        >
                          {currentPipeline.stages.find(s => s.id === client.pipelineStage)?.title || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.case.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          client.case.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          client.case.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {client.case.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.status === 'active' ? 'bg-green-100 text-green-800' :
                          client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {client.careManager.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ 
                                width: `${client.case.milestones.length > 0 ? 
                                  (client.case.milestones.filter(m => m.status === 'completed').length / client.case.milestones.length) * 100 
                                  : 0}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {client.case.milestones.filter(m => m.status === 'completed').length}/{client.case.milestones.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Clean Client Detail Modal with Dropdown */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-700">
                      {selectedClient.personalInfo.firstName.charAt(0)}{selectedClient.personalInfo.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedClient.personalInfo.fullName}</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{selectedClient.personalInfo.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{selectedClient.personalInfo.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{`${selectedClient.personalInfo.address.street}, ${selectedClient.personalInfo.address.city}, ${selectedClient.personalInfo.address.state} ${selectedClient.personalInfo.address.zipCode}`}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Care Manager</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><span className="font-medium">Name:</span> {selectedClient.careManager.name}</div>
                      <div><span className="font-medium">Email:</span> {selectedClient.careManager.email}</div>
                      <div><span className="font-medium">Organization:</span> {selectedClient.careManager.organization}</div>
                    </div>
                  </div>
                </div>

                {/* Case Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Pipeline Position</h3>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="font-medium">Current:</span> {currentPipeline.stages.find(s => s.id === selectedClient.pipelineStage)?.title || 'Unknown'}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Move to:</label>
                        <div className="relative">
                          <select
                            value={selectedClient.pipelineStage}
                            onChange={(e) => handleClientPositionChange(selectedClient.id, e.target.value as PipelineStage)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
                          >
                            {currentPipeline.stages.map(stage => (
                              <option key={stage.id} value={stage.id}>
                                {stage.title} - {stage.description}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Case Management</h3>
                    <div className="space-y-4 text-sm">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority:</label>
                        <div className="relative">
                          <select
                            value={selectedClient.case.priority}
                            onChange={(e) => handleClientPriorityChange(selectedClient.id, e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent Priority</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
                        <div className="relative">
                          <select
                            value={selectedClient.status}
                            onChange={(e) => handleClientStatusChange(selectedClient.id, e.target.value as 'active' | 'pending' | 'inactive')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Created:</span> {new Date(selectedClient.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Selector Modal */}
      {showClientSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Import Clients to {currentPipeline.name}</h2>
                  <p className="text-sm text-gray-500">Select clients to add to this pipeline workflow</p>
                </div>
                <button
                  onClick={() => setShowClientSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {availableClients.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Users className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Clients</h3>
                  <p className="text-gray-500">All clients are already assigned to pipelines</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableClients.map((client) => (
                    <div
                      key={client.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedForImport.has(client.id) 
                          ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleImportSelection(client.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {selectedForImport.has(client.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {client.personalInfo.firstName.charAt(0)}{client.personalInfo.lastName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm truncate">{client.personalInfo.fullName}</h4>
                              <p className="text-xs text-gray-500">ID: {client.id}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{client.personalInfo.email}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <User className="w-3 h-3" />
                              <span className="truncate">{client.careManager.name}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              client.status === 'active' ? 'bg-green-100 text-green-700' :
                              client.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {client.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {availableClients.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedForImport.size} of {availableClients.length} clients selected
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowClientSelector(false)}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImportClients}
                      disabled={selectedForImport.size === 0}
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Import {selectedForImport.size} Client{selectedForImport.size !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPipeline; 