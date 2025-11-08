import { useState, useEffect } from 'react';
import { useCalculation } from '@/lib/calculation-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserPlus, Trash2 } from 'lucide-react';
import { badgeService } from '@/services/badgeService';

interface SavedProfile {
  id: string;
  name: string;
  url: string;
  memberSince?: string;
  points: number;
  bonusPoints: number;
  addedAt: string;
  calculationData?: any; // Store full calculation result for instant switching
}

export function ProfileSwitcher() {
  const { calculationResult, setCalculationResult, profileUrl, setProfileUrl } = useCalculation();
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newProfileUrl, setNewProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  // Load profiles from localStorage on mount
  useEffect(() => {
    const loadProfiles = () => {
      const savedProfiles = localStorage.getItem('arcadeverse_profiles');
      if (savedProfiles) {
        try {
          const parsed = JSON.parse(savedProfiles);
          setProfiles(parsed);
          
          // If there's a current profileUrl, set it as current
          if (profileUrl && !currentProfileId) {
            const matchingProfile = parsed.find((p: SavedProfile) => p.url === profileUrl);
            if (matchingProfile) {
              setCurrentProfileId(matchingProfile.id);
            }
          }
        } catch (error) {
          console.error('Failed to parse saved profiles', error);
        }
      }
    };
    
    loadProfiles();
    
    // Listen for storage changes (when profiles are added from calculator)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'arcadeverse_profiles') {
        loadProfiles();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event from same window
    const handleProfileUpdate = () => {
      loadProfiles();
    };
    
    window.addEventListener('profilesUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profilesUpdated', handleProfileUpdate);
    };
  }, [profileUrl]);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('arcadeverse_profiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  // Extract name from profile URL
  const extractNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const profileId = pathParts[pathParts.length - 1];
      return profileId || 'User';
    } catch {
      return 'User';
    }
  };

  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(/[\s-]/)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Add new profile
  const handleAddProfile = async () => {
    if (!newProfileUrl.trim()) return;

    setIsLoading(true);
    try {
      const result = await badgeService.calculatePoints(newProfileUrl, false);
      const name = extractNameFromUrl(newProfileUrl);
      
      const newProfile: SavedProfile = {
        id: Date.now().toString(),
        name,
        url: newProfileUrl,
        points: result.points?.total || 0,
        bonusPoints: result.points?.milestonePoints || 0,
        addedAt: new Date().toISOString(),
      };

      setProfiles((prev) => [...prev, newProfile]);
      setNewProfileUrl('');
      setShowAddInput(false);
      
      // Automatically switch to the newly added profile
      switchProfile(newProfile);
    } catch (error) {
      console.error('Failed to add profile:', error);
      alert('Failed to add profile. Please check the URL and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to a profile
  const switchProfile = (profile: SavedProfile) => {
    // If we have cached calculation data, use it instantly
    if (profile.calculationData) {
      setCalculationResult(profile.calculationData);
      setProfileUrl(profile.url);
      setCurrentProfileId(profile.id);
      setIsOpen(false);
    } else {
      // Otherwise fetch it (for old profiles without cached data)
      fetchAndSwitchProfile(profile);
    }
  };

  // Fetch profile data from API (for profiles without cached data)
  const fetchAndSwitchProfile = async (profile: SavedProfile) => {
    setIsLoading(true);
    try {
      const result = await badgeService.calculatePoints(profile.url, true);
      
      // Transform the result to match dashboard context format
      const transformedResult = {
        success: true,
        user: {
          points: result.points.total,
          badges: result.badges
        },
        profileData: result.profileData,
        breakdown: {
          skill: { count: 0, points: result.points.skillBadges, pointsPerBadge: 0.5 },
          level: { count: 0, points: result.points.gameBadges, pointsPerBadge: 1 },
          trivia: { count: 0, points: result.points.triviaBadges, pointsPerBadge: 1 },
          completion: { count: 0, points: 0, pointsPerBadge: 0 }
        },
        summary: {
          skillBadges: result.badges.filter(b => b.type === 'skill').length,
          levelBadges: result.badges.filter(b => b.type === 'game').length,
          triviaBadges: result.badges.filter(b => b.type === 'trivia').length,
          completionBadges: result.badges.filter(b => b.type === 'completion').length,
          totalPoints: result.points.total,
          milestonePoints: result.points.milestonePoints || 0
        },
        milestoneProgress: result.milestoneProgress
      };
      
      setCalculationResult(transformedResult as any);
      setProfileUrl(profile.url);
      setCurrentProfileId(profile.id);
      
      // Update the profile with cached data
      setProfiles((prev) => 
        prev.map((p) => 
          p.id === profile.id 
            ? { ...p, calculationData: transformedResult }
            : p
        )
      );
      
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to switch profile:', error);
      alert('Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a profile
  const removeProfile = (profileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to remove this profile?')) {
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
      
      // If removing the current profile, clear the calculation result
      if (currentProfileId === profileId) {
        setCalculationResult(null);
        setProfileUrl('');
        setCurrentProfileId(null);
      }
    }
  };

  const currentProfile = profiles.find((p) => p.id === currentProfileId);
  const displayName = currentProfile?.name || (calculationResult ? 'Profile' : 'Add Profile');
  const displayPoints = currentProfile?.points || (calculationResult as any)?.points?.total || 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0 hover:bg-accent"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1.5 text-sm font-semibold">Switch Account</div>
        <DropdownMenuSeparator />
        
        {/* List of saved profiles */}
        <div className="max-h-64 overflow-y-auto">
          {profiles.map((profile) => (
            <DropdownMenuItem
              key={profile.id}
              className="flex items-center justify-between gap-3 py-3 cursor-pointer"
              onClick={() => switchProfile(profile)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{profile.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {profile.memberSince && `Member since ${profile.memberSince} • `}
                    {profile.points} + ({profile.bonusPoints} bonus)
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => removeProfile(profile.id, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* Add Another Account */}
        {showAddInput ? (
          <div className="p-3 space-y-2">
            <input
              type="text"
              placeholder="Enter SkillBoost profile URL"
              value={newProfileUrl}
              onChange={(e) => setNewProfileUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleAddProfile();
                } else if (e.key === 'Escape') {
                  setShowAddInput(false);
                  setNewProfileUrl('');
                }
              }}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddProfile}
                disabled={isLoading || !newProfileUrl.trim()}
                className="flex-1"
              >
                {isLoading ? 'Adding...' : 'Add'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowAddInput(false);
                  setNewProfileUrl('');
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowAddInput(true)}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Another Account</span>
          </DropdownMenuItem>
        )}

        {/* Remove Account */}
        {profiles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (confirm('Remove all profiles?')) {
                    setProfiles([]);
                    setCalculationResult(null);
                    setProfileUrl('');
                    setCurrentProfileId(null);
                    localStorage.removeItem('arcadeverse_profiles');
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove All Accounts
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
