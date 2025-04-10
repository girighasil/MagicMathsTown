import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, RouteProps, useLocation } from "wouter";
import { ReactNode } from "react";

type ProtectedRouteProps = RouteProps & {
  adminOnly?: boolean;
  children: ReactNode;
};

export function ProtectedRoute({ path, children, adminOnly = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    // Redirect to auth page
    setLocation("/auth");
    return null;
  }

  if (adminOnly && user.role !== "admin") {
    // Redirect students trying to access admin pages to student dashboard
    setLocation("/student-dashboard");
    return null;
  }

  return <Route path={path}>{children}</Route>;
}