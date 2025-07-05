import { useState, useEffect } from 'react';
import { UserProfile, InviteLink, Permission, ROLE_PERMISSIONS } from '../../types/user';
import { OrganizationManager } from '../../managers/OrganizationManager';
import { 
  Users, Plus, Search, Mail, Phone, Shield, Settings, 
  Copy, Check, ExternalLink, MoreHorizontal, Edit, Trash2,
  Calendar, Clock, AlertCircle, UserCheck, UserX
} from 'lucide-react';
import { format } from 'date-fns';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [invites, setInvites] = useState<InviteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const orgManager = OrganizationManager.getInstance();

  useEffect(() => {
    loadEmployees();
    loadInvites();
  }, []);

  const loadEmployees = async () => {
    try {
      const currentUser = orgManager.getCurrentUser();
      if (!currentUser?.organizationId) {
        console.error('No organization ID found for current user');
        setLoading(false);
        return;
      }

      const employeeList = await orgManager.getOrganizationEmployees(currentUser.organizationId);
      setEmployees(employeeList);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    try {
      const currentUser = orgManager.getCurrentUser();
      if (!currentUser?.organizationId) {
        return;
      }

      const inviteList = await orgManager.getOrganizationInvites(currentUser.organizationId);
      setInvites(inviteList);
    } catch (error) {
      console.error('Error loading invites:', error);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.displayName.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.profile.title?.toLowerCase().includes(searchLower) ||
      employee.profile.department?.toLowerCase().includes(searchLower)
    );
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateInvite = async (email: string, role: 'employee' | 'client') => {
    try {
      const currentUser = orgManager.getCurrentUser();
      if (!currentUser?.organizationId) {
        showNotification('No organization found', 'error');
        return;
      }
      
      const invite = await orgManager.createInviteLink(
        currentUser.organizationId,
        role,
        currentUser.id,
        email
      );

      await loadInvites();
      setShowInviteModal(false);
      showNotification(`Invitation sent to ${email}`, 'success');
    } catch (error) {
      console.error('Error creating invite:', error);
      showNotification('Failed to create invitation', 'error');
    }
  };

  const handleUpdateEmployee = async (employeeId: string, updates: Partial<UserProfile>) => {
    try {
      await orgManager.updateUserProfile(employeeId, updates);
      await loadEmployees();
      setSelectedEmployee(null);
      showNotification('Employee updated successfully', 'success');
    } catch (error) {
      console.error('Error updating employee:', error);
      showNotification('Failed to update employee', 'error');
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (confirm('Are you sure you want to remove this employee?')) {
      try {
        const currentUser = orgManager.getCurrentUser();
        if (!currentUser?.organizationId) {
          showNotification('No organization found', 'error');
          return;
        }

        await orgManager.removeUserFromOrganization(employeeId, currentUser.organizationId);
        await loadEmployees();
        showNotification('Employee removed successfully', 'success');
      } catch (error) {
        console.error('Error removing employee:', error);
        showNotification('Failed to remove employee', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 text-sm">Loading employees...</span>
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

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Employee Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your team members and their permissions</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{filteredEmployees.length} Employees</span>
                <span>{invites.length} Pending Invites</span>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Invite Employee</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search employees by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Invitations</h2>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {invites.map((invite) => (
                <div key={invite.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {invite.email || 'General invitation'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {invite.role} • Expires {format(invite.expiresAt, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/invite/${invite.id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Copy invite link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${invite.email}?subject=Invitation to join Brothers Brokerage&body=You've been invited to join our organization. Use this link: ${window.location.origin}/invite/${invite.id}`)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                        title="Send email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500">Start by inviting team members to join your organization</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-blue-600">
                          {employee.profile.firstName.charAt(0)}{employee.profile.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{employee.displayName}</h3>
                        <p className="text-sm text-gray-600">{employee.profile.title || 'No title'}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Mail className="w-4 h-4" />
                            <span>{employee.email}</span>
                          </div>
                          {employee.profile.phone && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Phone className="w-4 h-4" />
                              <span>{employee.profile.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Role Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        employee.role === 'business-owner' ? 'bg-purple-100 text-purple-700' :
                        employee.role === 'employee' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {employee.role.replace('-', ' ')}
                      </span>

                      {/* Status */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                        employee.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {employee.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        <span>{employee.isActive ? 'Active' : 'Inactive'}</span>
                      </span>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
                          title="Edit employee"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {employee.role !== 'business-owner' && (
                          <button
                            onClick={() => handleRemoveEmployee(employee.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                            title="Remove employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                    {employee.profile.department && (
                      <span>Department: {employee.profile.department}</span>
                    )}
                    <span>Joined: {format(employee.joinedAt, 'MMM dd, yyyy')}</span>
                    {employee.lastLoginAt && (
                      <span>Last active: {format(employee.lastLoginAt, 'MMM dd, yyyy')}</span>
                    )}
                  </div>

                  {/* Permissions */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-2">
                      {employee.permissions.slice(0, 4).map((permission) => (
                        <span
                          key={permission}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {permission.replace('-', ' ')}
                        </span>
                      ))}
                      {employee.permissions.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{employee.permissions.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteEmployeeModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleCreateInvite}
        />
      )}

      {/* Employee Edit Modal */}
      {selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onUpdate={handleUpdateEmployee}
        />
      )}
    </div>
  );
};

// Invite Employee Modal Component
interface InviteEmployeeModalProps {
  onClose: () => void;
  onInvite: (email: string, role: 'employee' | 'client') => void;
}

const InviteEmployeeModal = ({ onClose, onInvite }: InviteEmployeeModalProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'employee' | 'client'>('employee');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await onInvite(email, role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invite Team Member</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'employee' | 'client')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="employee">Employee</option>
              <option value="client">Client</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Employee Modal Component
interface EditEmployeeModalProps {
  employee: UserProfile;
  onClose: () => void;
  onUpdate: (employeeId: string, updates: Partial<UserProfile>) => void;
}

const EditEmployeeModal = ({ employee, onClose, onUpdate }: EditEmployeeModalProps) => {
  const [formData, setFormData] = useState({
    firstName: employee.profile.firstName,
    lastName: employee.profile.lastName,
    title: employee.profile.title || '',
    department: employee.profile.department || '',
    phone: employee.profile.phone || '',
    isActive: employee.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(employee.id, {
      profile: {
        ...employee.profile,
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title,
        department: formData.department,
        phone: formData.phone
      },
      displayName: `${formData.firstName} ${formData.lastName}`,
      isActive: formData.isActive
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Employee</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Case Manager"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              placeholder="e.g., Client Services"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Active employee
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Update Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeManagement; 