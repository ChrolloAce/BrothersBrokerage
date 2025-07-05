import { useState, useEffect } from 'react';
import { OrganizationManager } from '../managers/OrganizationManager';
import { UserProfile } from '../types/user';
import { AuthService } from '../services/AuthService';
import EmployeeManagement from '../components/employees/EmployeeManagement';
import { Shield, Users, AlertCircle } from 'lucide-react';

const Employees = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  const authService = AuthService.getInstance();
  const orgManager = OrganizationManager.getInstance();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const firebaseUser = authService.getCurrentUser();
      if (!firebaseUser) return;

      const userProfile = await orgManager.getUserProfileByFirebaseUid(firebaseUser.uid);
      if (userProfile) {
        setCurrentUser(userProfile);
        
        // Check if user has employee management permission
        const hasEmployeeManagementPermission = await orgManager.userHasPermission(
          userProfile.id, 
          'employee-management'
        );
        
        setHasPermission(hasEmployeeManagementPermission);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Insufficient Permissions</h3>
          <p className="text-gray-600">You don't have permission to manage employees.</p>
          <p className="text-gray-500 text-sm mt-2">
            Contact your organization administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeManagement />
    </div>
  );
};

export default Employees; 