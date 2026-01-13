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
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/auth/forgot-password", data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="relative w-full max-w-md mx-auto">
          {/* Background */}
          <div className="absolute inset-0 bg-pink-600 rounded-3xl opacity-5 blur-3xl" />
          
          <Card className="relative border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-8 pt-8">
              <div className="mx-auto mb-4 w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-pink-600">
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {success 
                  ? "Check your email for reset instructions" 
                  : "Enter your email and we'll send you a reset link"}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {success ? (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-900 mb-1">
                          Reset Link Sent!
                        </p>
                        <p className="text-sm text-green-700">
                          If that email exists in our system, a password reset link has been sent. Please check your inbox and follow the instructions.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Link href="/auth/login">
                      <Button 
                        type="button"
                        className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                      </Button>
                    </Link>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSuccess(false);
                        setError("");
                      }}
                      className="w-full h-12 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all"
                    >
                      Send Another Email
                    </Button>
                  </div>
                </div>
              ) : (
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
                      className="h-12 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
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
                        Sending...
                      </span>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  <div className="text-center">
                    <Link 
                      href="/auth/login"
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
