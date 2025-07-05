import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText, 
  CreditCard, 
  Settings, 
  Store,
  MessageCircle,
  BarChart3,
  Receipt,
  HelpCircle,
  LogOut,
  Workflow,
  Shield,
  Building2
} from 'lucide-react';
import { AuthService } from '../../services/AuthService';
import { OrganizationManager } from '../../managers/OrganizationManager';
import { UserProfile, Permission, Organization } from '../../types/user';

const Sidebar = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  
  const authService = AuthService.getInstance();
  const orgManager = OrganizationManager.getInstance();

  useEffect(() => {
    loadCurrentUserData();
    
    // Set up interval to refresh user data periodically
    const refreshInterval = setInterval(() => {
      refreshUserData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  const loadCurrentUserData = () => {
    try {
      const user = orgManager.getCurrentUser();
      const organization = orgManager.getCurrentOrganization();
      
      setCurrentUser(user);
      setCurrentOrganization(organization);
    } catch (error) {
      console.error('Error loading current user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const firebaseUser = authService.getCurrentUser();
      if (firebaseUser) {
        await orgManager.refreshCurrentUser();
        await orgManager.refreshCurrentOrganization();
        
        const updatedUser = orgManager.getCurrentUser();
        const updatedOrganization = orgManager.getCurrentOrganization();
        
        setCurrentUser(updatedUser);
        setCurrentOrganization(updatedOrganization);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    return currentUser?.permissions.includes(permission) || false;
  };

  // Define navigation items with their required permissions
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', permission: 'dashboard-view' as Permission },
    { name: 'Clients', icon: Users, path: '/clients', permission: 'client-management' as Permission },
    { name: 'Pipelines', icon: Workflow, path: '/pipelines', permission: 'pipeline-management' as Permission },
    { name: 'Employees', icon: Shield, path: '/employees', permission: 'employee-management' as Permission },
    { name: 'Leads', icon: UserPlus, path: '/leads', permission: 'client-management' as Permission },
    { name: 'Budgets', icon: FileText, path: '/budgets', permission: 'billing-access' as Permission },
    { name: 'Documents', icon: Store, path: '/documents', permission: 'document-access' as Permission },
    { name: 'Invoices', icon: Receipt, path: '/invoices', permission: 'billing-access' as Permission },
    { name: 'Messages', icon: MessageCircle, path: '/messages', permission: 'dashboard-view' as Permission },
    { name: 'Statistics', icon: BarChart3, path: '/statistics', permission: 'reports-access' as Permission },
    { name: 'Finances', icon: CreditCard, path: '/finances', permission: 'billing-access' as Permission },
  ];

  const supportItems = [
    { name: 'Help & Center', icon: HelpCircle, path: '/help', permission: 'dashboard-view' as Permission },
    { name: 'Settings', icon: Settings, path: '/settings', permission: 'settings-access' as Permission },
  ];

  // Filter navigation items based on user permissions
  const visibleNavigationItems = navigationItems.filter(item => hasPermission(item.permission));
  const visibleSupportItems = supportItems.filter(item => hasPermission(item.permission));

  const handleLogout = async () => {
    try {
      const firebaseUser = authService.getCurrentUser();
      if (firebaseUser) {
        // Clear user session before signing out
        await orgManager.clearUserSession(firebaseUser.uid);
      }
      
      await authService.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-64 bg-sidebar-bg text-sidebar-text flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BB</span>
            </div>
            <span className="text-sidebar-textActive font-semibold">BROTHERS BROKERAGE</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-sidebar-bg text-sidebar-text flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BB</span>
          </div>
          <span className="text-sidebar-textActive font-semibold">BROTHERS BROKERAGE</span>
        </div>
      </div>

      {/* User Info */}
      {currentUser && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {currentUser.profile.firstName.charAt(0)}{currentUser.profile.lastName.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-textActive truncate">{currentUser.displayName}</p>
              <p className="text-xs text-sidebar-text capitalize truncate">
                {currentUser.role.replace('-', ' ')}
                {currentUser.profile.title && ` • ${currentUser.profile.title}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div className="px-4 mb-6">
          <p className="text-xs font-semibold text-sidebar-text uppercase tracking-wider">
            Dashboard
          </p>
        </div>
        
        <ul className="space-y-1">
          {visibleNavigationItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  sidebar-item ${isActive ? 'active' : ''}
                `}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Support Section */}
        {visibleSupportItems.length > 0 && (
          <>
            <div className="px-4 mb-4 mt-8">
              <p className="text-xs font-semibold text-sidebar-text uppercase tracking-wider">
                Help & Support
              </p>
            </div>
            
            <ul className="space-y-1">
              {visibleSupportItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      sidebar-item ${isActive ? 'active' : ''}
                    `}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Organization Info */}
        {currentOrganization && (
          <div className="px-4 mt-8">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-sidebar-textActive">Organization</p>
                  <p className="text-xs text-sidebar-text truncate" title={currentOrganization.name}>
                    {currentOrganization.name}
                  </p>
                  <p className="text-xs text-sidebar-text capitalize">
                    {currentUser?.role === 'business-owner' ? 'Owner' : 'Member'} • {currentOrganization.type}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Status */}
        {currentUser && (
          <div className="px-4 mt-4">
            <div className="text-xs text-sidebar-text">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
              {currentUser.lastLoginAt && (
                <p className="truncate">
                  Last login: {new Date(currentUser.lastLoginAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={handleLogout}
          className="sidebar-item w-full justify-start hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 