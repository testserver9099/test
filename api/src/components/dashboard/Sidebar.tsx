import React from 'react';
import { motion } from 'framer-motion';

interface User {
  name: string;
  avatar: string;
  memberSince: string;
  league: string;
  arcadePoints: number;
  leaderboardRank: number;
  totalBadges: number;
  milestonePoints?: number;
}

interface SidebarProps {
  user: User;
  isFacilitator?: boolean;
}

const swagTiers = [
  { name: 'Arcade Novice Tier', points: 30, img: '', },
  { name: 'Arcade Trooper Tier', points: 40, img: '', },
  { name: 'Arcade Ranger Tier', points: 60, img: '', },
  { name: 'Arcade Champion Tier', points: 75, img: '', },
  { name: 'Arcade Legend Tier', points: 85, img: '', },
];

export default function Sidebar({ user, isFacilitator = true }: SidebarProps) {
  // Calculate display points based on facilitator mode
  const milestoneBonus = user.milestonePoints || 0;
  const totalPoints = user.arcadePoints || 0;
  const basePoints = totalPoints - milestoneBonus;
  const displayPoints = isFacilitator ? totalPoints : basePoints;
  
  return (
    <aside className="w-full md:w-80 flex-shrink-0 bg-[#20243A] rounded-2xl p-6 flex flex-col gap-6">
      {/* Profile Card */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 rounded-xl p-4 flex flex-col items-center text-white mb-2">
        <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-2xl font-bold mb-2">
          {user.name[0]}
        </div>
        <div className="font-semibold text-lg">{user.name}</div>
        <div className="text-xs opacity-80">Member since {user.memberSince}</div>
        <div className="mt-2 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">{user.league}</div>
      </div>
      {/* Stats */}
      <div className="bg-[#23263A] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Arcade Points</span>
          <span className="font-bold text-white">{displayPoints}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Leaderboard</span>
          <span className="font-bold text-white">{user.leaderboardRank}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">Total Badges</span>
          <span className="font-bold text-white">{user.totalBadges}</span>
        </div>
      </div>
      {/* Swag Tiers */}
      <div className="bg-[#23263A] rounded-xl p-4 flex flex-col gap-4">
        <div className="font-semibold text-white mb-2">Arcade Swags Tier</div>
        {swagTiers.map((tier, idx) => (
          <div key={tier.name} className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
              {/* Replace with tier.img if available */}
              <span className="text-xs text-gray-400">Image</span>
            </div>
            <div className="flex-1">
              <div className="font-medium text-white text-sm">{tier.name}</div>
              <div className="text-xs text-gray-400">{tier.points} Points Required</div>
            </div>
            <button className="ml-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full font-semibold transition">View Rewards</button>
          </div>
        ))}
      </div>
    </aside>
  );
} 