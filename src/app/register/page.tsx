"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { MainNav } from "@/components/main-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaUserPlus, FaGoogle } from "react-icons/fa";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export default function RegisterPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { register, signInWithGoogle } = useAuth();
  const [registerAs, setRegisterAs] = useState<'user' | 'admin'>('user'); // New state: 'user' or 'admin'

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await register(formData.email, formData.password, formData.name, registerAs === 'admin');
      toast.success("Registration successful!");
      router.push("/"); // <-- redirect to homepage
    } catch (error: any) {
      toast.error(error.message || "Registration failed.");
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle(registerAs === 'admin'); // Pass isAdminRegistration
      toast.success("Registered with Google successfully!");
      router.push("/"); // <-- redirect to homepage
    } catch (error: any) {
      toast.error(error.message || "Google registration failed.");
    }
  };

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
              key="register-card"
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
                  <FaUserPlus className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400" />
                  <h2 className="mt-6 text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                    Create your account
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Join our community today
                  </p>
                </motion.div>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Input
                      id="name"
                      placeholder="Full Name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <Input
                      id="email"
                      placeholder="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Input
                      id="password"
                      placeholder="Password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <Input
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </motion.div>
                </div>

                {/* Register As Options */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-around"
                >
                  <Button
                    type="button"
                    variant={registerAs === 'user' ? 'default' : 'outline'}
                    onClick={() => setRegisterAs('user')}
                  >
                    Register as User
                  </Button>
                  <Button
                    type="button"
                    variant={registerAs === 'admin' ? 'default' : 'outline'}
                    onClick={() => setRegisterAs('admin')}
                  >
                    Register as Admin
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    type="submit"
                    className="relative w-full group"
                  >
                    <span className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center gap-2">
                      <FaUserPlus className="w-4 h-4" />
                      Register
                    </span>
                  </Button>
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="relative mt-6"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/90 dark:bg-gray-900/90 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="grid grid-cols-1 gap-3 mt-6"
              >
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                  type="button"
                  onClick={handleGoogleRegister}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleGoogleRegister();
                    }
                  }}
                >
                  <FaGoogle className="w-4 h-4" />
                  Google
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400"
              >
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Sign in
                </button>
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}