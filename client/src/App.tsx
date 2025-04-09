import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin";
import LoginPage from "@/pages/LoginPage";
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
const TestimonialsManagement = lazy(() => import("@/pages/admin/testimonials"));
const FaqManagement = lazy(() => import("@/pages/admin/faqs"));
const PromoManagement = lazy(() => import("@/pages/admin/promotions"));
const SiteConfigManagement = lazy(() => import("@/pages/admin/site-config"));

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={LoginPage} />
        
        {/* Admin routes */}
        <ProtectedRoute path="/admin" adminOnly>
          <AdminDashboard />
        </ProtectedRoute>
        
        <ProtectedRoute path="/admin/courses" adminOnly>
          <CourseManagement />
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
