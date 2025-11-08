import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, Award, Clock } from 'lucide-react';

interface IncompleteBadge {
  id: string;
  title: string;
  category: string;
  difficulty: 'Introductory' | 'Intermediate' | 'Advanced';
  labsRequired: number;
  points: number;
  image: string;
  level?: string;
}

interface IncompleteBadgesProps {
  badges: IncompleteBadge[];
  onStartChallenge: (badgeId: string) => void;
}

export const IncompleteBadges: React.FC<IncompleteBadgesProps> = ({ badges, onStartChallenge }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  const filters = [
    { name: 'All', count: badges.length },
    { name: 'Trivia', count: badges.filter(b => b.category === 'Trivia').length },
    { name: 'Game', count: badges.filter(b => b.category === 'Game').length },
    { name: 'Skill', count: badges.filter(b => b.category === 'Skill').length }
  ];

  const filteredBadges = badges
    .filter(badge => selectedFilter === 'All' || badge.category === selectedFilter)
    .filter(badge => 
      badge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, visibleCount);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Introductory': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Game': return 'bg-purple-500/20 text-purple-400';
      case 'Skill': return 'bg-blue-500/20 text-blue-400';
      case 'Trivia': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Incomplete Badges</h3>
        </div>
        <div className="text-sm text-gray-400">
          {badges.length} badges available
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <motion.button
              key={filter.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFilter(filter.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedFilter === filter.name
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {filter.name} ({filter.count})
            </motion.button>
          ))}
        </div>
        
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 group"
          >
            {/* Badge Header */}
            <div className="flex items-start justify-between mb-3">
              <div className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(badge.category)}`}>
                {badge.category}
              </div>
              {badge.level && (
                <div className="text-xs text-gray-400">{badge.level}</div>
              )}
            </div>

            {/* Badge Image */}
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>

            {/* Badge Title */}
            <h4 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
              {badge.title}
            </h4>

            {/* Badge Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Points:</span>
                <span className="text-purple-400 font-medium">{badge.points} Point{badge.points !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Labs:</span>
                <span className="text-blue-400 font-medium">{badge.labsRequired} Lab{badge.labsRequired !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Difficulty Tag */}
            <div className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(badge.difficulty)} mb-3`}>
              {badge.difficulty}
            </div>

            {/* Start Challenge Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStartChallenge(badge.id)}
              className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <Play className="w-4 h-4" />
              Start Challenge
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredBadges.length && (
        <div className="text-center mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVisibleCount(prev => prev + 12)}
            className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Load More Badges
          </motion.button>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Showing {filteredBadges.length} of {badges.length} badges</span>
          <button className="text-purple-400 hover:text-purple-300 transition-colors">
            View all badges →
          </button>
        </div>
      </div>
    </motion.div>
  );
}; 