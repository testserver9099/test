import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Star } from 'lucide-react';

interface SwagTier {
  name: string;
  pointsRequired: number;
  currentPoints: number;
  rewards: string[];
  isUnlocked: boolean;
  image?: string;
}

interface SwagTiersProps {
  tiers: SwagTier[];
  currentPoints: number;
}

export const SwagTiers: React.FC<SwagTiersProps> = ({ tiers, currentPoints }) => {
  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Swag Tier Progress</h3>
          <span className="text-xs text-gray-400">Progress is shown as per previous season</span>
        </div>
        
        <div className="space-y-4">
          {tiers.map((tier, index) => {
            const progress = Math.min((currentPoints / tier.pointsRequired) * 100, 100);
            const isCurrentTier = currentPoints >= (index > 0 ? tiers[index - 1].pointsRequired : 0) && 
                                 currentPoints < tier.pointsRequired;
            
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{tier.name}</span>
                  <span className="text-sm text-gray-400">
                    {currentPoints}/{tier.pointsRequired} pts
                  </span>
                </div>
                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className={`h-full rounded-full ${
                      isCurrentTier 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
                        : 'bg-purple-600'
                    }`}
                  />
                  {isCurrentTier && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Rewards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50"
      >
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Arcade Swags Tier</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                tier.isUnlocked
                  ? 'bg-purple-900/30 border-purple-500/50'
                  : 'bg-gray-800/50 border-gray-600/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white text-sm">{tier.name}</h4>
                <Star className={`w-4 h-4 ${tier.isUnlocked ? 'text-yellow-400' : 'text-gray-500'}`} />
              </div>
              
              <p className="text-xs text-gray-400 mb-3">
                {tier.pointsRequired} Points Required
              </p>
              
              {/* Prize Image */}
              {tier.image ? (
                <div className="w-full h-32 bg-gray-700/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  <img 
                    src={tier.image} 
                    alt={`${tier.name} rewards`}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden flex flex-wrap gap-1 p-2">
                    {tier.rewards.map((reward, rewardIndex) => (
                      <div
                        key={rewardIndex}
                        className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center"
                        title={reward}
                      >
                        <span className="text-xs text-gray-400">🎁</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tier.rewards.map((reward, rewardIndex) => (
                    <div
                      key={rewardIndex}
                      className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center"
                      title={reward}
                    >
                      <span className="text-xs text-gray-400">🎁</span>
                    </div>
                  ))}
                </div>
              )}
              
              <button className="w-full py-2 px-3 text-xs font-medium rounded border border-purple-500/50 text-purple-300 hover:bg-purple-500/20 transition-colors">
                View Rewards
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}; 