import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star } from 'lucide-react';
import { useLeaderboard } from '@/lib/leaderboard-context';
import { useEffect, useState } from 'react';

export function TopPerformersSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  const navigate = useNavigate();
  const { getLeaderboard, refreshLeaderboard } = useLeaderboard();
  const [topPerformers, setTopPerformers] = useState<any[]>([]);

  useEffect(() => {
    // Refresh leaderboard data when component mounts
    refreshLeaderboard();
    
    // Set up periodic refresh every 30 seconds to keep top performers updated
    const intervalId = setInterval(() => {
      refreshLeaderboard();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [refreshLeaderboard]);

  useEffect(() => {
    const leaderboard = getLeaderboard();
    // Get top 3 performers
    const top3 = leaderboard.slice(0, 3).map((entry, index) => {
      // Extract initials from name
      const nameParts = entry.name.split(' ');
      const initials = nameParts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
      
      // Try to extract profile image from profileUrl if it's a Google Skills profile
      let avatarUrl = '';
      if (entry.profileUrl?.includes('skills.google')) {
        const profileId = entry.profileUrl.split('/').pop();
        avatarUrl = `https://ext.same-assets.com/1544848213/${profileId}.png`;
      }

      return {
        id: index + 1,
        name: entry.name,
        points: entry.points,
        avatarUrl: avatarUrl,
        initials: initials,
        badges: entry.badges,
        profileUrl: entry.profileUrl
      };
    });
    setTopPerformers(top3);
  }, [getLeaderboard]);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-900 dark:text-amber-300">Top Performers</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our Top <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Champions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Meet the champions who are leading the way in Google Cloud Arcade
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mb-16">
          {topPerformers.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Be the first to join the leaderboard!
              </p>
            </div>
          ) : (
            topPerformers.map((performer, index) => (
              <motion.div
                key={performer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all"
              >
              {/* Rank Badge */}
              <div
                className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-lg z-10"
                style={{
                  background: index === 0 
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)' 
                    : index === 1 
                    ? 'linear-gradient(135deg, #C0C0C0, #808080)'
                    : 'linear-gradient(135deg, #CD7F32, #8B4513)',
                }}
              >
                #{index + 1}
              </div>

              <div className="flex flex-col items-center pt-6">
                {/* Avatar with Progress Ring */}
                <div className="relative mb-4">
                  <svg className="absolute inset-0 w-28 h-28 -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="52"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="52"
                      stroke={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(performer.points / 100) * 326.73} 326.73`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <Avatar className="h-24 w-24 m-2 border-4 border-white dark:border-gray-800 shadow-lg">
                    <AvatarImage src={performer.avatarUrl} alt={performer.name} />
                    <AvatarFallback className="text-2xl font-bold">{performer.initials}</AvatarFallback>
                  </Avatar>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{performer.name}</h3>
                
                {/* Stats - Points only */}
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {performer.points} points
                  </span>
                </div>
              </div>
            </motion.div>
            ))
          )}
        </div>

        <motion.div
          className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-10 rounded-3xl text-center max-w-4xl mx-auto overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
          
          <div className="relative z-10">
            <Trophy className="w-12 h-12 text-amber-300 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4">Want to Join the Champions?</h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Your journey to the top starts with a single challenge. Keep pushing forward, earn badges,
              and watch your rank rise to legendary status!
            </p>
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
              onClick={() => navigate('/dashboard/leaderboard')}
            >
              View Leaderboard & Track Achievements
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
