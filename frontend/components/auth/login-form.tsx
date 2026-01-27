"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", data);
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const userRole = response.data.user?.role;

      // Set cookie for middleware access (expires in 7 days)
      if (typeof document !== "undefined") {
        const date = new Date();
        date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = `user_role=${userRole}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
      }

      // Check for redirect parameter
      const search = typeof window !== 'undefined' ? window.location.search : "";
      const params = new URLSearchParams(search);
      const redirect = params.get("redirect");

      // Priority: Admin/Manager → Redirect param → Default account
      if (userRole === "ADMIN" || userRole === "MANAGER") {
        // Admin/Manager always goes to admin dashboard
        router.push("/admin");
      } else if (redirect) {
        // Regular users follow redirect if provided
        router.push(redirect);
      } else {
        // Default to account page
        router.push("/account");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Background */}
      <div className="absolute inset-0 bg-pink-600 rounded-3xl opacity-5 blur-3xl" />

      <Card className="relative border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8 pt-8">
          <div className="mx-auto mb-4 w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-pink-600">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Sign in to continue shopping
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-white bg-red-500 rounded-xl shadow-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Email Address</label>
              <Input
                type="email"
                {...register("email")}
                placeholder="your@email.com"
                className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className="h-12 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">New to Juelle Hair?</span>
              </div>
            </div>

            <Link href="/auth/register">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold rounded-xl transition-all duration-300"
              >
                Create Account
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

