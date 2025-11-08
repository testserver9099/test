import { useEffect, useRef } from 'react';
import { useNotification } from './notification-provider';
import { useDashboard } from './dashboard-context';
import { useLeaderboard } from './leaderboard-context';

/**
 * NotificationManager - Automatically triggers notifications based on state changes
 * Place this component inside your App or Dashboard layout
 */
export const NotificationManager = () => {
  const {
    notifyNewBadge,
    notifyMilestone,
    notifySwagTier,
    notifyLeaderboardRank,
  } = useNotification();
  
  const { user, badgeCategories, swagTiers } = useDashboard();
  const { leaderboard } = useLeaderboard();
  
  // Store previous values to detect changes
  const prevTotalBadges = useRef(user.totalBadges);
  const prevPoints = useRef(user.arcadePoints);
  const prevSwagTiers = useRef(swagTiers.filter(t => t.isUnlocked).length);
  const prevRank = useRef(user.leaderboardRank);
  const notifiedBadges = useRef(new Set<string>());
  const notifiedMilestones = useRef(new Set<number>());
  const notifiedTiers = useRef(new Set<string>());

  // Detect new badges and notify
  useEffect(() => {
    if (user.totalBadges > prevTotalBadges.current && prevTotalBadges.current > 0) {
      // Find which category has new badges
      badgeCategories.forEach(category => {
        if (category.completedBadges && category.completedBadges.length > 0) {
          category.completedBadges.forEach(badge => {
            const badgeKey = `${badge.id}-${badge.title}`;
            if (!notifiedBadges.current.has(badgeKey)) {
              notifiedBadges.current.add(badgeKey);
              
              // Only notify if it's a genuinely new badge (after initial load)
              if (prevTotalBadges.current > 0) {
                notifyNewBadge(badge.title, category.name, badge.points);
              }
            }
          });
        }
      });
    }
    prevTotalBadges.current = user.totalBadges;
  }, [user.totalBadges, badgeCategories, notifyNewBadge]);

  // Detect milestone achievements (20, 40, 50, 75, 90 points)
  useEffect(() => {
    const milestones = [20, 40, 50, 65, 75, 90];
    const currentPoints = user.arcadePoints;
    const previousPoints = prevPoints.current;

    milestones.forEach(milestone => {
      if (currentPoints >= milestone && previousPoints < milestone) {
        if (!notifiedMilestones.current.has(milestone)) {
          notifiedMilestones.current.add(milestone);
          
          const milestoneNames: Record<number, string> = {
            25: 'Arcade Novice',
            45: 'Arcade Trooper',
            50: 'Halfway There!',
            65: 'Arcade Ranger',
            75: 'Arcade Champion',
            95: 'Arcade Legend'
          };
          
          notifyMilestone(milestoneNames[milestone] || `${milestone} Points`, currentPoints);
        }
      }
    });

    prevPoints.current = currentPoints;
  }, [user.arcadePoints, notifyMilestone]);

  // Detect new swag tier unlocks
  useEffect(() => {
    const unlockedTiers = swagTiers.filter(tier => tier.isUnlocked);
    
    unlockedTiers.forEach(tier => {
      if (!notifiedTiers.current.has(tier.name) && prevSwagTiers.current > 0) {
        notifiedTiers.current.add(tier.name);
        notifySwagTier(tier.name, tier.rewards);
      }
    });

    prevSwagTiers.current = unlockedTiers.length;
  }, [swagTiers, notifySwagTier]);

  // Detect leaderboard rank changes
  useEffect(() => {
    if (user.leaderboardRank > 0 && prevRank.current > 0 && user.leaderboardRank !== prevRank.current) {
      const change = user.leaderboardRank < prevRank.current ? 'up' : 'down';
      notifyLeaderboardRank(user.leaderboardRank, leaderboard.length, change);
    } else if (user.leaderboardRank > 0 && prevRank.current === 0) {
      // First time getting ranked
      notifyLeaderboardRank(user.leaderboardRank, leaderboard.length, 'same');
    }
    
    prevRank.current = user.leaderboardRank;
  }, [user.leaderboardRank, leaderboard.length, notifyLeaderboardRank]);

  return null; // This component doesn't render anything
};
