import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { NotificationPanel } from '@/components/NotificationPanel';
import { cn } from '@/lib/utils';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { useTheme } from '@/lib/theme-provider';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Leaderboard', href: '/dashboard/leaderboard' },
  { name: 'Resources', href: '/resources' },
  { name: 'Support', href: '/support' },
];

export function Header() {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <motion.header
        className="sticky top-0 z-40 w-full bg-background border-b shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold">
                <span className="text-google-blue">Arcade</span>
                <span className="text-google-red">Verse</span>
              </h1>
            </Link>
          </motion.div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Button
                  variant="ghost"
                  className={cn(
                    "text-base font-medium transition-all hover:text-primary hover:bg-transparent hover:scale-105",
                    isActive(item.href) && "text-primary font-semibold"
                  )}
                  asChild
                >
                  <Link to={item.href}>{item.name}</Link>
                </Button>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4"
            >
              {/* Notification Panel */}
              <NotificationPanel />
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Profile Switcher */}
              <ProfileSwitcher />
            </motion.div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {isMenuOpen ? (
                    <IconX className="h-5 w-5" />
                  ) : (
                    <IconMenu2 className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-6 py-6">
                  <AnimatePresence>
                    {user && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-2 border-b pb-4 mb-2"
                      >
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>
                            {user.name?.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Level {user.level} {user.title}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {navItems.map((item) => (
                    <Button
                      key={item.name}
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start text-base font-medium",
                        isActive(item.href) && "bg-secondary text-secondary-foreground"
                      )}
                      onClick={handleCloseMenu}
                      asChild
                    >
                      <Link to={item.href}>{item.name}</Link>
                    </Button>
                  ))}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium">Toggle theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>
    </>
  );
}
