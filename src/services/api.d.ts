export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface CalculatePointsRequest {
  profileUrl: string;
}

export interface User {
  id: string;
  profileUrl: string;
  // Add other user properties as needed
}

export interface LeaderboardEntry {
  userId: string;
  points: number;
  rank: number;
  // Add other leaderboard properties as needed
}

export const api: {
  calculatePoints(profileUrl: string): Promise<any>;
  calculatePointsEnhanced(profileUrl: string): Promise<any>;
  getUser(profileUrl: string): Promise<any>;
  getLeaderboard(): Promise<any>;
}; 