"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/context/auth-context";
import { FaGoogle } from "react-icons/fa";

// Add prop type for onSuccess
interface LoginFormProps {
  onSuccess?: () => void;
}

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { login, signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const isAdminLogin = searchParams.get("admin") === "true";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      await login(values.email, values.password, isAdminLogin);
      toast.success("Login successful!");
      router.push("/");
    } catch (error: any) {
      // Only log unexpected errors
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        toast.error("Invalid email or password.");
      } else {
        toast.error(error.message || "Login failed. Please try again.");
      }
      // Clear password field on error
      form.setValue('password', '', { shouldValidate: false });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle(isAdminLogin);
      toast.success("Signed in with Google successfully!");
      router.push("/");
    } catch (error) {
      console.error("Google Sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {isAdminLogin ? "Admin Login" : "Login"}
        </CardTitle>
        <CardDescription className="text-center">
          {isAdminLogin
            ? "Enter admin credentials to access the dashboard"
            : "Enter your credentials to access your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading && !isGoogleLoading) {
              handleGoogleSignIn();
            }
          }}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            "Signing in..."
          ) : (
            <>
              <FaGoogle className="mr-2 h-4 w-4" />
              Sign in with Google
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-center text-sm">
          Do not have an account?{" "}
          <Link
            href={isAdminLogin ? "/register?admin=true" : "/register"}
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Register
          </Link>
        </div>
        {!isAdminLogin && (
          <div className="text-center text-sm">
            <Link
              href="/login?admin=true"
              className="text-muted-foreground hover:text-primary"
            >
              Continue as Admin
            </Link>
          </div>
        )}
        {isAdminLogin && (
          <div className="text-center text-sm">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-primary"
            >
              Continue as User
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
