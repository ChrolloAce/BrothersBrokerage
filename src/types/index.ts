// Re-export all client types
export * from './client';

// Legacy types for backward compatibility
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  services: string[];
  status: LeadStatus;
  intakeDate: Date;
  preferredMeetingTime?: string;
  careManager?: CareManager;
}

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'meeting-scheduled' | 'converted' | 'closed';

export interface CareManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  careManager: CareManager;
  services: ServiceType[];
  status: ClientStatus;
  startDate: Date;
  budgets: Budget[];
  documents: Document[];
}

export type ClientStatus = 'active' | 'pending' | 'inactive' | 'suspended';

export type ServiceType = 'start-up-broker' | 'community-habilitation' | 'sap' | 'budgeting';

export interface Budget {
  id: string;
  clientId: string;
  type: BudgetType;
  amount: number;
  status: BudgetStatus;
  submissionDate: Date;
  approvalDate?: Date;
  fiscalYear: string;
}

export type BudgetType = 'start-up' | 'initial' | 'cnba';
export type BudgetStatus = 'draft' | 'submitted' | 'approved' | 'revision-requested' | 'rejected';

export interface Document {
  id: string;
  clientId: string;
  name: string;
  type: DocumentType;
  url: string;
  uploadDate: Date;
  required: boolean;
  received: boolean;
}

export type DocumentType = 'life-plan' | 'loc-form' | 'nod' | 'ddp2-profile' | 'service-auth' | 'safeguards' | 'psych-eval' | 'broker-agreement' | 'sap';

export interface DashboardMetrics {
  totalClients: number;
  activeLeads: number;
  monthlyRevenue: number;
  completionRate: number;
  clientsGrowth: number;
  leadsGrowth: number;
  revenueGrowth: number;
  completionGrowth: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: Date;
  services: ServiceType[];
  billingPeriod: string;
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'; 