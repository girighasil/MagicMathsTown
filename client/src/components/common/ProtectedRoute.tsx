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
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </Route>
    );
  }

  return <Route path={path}>{children}</Route>;
}