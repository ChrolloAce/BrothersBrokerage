export type UserRole = 'business-owner' | 'employee' | 'client';

export type Permission = 
  | 'dashboard-view'
  | 'client-management'
  | 'pipeline-management'
  | 'employee-management'
  | 'billing-access'
  | 'document-access'
  | 'settings-access'
  | 'reports-access';

export interface Organization {
  id: string;
  name: string;
  type: 'brokerage' | 'care-provider' | 'individual';
  ownerId: string;
  employees: string[]; // User IDs
  clients: string[]; // User IDs
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  allowClientSelfRegistration: boolean;
  requireEmployeeApproval: boolean;
  defaultEmployeePermissions: Permission[];
}

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId?: string;
  permissions: Permission[];
  isActive: boolean;
  invitedBy?: string;
  joinedAt: Date;
  lastLoginAt?: Date;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    title?: string;
    department?: string;
    avatar?: string;
  };
}

export interface InviteLink {
  id: string;
  organizationId: string;
  role: UserRole;
  permissions: Permission[];
  invitedBy: string;
  email?: string; // Optional for specific email invites
  expiresAt: Date;
  usedAt?: Date;
  usedBy?: string;
  isActive: boolean;
}

// Role-based permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'business-owner': [
    'dashboard-view',
    'client-management',
    'pipeline-management',
    'employee-management',
    'billing-access',
    'document-access',
    'settings-access',
    'reports-access'
  ],
  'employee': [
    'dashboard-view',
    'client-management',
    'pipeline-management',
    'document-access'
  ],
  'client': [
    'dashboard-view',
    'document-access'
  ]
};

export interface OnboardingData {
  role: UserRole;
  organizationType?: 'brokerage' | 'care-provider' | 'individual';
  organizationName?: string;
  joinCode?: string;
  inviteToken?: string;
} 