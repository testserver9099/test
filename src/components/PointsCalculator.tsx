import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCalculation } from '@/lib/calculation-context';
import { useProfile } from '@/lib/profile-context';
import { useDashboard } from '@/lib/dashboard-context';
import { useLeaderboard } from '@/lib/leaderboard-context';
import { badgeService, CalculationResponse } from '@/services/badgeService';


interface PointsCalculatorProps {
  onProfileScanned: () => void;
}

export function PointsCalculator({ onProfileScanned }: PointsCalculatorProps) {
  const navigate = useNavigate();
  const { setProfileUrl: setGlobalProfileUrl, setIsCalculating, setCalculationResult } = useCalculation();
  const { profiles, selectedProfile, addProfile, selectProfile, updateProfileCalculation, updateProfileName } = useProfile();
  const { isFacilitator } = useDashboard();
  const { updateLeaderboardEntry } = useLeaderboard();

  const [inputProfileUrl, setInputProfileUrl] = useState<string>(selectedProfile?.profileUrl || '');
  const [calculationResponse, setCalculationResponse] = useState<CalculationResponse | null>(selectedProfile?.calculationResponse || null);
  const [points, setPoints] = useState<number | null>(selectedProfile?.calculationResponse?.points.total || null);
  const [calculatingPoints, setCalculatingPoints] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProfile) {
      setInputProfileUrl(selectedProfile.profileUrl);
      setPoints(selectedProfile.calculationResponse?.points.total || null);
      setCalculationResponse(selectedProfile.calculationResponse || null);
      setGlobalProfileUrl(selectedProfile.profileUrl);
    }
  }, [selectedProfile, setGlobalProfileUrl]);

  const handleCalculatePoints = async () => {
    if (!inputProfileUrl.trim()) return;

    setCalculatingPoints(true);
    setError(null);

    try {
      setIsCalculating(true);
      setGlobalProfileUrl(inputProfileUrl);

      // Always calculate with facilitator mode to get complete data (including milestone points)
      // The dashboard will handle displaying with/without bonus based on the toggle
      const response = await badgeService.calculatePoints(inputProfileUrl, true);

      if (response.points) {
        setPoints(response.points.total);
        setCalculationResponse(response);
        
        // Transform response to match dashboard context format
        const transformedResult = {
          success: true,
          user: {
            points: response.points.total,
            badges: response.badges
          },
          profileData: response.profileData, // Add scraped profile data
          breakdown: {
            skill: { count: 0, points: response.points.skillBadges, pointsPerBadge: 0.5 },
            level: { count: 0, points: response.points.gameBadges, pointsPerBadge: 1 },
            trivia: { count: 0, points: response.points.triviaBadges, pointsPerBadge: 1 },
            completion: { count: 0, points: 0, pointsPerBadge: 0 }
          },
          summary: {
            skillBadges: response.badges.filter(b => b.type === 'skill').length,
            levelBadges: response.badges.filter(b => b.type === 'game').length,
            triviaBadges: response.badges.filter(b => b.type === 'trivia').length,
            completionBadges: response.badges.filter(b => b.type === 'completion').length,
            totalPoints: response.points.total,
            milestonePoints: response.points.milestonePoints || 0
          },
          milestoneProgress: response.milestoneProgress
        };
        
        // Store transformed calculation result in context for dashboard
        setCalculationResult(transformedResult as any);

      const existingProfile = profiles.find(p => p.profileUrl === inputProfileUrl);
      if (existingProfile) {
        // Update the profile name if it has changed
        if (response.profileData.name && existingProfile.name !== response.profileData.name) {
          updateProfileName(existingProfile.id, response.profileData.name);
        }
        updateProfileCalculation(existingProfile.id, response);
        selectProfile(existingProfile.id);
      } else {
        // Use the scraped profile name from API response
        const newProfileName = response.profileData.name || `Profile ${profiles.length + 1}`;
        const newProfileId = await addProfile(inputProfileUrl, newProfileName);
        // Now update the calculation with the returned profile ID
        updateProfileCalculation(newProfileId, response);
        selectProfile(newProfileId);
      }
        
        // Save to ProfileSwitcher's localStorage
        const savedProfiles = localStorage.getItem('arcadeverse_profiles');
        const existingSavedProfiles = savedProfiles ? JSON.parse(savedProfiles) : [];
        
        // Check if profile already exists in saved profiles
        const existingProfileIndex = existingSavedProfiles.findIndex((p: any) => p.url === inputProfileUrl);
        
        if (existingProfileIndex >= 0) {
          // Update existing profile with latest data
          existingSavedProfiles[existingProfileIndex] = {
            ...existingSavedProfiles[existingProfileIndex],
            name: response.profileData.name,
            memberSince: response.profileData.memberSince,
            points: response.points.total - (response.points.milestonePoints || 0),
            bonusPoints: response.points.milestonePoints || 0,
            calculationData: transformedResult, // Store full calculation data
          };
        } else {
          // Add new profile
          const newProfile = {
            id: Date.now().toString(),
            name: response.profileData.name, // Use scraped profile name
            url: inputProfileUrl,
            memberSince: response.profileData.memberSince, // Store member since
            points: response.points.total - (response.points.milestonePoints || 0),
            bonusPoints: response.points.milestonePoints || 0,
            addedAt: new Date().toISOString(),
            calculationData: transformedResult, // Store full calculation data for instant switching
          };
          existingSavedProfiles.push(newProfile);
        }
        
        localStorage.setItem('arcadeverse_profiles', JSON.stringify(existingSavedProfiles));
        
        // Dispatch custom event to notify ProfileSwitcher
        window.dispatchEvent(new Event('profilesUpdated'));
        
        // Update leaderboard with the calculated profile data
        const profileForLeaderboard = profiles.find(p => p.profileUrl === inputProfileUrl);
        if (profileForLeaderboard && profileForLeaderboard.calculationResponse) {
          updateLeaderboardEntry(profileForLeaderboard);
        }
        
        onProfileScanned();
        
        // Navigate to dashboard after successful calculation
        navigate('/dashboard');
      } else {
        setError('Failed to calculate points. Please check your profile URL.');
      }
    } catch (err: any) {
      console.error('Error calculating points:', err);
      setError(err.message || 'Failed to calculate points. Please try again later.');
    } finally {
      setCalculatingPoints(false);
      setIsCalculating(false);
    }
  };

  const handleLoadSavedProfile = (profileId: string) => {
    selectProfile(profileId);
  };

  return (
    <div id="calculator-section" className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold">
              ⚡ Instant Results
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Calculate Your Arcade Points
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Track your Google Cloud Arcade progress in real-time. Enter your profile URL and discover your achievements instantly!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-800 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-[2px]">
              <CardHeader className="bg-white dark:bg-gray-900 p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Points Calculator</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-base mt-1">
                      Paste your SkillBoost profile URL below
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </div>
            
            <CardContent className="p-8 bg-white dark:bg-gray-900">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="profile-url" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Your SkillBoost Profile URL
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1 group">
                      <Input
                        id="profile-url"
                        placeholder="https://www.cloudskillsboost.google/public_profiles/..."
                        value={inputProfileUrl}
                        onChange={(e) => setInputProfileUrl(e.target.value)}
                        className="h-14 pl-12 pr-4 text-base border-2 border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl transition-all duration-200 bg-gray-50 dark:bg-gray-800"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                    </div>
                    <Button
                      onClick={handleCalculatePoints}
                      disabled={calculatingPoints || !inputProfileUrl.trim()}
                      className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {calculatingPoints ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Calculating...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Calculate
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      )}
                    </Button>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <span className="font-semibold">Profile Saved!</span> Your accounts are securely stored. Switch between profiles anytime without re-entering URLs.
                    </p>
                  </motion.div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-red-800 dark:text-red-300 mb-1">Error</h4>
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {points !== null && !error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-purple-900/20 dark:to-blue-900/20 p-8 border-2 border-purple-200 dark:border-purple-800"
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="inline-block"
                      >
                        <div className="text-8xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                          {points}
                        </div>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">
                          Total Arcade Points
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button
                          onClick={() => navigate('/dashboard')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          View Full Dashboard
                          <svg className="w-5 h-5 ml-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Removed Saved Profiles section - now managed in header ProfileSwitcher */}
              </div>
            </CardContent>
            
            <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-8 py-5 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 w-full">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="flex-1">🔒 Your data is private and secure. We don't store your personal information.</span>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}