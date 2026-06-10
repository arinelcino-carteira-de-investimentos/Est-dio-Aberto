import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  session: any;
  user: any;
  profile: any;
  setSession: (session: any) => void;
  setUser: (user: any) => void;
  setProfile: (profile: any) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      profile: null,
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      clearAuth: () => set({ session: null, user: null, profile: null }),
    }),
    {
      name: "openstudio-auth",
      partialize: (state) => ({ 
        session: state.session, 
        user: state.user, 
        profile: state.profile 
      }),
    }
  )
);
