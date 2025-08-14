"use client";

import { useState, useEffect, useCallback } from "react";
import { SpendingSnapshotData } from "@/lib/types/spending";
import { SpendingCard } from "./SpendingCard";
import { ActivitiesList } from "./ActivitiesList";
import { InsightsCard } from "./InsightsCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SpendingSnapshotProps {
  userId: string;
  onDataLoaded?: (data: SpendingSnapshotData) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

export function SpendingSnapshot({
  userId,
  onDataLoaded,
  onLoadingStateChange,
}: SpendingSnapshotProps) {
  const [data, setData] = useState<SpendingSnapshotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpendingData = useCallback(async () => {
    try {
      setIsLoading(true);
      onLoadingStateChange?.(true);
      setError(null);

      console.log("[FRONTEND] 🚀 Fetching spending data for userId:", userId);

      const response = await fetch("/api/cymbal/spending-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      console.log("[FRONTEND] 📡 API response status:", response.status);
      console.log(
        "[FRONTEND] 📡 API response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        console.log(
          "[FRONTEND] ❌ API request failed with status:",
          response.status
        );
        const errorData = await response.json().catch(() => ({}));
        console.log("[FRONTEND] ❌ Error response data:", errorData);
        throw new Error(
          errorData.message || `Request failed: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("[FRONTEND] ✅ API response received:");
      console.log("[FRONTEND] ✅ Response data type:", typeof result);
      console.log(
        "[FRONTEND] ✅ Response data keys:",
        result ? Object.keys(result) : "no keys"
      );
      console.log(
        "[FRONTEND] ✅ Full response data:",
        JSON.stringify(result, null, 2)
      );

      setData(result);
      onDataLoaded?.(result);
      console.log("[FRONTEND] ✅ Data set in component state");
      console.log("[FRONTEND] ✅ Component will re-render with new data");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to load spending data: ${errorMessage}`);
      console.error("[FRONTEND] ❌ Spending data fetch error:", err);
    } finally {
      setIsLoading(false);
      onLoadingStateChange?.(false);
    }
  }, [userId, onLoadingStateChange, onDataLoaded]);

  useEffect(() => {
    if (userId) {
      fetchSpendingData();
    }
  }, [userId, fetchSpendingData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading spending data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSpendingData}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Success state - render the dashboard
  console.log("[FRONTEND] 🎨 Rendering dashboard with data:");
  console.log("[FRONTEND] 🎨 Income:", data?.income);
  console.log("[FRONTEND] 🎨 Expenses:", data?.expenses);
  console.log("[FRONTEND] 🎨 Activities count:", data?.activities?.length);
  console.log("[FRONTEND] 🎨 Activities:", data?.activities);
  console.log("[FRONTEND] 🎨 Insights length:", data?.insights?.length);
  console.log(
    "[FRONTEND] 🎨 Insights preview:",
    data?.insights?.substring(0, 100)
  );

  return (
    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
      {/* Income and Expenses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SpendingCard
          title="Income"
          amount={data?.income || 0}
          variant="success"
        />
        <SpendingCard
          title="Expenses"
          amount={data?.expenses || 0}
          variant="destructive"
        />
      </div>

      {/* Activities List */}
      <ActivitiesList activities={data?.activities || []} />

      {/* Financial Insights */}
      <InsightsCard insights={data?.insights || ""} />
    </div>
  );
}
