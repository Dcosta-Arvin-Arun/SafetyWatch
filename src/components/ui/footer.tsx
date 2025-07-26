"use client";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";

export function Footer() {
  const { user } = useAuth();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.05 * i, duration: 0.5 }
    })
  };

  return (
    <footer className="bg-[#000040] text-white border-t border-blue-900/50">
      <div className="container mx-auto px-6 py-16 pb-0">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-9 h-9 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.0 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                SafetyWatch
              </span>
            </div>
            <p className="text-blue-200 text-lg leading-relaxed">
              Empowering communities through transparent safety reporting and awareness.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={1}
            className="space-y-6"
          >
            <h3 className="text-blue-100 font-semibold uppercase tracking-wider text-lg">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {/* Role-based footer links */}
              {user && user.role === "admin" ? (
                <>
                  <li>
                    <Link
                      href="/"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/reports/map"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Crime Map
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/stats"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Statistics
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/dashboard"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Admin Dashboard
                    </Link>
                  </li>
                </>
              ) : user && (!user.role || user.role === "user") ? (
                <>
                  <li>
                    <Link
                      href="/"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/reports/new"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Report Crime
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/reports/map"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Crime Map
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Dashboard
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/reports/new"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Report Crime
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/track"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Track
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/reports/map"
                      className="text-blue-300 hover:text-white transition-colors duration-300 text-base flex items-center"
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Crime Map
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={2}
            className="space-y-6"
          >
            <h3 className="text-blue-100 font-semibold uppercase tracking-wider text-lg">
              Contact
            </h3>
            <ul className="space-y-4 text-blue-300 text-base">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 mt-0.5 mr-2 text-blue-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                <div>
                  <p className="font-medium text-blue-100 text-base">Emergency</p>
                  <p className="text-base">112</p>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 mt-0.5 mr-2 text-blue-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
                <div>
                  <p className="font-medium text-blue-100 text-base">Non-Emergency</p>
                  <p className="text-base">100</p>
                </div>
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 mt-0.5 mr-2 text-blue-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                <div>
                  <p className="font-medium text-blue-100 text-base">Email</p>
                  <Link
                    href="mailto:info@safetywatch.example"
                    className="hover:text-white transition-colors duration-300 text-base"
                  >
                    info@safetywatch.example
                  </Link>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            custom={3}
            className="space-y-6"
          >
            <h3 className="text-blue-100 font-semibold uppercase tracking-wider text-lg">
              About
            </h3>
            <p className="text-blue-300 text-lg leading-relaxed">
              SafetyWatch is a community platform dedicated to making neighborhoods safer through collaborative reporting.
            </p>
          </motion.div>
        </div>
      </div>
      {/* Bottom copyright */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
        className="bg-[#23233a] h-14 border-t border-blue-900/50 w-full flex flex-col md:flex-row justify-center items-center text-white text-base px-6 mt-0 md:mt-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-center w-full gap-0">
          <span>© {new Date().getFullYear()} SafetyWatch. All rights reserved.</span>
          <span className="md:ml-2">By Pearl Arun Dcosta</span>
        </div>
      </motion.div>
    </footer>
  );
}