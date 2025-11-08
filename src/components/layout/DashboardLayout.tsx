import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/lib/profile-context';
import { NotificationManager } from '@/lib/notification-manager';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import {
  IconLayoutDashboard,
  IconTrophy,
  IconBadge,
  IconAward,
  IconSettings,
  IconHelp,
  IconBell,
  IconMenu2,
  IconChevronRight,
  IconUser
} from '@tabler/icons-react';

interface BreadcrumbSegment { name: string; href: string; current?: boolean; }

const dashboardNavItems = [
  { name: 'Overview', icon: <IconLayoutDashboard size={20} />, href: '/dashboard', description: 'Your personal dashboard summary' },
  { name: 'Leaderboard', icon: <IconTrophy size={20} />, href: '/dashboard/leaderboard', description: 'Global and personal rankings' },
  { name: 'Badges', icon: <IconBadge size={20} />, href: '/dashboard/badges', description: 'Your earned and pending badges', badge: '4 new' },
  { name: 'Achievements', icon: <IconAward size={20} />, href: '/dashboard/achievements', description: 'Your progress milestones' },
  { name: 'Resources', icon: <IconHelp size={20} />, href: '/resources', description: 'Learning materials and guides' },
  { name: 'Settings', icon: <IconSettings size={20} />, href: '/dashboard/settings', description: 'Manage your account details' }
];

interface DashboardLayoutProps { children: React.ReactNode; }

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { selectedProfile } = useProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbSegment[]>([]);

  const currentPage = dashboardNavItems.find(item =>
    location.pathname === item.href ||
    (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
  );

  useEffect(() => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems: BreadcrumbSegment[] = [{ name: 'Home', href: '/' }];
    if (paths.length > 0) {
      let currentPath = '';
      paths.forEach((path, index) => {
        currentPath += `/${path}`;
        const navItem = dashboardNavItems.find(item => item.href === currentPath);
        const name = navItem ? navItem.name : path.charAt(0).toUpperCase() + path.slice(1);
        breadcrumbItems.push({ name, href: currentPath, current: index === paths.length - 1 });
      });
    }
    setBreadcrumbs(breadcrumbItems);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NotificationManager />
      <Header />
      <main className="flex-1 bg-background text-foreground">
          <div className="h-full bg-background text-foreground">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {children}
            </motion.div>
          </div>
      </main>
    </div>
  );
}
