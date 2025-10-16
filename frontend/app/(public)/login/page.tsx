"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Syringe } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = (error as Error).message || "Login failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen flex items-center justify-center px-4 sm:px-6">
      {/* Brand background (subtle) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-blue-50 to-white" />
      <div className="absolute -top-24 -right-16 h-[22rem] w-[22rem] rounded-full bg-blue-200/20 blur-3xl" />
      <div className="absolute -bottom-28 -left-10 h-[20rem] w-[20rem] rounded-full bg-emerald-200/20 blur-3xl" />

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="mx-auto h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-600 flex items-center justify-center">
            <Syringe className="h-5 w-5 text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Wan Ofi Pharmacy</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your pharmacy workspace
          </p>
        </div>

        {/* Auth card */}
        <Card className="overflow-hidden shadow-lg">
          {/* Gradient accent */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Use your email and password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-gray-600">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                  Keep me signed in
                </label>
                <Link href="/forgot-password" className="text-blue-700 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By continuing you agree to our{" "}
                <Link href="/terms" className="underline hover:text-gray-700">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-gray-700">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Sign up hint */}
        <p className="mt-4 text-center text-sm text-gray-600">
          New to Wan Ofi Pharmacy?{" "}
          <Link href="/login" className="text-blue-700 hover:text-blue-800 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
