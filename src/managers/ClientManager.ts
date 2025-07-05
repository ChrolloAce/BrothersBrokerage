import { 
  Client, 
  PipelineStage, 
  TimelineEvent, 
  TimelineEventType,
  PIPELINE_STAGES,
  ClientStatus
} from '../types/client';
import { OrganizationManager } from './OrganizationManager';

export class ClientManager {
  private static instance: ClientManager;
  private orgManager: OrganizationManager;

  public static getInstance(): ClientManager {
    if (!ClientManager.instance) {
      ClientManager.instance = new ClientManager();
    }
    return ClientManager.instance;
  }

  constructor() {
    this.orgManager = OrganizationManager.getInstance();
  }

  // Get clients for current organization
  async getClients(): Promise<Client[]> {
    try {
      const currentUser = this.orgManager.getCurrentUser();
      if (!currentUser?.organizationId) {
        console.warn('No organization ID found for current user');
        return [];
      }

      return await this.orgManager.getOrganizationClientsData(currentUser.organizationId);
    } catch (error) {
      console.error('Error getting clients:', error);
      return [];
    }
  }

  async getClientById(id: string): Promise<Client | null> {
    try {
      return await this.orgManager.getClient(id);
    } catch (error) {
      console.error('Error getting client by ID:', error);
      return null;
    }
  }

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    try {
      const currentUser = this.orgManager.getCurrentUser();
      if (!currentUser?.organizationId) {
        throw new Error('No organization ID found for current user');
      }

      // Ensure client belongs to current organization
      const clientWithOrganization = {
        ...clientData,
        organizationId: currentUser.organizationId
      };

      return await this.orgManager.createClient(clientWithOrganization);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    try {
      await this.orgManager.updateClient(id, updates);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      // Archive instead of delete
      await this.updateClient(id, { 
        status: 'inactive' as ClientStatus,
        isArchived: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  // Pipeline methods
  async moveClientToPipelineStage(clientId: string, newStage: PipelineStage): Promise<void> {
    try {
      const client = await this.getClientById(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Validate stage exists
      if (!PIPELINE_STAGES[newStage]) {
        throw new Error(`Invalid pipeline stage: ${newStage}`);
      }

      // Create timeline event for stage change
      const stageConfig = PIPELINE_STAGES[newStage];
      const timelineEvent: TimelineEvent = {
        id: this.generateId(),
        clientId: clientId,
        type: 'stage-change' as TimelineEventType,
        title: `Moved to ${stageConfig.title}`,
        description: `Client moved to ${stageConfig.title} stage`,
        date: new Date(),
        author: this.orgManager.getCurrentUser()?.displayName || 'System'
      };

      // Update client with new stage and timeline event
      await this.updateClient(clientId, {
        pipelineStage: newStage,
        timeline: [...(client.timeline || []), timelineEvent],
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error moving client to pipeline stage:', error);
      throw error;
    }
  }

  async assignClientToPipeline(clientId: string, pipelineId: string, initialStage: PipelineStage): Promise<void> {
    try {
      const client = await this.getClientById(clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      const timelineEvent: TimelineEvent = {
        id: this.generateId(),
        clientId: clientId,
        type: 'pipeline-assigned' as TimelineEventType,
        title: 'Assigned to Pipeline',
        description: `Client assigned to pipeline and placed in ${PIPELINE_STAGES[initialStage].title} stage`,
        date: new Date(),
        author: this.orgManager.getCurrentUser()?.displayName || 'System'
      };

      await this.updateClient(clientId, {
        pipelineId,
        pipelineStage: initialStage,
        timeline: [...(client.timeline || []), timelineEvent],
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error assigning client to pipeline:', error);
      throw error;
    }
  }

  // Search and filtering
  async searchClients(query: string): Promise<Client[]> {
    try {
      const clients = await this.getClients();
      const searchLower = query.toLowerCase();
      
      return clients.filter(client =>
        client.personalInfo.firstName.toLowerCase().includes(searchLower) ||
        client.personalInfo.lastName.toLowerCase().includes(searchLower) ||
        client.personalInfo.email.toLowerCase().includes(searchLower) ||
        client.personalInfo.phone?.toLowerCase().includes(searchLower)
      );
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  }

  async getClientsByStatus(status: ClientStatus): Promise<Client[]> {
    try {
      const clients = await this.getClients();
      return clients.filter(client => client.status === status);
    } catch (error) {
      console.error('Error getting clients by status:', error);
      return [];
    }
  }

  // Analytics and reporting
  async getClientStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    pending: number;
    completed: number;
  }> {
    try {
      const clients = await this.getClients();
      
      return {
        total: clients.length,
        active: clients.filter(c => c.status === 'active').length,
        inactive: clients.filter(c => c.status === 'inactive').length,
        suspended: clients.filter(c => c.status === 'suspended').length,
        pending: clients.filter(c => c.status === 'pending').length,
        completed: clients.filter(c => c.status === 'completed').length
      };
    } catch (error) {
      console.error('Error getting client statistics:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        pending: 0,
        completed: 0
      };
    }
  }

  // Real-time updates
  subscribeToClients(callback: (clients: Client[]) => void): string {
    const currentUser = this.orgManager.getCurrentUser();
    if (!currentUser?.organizationId) {
      console.warn('No organization ID found for subscription');
      return '';
    }

    return this.orgManager.subscribeToOrganizationClients(currentUser.organizationId, callback);
  }

  unsubscribe(listenerId: string): void {
    this.orgManager.unsubscribe(listenerId);
  }

  // Data validation
  validateClientData(clientData: Partial<Client>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!clientData.personalInfo?.firstName?.trim()) {
      errors.push('First name is required');
    }

    if (!clientData.personalInfo?.lastName?.trim()) {
      errors.push('Last name is required');
    }

    if (!clientData.personalInfo?.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.personalInfo.email)) {
      errors.push('Valid email is required');
    }

    if (clientData.personalInfo?.phone && !/^\+?[\d\s\-\(\)]+$/.test(clientData.personalInfo.phone)) {
      errors.push('Valid phone number is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 