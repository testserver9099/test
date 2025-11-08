import React from 'react';
import BadgeDisplay from './BadgeDisplay';
import Sidebar from './dashboard/Sidebar';
import MainContent from './dashboard/MainContent';

export default function Dashboard() {
  // Mock user data that matches the User interface
  const user = {
    name: 'Aniket Yadav',
    avatar: 'A',
    memberSince: '2025',
    league: 'Gold League',
    arcadePoints: 9,
    leaderboardRank: 7050,
    totalBadges: 8
  };

  // Mock badges data
  const badges = [
    {
      badge: {
        name: 'Google Cloud Fundamentals: Core Infrastructure',
        type: 'skill' as const,
        earnedDate: '2025-01-15'
      },
      earnedDate: '2025-01-15'
    },
    {
      badge: {
        name: 'Getting Started: Create and Manage Cloud Resources',
        type: 'game' as const,
        earnedDate: '2025-01-20'
      },
      earnedDate: '2025-01-20'
    },
    {
      badge: {
        name: 'Cloud Architecture: Design, Implement, and Manage',
        type: 'trivia' as const,
        earnedDate: '2025-01-25'
      },
      earnedDate: '2025-01-25'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar user={user} />
      <MainContent user={user} />
    </div>
  );
} 