import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '@/lib/dashboard-context';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { SwagTiers } from '@/components/dashboard/SwagTiers';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { ArcadeCalcWidget } from '@/components/dashboard/ArcadeCalcWidget';
import { BadgeCategories } from '@/components/dashboard/BadgeCategories';
import { IncompleteBadges } from '@/components/dashboard/IncompleteBadges';
import { Loader2 } from 'lucide-react';

export default function DashboardOverview() {
  const {
    user,
    swagTiers,
    badgeCategories,
    incompleteBadges,
    weeklyProgress,
    lastCalculations,
    totalPointsThisSeason,
    isLoading,
    onStartChallenge,
    onCategoryClick,
    onViewFullReport,
    isFacilitator
  } = useDashboard();

  if (isLoading) {
  return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-b border-purple-700/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">ArcadeCalc Dashboard</h1>
              <div className="hidden sm:block w-px h-6 bg-purple-600/50"></div>
              <div className="text-sm text-purple-200">
                Welcome back, {user.name}!
              </div>
        </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-300">
                <span>Last updated:</span>
                <span className="text-purple-300">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <ProfileCard user={user} isFacilitator={isFacilitator} />

            {/* Swag Tiers */}
            <SwagTiers tiers={swagTiers} currentPoints={user.arcadePoints} />
          </div>

        {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Top Row - Progress Chart and ArcadeCalc Widget */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ProgressChart data={weeklyProgress} />
              <ArcadeCalcWidget
                lastCalculations={lastCalculations as any}
                totalPointsThisSeason={totalPointsThisSeason}
                onViewFullReport={onViewFullReport}
              />
            </div>

            {/* Badge Categories */}
            <BadgeCategories
              categories={badgeCategories as any}
              onCategoryClick={onCategoryClick}
            />

            {/* Incomplete Badges */}
            <IncompleteBadges
              badges={incompleteBadges as any}
              onStartChallenge={onStartChallenge}
            />
          </div>
                  </div>

        {/* Quick Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-900/50 rounded-xl border border-gray-700/50"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {user.arcadePoints}
            </div>
            <div className="text-xs text-gray-400">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {user.totalBadges}
            </div>
            <div className="text-xs text-gray-400">Badges Earned</div>
        </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              #{user.leaderboardRank}
            </div>
            <div className="text-xs text-gray-400">Leaderboard Rank</div>
                </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {user.league}
            </div>
            <div className="text-xs text-gray-400">Current League</div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 bg-gray-900/50 border-t border-gray-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <span className="text-purple-400 font-semibold">ArcadeCalc</span>
              <span>© 2025 All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-purple-300 transition-colors">Dashboard</a>
              <a href="#" className="hover:text-purple-300 transition-colors">Leaderboard</a>
              <a href="#" className="hover:text-purple-300 transition-colors">Resources</a>
        </div>
            <div className="text-xs text-gray-500">
              Made with ♥ by Deepashu Projects
          </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
