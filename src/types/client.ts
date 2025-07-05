export interface Client {
  id: string;
  organizationId: string; // Organization this client belongs to
  personalInfo: PersonalInfo;
  careManager: CareManager;
  services: ServiceType[];
  status: ClientStatus;
  pipelineStage: PipelineStage;
  case: ClientCase;
  documents: ClientDocument[];
  budgets: Budget[];
  timeline: TimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  isArchived: boolean;
  pipelineId?: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: Address;
  dateOfBirth: Date;
  emergencyContact?: EmergencyContact;
  disabilities?: string[];
  specialNeeds?: string[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface CareManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  title: string;
}

export interface ClientCase {
  id: string;
  clientId: string;
  title: string;
  description: string;
  priority: CasePriority;
  status: CaseStatus;
  assignedBroker: string;
  startDate: Date;
  targetCompletionDate?: Date;
  completedDate?: Date;
  notes: CaseNote[];
  milestones: CaseMilestone[];
}

export interface CaseNote {
  id: string;
  content: string;
  author: string;
  createdAt: Date;
  type: NoteType;
}

export interface CaseMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: MilestoneStatus;
}

export interface ClientDocument {
  id: string;
  clientId: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadDate: Date;
  uploadedBy: string;
  required: boolean;
  received: boolean;
  expirationDate?: Date;
  status: DocumentStatus;
}

export interface Budget {
  id: string;
  clientId: string;
  type: BudgetType;
  amount: number;
  status: BudgetStatus;
  submissionDate: Date;
  approvalDate?: Date;
  fiscalYear: string;
  fiscalIntermediary: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  clientId: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: Date;
  author: string;
  metadata?: Record<string, any>;
}

// Enums and Types
export type ClientStatus = 'active' | 'pending' | 'inactive' | 'suspended' | 'completed';

export type PipelineStage = 
  | 'lead-intake' 
  | 'client-onboarding' 
  | 'budget-processing' 
  | 'document-management' 
  | 'billing-automation' 
  | 'completed';

export type ServiceType = 
  | 'start-up-broker' 
  | 'community-habilitation' 
  | 'sap' 
  | 'budgeting' 
  | 'case-management';

export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export type CaseStatus = 
  | 'open' 
  | 'in-progress' 
  | 'waiting-client' 
  | 'waiting-approval' 
  | 'completed' 
  | 'on-hold' 
  | 'cancelled';

export type NoteType = 'general' | 'meeting' | 'phone-call' | 'email' | 'document' | 'milestone';

export type MilestoneStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export type DocumentType = 
  | 'life-plan' 
  | 'loc-form' 
  | 'nod' 
  | 'ddp2-profile' 
  | 'service-auth' 
  | 'safeguards' 
  | 'psych-eval' 
  | 'broker-agreement' 
  | 'sap';

export type DocumentStatus = 'pending' | 'received' | 'approved' | 'rejected' | 'expired';

export type BudgetType = 'start-up' | 'initial' | 'cnba';

export type BudgetStatus = 'draft' | 'submitted' | 'approved' | 'revision-requested' | 'rejected';

export type TimelineEventType = 
  | 'client-created' 
  | 'status-changed' 
  | 'stage-moved' 
  | 'document-uploaded' 
  | 'budget-submitted' 
  | 'meeting-scheduled' 
  | 'note-added' 
  | 'milestone-completed';

// Pipeline Configuration
export interface PipelineStageConfig {
  id: PipelineStage;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  order: number;
  allowedTransitions: PipelineStage[];
  requiredDocuments: DocumentType[];
  automatedActions: string[];
}

export const PIPELINE_STAGES: Record<PipelineStage, PipelineStageConfig> = {
  'lead-intake': {
    id: 'lead-intake',
    title: 'Lead Intake',
    description: 'Initial contact and form collection',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    order: 1,
    allowedTransitions: ['client-onboarding'],
    requiredDocuments: [],
    automatedActions: ['send-intake-form', 'create-google-sheet-entry']
  },
  'client-onboarding': {
    id: 'client-onboarding',
    title: 'Client Onboarding',
    description: 'Broker agreement and documentation',
    color: '#10B981',
    bgColor: '#ECFDF5',
    order: 2,
    allowedTransitions: ['budget-processing', 'document-management'],
    requiredDocuments: ['broker-agreement'],
    automatedActions: ['send-broker-agreement', 'schedule-intake-meeting']
  },
  'budget-processing': {
    id: 'budget-processing',
    title: 'Budget Processing',
    description: 'Start-up, Initial & CNBA budgets',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    order: 3,
    allowedTransitions: ['document-management', 'billing-automation'],
    requiredDocuments: ['life-plan', 'loc-form', 'ddp2-profile'],
    automatedActions: ['create-budget', 'submit-to-fi']
  },
  'document-management': {
    id: 'document-management',
    title: 'Document Management',
    description: 'Life plans, LOC forms & evaluations',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    order: 4,
    allowedTransitions: ['billing-automation', 'budget-processing'],
    requiredDocuments: ['life-plan', 'sap', 'safeguards'],
    automatedActions: ['request-documents', 'validate-documents']
  },
  'billing-automation': {
    id: 'billing-automation',
    title: 'Billing Automation',
    description: 'Invoice generation & submission',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    order: 5,
    allowedTransitions: ['completed'],
    requiredDocuments: [],
    automatedActions: ['generate-invoices', 'submit-billing']
  },
  'completed': {
    id: 'completed',
    title: 'Completed',
    description: 'Process completed successfully',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    order: 6,
    allowedTransitions: [],
    requiredDocuments: [],
    automatedActions: ['archive-case', 'send-completion-notice']
  }
};

// Custom Pipeline Types
export interface CustomPipeline {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  stages: CustomPipelineStage[];
}

export interface CustomPipelineStage {
  id: string;
  title: string;
  description: string;
  color: string;
  order: number;
  allowedTransitions: string[];
  requiredDocuments: DocumentType[];
  automatedActions: string[];
}

// Default Pipelines
export const DEFAULT_PIPELINES: CustomPipeline[] = [
  {
    id: 'disability-services',
    name: 'Disability Services',
    description: 'Standard disability services brokerage workflow',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    stages: [
      {
        id: 'lead-intake',
        title: 'Lead Intake',
        description: 'Initial contact and form collection',
        color: '#3B82F6',
        order: 1,
        allowedTransitions: ['client-onboarding'],
        requiredDocuments: [],
        automatedActions: ['send-intake-form', 'create-google-sheet-entry']
      },
      {
        id: 'client-onboarding',
        title: 'Client Onboarding',
        description: 'Broker agreement and documentation',
        color: '#10B981',
        order: 2,
        allowedTransitions: ['budget-processing', 'document-management'],
        requiredDocuments: ['broker-agreement'],
        automatedActions: ['send-broker-agreement', 'schedule-intake-meeting']
      },
      {
        id: 'budget-processing',
        title: 'Budget Processing',
        description: 'Start-up, Initial & CNBA budgets',
        color: '#F59E0B',
        order: 3,
        allowedTransitions: ['document-management', 'billing-automation'],
        requiredDocuments: ['life-plan', 'loc-form', 'ddp2-profile'],
        automatedActions: ['create-budget', 'submit-to-fi']
      },
      {
        id: 'document-management',
        title: 'Document Management',
        description: 'Life plans, LOC forms & evaluations',
        color: '#8B5CF6',
        order: 4,
        allowedTransitions: ['billing-automation', 'budget-processing'],
        requiredDocuments: ['life-plan', 'sap', 'safeguards'],
        automatedActions: ['request-documents', 'validate-documents']
      },
      {
        id: 'billing-automation',
        title: 'Billing Automation',
        description: 'Invoice generation & submission',
        color: '#EF4444',
        order: 5,
        allowedTransitions: ['completed'],
        requiredDocuments: [],
        automatedActions: ['generate-invoices', 'submit-billing']
      },
      {
        id: 'completed',
        title: 'Completed',
        description: 'Process completed successfully',
        color: '#6B7280',
        order: 6,
        allowedTransitions: [],
        requiredDocuments: [],
        automatedActions: ['archive-case', 'send-completion-notice']
      }
    ]
  },
  {
    id: 'simple-workflow',
    name: 'Simple Workflow',
    description: 'Simplified 3-stage workflow',
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    stages: [
      {
        id: 'new-lead',
        title: 'New Lead',
        description: 'New potential client',
        color: '#3B82F6',
        order: 1,
        allowedTransitions: ['in-progress'],
        requiredDocuments: [],
        automatedActions: []
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        description: 'Active client processing',
        color: '#F59E0B',
        order: 2,
        allowedTransitions: ['completed'],
        requiredDocuments: [],
        automatedActions: []
      },
      {
        id: 'completed',
        title: 'Completed',
        description: 'Process finished',
        color: '#10B981',
        order: 3,
        allowedTransitions: [],
        requiredDocuments: [],
        automatedActions: []
      }
    ]
  }
]; 