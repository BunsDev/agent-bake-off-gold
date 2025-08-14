"use client";

import { useState } from "react";
import { SplitView } from "../../../components/layout/SplitView";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { SpendingSnapshot } from "@/components/spending/SpendingSnapshot";
import { SpendingChat } from "@/components/spending/SpendingChat";
import { SpendingSnapshotData } from "@/lib/types/spending";

export default function SpendingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Shared state for snapshot and chat coordination
  const [snapshotLoaded, setSnapshotLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_snapshotData, setSnapshotData] =
    useState<SpendingSnapshotData | null>(null);

  // Show loading state while authentication is being restored
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (only after loading is complete)
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
          <SpendingSnapshot
            userId={user?.username || ""}
            onDataLoaded={(data) => {
              setSnapshotData(data);
              setSnapshotLoaded(true);
            }}
            onLoadingStateChange={(loading) => {
              if (!loading) {
                // Additional logic can go here if needed
              }
            }}
          />
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
          <SpendingChat
            userId={user?.username || ""}
            isEnabled={snapshotLoaded}
          />
        </div>
      }
    />
  );
}
