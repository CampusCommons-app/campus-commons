import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export type UserRole = 'member' | 'officer';

export interface ClubMembership {
  id: string;
  name: string;
  category: string;
  role: string;
  joinedSemester: string;
  color: string;
}

export interface PendingRequest {
  id: string;
  name: string;
  category: string;
  requestedDate: string;
  color: string;
}

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  joinedClubs: ClubMembership[];
  pendingClubs: PendingRequest[];
  supabaseUser?: User;
}

interface AuthCtx {
  user: AuthUser | null;
  session: Session | null;
  isSignedIn: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  requestJoinClub: (club: { id: string; name: string; category: string; color: string }) => void;
  leaveClub: (clubId: string) => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  isSignedIn: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  requestJoinClub: () => {},
  leaveClub: () => {},
});

function supabaseUserToAuthUser(supabaseUser: User): AuthUser {
  return {
    name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email ?? 'Student',
    email: supabaseUser.email ?? '',
    role: 'member',
    joinedClubs: [],
    pendingClubs: [],
    supabaseUser,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? supabaseUserToAuthUser(session.user) : null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ? supabaseUserToAuthUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string, name: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  function requestJoinClub(club: { id: string; name: string; category: string; color: string }) {
    setUser((prev) => {
      if (!prev) return prev;
      const alreadyJoined = prev.joinedClubs.some((c) => c.id === club.id);
      const alreadyPending = prev.pendingClubs.some((c) => c.id === club.id);
      if (alreadyJoined || alreadyPending) return prev;
      const today = new Date();
      const requestedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        ...prev,
        pendingClubs: [...prev.pendingClubs, { ...club, requestedDate }],
      };
    });
  }

  function leaveClub(clubId: string) {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        joinedClubs: prev.joinedClubs.filter((c) => c.id !== clubId),
        pendingClubs: prev.pendingClubs.filter((c) => c.id !== clubId),
      };
    });
  }

  return (
    <AuthContext.Provider value={{ user, session, isSignedIn: user !== null, isLoading, signIn, signUp, signOut, requestJoinClub, leaveClub }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
