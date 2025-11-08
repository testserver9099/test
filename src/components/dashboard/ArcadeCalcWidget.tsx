import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { CalculationResult } from '@/lib/calculationLogic';

interface ArcadeCalcWidgetProps {
  lastCalculations: CalculationResult[];
  totalPointsThisSeason: number;
  onViewFullReport: () => void;
}

export const ArcadeCalcWidget: React.FC<ArcadeCalcWidgetProps> = ({
  lastCalculations,
  totalPointsThisSeason,
  onViewFullReport
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Calculator className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">ArcadeCalc Summary</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>{totalPointsThisSeason} pts this season</span>
        </div>
      </div>

      {/* Last 5 Calculations */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Recent Calculations</h4>
        {lastCalculations.slice(0, 5).map((calc, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {calc.points.total} Points
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(new Date().toISOString())}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">
                {calc.badges.length} badges
              </div>
              <div className="text-xs text-purple-400">
                +{calc.points.total} pts
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {lastCalculations.length}
          </div>
          <div className="text-xs text-gray-400">Total Calculations</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {lastCalculations.reduce((sum, calc) => sum + calc.points.total, 0)}
          </div>
          <div className="text-xs text-gray-400">Total Points Earned</div>
        </div>
      </div>

      {/* View Full Report Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onViewFullReport}
        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
      >
        <span>View Full Report</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}; 