import type React from 'react';
import { createContext, useContext } from 'react';
import { toast, Toaster } from 'sonner';
import { IconSparkles, IconTrophy, IconBell, IconTarget, IconMedal, IconStar, IconMail } from '@tabler/icons-react';

type ToastProps = {
  title?: string;
  description?: React.ReactNode;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  action?: {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };
  cancel?: {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
};

interface NotificationContextType {
  success: (title: string, props?: Omit<ToastProps, 'title'>) => void;
  error: (title: string, props?: Omit<ToastProps, 'title'>) => void;
  info: (title: string, props?: Omit<ToastProps, 'title'>) => void;
  warning: (title: string, props?: Omit<ToastProps, 'title'>) => void;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    opts?: Omit<ToastProps, 'title'>
  ) => Promise<T>;
  dismiss: (toastId?: string) => void;
  // New notification types
  notifyNewUpdate: (updateTitle: string, updateDescription?: string) => void;
  notifyNewBadge: (badgeName: string, badgeType: string, points: number) => void;
  notifyMilestone: (milestone: string, points: number) => void;
  notifySwagTier: (tierName: string, rewards: string[]) => void;
  notifyLeaderboardRank: (rank: number, totalUsers: number, change?: 'up' | 'down' | 'same') => void;
  notifySupportMessage: (message: string, from?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const success = (title: string, props?: Omit<ToastProps, 'title'>) => {
    toast.success(title, {
      ...props,
      className: "toast-success",
    });
  };

  const error = (title: string, props?: Omit<ToastProps, 'title'>) => {
    toast.error(title, {
      ...props,
      className: "toast-error",
    });
  };

  const info = (title: string, props?: Omit<ToastProps, 'title'>) => {
    toast.info(title, {
      ...props,
      className: "toast-info",
    });
  };

  const warning = (title: string, props?: Omit<ToastProps, 'title'>) => {
    toast.warning(title, {
      ...props,
      className: "toast-warning",
    });
  };

  const promise = <T,>(
    promiseObj: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    opts?: Omit<ToastProps, 'title'>
  ): Promise<T> => {
    // Combine options with opts when calling toast.promise
    toast.promise(promiseObj, {
      ...opts,
      loading: options.loading,
      success: options.success,
      error: options.error,
    });
    return promiseObj;
  };

  const dismiss = (toastId?: string) => {
    toast.dismiss(toastId);
  };

  // New notification for updates
  const notifyNewUpdate = (updateTitle: string, updateDescription?: string) => {
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: 'update' as const,
      title: updateTitle,
      description: updateDescription || 'Check out the latest news and announcements',
      timestamp: new Date(),
      read: false,
    };
    
    // Dispatch to NotificationPanel
    window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    
    // Still show toast
    toast.success(updateTitle, {
      description: updateDescription || 'Check out the latest news and announcements',
      icon: <IconBell className="w-5 h-5 text-blue-500" />,
      duration: 7000,
      className: "toast-success",
    });
  };

  // New notification for badges
  const notifyNewBadge = (badgeName: string, badgeType: string, points: number) => {
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: 'badge' as const,
      title: `🎉 New ${badgeType} Badge Earned!`,
      description: `${badgeName} - +${points} Arcade Points`,
      timestamp: new Date(),
      read: false,
    };
    
    // Dispatch to NotificationPanel
    window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    
    // Still show toast
    toast.success(`🎉 New ${badgeType} Badge Earned!`, {
      description: (
        <div className="space-y-1">
          <p className="font-semibold">{badgeName}</p>
          <p className="text-sm text-muted-foreground">+{points} Arcade Points</p>
        </div>
      ),
      icon: <IconTrophy className="w-5 h-5 text-yellow-500" />,
      duration: 8000,
      className: "toast-success",
    });
  };

  // New notification for milestones
  const notifyMilestone = (milestone: string, points: number) => {
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: 'milestone' as const,
      title: `🎯 Milestone Reached!`,
      description: `${milestone} - ${points} Total Points`,
      timestamp: new Date(),
      read: false,
    };
    
    // Dispatch to NotificationPanel
    window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    
    // Still show toast
    toast.success(`🎯 Milestone Reached!`, {
      description: (
        <div className="space-y-1">
          <p className="font-semibold">{milestone}</p>
          <p className="text-sm text-muted-foreground">{points} Total Points</p>
        </div>
      ),
      icon: <IconTarget className="w-5 h-5 text-green-500" />,
      duration: 8000,
      className: "toast-success",
    });
  };

  // New notification for swag tiers
  const notifySwagTier = (tierName: string, rewards: string[]) => {
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: 'swag' as const,
      title: `🏆 Swag Tier Unlocked!`,
      description: `${tierName} - Rewards: ${rewards.slice(0, 2).join(', ')}${rewards.length > 2 ? ` +${rewards.length - 2} more` : ''}`,
      timestamp: new Date(),
      read: false,
    };
    
    // Dispatch to NotificationPanel
    window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    
    // Still show toast
    toast.success(`🏆 Swag Tier Unlocked!`, {
      description: (
        <div className="space-y-1">
          <p className="font-semibold">{tierName}</p>
          <p className="text-sm text-muted-foreground">
            Rewards: {rewards.slice(0, 2).join(', ')}
            {rewards.length > 2 && ` +${rewards.length - 2} more`}
          </p>
        </div>
      ),
      icon: <IconMedal className="w-5 h-5 text-purple-500" />,
      duration: 10000,
      className: "toast-success",
      action: {
        label: 'View Swag',
        onClick: () => {
          window.location.href = '/dashboard#swag';
        },
      },
    });
  };

  // New notification for leaderboard position
  const notifyLeaderboardRank = (rank: number, totalUsers: number, change?: 'up' | 'down' | 'same') => {
    const changeText = change === 'up' ? '📈 Moved up!' : change === 'down' ? '📉 Moved down' : '';
    
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: 'leaderboard' as const,
      title: `${changeText || '📊'} Your Rank: #${rank}`,
      description: `You're in the top ${Math.round((rank / totalUsers) * 100)}% of ${totalUsers} players`,
      timestamp: new Date(),
      read: false,
    };
    
    // Dispatch to NotificationPanel
    window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    
    // Still show toast
    toast.info(`${changeText || '📊'} Your Rank: #${rank}`, {
      description: `You're in the top ${Math.round((rank / totalUsers) * 100)}% of ${totalUsers} players`,
      icon: <IconStar className="w-5 h-5 text-orange-500" />,
      duration: 6000,
      className: "toast-info",
    });
  };

  // New notification for support messages
  const notifySupportMessage = (message: string, from?: string) => {
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: 'support' as const,
      title: from ? `Message from ${from}` : 'Support Message',
      description: message,
      timestamp: new Date(),
      read: false,
    };
    
    // Dispatch to NotificationPanel
    window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
    
    // Still show toast
    toast.info(from ? `Message from ${from}` : 'Support Message', {
      description: message,
      icon: <IconMail className="w-5 h-5 text-indigo-500" />,
      duration: 8000,
      className: "toast-info",
      action: {
        label: 'View',
        onClick: () => {
          window.location.href = '/support';
        },
      },
    });
  };

  const value = {
    success,
    error,
    info,
    warning,
    promise,
    dismiss,
    notifyNewUpdate,
    notifyNewBadge,
    notifyMilestone,
    notifySwagTier,
    notifyLeaderboardRank,
    notifySupportMessage,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          className: "toast-container",
        }}
        theme="system"
        closeButton
      />
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }

  return context;
};
