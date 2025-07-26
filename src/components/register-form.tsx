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

interface RegisterFormProps {
  onSuccess?: () => void;
}

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { register, signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const isAdminRegister = searchParams.get("admin") === "true";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      await register(
        values.email,
        values.password,
        values.name,
        isAdminRegister
      );
      toast.success("Registration successful! You are now logged in.");
      router.push("/");
      onSuccess?.();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle(isAdminRegister);
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
          {isAdminRegister ? "Admin Registration" : "Register"}
        </CardTitle>
        <CardDescription className="text-center">
          {isAdminRegister
            ? "Create an admin account to manage reports"
            : "Create an account to report and track incidents"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
                      autoComplete="new-password"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      autoComplete="new-password"
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
              {isLoading ? "Creating account..." : "Create Account"}
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
              Sign up with Google
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href={isAdminRegister ? "/login?admin=true" : "/login"}
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Login
          </Link>
        </div>
        {!isAdminRegister && (
          <div className="text-center text-sm">
            <Link
              href="/register?admin=true"
              className="text-muted-foreground hover:text-primary"
            >
              Register as Admin
            </Link>
          </div>
        )}
        {isAdminRegister && (
          <div className="text-center text-sm">
            <Link
              href="/register"
              className="text-muted-foreground hover:text-primary"
            >
              Register as User
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
