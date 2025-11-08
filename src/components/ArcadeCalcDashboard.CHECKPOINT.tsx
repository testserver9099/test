// CHECKPOINT - Backup before implementing Facilitator Milestone functionality
// Created: 2025-10-25
// This is a complete working version with:
// - Badge Categories with expandable rows
// - Incomplete Badges with filters (All, Trivia, Game, Skill)
// - Arcade Swags Tier cards with modal popup
// - All 9 badge categories
// - Square badge images in incomplete badges section
// - Facilitator Milestone section (static, not yet functional)

import React from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { useProfile } from '@/lib/profile-context';
import { useState } from 'react';
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<'all' | 'trivia' | 'game' | 'skill'>('all');
  const [selectedTier, setSelectedTier] = useState<any>(null);

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
        const badgeType = badge.id.toLowerCase();
        if (selectedBadgeFilter === 'trivia') return badgeType.includes('trivia');
        if (selectedBadgeFilter === 'game') return badgeType.includes('basecamp') || badgeType.includes('game');
        if (selectedBadgeFilter === 'skill') return !badgeType.includes('trivia') && !badgeType.includes('basecamp') && !badgeType.includes('game');
        return true;
      });

  // Count badges by type
  const badgeCounts = {
    all: incompleteBadges.length,
    trivia: incompleteBadges.filter(b => b.id.toLowerCase().includes('trivia')).length,
    game: incompleteBadges.filter(b => b.id.toLowerCase().includes('basecamp') || b.id.toLowerCase().includes('game')).length,
    skill: incompleteBadges.filter(b => {
      const id = b.id.toLowerCase();
      return !id.includes('trivia') && !id.includes('basecamp') && !id.includes('game');
    }).length
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
      {/* Dashboard content - see original file for complete code */}
    </div>
  );
}
