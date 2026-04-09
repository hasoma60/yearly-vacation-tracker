"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
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
import { Loader2, Palmtree } from "lucide-react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : flow === "signIn"
            ? "Sign in failed. Please check your credentials."
            : "Sign up failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50 shadow-2xl">
      <CardHeader className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <Palmtree className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Vacation Tracker
        </CardTitle>
        <CardDescription>
          {flow === "signIn"
            ? "Sign in to manage your vacations"
            : "Create your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="flow" type="hidden" value={flow} />
          {flow === "signUp" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={
                flow === "signIn" ? "Enter your password" : "Create a password"
              }
              required
              autoComplete={
                flow === "signIn" ? "current-password" : "new-password"
              }
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {flow === "signIn" ? "Signing in..." : "Creating account..."}
              </>
            ) : flow === "signIn" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            >
              {flow === "signIn"
                ? "First time? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
