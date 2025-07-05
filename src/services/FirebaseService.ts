import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  writeBatch, 
  serverTimestamp, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { UserProfile, Organization, InviteLink, UserRole } from '../types/user';
import { Client } from '../types/client';

export class FirebaseService {
  private static instance: FirebaseService;
  private db = getFirestore();
  private listeners: Map<string, () => void> = new Map();

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // User Profile Management
  async createUserProfile(userProfile: Omit<UserProfile, 'id' | 'joinedAt' | 'lastLoginAt'>): Promise<UserProfile> {
    try {
      const userRef = doc(this.db, 'users', userProfile.firebaseUid);
      
      // Filter out undefined values before saving to Firestore
      const cleanedUserData = Object.fromEntries(
        Object.entries({
          ...userProfile,
          joinedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }).filter(([_, value]) => value !== undefined)
      );
      
      await setDoc(userRef, cleanedUserData);
      
      const createdUser: UserProfile = {
        ...userProfile,
        id: userProfile.firebaseUid,
        joinedAt: new Date(),
        lastLoginAt: new Date()
      };
      
      return createdUser;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(firebaseUid: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(this.db, 'users', firebaseUid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          ...data,
          id: userSnap.id,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date()
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(firebaseUid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', firebaseUid);
      
      // Filter out undefined values before updating Firestore
      const cleanedUpdates = Object.fromEntries(
        Object.entries({
          ...updates,
          updatedAt: serverTimestamp()
        }).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(userRef, cleanedUpdates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async updateLastLogin(firebaseUid: string): Promise<void> {
    try {
      const userRef = doc(this.db, 'users', firebaseUid);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Organization Management
  async createOrganization(organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization> {
    try {
      const orgRef = doc(collection(this.db, 'organizations'));
      
      // Filter out undefined values before saving to Firestore
      const cleanedOrgData = Object.fromEntries(
        Object.entries({
          ...organization,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }).filter(([_, value]) => value !== undefined)
      );
      
      await setDoc(orgRef, cleanedOrgData);
      
      const createdOrg: Organization = {
        ...organization,
        id: orgRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return createdOrg;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  async getOrganization(organizationId: string): Promise<Organization | null> {
    try {
      const orgRef = doc(this.db, 'organizations', organizationId);
      const orgSnap = await getDoc(orgRef);
      
      if (orgSnap.exists()) {
        const data = orgSnap.data();
        return {
          ...data,
          id: orgSnap.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Organization;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting organization:', error);
      throw error;
    }
  }

  async updateOrganization(organizationId: string, updates: Partial<Organization>): Promise<void> {
    try {
      const orgRef = doc(this.db, 'organizations', organizationId);
      
      // Filter out undefined values before updating Firestore
      const cleanedUpdates = Object.fromEntries(
        Object.entries({
          ...updates,
          updatedAt: serverTimestamp()
        }).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(orgRef, cleanedUpdates);
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  }

  async getOrganizationUsers(organizationId: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where('organizationId', '==', organizationId));
      const querySnapshot = await getDocs(q);
      
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          ...data,
          id: doc.id,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date()
        } as UserProfile);
      });
      
      return users;
    } catch (error) {
      console.error('Error getting organization users:', error);
      throw error;
    }
  }

  async getOrganizationEmployees(organizationId: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(
        usersRef, 
        where('organizationId', '==', organizationId),
        where('role', 'in', ['business-owner', 'employee'])
      );
      const querySnapshot = await getDocs(q);
      
      const employees: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employees.push({
          ...data,
          id: doc.id,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date()
        } as UserProfile);
      });
      
      return employees;
    } catch (error) {
      console.error('Error getting organization employees:', error);
      throw error;
    }
  }

  async getOrganizationClients(organizationId: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(
        usersRef, 
        where('organizationId', '==', organizationId),
        where('role', '==', 'client')
      );
      const querySnapshot = await getDocs(q);
      
      const clients: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        clients.push({
          ...data,
          id: doc.id,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date()
        } as UserProfile);
      });
      
      return clients;
    } catch (error) {
      console.error('Error getting organization clients:', error);
      throw error;
    }
  }

  // Client Management
  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    try {
      const clientRef = doc(collection(this.db, 'clients'));
      
      // Filter out undefined values before saving to Firestore
      const cleanedClientData = Object.fromEntries(
        Object.entries({
          ...client,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }).filter(([_, value]) => value !== undefined)
      );
      
      await setDoc(clientRef, cleanedClientData);
      
      const createdClient: Client = {
        ...client,
        id: clientRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return createdClient;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  async getClient(clientId: string): Promise<Client | null> {
    try {
      const clientRef = doc(this.db, 'clients', clientId);
      const clientSnap = await getDoc(clientRef);
      
      if (clientSnap.exists()) {
        const data = clientSnap.data();
        return {
          ...data,
          id: clientSnap.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Client;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting client:', error);
      throw error;
    }
  }

  async updateClient(clientId: string, updates: Partial<Client>): Promise<void> {
    try {
      const clientRef = doc(this.db, 'clients', clientId);
      
      // Filter out undefined values before updating Firestore
      const cleanedUpdates = Object.fromEntries(
        Object.entries({
          ...updates,
          updatedAt: serverTimestamp()
        }).filter(([_, value]) => value !== undefined)
      );
      
      await updateDoc(clientRef, cleanedUpdates);
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  async getOrganizationClients_Data(organizationId: string): Promise<Client[]> {
    try {
      const clientsRef = collection(this.db, 'clients');
      const q = query(
        clientsRef, 
        where('organizationId', '==', organizationId)
      );
      const querySnapshot = await getDocs(q);
      
      const clients: Client[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        clients.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Client);
      });
      
      // Sort on client side for now
      clients.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return clients;
    } catch (error) {
      console.error('Error getting organization clients data:', error);
      throw error;
    }
  }

  // Invite Management
  async createInvite(invite: Omit<InviteLink, 'id'>): Promise<InviteLink> {
    try {
      const inviteRef = doc(collection(this.db, 'invites'));
      const inviteData = {
        ...invite,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(invite.expiresAt)
      };
      
      await setDoc(inviteRef, inviteData);
      
      const createdInvite: InviteLink = {
        ...invite,
        id: inviteRef.id
      };
      
      return createdInvite;
    } catch (error) {
      console.error('Error creating invite:', error);
      throw error;
    }
  }

  async getInvite(inviteId: string): Promise<InviteLink | null> {
    try {
      const inviteRef = doc(this.db, 'invites', inviteId);
      const inviteSnap = await getDoc(inviteRef);
      
      if (inviteSnap.exists()) {
        const data = inviteSnap.data();
        return {
          id: inviteSnap.id,
          organizationId: data.organizationId,
          role: data.role,
          permissions: data.permissions,
          invitedBy: data.invitedBy,
          email: data.email,
          expiresAt: data.expiresAt?.toDate() || new Date(),
          usedAt: data.usedAt?.toDate(),
          usedBy: data.usedBy,
          isActive: data.isActive
        } as InviteLink;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting invite:', error);
      throw error;
    }
  }

  async updateInvite(inviteId: string, updates: Partial<InviteLink>): Promise<void> {
    try {
      const inviteRef = doc(this.db, 'invites', inviteId);
      const updateData: any = { ...updates };
      
      if (updates.usedAt) {
        updateData.usedAt = serverTimestamp();
      }
      
      await updateDoc(inviteRef, updateData);
    } catch (error) {
      console.error('Error updating invite:', error);
      throw error;
    }
  }

  async getOrganizationInvites(organizationId: string): Promise<InviteLink[]> {
    try {
      const invitesRef = collection(this.db, 'invites');
      const q = query(
        invitesRef, 
        where('organizationId', '==', organizationId),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      const invites: InviteLink[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        invites.push({
          id: doc.id,
          organizationId: data.organizationId,
          role: data.role,
          permissions: data.permissions,
          invitedBy: data.invitedBy,
          email: data.email,
          expiresAt: data.expiresAt?.toDate() || new Date(),
          usedAt: data.usedAt?.toDate(),
          usedBy: data.usedBy,
          isActive: data.isActive
        } as InviteLink);
      });
      
      return invites;
    } catch (error) {
      console.error('Error getting organization invites:', error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToOrganizationUsers(organizationId: string, callback: (users: UserProfile[]) => void): string {
    const usersRef = collection(this.db, 'users');
    const q = query(usersRef, where('organizationId', '==', organizationId));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          ...data,
          id: doc.id,
          joinedAt: data.joinedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date()
        } as UserProfile);
      });
      callback(users);
    });

    const listenerId = `org-users-${organizationId}`;
    this.listeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  subscribeToOrganizationClients(organizationId: string, callback: (clients: Client[]) => void): string {
    const clientsRef = collection(this.db, 'clients');
    const q = query(
      clientsRef, 
      where('organizationId', '==', organizationId)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const clients: Client[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        clients.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Client);
      });
      
      // Sort on client side for now
      clients.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      callback(clients);
    });

    const listenerId = `org-clients-${organizationId}`;
    this.listeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  unsubscribe(listenerId: string): void {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
    }
  }

  // Batch operations
  async addUserToOrganization(userId: string, organizationId: string, role: UserRole): Promise<void> {
    try {
      const batch = writeBatch(this.db);
      
      // Update user
      const userRef = doc(this.db, 'users', userId);
      batch.update(userRef, {
        organizationId,
        role,
        updatedAt: serverTimestamp()
      });
      
      // Update organization
      const orgRef = doc(this.db, 'organizations', organizationId);
      const org = await this.getOrganization(organizationId);
      if (org) {
        const updatedEmployees = role === 'client' ? org.employees : [...org.employees, userId];
        const updatedClients = role === 'client' ? [...org.clients, userId] : org.clients;
        
        batch.update(orgRef, {
          employees: updatedEmployees,
          clients: updatedClients,
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error adding user to organization:', error);
      throw error;
    }
  }

  async removeUserFromOrganization(userId: string, organizationId: string): Promise<void> {
    try {
      const batch = writeBatch(this.db);
      
      // Update user
      const userRef = doc(this.db, 'users', userId);
      batch.update(userRef, {
        organizationId: null,
        updatedAt: serverTimestamp()
      });
      
      // Update organization
      const orgRef = doc(this.db, 'organizations', organizationId);
      const org = await this.getOrganization(organizationId);
      if (org) {
        const updatedEmployees = org.employees.filter(id => id !== userId);
        const updatedClients = org.clients.filter(id => id !== userId);
        
        batch.update(orgRef, {
          employees: updatedEmployees,
          clients: updatedClients,
          updatedAt: serverTimestamp()
        });
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error removing user from organization:', error);
      throw error;
    }
  }

  // Session Management
  async saveUserSession(firebaseUid: string, sessionData: any): Promise<void> {
    try {
      const sessionRef = doc(this.db, 'sessions', firebaseUid);
      await setDoc(sessionRef, {
        ...sessionData,
        lastActivity: serverTimestamp(),
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving user session:', error);
      throw error;
    }
  }

  async getUserSession(firebaseUid: string): Promise<any> {
    try {
      const sessionRef = doc(this.db, 'sessions', firebaseUid);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        const data = sessionSnap.data();
        return {
          ...data,
          lastActivity: data.lastActivity?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user session:', error);
      throw error;
    }
  }

  async clearUserSession(firebaseUid: string): Promise<void> {
    try {
      const sessionRef = doc(this.db, 'sessions', firebaseUid);
      await deleteDoc(sessionRef);
    } catch (error) {
      console.error('Error clearing user session:', error);
      throw error;
    }
  }

  // Utility methods
  async checkUserExists(firebaseUid: string): Promise<boolean> {
    try {
      const userRef = doc(this.db, 'users', firebaseUid);
      const userSnap = await getDoc(userRef);
      return userSnap.exists();
    } catch (error) {
      console.error('Error checking user exists:', error);
      return false;
    }
  }

  async getOrganizationByOwnerId(ownerId: string): Promise<Organization | null> {
    try {
      const orgsRef = collection(this.db, 'organizations');
      const q = query(orgsRef, where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Organization;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting organization by owner ID:', error);
      throw error;
    }
  }
} 