"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import { MainNav } from "@/components/main-nav";
import LoginForm from "@/components/login-form";
import { useRouter } from "next/navigation";
import { FaSignInAlt } from "react-icons/fa";

export default function LoginPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <>
      <MainNav />
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        {/* Animated background elements */}
        {isHydrated && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 overflow-hidden"
            >
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob" />
              <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob" />
              <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-0 right-0 w-full h-full pointer-events-none"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-blue-400/10 dark:bg-blue-400/5"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </>
        )}

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
          <AnimatePresence>
            <motion.div
              key="login-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl dark:bg-gray-900/90 dark:shadow-none border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <FaSignInAlt className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400" />
                  <h1 className="mt-6 text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-400">
                    Welcome Back
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Sign in to your account
                  </p>
                </motion.div>
              </div>
              <Suspense
                fallback={
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary rounded-full animate-spin border-t-transparent" />
                  </div>
                }
              >
                <LoginForm onSuccess={() => router.push("/")} />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}