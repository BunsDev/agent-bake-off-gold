import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ActivitiesListProps {
  activities: string[];
}

export function ActivitiesList({ activities }: ActivitiesListProps) {
  // Convert activities array to markdown bullet list
  const markdownList = activities.length > 0 
    ? activities.map(activity => `- ${activity}`).join('\n')
    : '';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {activities.length > 0 ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                ul: ({ children }) => (
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1.5 text-xs">•</span>
                    <span className="flex-1">{children}</span>
                  </li>
                )
              }}
            >
              {markdownList}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">
              No recent activities to display
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
