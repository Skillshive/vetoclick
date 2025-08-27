// Import Dependencies
import { Navigate, useLocation, useOutlet } from "react-router";

// Local Imports
import { GHOST_ENTRY_PATH, REDIRECT_URL_KEY } from "@/constants/app";
import { useAuthContext } from "@/contexts/auth/context";

// ----------------------------------------------------------------------

export default function AuthGuard() {
  const outlet = useOutlet();
  const { isAuthenticated } = useAuthContext();

  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`${GHOST_ENTRY_PATH}?${REDIRECT_URL_KEY}=${location.pathname}`}
        replace
      />
    );
  }

  return <>{outlet}</>;
}
