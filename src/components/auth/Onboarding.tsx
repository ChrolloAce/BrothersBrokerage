import { useState, useEffect } from 'react';
import { UserRole, Organization, OnboardingData } from '../../types/user';
import { OrganizationManager } from '../../managers/OrganizationManager';
import { 
  Building, Users, User as UserIcon, ChevronRight, ChevronLeft, 
  Loader2, CheckCircle, XCircle, AlertCircle, Link, Mail 
} from 'lucide-react';

interface OnboardingProps {
  user: User;
  onComplete: () => void;
}

const Onboarding = ({ user, onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    role: 'business-owner'
  });

  const orgManager = OrganizationManager.getInstance();

  const handleRoleSelection = (role: UserRole) => {
    setOnboardingData({ ...onboardingData, role });
    setStep(2);
  };

  const handleBusinessOwnerSetup = async (orgName: string, orgType: 'brokerage' | 'care-provider' | 'individual') => {
    setLoading(true);
    setError(null);

    try {
      // Create user profile first
      const userProfile = await orgManager.createUserProfile(
        user.uid,
        user.email || '',
        user.displayName || '',
        'business-owner'
      );

      // Create organization
      const organization = await orgManager.createOrganization(
        orgName,
        orgType,
        userProfile.id
      );

      // Update user profile with organization
      await orgManager.updateUserProfile(userProfile.id, {
        organizationId: organization.id
      });

      onComplete();
    } catch (error) {
      console.error('Business owner setup error:', error);
      setError('Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrganization = async (joinMethod: 'code' | 'invite', value: string) => {
    setLoading(true);
    setError(null);

    try {
      // Create user profile first
      const userProfile = await orgManager.createUserProfile(
        user.uid,
        user.email || '',
        user.displayName || '',
        onboardingData.role
      );

      let success = false;

      if (joinMethod === 'code') {
        success = await orgManager.joinByCode(value, userProfile.id, onboardingData.role);
      } else {
        success = await orgManager.useInviteLink(value, userProfile.id);
      }

      if (success) {
        onComplete();
      } else {
        setError('Invalid join code or invite link. Please check and try again.');
      }
    } catch (error) {
      console.error('Join organization error:', error);
      setError('Failed to join organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'business-owner',
      title: 'Business Owner',
      description: 'I own or manage a brokerage/care organization',
      icon: Building,
      color: 'blue',
      features: ['Full access to all features', 'Manage employees and clients', 'View all reports and analytics']
    },
    {
      id: 'employee',
      title: 'Employee',
      description: 'I work for a brokerage or care organization',
      icon: Users,
      color: 'green',
      features: ['Access client management', 'Process workflows', 'Generate reports']
    },
    {
      id: 'client',
      title: 'Client',
      description: 'I receive services from a brokerage organization',
      icon: UserIcon,
      color: 'purple',
      features: ['View my case details', 'Access documents', 'Track progress']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-blue-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">Brothers Brokerage</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome! Let's get you set up</h1>
          <p className="text-gray-600">Tell us about your role so we can customize your experience</p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Choose Role</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Setup Account</span>
            </div>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              What best describes your role?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelection(role.id as UserRole)}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center mb-4">
                    <role.icon className={`w-8 h-8 text-${role.color}-600 mr-3`} />
                    <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{role.description}</p>
                  
                  <div className="space-y-2">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex items-center text-blue-600 group-hover:text-blue-700">
                    <span className="text-sm font-medium">Select this role</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Setup Based on Role */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <button
              onClick={() => setStep(1)}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to role selection
            </button>

            {/* Business Owner Setup */}
            {onboardingData.role === 'business-owner' && (
              <BusinessOwnerSetup 
                onSetup={handleBusinessOwnerSetup}
                loading={loading}
                error={error}
              />
            )}

            {/* Employee/Client Setup */}
            {(onboardingData.role === 'employee' || onboardingData.role === 'client') && (
              <JoinOrganizationSetup
                role={onboardingData.role}
                onJoin={handleJoinOrganization}
                loading={loading}
                error={error}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Business Owner Setup Component
interface BusinessOwnerSetupProps {
  onSetup: (orgName: string, orgType: 'brokerage' | 'care-provider' | 'individual') => void;
  loading: boolean;
  error: string | null;
}

const BusinessOwnerSetup = ({ onSetup, loading, error }: BusinessOwnerSetupProps) => {
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<'brokerage' | 'care-provider' | 'individual'>('brokerage');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orgName.trim()) {
      onSetup(orgName, orgType);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Your Organization</h2>
      <p className="text-gray-600 mb-6">Set up your organization to start managing clients and employees</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Name
          </label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="e.g., Brothers Brokerage"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'brokerage', label: 'Brokerage', desc: 'Disability services brokerage' },
              { value: 'care-provider', label: 'Care Provider', desc: 'Direct care services' },
              { value: 'individual', label: 'Individual', desc: 'Independent practitioner' }
            ].map((type) => (
              <label key={type.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="orgType"
                  value={type.value}
                  checked={orgType === type.value}
                  onChange={(e) => setOrgType(e.target.value as any)}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg transition-all ${
                  orgType === type.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <h3 className="font-medium text-gray-900">{type.label}</h3>
                  <p className="text-sm text-gray-600">{type.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !orgName.trim()}
          className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Organization...
            </>
          ) : (
            <>
              <Building className="w-5 h-5 mr-2" />
              Create Organization
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// Join Organization Setup Component
interface JoinOrganizationSetupProps {
  role: UserRole;
  onJoin: (method: 'code' | 'invite', value: string) => void;
  loading: boolean;
  error: string | null;
}

const JoinOrganizationSetup = ({ role, onJoin, loading, error }: JoinOrganizationSetupProps) => {
  const [joinMethod, setJoinMethod] = useState<'code' | 'invite'>('code');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onJoin(joinMethod, value);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Join as {role === 'employee' ? 'Employee' : 'Client'}
      </h2>
      <p className="text-gray-600 mb-6">
        Connect with your organization to access your {role === 'employee' ? 'work dashboard' : 'client portal'}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setJoinMethod('code')}
            className={`flex-1 p-4 border-2 rounded-lg transition-all ${
              joinMethod === 'code' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Link className="w-6 h-6 mx-auto text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Join Code</h3>
            <p className="text-sm text-gray-600">Use a 6-character join code</p>
          </button>
          
          <button
            onClick={() => setJoinMethod('invite')}
            className={`flex-1 p-4 border-2 rounded-lg transition-all ${
              joinMethod === 'invite' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Mail className="w-6 h-6 mx-auto text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Invite Link</h3>
            <p className="text-sm text-gray-600">Use an invitation link</p>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {joinMethod === 'code' ? 'Organization Join Code' : 'Invitation Link or Code'}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={joinMethod === 'code' ? 'e.g., ABC-123' : 'Paste invitation link or code'}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            {joinMethod === 'code' 
              ? 'Ask your organization administrator for the join code'
              : 'Check your email for an invitation link from your organization'
            }
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Joining Organization...
            </>
          ) : (
            <>
              <Users className="w-5 h-5 mr-2" />
              Join Organization
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Onboarding; 