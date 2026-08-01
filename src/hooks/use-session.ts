"use client";

import { useState, useEffect, useCallback } from "react";
import { getSession, logout } from "@/lib/authService";
import type { Teacher, Student } from "@/lib/services";

export interface Session {
  user: Teacher | Student;
  role: 'teacher' | 'student';
}

interface UseSessionReturn {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: Teacher | Student | null;
  role: "teacher" | "student" | null;
  logout: () => void;
}

export function useSession(): UseSessionReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession as Session | null);
    setIsLoading(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setSession(null);
  }, []);

  return {
    session,
    isLoading,
    isAuthenticated: session !== null,
    user: session?.user ?? null,
    role: session?.role ?? null,
    logout: handleLogout,
  };
}
