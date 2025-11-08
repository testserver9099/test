import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconChartBar,
  IconBadge,
  IconDeviceAnalytics,
  IconBell,
  IconLayoutDashboard,
  IconTrophy
} from '@tabler/icons-react';

interface FeatureCardProps {
  index: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ index, icon, title, description }: FeatureCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="w-full"
    >
      <Card className="google-card h-full">
        <CardHeader className="pb-2">
          <div className="rounded-full w-12 h-12 flex items-center justify-center mb-2"
               style={{
                 background: `hsl(var(--chart-${(index % 5) + 1}) / 0.2)`,
                 color: `hsl(var(--chart-${(index % 5) + 1}))`
               }}>
            {icon}
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: <IconChartBar size={24} />,
      title: "Progress Tracking",
      description: "Automatically calculate your Google Cloud Arcade points based on completed challenges, helping you stay on top of your progress."
    },
    {
      icon: <IconBadge size={24} />,
      title: "Incomplete Badge Tracking",
      description: "Helps you efficiently track incomplete badges and focus on unfinished tasks. Ensuring you never miss a challenge."
    },
    {
      icon: <IconDeviceAnalytics size={24} />,
      title: "Multiple Account Management",
      description: "Allows you to track progress across multiple Google Cloud Arcade accounts, making it easy to switch between profiles."
    },
    {
      icon: <IconBell size={24} />,
      title: "Real-Time Event Updates",
      description: "Keeps you informed with real-time updates about Google Cloud Arcade events, challenges, and announcements."
    },
    {
      icon: <IconLayoutDashboard size={24} />,
      title: "Intuitive Interface",
      description: "Features a user-friendly design that simplifies navigation and enhances the overall experience."
    },
    {
      icon: <IconTrophy size={24} />,
      title: "Leaderboard Competition",
      description: "Motivates you to compete with others and climb the leaderboard to reach the top of your Arcade team goals."
    }
  ];

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Features That Set <span className="text-gradient">ArcadeVerse</span> Apart
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover what makes us your essential companion for Google Cloud Arcade
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              index={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
