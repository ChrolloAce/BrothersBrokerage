import { 
  Client, 
  ClientCase, 
  PipelineStage, 
  TimelineEvent, 
  TimelineEventType,
  PIPELINE_STAGES,
  PersonalInfo,
  CareManager as CareManagerType,
  ServiceType
} from '../types/client';

export class ClientManager {
  private static instance: ClientManager;
  private clients: Client[] = [];

  public static getInstance(): ClientManager {
    if (!ClientManager.instance) {
      ClientManager.instance = new ClientManager();
    }
    return ClientManager.instance;
  }

  constructor() {
    this.loadMockData();
  }

  // CRUD Operations
  public async getAllClients(includeArchived: boolean = false): Promise<Client[]> {
    if (includeArchived) {
      return this.clients;
    }
    return this.clients.filter(client => !client.isArchived);
  }

  public async getClientById(id: string): Promise<Client | null> {
    return this.clients.find(client => client.id === id) || null;
  }

  public async createClient(
    personalInfo: PersonalInfo,
    careManager: CareManagerType,
    services: ServiceType[]
  ): Promise<Client> {
    const clientId = this.generateId();
    const caseId = this.generateId();
    
    const clientCase: ClientCase = {
      id: caseId,
      clientId,
      title: `${personalInfo.fullName} - Broker Services Case`,
      description: `Comprehensive broker services case for ${personalInfo.fullName}`,
      priority: 'medium',
      status: 'open',
      assignedBroker: 'Ali Husni',
      startDate: new Date(),
      notes: [],
      milestones: this.generateDefaultMilestones(caseId)
    };

    const client: Client = {
      id: clientId,
      personalInfo,
      careManager,
      services,
      status: 'active',
      pipelineStage: 'lead-intake',
      case: clientCase,
      documents: [],
      budgets: [],
      timeline: [this.createTimelineEvent(clientId, 'client-created', 'Client Created', 'New client has been added to the system')],
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false
    };

    this.clients.push(client);
    return client;
  }

  public async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    const clientIndex = this.clients.findIndex(client => client.id === id);
    if (clientIndex === -1) return null;

    this.clients[clientIndex] = {
      ...this.clients[clientIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.clients[clientIndex];
  }

  public async archiveClient(id: string): Promise<boolean> {
    const client = await this.getClientById(id);
    if (!client) return false;

    client.isArchived = true;
    client.archivedAt = new Date();
    client.status = 'inactive';

    this.addTimelineEvent(id, 'status-changed', 'Client Archived', 'Client has been archived');
    return true;
  }

  public async unarchiveClient(id: string): Promise<boolean> {
    const client = await this.getClientById(id);
    if (!client) return false;

    client.isArchived = false;
    client.archivedAt = undefined;
    client.status = 'active';

    this.addTimelineEvent(id, 'status-changed', 'Client Unarchived', 'Client has been unarchived');
    return true;
  }

  // Pipeline Management
  public async moveClientToPipelineStage(clientId: string, newStage: PipelineStage): Promise<boolean> {
    const client = await this.getClientById(clientId);
    if (!client) return false;

    const currentStage = client.pipelineStage;
    const currentStageConfig = PIPELINE_STAGES[currentStage];
    
    // Check if transition is allowed
    if (!currentStageConfig.allowedTransitions.includes(newStage)) {
      throw new Error(`Cannot move from ${currentStage} to ${newStage}`);
    }

    client.pipelineStage = newStage;
    client.updatedAt = new Date();

    const newStageConfig = PIPELINE_STAGES[newStage];
    this.addTimelineEvent(
      clientId, 
      'stage-moved', 
      `Moved to ${newStageConfig.title}`, 
      `Client moved from ${currentStageConfig.title} to ${newStageConfig.title}`
    );

    // Execute automated actions for new stage
    await this.executeAutomatedActions(client, newStageConfig.automatedActions);

    return true;
  }

  public getClientsByPipelineStage(stage: PipelineStage): Client[] {
    return this.clients.filter(client => 
      client.pipelineStage === stage && !client.isArchived
    );
  }

  public getPipelineStatistics(): Record<PipelineStage, number> {
    const stats: Record<PipelineStage, number> = {
      'lead-intake': 0,
      'client-onboarding': 0,
      'budget-processing': 0,
      'document-management': 0,
      'billing-automation': 0,
      'completed': 0
    };

    this.clients
      .filter(client => !client.isArchived)
      .forEach(client => {
        stats[client.pipelineStage]++;
      });

    return stats;
  }

  // Timeline Management
  public addTimelineEvent(
    clientId: string, 
    type: TimelineEventType, 
    title: string, 
    description: string,
    metadata?: Record<string, any>
  ): void {
    const client = this.clients.find(c => c.id === clientId);
    if (!client) return;

    const event = this.createTimelineEvent(clientId, type, title, description, metadata);
    client.timeline.unshift(event);
    client.updatedAt = new Date();
  }

  private createTimelineEvent(
    clientId: string,
    type: TimelineEventType,
    title: string,
    description: string,
    metadata?: Record<string, any>
  ): TimelineEvent {
    return {
      id: this.generateId(),
      clientId,
      type,
      title,
      description,
      date: new Date(),
      author: 'Ali Husni',
      metadata
    };
  }

  // Case Management
  public async addCaseNote(clientId: string, content: string, type: 'general' | 'meeting' | 'phone-call' | 'email' | 'document' | 'milestone' = 'general'): Promise<boolean> {
    const client = await this.getClientById(clientId);
    if (!client) return false;

    const note = {
      id: this.generateId(),
      content,
      author: 'Ali Husni',
      createdAt: new Date(),
      type
    };

    client.case.notes.unshift(note);
    this.addTimelineEvent(clientId, 'note-added', 'Case Note Added', content);
    
    return true;
  }

  // Automated Actions
  private async executeAutomatedActions(client: Client, actions: string[]): Promise<void> {
    for (const action of actions) {
      switch (action) {
        case 'send-intake-form':
          console.log(`Sending intake form to ${client.personalInfo.email}`);
          break;
        case 'create-google-sheet-entry':
          console.log(`Creating Google Sheet entry for ${client.personalInfo.fullName}`);
          break;
        case 'send-broker-agreement':
          console.log(`Sending broker agreement to ${client.personalInfo.email}`);
          break;
        case 'schedule-intake-meeting':
          console.log(`Scheduling intake meeting with ${client.personalInfo.fullName}`);
          break;
        case 'create-budget':
          console.log(`Creating budget for ${client.personalInfo.fullName}`);
          break;
        case 'submit-to-fi':
          console.log(`Submitting budget to Fiscal Intermediary`);
          break;
        case 'request-documents':
          console.log(`Requesting documents from care manager`);
          break;
        case 'validate-documents':
          console.log(`Validating submitted documents`);
          break;
        case 'generate-invoices':
          console.log(`Generating invoices for ${client.personalInfo.fullName}`);
          break;
        case 'submit-billing':
          console.log(`Submitting billing for ${client.personalInfo.fullName}`);
          break;
        case 'archive-case':
          console.log(`Archiving case for ${client.personalInfo.fullName}`);
          break;
        case 'send-completion-notice':
          console.log(`Sending completion notice to ${client.personalInfo.email}`);
          break;
      }
    }
  }

  // Utility Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateDefaultMilestones(_caseId: string) {
    return [
      {
        id: this.generateId(),
        title: 'Initial Contact',
        description: 'Make initial contact with client and care manager',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        status: 'pending' as const
      },
      {
        id: this.generateId(),
        title: 'Broker Agreement Signed',
        description: 'Complete and receive signed broker agreement',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        status: 'pending' as const
      },
      {
        id: this.generateId(),
        title: 'Budget Approval',
        description: 'Receive budget approval from Fiscal Intermediary',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
        status: 'pending' as const
      }
    ];
  }

  // Mock Data
  private loadMockData(): void {
    const mockClients: Client[] = [
      {
        id: 'client-1',
        personalInfo: {
          firstName: 'Joshua',
          lastName: 'Burt',
          fullName: 'Joshua Burt',
          email: 'peacemaker1nn@gmail.com',
          phone: '(555) 123-4567',
          address: {
            street: '123 Main St',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            country: 'USA'
          },
          dateOfBirth: new Date('1985-03-15'),
          disabilities: ['Developmental Disability'],
          specialNeeds: ['Mobility Assistance']
        },
        careManager: {
          id: 'cm-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@careservices.com',
          phone: '(555) 987-6543',
          organization: 'Community Care Services',
          title: 'Case Manager'
        },
        services: ['start-up-broker', 'budgeting'],
        status: 'active',
        pipelineStage: 'client-onboarding',
        case: {
          id: 'case-1',
          clientId: 'client-1',
          title: 'Joshua Burt - Broker Services Case',
          description: 'Comprehensive broker services case',
          priority: 'high',
          status: 'in-progress',
          assignedBroker: 'Ali Husni',
          startDate: new Date('2023-12-01'),
          notes: [],
          milestones: []
        },
        documents: [],
        budgets: [],
        timeline: [],
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date(),
        isArchived: false
      },
      {
        id: 'client-2',
        personalInfo: {
          firstName: 'Emily',
          lastName: 'Davis',
          fullName: 'Emily Davis',
          email: 'emily.davis@email.com',
          phone: '(555) 234-5678',
          address: {
            street: '456 Oak Ave',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          },
          dateOfBirth: new Date('1990-07-22'),
          disabilities: ['Intellectual Disability'],
          specialNeeds: ['Communication Support']
        },
        careManager: {
          id: 'cm-2',
          name: 'Michael Chen',
          email: 'michael.chen@supportservices.org',
          phone: '(555) 876-5432',
          organization: 'Support Services Inc',
          title: 'Support Coordinator'
        },
        services: ['community-habilitation', 'sap'],
        status: 'active',
        pipelineStage: 'budget-processing',
        case: {
          id: 'case-2',
          clientId: 'client-2',
          title: 'Emily Davis - Community Support Case',
          description: 'Community habilitation and support services',
          priority: 'medium',
          status: 'in-progress',
          assignedBroker: 'Ali Husni',
          startDate: new Date('2023-11-15'),
          notes: [],
          milestones: []
        },
        documents: [],
        budgets: [],
        timeline: [],
        createdAt: new Date('2023-11-15'),
        updatedAt: new Date(),
        isArchived: false
      }
    ];

    this.clients = mockClients;
  }
} 