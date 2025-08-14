import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface InsightsCardProps {
  insights: string;
}

export function InsightsCard({ insights }: InsightsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {insights && insights.trim() ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 last:mb-0">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-foreground/90">
                    {children}
                  </em>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1.5 text-xs">•</span>
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                )
              }}
            >
              {insights}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">
              No insights available at this time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
