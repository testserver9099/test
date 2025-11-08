import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useCalculation, CalculationResult as CalcResult } from './calculation-context';
import { determineBadgeType } from './calculationLogic';
import { badgeService } from '@/services/badgeService';

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

interface SwagTier {
  name: string;
  pointsRequired: number;
  currentPoints: number;
  rewards: string[];
  isUnlocked: boolean;
  image?: string;
}

interface BadgeCategory {
  name: string;
  icon: React.ComponentType<any>;
  badges: number;
  points: number;
  color: string;
  completedBadges?: IncompleteBadge[]; // Array of completed badge details
}

interface IncompleteBadge {
  id: string;
  title: string;
  category: string;
  difficulty: 'Introductory' | 'Intermediate' | 'Advanced' | 'Special' | 'Base Camp' | 'Certification' | 'Level 1' | 'Level 2' | 'Level 3' | 'Trivia';
  labsRequired: number;
  points: number;
  image: string;
  level?: string;
  url?: string;
  accessCode?: string;
}

interface WeeklyData {
  day: string;
  points: number;
}

interface DashboardContextType {
  user: User;
  swagTiers: SwagTier[];
  badgeCategories: BadgeCategory[];
  incompleteBadges: IncompleteBadge[];
  weeklyProgress: WeeklyData[];
  lastCalculations: CalcResult[];
  totalPointsThisSeason: number;
  isLoading: boolean;
  refreshData: () => void;
  onStartChallenge: (badgeId: string) => void;
  onCategoryClick: (category: string) => void;
  onViewFullReport: () => void;
  isFacilitator: boolean;
  setIsFacilitator: (isFacilitator: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: React.ReactNode;
}

const getBadgeCategories = (calculationResponse: CalcResult | null, allBadges: IncompleteBadge[]): BadgeCategory[] => {

  const allCategories: BadgeCategory[] = [
    { name: 'Skill Badges', icon: () => null, badges: 0, points: 0, color: 'bg-blue-500', completedBadges: [] },
    { name: 'Base Camp Badges', icon: () => null, badges: 0, points: 0, color: 'bg-purple-500', completedBadges: [] },
    { name: 'Level Badges', icon: () => null, badges: 0, points: 0, color: 'bg-purple-500', completedBadges: [] },
    { name: 'Certification Badges', icon: () => null, badges: 0, points: 0, color: 'bg-purple-500', completedBadges: [] },
    { name: 'Special Badges', icon: () => null, badges: 0, points: 0, color: 'bg-purple-500', completedBadges: [] },
    { name: 'Trivia Badges', icon: () => null, badges: 0, points: 0, color: 'bg-indigo-500', completedBadges: [] },
    { name: 'Lab Free Badges', icon: () => null, badges: 0, points: 0, color: 'bg-orange-500', completedBadges: [] },
    { name: 'Work Meets Play', icon: () => null, badges: 0, points: 0, color: 'bg-yellow-500', completedBadges: [] },
    { name: 'Unknown Badges', icon: () => null, badges: 0, points: 0, color: 'bg-gray-500', completedBadges: [] },
  ];

  if (!calculationResponse) {

    return allCategories;
  }

  // Handle both old and new response formats
  // Old format: { badges: [], points: {} }
  // New format: { user: { badges: [] }, breakdown: {}, summary: {} }
  const badgesArray = (calculationResponse as any).user?.badges || (calculationResponse as any).badges;
  
  if (!badgesArray || badgesArray.length === 0) {

    return allCategories;
  }



  const categoryMap = new Map<string, BadgeCategory>();
  allCategories.forEach(cat => categoryMap.set(cat.name, { ...cat }));

  // Helper months array used for parsing month names and for earnedDate fallback
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  badgesArray.forEach((badge: any, index: number) => {
    // Derive month from earnedDate if available so we can match month-specific badges
    let earnedMonthName: string | undefined = undefined;
    try {
      if (badge.earnedDate) {
        const d = new Date(badge.earnedDate);
        if (!isNaN(d.getTime())) {
          earnedMonthName = months[d.getMonth()];
        }
      }
    } catch (e) {
      // ignore parse errors
    }
    // Use the server's classification instead of re-determining it
    const type = badge.type || 'completion';

    
    let categoryName = '';
    switch (type) {
      case 'skill':
        // Check if this is actually a special badge misclassified as skill
        const lowerBadgeName = badge.name.toLowerCase();

        if (lowerBadgeName.includes('extraskillestrial') || 
            lowerBadgeName.includes('extraskillestrail') ||
            lowerBadgeName.includes('skills scribble') ||
            lowerBadgeName.includes('futureready skills') ||
            lowerBadgeName.includes('arcade futureready') ||
            lowerBadgeName.includes('diwali dialogues') ||
            lowerBadgeName.includes('lights & logic') ||
            lowerBadgeName.includes('lights and logic')) {

          // These are special game badges, handle them separately
          const matchingBadge = allBadges.find(b => {
            if (b.category !== 'Game' || b.difficulty !== 'Special') return false;
            const cleanTitle = b.title.toLowerCase().trim();
            const cleanBadge = lowerBadgeName.trim();

            
            // Check for various patterns
            if (cleanBadge.includes('extraskillestrial') || cleanBadge.includes('extraskillestrail')) {
              return cleanTitle.includes('extraskillestrial') || cleanTitle.includes('extraskillestrail');
            }
            if (cleanBadge.includes('skills scribble')) {
              return cleanTitle.includes('skills scribble');
            }
            if (cleanBadge.includes('futureready') || cleanBadge.includes('future ready')) {
              return cleanTitle.includes('futureready') || cleanTitle.includes('future ready');
            }
            if (cleanBadge.includes('diwali dialogues')) {
              return cleanTitle.includes('diwali dialogues');
            }
            if (cleanBadge.includes('lights & logic') || cleanBadge.includes('lights and logic')) {
              return cleanTitle.includes('lights & logic') || cleanTitle.includes('lights and logic');
            }
            return false;
          });
          
          if (matchingBadge) {
            const specialCategory = categoryMap.get('Special Badges');
            if (specialCategory) {
              specialCategory.badges += 1;
              if (specialCategory.completedBadges) {
                specialCategory.completedBadges.push(matchingBadge);
              }

            }
          } else {

          }
          return; // Skip rest of processing
        }
        categoryName = 'Skill Badges';
        break;
      case 'trivia':
        categoryName = 'Trivia Badges';
        break;
      case 'completion':
        // Check if this is actually a special badge misclassified as completion
        const lowerCompletionName = badge.name.toLowerCase();
        if (lowerCompletionName.includes('extraskillestrial') || 
            lowerCompletionName.includes('extraskillestrail') ||
            lowerCompletionName.includes('skills scribble') ||
            lowerCompletionName.includes('futureready skills') ||
            lowerCompletionName.includes('future ready skills') ||
            lowerCompletionName.includes('diwali dialogues') ||
            lowerCompletionName.includes('lights & logic') ||
            lowerCompletionName.includes('lights and logic')) {

          // These are special game badges, handle them separately
          const matchingBadge = allBadges.find(b => {
            if (b.category !== 'Game' || b.difficulty !== 'Special') return false;
            const cleanTitle = b.title.toLowerCase().trim();

            
            if (lowerCompletionName.includes('extraskillestrial') || lowerCompletionName.includes('extraskillestrail')) {
              return cleanTitle.includes('extraskillestrial') || cleanTitle.includes('extraskillestrail');
            }
            if (lowerCompletionName.includes('skills scribble')) {
              return cleanTitle.includes('skills scribble');
            }
            if (lowerCompletionName.includes('futureready') || lowerCompletionName.includes('future ready')) {
              return cleanTitle.includes('futureready') || cleanTitle.includes('future ready');
            }
            if (lowerCompletionName.includes('diwali dialogues')) {
              return cleanTitle.includes('diwali dialogues');
            }
            if (lowerCompletionName.includes('lights & logic') || lowerCompletionName.includes('lights and logic')) {
              return cleanTitle.includes('lights & logic') || cleanTitle.includes('lights and logic');
            }
            return false;
          });
          
          if (matchingBadge) {
            const specialCategory = categoryMap.get('Special Badges');
            if (specialCategory) {
              specialCategory.badges += 1;
              if (specialCategory.completedBadges) {
                specialCategory.completedBadges.push(matchingBadge);
              }

            }
          } else {

          }
          return; // Skip rest of processing
        }
        categoryName = 'Unknown Badges';
        break;
      case 'game':
        // Game badges need to be categorized based on their name
        // We'll handle them below after matching with allBadges
        categoryName = '';
        break;
      case 'lab-free':
        categoryName = 'Lab Free Badges';
        break;
      default:
        categoryName = 'Unknown Badges';
        break;
    }

    // For game badges, we need to find the matching badge first to determine category
    if (type === 'game') {
      const cleanBadgeName = badge.name.toLowerCase().trim().replace(/^skills boost\s+/i, '');

      
      // Try to match by keywords first (more flexible)
      let matchingBadge = allBadges.find(b => {
        if (b.category !== 'Game') return false;
        const cleanTitle = b.title.toLowerCase().trim();
        
        // Special badge matching - look for specific keywords
        if (b.difficulty === 'Special') {
          // Check for specific special badge patterns
          if (cleanBadgeName.includes('ai assured') && cleanTitle.includes('ai assured')) return true;
          if (cleanBadgeName.includes('scaling success') && cleanTitle.includes('scaling success')) return true;
          if (cleanBadgeName.includes('faster finance') && cleanTitle.includes('faster finance')) return true;
          if (cleanBadgeName.includes('banking with empathy') && cleanTitle.includes('banking with empathy')) return true;
          if (cleanBadgeName.includes('skills scribble') && cleanTitle.includes('skills scribble')) return true;
          if (cleanBadgeName.includes('work meets play') && cleanTitle.includes('work meets play')) return true;
          if ((cleanBadgeName.includes('futureready') || cleanBadgeName.includes('future ready')) && 
              (cleanTitle.includes('futureready') || cleanTitle.includes('future ready'))) return true;
          if (cleanBadgeName.includes('diwali') && cleanTitle.includes('diwali')) return true;
          if ((cleanBadgeName.includes('lights') && cleanBadgeName.includes('logic')) && 
              (cleanTitle.includes('lights') && cleanTitle.includes('logic'))) return true;
        }
        
        // Extract month/year if present
  const badgeMonth = months.find(m => cleanBadgeName.includes(m));
  const titleMonth = months.find(m => cleanTitle.includes(m));
  // If the badge name does not include a month, prefer the earnedDate month (if available)
  const effectiveBadgeMonth = badgeMonth || earnedMonthName;
        
        // Check for Level badges (Level 1, Level 2, Level 3)
        if (cleanBadgeName.includes('level 1') && cleanTitle.includes('level 1')) {
          if (!effectiveBadgeMonth || !titleMonth || effectiveBadgeMonth === titleMonth) {

            return true;
          }
        }
        if (cleanBadgeName.includes('level 2') && cleanTitle.includes('level 2')) {
          if (!effectiveBadgeMonth || !titleMonth || effectiveBadgeMonth === titleMonth) {

            return true;
          }
        }
        if (cleanBadgeName.includes('level 3') && cleanTitle.includes('level 3')) {
          if (!effectiveBadgeMonth || !titleMonth || effectiveBadgeMonth === titleMonth) {

            return true;
          }
        }
        
        // Check for Base Camp
        if (cleanBadgeName.includes('base camp') && cleanTitle.includes('base camp')) {
          if (!effectiveBadgeMonth || !titleMonth || effectiveBadgeMonth === titleMonth) {

            return true;
          }
        }
        
        // Check for Certification Zone
        if (cleanBadgeName.includes('certification') && cleanTitle.includes('certification')) {
          if (!effectiveBadgeMonth || !titleMonth || effectiveBadgeMonth === titleMonth) {

            return true;
          }
        }
        
        // Check for Trivia (weekly)
        if (cleanBadgeName.includes('trivia')) {
          const weekMatch = cleanBadgeName.match(/week\s*(\d)/i);
          const titleWeekMatch = cleanTitle.match(/week\s*(\d)/i);
          if (weekMatch && titleWeekMatch && weekMatch[1] === titleWeekMatch[1]) {
            if (!effectiveBadgeMonth || !titleMonth || effectiveBadgeMonth === titleMonth) {

              return true;
            }
          }
        }
        
        // Fallback: try exact or contains match
        if (cleanTitle === cleanBadgeName || cleanBadgeName.includes(cleanTitle) || cleanTitle.includes(cleanBadgeName)) {

          return true;
        }
        
        return false;
      });
      

      
      if (matchingBadge) {
        // Determine category based on level/difficulty
        if (matchingBadge.level && matchingBadge.level.includes('Level')) {
          categoryName = 'Level Badges';
        } else if (matchingBadge.level && matchingBadge.level.includes('Base Camp')) {
          categoryName = 'Base Camp Badges';
        } else if (matchingBadge.level && matchingBadge.level.includes('Certification')) {
          categoryName = 'Certification Badges';
        } else if (matchingBadge.difficulty === 'Special') {
          categoryName = 'Special Badges';
        }
        
        if (categoryName) {
          const category = categoryMap.get(categoryName);
          if (category) {
            category.badges += 1;
            if (category.completedBadges) {
              category.completedBadges.push(matchingBadge);
            }
          }
        }
      }
      return; // Skip rest of the processing for game badges
    }

    if (!categoryName) return;

    const category = categoryMap.get(categoryName);

    if (category) {
      category.badges += 1;
      
      // Match badges from allBadges and add to completedBadges
      if (categoryName === 'Skill Badges' || categoryName === 'Trivia Badges' || categoryName === 'Lab Free Badges') {
        // Find matching badge from allBadges and add to completedBadges
        // Clean the badge name for better matching
        const cleanBadgeName = badge.name.toLowerCase().trim();
        
        const matchingBadge = allBadges.find(b => {
          // For lab-free, check if category matches
          if (categoryName === 'Lab Free Badges' && b.category !== 'Lab-Free') return false;
          if (categoryName === 'Skill Badges' && b.category !== 'Skill') return false;
          if (categoryName === 'Trivia Badges' && b.category !== 'Trivia') return false;
          
          const cleanTitle = b.title.toLowerCase().trim();
          // Try exact match first
          if (cleanTitle === cleanBadgeName) return true;
          // Try if one contains the other
          if (cleanBadgeName.includes(cleanTitle) || cleanTitle.includes(cleanBadgeName)) return true;
          // Try without common prefixes
          const badgeNameWithoutPrefix = cleanBadgeName.replace(/^(skills boost\s+|skill badge\s+)/i, '');
          if (cleanTitle === badgeNameWithoutPrefix || badgeNameWithoutPrefix.includes(cleanTitle)) return true;
          return false;
        });
        
        if (matchingBadge && category.completedBadges) {
          category.completedBadges.push(matchingBadge);

        } else {

        }
      }
    }
  });

  // Calculate points based on actual badge points values
  // Skill badges: Always 0.5 points each (fixed)
  const skillCategory = categoryMap.get('Skill Badges');
  if (skillCategory) {
    skillCategory.points = skillCategory.badges * 0.5;
  }

  // Game/Trivia badges: Sum up the actual points from completed badges
  const baseCampCategory = categoryMap.get('Base Camp Badges');
  if (baseCampCategory && baseCampCategory.completedBadges) {
    baseCampCategory.points = baseCampCategory.completedBadges.reduce((sum, badge) => sum + (badge.points || 0), 0);
  }

  const levelCategory = categoryMap.get('Level Badges');
  if (levelCategory && levelCategory.completedBadges) {
    levelCategory.points = levelCategory.completedBadges.reduce((sum, badge) => sum + (badge.points || 0), 0);
  }

  const certificationCategory = categoryMap.get('Certification Badges');
  if (certificationCategory && certificationCategory.completedBadges) {
    certificationCategory.points = certificationCategory.completedBadges.reduce((sum, badge) => sum + (badge.points || 0), 0);
  }

  const specialCategory = categoryMap.get('Special Badges');
  if (specialCategory && specialCategory.completedBadges) {
    specialCategory.points = specialCategory.completedBadges.reduce((sum, badge) => sum + (badge.points || 0), 0);
  }

  const triviaCategory = categoryMap.get('Trivia Badges');
  if (triviaCategory && triviaCategory.completedBadges) {
    triviaCategory.points = triviaCategory.completedBadges.reduce((sum, badge) => sum + (badge.points || 0), 0);
  }

  const labFreeCategory = categoryMap.get('Lab Free Badges');
  if (labFreeCategory) {
    labFreeCategory.points = 0; // Add logic if available
  }

  const workMeetsPlayCategory = categoryMap.get('Work Meets Play');
  if (workMeetsPlayCategory) {
    workMeetsPlayCategory.points = 0; // Will show as "NaN" per screenshot
  }

  const unknownCategory = categoryMap.get('Unknown Badges');
  if (unknownCategory) {
    unknownCategory.points = 0; // Will show as "—" per screenshot
  }
  

  return Array.from(categoryMap.values());
  

  return Array.from(categoryMap.values());
};

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const { calculationResult, setCalculationResult, profileUrl } = useCalculation();

  const [isFacilitator, setIsFacilitator] = useState(true); // Default to true (Yes)

  // Don't recalculate - just toggle the display
  const handleSetIsFacilitator = (facilitator: boolean) => {
    setIsFacilitator(facilitator);
  };
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Use ref to store calculation data so it never resets
  const calculationDataRef = useRef<{
    totalPoints: number;
    milestonePoints: number;
    totalBadges: number;
  }>({
    totalPoints: 0,
    milestonePoints: 0,
    totalBadges: 0
  });

  const [user, setUser] = useState<User>({
    name: 'Aniket Yadav',
    avatar: 'A',
    memberSince: '2025',
    league: 'Gold League',
    arcadePoints: 0,
    leaderboardRank: 0,
    totalBadges: 0,
    milestonePoints: 0
  });

  const [swagTiers, setSwagTiers] = useState<SwagTier[]>([
    {
      name: 'Arcade Novice',
      pointsRequired: 25,
      currentPoints: 0,
      rewards: ['Arcade Controller'],
      isUnlocked: false,
      image: '/images/swag/novice.png'
    },
    {
      name: 'Arcade Trooper',
      pointsRequired: 45,
      currentPoints: 0,
      rewards: ['Premium Arcade Controller'],
      isUnlocked: false,
      image: '/images/swag/trooper.png'
    },
    {
      name: 'Arcade Ranger',
      pointsRequired: 65,
      currentPoints: 0,
      rewards: ['Google Cloud Pen', 'Colorful Pen'],
      isUnlocked: false,
      image: '/images/swag/ranger.png'
    },
    {
      name: 'Arcade Champion',
      pointsRequired: 75,
      currentPoints: 0,
      rewards: ['Google Cloud Hoodie', 'Black Pen', 'Colorful Pen', 'USB Cable'],
      isUnlocked: false,
      image: '/images/swag/champion.png'
    },
    {
      name: 'Arcade Legend',
      pointsRequired: 95,
      currentPoints: 0,
      rewards: ['Google Cloud Hoodie', 'Black Pen', 'Colorful Pen', 'USB Cable'],
      isUnlocked: false,
      image: '/images/swag/legend.png'
    }
  ]);
  const [badgeCategories, setBadgeCategories] = useState<BadgeCategory[]>(getBadgeCategories(null, []));

  // Set initial loading to false after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Separate effect for initial data loading
  useEffect(() => {
    if (profileUrl && calculationResult) {
      const totalPoints = calculationResult.summary?.totalPoints || calculationResult.user?.points || 0;
      const milestonePoints = calculationResult.summary?.milestonePoints || 0;
      const totalBadges = calculationResult.user?.badges?.length || 0;
      
      // Store in ref so it never resets
      calculationDataRef.current = {
        totalPoints,
        milestonePoints,
        totalBadges
      };
      
      setUser(prevUser => ({
        ...prevUser,
        name: calculationResult.profileData?.name || prevUser.name,
        memberSince: calculationResult.profileData?.memberSince || prevUser.memberSince,
        avatar: calculationResult.profileData?.name?.charAt(0).toUpperCase() || prevUser.avatar,
        arcadePoints: totalPoints,
        totalBadges: totalBadges,
        milestonePoints: milestonePoints,
      }));

      // Get all available badges (defined below in component)
      setWeeklyProgress(calculateWeeklyProgress(calculationResult as any));
    }
  }, [profileUrl, calculationResult]);

  // Update swag tiers when facilitator toggle changes
  useEffect(() => {
    const { totalPoints, milestonePoints } = calculationDataRef.current;
    
    if (totalPoints > 0) {
      const basePoints = totalPoints - milestonePoints;
      const pointsForTiers = isFacilitator ? totalPoints : basePoints;
      
      setSwagTiers([
        {
          name: 'Arcade Novice',
          pointsRequired: 25,
          currentPoints: pointsForTiers,
          rewards: ['Arcade Controller'],
          isUnlocked: pointsForTiers >= 25,
          image: '/images/swag/novice.png'
        },
        {
          name: 'Arcade Trooper',
          pointsRequired: 45,
          currentPoints: pointsForTiers,
          rewards: ['Premium Arcade Controller'],
          isUnlocked: pointsForTiers >= 45,
          image: '/images/swag/trooper.png'
        },
        {
          name: 'Arcade Ranger',
          pointsRequired: 65,
          currentPoints: pointsForTiers,
          rewards: ['Google Cloud Pen', 'Colorful Pen'],
          isUnlocked: pointsForTiers >= 65,
          image: '/images/swag/ranger.png'
        },
        {
          name: 'Arcade Champion',
          pointsRequired: 75,
          currentPoints: pointsForTiers,
          rewards: ['Google Cloud Hoodie', 'Black Pen', 'Colorful Pen', 'USB Cable'],
          isUnlocked: pointsForTiers >= 75,
          image: '/images/swag/champion.png'
        },
        {
          name: 'Arcade Legend',
          pointsRequired: 95,
          currentPoints: pointsForTiers,
          rewards: ['Google Cloud Hoodie', 'Black Pen', 'Colorful Pen', 'USB Cable'],
          isUnlocked: pointsForTiers >= 95,
          image: '/images/swag/legend.png'
        }
      ]);
      
      // Also update user state to reflect current view
      setUser(prevUser => ({
        ...prevUser,
        arcadePoints: totalPoints,
        milestonePoints: milestonePoints,
        totalBadges: calculationDataRef.current.totalBadges
      }));
    }
  }, [isFacilitator]);

  // Skill badges data from CSV - All available badges
  const allAvailableBadges: IncompleteBadge[] = [
    { id: '1', title: 'Analyze BigQuery Data in Connected Sheets', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 0, image: 'https://cdn.qwiklabs.com/3dEst6RNTZQgSGIi4PTlumTkXxf%2FdmfV%2FBV3rh%2Fx6X4%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/632' },
    { id: '2', title: 'Streaming Analytics into BigQuery', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 2, image: 'https://cdn.qwiklabs.com/y81rBzff%2BCRvWt9hHWXUK4505cPpZZpfcyi9%2FS2srsU%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/752' },
    { id: '3', title: 'Store, Process, and Manage Data on Google Cloud - Console', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 3, image: 'https://cdn.qwiklabs.com/IBk%2B54Lh16e0KAao3UrPB6buPf5tzxOwSPnVPkmE50s%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/658' },
    { id: '4', title: 'Using the Google Cloud Speech API', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/4ofkN4%2BKKacdIrTvLp1ZSAGImsdSAJvyRtXoK4D%2BZSE%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/756' },
    { id: '5', title: 'Analyze Speech and Language with Google APIs', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 8, image: 'https://cdn.qwiklabs.com/9l3ABNdsyhUC0bPIs6Vf1sAGsC4nb7UGe9GuP39%2FwKI%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/634' },
    { id: '6', title: 'Create a Secure Data Lake on Cloud Storage', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/aDrD1KiIU1kDIUQ2GVPJEeFtmOlfG3s527tsqON5GWM%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/704' },
    { id: '7', title: 'Get Started with API Gateway', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 3, image: 'https://cdn.qwiklabs.com/p4abbcLtmsng92YCgnUZjS41b6t6vr%2FcebRrv0wBroE%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/662' },
    { id: '8', title: 'Get Started with Dataplex', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/2tJ1LSxF0ZRz71mWC1oyfMl71xyysS8RcfJThsnrXTM%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/726' },
    { id: '9', title: 'Get Started with Pub/Sub', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 3, image: 'https://cdn.qwiklabs.com/HDQKD%2Btnlq2juEuFJFBBmtJ9JWrHrbVI0v7J8uQp1VA%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/728' },
    { id: '10', title: 'Tag and Discover BigLake Data', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 3, image: 'https://cdn.qwiklabs.com/MfXm3Olm4qpvd7kAaeuCCHA3bDOGBZwB5k5a%2FmAG7Ac%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/753' },
    { id: '11', title: 'Use APIs to Work with Cloud Storage', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/d1mWg2UMiEJvwUnG3vIA%2B6lfBHcIY%2BSa5wZFAFWlRro%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/755' },
    { id: '12', title: 'Integrate BigQuery Data and Google Workspace using Apps Script', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 2, image: 'https://cdn.qwiklabs.com/LgPpZOcvdaVSF6mlyVK2wtUkDcZ0J1Votoh2TdDhIEc%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/737' },
    { id: '13', title: 'Configure Service Accounts and IAM Roles for Google Cloud', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/vFFpJG5%2FzrfiRL0tlhXuKNOsps9N0ItaaX4Omx1oHw8%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/702' },
    { id: '14', title: 'Prepare Data for Looker Dashboards and Reports', category: 'Skill', difficulty: 'Introductory', labsRequired: 5, points: 0, image: 'https://cdn.qwiklabs.com/oQzIxeIv%2F5iBbNR5dcJtoGDClQ6hcrioCnaW8lHxCGQ%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/628' },
    { id: '15', title: 'Create and Manage Cloud Spanner Instances', category: 'Skill', difficulty: 'Introductory', labsRequired: 5, points: 5, image: 'https://cdn.qwiklabs.com/Lwx9nBf13DUavchAbefiCQXovxumLE3Z8hNOuHTHsIk%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/643' },
    { id: '16', title: 'Use Functions, Formulas, and Charts in Google Sheets', category: 'Skill', difficulty: 'Introductory', labsRequired: 6, points: 0, image: 'https://cdn.qwiklabs.com/QvOcCXRFs6%2BvFDa76EDz73BTH%2BWOiC3JCq0TZKiwdcE%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/776' },
    { id: '17', title: 'Create and Manage AlloyDB Instances', category: 'Skill', difficulty: 'Introductory', labsRequired: 6, points: 6, image: 'https://cdn.qwiklabs.com/vd89ENUiXxPUrl9fIMVYVlOwLADbLb4nVTg%2FVN8PVvw%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/642' },
    { id: '18', title: 'Build Real World AI Applications with Gemini and Imagen', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 0, image: 'https://cdn.qwiklabs.com/s%2BgzHsWL6hGBYeWSWPdSZu6mYa7pwCn%2BbEYQ%2FMVOYAA%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/1076' },
    { id: '19', title: 'App Engine: 3 Ways', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/%2Fus%2B9SsjBJvNFaAG9KABofDumpomMuhFAIJrP23UqIE%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/671' },
    { id: '20', title: 'Create a Streaming Data Lake on Cloud Storage', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 3, image: 'https://cdn.qwiklabs.com/%2BmxpiO1TW2GqjnlC2VdxdbcWeJ4k09d2CTlTQP3FfSo%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/705' },
    { id: '21', title: 'Store, Process, and Manage Data on Google Cloud - Command Line', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 3, image: 'https://cdn.qwiklabs.com/gYTg%2BDXGqVzYT%2FzP4Sfmo0uU8DuwFoU0DAWVviCoaYY%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/659' },
    { id: '22', title: 'App Building with AppSheet', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 0, image: 'https://cdn.qwiklabs.com/%2BHiaxttmNQhNTMn9kWXTSJGmqrPW2XD3hPu%2BduzXvxQ%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/635' },
    { id: '23', title: 'Cloud Functions: 3 Ways', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/1nt6qVofyc4V2sOlyDZF85hTF3JIehVPWQkKKcQaaiI%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/696' },
    { id: '24', title: 'Get Started with Cloud Storage', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/kuaGVEw6SmwSZvIEmzgw20IjhRG18j1ZYD40NowhrO4%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/725' },
    { id: '25', title: 'Get Started with Looker', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 0, image: 'https://cdn.qwiklabs.com/ulqjHgtu%2Bk%2B8y8mj14KaWAF2o5m8kUPdFRSkjd0Bh7I%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/647' },
    { id: '26', title: 'The Basics of Google Cloud Compute', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/NF0NyO9bRbljief2SSKZl6cc8Y7kMrCPExD%2FZ6YbS5M%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/754' },
    { id: '27', title: 'Analyze Images with the Cloud Vision API', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 16, image: 'https://cdn.qwiklabs.com/2BDgUKeuXkt2l%2BKNxw3jfHe%2B1zI4XUtjoERdVj3AGFs%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/633' },
    { id: '28', title: 'Analyze Sentiment with Natural Language API', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 16, image: 'https://cdn.qwiklabs.com/JOmYLpYKK1IZvJx%2FtSZh%2B5fTLcpu37J8lMm8v0qQm6Q%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/667' },
    { id: '29', title: 'Cloud Speech API: 3 Ways', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/Kuk%2BNWucV0QlygxvAs33Octfp6RVtr1YqCmf803l1Gs%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/700' },
    { id: '30', title: 'Monitor and Manage Google Cloud Resources', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/amYX1KCwe7tlqkFT3BJXJkE1mZR94DuxbAPOPaUzqeA%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/653' },
    { id: '31', title: 'Get Started with Sensitive Data Protection', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/P7fcBnIGDr7G8JlMY3HBiSKoRsVcJR%2Bt7oU0DLMFhps%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/750' },
    { id: '32', title: 'Secure BigLake Data', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/4IP7mqDtQ4gEwzCEg50kGc8FA%2FFf%2BbY4O3ZO63Yjkos%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/751' },
    { id: '33', title: 'Get Started with Eventarc', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 3, image: 'https://cdn.qwiklabs.com/ETszwT0%2BVG1zyW%2FVLj6nH5mZPBq18Jy1vfyghCq%2BBN8%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/727' },
    { id: '34', title: 'Implement Load Balancing on Compute Engine', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 5, image: 'https://cdn.qwiklabs.com/QlR8VSC38qpQUHJPs6pq2%2F330l9KejU8QDuxYF7cewo%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/648' },
    { id: '35', title: 'Monitoring in Google Cloud', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/s7GqrFeMrvzz%2Bll7n2vKP8bTadKQ5gOvBTkqHTKMcAI%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/747' },
    { id: '36', title: 'Automate Data Capture at Scale with Document AI', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 8, image: 'https://cdn.qwiklabs.com/zINnuEa2Zsi9GZKbcmUT97b8uWQMGp9vRlOUYsdE3jE%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/674' },
    { id: '37', title: 'Develop Serverless Apps with Firebase', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 11, image: 'https://cdn.qwiklabs.com/TxPdjh0YSi66rQsyXacKfuK97yNHtQPky54TIbv9KEY%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/649' },
    { id: '38', title: 'Develop with Apps Script and AppSheet', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 7, image: 'https://cdn.qwiklabs.com/vjyujWQAvAJDCAw%2BFY%2F6AOqEEKNXJ6y7hiBRHadG9IY%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/715' },
    { id: '39', title: 'Networking Fundamentals on Google Cloud', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 4, image: 'https://cdn.qwiklabs.com/%2FX2jwzmWtD0IjbWRpVyW9CH0tjmbSpgY8oDBwdYxN5M%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/748' },
    { id: '40', title: 'Build Google Cloud Infrastructure for Azure Professionals', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 20, image: 'https://cdn.qwiklabs.com/%2Ffg4SqAEG%2FnQVIt2ut06Nh5NxTPBZb3QO7cG175FEhg%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/688' },
    { id: '41', title: 'Engineer Data for Predictive Modeling with BigQuery ML', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 15, image: 'https://cdn.qwiklabs.com/buCzMzxYUhmRRa4hAgfQAo0FNxdIIQexIdHcyuznQj0%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/627' },
    { id: '42', title: 'Deploy Kubernetes Applications on Google Cloud', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 12, image: 'https://cdn.qwiklabs.com/EXyE%2FCxxZ6VQwYc5s0G%2Bpfsa2h5gY1TKPlCWSRiPGxw%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/663' },
    { id: '43', title: 'Explore Generative AI with the Vertex AI Gemini API', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 15, image: 'https://cdn.qwiklabs.com/N2O3xN1Oe8ia77xuOMUq6lozlWCXihUpqe%2Bb2KqHxm8%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/959' },
    { id: '44', title: 'Implement CI/CD Pipelines on Google Cloud', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 20, image: 'https://cdn.qwiklabs.com/8FCeW6Ghxq6YJ%2B%2B0wucn4QzO92YLIkf13qHMHxnyRZo%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/691' },
    { id: '45', title: 'Implement DevOps Workflows in Google Cloud', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 16, image: 'https://cdn.qwiklabs.com/WGq8WpVC%2Bdd52Yv3wqJG%2F7mP%2FrmFFUikWBuUom12Tuo%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/716' },
    { id: '46', title: 'Build Google Cloud Infrastructure for AWS Professionals', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 20, image: 'https://cdn.qwiklabs.com/8w1pVvti1LLNv555uykNY7CBkdROp2O7OIPAdt7K2kM%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/687' },
    { id: '47', title: 'Inspect Rich Documents with Gemini Multimodality and Multimodal RAG', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 20, image: 'https://cdn.qwiklabs.com/DKI5VEayf%2B1ZxD3CJ46PRSttLWwSksW3f0BZfwQIfik%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/981' },
    { id: '48', title: 'Manage Kubernetes in Google Cloud', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 16, image: 'https://cdn.qwiklabs.com/SbaluKNBD8ILVo2svsp%2FjP6afBiti7LzxoSPIye9JPs%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/783' },
    { id: '49', title: 'Prompt Design in Vertex AI', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 0, image: 'https://cdn.qwiklabs.com/s%2FZRePds6xWgygxn10JCzWgR584W9Df2%2BngG2Leq0dI%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/976' },
    { id: '50', title: 'Protect Cloud Traffic with BeyondCorp Enterprise (BCE) Security', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 16, image: 'https://cdn.qwiklabs.com/hGqPtaT%2BsIToNTGGEQj3R%2BdQRkRSA%2BWzlo71ZP2YHBc%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/784' },
    { id: '51', title: 'Build LangChain Applications using Vertex AI', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 20, image: 'https://cdn.qwiklabs.com/Nh2ORGK2cC1wzFv/x34N0sF6NggfUk3kANtFIy4ct1Y=', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/984' },
    { id: '52', title: 'Create and Manage Cloud SQL for PostgreSQL Instances', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 5, image: 'https://cdn.qwiklabs.com/VuW9c3oSDA0JWAwyxysOXQ6EbcUvBhtG2b3nSIhNArA%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/652' },
    { id: '53', title: 'Build a Data Warehouse with BigQuery', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 25, image: 'https://cdn.qwiklabs.com/Fah1omJYpGK0QWlt6On%2FNXijcM0cQwUkp50IvrRpvXI%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/624' },
    { id: '54', title: 'Build a Data Mesh with Dataplex', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 5, image: 'https://cdn.qwiklabs.com/IUGd19ltWmGBltTsy6zNCZ81tYB3NBELNf9%2BW3UPDsw%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/681' },
    { id: '55', title: 'Migrate MySQL data to Cloud SQL using Database Migration Service', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 16, image: 'https://cdn.qwiklabs.com/szTWW02B6wvs24aW4bLPiUCnjikwKZLAFI55zwmXpRw%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/629' },
    { id: '56', title: 'Share Data Using Google Data Cloud', category: 'Skill', difficulty: 'Introductory', labsRequired: 5, points: 9, image: 'https://cdn.qwiklabs.com/H5Nw8iJDyQktGkZLbZBXV%2FwyW9tf2co6Sbpu67lz2dU%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/657' },
    { id: '57', title: 'Monitor and Log with Google Cloud Observability', category: 'Skill', difficulty: 'Introductory', labsRequired: 5, points: 9, image: 'https://cdn.qwiklabs.com/4Rb5x1I0pnY4%2BUPvlBp5ady7UwKnLi7GdZafabxCNcY%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/749' },
    { id: '58', title: 'Perform Predictive Data Analysis in BigQuery', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 23, image: 'https://cdn.qwiklabs.com/J%2Fxk4xpBWdqQT0JEuTiN5h%2F3gpAS%2BliRT64kJBjcJrs%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/656' },
    { id: '59', title: 'Build Infrastructure with Terraform on Google Cloud', category: 'Skill', difficulty: 'Introductory', labsRequired: 5, points: 21, image: 'https://cdn.qwiklabs.com/VHFZrm%2Bx107vRoKqo%2BxPzwhbMoLCNk1EctzHY7SZwhI%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/636' },
    { id: '60', title: 'Build LookML Objects in Looker', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 0, image: 'https://cdn.qwiklabs.com/VSikZWpYgfMlYJ1qs5LZ%2FeIRa%2FjTIlm53clSpT5TJrk%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/639' },
    { id: '61', title: 'Develop Serverless Applications on Cloud Run', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 25, image: 'https://cdn.qwiklabs.com/kFh0tNiUHhgbAFtBWQeTIOCdBx988W3ZYI7Ew2AqALw%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/741' },
    { id: '62', title: 'Build a Website on Google Cloud', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 13, image: 'https://cdn.qwiklabs.com/Rv0QhP4yVyrmO68%2Fe45arpXtdZgM%2BolI2G6JdFN1y0Y%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/638' },
    { id: '63', title: 'Create ML Models with BigQuery ML', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 11, image: 'https://cdn.qwiklabs.com/Wm106BMo1s08lU7N%2BBp7tWioQwpDFr1R60VxPqqF8r0%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/626' },
    { id: '64', title: 'Mitigate Threats and Vulnerabilities with Security Command Center', category: 'Skill', difficulty: 'Introductory', labsRequired: 5, points: 5, image: 'https://cdn.qwiklabs.com/5NWaSWLl43%2B5GwhlDm8SyazP662JNNoxufqGhbDH6Bc%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/759' },
    { id: '65', title: 'Develop GenAI Apps with Gemini and Streamlit', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 20, image: 'https://cdn.qwiklabs.com/HGh8OpsJmf3kRhKbLlDBTvJWkBtWGKItyoVQ7PPGnq4%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/978' },
    { id: '66', title: 'Monitor Environments with Google Cloud Managed Service for Prometheus', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 9, image: 'https://cdn.qwiklabs.com/Opy8Mo%2F0cJ6x8wiZV5GdGmaE0tToSTn66au0LQy0nMM%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/761' },
    { id: '67', title: 'Create and Manage Bigtable Instances', category: 'Skill', difficulty: 'Introductory', labsRequired: 5, points: 5, image: 'https://cdn.qwiklabs.com/%2FybkjqsKqUZkugVMQpcLbbiD8%2BdCkPqu4MvVqYhFgRI%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/650' },
    { id: '68', title: 'Detect Manufacturing Defects using Visual Inspection AI', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 25, image: 'https://cdn.qwiklabs.com/ItJGiLFt%2BWk6R4oqXpf7h78m8%2BXPC3BLBSMKOesct%2Bs%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/644' },
    { id: '69', title: 'Optimize Costs for Google Kubernetes Engine', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 25, image: 'https://cdn.qwiklabs.com/JVjBXaXXv2iu10%2FpaeJt0ed1yluhaplGd7HMYNYyxYM%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/655' },
    { id: '70', title: 'Build and Deploy Machine Learning Solutions on Vertex AI', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 21, image: 'https://cdn.qwiklabs.com/cmZQaQiE8mTwUGicCKBBIt4fbsDubwxcoHK0bjF%2BARc%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/684' },
    { id: '71', title: 'Deploy and Manage Apigee X', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 9, image: 'https://cdn.qwiklabs.com/9%2BfjTCoZD5SSJZOTfWz5WWp07GUbHFzxTiQ2m8zaBjs%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/661' },
    { id: '72', title: 'Set Up an App Dev Environment on Google Cloud', category: 'Skill', difficulty: 'Introductory', labsRequired: 10, points: 7, image: 'https://cdn.qwiklabs.com/FRpM2MMSR7jg%2FFjdC%2F9EmuOkSJ0F7YptWGKe6VD8sjk%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/637' },
    { id: '73', title: 'Derive Insights from BigQuery Data', category: 'Skill', difficulty: 'Introductory', labsRequired: 7, points: 6, image: 'https://cdn.qwiklabs.com/ryTniLyAhIKMMP16FCfNS4BOEOX3PpjWQRnvLf7Q7%2B8%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/623' },
    { id: '74', title: 'Develop and Secure APIs with Apigee X', category: 'Skill', difficulty: 'Intermediate', labsRequired: 6, points: 26, image: 'https://cdn.qwiklabs.com/zrJ3ITt0ixHh8sU0kb7m1ADYGu8dLKaQ1F0DqLb0F3Y%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/714' },
    { id: '75', title: 'Set Up a Google Cloud Network', category: 'Skill', difficulty: 'Introductory', labsRequired: 7, points: 15, image: 'https://cdn.qwiklabs.com/RIYYNU%2BR2ph1OI51G3CNug%2FvziE7K1cVWxX96RWfS%2F4%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/641' },
    { id: '76', title: 'Implement Cloud Security Fundamentals on Google Cloud', category: 'Skill', difficulty: 'Intermediate', labsRequired: 8, points: 19, image: 'https://cdn.qwiklabs.com/QZ3Lm78VShnMTK6G4HeVF1JMJUajwq%2BBmdXaizCd5f0%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/645' },
    { id: '77', title: 'Develop your Google Cloud Network', category: 'Skill', difficulty: 'Intermediate', labsRequired: 6, points: 18, image: 'https://cdn.qwiklabs.com/BAUF8WPVlWaDyWm1EK%2FKHt9EoU8%2BKdHpodHJ%2BCYVIWE%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/625' },
    { id: '78', title: 'Build Custom Processors with Document AI', category: 'Skill', difficulty: 'Intermediate', labsRequired: 6, points: 30, image: 'https://cdn.qwiklabs.com/NQESlhWmxT8fKIOui0bHAgwpu8N82mcA3dUtXpexVjA%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/686' },
    { id: '79', title: 'Cloud Architecture: Design, Implement, and Manage', category: 'Skill', difficulty: 'Intermediate', labsRequired: 6, points: 32, image: 'https://cdn.qwiklabs.com/p4JZAfZDpg8laLP1g5%2B2W84mCvbUaCsQrmAfxR7UIng%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/640' },
    { id: '80', title: 'Build a Secure Google Cloud Network', category: 'Skill', difficulty: 'Introductory', labsRequired: 6, points: 30, image: 'https://cdn.qwiklabs.com/HpKzUnOzAJCt2GEWpsF9N96EDKWXDyqhliQzhdPlEGw%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/654' },
    { id: '81', title: 'Manage Data Models in Looker', category: 'Skill', difficulty: 'Introductory', labsRequired: 6, points: 0, image: 'https://cdn.qwiklabs.com/yLL9ckYq9xPQqACrXiISLOO0pZ93pZ1u89BqXycHtbk%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/651' },
    { id: '82', title: 'Classify Images with TensorFlow on Google Cloud', category: 'Skill', difficulty: 'Intermediate', labsRequired: 6, points: 20, image: 'https://cdn.qwiklabs.com/Nl6YqeQV32kx3Ijt2OWacKzXfiLsorsHsb%2F6EsX9B5I%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/646' },
    { id: '83', title: 'Get Started with Google Workspace Tools', category: 'Skill', difficulty: 'Introductory', labsRequired: 7, points: 0, image: 'https://cdn.qwiklabs.com/dBCW5W%2B3GnYkggMUwTo3NBLf3W1pWwP2hUbzy3%2FCCZ8%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/676' },
    { id: '84', title: 'Use Machine Learning APIs on Google Cloud', category: 'Skill', difficulty: 'Intermediate', labsRequired: 7, points: 31, image: 'https://cdn.qwiklabs.com/G0nUb7y%2FUlLKTnpNQU6fxMCQEyZvGy0w2QrIBkzfXLY%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/630' },
    { id: '85', title: 'Prepare Data for ML APIs on Google Cloud', category: 'Skill', difficulty: 'Intermediate', labsRequired: 10, points: 12, image: 'https://cdn.qwiklabs.com/ZUhhfh33J7x31SmcU8DIAf3ejiLuMPjfTRgjZMBj0xA%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/631' },
    { id: '87', title: 'Discover and Protect Sensitive Data Across Your Ecosystem', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 9, image: 'https://cdn.qwiklabs.com/Ed3pk8ud26JsY5o%2BfBEcRkoS4lHRv7yuUoHa%2FhjypBk%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/1177' },
    { id: '88', title: 'Enhance Gemini Model Capabilities', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 20, image: 'https://cdn.qwiklabs.com/5AjhaIZb8OavEnJyok0lNbX6NVJbxSYvysBsqxIK93c%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/1241' },
    { id: '89', title: 'Protect Cloud Traffic with Chrome Enterprise Premium Security', category: 'Skill', difficulty: 'Introductory', labsRequired: 4, points: 12, image: 'https://cdn.qwiklabs.com/j2b%2F8EPFIubafNJjgIl9J1JsHMO4PKZXdWQDmtdWrgs%3D', level: 'Introductory', url: 'https://www.cloudskillsboost.google/course_templates/784' },
    { id: '90', title: 'Secure Software Delivery', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 21, image: 'https://cdn.qwiklabs.com/VwV2%2BSx9Av1v7wWgUp7zbv6%2FQpk37%2F%2Fvc5WBCuLYmRg%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/1164' },
    { id: '91', title: 'Implement Multimodal Vector Search with BigQuery', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 20, image: 'https://cdn.qwiklabs.com/t0Y8P7PYbBqN%2FKJDMWUslFY8v7DmwZMgvNqaSkrBeu4%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/1232' },
    { id: '92', title: 'Analyze and Reason on Multimodal Data with Gemini', category: 'Skill', difficulty: 'Intermediate', labsRequired: 6, points: 14, image: 'https://cdn.qwiklabs.com/kPUghibTbIdWeBZpOTdaPbih64XPBgS5uAVOE4dhoi8%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/1240' },
    { id: '93', title: 'Privileged Access with IAM', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 5, image: 'https://cdn.qwiklabs.com/wib9VACYDFn34mPZPfxq%2Bdz5xEBBb97hLFB8yQmm9es%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/1337' },
    { id: '94', title: 'Connecting Cloud Networks with NCC', category: 'Skill', difficulty: 'Intermediate', labsRequired: 4, points: 20, image: 'https://cdn.qwiklabs.com/eNCNCHyWo2UP%2FTBizMDG6SttL40jTwdFfHzHzCZYQoM%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/1364' },
    { id: '95', title: 'Designing Network Security in Google Cloud', category: 'Skill', difficulty: 'Intermediate', labsRequired: 5, points: 25, image: 'https://cdn.qwiklabs.com/JTqg3dHcMxJXSOHz7X2hfaRDyiLoEhOTwnz5JtKyJwg%3D', level: 'Intermediate', url: 'https://www.cloudskillsboost.google/course_templates/1412' }
  ];

  // Lab-Free Courses (24 courses)
  const allLabFreeCourses: IncompleteBadge[] = [
    { id: 'lf1', title: 'Digital Transformation with Google Cloud', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/EYJaXVbF7KyRxt7YUfOeTUDM%2F17EXn0HVbgYiJTOywE%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/116' },
    { id: 'lf2', title: 'Exploring Data Transformation with Google Cloud', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/V%2BQ2ynv3UQ%2FEiWm0GUSXx%2Ff0pcfvyRU6ZmLBMrlLN%2B8%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/267' },
    { id: 'lf3', title: 'Modernize Infrastructure and Applications with Google Cloud', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/Ad6mEos31tswa8dQDmD%2FvZjHMNDhQ%2BmRv9n2UB%2FgBLA%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/117' },
    { id: 'lf4', title: 'Scaling with Google Cloud Operations', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/v8AL1tQJYNNUQj9j69SWe2nWtVX43vGx2fqU6%2FpZDAE%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/120' },
    { id: 'lf5', title: 'Innovating with Google Cloud Artificial Intelligence', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/42wLmkxHZ%2B2SzDW6u1Ia%2F0vCFqBj%2Fls58ayBuJlm3iI%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/119' },
    { id: 'lf6', title: 'Trust and Security with Google Cloud', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/hKYzKuumKFXn%2FkB2byuon%2FeMaz8yZ0yp2nWP90AdYQA%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/945' },
    { id: 'lf7', title: 'Gen AI: Beyond the Chatbot', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/JPr1g9uZFq1aypIHVwhz1asCdk8jXmL1xYTiGGTiGwY%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/1268' },
    { id: 'lf8', title: 'Gen AI: Unlock Foundational Concepts', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/HUOT4aYZ%2B43BQKC9%2BZq9qv37LUImtjFz2FK0W7FvG00%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/1265' },
    { id: 'lf9', title: 'Google Drive', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/B4bSenDv%2BGg9z4sXRBqUlOvJEJol3AIptUOCxxaB0qg%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/194' },
    { id: 'lf10', title: 'Google Docs', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/ghdleu8oJKyZfdn6jNbMwnotrKgM3b8JcUTOTigN7jw%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/195' },
    { id: 'lf11', title: 'Google Slides', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/jAWSnQt0Gi1y%2B%2Bcd9WoIy3piB7SHvSieEcGyt3dPmIs%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/197' },
    { id: 'lf12', title: 'Google Meet', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/cjgAgNKlTqtjc5eyyYxx0dEYXTsFYORWfoZR6wo0mWw%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/198' },
    { id: 'lf13', title: 'Google Sheets', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/cRfMCqh0C9dBLpf1GeTGfdqMYgeCBfHUyOVq0ANRovw%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/196' },
    { id: 'lf14', title: 'Google Calendar', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/1zc0xL6ySAIx6K8fNPul9HZsaGnAPKwIaF9LccQpD%2Bw%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/201' },
    { id: 'lf15', title: 'Gen AI: Navigate the Landscape', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/oJC4RKsDNYXMLV4lPpO41JXmzWkIkbcM6%2B%2FwnODTM0o%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/1261' },
    { id: 'lf16', title: 'Gen AI Apps: Transform Your Work', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/4P40H3KHQRyvqtxRtE1FeqMkSxO9v8iJtTVgGdB3y2E%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/1266' },
    { id: 'lf17', title: 'Introduction to Large Language Models', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/licxd8JDS5%2FvJ3%2FcXDcU2Wmyj8Ii8Old17CuG49CW%2BM%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/539' },
    { id: 'lf18', title: 'Responsible AI: Applying AI Principles with Google Cloud', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/vbrFqw4TKTZb%2FjY8z32R81dK8C9JZlN4td3b%2BUb0afM%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/468' },
    { id: 'lf19', title: 'Responsible AI for Digital Leaders with Google Cloud', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/rr6q6TgDjVdYPO3LWoRnwHeYoPfBqvcb9WfQhohPRrw%3D', level: 'Course', url: 'https://www.skills.google/course_templates/1069' },
    { id: 'lf20', title: 'AI Infrastructure: Introduction to AI Hypercomputer', category: 'Lab-Free', difficulty: 'Introductory', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/d0YZkFX7jZ1IsOMikCmlEfN3nAmSlAPaE3l5yjQfiJg%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/1301' },
    { id: 'lf21', title: 'Machine Learning Operations (MLOps) with Vertex AI: Model Evaluation', category: 'Lab-Free', difficulty: 'Intermediate', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/Rw3tUCwM%2FDWqg4nBwx54KAnPOzPoohmUBhiW2bYMRnI%3D', level: 'Course', url: 'https://www.skills.google/course_templates/1080' },
    { id: 'lf22', title: 'Conversational AI on Vertex AI and Dialogflow CX', category: 'Lab-Free', difficulty: 'Intermediate', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/fjdlMJrxQS7Z6zYqLcUUlaEaVijarKcq9ee9V9wo%2FRE%3D', level: 'Course', url: 'https://www.skills.google/course_templates/892' },
    { id: 'lf23', title: 'Building Complex End to End Self-Service Experiences in Dialogflow CX', category: 'Lab-Free', difficulty: 'Intermediate', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/68NSd9YUZrkeUa%2Ft%2B%2FQnXr41PcAH4UCRR7Dbg%2BdA3Jg%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/1103' },
    { id: 'lf24', title: 'Gen AI Agents: Transform Your Organization', category: 'Lab-Free', difficulty: 'Intermediate', labsRequired: 0, points: 0, image: 'https://cdn.qwiklabs.com/JRQZls%2F%2B1eQuEHWmGDdcr7tZyzuw7mYpPa8wqK1vRtM%3D', level: 'Course', url: 'https://www.cloudskillsboost.google/course_templates/1267' }
  ];

  // Trivia and Game badges data
  const allTriviaAndGameBadges: IncompleteBadge[] = [
    // July 2025
    { id: 'g1', title: 'Arcade ExtraSkillesTrail July', category: 'Game', difficulty: 'Special', labsRequired: 0, points: 2, image: 'https://i.ibb.co/fzfdgrd6/Arcade-Game-Coin-speciaity-Jul.png', level: 'Special', url: '#', accessCode: 'TBA' },
    { id: 'g2', title: 'Arcade Banking With Empathy', category: 'Game', difficulty: 'Special', labsRequired: 0, points: 0, image: 'https://i.ibb.co/BKKrNQ1q/Arcade-Game-Work-Meets-Play-Jul.png', level: 'Special', url: '#', accessCode: 'TBA' },
    { id: 'g3', title: 'Arcade Base Camp July', category: 'Game', difficulty: 'Base Camp', labsRequired: 0, points: 1, image: 'https://i.ibb.co/PvrDJDZ4/Arcade-Game-Coin-Base-Camp-Jul.png', level: 'Base Camp', url: '#', accessCode: 'TBA' },
    { id: 'g4', title: 'Arcade Certification Zone July', category: 'Game', difficulty: 'Certification', labsRequired: 0, points: 1, image: 'https://i.ibb.co/Z66jmLvk/Arcade-Game-Coin-cert-Jul.png', level: 'Certification', url: '#', accessCode: 'TBA' },
    { id: 'g5', title: 'Level 1: July 2025', category: 'Game', difficulty: 'Level 1', labsRequired: 0, points: 1, image: 'https://i.ibb.co/m5s090Ns/Arcade-Game-Coin-L1-07-25.png', level: 'Level 1', url: '#', accessCode: 'TBA' },
    { id: 'g6', title: 'Level 2: July 2025', category: 'Game', difficulty: 'Level 2', labsRequired: 0, points: 1, image: 'https://i.ibb.co/1fYrnt0V/Arcade-Game-Coin-L2-07-25.png', level: 'Level 2', url: '#', accessCode: 'TBA' },
    { id: 'g7', title: 'Level 3: July 2025', category: 'Game', difficulty: 'Level 3', labsRequired: 0, points: 1, image: 'https://i.ibb.co/BKqYjc9t/Arcade-Game-Coin-L3-07-25.png', level: 'Level 3', url: '#', accessCode: 'TBA' },
    { id: 't1', title: 'Skills Boost Arcade Trivia July 2025 Week 1', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://i.ibb.co/wNpvPhGX/Arcade-Trivia-Coin-07-25-week-1.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't2', title: 'Skills Boost Arcade Trivia July 2025 Week 2', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://i.ibb.co/5gwcR9DY/Arcade-Trivia-Coin-07-25-week-2.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't3', title: 'Skills Boost Arcade Trivia July 2025 Week 3', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://i.ibb.co/8g3xKt4T/Arcade-Trivia-Coin-07-25-week-3.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't4', title: 'Skills Boost Arcade Trivia July 2025 Week 4', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://i.ibb.co/jZqD4TXC/Arcade-Trivia-Coin-07-25-week-4.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    
    // August 2025
    { id: 'g8', title: 'Arcade FutureReady Skills August', category: 'Game', difficulty: 'Special', labsRequired: 0, points: 2, image: 'https://services.google.com/fh/files/misc/arcade_fr_sb.png', level: 'Special', url: '#', accessCode: 'TBA' },
    { id: 'g9', title: 'Arcade Faster Finance', category: 'Game', difficulty: 'Special', labsRequired: 0, points: 0, image: 'https://services.google.com/fh/files/misc/arcade_ff.png', level: 'Special', url: '#', accessCode: 'TBA' },
    { id: 'g10', title: 'Arcade Base Camp August', category: 'Game', difficulty: 'Base Camp', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_aug_bc.png', level: 'Base Camp', url: '#', accessCode: 'TBA' },
    { id: 'g11', title: 'Arcade Certification Zone August', category: 'Game', difficulty: 'Certification', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_cz.png', level: 'Certification', url: '#', accessCode: 'TBA' },
    { id: 'g12', title: 'Level 1: August 2025', category: 'Game', difficulty: 'Level 1', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_aug_l1.png', level: 'Level 1', url: '#', accessCode: 'TBA' },
    { id: 'g13', title: 'Level 2: August 2025', category: 'Game', difficulty: 'Level 2', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_l2_aug.png', level: 'Level 2', url: '#', accessCode: 'TBA' },
    { id: 'g14', title: 'Level 3: August 2025', category: 'Game', difficulty: 'Level 3', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_l3_aug.png', level: 'Level 3', url: '#', accessCode: 'TBA' },
    { id: 't5', title: 'Skills Boost Arcade Trivia August 2025 Week 1', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/aug_trivia_1.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't6', title: 'Skills Boost Arcade Trivia August 2025 Week 2', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_t2_aug.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't7', title: 'Skills Boost Arcade Trivia August 2025 Week 3', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_t3_aug.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't8', title: 'Skills Boost Arcade Trivia August 2025 Week 4', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_aug_t4.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    
    // September 2025
    { id: 'g15', title: 'Arcade Skills Scribble September', category: 'Game', difficulty: 'Special', labsRequired: 0, points: 2, image: 'https://services.google.com/fh/files/misc/arcade_sep_special.png', level: 'Special', url: '#', accessCode: 'TBA' },
    { id: 'g16', title: 'Arcade Scaling Success', category: 'Game', difficulty: 'Special', labsRequired: 0, points: 0, image: 'https://services.google.com/fh/files/misc/arcade_sep_wmp.png', level: 'Special', url: '#', accessCode: 'TBA' },
    { id: 'g17', title: 'Arcade Base Camp September', category: 'Game', difficulty: 'Base Camp', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_sep_bc.png', level: 'Base Camp', url: '#', accessCode: 'TBA' },
    { id: 'g18', title: 'Arcade Certification Zone September', category: 'Game', difficulty: 'Certification', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_sep_cert.png', level: 'Certification', url: '#', accessCode: 'TBA' },
    { id: 'g19', title: 'Level 1: September 2025', category: 'Game', difficulty: 'Level 1', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_sep_l1.png', level: 'Level 1', url: '#', accessCode: 'TBA' },
    { id: 'g20', title: 'Level 2: September 2025', category: 'Game', difficulty: 'Level 2', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_sep_l2.png', level: 'Level 2', url: '#', accessCode: 'TBA' },
    { id: 'g21', title: 'Level 3: September 2025', category: 'Game', difficulty: 'Level 3', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_se_l3.png', level: 'Level 3', url: '#', accessCode: 'TBA' },
    { id: 't9', title: 'Skills Boost Arcade Trivia September 2025 Week 1', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_sep_t1.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't10', title: 'Skills Boost Arcade Trivia September 2025 Week 2', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_sep_t2.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't11', title: 'Skills Boost Arcade Trivia September 2025 Week 3', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_sep_t3.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't12', title: 'Skills Boost Arcade Trivia September 2025 Week 4', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_sep_t4.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    
    // October 2025
    { id: 't13', title: 'Skills Boost Arcade Trivia October 2025 Week 1', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/t1_oct_25.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't14', title: 'Skills Boost Arcade Trivia October 2025 Week 2', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/t2_oct_25.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't15', title: 'Skills Boost Arcade Trivia October 2025 Week 3', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/t3_oct_25.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 't16', title: 'Skills Boost Arcade Trivia October 2025 Week 4', category: 'Trivia', difficulty: 'Trivia', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/t4_oct_25.png', level: 'Weekly', url: '#', accessCode: 'TBA' },
    { id: 'g22', title: 'Level 1: October 2025', category: 'Game', difficulty: 'Level 1', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/level1_oct_25.png', level: 'Level 1', url: '#', accessCode: 'TBA' },
    { id: 'g23', title: 'Level 2: October 2025', category: 'Game', difficulty: 'Level 2', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/l2_oct_25.png', level: 'Level 2', url: '#', accessCode: 'TBA' },
    { id: 'g24', title: 'Level 3: October 2025', category: 'Game', difficulty: 'Level 3', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/l3_oct_25.png', level: 'Level 3', url: '#', accessCode: 'TBA' },
    { id: 'g25', title: 'Arcade Base Camp October', category: 'Game', difficulty: 'Base Camp', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/basecamp_oct_25.png', level: 'Base Camp', url: '#', accessCode: 'TBA' },
    { id: 'g26', title: 'Arcade Certification Zone October', category: 'Game', difficulty: 'Certification', labsRequired: 0, points: 1, image: 'https://services.google.com/fh/files/misc/arcade_cert_oct.png', level: 'Certification', url: '#', accessCode: 'TBA' },
    { id: 'g27', title: 'Arcade AI Assured.', category: 'Game', difficulty: 'Special', labsRequired: 0, points: 0, image: 'https://services.google.com/fh/files/misc/oct_wmp.png', level: 'Special', url: '#', accessCode: 'TBA' },
    { id: 'g28', title: 'Diwali Dialogues', category: 'Game', difficulty: 'Special', labsRequired: 0, points: 3, image: 'https://cdn.qwiklabs.com/vPvN%2FFuSi7Sp5HWI22KWjJPRyCdCCiVslGZPJgDXZ1I%3D', level: 'Special', url: '#', accessCode: 'TBA' },
    { id: 'g29', title: 'Lights & Logic', category: 'Game', difficulty: 'Special', labsRequired: 0, points: 3, image: 'https://cdn.qwiklabs.com/iApBBnClEGNSpUuFs1f7Mqj9WKgELtgDuVQXsDLywDI%3D', level: 'Special', url: '#', accessCode: 'TBA' }
  ];

  // Combine all available badges (skill + lab-free + trivia + game)
  const allCombinedBadges = [...allAvailableBadges, ...allLabFreeCourses, ...allTriviaAndGameBadges];

  // Update badge categories when calculation result changes
  useEffect(() => {

    if (calculationResult) {



      const categories = getBadgeCategories(calculationResult, allCombinedBadges);

      setBadgeCategories(categories);

      
      // Update weekly progress with actual badge data
      const weeklyData = calculateWeeklyProgress(calculationResult);

      setWeeklyProgress(weeklyData);
    } else {

    }
  }, [calculationResult]);

  // Filter out completed badges from incomplete badges
  const incompleteBadges = React.useMemo(() => {
    if (!calculationResult) return allCombinedBadges;

    // Handle both old and new response formats
    const badgesArray = (calculationResult as any).user?.badges || (calculationResult as any).badges;
    if (!badgesArray || badgesArray.length === 0) return allCombinedBadges;

    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    // Get current month and year
    const now = new Date();
    const currentMonth = months[now.getMonth()];
    const currentYear = now.getFullYear();

    // Build richer completed entries (consume them one-by-one when matching)
    type CompletedEntry = {
      rawName: string;
      earnedMonth?: string;
      type: string;
      levelToken?: string | undefined;
      week?: string | undefined;
    };

    const completedEntries: CompletedEntry[] = badgesArray.map((b: any) => {
      const rawName = (b.name || '').toLowerCase().trim();
      let earnedMonth: string | undefined;
      try {
        if (b.earnedDate) {
          const d = new Date(b.earnedDate);
          if (!isNaN(d.getTime())) earnedMonth = months[d.getMonth()];
        }
      } catch (e) {
        // ignore
      }
      if (!earnedMonth) {
        earnedMonth = months.find(m => rawName.includes(m));
      }

      const levelMatch = rawName.match(/level\s*(1|2|3)/i);
      const levelToken = levelMatch ? `level ${levelMatch[1]}` : undefined;
      const weekMatch = rawName.match(/week\s*(\d+)/i);
      const week = weekMatch ? weekMatch[1] : undefined;

      return {
        rawName,
        earnedMonth,
        type: (b.type || '').toLowerCase(),
        levelToken,
        week
      };
    });

    // Work against a mutable copy so each completed entry consumes at most one matching badge
    const remaining = [...allCombinedBadges];

    completedEntries.forEach(entry => {
      const idx = remaining.findIndex(badge => {
        const badgeTitle = badge.title.toLowerCase().trim();
        const titleMonth = months.find(m => badgeTitle.includes(m));

        // Game badges (levels, base camp, certification, specials)
        if (badge.category === 'Game') {
          // Match Level tokens (Level 1/2/3)
          if (entry.levelToken) {
            if (!badgeTitle.includes(entry.levelToken)) return false;
            if (entry.earnedMonth && titleMonth && entry.earnedMonth !== titleMonth) return false;
            return true;
          }

          // Match weekly trivia by week number
          if (entry.week) {
            const titleWeekMatch = badgeTitle.match(/week\s*(\d+)/i);
            if (titleWeekMatch && titleWeekMatch[1] === entry.week) {
              if (entry.earnedMonth && titleMonth && entry.earnedMonth !== titleMonth) return false;
              return true;
            }
          }

          // Match special game badges by keywords
          const specialKeywords = ['extraskillestrial','extraskillestrail','skills scribble','futureready','future ready','diwali dialogues','lights & logic','lights and logic','banking with empathy','ai assured','faster finance','scaling success','work meets play'];
          for (const kw of specialKeywords) {
            if (entry.rawName.includes(kw) && badgeTitle.includes(kw)) {
              if (entry.earnedMonth && titleMonth && entry.earnedMonth !== titleMonth) return false;
              return true;
            }
          }

          // Fallback: strict contains match with month check
          if (entry.rawName === badgeTitle || entry.rawName.includes(badgeTitle) || badgeTitle.includes(entry.rawName)) {
            if (entry.earnedMonth && titleMonth && entry.earnedMonth !== titleMonth) return false;
            return true;
          }

          return false;
        }

        // Skill / Trivia / Lab-Free badges
        if (badge.category === 'Skill' || badge.category === 'Trivia' || badge.category === 'Lab-Free') {
          const cleanBadgeTitle = badgeTitle;
          if (entry.rawName === cleanBadgeTitle) return true;
          if (entry.rawName.includes(cleanBadgeTitle) || cleanBadgeTitle.includes(entry.rawName)) return true;
          const cleanedCompleted = entry.rawName.replace(/^(skills boost\s+|skill badge\s+|arcade\s+)/gi, '');
          const cleanedBadge = cleanBadgeTitle.replace(/^(skills boost\s+|skill badge\s+|arcade\s+)/gi, '');
          if (cleanedCompleted === cleanedBadge || cleanedCompleted.includes(cleanedBadge) || cleanedBadge.includes(cleanedCompleted)) return true;
        }

        return false;
      });

      if (idx !== -1) {
        // Remove the matched badge so we don't match it again for another completed entry
        remaining.splice(idx, 1);
      } else {
        // Not matched — leave it (we could log for debugging)

      }
    });

    // Filter out expired game badges (those from past months)
    const availableRemaining = remaining.filter(badge => {
      // Only filter game badges and trivia badges (they have time limits)
      if (badge.category === 'Game' || badge.category === 'Trivia') {
        const badgeTitle = badge.title.toLowerCase();
        
        // Extract month and year from badge title
        const badgeMonth = months.find(m => badgeTitle.includes(m));
        const yearMatch = badgeTitle.match(/20\d{2}/);
        const badgeYear = yearMatch ? parseInt(yearMatch[0]) : currentYear;
        
        if (badgeMonth) {
          const badgeMonthIndex = months.indexOf(badgeMonth);
          const currentMonthIndex = months.indexOf(currentMonth);
          
          // If badge is from a past year, it's expired
          if (badgeYear < currentYear) return false;
          
          // If badge is from current year but past month, it's expired
          if (badgeYear === currentYear && badgeMonthIndex < currentMonthIndex) return false;
        }
      }
      
      // Keep all non-game badges and game badges from current/future months
      return true;
    });


    return availableRemaining;
  }, [calculationResult]);


  // Calculate weekly progress from actual badges
  const calculateWeeklyProgress = (calculationResult: CalcResult | null): WeeklyData[] => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Get the last 7 days including today
    const last7Days: WeeklyData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[date.getDay()];
      
      last7Days.push({ day: dayName, points: 0 });
    }
    
    if (!calculationResult || !calculationResult.user || !calculationResult.user.badges) {
      return last7Days;
    }

    // Calculate start date (7 days ago from today at start of day)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    




    // Count badges earned in the last 7 days
    calculationResult.user.badges.forEach((badge: any) => {
      const earnedDate = new Date(badge.earnedDate);
      
      // Check if badge was earned in the last 7 days
      if (earnedDate >= sevenDaysAgo && earnedDate <= today) {
        // Calculate which day index (0-6) this badge belongs to
        const daysDiff = Math.floor((earnedDate.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < 7) {
          last7Days[daysDiff].points += 1;

        }
      }
    });
    

    return last7Days;
  };

  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyData[]>(calculateWeeklyProgress(null));

  // Mock calculation results
  const [lastCalculations] = useState<CalcResult[]>([
    {
      success: true,
      user: {
        points: 9,
        badges: []
      },
      breakdown: {
        skill: { count: 0, points: 2, pointsPerBadge: 0.5 },
        level: { count: 0, points: 3, pointsPerBadge: 1 },
        trivia: { count: 0, points: 4, pointsPerBadge: 1 },
        completion: { count: 0, points: 0, pointsPerBadge: 0 }
      },
      summary: {
        skillBadges: 0,
        levelBadges: 0,
        triviaBadges: 0,
        completionBadges: 0,
        totalPoints: 9
      }
    }
  ]);

  const totalPointsThisSeason = 9;

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const onStartChallenge = (badgeId: string) => {

    // Navigate to challenge or open modal
  };

  const onCategoryClick = (category: string) => {

    // Filter badges by category
  };

  const onViewFullReport = () => {

    // Navigate to full report page
  };



  const value: DashboardContextType = {
    user,
    swagTiers,
    badgeCategories,
    incompleteBadges,
    weeklyProgress,
    lastCalculations,
    totalPointsThisSeason,
    isLoading,
    refreshData,
    onStartChallenge,
    onCategoryClick,
    onViewFullReport,
    isFacilitator,
    setIsFacilitator: handleSetIsFacilitator
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
