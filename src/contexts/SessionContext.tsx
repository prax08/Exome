"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/Loading";
import { useNavigate } from "react-router-dom";

interface CustomUser extends User {
  role?: string; // Add role property
}

interface SessionContextType {
  session: Session | null;
  user: CustomUser | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching user profile role:", error);
      return null;
    }
    return data?.role;
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (currentSession) {
          const userRole = await fetchUserProfile(currentSession.user.id);
          const userWithRole: CustomUser = { ...currentSession.user, role: userRole };
          setSession(currentSession);
          setUser(userWithRole);
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (window.location.pathname === '/login') {
              navigate('/');
            }
          }
        } else {
          setSession(null);
          setUser(null);
          if (window.location.pathname !== '/login') {
            navigate('/login');
          }
        }
        setIsLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (initialSession) {
        const userRole = await fetchUserProfile(initialSession.user.id);
        const userWithRole: CustomUser = { ...initialSession.user, role: userRole };
        setSession(initialSession);
        setUser(userWithRole);
        if (window.location.pathname === '/login') {
          navigate('/');
        }
      } else {
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading count={5} className="w-64" />
      </div>
    );
  }

  return (
    <SessionContext.Provider value={{ session, user, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionContextProvider");
  }
  return context;
};