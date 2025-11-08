import { useState } from 'react';
import { useAuth, type Badge as BadgeType } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IconLock, IconTrophy } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export function BadgesDisplay() {
  const { user } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  if (!user) return null;

  const { badges } = user;
  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const lockedBadges = badges.filter(badge => !badge.unlocked);

  const handleBadgeClick = (badge: BadgeType) => {
    setSelectedBadge(badge);
  };

  const closeBadgeDetails = () => {
    setSelectedBadge(null);
  };

  return (
    <>
      <Card className="w-full shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <span>Earned Badges</span>
            <Badge variant="outline" className="ml-2">
              {unlockedBadges.length}/{badges.length}
            </Badge>
          </CardTitle>
          <CardDescription>Your achievements and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer
                  ${badge.unlocked
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted/30 border border-muted grayscale opacity-70'
                  }`}
                onClick={() => handleBadgeClick(badge)}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <div className="text-sm font-medium text-center">{badge.name}</div>
                {!badge.unlocked && badge.progress !== undefined && (
                  <div className="w-full mt-2">
                    <div className="w-full bg-secondary h-1.5 rounded-full">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      {badge.progress}%
                    </div>
                  </div>
                )}
                {!badge.unlocked && badge.progress === undefined && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <IconLock size={10} className="mr-1" /> Locked
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedBadge && (
        <Dialog open={!!selectedBadge} onOpenChange={closeBadgeDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <span className="text-3xl mr-3">{selectedBadge.icon}</span>
                {selectedBadge.name}
              </DialogTitle>
              <DialogDescription>
                {selectedBadge.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className={`p-6 rounded-lg ${selectedBadge.unlocked ? 'bg-primary/10' : 'bg-muted/30'}`}>
                <div className="flex justify-center items-center mb-4">
                  <div className="text-6xl">{selectedBadge.icon}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={selectedBadge.unlocked ? "default" : "outline"}>
                      {selectedBadge.unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Category:</span>
                    <span className="text-sm">{selectedBadge.type.charAt(0).toUpperCase() + selectedBadge.type.slice(1)}</span>
                  </div>

                  {selectedBadge.unlocked && selectedBadge.unlockedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Unlocked:</span>
                      <span className="text-sm">{new Date(selectedBadge.unlockedAt).toLocaleDateString()}</span>
                    </div>
                  )}

                  {!selectedBadge.unlocked && selectedBadge.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Progress:</span>
                        <span className="text-sm">{selectedBadge.progress}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${selectedBadge.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedBadge.unlocked ? (
                <div className="text-sm text-center text-muted-foreground">
                  Congratulations on earning this badge!
                </div>
              ) : (
                <div className="text-sm text-center text-muted-foreground">
                  Keep progressing to unlock this badge.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
