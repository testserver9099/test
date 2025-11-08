import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  IconSearch, 
  IconTrophy, 
  IconFilter, 
  IconUsers, 
  IconUserCircle, 
  IconStar, 
  IconFlame,
  IconTrendingUp,
  IconTrendingDown,
  IconSword,
  IconBolt,
  IconChartLine,
  IconActivity,
  IconTarget,
  IconRocket
} from '@tabler/icons-react';
import { useProfile } from '@/lib/profile-context';
import { useLeaderboard } from '@/lib/leaderboard-context';

// Animation variants
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

export function LeaderboardPage() {
  const { selectedProfile } = useProfile();
  const { getLeaderboard, refreshLeaderboard } = useLeaderboard();
  const leaderboard = getLeaderboard();
  const [showBattleMode, setShowBattleMode] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
  const [showLiveActivity, setShowLiveActivity] = useState(true);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const currentUserEntry = leaderboard.find(entry => entry.profileUrl === selectedProfile?.profileUrl);

  // Refresh leaderboard on mount and every 30 seconds
  useEffect(() => {
    refreshLeaderboard();
    const interval = setInterval(() => {
      refreshLeaderboard();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [refreshLeaderboard]);

  // Mock data for unique features
  const userStreak = 7; // Days
  const dailyBadgesEarned = 3;
  const rankMovement = currentUserEntry ? (Math.random() > 0.5 ? '+2' : '-1') : '0';
  const powerScore = currentUserEntry ? Math.round((currentUserEntry.points * 1.2) + (currentUserEntry.badges * 5) + (userStreak * 10)) : 0;
  
  // Live activity feed (mock data)
  const liveActivity = [
    { user: 'Alex M.', action: 'earned Ultimate Badge', time: '2m ago', icon: IconTrophy },
    { user: 'Sarah K.', action: 'reached 50 badges', time: '5m ago', icon: IconStar },
    { user: 'John D.', action: 'climbed to Rank #12', time: '8m ago', icon: IconTrendingUp },
    { user: 'Emma W.', action: 'started a 10-day streak', time: '12m ago', icon: IconFlame },
  ];

  // Rank predictions (mock)
  const predictNextRank = (current: number) => {
    const movement = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    return Math.max(1, current + movement);
  };

  return (
    <div className="space-y-8" ref={ref}>
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <IconTrophy className="text-amber-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Real-time rankings updated automatically when profiles are analyzed
        </p>
      </div>

      {/* Current user's position */}
      {selectedProfile && currentUserEntry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="google-card bg-primary/5 border-primary/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Your Leaderboard Position</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                      {currentUserEntry.rank}
                    </div>
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${selectedProfile.name.replace(/\s/g, '+')}&background=4285F4&color=fff`} alt={selectedProfile.name} />
                      <AvatarFallback>{selectedProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedProfile.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs bg-primary/10">
                        Level {Math.floor(currentUserEntry.points / 100) + 1}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 md:gap-12">
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-sm">Points</span>
                      <span className="text-2xl font-bold text-primary">{currentUserEntry.points}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-sm">Badges</span>
                      <span className="text-2xl font-bold text-google-blue">{currentUserEntry.badges}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-sm">Rank</span>
                      <span className="text-2xl font-bold">#{currentUserEntry.rank}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5 border-t border-primary/10 justify-end">
              <Button size="sm" variant="secondary">View Your Profile</Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {/* Top 3 leaderboard section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <IconTrophy size={20} className="text-google-yellow mr-2" /> Top Performers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((user, index) => (
            <motion.div
              key={user.profileUrl}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="flex flex-col"
            >
              <Card className={`google-card h-full relative overflow-hidden ${
                index === 0 ? 'border-google-yellow/50' :
                index === 1 ? 'border-google-light-blue/50' :
                'border-google-red/50'
              }`}>
                <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rotate-45 ${
                  index === 0 ? 'bg-google-yellow/20' :
                  index === 1 ? 'bg-google-light-blue/20' :
                  'bg-google-red/20'
                }`} />

                <CardHeader className="text-center pb-2 relative z-10">
                  <div className="mx-auto">
                    <div className="relative inline-block">
                      <Avatar className={`h-20 w-20 border-4 ${
                        index === 0 ? 'border-google-yellow' :
                        index === 1 ? 'border-google-light-blue' :
                        'border-google-red'
                      }`}>
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=4285F4&color=fff`} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-2 -right-2 rounded-full w-8 h-8 flex items-center justify-center shadow-md ${
                        index === 0 ? 'bg-google-yellow text-white' :
                        index === 1 ? 'bg-google-light-blue text-white' :
                        'bg-google-red text-white'
                      }`}>
                        {user.rank}st
                      </div>
                    </div>
                  </div>
                  <CardTitle className="mt-3 text-lg">{user.name}</CardTitle>
                </CardHeader>

                <CardContent className="text-center pt-0">
                  <div className="flex justify-center mb-3">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs">Points</span>
                      <span className="text-lg font-bold">{user.points}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {/* Achievements are not part of LeaderboardEntry, using placeholder */}
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        index === 0 ? 'bg-google-yellow/10' :
                        index === 1 ? 'bg-google-light-blue/10' :
                        'bg-google-red/10'
                      }`}
                    >
                      Achiever
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Full leaderboard */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-6">Leaderboard Rankings</h2>

        <Card className="google-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground w-[60px]">Rank</th>
                    <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground w-[50px]">Trend</th>
                    <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">User</th>
                    <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">Momentum</th>
                    <th className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">Badges</th>
                    <th className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">Points</th>
                    <th className="h-10 px-4 text-right text-xs font-medium text-muted-foreground w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => {
                    const rankMovement = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'up' : 'down') : 'same';
                    const momentum = user.badges > 15 ? 'hot' : user.badges > 8 ? 'rising' : 'steady';
                    
                    return (
                    <motion.tr
                      key={user.profileUrl}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate={inView ? "visible" : "hidden"}
                      className={`border-b hover:bg-muted/50 transition-colors ${selectedProfile?.profileUrl === user.profileUrl ? 'bg-primary/5' : ''}`}
                    >
                      <td className="p-4 align-middle font-medium">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/60">
                          {user.rank}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {rankMovement === 'up' && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10">
                            <IconTrendingUp size={14} className="text-green-500" />
                          </div>
                        )}
                        {rankMovement === 'down' && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10">
                            <IconTrendingDown size={14} className="text-red-500" />
                          </div>
                        )}
                        {rankMovement === 'same' && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-500/10">
                            <div className="w-2 h-0.5 bg-gray-500" />
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name.replace(/\s/g, '+')}&background=4285F4&color=fff`} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center">
                              {user.name}
                              {selectedProfile?.profileUrl === user.profileUrl && (
                                <Badge variant="outline" className="ml-2 text-xs bg-primary/10">You</Badge>
                              )}
                            </div>
                            <div className="flex gap-1 mt-1">
                              {Array.from({ length: Math.min(3, Math.floor(user.badges / 5)) }).map((_, i) => (
                                <IconStar key={`star-${user.profileUrl}-${i}`} size={12} className="text-google-yellow" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {momentum === 'hot' && (
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30">
                            <IconFlame size={12} className="mr-1" />
                            On Fire
                          </Badge>
                        )}
                        {momentum === 'rising' && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                            <IconRocket size={12} className="mr-1" />
                            Rising
                          </Badge>
                        )}
                        {momentum === 'steady' && (
                          <Badge variant="outline" className="bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30">
                            Steady
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 align-middle text-right">{user.badges}</td>
                      <td className="p-4 align-middle text-right font-bold">
                        {user.points}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                          View
                        </Button>
                      </td>
                    </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <div className="text-xs text-muted-foreground">
              Showing {leaderboard.length} of {leaderboard.length} users
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                1
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                2
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                3
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
                ...
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {Math.ceil(leaderboard.length / 10)}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
