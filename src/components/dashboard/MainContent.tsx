import React from 'react';
import { motion } from 'framer-motion';

interface User {
  name: string;
  avatar: string;
  memberSince: string;
  league: string;
  arcadePoints: number;
  leaderboardRank: number;
  totalBadges: number;
}

interface MainContentProps {
  user: User;
}

// Placeholder components for graph, progress bar, table, and grid
function WeeklyProgressGraph() {
  return (
    <div className="bg-[#23263A] rounded-xl p-6 mb-6">
      <div className="font-semibold text-white mb-2">Weekly Progress</div>
      <div className="h-32 flex items-center justify-center text-gray-400">[Line Chart]</div>
    </div>
  );
}
function SwagTierProgressBar() {
  return (
    <div className="bg-[#23263A] rounded-xl p-6 mb-6">
      <div className="font-semibold text-white mb-2">Swag Tier Progress</div>
      <div className="h-16 flex flex-col gap-2">
        {/* Example stacked progress bar */}
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden flex">
          <div className="bg-purple-500 h-3" style={{ width: '30%' }}></div>
          <div className="bg-purple-400 h-3" style={{ width: '20%' }}></div>
          <div className="bg-purple-300 h-3" style={{ width: '20%' }}></div>
          <div className="bg-purple-200 h-3" style={{ width: '15%' }}></div>
          <div className="bg-purple-100 h-3" style={{ width: '15%' }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Arcade Novice</span>
          <span>Arcade Trooper</span>
          <span>Arcade Ranger</span>
          <span>Arcade Champion</span>
          <span>Arcade Legend</span>
        </div>
      </div>
    </div>
  );
}
function BadgeCategoryTable() {
  return (
    <div className="bg-[#23263A] rounded-xl p-6 mb-6">
      <div className="font-semibold text-white mb-2">Badge Categories</div>
      <table className="w-full text-left text-gray-300">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2">Category</th>
            <th className="py-2">Badges</th>
            <th className="py-2">Points</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Skill Badges</td><td>0</td><td>0</td></tr>
          <tr><td>Base Game Badges</td><td>1</td><td>1</td></tr>
          <tr><td>Level Badges</td><td>1</td><td>1</td></tr>
          <tr><td>Certification Badges</td><td>2</td><td>3</td></tr>
          <tr><td>Special Badges</td><td>0</td><td>0</td></tr>
          <tr><td>Trivia Badges</td><td>4</td><td>4</td></tr>
          <tr><td>Work Meets Play</td><td>0</td><td>Null</td></tr>
          <tr><td>Unknown Badges</td><td>0</td><td>0</td></tr>
        </tbody>
      </table>
      <div className="text-xs text-purple-400 mt-2">Some badges can’t be tracked as only the first 50 users to complete them earn points.</div>
    </div>
  );
}
function IncompleteBadgesGrid() {
  return (
    <div className="bg-[#23263A] rounded-xl p-6">
      <div className="font-semibold text-white mb-2">Incomplete Badges</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#20243A] rounded-lg p-4 flex flex-col gap-2">
            <div className="h-16 w-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center text-gray-400 mb-2">[Icon]</div>
            <div className="font-medium text-white text-center">Badge Title {i+1}</div>
            <div className="text-xs text-gray-400 text-center">Game • 1 Point</div>
            <button className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full font-semibold transition">Start Challenge</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MainContent({ user }: MainContentProps) {
  return (
    <main className="flex-1 flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyProgressGraph />
        <SwagTierProgressBar />
      </div>
      <BadgeCategoryTable />
      <IncompleteBadgesGrid />
    </main>
  );
} 