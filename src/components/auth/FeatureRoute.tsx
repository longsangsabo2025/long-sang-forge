import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface FeatureRouteProps {
  children: ReactNode;
  requiredFeature?: string;
  allowedRoles?: string[];
}

/**
 * FeatureRoute - Check if user has permission to access a specific feature
 *
 * Usage:
 *   <FeatureRoute requiredFeature="/admin/ideas" allowedRoles={['admin', 'staff']}>
 *     <AdminIdeas />
 *   </FeatureRoute>
 */
export function FeatureRoute({
  children,
  requiredFeature,
  allowedRoles = ["admin"],
}: FeatureRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const userRole = (user?.user_metadata?.role as string) || "user";
  const userPermissions = (user?.user_metadata?.permissions as string[]) || [];

  // Admin has full access
  if (userRole === "admin") {
    return <>{children}</>;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check feature permission
  if (requiredFeature) {
    const hasPermission =
      userPermissions.includes(requiredFeature) || userPermissions.includes("*");

    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
