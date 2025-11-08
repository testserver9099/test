import { useState, useEffect, lazy, Suspense } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { cn } from '@/lib/utils';

const PointsCalculator = lazy(() =>
  import('@/components/PointsCalculator').then(module => ({ default: module.PointsCalculator }))
);
const FeaturesSection = lazy(() =>
  import('@/components/FeaturesSection').then(module => ({ default: module.FeaturesSection }))
);
const HowToJoinSection = lazy(() =>
  import('@/components/HowToJoinSection').then(module => ({ default: module.HowToJoinSection }))
);
const TopPerformersSection = lazy(() =>
  import('@/components/TopPerformersSection').then(module => ({ default: module.TopPerformersSection }))
);
const ContactSection = lazy(() =>
  import('@/components/ContactSection').then(module => ({ default: module.ContactSection }))
);

const INITIAL_ACCOUNTS_ANALYZED = 2800;

// Fallback component for lazy loading
const LazyLoadFallback = () => (
  <div className="flex justify-center items-center h-64">
    <p>Loading section...</p>
  </div>
);

export function HomePage() {
  const [accountsAnalyzed, setAccountsAnalyzed] = useState(INITIAL_ACCOUNTS_ANALYZED);
  const [isClientForHome, setIsClientForHome] = useState(false);

  useEffect(() => {
    setIsClientForHome(true);
    
    // Fetch global accounts analyzed count from server
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/stats');
        const data = await response.json();
        setAccountsAnalyzed(data.profilesAnalyzed);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fall back to localStorage or initial value
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('arcadeverseAccountsAnalyzed');
          if (saved) {
            setAccountsAnalyzed(Number.parseInt(saved, 10));
          }
        }
      }
    };

    fetchStats();
  }, []);

  const incrementAccountsAnalyzed = () => {
    // Increment global counter on server
    fetch('http://localhost:3001/api/stats/profile-analyzed', {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {
        setAccountsAnalyzed(data.profilesAnalyzed);
      })
      .catch(err => {
        console.error('Error incrementing profile count:', err);
        // Fall back to local increment
        setAccountsAnalyzed(prevCount => prevCount + 1);
      });
  };

  return (
    <div className={cn("min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-white")}>
      <HeroSection />
      <Suspense fallback={<LazyLoadFallback />}>
        <PointsCalculator onProfileScanned={incrementAccountsAnalyzed} />
        <FeaturesSection />
        <HowToJoinSection />
        <TopPerformersSection />
        <ContactSection accountsAnalyzedCountFromHome={isClientForHome ? accountsAnalyzed : INITIAL_ACCOUNTS_ANALYZED} />
      </Suspense>
    </div>
  );
}
