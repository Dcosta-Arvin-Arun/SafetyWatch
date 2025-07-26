// app/track/page.tsx
"use client";
import { useState } from "react";
import { MainNav } from "@/components/main-nav";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatReportDateTime } from "@/lib/utils";

export default function TrackReportEntryPage() {
  const [inputId, setInputId] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <MainNav />
      
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, -20, 0],
              y: [0, 20, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div 
            className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20"
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl p-8 space-y-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl dark:bg-gray-900/90 dark:shadow-none border border-gray-200/50 dark:border-gray-700/50"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 mb-8"
            >
              <svg 
                className="h-8 w-8 text-primary transition-transform hover:scale-110" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M12 3l8 4v5c0 5.25-3.5 9.75-8 11-4.5-1.25-8-5.75-8-11V7l8-4z" 
                />
              </svg>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-400">
                Track Your Report
              </h1>
            </motion.div>
            
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (inputId.trim()) {
                  router.push(`/track/${inputId.trim()}`);
                }
              }}
              className="space-y-6"
            >
              <div className="relative">
                <motion.input
                  type="text"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  className={`peer w-full px-5 py-3.5 border ${
                    inputFocused ? "border-primary" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 bg-white/90 dark:bg-gray-900/80 placeholder-transparent text-gray-700 dark:text-gray-100`}
                  placeholder="Tracking ID"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
                <motion.label
                  className={`absolute left-5 transition-all duration-200 pointer-events-none ${
                    inputFocused || inputId
                      ? "-top-2.5 text-xs bg-white/90 dark:bg-gray-900/80 px-1 text-primary"
                      : "top-3.5 text-gray-400"
                  }`}
                  layout
                >
                  Tracking ID
                </motion.label>
                <span className="absolute right-4 top-3.5 text-blue-400 transition-colors duration-200 peer-focus:text-primary">
                  <svg 
                    className="h-5 w-5" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                    />
                  </svg>
                </span>
              </div>
              
              <motion.button 
                type="submit" 
                className="w-full px-4 py-3.5 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-lg shadow-md transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 active:scale-[0.98]"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Track Report
              </motion.button>
              
              <motion.p 
                className="text-center text-sm text-primary animate-pulse dark:text-blue-400"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Enter your 16-character tracking ID
              </motion.p>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}