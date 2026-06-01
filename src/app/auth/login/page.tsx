"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ticket, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Local authentication for development
    if (email === "dev@ticketin.co.id" && password === "Ticketin123@") {
      // Simulate login success - redirect to dashboard (to be created)
      router.push("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6 selection:bg-primary/10 selection:text-primary dark:bg-zinc-950">
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 transition-transform hover:rotate-6">
            <Ticket className="h-6 w-6 text-white" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              placeholder="name@company.com" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                className="pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-primary">{error}</p>}

          <Button type="submit" className="h-11 w-full rounded-xl bg-zinc-900 dark:bg-white dark:text-zinc-900 shadow-lg shadow-zinc-200 dark:shadow-none transition-all active:scale-95">
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
