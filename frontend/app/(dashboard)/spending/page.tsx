"use client";

import { SplitView } from "../../../components/layout/SplitView";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { SpendingSnapshot } from "@/components/spending/SpendingSnapshot";

export default function SpendingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

  return (
    <SplitView
      leftPanel={
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Spending Analytics
            </h2>
            <p className="text-muted-foreground">
              Welcome back, {user?.username}!
            </p>
          </div>
          <SpendingSnapshot userId={user?.username || ""} />
        </div>
      }
      rightPanel={
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Chat with Spending Agent
            </h2>
            <p className="text-muted-foreground">
              Ask questions about your spending patterns
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">
                Chat interface will go here
              </p>
            </div>
          </div>
        </div>
      }
    />
  );
}
