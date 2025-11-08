import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { RootLayout } from '@/components/layout/RootLayout';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardProvider } from '@/lib/dashboard-context';
import { CalculationProvider } from '@/lib/calculation-context';
import { ProfileProvider } from '@/lib/profile-context'; // Import ProfileProvider
import { LeaderboardProvider } from '@/lib/leaderboard-context'; // Import LeaderboardProvider
import { AuthProvider } from '@/lib/auth-context'; // Import AuthProvider
import { NotificationProvider } from '@/lib/notification-provider'; // Import NotificationProvider
import { HomePage } from '@/pages/HomePage';
import DashboardOverview from '@/pages/dashboard/DashboardOverview';
import StandaloneDashboard from '@/components/StandaloneDashboard';
import ArcadeCalcDashboard from '@/components/ArcadeCalcDashboard';
import { LeaderboardPage } from '@/pages/dashboard/LeaderboardPage';
import { BadgesPage } from '@/pages/dashboard/BadgesPage';
import { ResourcesPage } from '@/pages/dashboard/ResourcesPage';
import { SupportPage } from '@/pages/SupportPage';
// Note: DashboardContent was unused and caused a missing-module error; removed import

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.3,
};

// Animated routes wrapper
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Home route */}
        <Route
          path="/"
          element={
            <DashboardProvider>
              <MainLayout title="ArcadeCalc - Home" description="Calculate your Google Cloud Skills Boost Arcade points">
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <HomePage />
                </motion.div>
              </MainLayout>
            </DashboardProvider>
          }
        />

        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardProvider>
                <DashboardLayout>
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <ArcadeCalcDashboard />
                  </motion.div>
                </DashboardLayout>
              </DashboardProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/leaderboard"
          element={
            <DashboardProvider>
              <DashboardLayout>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <LeaderboardPage />
                </motion.div>
              </DashboardLayout>
            </DashboardProvider>
          }
        />

        <Route
          path="/dashboard/badges"
          element={
            <DashboardProvider>
              <DashboardLayout>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <BadgesPage />
                </motion.div>
              </DashboardLayout>
            </DashboardProvider>
          }
        />

        <Route
          path="/resources"
          element={
            <DashboardProvider>
              <DashboardLayout>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <ResourcesPage />
                </motion.div>
              </DashboardLayout>
            </DashboardProvider>
          }
        />

        {/* Support Page route */}
        <Route
          path="/support"
          element={
            <MainLayout title="ArcadeCalc - Support" description="Get help and support for ArcadeCalc">
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <SupportPage />
              </motion.div>
            </MainLayout>
          }
        />

        {/* Add more dashboard routes as they're created */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-2">Page Under Construction</h2>
                      <p className="text-muted-foreground">This section is coming soon!</p>
                    </div>
                  </div>
                </motion.div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LeaderboardProvider> {/* LeaderboardProvider must wrap ProfileProvider */}
          <ProfileProvider>
            <CalculationProvider>
              <RootLayout>
                <Router>
                  <AnimatedRoutes />
                </Router>
              </RootLayout>
            </CalculationProvider>
          </ProfileProvider>
        </LeaderboardProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
