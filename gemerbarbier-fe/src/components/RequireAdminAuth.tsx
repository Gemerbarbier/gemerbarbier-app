import { Navigate, useLocation } from "react-router-dom";

/**
 * Route guard for admin pages.
 * Synchronously checks sessionStorage and redirects to /admin/login if not authenticated.
 * Runs BEFORE the protected page mounts, so its useState/useEffect never fire
 * (avoids URL params being written by the dashboard before redirect).
 */
const RequireAdminAuth = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isLoggedIn =
    typeof window !== "undefined" && sessionStorage.getItem("adminDemo");

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default RequireAdminAuth;
