import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

/**
 * Holds the student's profile/skills/interests/preferences data.
 * Kept separate from AuthContext (which only owns login/session state) so
 * profile data can be loaded, refreshed, or reset independently of auth.
 * Populated from profileService in later phases (mock or FastAPI).
 */
export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const value = {
    profile,
    setProfile,
    profileLoading,
    setProfileLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserProfile() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserProfile must be used within a UserProvider");
  }
  return context;
}
