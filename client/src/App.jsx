import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Skeleton } from '@/components/ui/skeleton';

const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const UploadResume = lazy(() => import('@/pages/UploadResume'));
const ResumeAnalysis = lazy(() => import('@/pages/ResumeAnalysis'));
const MyCvs = lazy(() => import('@/pages/MyCvs'));
const JobMatcher = lazy(() => import('@/pages/JobMatcher'));
const CareerRecommendations = lazy(() => import('@/pages/CareerRecommendations'));
const History = lazy(() => import('@/pages/History'));
const Settings = lazy(() => import('@/pages/Settings'));

function PageFallback() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageFallback />;
  if (user) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <BrowserRouter>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route
                    path="/login"
                    element={
                      <GuestRoute>
                        <Login />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <GuestRoute>
                        <Register />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="cvs" element={<MyCvs />} />
                    <Route path="upload" element={<UploadResume />} />
                    <Route path="analysis/:resumeId" element={<ResumeAnalysis />} />
                    <Route path="matcher" element={<JobMatcher />} />
                    <Route path="careers" element={<CareerRecommendations />} />
                    <Route path="careers/:analysisId" element={<CareerRecommendations />} />
                    <Route path="history" element={<History />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            <Toaster
              position="top-center"
              toastOptions={{
                style: { borderRadius: '10px', fontSize: '14px' },
                success: { iconTheme: { primary: 'var(--color-success)', secondary: 'var(--color-background)' } },
                error: { iconTheme: { primary: 'var(--color-destructive)', secondary: 'var(--color-background)' } },
              }}
            />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
