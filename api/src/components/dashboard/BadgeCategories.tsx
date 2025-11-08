import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Flag, BookOpen, Diamond, HelpCircle, Briefcase, ExternalLink, X } from 'lucide-react';

interface IncompleteBadge {
  id: string;
  title: string;
  category: string;
  difficulty: 'Introductory' | 'Intermediate' | 'Advanced';
  labsRequired: number;
  points: number;
  image: string;
  level?: string;
  url?: string;
}

interface BadgeCategory {
  name: string;
  icon: React.ComponentType<any>;
  badges: number;
  points: number;
  color: string;
  completedBadges?: IncompleteBadge[];
}

interface BadgeCategoriesProps {
  categories: BadgeCategory[];
  onCategoryClick: (category: string) => void;
}

export const BadgeCategories: React.FC<BadgeCategoriesProps> = ({ categories, onCategoryClick }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | null>(null);

  // Debug: Check what data we're receiving
  React.useEffect(() => {


    categories.forEach(cat => {
      if (cat.completedBadges && cat.completedBadges.length > 0) {


      }
    });
  }, [categories]);

  const filters = ['All', 'Skill', 'Game', 'Trivia', 'Level', 'Special'];

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'Skill Badges': BookOpen,
      'Game Badges': Star,
      'Trivia Badges': HelpCircle,
      'Level Badges': Flag,
      'Certification Badges': Diamond,
      'Special Badges': Diamond,
      'Work Meets Play': Briefcase,
      'Unknown Badges': Award
    };
    return iconMap[categoryName] || Award;
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
          <h3 className="text-lg font-semibold text-white">Badge Categories</h3>
        </div>
        <div className="text-sm text-gray-400">
          Track your progress across different badge types
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filter) => (
          <motion.button
            key={filter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedFilter === filter
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {filter}
          </motion.button>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories
          .filter(category => selectedFilter === 'All' || category.name.includes(selectedFilter))
          .map((category, index) => {
            const IconComponent = getCategoryIcon(category.name);
            
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => {
                  if (category.completedBadges && category.completedBadges.length > 0) {
                    setSelectedCategory(category);
                  } else {
                    onCategoryClick(category.name);
                  }
                }}
                className="p-4 rounded-lg border border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{category.name}</h4>
                      <p className="text-xs text-gray-400">{category.badges} badges</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-400">{category.points}</div>
                    <div className="text-xs text-gray-400">points</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((category.points / 10) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className="h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span>{Math.round((category.points / 10) * 100)}%</span>
                </div>

                {/* Completed Badges Cards */}
                {category.completedBadges && category.completedBadges.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400">Completed Badges</span>
                      <span className="text-xs text-purple-400">{category.completedBadges.length} earned</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.completedBadges.slice(0, 6).map((badge, idx) => (
                        <div 
                          key={idx}
                          className="relative bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 overflow-hidden group"
                        >
                          {/* Level Label */}
                          {badge.level && (
                            <div className="absolute top-2 right-2 z-10">
                              <span className="bg-purple-600/90 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                                {badge.level}
                              </span>
                            </div>
                          )}
                          
                          {/* Completed Checkmark */}
                          <div className="absolute top-2 left-2 z-10">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>

                          {/* Badge Image */}
                          <div className="w-full h-32 bg-white flex items-center justify-center p-3">
                            <img 
                              src={badge.image} 
                              alt={badge.title}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Badge Info */}
                          <div className="p-3">
                            <h3 className="text-xs font-semibold text-white mb-1 line-clamp-2 min-h-[2rem]">
                              {badge.title}
                            </h3>
                            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-2">
                              <span className="px-1.5 py-0.5 bg-gray-700/50 rounded">
                                {badge.difficulty}
                              </span>
                              <span>{badge.labsRequired} {badge.labsRequired === 1 ? 'Lab' : 'Labs'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-purple-400 font-medium">
                                {badge.points > 0 ? `${badge.points / 2} Credits` : '0.5 Credits'}
                              </span>
                              {badge.url && (
                                <a
                                  href={badge.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-green-400 hover:text-green-300 font-medium"
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
                    {category.completedBadges.length > 6 && (
                      <div className="mt-3 text-center">
                        <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                          View all {category.completedBadges.length} completed badges →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {categories.reduce((sum, cat) => sum + cat.badges, 0)} badges this season
          </span>
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all categories →
          </button>
        </div>
      </div>

      {/* Modal for Completed Badges */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCategory(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedCategory.color}`}>
                  {React.createElement(getCategoryIcon(selectedCategory.name), { className: 'w-5 h-5 text-white' })}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCategory.name}</h2>
                  <p className="text-sm text-gray-400">{selectedCategory.completedBadges?.length || 0} completed badges</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body - Scrollable Badge Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCategory.completedBadges?.map((badge) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-green-500 rounded-lg overflow-hidden transition-all duration-200 flex flex-col"
                  >
                    {/* Points Label - Top Left Corner */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-block bg-gray-900/90 text-white text-xs px-2 py-1 rounded font-medium">
                        {badge.points > 0 ? `${badge.points / 2} pts` : '0.5 pts'}
                      </span>
                    </div>

                    {/* Badge Image - Full Width at Top */}
                    <div className="w-full h-48 bg-white flex items-center justify-center overflow-hidden">
                      {badge.image ? (
                        <img src={badge.image} alt={badge.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <Award className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Badge Content */}
                    <div className="p-4 flex flex-col flex-grow">
                      {/* Badge Title */}
                      <h4 className="text-white text-base font-semibold leading-tight mb-3 line-clamp-2 min-h-[3rem]">
                        {badge.title}
                      </h4>

                      {/* Badge Category/Type */}
                      <p className="text-gray-400 text-sm mb-2">
                        {badge.category} • {badge.level || badge.difficulty}
                      </p>

                      {/* Completion Indicator */}
                      <div className="mt-auto pt-3 border-t border-gray-700">
                        <div className="flex items-center justify-center gap-2 text-green-500 text-sm font-medium">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Completed</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {(!selectedCategory.completedBadges || selectedCategory.completedBadges.length === 0) && (
                <div className="text-center py-12 text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No completed badges in this category yet.</p>
                  <p className="text-sm mt-2">Start completing badges to see them here!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}; 
