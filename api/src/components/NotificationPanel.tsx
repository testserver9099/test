import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  IconBell, 
  IconX,
  IconTrophy,
  IconTarget,
  IconMedal,
  IconStar,
  IconMail,
  IconSparkles,
  IconTrash
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'update' | 'badge' | 'milestone' | 'swag' | 'leaderboard' | 'support';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

// Store notifications in localStorage
const STORAGE_KEY = 'app_notifications';
const MAX_NOTIFICATIONS = 50;

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const withDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(withDates);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    // Set up listener for new notifications
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      const newNotification = {
        ...event.detail,
        timestamp: new Date(),
      };
      
      setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('new-notification' as any, handleNewNotification);
    
    return () => {
      window.removeEventListener('new-notification' as any, handleNewNotification);
    };
  }, []);

  // Mark all as read when panel is opened
  useEffect(() => {
    if (isOpen && notifications.some(n => !n.read)) {
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const removeNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <IconSparkles className="w-4 h-4 text-blue-500" />;
      case 'badge':
        return <IconTrophy className="w-4 h-4 text-yellow-500" />;
      case 'milestone':
        return <IconTarget className="w-4 h-4 text-green-500" />;
      case 'swag':
        return <IconMedal className="w-4 h-4 text-purple-500" />;
      case 'leaderboard':
        return <IconStar className="w-4 h-4 text-orange-500" />;
      case 'support':
        return <IconMail className="w-4 h-4 text-indigo-500" />;
      default:
        return <IconBell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <IconBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2">
          <div>
            <h3 className="text-sm font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">
              {notifications.length === 0
                ? 'No notifications'
                : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={clearAll}
            >
              <IconTrash className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <IconBell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No notifications yet</p>
            <p className="text-xs mt-1">You'll see updates here</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <DropdownMenuItem
                  className={cn(
                    'flex items-start gap-3 p-3 cursor-default',
                    !notification.read && 'bg-accent/50'
                  )}
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium leading-tight pr-6">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        {notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    <IconX className="h-3 w-3" />
                  </Button>
                </DropdownMenuItem>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
