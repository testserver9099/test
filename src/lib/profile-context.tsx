import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { CalculationResponse, Badge } from './../services/badgeService';
import { useLeaderboard } from './leaderboard-context'; // Import useLeaderboard

export interface Profile {
  id: string;
  name: string;
  profileUrl: string;
  calculationResponse?: CalculationResponse;
  lastUpdated: string;
}

interface ProfileContextType {
  profiles: Profile[];
  selectedProfileId: string | null;
  addProfile: (profileUrl: string, name?: string) => Promise<string>;
  removeProfile: (id: string) => void;
  selectProfile: (id: string | null) => void;
  updateProfileCalculation: (id: string, calculationResponse: CalculationResponse) => void;
  updateProfileName: (id: string, newName: string) => void; // Added updateProfileName
  getProfileById: (id: string) => Profile | undefined;
  selectedProfile: Profile | undefined;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const storedProfiles = localStorage.getItem('profiles');
    return storedProfiles ? JSON.parse(storedProfiles) : [];
  });
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(() => {
    return localStorage.getItem('selectedProfileId');
  });

  const { updateLeaderboardEntry } = useLeaderboard(); // Use the leaderboard context

  useEffect(() => {
    localStorage.setItem('profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('selectedProfileId', selectedProfileId || '');
  }, [selectedProfileId]);

  const addProfile = async (profileUrl: string, name?: string): Promise<string> => {
    const newProfile: Profile = {
      id: Date.now().toString(), // Simple unique ID
      name: name || `Profile ${profiles.length + 1}`,
      profileUrl,
      lastUpdated: new Date().toISOString(),
    };
    setProfiles(prevProfiles => [...prevProfiles, newProfile]);
    if (!selectedProfileId) {
      setSelectedProfileId(newProfile.id);
    }
    return newProfile.id; // Return the new profile ID
  };

  const removeProfile = (id: string) => {
    setProfiles(prevProfiles => prevProfiles.filter(profile => profile.id !== id));
    if (selectedProfileId === id) {
      setSelectedProfileId(profiles.length > 1 ? profiles[0].id : null);
    }
  };

  const selectProfile = (id: string | null) => {
    setSelectedProfileId(id);
  };

  const updateProfileCalculation = useCallback((id: string, calculationResponse: CalculationResponse) => {
    setProfiles(prevProfiles => {
      const updatedProfiles = prevProfiles.map(profile =>
        profile.id === id
          ? { ...profile, calculationResponse, lastUpdated: new Date().toISOString() }
          : profile
      );
      const updatedProfile = updatedProfiles.find(profile => profile.id === id);
      if (updatedProfile) {
        updateLeaderboardEntry(updatedProfile); // Update leaderboard when profile calculation changes
      }
      return updatedProfiles;
    });
  }, [updateLeaderboardEntry]);

  const updateProfileName = useCallback((id: string, newName: string) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(profile =>
        profile.id === id
          ? { ...profile, name: newName, lastUpdated: new Date().toISOString() }
          : profile
      )
    );
  }, []);

  const getProfileById = (id: string) => {
    return profiles.find(profile => profile.id === id);
  };

  const selectedProfile = selectedProfileId
    ? profiles.find(profile => profile.id === selectedProfileId)
    : undefined;

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        selectedProfileId,
        addProfile,
        removeProfile,
        selectProfile,
        updateProfileCalculation,
        updateProfileName, // Added to context value
        getProfileById,
        selectedProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
