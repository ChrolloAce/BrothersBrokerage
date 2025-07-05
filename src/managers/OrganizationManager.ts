import { Organization, UserProfile, InviteLink, UserRole, Permission, ROLE_PERMISSIONS, OrganizationSettings } from '../types/user';
import { Client } from '../types/client';
import { FirebaseService } from '../services/FirebaseService';
import { AuthService } from '../services/AuthService';

export class OrganizationManager {
  private static instance: OrganizationManager;
  private firebaseService: FirebaseService;
  private authService: AuthService;
  private currentUser: UserProfile | null = null;
  private currentOrganization: Organization | null = null;

  public static getInstance(): OrganizationManager {
    if (!OrganizationManager.instance) {
      OrganizationManager.instance = new OrganizationManager();
    }
    return OrganizationManager.instance;
  }

  constructor() {
    this.firebaseService = FirebaseService.getInstance();
    this.authService = AuthService.getInstance();
  }

  // User Session Management
  async initializeUserSession(firebaseUid: string): Promise<UserProfile | null> {
    try {
      const userProfile = await this.firebaseService.getUserProfile(firebaseUid);
      if (userProfile) {
        this.currentUser = userProfile;
        
        // Update last login
        await this.firebaseService.updateLastLogin(firebaseUid);
        
        // Load organization if user belongs to one
        if (userProfile.organizationId) {
          this.currentOrganization = await this.firebaseService.getOrganization(userProfile.organizationId);
        }
        
        // Save session data
        await this.firebaseService.saveUserSession(firebaseUid, {
          userId: userProfile.id,
          organizationId: userProfile.organizationId,
          role: userProfile.role,
          permissions: userProfile.permissions
        });
      }
      
      return userProfile;
    } catch (error) {
      console.error('Error initializing user session:', error);
      throw error;
    }
  }

  async clearUserSession(firebaseUid: string): Promise<void> {
    try {
      await this.firebaseService.clearUserSession(firebaseUid);
      this.currentUser = null;
      this.currentOrganization = null;
    } catch (error) {
      console.error('Error clearing user session:', error);
      throw error;
    }
  }

  // Organization Management
  async createOrganization(
    name: string,
    type: 'brokerage' | 'care-provider' | 'individual',
    ownerId: string
  ): Promise<Organization> {
    try {
      const organization = await this.firebaseService.createOrganization({
        name,
        type,
        ownerId,
        employees: [ownerId],
        clients: [],
        settings: {
          allowClientSelfRegistration: true,
          requireEmployeeApproval: true,
          defaultEmployeePermissions: ROLE_PERMISSIONS.employee
        }
      });

      this.currentOrganization = organization;
      return organization;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      return await this.firebaseService.getOrganization(id);
    } catch (error) {
      console.error('Error getting organization:', error);
      throw error;
    }
  }

  async getOrganizationsByOwner(ownerId: string): Promise<Organization[]> {
    try {
      const organization = await this.firebaseService.getOrganizationByOwnerId(ownerId);
      return organization ? [organization] : [];
    } catch (error) {
      console.error('Error getting organizations by owner:', error);
      throw error;
    }
  }

  // User Profile Management
  async createUserProfile(
    firebaseUid: string,
    email: string,
    displayName: string,
    role: UserRole,
    organizationId?: string
  ): Promise<UserProfile> {
    try {
      const permissions = organizationId 
        ? ROLE_PERMISSIONS[role]
        : role === 'business-owner' ? ROLE_PERMISSIONS[role] : [];

      const userProfile = await this.firebaseService.createUserProfile({
        firebaseUid,
        email,
        displayName,
        role,
        organizationId,
        permissions,
        isActive: true,
        joinedAt: new Date(),
        profile: {
          firstName: displayName.split(' ')[0] || '',
          lastName: displayName.split(' ').slice(1).join(' ') || '',
        }
      });

      this.currentUser = userProfile;

      // Add user to organization if specified
      if (organizationId) {
        await this.firebaseService.addUserToOrganization(firebaseUid, organizationId, role);
      }

      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfileByFirebaseUid(firebaseUid: string): Promise<UserProfile | null> {
    try {
      const userProfile = await this.firebaseService.getUserProfile(firebaseUid);
      if (userProfile) {
        this.currentUser = userProfile;
      }
      return userProfile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async getUserProfileById(id: string): Promise<UserProfile | null> {
    try {
      return await this.firebaseService.getUserProfile(id);
    } catch (error) {
      console.error('Error getting user profile by ID:', error);
      throw error;
    }
  }

  async updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      await this.firebaseService.updateUserProfile(id, updates);
      const updatedProfile = await this.firebaseService.getUserProfile(id);
      
      if (updatedProfile && this.currentUser?.id === id) {
        this.currentUser = updatedProfile;
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Organization Membership
  async addUserToOrganization(userId: string, organizationId: string, role: UserRole): Promise<boolean> {
    try {
      await this.firebaseService.addUserToOrganization(userId, organizationId, role);
      
      // Update user permissions
      const permissions = ROLE_PERMISSIONS[role];
      await this.firebaseService.updateUserProfile(userId, {
        permissions
      });
      
      return true;
    } catch (error) {
      console.error('Error adding user to organization:', error);
      return false;
    }
  }

  async removeUserFromOrganization(userId: string, organizationId: string): Promise<boolean> {
    try {
      await this.firebaseService.removeUserFromOrganization(userId, organizationId);
      
      // Clear user permissions
      await this.firebaseService.updateUserProfile(userId, {
        permissions: []
      });
      
      return true;
    } catch (error) {
      console.error('Error removing user from organization:', error);
      return false;
    }
  }

  // Employee Management
  async getOrganizationEmployees(organizationId: string): Promise<UserProfile[]> {
    try {
      return await this.firebaseService.getOrganizationEmployees(organizationId);
    } catch (error) {
      console.error('Error getting organization employees:', error);
      return [];
    }
  }

  async getOrganizationClients(organizationId: string): Promise<UserProfile[]> {
    try {
      return await this.firebaseService.getOrganizationClients(organizationId);
    } catch (error) {
      console.error('Error getting organization clients:', error);
      return [];
    }
  }

  // Client Data Management
  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    try {
      return await this.firebaseService.createClient(clientData);
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async getClient(clientId: string): Promise<Client | null> {
    try {
      return await this.firebaseService.getClient(clientId);
    } catch (error) {
      console.error('Error getting client:', error);
      return null;
    }
  }

  async updateClient(clientId: string, updates: Partial<Client>): Promise<void> {
    try {
      await this.firebaseService.updateClient(clientId, updates);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async getOrganizationClientsData(organizationId: string): Promise<Client[]> {
    try {
      return await this.firebaseService.getOrganizationClients_Data(organizationId);
    } catch (error) {
      console.error('Error getting organization clients data:', error);
      return [];
    }
  }

  // Invite Link Management
  async createInviteLink(
    organizationId: string,
    role: UserRole,
    invitedBy: string,
    email?: string,
    customPermissions?: Permission[]
  ): Promise<InviteLink> {
    try {
      const permissions = customPermissions || ROLE_PERMISSIONS[role];
      
      const invite = await this.firebaseService.createInvite({
        organizationId,
        role,
        permissions,
        invitedBy,
        email,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true
      });

      return invite;
    } catch (error) {
      console.error('Error creating invite link:', error);
      throw error;
    }
  }

  async getInviteLink(id: string): Promise<InviteLink | null> {
    try {
      const invite = await this.firebaseService.getInvite(id);
      if (!invite || !invite.isActive || invite.expiresAt < new Date()) {
        return null;
      }
      return invite;
    } catch (error) {
      console.error('Error getting invite link:', error);
      return null;
    }
  }

  async useInviteLink(inviteId: string, userId: string): Promise<boolean> {
    try {
      const invite = await this.getInviteLink(inviteId);
      if (!invite) return false;

      // Mark invite as used
      await this.firebaseService.updateInvite(inviteId, {
        usedAt: new Date(),
        usedBy: userId,
        isActive: false
      });

      // Add user to organization
      return await this.addUserToOrganization(userId, invite.organizationId, invite.role);
    } catch (error) {
      console.error('Error using invite link:', error);
      return false;
    }
  }

  async getOrganizationInvites(organizationId: string): Promise<InviteLink[]> {
    try {
      return await this.firebaseService.getOrganizationInvites(organizationId);
    } catch (error) {
      console.error('Error getting organization invites:', error);
      return [];
    }
  }

  // Permission Checking
  async userHasPermission(userId: string, permission: Permission): Promise<boolean> {
    try {
      const user = await this.firebaseService.getUserProfile(userId);
      return user ? user.permissions.includes(permission) : false;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  async updateUserPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
    try {
      await this.firebaseService.updateUserProfile(userId, { permissions });
      return true;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      return false;
    }
  }

  // Organization Settings
  async updateOrganizationSettings(
    organizationId: string, 
    settings: Partial<OrganizationSettings>
  ): Promise<boolean> {
    try {
      const organization = await this.firebaseService.getOrganization(organizationId);
      if (!organization) return false;

      await this.firebaseService.updateOrganization(organizationId, {
        settings: { ...organization.settings, ...settings }
      });
      
      return true;
    } catch (error) {
      console.error('Error updating organization settings:', error);
      return false;
    }
  }

  // Join Code Generation
  public generateJoinCode(organizationId: string): string {
    return `${organizationId.slice(0, 4).toUpperCase()}-${this.generateId().slice(0, 4).toUpperCase()}`;
  }

  async joinByCode(joinCode: string, userId: string, role: UserRole): Promise<boolean> {
    try {
      // In a real implementation, you'd store and validate join codes
      // For now, we'll simulate finding the organization
      const orgId = joinCode.split('-')[0].toLowerCase();
      const organization = await this.firebaseService.getOrganization(orgId);
      
      if (!organization) return false;

      return await this.addUserToOrganization(userId, organization.id, role);
    } catch (error) {
      console.error('Error joining by code:', error);
      return false;
    }
  }

  // Real-time Data Subscriptions
  subscribeToOrganizationUsers(organizationId: string, callback: (users: UserProfile[]) => void): string {
    return this.firebaseService.subscribeToOrganizationUsers(organizationId, callback);
  }

  subscribeToOrganizationClients(organizationId: string, callback: (clients: Client[]) => void): string {
    return this.firebaseService.subscribeToOrganizationClients(organizationId, callback);
  }

  unsubscribe(listenerId: string): void {
    this.firebaseService.unsubscribe(listenerId);
  }

  // Current User and Organization Getters
  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  getCurrentOrganization(): Organization | null {
    return this.currentOrganization;
  }

  async refreshCurrentUser(): Promise<UserProfile | null> {
    if (!this.currentUser) return null;
    
    try {
      const updatedUser = await this.firebaseService.getUserProfile(this.currentUser.firebaseUid);
      this.currentUser = updatedUser;
      return updatedUser;
    } catch (error) {
      console.error('Error refreshing current user:', error);
      return null;
    }
  }

  async refreshCurrentOrganization(): Promise<Organization | null> {
    if (!this.currentOrganization) return null;
    
    try {
      const updatedOrg = await this.firebaseService.getOrganization(this.currentOrganization.id);
      this.currentOrganization = updatedOrg;
      return updatedOrg;
    } catch (error) {
      console.error('Error refreshing current organization:', error);
      return null;
    }
  }

  // Utility Methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Data Validation
  async validateUserAccess(userId: string, organizationId: string): Promise<boolean> {
    try {
      const user = await this.firebaseService.getUserProfile(userId);
      return user ? user.organizationId === organizationId : false;
    } catch (error) {
      console.error('Error validating user access:', error);
      return false;
    }
  }

  async getUserOrganizationRole(userId: string, organizationId: string): Promise<UserRole | null> {
    try {
      const user = await this.firebaseService.getUserProfile(userId);
      if (user && user.organizationId === organizationId) {
        return user.role;
      }
      return null;
    } catch (error) {
      console.error('Error getting user organization role:', error);
      return null;
    }
  }

  // Check if user exists in Firebase
  async checkUserExists(firebaseUid: string): Promise<boolean> {
    try {
      return await this.firebaseService.checkUserExists(firebaseUid);
    } catch (error) {
      console.error('Error checking user exists:', error);
      return false;
    }
  }
} 