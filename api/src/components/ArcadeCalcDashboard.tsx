import React from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { useProfile } from '@/lib/profile-context';
import { useCalculation } from '@/lib/calculation-context';
import { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  Home, 
  BarChart3, 
  Trophy, 
  BookOpen,
  Info,
  Star,
  ChevronDown,
  Search,
  Beaker,
  ExternalLink,
  Flame,
  Award,
  Target,
  X,
  Check
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function ArcadeCalcDashboard() {
  const {
    user,
    swagTiers,
    badgeCategories,
    incompleteBadges,
    weeklyProgress,
    isLoading,
    onStartChallenge,
    isFacilitator,
    setIsFacilitator
  } = useDashboard();

  const { selectedProfile } = useProfile();
  const { calculationResult } = useCalculation();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<'all' | 'trivia' | 'game' | 'skill' | 'lab-free'>('all');
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate display points based on facilitator toggle
  const milestoneBonus = user.milestonePoints || 0;
  const totalPoints = user.arcadePoints || 0;
  const basePoints = totalPoints - milestoneBonus;
  const displayPoints = isFacilitator ? totalPoints : basePoints;

  // Calculate badge counts by type from badge categories
  // For milestone section, use server's filtered badge counts (Aug 4 - Oct 13, 2025)
  const getBadgeCountsByType = () => {
    // If we have calculation result with milestone data, use it (already filtered by server)
    if (calculationResult?.user?.badges) {
      const milestoneBadges = calculationResult.user.badges.filter((badge: any) => {
        if (!badge.earnedDate) return false;
        const earnedDate = new Date(badge.earnedDate);
        const milestoneStart = new Date('2025-08-04T17:00:00'); // August 4, 2025 5:00 PM
        const milestoneEnd = new Date('2025-10-13T23:59:00'); // October 13, 2025 11:59 PM
        return earnedDate >= milestoneStart && earnedDate <= milestoneEnd;
      });

      const gameBadges = milestoneBadges.filter((b: any) => b.type === 'game').length;
      const triviaBadges = milestoneBadges.filter((b: any) => b.type === 'trivia').length;
      const skillBadges = milestoneBadges.filter((b: any) => b.type === 'skill').length;
      const labFreeBadges = milestoneBadges.filter((b: any) => b.type === 'lab-free').length;


      return { gameBadges, triviaBadges, skillBadges, labFreeBadges };
    }

    // Fallback: Use badge categories (all badges, not filtered by date)
    const baseCampBadges = badgeCategories.find(cat => cat.name === 'Base Camp Badges')?.badges || 0;
    const levelBadges = badgeCategories.find(cat => cat.name === 'Level Badges')?.badges || 0;
    const certificationBadges = badgeCategories.find(cat => cat.name === 'Certification Badges')?.badges || 0;
    const specialBadges = badgeCategories.find(cat => cat.name === 'Special Badges')?.badges || 0;
    const gameBadges = baseCampBadges + levelBadges + certificationBadges + specialBadges;
    
    const triviaBadges = badgeCategories.find(cat => cat.name === 'Trivia Badges')?.badges || 0;
    const skillBadges = badgeCategories.find(cat => cat.name === 'Skill Badges')?.badges || 0;
    const labFreeBadges = badgeCategories.find(cat => cat.name === 'Lab Free Badges')?.badges || 0;
    

    
    return { gameBadges, triviaBadges, skillBadges, labFreeBadges };
  };

  // Define milestone requirements (from official Arcade Facilitator Program)
  const milestones = [
    {
      id: 1,
      name: 'Milestone 1',
      bonusPoints: 2,
      requirements: {
        game: 6,
        trivia: 5,
        skill: 14,
        labFree: 6
      }
    },
    {
      id: 2,
      name: 'Milestone 2',
      bonusPoints: 8,
      requirements: {
        game: 8,
        trivia: 6,
        skill: 28,
        labFree: 12
      }
    },
    {
      id: 3,
      name: 'Milestone 3',
      bonusPoints: 15,
      requirements: {
        game: 10,
        trivia: 7,
        skill: 38,
        labFree: 18
      }
    },
    {
      id: 4,
      name: 'Ultimate Milestone',
      bonusPoints: 25,
      requirements: {
        game: 12,
        trivia: 8,
        skill: 52,
        labFree: 24
      }
    }
  ];

  // Check if milestone is completed
  const isMilestoneCompleted = (milestone: typeof milestones[0]) => {
    const counts = getBadgeCountsByType();
    return (
      counts.gameBadges >= milestone.requirements.game &&
      counts.triviaBadges >= milestone.requirements.trivia &&
      counts.skillBadges >= milestone.requirements.skill &&
      counts.labFreeBadges >= milestone.requirements.labFree
    );
  };

  // Calculate total bonus points from completed milestones
  const calculateBonusPoints = () => {
    // Use the milestone points from the server if available
    if (user.milestonePoints !== undefined) {
      return user.milestonePoints;
    }
    // Fallback to calculating from milestone completion
    return milestones.reduce((total, milestone) => {
      return total + (isMilestoneCompleted(milestone) ? milestone.bonusPoints : 0);
    }, 0);
  };

  const totalBonusPoints = calculateBonusPoints();

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  // Filter incomplete badges based on selected filter
  const filteredIncompleteBadges = selectedBadgeFilter === 'all' 
    ? incompleteBadges 
    : incompleteBadges.filter(badge => {
        if (selectedBadgeFilter === 'trivia') return badge.category === 'Trivia';
        if (selectedBadgeFilter === 'game') return badge.category === 'Game';
        if (selectedBadgeFilter === 'skill') return badge.category === 'Skill';
        if (selectedBadgeFilter === 'lab-free') return badge.category === 'Lab-Free';
        return true;
      });

  // Count badges by type
  const badgeCounts = {
    all: incompleteBadges.length,
    trivia: incompleteBadges.filter(b => b.category === 'Trivia').length,
    game: incompleteBadges.filter(b => b.category === 'Game').length,
    skill: incompleteBadges.filter(b => b.category === 'Skill').length,
    labFree: incompleteBadges.filter(b => b.category === 'Lab-Free').length
  };

  // Weekly progress data formatting
  const weeklyData = weeklyProgress?.map((day) => ({
    day: day.day.substring(0, 3),
    value: day.points
  })) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header removed - using site header from DashboardLayout */}

      {/* Main Dashboard Grid */}
      <div className="flex gap-6 p-6 w-full">
        {/* LEFT SIDEBAR */}
        <aside className="w-[400px] flex-shrink-0 space-y-4">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl p-8 shadow-xl">
            <div className="flex items-center space-x-4 mb-5">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {user.avatar || 'A'}
              </div>
              <div className="flex-1">
                <h2 className="text-white font-bold text-lg leading-tight">{user.name || 'ANIKET YADAV'}</h2>
                <p className="text-purple-100 text-sm mt-1">Member since {user.memberSince || '2025'}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-purple-100">Unknown League</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Stats</h3>
              <Info className="w-4 h-4 text-gray-500" />
            </div>
            <div className="space-y-3">
              {/* Arcade Points + Bonus Breakdown - Always Visible */}
              <div className="relative bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/40 rounded-lg p-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 animate-pulse"></div>
                <div className="relative flex items-center justify-center space-x-2 text-sm font-medium">
                  <Flame className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-200">
                    <span className="text-white font-semibold">{basePoints}</span>
                    <span className="text-gray-400 mx-1">arcade</span>
                    <span className="text-purple-400">+</span>
                    <span className="text-purple-300 font-semibold mx-1">{totalBonusPoints}</span>
                    <span className="text-gray-400 mr-1">bonus</span>
                    <span className="text-gray-400">=</span>
                    <span className="text-white font-bold ml-1">{totalPoints}</span>
                  </span>
                </div>
              </div>
              
              {/* Arcade Points Only */}
              <div className="bg-gray-200 dark:bg-gray-700/50 rounded-lg p-3 hover:bg-gray-300 dark:hover:bg-gray-700/70 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Arcade Points</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {basePoints}
                  </span>
                </div>
              </div>
              
              {/* Leaderboard */}
              <div className="bg-gray-200 dark:bg-gray-700/50 rounded-lg p-3 hover:bg-gray-300 dark:hover:bg-gray-700/70 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Leaderboard</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{user.leaderboardRank || 0}</span>
                </div>
              </div>
              
              {/* Total Badges */}
              <div className="bg-gray-200 dark:bg-gray-700/50 rounded-lg p-3 hover:bg-gray-300 dark:hover:bg-gray-700/70 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Total Badges</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{user.totalBadges || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Progress</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Badges earned this week</p>
              </div>
              <Info className="w-4 h-4 text-gray-500" />
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    domain={[0, 'auto']}
                    label={{ value: 'Badges', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#9ca3af' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [`${value} badges`, 'Earned']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={{ fill: '#a855f7', strokeWidth: 2, r: 3 }}
                    name="Badges"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Arcade Swags Tier */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-300 dark:border-gray-700">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Arcade Swags Tier</h3>
              <Info className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-6">
              {swagTiers.map((tier, index) => (
                <div 
                  key={index} 
                  className="bg-gray-200 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-300 dark:border-gray-600 cursor-pointer hover:border-purple-500 transition-colors"
                  onClick={() => setSelectedTier(tier)}
                >
                  {/* Tier Title */}
                  <h4 className="text-center text-white text-lg font-semibold mb-2">{tier.name}</h4>
                  
                  {/* Points Required */}
                  <p className="text-center text-purple-400 text-sm font-medium mb-4">{tier.pointsRequired} Points Required</p>
                  
                  {/* Tier Icon/Image */}
                  <div className="flex justify-center mb-6">
                    {tier.image ? (
                      <div className="w-40 h-40 bg-gray-600 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden p-2">
                        <img 
                          src={tier.image} 
                          alt={`${tier.name} rewards`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                        <Award className="fallback-icon hidden w-16 h-16 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-600 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <Award className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* View Rewards Button */}
                  <button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-3 rounded-lg transition-colors font-medium"
                  >
                    View Rewards
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 space-y-6">
          {/* Top Row: Facilitator Milestone + Swag Progress */}
          <div className="flex gap-6">
            {/* Facilitator Program Milestone - Always Visible */}
            <div className="flex-1 bg-[#1f2937] rounded-xl p-6 border border-gray-700 h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-bold text-white">Facilitator Program Milestone</h3>
                    <p className="text-xs text-gray-400">Duration: (August 4 - October 13, 2025)</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* Milestone Cards */}
              <div className="space-y-3.5">
                {milestones.map((milestone, index) => {
                  const isCompleted = isMilestoneCompleted(milestone);
                  const counts = getBadgeCountsByType();
                  const isUltimate = milestone.id === 4;
                  
                  // Find the highest completed milestone
                  const highestCompletedMilestone = milestones.filter(m => isMilestoneCompleted(m)).pop();
                  const isHighestCompleted = isCompleted && highestCompletedMilestone?.id === milestone.id;
                  
                  return (
                    <div 
                      key={milestone.id} 
                      className={`bg-[#1a1f2e] rounded-lg p-4 ${
                        isCompleted ? 'border-2 border-green-500' : 'border border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-green-500' 
                              : 'bg-red-500/20 border border-red-500'
                          }`}>
                            {isCompleted ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <span className="text-white font-semibold">{milestone.name}</span>
                          {isCompleted && isUltimate && (
                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              Achieved! 🎉
                            </span>
                          )}
                        </div>
                        <span className={`font-semibold text-sm ${
                          isHighestCompleted ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {isHighestCompleted ? `+${milestone.bonusPoints} pts.` : `${milestone.bonusPoints} pts.`}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        {/* Game Badges */}
                        <div>
                          <div className="text-xs text-gray-400 mb-2">Game Badges</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${
                                counts.gameBadges >= milestone.requirements.game ? 'bg-green-500' : 'bg-purple-500'
                              }`}
                              style={{ 
                                width: `${Math.min((counts.gameBadges / milestone.requirements.game) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className={`text-xs text-center ${
                            counts.gameBadges >= milestone.requirements.game ? 'text-green-400 font-semibold' : 'text-gray-300'
                          }`}>
                            {counts.gameBadges}/{milestone.requirements.game}
                          </div>
                        </div>

                        {/* Trivia Badges */}
                        <div>
                          <div className="text-xs text-gray-400 mb-2">Trivia Badges</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${
                                counts.triviaBadges >= milestone.requirements.trivia ? 'bg-green-500' : 'bg-purple-500'
                              }`}
                              style={{ 
                                width: `${Math.min((counts.triviaBadges / milestone.requirements.trivia) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className={`text-xs text-center ${
                            counts.triviaBadges >= milestone.requirements.trivia ? 'text-green-400 font-semibold' : 'text-gray-300'
                          }`}>
                            {counts.triviaBadges}/{milestone.requirements.trivia}
                          </div>
                        </div>

                        {/* Skill Badges */}
                        <div>
                          <div className="text-xs text-gray-400 mb-2">Skill Badges</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${
                                counts.skillBadges >= milestone.requirements.skill ? 'bg-green-500' : 'bg-purple-500'
                              }`}
                              style={{ 
                                width: `${Math.min((counts.skillBadges / milestone.requirements.skill) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className={`text-xs text-center ${
                            counts.skillBadges >= milestone.requirements.skill ? 'text-green-400 font-semibold' : 'text-gray-300'
                          }`}>
                            {counts.skillBadges}/{milestone.requirements.skill}
                          </div>
                        </div>

                        {/* Lab Free Badges */}
                        <div>
                          <div className="text-xs text-gray-400 mb-2">Lab Free Badges</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${
                                counts.labFreeBadges >= milestone.requirements.labFree ? 'bg-green-500' : 'bg-purple-500'
                              }`}
                              style={{ 
                                width: `${Math.min((counts.labFreeBadges / milestone.requirements.labFree) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <div className={`text-xs text-center ${
                            counts.labFreeBadges >= milestone.requirements.labFree ? 'text-green-400 font-semibold' : 'text-gray-300'
                          }`}>
                            {counts.labFreeBadges}/{milestone.requirements.labFree}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* RIGHT SIDEBAR - Swag Tier Progress */}
            <aside className="w-[420px] flex-shrink-0 space-y-4">
              <div className="bg-[#1f2937] rounded-xl p-6 border border-gray-700 h-fit">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white">Swags Tier Progress</h3>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Facilitator Program Radio Buttons */}
                <div className="mb-6">
                  <p className="text-xs text-gray-400 mb-3">Are you registered in the Arcade Facilitator Program?</p>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="facilitator"
                        checked={isFacilitator}
                        onChange={() => setIsFacilitator(true)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-white">Yes</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="facilitator"
                        checked={!isFacilitator}
                        onChange={() => setIsFacilitator(false)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-white">No</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {swagTiers.slice(0, 5).map((tier, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            tier.isUnlocked ? 'bg-green-500' : 'bg-red-500/20 border-2 border-red-500'
                          }`}>
                            {tier.isUnlocked ? <span className="text-white text-xs">✓</span> : <X className="w-3 h-3 text-red-500" />}
                          </div>
                          <span className="text-sm text-white font-medium">{tier.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{tier.currentPoints}/{tier.pointsRequired} pts.</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((tier.currentPoints / tier.pointsRequired) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Swags Eligibility Note */}
              <div className={`border rounded-xl p-5 transition-all ${
                isFacilitator 
                  ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/30 border-blue-500/50' 
                  : 'bg-gradient-to-br from-gray-800/40 to-gray-700/30 border-gray-600/50'
              }`}>
                <div className="mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isFacilitator ? 'bg-blue-500/20' : 'bg-gray-600/20'
                    }`}>
                      <Award className={`w-6 h-6 ${
                        isFacilitator ? 'text-blue-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-bold whitespace-nowrap mb-0.5 ${
                        isFacilitator ? 'text-blue-300' : 'text-gray-300'
                      }`}>
                        Swags Eligibility {isFacilitator ? '(Joined Facilitator Program)' : '(Not Enrolled)'}
                      </h4>
                      
                      {/* Status Badge and Tier Info on same row */}
                      <div className="flex items-center justify-between">
                        {/* Status Badge */}
                        {isFacilitator ? (
                          <div className="inline-flex items-center space-x-1.5 bg-green-500/20 border border-green-500/50 rounded-full px-2 py-0.5">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-green-300">Enrolled & Eligible</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center space-x-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-2 py-0.5">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                            <span className="text-xs font-medium text-yellow-300">Eligible (Not Enrolled Yet)</span>
                          </div>
                        )}
                        
                        {/* Tier Info - Small text next to badge */}
                        <div className="text-right">
                          <p className={`text-[11px] font-bold leading-tight ${
                            isFacilitator ? 'text-blue-200' : 'text-gray-200'
                          }`}>
                            {[...swagTiers].reverse().find(tier => tier.isUnlocked)?.name || 'Arcade Novice'}
                          </p>
                          <p className={`text-[10px] leading-tight ${
                            isFacilitator ? 'text-blue-300/80' : 'text-gray-300/80'
                          }`}>
                            {[...swagTiers].reverse().find(tier => tier.isUnlocked)?.pointsRequired} Points
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Current Tier Achievement with Extended Image - No overlay */}
                <div className={`border rounded-lg p-0 relative overflow-hidden ${
                  isFacilitator 
                    ? 'bg-blue-500/10 border-blue-500/30' 
                    : 'bg-gray-500/10 border-gray-500/30'
                }`}>
                  {/* Extended Tier Icon/Image - Full height, no text overlay */}
                  <div className="w-full h-32 bg-gradient-to-br from-purple-500/30 to-purple-600/30 flex items-center justify-center border-2 border-purple-500/40 rounded-lg">
                    {(() => {
                      const currentTier = [...swagTiers].reverse().find(tier => tier.isUnlocked);
                      return currentTier?.image ? (
                        <img 
                          src={currentTier.image} 
                          alt={`${currentTier.name} rewards`}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null;
                    })()}
                    <Award className="fallback-icon w-20 h-20 text-purple-400" style={{ display: [...swagTiers].reverse().find(tier => tier.isUnlocked)?.image ? 'none' : 'block' }} />
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom Row: Badge Categories and Incomplete Badges - Full Width */}
          <div className="space-y-6">
            {/* Badge Categories */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 border border-gray-300 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Badge Categories</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Track your progress across different badge types</p>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-4 rounded-md transition-colors font-medium">
                  {user.totalBadges || 0} badges this season
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-700">
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 text-xs font-medium">Category</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 text-xs font-medium">Badges</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400 text-xs font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {badgeCategories.map((category, index) => {
                      const isExpanded = expandedCategories.has(category.name);
                      const CategoryIcon = category.icon;
                      
                      return (
                        <React.Fragment key={index}>
                          <tr 
                            onClick={() => toggleCategory(category.name)}
                            className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                          >
                            <td className="py-3 flex items-center space-x-2">
                              {CategoryIcon && <CategoryIcon className="w-4 h-4 text-purple-400" />}
                              <span className="text-gray-900 dark:text-white text-sm">{category.name}</span>
                            </td>
                            <td className="py-3 text-gray-900 dark:text-white text-sm">{category.badges}</td>
                            <td className="py-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-900 dark:text-white text-sm">
                                  {category.name === 'Work Meets Play' && category.points === 0 ? 'NaN' : 
                                   category.name === 'Unknown Badges' && category.points === 0 ? '—' : 
                                   category.points}
                                </span>
                                <ChevronDown 
                                  className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={3} className="p-0">
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border-b border-gray-300 dark:border-gray-700">
                                  {category.completedBadges && category.completedBadges.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {category.completedBadges.map((badge, badgeIdx) => (
                                        <div 
                                          key={badgeIdx}
                                          className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-lg transition-all duration-200"
                                        >
                                          {/* Badge Image Container with overflow-hidden */}
                                          <div className="w-full h-32 bg-white flex items-center justify-center p-3 relative overflow-hidden rounded-t-lg">
                                            {/* Level Label */}
                                            {badge.level && (
                                              <div className="absolute top-2 right-2 z-10">
                                                <span className="bg-purple-600/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                                                  {badge.level}
                                                </span>
                                              </div>
                                            )}
                                            
                            {/* Points Label - Top Left (0.5 pts for Skill, dynamic for Game/Trivia) */}
                            <div className="absolute top-1 left-2 z-20">
                              <span className="inline-block bg-gray-900/80 text-white text-xs px-2 py-0.5 rounded font-bold">
                                {category.name === 'Skill Badges' ? '0.5 pts' :
                                 badge.points === 0 ? '0 pts' :
                                 badge.points === 1 ? '1 pt' :
                                 badge.points === 2 ? '2 pts' :
                                 `${badge.points} pts`}
                              </span>
                            </div>                                            {/* Badge Image */}
                                            <img 
                                              src={badge.image} 
                                              alt={badge.title}
                                              className="w-full h-full object-contain"
                                            />
                                          </div>

                                          {/* Badge Info */}
                                          <div className="p-3">
                                            <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[2rem]">
                                              {badge.title}
                                            </h3>
                                            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                                              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700/50 rounded">
                                                {badge.difficulty}
                                              </span>
                                              <span>{badge.labsRequired} {badge.labsRequired === 1 ? 'Lab' : 'Labs'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                                                {badge.points} Credits
                                              </span>
                                              {badge.url && (
                                                <a
                                                  href={badge.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-[10px] text-green-500 hover:text-green-400 font-medium"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  Completed ✓
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-6 text-gray-400">
                                      <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                      <p className="text-sm">No badges in this category yet</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <p className="text-purple-300 text-xs">
                  Some badges can't be tracked as only the first 50 users to complete them earn points. 
                  <a href="#" className="text-purple-400 hover:text-purple-300 ml-1 underline">
                    View the list of those badges here →
                  </a>
                </p>
              </div>
            </div>

          {/* Incomplete Badges Section */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 border border-gray-300 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Incomplete Badges</h3>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedBadgeFilter('all')}
                    className={`text-xs py-1.5 px-3 rounded-full font-medium transition-colors ${
                      selectedBadgeFilter === 'all' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    All {badgeCounts.all}
                  </button>
                  <button 
                    onClick={() => setSelectedBadgeFilter('trivia')}
                    className={`text-xs py-1.5 px-3 rounded-full font-medium transition-colors ${
                      selectedBadgeFilter === 'trivia' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Trivia {badgeCounts.trivia}
                  </button>
                  <button 
                    onClick={() => setSelectedBadgeFilter('game')}
                    className={`text-xs py-1.5 px-3 rounded-full font-medium transition-colors ${
                      selectedBadgeFilter === 'game' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Game {badgeCounts.game}
                  </button>
                  <button 
                    onClick={() => setSelectedBadgeFilter('skill')}
                    className={`text-xs py-1.5 px-3 rounded-full font-medium transition-colors ${
                      selectedBadgeFilter === 'skill' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Skill {badgeCounts.skill}
                  </button>
                  <button 
                    onClick={() => setSelectedBadgeFilter('lab-free')}
                    className={`text-xs py-1.5 px-3 rounded-full font-medium transition-colors ${
                      selectedBadgeFilter === 'lab-free' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Lab-Free {badgeCounts.labFree}
                  </button>
                </div>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search badges..." 
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md pl-7 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-48"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {(showAllBadges ? filteredIncompleteBadges : filteredIncompleteBadges.slice(0, 6)).map((badge, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:border-purple-500 rounded-lg overflow-hidden transition-all duration-200 flex flex-col">
                  {/* Image Section - Dark Blue/Gray Background */}
                  <div className="w-full p-6 flex items-center justify-center relative" style={{ background: 'linear-gradient(to bottom right, rgb(29, 43, 66), rgb(32, 35, 41))' }}>
                    {/* Badge Level Label - Top Right */}
                    {badge.level && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-block bg-purple-600/90 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {badge.level}
                        </span>
                      </div>
                    )}
                    
                    {/* Points Label - Top Left (0.5 pts for Skill, 0 pts for Lab-Free, dynamic for Game/Trivia) */}
                    <div className="absolute top-1 left-2 z-20">
                      <span className="inline-block bg-gray-900/80 text-white text-xs px-2 py-0.5 rounded font-bold">
                        {badge.category === 'Skill' ? '0.5 pts' :
                         badge.category === 'Lab-Free' ? '0 pts' :
                         badge.points === 0 ? '0 pts' :
                         badge.points === 1 ? '1 pt' :
                         badge.points === 2 ? '2 pts' :
                         `${badge.points} pts`}
                      </span>
                    </div>
                    
                    {/* Badge Image */}
                    <div className="w-full h-48">
                      {badge.image ? (
                        <img src={badge.image} alt={badge.title} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center rounded-lg">
                          <Beaker className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content and Button Section */}
                  <div className="p-4 bg-white dark:bg-gray-700/50 flex flex-col flex-grow">
                    {/* Badge Title */}
                    <h4 className="text-gray-900 dark:text-white text-sm font-medium leading-tight mb-2 line-clamp-2 flex-grow">
                      {badge.title}
                    </h4>
                    
                    {/* Badge Info - Labs/Access Code and Credits/Points */}
                    <div className="flex items-center justify-between mb-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        {badge.category === 'Trivia' || badge.category === 'Game' ? (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            {badge.accessCode || 'TBA'}
                          </>
                        ) : badge.category === 'Lab-Free' ? (
                          <>
                            <BookOpen className="w-3 h-3 mr-1" />
                            Course
                          </>
                        ) : (
                          <>
                            <Beaker className="w-3 h-3 mr-1" />
                            {badge.labsRequired} Labs
                          </>
                        )}
                      </span>
                      <span className="flex items-center">
                        <Flame className="w-3 h-3 mr-1 text-orange-500" />
                        {badge.category === 'Lab-Free' ? 'No Points' :
                         badge.category === 'Trivia' || badge.category === 'Game' ? `${badge.points} Points` : 
                         `${badge.points} Credits`}
                      </span>
                    </div>
                    
                    {/* Start Challenge/Start Course Button */}
                    <a 
                      href={badge.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 font-medium"
                    >
                      <span>{badge.category === 'Lab-Free' ? 'Start Course' : 'Start Challenge'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button 
                onClick={() => setShowAllBadges(!showAllBadges)}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-6 rounded-md transition-colors font-medium"
              >
                {showAllBadges ? 'Show Less' : `See All (${filteredIncompleteBadges.length})`}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Rewards Dialog/Modal - Image Viewer Style */}
      {selectedTier && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTier(null)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedTier(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Image/Tier Card Display */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 shadow-2xl">
              {/* Tier Title */}
              <h3 className="text-center text-3xl font-bold text-white mb-3">{selectedTier.name}</h3>
              
              {/* Points Required */}
              <p className="text-center text-purple-400 text-lg font-medium mb-8">{selectedTier.pointsRequired} Points Required</p>

              {/* Large Tier Image/Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-64 h-64 bg-gray-700 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden p-4">
                  {selectedTier.image ? (
                    <img 
                      src={selectedTier.image} 
                      alt={`${selectedTier.name} rewards`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Award className={`${selectedTier.image ? 'hidden' : ''} fallback-icon w-32 h-32 text-purple-400`} />
                </div>
              </div>

              {/* Rewards List */}
              <div className="mb-6 bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
                <h4 className="text-white font-semibold mb-3 text-center">Included Rewards</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedTier.rewards.map((reward: string, idx: number) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-200 text-sm font-medium"
                    >
                      {reward}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 font-medium">Your Progress</span>
                  <span className="text-white font-bold text-lg">{selectedTier.currentPoints} / {selectedTier.pointsRequired}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${Math.min((selectedTier.currentPoints / selectedTier.pointsRequired) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-center mt-4">
                  {selectedTier.isUnlocked ? (
                    <span className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-6 py-3 rounded-lg font-bold text-lg">
                      <Check className="w-6 h-6" />
                      <span>Unlocked!</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-2 bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-medium">
                      <Target className="w-5 h-5" />
                      <span>{selectedTier.pointsRequired - selectedTier.currentPoints} points to unlock</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
