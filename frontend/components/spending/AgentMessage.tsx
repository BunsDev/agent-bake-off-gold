import { ChatMessage } from "@/lib/types/chat";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface AgentMessageProps {
  message: ChatMessage;
}

export function AgentMessage({ message }: AgentMessageProps) {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3 max-w-[80%]">
        <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-full flex items-center justify-center">
          {message.streaming ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Bot className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <Card className={cn("bg-muted/50 border-muted", "shadow-sm")}>
          <CardContent className="px-4 py-3">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  // Customize paragraph styling
                  p: ({ children }) => (
                    <p className="text-sm leading-relaxed mb-3 last:mb-0 text-foreground">
                      {children}
                    </p>
                  ),
                  // Customize list styling
                  ul: ({ children }) => (
                    <ul className="text-sm space-y-1 mb-3 ml-4 list-disc text-foreground">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="text-sm space-y-1 mb-3 ml-4 list-decimal text-foreground">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground">{children}</li>
                  ),
                  // Customize emphasis
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-foreground">{children}</em>
                  ),
                  // Customize code styling
                  code: ({ children, className }) => {
                    // Inline code
                    if (!className) {
                      return (
                        <code className="bg-background px-1.5 py-0.5 rounded text-xs font-mono border">
                          {children}
                        </code>
                      );
                    }
                    // Code blocks
                    return (
                      <code className="block bg-background p-3 rounded border text-xs font-mono overflow-x-auto">
                        {children}
                      </code>
                    );
                  },
                  // Customize headings
                  h1: ({ children }) => (
                    <h1 className="text-lg font-semibold mb-2 text-foreground">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold mb-2 text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mb-1 text-foreground">
                      {children}
                    </h3>
                  ),
                  // Customize blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {!message.streaming && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-muted-foreground/20">
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
