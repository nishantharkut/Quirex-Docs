import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { FullPageLoader } from "@/components/Loaders";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, hasRole, isAdmin } = useAuth();

  if (loading) {
    return <FullPageLoader message="Checking access..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole) && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm">You need the <strong>{requiredRole}</strong> role to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
