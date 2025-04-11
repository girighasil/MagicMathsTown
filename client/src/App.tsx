import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin";
import LoginPage from "@/pages/LoginPage";
import TestSession from "@/pages/test-session";
import TestTakingSession from "@/pages/test-taking-session";
import TestReport from "@/pages/test-report";
import TestSeriesDetails from "@/pages/test-series-details";
import StudentDashboard from "@/pages/student-dashboard";
import TestSeriesPage from "@/pages/test-series";
import CoursesPage from "@/pages/courses";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

function LoadingFallback() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="animate-spin h-12 w-12 border-4 border-primary rounded-full border-t-transparent"></div>
    </div>
  );
}

// Lazy load admin components for better performance
const CourseManagement = lazy(() => import("@/pages/admin/courses"));
const CourseDetail = lazy(() => import("@/pages/admin/course-detail"));
const TestimonialsManagement = lazy(() => import("@/pages/admin/testimonials"));
const FaqManagement = lazy(() => import("@/pages/admin/faqs"));
const PromoManagement = lazy(() => import("@/pages/admin/promotions"));
const SiteConfigManagement = lazy(() => import("@/pages/admin/site-config"));
const ContactsManagement = lazy(() => import("@/pages/admin/contacts"));
const TestSeriesManagement = lazy(() => import("@/pages/admin/test-series"));
const TestDetails = lazy(() => import("@/pages/admin/test-details-new"));
const TestQuestions = lazy(() => import("@/pages/admin/test-questions"));

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/test/:id" component={TestSession} />
        <Route path="/test-series" component={TestSeriesPage} />
        <Route path="/test-series/:id" component={TestSeriesDetails} />
        <Route path="/courses" component={CoursesPage} />
        <Route path="/courses/:id" component={lazy(() => import("@/pages/course-detail"))} />
        <ProtectedRoute path="/test-taking/:testId">
          <TestTakingSession />
        </ProtectedRoute>
        <ProtectedRoute path="/test-report/:attemptId">
          <TestReport />
        </ProtectedRoute>
        
        <ProtectedRoute path="/dashboard">
          <StudentDashboard />
        </ProtectedRoute>

        <ProtectedRoute path="/student-dashboard">
          <StudentDashboard />
        </ProtectedRoute>
        
        {/* Admin routes */}
        <ProtectedRoute path="/admin" adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
        
        <ProtectedRoute path="/admin/courses" adminOnly>
          <CourseManagement />
        </ProtectedRoute>
        
        <ProtectedRoute path="/admin/courses/:id" adminOnly>
          <CourseDetail />
        </ProtectedRoute>
        
        <ProtectedRoute path="/admin/testimonials" adminOnly>
          <TestimonialsManagement />
        </ProtectedRoute>
        
        <ProtectedRoute path="/admin/faqs" adminOnly>
          <FaqManagement />
        </ProtectedRoute>
        
        <ProtectedRoute path="/admin/promotions" adminOnly>
          <PromoManagement />
        </ProtectedRoute>
        
        <ProtectedRoute path="/admin/site-config" adminOnly>
          <SiteConfigManagement />
        </ProtectedRoute>
        
        <ProtectedRoute path="/admin/contacts" adminOnly>
          <ContactsManagement />
        </ProtectedRoute>

        <ProtectedRoute path="/admin/test-series" adminOnly>
          <TestSeriesManagement />
        </ProtectedRoute>
        
        <ProtectedRoute path="/admin/test-series/:id" adminOnly>
          <TestDetails />
        </ProtectedRoute>
        
        <ProtectedRoute path="/admin/tests/:id/questions" adminOnly>
          <TestQuestions />
        </ProtectedRoute>
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
