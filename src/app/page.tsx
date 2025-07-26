"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/main-nav";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { useAuth } from "@/context/auth-context";

export default function Home() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { user, isAdmin, loading } = useAuth();

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  // Hero section buttons
  const getHeroButtons = () => {
    if (loading) {
      return (
        <>
          <Button size="lg" disabled className="bg-gray-400 text-white font-semibold text-lg px-8 py-6">
            Loading...
          </Button>
          <Button variant="outline" size="lg" disabled className="border-gray-400 text-gray-400 font-semibold text-lg px-8 py-6">
            Loading...
          </Button>
        </>
      );
    }
    
    if (user && isAdmin) {
      return (
        <>
          <Link href="/admin/dashboard">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold text-lg px-8 py-6 transition-all duration-300 hover:scale-105 shadow-lg">
              Admin Dashboard
            </Button>
          </Link>
          <Link href="/reports/map">
            <Button variant="outline" size="lg" className="border-white text-black hover:bg-white/15 font-semibold text-lg px-8 py-6 transition-all duration-300 hover:scale-105">
              View Crime Map
            </Button>
          </Link>
        </>
      );
    } else if (user && !isAdmin) {
      return (
        <>
          <Link href="/reports/new">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold text-lg px-8 py-6 transition-all duration-300 hover:scale-105 shadow-lg">
              Report Crime
            </Button>
          </Link>
          <Link href="/reports/map">
            <Button variant="outline" size="lg" className="border-white text-black hover:bg-white/15 font-semibold text-lg px-8 py-6 transition-all duration-300 hover:scale-105">
              View Crime Map
            </Button>
          </Link>
        </>
      );
    } else {
      return (
        <>
          <Link href="/reports/anonymous">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-semibold text-lg px-8 py-6 transition-all duration-300 hover:scale-105 shadow-lg">
              Report Anonymously
            </Button>
          </Link>
          <Link href="/reports/map">
            <Button variant="outline" size="lg" className="border-white text-black hover:bg-white/15 font-semibold text-lg px-8 py-6 transition-all duration-300 hover:scale-105">
              View Crime Map
            </Button>
          </Link>
        </>
      );
    }
  };

  return (
    <>
      <MainNav />
      <main className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section 
          className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-navy-900 to-navy-800 bg-cover bg-center relative overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(135deg, #0a192f 0%, #172a45 100%)"
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')] opacity-10"></div>
          </div>
          
          <div className="max-w-[95%] mx-auto relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col justify-center space-y-4"
              >
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl leading-tight">
                    <span className="text-red-500">Contribute</span> to a Safer Community
                  </h1>
                  <p className="max-w-[600px] text-gray-300 md:text-xl text-lg">
                    Report incidents, track crime patterns, and help make our
                    neighborhood safer for everyone. Anonymous reporting
                    available.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row pt-4">
                  {getHeroButtons()}
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center justify-center"
              >
                <div className="relative w-full h-64 lg:h-96">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-navy-800/20 rounded-xl"></div>
                  <div className="absolute inset-4 border-2 border-red-500/50 rounded-lg"></div>
                  <div className="absolute inset-8 flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="120" 
                      height="120" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-red-500/50 h-40 w-40"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white max-w-[95%] mx-auto">
          <div className="px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-aptos text-navy-900">
                  Key <span className="text-red-600">Features</span>
                </h2>
                <p className="max-w-[900px] text-navy-700 md:text-xl/relaxed font-light">
                  Our platform offers powerful tools to keep you informed and
                  communities safe
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={{
                visible: { transition: { staggerChildren: 0.2 } }
              }}
            >
              {/* Feature cards: always equal height and width, but with a more compact min height */}
              <motion.div 
                variants={featureVariants} 
                className="flex flex-col h-full"
              >
                <a
                  href={user && isAdmin ? undefined : "/reports/anonymous"}
                  onClick={e => {
                    if (user && isAdmin) {
                      e.preventDefault();
                      import('sonner').then(({ toast }) => {
                        toast.error("Admins cannot submit reports.");
                      });
                    }
                  }}
                  className={`flex flex-col flex-1 items-center space-y-4 border border-red-200 p-6 rounded-xl bg-white transition-all duration-300 hover:bg-navy-50 hover:shadow-lg hover:-translate-y-2 group min-h-[240px] min-w-0 ${user && isAdmin ? 'cursor-not-allowed pointer-events-auto hover:blur-[2px]' : ''}`}
                  tabIndex={user && isAdmin ? -1 : 0}
                  aria-disabled={user && isAdmin ? 'true' : undefined}
                  role="button"
                >
                  <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-red-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                      <circle cx="12" cy="13" r="3"></circle>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 group-hover:text-red-600 transition-colors duration-300">AI-Powered Reports</h3>
                  <p className="text-navy-700 text-center font-light">
                    Report incidents anonymously with AI-powered text extraction from images.
                  </p>
                  <span className="text-red-600 font-medium group-hover:underline transition-all duration-300">
                    Report Anonymously &gt;
                  </span>
                </a>
              </motion.div>
              <motion.div variants={featureVariants} className="flex flex-col h-full">
                <Link
                  href="/reports/map"
                  className="flex flex-col flex-1 items-center space-y-4 border border-red-200 p-6 rounded-xl bg-white hover:bg-navy-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 group min-h-[240px] min-w-0"
                >
                  <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-red-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      <path d="M2 12h20"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 group-hover:text-red-600 transition-colors duration-300">Interactive Map</h3>
                  <p className="text-navy-700 text-center font-light">
                    Visualize crime hotspots and incidents in your neighborhood on an interactive map.
                  </p>
                  <span className="text-red-600 font-medium group-hover:underline transition-all duration-300">
                    View Map &gt;
                  </span>
                </Link>
              </motion.div>
              <motion.div variants={featureVariants} className="flex flex-col h-full">
                <Link
                  href="/stats"
                  className="flex flex-col flex-1 items-center space-y-4 border border-red-200 p-6 rounded-xl bg-white hover:bg-navy-50 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 group min-h-[240px] min-w-0"
                >
                  <div className="p-3 bg-red-100 rounded-full group-hover:bg-red-200 transition-colors duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-red-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3v18h18"></path>
                      <rect x="7" y="13" width="3" height="5"></rect>
                      <rect x="12" y="9" width="3" height="9"></rect>
                      <rect x="17" y="5" width="3" height="13"></rect>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 group-hover:text-red-600 transition-colors duration-300">Statistics</h3>
                  <p className="text-navy-700 text-center font-light">
                    Explore crime statistics and trends in your area.
                  </p>
                  <span className="text-red-600 font-medium group-hover:underline transition-all duration-300">
                    View Statistics &gt;
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}