import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

// Define the user's profile badge types
export type BadgeType = 'profile' | 'activity' | 'challenge' | 'community' | 'learning';

// Define a badge object type
export interface Badge {
  id: string;
  name: string;
  description: string;
  type: BadgeType;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number; // 0-100
}

// Define profile completion steps
export interface ProfileCompletionStep {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  points: number;
}

// Enhanced user type with profile completion and gamification
type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  title: string;
  points: number;
  badges: Badge[];
  profileCompletion: {
    percent: number;
    steps: ProfileCompletionStep[];
  };
  lastActive?: Date;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean; // Kept for initial load simulation
  updateProfileStep: (stepId: string, completed: boolean) => void;
  updateUserProfile: (updates: Partial<Omit<User, 'id'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PROFILE_STEPS: ProfileCompletionStep[] = [
  { id: 'profile-picture', name: 'Add Profile Picture', description: 'Upload a profile picture to personalize your account', completed: false, points: 10 },
  { id: 'complete-bio', name: 'Complete Bio', description: 'Tell us a bit about yourself', completed: false, points: 15 },
  { id: 'verify-email', name: 'Verify Email (Demo)', description: 'Verify your email address', completed: true, points: 25 }, // Auto-completed for demo
  { id: 'connect-social', name: 'Connect Social Account (Demo)', description: 'Link your social media accounts', completed: false, points: 20 },
  { id: 'first-challenge', name: 'Complete First Challenge', description: 'Finish your first challenge on ArcadeVerse', completed: false, points: 50 }
];

const DEFAULT_BADGES: Badge[] = [
  { id: 'newcomer', name: 'Newcomer', description: 'Welcome to ArcadeVerse!', type: 'profile', icon: '🎮', unlocked: true, unlockedAt: new Date() },
  { id: 'profile-starter', name: 'Profile Starter', description: 'Complete 40% of your profile', type: 'profile', icon: '👤', unlocked: false, progress: 0 },
  { id: 'profile-pro', name: 'Profile Pro', description: 'Complete 100% of your profile', type: 'profile', icon: '🌟', unlocked: false, progress: 0 },
  { id: 'challenger', name: 'Challenger', description: 'Complete your first challenge', type: 'challenge', icon: '🏆', unlocked: false },
  { id: 'community-member', name: 'Community Member (Demo)', description: 'Engage with the community', type: 'community', icon: '👥', unlocked: false }
];

const calculateProfileCompletion = (steps: ProfileCompletionStep[]): number => {
  if (!steps.length) return 0;
  const completedSteps = steps.filter(step => step.completed).length;
  return Math.round((completedSteps / steps.length) * 100);
};

const createDefaultUser = (): User => {
  const steps = DEFAULT_PROFILE_STEPS.map(s => ({ ...s })); // Ensure fresh copy
  const badges = DEFAULT_BADGES.map(b => ({ ...b })); // Ensure fresh copy
  return {
    id: 'default-user',
    name: 'Arcade Player',
    email: 'player@arcadeverse.app',
    avatar: 'https://source.unsplash.com/random/100x100/?abstract',
    level: 1,
    title: 'Explorer',
    points: calculateProfileCompletion(steps) > 0 ? DEFAULT_PROFILE_STEPS.find(s => s.id === 'verify-email')?.points || 0 : 0,
    badges,
    profileCompletion: {
      percent: calculateProfileCompletion(steps),
      steps
    },
    lastActive: new Date()
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('arcadeverse_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        // Ensure steps and badges are present, otherwise re-initialize with defaults
        if (!parsedUser.profileCompletion || !parsedUser.profileCompletion.steps || !parsedUser.badges) {
          setUser(createDefaultUser());
        } else {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to parse stored user data, initializing default user', error);
        setUser(createDefaultUser());
        localStorage.removeItem('arcadeverse_user'); // Clear corrupted data
      }
    } else {
      const defaultUser = createDefaultUser();
      setUser(defaultUser);
      localStorage.setItem('arcadeverse_user', JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user || !user.badges || !user.profileCompletion) return;

    const updatedBadges = [...user.badges];
    const profileStarterBadge = updatedBadges.find(b => b.id === 'profile-starter');
    const profileProBadge = updatedBadges.find(b => b.id === 'profile-pro');

    if (profileStarterBadge) {
      profileStarterBadge.progress = user.profileCompletion.percent;
      if (user.profileCompletion.percent >= 40 && !profileStarterBadge.unlocked) {
        profileStarterBadge.unlocked = true;
        profileStarterBadge.unlockedAt = new Date();
      }
    }

    if (profileProBadge) {
      profileProBadge.progress = user.profileCompletion.percent;
      if (user.profileCompletion.percent === 100 && !profileProBadge.unlocked) {
        profileProBadge.unlocked = true;
        profileProBadge.unlockedAt = new Date();
      }
    }
    // Only update if badges actually changed to prevent infinite loops
    if (JSON.stringify(user.badges) !== JSON.stringify(updatedBadges)) {
      setUser(prevUser => prevUser ? { ...prevUser, badges: updatedBadges } : null);
    }
  }, [user]);

  const updateProfileStep = (stepId: string, completed: boolean) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const updatedSteps = currentUser.profileCompletion.steps.map(s =>
        s.id === stepId ? { ...s, completed } : s
      );
      if (JSON.stringify(currentUser.profileCompletion.steps) === JSON.stringify(updatedSteps)) return currentUser;

      const pointChange = updatedSteps.find(s => s.id === stepId)!.points * (completed ? 1 : -1);
      const newPercent = calculateProfileCompletion(updatedSteps);

      const updatedUser = {
        ...currentUser,
        points: currentUser.points + pointChange,
        profileCompletion: { percent: newPercent, steps: updatedSteps }
      };
      localStorage.setItem('arcadeverse_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const updateUserProfile = (updates: Partial<Omit<User, 'id'>>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('arcadeverse_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = {
    user,
    isLoading,
    updateProfileStep,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
