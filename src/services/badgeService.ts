import { BadgeType } from '../lib/calculationLogic';

export interface Badge {
  name: string;
  type: BadgeType;
  earnedDate: string;
}

export interface CalculationResponse {
  points: {
    total: number;
    gameBadges: number;
    triviaBadges: number;
    skillBadges: number;
    milestonePoints: number;
  };
  badges: Badge[];
  profileData: {
    name: string;
    memberSince: string;
  };
  milestoneProgress?: {
    currentMilestone: number;
    progress: number;
  };
}

class BadgeService {
  async calculatePoints(profileUrl: string, isFacilitator: boolean = false): Promise<CalculationResponse> {
    const apiUrl = new URL('/api/calculate-points', window.location.origin);
    apiUrl.searchParams.append('profileUrl', profileUrl);
    apiUrl.searchParams.append('isFacilitator', String(isFacilitator));

    try {
      const response = await fetch(apiUrl.toString());
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error calculating points:', error);
      throw new Error('Failed to calculate points. Please ensure the server is running and the profile URL is correct.');
    }
  }

  async getProfileBadges(profileUrl: string): Promise<Badge[]> {
    // This function can be updated to fetch badges from the backend if needed
    // For now, it will rely on the calculatePoints endpoint
    const result = await this.calculatePoints(profileUrl);
    return result.badges;
  }

  async getProfilePointsSummary(profileUrl: string, isFacilitator: boolean = false): Promise<CalculationResponse> {
    return this.calculatePoints(profileUrl, isFacilitator);
  }
}

export const badgeService = new BadgeService();