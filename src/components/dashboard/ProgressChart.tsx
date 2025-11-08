import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface WeeklyData {
  day: string;
  points: number;
}

interface ProgressChartProps {
  data: WeeklyData[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-purple-400">
            Badges: <span className="text-white">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 rounded-xl p-8 border border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Weekly Progress</h3>
            <p className="text-sm text-gray-400 mt-1">Badges earned in last 7 days</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Last 7 days
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              stroke="#9CA3AF"
              fontSize={14}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={14}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="points"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#8B5CF6', strokeWidth: 2, fill: '#A855F7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-700/50">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">
            {data.reduce((sum, item) => sum + item.points, 0)}
          </div>
          <div className="text-sm text-gray-400">Total badges (7 days)</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {Math.max(...data.map(item => item.points))}
          </div>
          <div className="text-sm text-gray-400">Peak Day</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {(data.reduce((sum, item) => sum + item.points, 0) / data.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-400">Avg per day</div>
        </div>
      </div>
    </motion.div>
  );
}; 