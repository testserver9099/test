import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Profile } from './profile-context';

export interface LeaderboardEntry {
  profileUrl: string;
  name: string;
  points: number;
  badges: number;
  lastUpdated: string;
  rank?: number; // Rank will be calculated by backend
}

interface LeaderboardContextType {
  leaderboard: LeaderboardEntry[];
  updateLeaderboardEntry: (profile: Profile) => Promise<void>;
  getLeaderboard: () => LeaderboardEntry[];
  refreshLeaderboard: () => Promise<void>;
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

interface LeaderboardProviderProps {
  children: ReactNode;
}

const API_URL = 'http://localhost:3001';

export const LeaderboardProvider: React.FC<LeaderboardProviderProps> = ({ children }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Fetch global leaderboard on mount
  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  const fetchGlobalLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/leaderboard`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
    }
  };

  const updateLeaderboardEntry = async (profile: Profile) => {
    if (!profile.calculationResponse) return;

    try {
      const response = await fetch(`${API_URL}/api/leaderboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileUrl: profile.profileUrl,
          name: profile.name,
          points: profile.calculationResponse.points.total,
          badges: profile.calculationResponse.badges.length,
        }),
      });

      const updatedLeaderboard = await response.json();
      setLeaderboard(updatedLeaderboard);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  };

  const getLeaderboardSorted = (): LeaderboardEntry[] => {
    return leaderboard;
  };

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        updateLeaderboardEntry,
        getLeaderboard: getLeaderboardSorted,
        refreshLeaderboard: fetchGlobalLeaderboard,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  );
};

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};
