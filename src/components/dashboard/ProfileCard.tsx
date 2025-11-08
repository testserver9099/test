import React from 'react';
import { motion } from 'framer-motion';
import { Star, Trophy, Award } from 'lucide-react';

interface ProfileCardProps {
  user: {
    name: string;
    avatar: string;
    memberSince: string;
    league: string;
    arcadePoints: number;
    leaderboardRank: number;
    totalBadges: number;
    milestonePoints?: number;
  };
  isFacilitator?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, isFacilitator = true }) => {
  // Calculate display points based on facilitator mode
  const milestoneBonus = user.milestonePoints || 0;
  const totalPoints = user.arcadePoints || 0;
  const basePoints = totalPoints - milestoneBonus;
  const displayPoints = isFacilitator ? totalPoints : basePoints;
  
  const stats = [
    {
      icon: Star,
      label: 'Arcade Points',
      value: displayPoints,
      color: 'text-yellow-400'
    },
    {
      icon: Trophy,
      label: 'Leaderboard Rank',
      value: user.leaderboardRank,
      color: 'text-purple-400'
    },
    {
      icon: Award,
      label: 'Total Badges',
      value: user.totalBadges,
      color: 'text-blue-400'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl p-6 text-white shadow-xl border border-purple-700/30"
    >
      {/* User Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {user.avatar}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{user.name}</h3>
          <p className="text-purple-200 text-sm">Member since {user.memberSince}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="bg-yellow-500 text-black text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              <Star className="w-3 h-3" />
              {user.league}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-purple-200 mb-3">Profile Stats</h4>
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-sm text-gray-300">{stat.label}</span>
            </div>
            <span className="text-lg font-bold text-white">{stat.value.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}; 