"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

type UserRole = "admin" | "user";

interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  role?: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  register: (
    email: string,
    password: string,
    name: string,
    isAdminRegister?: boolean
  ) => Promise<void>; 
  login: (
    email: string,
    password: string,
    isAdminLogin?: boolean
  ) => Promise<void>; 
  logout: () => Promise<void>;
  signInWithGoogle: (isAdminRegister?: boolean) => Promise<void>; 
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google Identity Services script
function loadGoogleScript() {
  return new Promise<void>((resolve) => {
    if (document.getElementById('google-oauth')) return resolve();
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-oauth';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsAdmin(data.user?.role === "admin");
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Register via API
  const register = async (
    email: string,
    password: string,
    name: string,
    isAdminRegister?: boolean
  ) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role: isAdminRegister ? "admin" : "user" }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Registration failed");
    }
    // Optionally, fetch user again
    await new Promise((r) => setTimeout(r, 300));
    const me = await fetch("/api/auth/me");
    if (me.ok) {
      const data = await me.json();
      setUser(data.user);
      setIsAdmin(data.user?.role === "admin");
    }
  };

  // Login via API
  const login = async (
    email: string,
    password: string,
    isAdminLogin?: boolean
  ) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, isAdminLogin }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Login failed");
    }
    // Optionally, fetch user again
    await new Promise((r) => setTimeout(r, 300));
    const me = await fetch("/api/auth/me");
    if (me.ok) {
      const data = await me.json();
      setUser(data.user);
      setIsAdmin(data.user?.role === "admin");
    }
  };

  // Google sign-in via API
  const signInWithGoogle = async (isAdminRegister?: boolean): Promise<void> => {
    try {
      await loadGoogleScript();
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!(window as any).google || !clientId) throw new Error('Google SDK not loaded');
      const google = (window as any).google;
      return new Promise<void>((resolve, reject) => {
        const codeClient = google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (response: any) => {
            if (!response || !response.code) {
              reject(new Error('Google authentication failed'));
              return;
            }
            // Send the code to the backend for token exchange
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                code: response.code,
                isAdminRegister,
              }),
            });
            if (!res.ok) {
              const error = await res.json();
              reject(new Error(error.message || 'Google sign-in failed'));
              return;
            }
            // Refresh user data
            await new Promise((r) => setTimeout(r, 300));
            const me = await fetch('/api/auth/me');
            if (me.ok) {
              const data = await me.json();
              setUser(data.user);
              setIsAdmin(data.user?.role === 'admin');
            }
            resolve();
          },
        });
        codeClient.requestCode(); // This opens the popup
      });
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
      throw error;
    }
  };

  // Logout via API
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsAdmin(false);
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  useEffect(() => {
    const allowlist = [
      "/",
      "/login",
      "/register",
      "/crimes",
      "/reports/map",
      "/stats",
      "/reports/anonymous",
      "/track",
      "/reports/new", // <-- allow anonymous access to report crime page
    ];
    // Allow /track and /track/[id] (dynamic)
    const isTrackRoute = pathname?.startsWith("/track");
    // Allow /reports/[id] for anonymous users (but not /reports/new)
    const isReportDetailRoute = pathname?.startsWith("/reports/") && !["/reports/new", "/reports/map", "/reports/anonymous"].includes(pathname);
    if (
      !loading &&
      !user &&
      !allowlist.includes(pathname) &&
      !isTrackRoute &&
      !isReportDetailRoute
    ) {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        signInWithGoogle,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
