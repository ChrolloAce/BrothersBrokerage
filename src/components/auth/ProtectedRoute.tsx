import { useState, useEffect, ReactNode } from 'react';
import { AuthService, User } from '../../services/AuthService';
import { OrganizationManager } from '../../managers/OrganizationManager';
import { UserProfile } from '../../types/user';
import Login from './Login';
import Onboarding from './Onboarding';
import { Loader2, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const authService = AuthService.getInstance();
  const orgManager = OrganizationManager.getInstance();

  useEffect(() => {
    const checkUserStatus = async (firebaseUser: User | null) => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!firebaseUser) {
          setUser(null);
          setUserProfile(null);
          setNeedsOnboarding(false);
          setIsLoading(false);
          return;
        }

        setUser(firebaseUser);

        // Initialize user session and check if profile exists
        const profile = await orgManager.initializeUserSession(firebaseUser.uid);
        
        if (profile) {
          setUserProfile(profile);
          setNeedsOnboarding(false);
        } else {
          // User exists in Firebase Auth but not in our database - needs onboarding
          setUserProfile(null);
          setNeedsOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        setError('Failed to load user profile. Please try again.');
        setNeedsOnboarding(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Check current user
    const currentUser = authService.getCurrentUser();
    checkUserStatus(currentUser);

    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChanged(checkUserStatus);

    return () => unsubscribe();
  }, [authService, orgManager]);

  const handleOnboardingComplete = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Refresh user profile after onboarding
      if (user) {
        const profile = await orgManager.initializeUserSession(user.uid);
        setUserProfile(profile);
        setNeedsOnboarding(false);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      setError('Failed to complete setup. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setIsLoading(true);
      handleOnboardingComplete();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading your dashboard...</span>
          </div>
          <p className="text-sm text-gray-500">Setting up your personalized experience</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not logged in - show login
  if (!user) {
    return <Login onLoginSuccess={() => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    }} />;
  }

  // Logged in but needs onboarding
  if (needsOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // User is logged in, has profile, and has completed onboarding
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600 mb-4">Your user profile could not be loaded.</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Profile
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 