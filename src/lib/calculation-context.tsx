import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CalculationResult {
  success: boolean;
  user: {
    points: number;
    badges: Array<{
      name: string;
      type: string;
      points: number;
      category: string;
      completed: boolean;
      earnedDate?: string;
    }>;
  };
  profileData?: {
    name: string;
    memberSince: string;
  };
  breakdown: {
    skill: { count: number; points: number; pointsPerBadge: number };
    level: { count: number; points: number; pointsPerBadge: number };
    trivia: { count: number; points: number; pointsPerBadge: number };
    completion: { count: number; points: number; pointsPerBadge: number };
  };
  summary: {
    skillBadges: number;
    levelBadges: number;
    triviaBadges: number;
    completionBadges: number;
    totalPoints: number;
    milestonePoints?: number;
  };
}

interface CalculationContextType {
  calculationResult: CalculationResult | null;
  setCalculationResult: (result: CalculationResult | null) => void;
  profileUrl: string;
  setProfileUrl: (url: string) => void;
  isCalculating: boolean;
  setIsCalculating: (calculating: boolean) => void;
}

const CalculationContext = createContext<CalculationContextType | undefined>(undefined);

export function CalculationProvider({ children }: { children: ReactNode }) {
  // Load saved data from localStorage on mount
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(() => {
    try {
      const saved = localStorage.getItem('arcadeCalcData');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load saved calculation data:', error);
      return null;
    }
  });

  const [profileUrl, setProfileUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('arcadeProfileUrl');
      return saved || '';
    } catch (error) {
      return '';
    }
  });

  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Wrapper function to save data when setting calculation result
  const saveCalculationResult = (result: CalculationResult | null) => {
    setCalculationResult(result);
    try {
      if (result) {
        localStorage.setItem('arcadeCalcData', JSON.stringify(result));
      } else {
        localStorage.removeItem('arcadeCalcData');
      }
    } catch (error) {
      console.error('Failed to save calculation data:', error);
    }
  };

  // Wrapper function to save profile URL
  const saveProfileUrl = (url: string) => {
    setProfileUrl(url);
    try {
      if (url) {
        localStorage.setItem('arcadeProfileUrl', url);
      } else {
        localStorage.removeItem('arcadeProfileUrl');
      }
    } catch (error) {
      console.error('Failed to save profile URL:', error);
    }
  };

  return (
    <CalculationContext.Provider
      value={{
        calculationResult,
        setCalculationResult: saveCalculationResult,
        profileUrl,
        setProfileUrl: saveProfileUrl,
        isCalculating,
        setIsCalculating,
      }}
    >
      {children}
    </CalculationContext.Provider>
  );
}

export function useCalculation() {
  const context = useContext(CalculationContext);
  if (context === undefined) {
    throw new Error('useCalculation must be used within a CalculationProvider');
  }
  return context;
} 