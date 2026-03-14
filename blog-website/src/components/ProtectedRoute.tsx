import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { FullPageLoader } from "@/components/Loaders";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, hasRole, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader message="Checking access..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole) && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground text-sm">You need the <strong>{requiredRole}</strong> role to access this page.</p>
          <Link
            to="/dashboard"
            className="inline-flex mt-4 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
