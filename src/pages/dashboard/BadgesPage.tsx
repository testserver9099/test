import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  IconSearch,
  IconFilter,
  IconCheck,
  IconLock,
  IconClock,
  IconAward,
  IconBadge,
  IconCircleCheck,
  IconStar,
  IconCloudComputing,
  IconDatabase,
  IconDeviceDesktop,
  IconNetwork,
  IconServer,
  IconShield,
  IconCode,
  IconChartArcs,
  IconBrain,
  IconRobot
} from '@tabler/icons-react';

// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + (i * 0.05),
      duration: 0.3,
    },
  }),
};

// Mock data for badges
const badgesData = [
  // Earned badges
  {
    id: 1,
    name: 'Cloud Fundamentals',
    description: 'Mastered the core concepts of cloud computing',
    icon: <IconCloudComputing size={24} />,
    color: 'google-blue',
    status: 'earned',
    earnedDate: '2 months ago',
    points: 50,
    category: 'fundamentals',
    prerequisites: [],
    image: 'https://ext.same-assets.com/1544848213/3064407219.svg'
  },
  {
    id: 2,
    name: 'Database Master',
    description: 'Demonstrated expertise in cloud database services',
    icon: <IconDatabase size={24} />,
    color: 'google-green',
    status: 'earned',
    earnedDate: '1 month ago',
    points: 75,
    category: 'data',
    prerequisites: ['Cloud Fundamentals'],
    image: 'https://ext.same-assets.com/1544848213/4041350344.svg'
  },
  {
    id: 3,
    name: 'VM Virtuoso',
    description: 'Successfully deployed and managed virtual machines',
    icon: <IconServer size={24} />,
    color: 'google-yellow',
    status: 'earned',
    earnedDate: '3 weeks ago',
    points: 60,
    category: 'compute',
    prerequisites: ['Cloud Fundamentals'],
    image: 'https://ext.same-assets.com/1544848213/3622498304.svg'
  },
  {
    id: 4,
    name: 'Networking Ninja',
    description: 'Mastered cloud networking concepts and implementation',
    icon: <IconNetwork size={24} />,
    color: 'google-red',
    status: 'earned',
    earnedDate: '2 weeks ago',
    points: 80,
    category: 'networking',
    prerequisites: ['Cloud Fundamentals', 'VM Virtuoso'],
    image: 'https://ext.same-assets.com/1544848213/1953219394.svg'
  },

  // In progress badges
  {
    id: 5,
    name: 'Security Specialist',
    description: 'Implement advanced security practices in cloud environments',
    icon: <IconShield size={24} />,
    color: 'google-blue',
    status: 'in-progress',
    progress: 75,
    totalTasks: 8,
    completedTasks: 6,
    points: 100,
    category: 'security',
    prerequisites: ['Cloud Fundamentals', 'Networking Ninja'],
    image: 'https://ext.same-assets.com/1544848213/1977889334.svg'
  },
  {
    id: 6,
    name: 'Kubernetes Expert',
    description: 'Deploy and manage containerized applications with Kubernetes',
    icon: <IconChartArcs size={24} />,
    color: 'google-blue',
    status: 'in-progress',
    progress: 50,
    totalTasks: 10,
    completedTasks: 5,
    points: 120,
    category: 'container',
    prerequisites: ['VM Virtuoso'],
    image: 'https://ext.same-assets.com/1544848213/1063879004.svg'
  },
  {
    id: 7,
    name: 'Serverless Architect',
    description: 'Design and implement serverless applications',
    icon: <IconCode size={24} />,
    color: 'google-green',
    status: 'in-progress',
    progress: 30,
    totalTasks: 6,
    completedTasks: 2,
    points: 90,
    category: 'compute',
    prerequisites: ['Cloud Fundamentals'],
    image: 'https://ext.same-assets.com/1544848213/3370456159.svg'
  },

  // Locked badges
  {
    id: 8,
    name: 'ML Engineer',
    description: 'Build and deploy machine learning models in the cloud',
    icon: <IconBrain size={24} />,
    color: 'google-yellow',
    status: 'locked',
    points: 150,
    category: 'ml',
    prerequisites: ['Database Master'],
    image: 'https://ext.same-assets.com/1544848213/1622334034.svg'
  },
  {
    id: 9,
    name: 'Big Data Specialist',
    description: 'Process and analyze large datasets with cloud tools',
    icon: <IconDeviceDesktop size={24} />,
    color: 'google-red',
    status: 'locked',
    points: 130,
    category: 'data',
    prerequisites: ['Database Master'],
    image: 'https://ext.same-assets.com/1544848213/1329875209.svg'
  },
  {
    id: 10,
    name: 'AI Pioneer',
    description: 'Implement artificial intelligence solutions in the cloud',
    icon: <IconRobot size={24} />,
    color: 'google-blue',
    status: 'locked',
    points: 200,
    category: 'ml',
    prerequisites: ['ML Engineer'],
    image: 'https://ext.same-assets.com/1544848213/2923562584.svg'
  }
];

export function BadgesPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Filter badges based on activeFilter and searchQuery
  const filteredBadges = badgesData.filter(badge => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'earned' && badge.status === 'earned') ||
      (activeFilter === 'in-progress' && badge.status === 'in-progress') ||
      (activeFilter === 'locked' && badge.status === 'locked') ||
      (activeFilter === badge.category);

    const matchesSearch =
      searchQuery === '' ||
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Stats for badge counts
  const earnedCount = badgesData.filter(badge => badge.status === 'earned').length;
  const inProgressCount = badgesData.filter(badge => badge.status === 'in-progress').length;
  const lockedCount = badgesData.filter(badge => badge.status === 'locked').length;
  const totalPoints = badgesData
    .filter(badge => badge.status === 'earned')
    .reduce((sum, badge) => sum + badge.points, 0);

  return (
    <div className="space-y-8" ref={ref}>
      {/* Stats cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="google-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <IconCircleCheck size={18} className="mr-2 text-google-green" />
              Earned Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{earnedCount}</div>
            <p className="text-sm text-muted-foreground">out of {badgesData.length} total badges</p>
          </CardContent>
        </Card>

        <Card className="google-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <IconClock size={18} className="mr-2 text-google-yellow" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProgressCount}</div>
            <p className="text-sm text-muted-foreground">badges currently being worked on</p>
          </CardContent>
        </Card>

        <Card className="google-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <IconLock size={18} className="mr-2 text-google-red" />
              Locked Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lockedCount}</div>
            <p className="text-sm text-muted-foreground">unlock by completing prerequisites</p>
          </CardContent>
        </Card>

        <Card className="google-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <IconStar size={18} className="mr-2 text-google-blue" />
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPoints}</div>
            <p className="text-sm text-muted-foreground">earned from completed badges</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="h-9"
            onClick={() => setActiveFilter('all')}
          >
            All Badges
          </Button>
          <Button
            variant={activeFilter === 'earned' ? 'default' : 'outline'}
            size="sm"
            className="h-9"
            onClick={() => setActiveFilter('earned')}
          >
            <IconCheck size={16} className="mr-1.5" />
            Earned
          </Button>
          <Button
            variant={activeFilter === 'in-progress' ? 'default' : 'outline'}
            size="sm"
            className="h-9"
            onClick={() => setActiveFilter('in-progress')}
          >
            <IconClock size={16} className="mr-1.5" />
            In Progress
          </Button>
          <Button
            variant={activeFilter === 'locked' ? 'default' : 'outline'}
            size="sm"
            className="h-9"
            onClick={() => setActiveFilter('locked')}
          >
            <IconLock size={16} className="mr-1.5" />
            Locked
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search badges..."
              className="pl-9 h-9 rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === 'fundamentals' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActiveFilter('fundamentals')}
        >
          Fundamentals
        </Button>
        <Button
          variant={activeFilter === 'compute' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActiveFilter('compute')}
        >
          Compute
        </Button>
        <Button
          variant={activeFilter === 'data' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActiveFilter('data')}
        >
          Data
        </Button>
        <Button
          variant={activeFilter === 'networking' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActiveFilter('networking')}
        >
          Networking
        </Button>
        <Button
          variant={activeFilter === 'security' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActiveFilter('security')}
        >
          Security
        </Button>
        <Button
          variant={activeFilter === 'container' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActiveFilter('container')}
        >
          Containers
        </Button>
        <Button
          variant={activeFilter === 'ml' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => setActiveFilter('ml')}
        >
          ML/AI
        </Button>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.length > 0 ? (
          filteredBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              <Card className={`h-full google-card relative overflow-hidden ${
                badge.status === 'locked' ? 'opacity-80' : ''
              }`}>
                {/* Badge status indicator */}
                <div className="absolute top-4 right-4 z-10">
                  {badge.status === 'earned' && (
                    <div className="bg-google-green text-white text-xs py-1 px-2 rounded-full flex items-center">
                      <IconCheck size={12} className="mr-1" />
                      Earned
                    </div>
                  )}
                  {badge.status === 'in-progress' && (
                    <div className="bg-google-yellow text-white text-xs py-1 px-2 rounded-full flex items-center">
                      <IconClock size={12} className="mr-1" />
                      In Progress
                    </div>
                  )}
                  {badge.status === 'locked' && (
                    <div className="bg-muted text-muted-foreground text-xs py-1 px-2 rounded-full flex items-center">
                      <IconLock size={12} className="mr-1" />
                      Locked
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col items-center text-center">
                  {/* Badge image */}
                  <div className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center ${
                    badge.status === 'locked' ? 'grayscale' : ''
                  }`}>
                    <img
                      src={badge.image}
                      alt={badge.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h3 className="text-xl font-bold mb-1">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{badge.description}</p>

                  {/* Points */}
                  <div className="flex items-center mb-4">
                    <IconStar size={16} className={`mr-1 ${
                      badge.status === 'earned' ? 'text-google-yellow' : 'text-muted-foreground'
                    }`} />
                    <span className="text-sm font-medium">{badge.points} Points</span>
                  </div>

                  {/* Progress bar for in-progress badges */}
                  {badge.status === 'in-progress' && (
                    <div className="w-full mt-2 mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{badge.completedTasks} of {badge.totalTasks} tasks completed</span>
                        <span>{badge.progress}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-google-blue rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${badge.progress}%` }}
                          transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Date earned for earned badges */}
                  {badge.status === 'earned' && (
                    <div className="text-xs text-muted-foreground mt-1 mb-4">
                      Earned {badge.earnedDate}
                    </div>
                  )}

                  {/* Prerequisites for locked badges */}
                  {badge.status === 'locked' && badge.prerequisites.length > 0 && (
                    <div className="mt-2 mb-4">
                      <div className="text-xs text-muted-foreground mb-2">Prerequisites:</div>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {badge.prerequisites.map((prereq) => (
                          <Badge
                            key={prereq}
                            variant="outline"
                            className="text-xs bg-muted/50"
                          >
                            {prereq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action button based on status */}
                  {badge.status === 'earned' && (
                    <Button size="sm" variant="outline" className="mt-auto">
                      View Details
                    </Button>
                  )}
                  {badge.status === 'in-progress' && (
                    <Button size="sm" className="mt-auto bg-google-blue text-white hover:bg-google-blue/90">
                      Continue
                    </Button>
                  )}
                  {badge.status === 'locked' && (
                    <Button size="sm" variant="outline" className="mt-auto" disabled>
                      <IconLock size={14} className="mr-1.5" />
                      Locked
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <IconBadge size={40} className="mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No badges found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your filters or search query to find badges.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
