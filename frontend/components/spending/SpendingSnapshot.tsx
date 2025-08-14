"use client";

import { useState, useEffect } from "react";
import { SpendingSnapshotData } from "@/lib/types/spending";
import { SpendingCard } from "./SpendingCard";
import { ActivitiesList } from "./ActivitiesList";
import { InsightsCard } from "./InsightsCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SpendingSnapshotProps {
  userId: string;
}

export function SpendingSnapshot({ userId }: SpendingSnapshotProps) {
  const [data, setData] = useState<SpendingSnapshotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpendingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/cymbal/spending-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load spending data: ${errorMessage}`);
      console.error('Spending data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSpendingData();
    }
  }, [userId]);

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
      <InsightsCard insights={data?.insights || ''} />
    </div>
  );
}
