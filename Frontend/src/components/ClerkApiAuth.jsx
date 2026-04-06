import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { setClerkTokenGetter } from "../lib/axios";

/**
 * Registers Clerk's getToken with axios so cross-origin API calls to Express are authenticated.
 */
export default function ClerkApiAuth() {
  const { getToken } = useAuth();

  useEffect(() => {
    setClerkTokenGetter(() => getToken());
    return () => setClerkTokenGetter(null);
  }, [getToken]);

  return null;
}
