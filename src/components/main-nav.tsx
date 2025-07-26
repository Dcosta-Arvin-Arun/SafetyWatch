"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // <-- Add useRouter import
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function MainNav() {
  const pathname = usePathname();
  const { user, isAdmin, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter(); 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Prefetch most important pages for fast navigation
    router.prefetch("/crimes");
    router.prefetch("/reports");
    router.prefetch("/reports/map");
    if (user && user.role === "admin") {
      router.prefetch("/admin/dashboard");
    } else if (user && (!user.role || user.role === "user")) {
      router.prefetch("/dashboard");
    }
  }, [router, user]);

  // Role-based navigation items
  let navItems = [];
  if (loading) {
    // Show basic items while loading
    navItems = [
      { href: "/reports/new", label: "Report Crime" },
      { href: "/crimes", label: "Crime Reports" },
      { href: "/reports/map", label: "Crime Map" },
      { href: "/stats", label: "Statistics" },
    ];
  } else if (user && user.role === "admin") {
    navItems = [
      { href: "/crimes", label: "Crime Reports" },
      { href: "/reports/map", label: "Crime Map" },
      { href: "/stats", label: "Statistics" },
      { href: "/admin/dashboard", label: "Admin Dashboard" },
    ];
  } else if (user && (!user.role || user.role === "user")) {
    navItems = [
      { href: "/reports/new", label: "Report Crime" },
      { href: "/crimes", label: "Crime Reports" },
      { href: "/reports/map", label: "Crime Map" },
      { href: "/stats", label: "Statistics" },
      { href: "/dashboard", label: "Dashboard" },
    ];
  } else {
    navItems = [
      { href: "/reports/new", label: "Report Crime" },
      { href: "/track", label: "Track" },
      { href: "/crimes", label: "Crime Reports" },
      { href: "/reports/map", label: "Crime Map" },
      { href: "/stats", label: "Statistics" },
    ];
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm"
          : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex h-20 items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center">
            <svg
              className="h-8 w-8 text-red-600 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              SafetyWatch
            </span>
          </Link>
        </div>

        {/* Center: Navigation links (visible only on screens 1200px and above) */}
        <nav className="hidden min-[1200px]:flex items-center">
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative py-2 px-1 text-lg font-semibold ${
                    pathname === item.href
                      ? "text-red-600"
                      : "text-gray-900 hover:text-red-500"
                  } transition-colors duration-200`}
                >
                  {item.label}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute left-0 right-0 h-1 bg-red-600 bottom-0"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Auth/User actions (visible on screens 1200px and above) */}
        <div className="hidden min-[1200px]:flex items-center">
          {loading ? (
            <div className="flex items-center space-x-4">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <Button
                disabled
                variant="outline"
                className="h-10 px-5 text-lg font-semibold border-gray-300 text-gray-400"
              >
                Loading...
              </Button>
            </div>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <span className="text-lg font-medium text-gray-900">
                {user.displayName && user.displayName.trim() !== ""
                  ? user.displayName
                  : user.email.split("@")[0]}
              </span>
              <Button
                onClick={async () => {
                  await logout();
                  router.push("/");
                }}
                variant="outline"
                className="h-10 px-5 text-lg font-semibold border-red-600 text-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="h-10 px-5 text-lg font-semibold text-gray-900 hover:bg-gray-100"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  className="h-10 px-5 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle button (visible below 1200px) */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="min-[1200px]:hidden ml-4 p-2 rounded-md text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-600"
        >
          {mobileMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu (visible on screens below 1200px) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobileMenu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-[1200px]:hidden border-t border-gray-200 bg-white shadow-md rounded-b-lg"
          >
            <nav className="px-4 py-4">
              <ul className="flex flex-col space-y-3 divide-y divide-gray-200">
                {navItems.map((item) => (
                  <li key={item.href} className="pt-2">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block py-2 text-lg font-semibold ${
                        pathname === item.href
                          ? "text-red-600"
                          : "text-gray-900 hover:text-red-500"
                      } transition-colors duration-200`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                {/* Increased padding above user section */}
                <li className="pt-6">
                  {loading ? (
                    <div className="flex flex-col space-y-2 pt-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      <Button
                        disabled
                        variant="outline"
                        className="h-10 w-full text-lg font-semibold border-gray-300 text-gray-400"
                      >
                        Loading...
                      </Button>
                    </div>
                  ) : user ? (
                    <div className="flex flex-col space-y-2 pt-2">
                      <span className="text-lg font-medium text-gray-900">
                        {user.displayName && user.displayName.trim() !== ""
                          ? user.displayName
                          : user.email.split("@")[0]}
                      </span>
                      <Button
                        onClick={async () => {
                          await logout();
                          setMobileMenuOpen(false);
                          router.push("/");
                        }}
                        variant="outline"
                        className="h-10 w-full text-lg font-semibold border-red-600 text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="pt-2">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            variant="ghost"
                            className="h-10 w-full text-lg font-semibold text-gray-900 hover:bg-gray-100"
                          >
                            Login
                          </Button>
                        </Link>
                      </div>
                      <div className="pt-2">
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                          <Button
                            className="h-10 w-full text-lg font-semibold bg-red-600 hover:bg-red-700 text-white"
                          >
                            Register
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}