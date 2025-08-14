"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!username.trim()) {
      setError("Please enter a username");
      setIsLoading(false);
      return;
    }

    // Attempt login
    const success = login(username.trim());

    if (success) {
      // Redirect to spending page
      router.push("/spending");
    } else {
      setError("Invalid username. Please use: user-001, user-002, or user-003");
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome Back
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Enter your username to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (user-001, user-002, user-003)"
                className={
                  error ? "border-destructive focus:ring-destructive" : ""
                }
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Valid usernames: user-001, user-002, user-003
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
