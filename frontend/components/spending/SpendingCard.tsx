import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpendingCardProps {
  title: string;
  amount: number;
  variant: "success" | "destructive";
}

export function SpendingCard({ title, amount, variant }: SpendingCardProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getIcon = () => {
    if (variant === "success") {
      return (
        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
      );
    } else if (variant === "destructive") {
      return (
        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
      );
    }
    return <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
  };

  const getIconBackground = () => {
    if (variant === "success") {
      return "bg-green-100 dark:bg-green-900/20";
    } else if (variant === "destructive") {
      return "bg-red-100 dark:bg-red-900/20";
    }
    return "bg-gray-100 dark:bg-gray-900/20";
  };

  const getAmountColor = () => {
    if (variant === "success") {
      return "text-green-600 dark:text-green-400";
    } else if (variant === "destructive") {
      return "text-red-600 dark:text-red-400";
    }
    return "text-foreground";
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p
              className={cn(
                "text-2xl font-bold tracking-tight",
                getAmountColor()
              )}
            >
              {formatCurrency(amount)}
            </p>
          </div>
          <div
            className={cn(
              "p-3 rounded-full transition-colors",
              getIconBackground()
            )}
          >
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
