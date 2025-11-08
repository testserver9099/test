import React from 'react';
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
  ExternalLink
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// Mock data for the dashboard
const weeklyProgressData = [
  { day: 'Mon', value: 1 },
  { day: 'Tue', value: 2 },
  { day: 'Wed', value: 4 },
  { day: 'Thu', value: 1 },
  { day: 'Fri', value: 2 },
  { day: 'Sat', value: 1 },
  { day: 'Sun', value: 0 }
];

const swagTiers = [
  { name: 'Arcade Novice Tier', points: 20, current: 9, image: '👕', completed: false },
  { name: 'Arcade Trooper Tier', points: 50, current: 9, image: '🎒', completed: false },
  { name: 'Arcade Ranger Tier', points: 100, current: 9, image: '🎒', completed: false },
  { name: 'Arcade Champion Tier', points: 200, current: 9, image: '🏆', completed: false },
  { name: 'Arcade Legend Tier', points: 500, current: 9, image: '🎒', completed: false }
];

const badgeCategories = [
  { category: 'Skill Badges', badges: 0, points: 0, icon: '🎯' },
  { category: 'Base Camp Badges', badges: 1, points: 1, icon: '🏕️' },
  { category: 'Level Badges', badges: 2, points: 2, icon: '📊' },
  { category: 'Certification Badges', badges: 4, points: 4, icon: '🏅' },
  { category: 'Special Badges', badges: 1, points: 2, icon: '⭐' },
  { category: 'Trivia Badges', badges: 0, points: 0, icon: '🧠' },
  { category: 'Work Meets Play', badges: 0, points: 'NaN', icon: '🎮' },
  { category: 'Unknown Badges', badges: 0, points: '-', icon: '❓' }
];

const incompleteBadges = [
  { 
    id: '1q-security-10292', 
    title: 'Level 1: Core Infrastructure and Security', 
    points: 1, 
    difficulty: 'Introductory',
    labs: 4,
    image: '🔒'
  },
  { 
    id: '1q-data-10293', 
    title: 'Tag and Discover BigLake Data', 
    points: 0, 
    difficulty: 'Intermediate',
    labs: 5,
    image: '📊'
  },
  { 
    id: '1q-ai-10294', 
    title: 'Build and Deploy Machine Learning Solutions', 
    points: 2, 
    difficulty: 'Advanced',
    labs: 7,
    image: '🤖'
  },
  { 
    id: '1q-compute-10295', 
    title: 'Compute Engine Fundamentals', 
    points: 1, 
    difficulty: 'Introductory',
    labs: 3,
    image: '💻'
  },
  { 
    id: '1q-storage-10296', 
    title: 'Cloud Storage Best Practices', 
    points: 1, 
    difficulty: 'Intermediate',
    labs: 4,
    image: '💾'
  },
  { 
    id: '1q-networking-10297', 
    title: 'VPC and Network Security', 
    points: 0, 
    difficulty: 'Advanced',
    labs: 6,
    image: '🌐'
  }
];

export default function StandaloneDashboard() {
  return (
    <div className="w-screen h-screen overflow-auto bg-gradient-to-b from-[#0f111a] to-[#1b1e2a] text-white">
      {/* Header Navbar */}
      <header className="sticky top-0 z-50 bg-[#0f111a] border-b border-gray-800 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <span className="text-xl font-bold">ArcadeCalc</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-white font-medium">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </a>
              <a href="#" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <BookOpen className="w-4 h-4" />
                <span>Resources</span>
              </a>
            </nav>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-80 bg-[#1a1c27] min-h-[calc(100vh-4rem)] p-6">
          {/* User Card */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Aniket Yadav</h2>
                <p className="text-purple-100 text-sm">Member since 2025</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">Gold League</span>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold text-white">Profile Stats</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Arcade Points</span>
                <span className="text-white font-medium">9</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Leaderboard</span>
                <span className="text-white font-medium">7050</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Total Badges</span>
                <span className="text-white font-medium">8</span>
              </div>
            </div>
          </div>

          {/* Arcade Swags Tier */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold text-white">Arcade Swags Tier</h3>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {swagTiers.map((tier, index) => (
                <div key={index} className="bg-[#1a1c27] border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white text-sm font-medium">{tier.name}</h4>
                    <span className="text-gray-400 text-xs">{tier.points} Points Required</span>
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">{tier.image}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((tier.current / tier.points) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-gray-400 text-xs mt-1">{tier.current}/{tier.points} pts.</p>
                    </div>
                  </div>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded-md transition-colors">
                    View Rewards
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Progress Graph */}
            <div className="bg-[#1a1c27] rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <h3 className="text-lg font-semibold text-white">Weekly Progress</h3>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#9ca3af"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      fontSize={12}
                      domain={[0, 4]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#c084fc" 
                      strokeWidth={3}
                      dot={{ fill: '#c084fc', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Swags Tier Progress */}
            <div className="bg-[#1a1c27] rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-white">Swags Tier Progress</h3>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm mb-6">Progress is shown as per previous season.</p>
              <div className="space-y-4">
                {swagTiers.map((tier, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      tier.completed ? 'bg-purple-500' : 'border-2 border-gray-600'
                    }`}>
                      {tier.completed && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm">{tier.name}</span>
                        <span className="text-gray-400 text-xs">{tier.current}/{tier.points} pts.</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((tier.current / tier.points) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badge Categories Table */}
          <div className="bg-[#1a1c27] rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Badge Categories</h3>
                <p className="text-gray-400 text-sm">Track your progress across different badge types</p>
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4 rounded-md transition-colors">
                8 badges this season
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400 text-sm font-medium">Category</th>
                    <th className="text-left py-3 text-gray-400 text-sm font-medium">Badges</th>
                    <th className="text-left py-3 text-gray-400 text-sm font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {badgeCategories.map((category, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 flex items-center space-x-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-white text-sm">{category.category}</span>
                      </td>
                      <td className="py-4 text-white text-sm">{category.badges}</td>
                      <td className="py-4 flex items-center space-x-2">
                        <span className="text-white text-sm">{category.points}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 text-sm">
                Some badges can't be tracked as only the first 50 users to complete them earn points. 
                <a href="#" className="text-purple-400 hover:text-purple-300 ml-1">
                  View the list of those badges here →
                </a>
              </p>
            </div>
          </div>

          {/* Incomplete Badges Section */}
          <div className="bg-[#1a1c27] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Incomplete Badges</h3>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <button className="bg-purple-600 text-white text-sm py-1 px-3 rounded-md">All 93</button>
                  <button className="text-gray-400 hover:text-white text-sm py-1 px-3 rounded-md">Trivia 0</button>
                  <button className="text-gray-400 hover:text-white text-sm py-1 px-3 rounded-md">Game 3</button>
                  <button className="text-gray-400 hover:text-white text-sm py-1 px-3 rounded-md">Skill 90</button>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search badges..." 
                    className="bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {incompleteBadges.map((badge, index) => (
                <div key={index} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500 rounded-lg p-4 transition-all duration-200 hover:shadow-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">{badge.image}</div>
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium mb-1">{badge.title}</h4>
                      <p className="text-gray-400 text-xs">{badge.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-purple-400 text-sm font-medium">{badge.points} Points</span>
                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                      {badge.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Beaker className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-xs">{badge.labs} Labs</span>
                  </div>
                  
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-3 rounded-md transition-colors flex items-center justify-center space-x-2">
                    <span>Start Challenge</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-6 rounded-md transition-colors">
                See All (93)
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f111a] border-t border-gray-800 mt-12">
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Left Section */}
            <div>
              <h4 className="text-lg font-bold text-white mb-3">ArcadeCalc</h4>
              <p className="text-gray-400 text-sm mb-4">
                Your ultimate companion for Google Cloud Arcade. Track progress, manage badges, and compete globally with our intuitive platform.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  📷
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  💼
                </a>
              </div>
            </div>

            {/* Middle Section */}
            <div>
              <h5 className="text-white font-semibold mb-3">Quick Links</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Dashboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Leaderboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Resources</a></li>
              </ul>
            </div>

            {/* Right Section */}
            <div>
              <h5 className="text-white font-semibold mb-3">Community</h5>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Telegram Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Google Cloud Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Official Arcade</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 ArcadeCalc. All rights reserved. Last Updated: 23 July 2025 at 12:36:06 pm
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Made with ❤️ by Deepanshu Prajapati
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
