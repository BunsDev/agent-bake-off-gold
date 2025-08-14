import { ChatMessage } from "@/lib/types/chat";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserMessageProps {
  message: ChatMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-start gap-3 max-w-[80%]">
        <Card
          className={cn(
            "bg-primary text-primary-foreground",
            "shadow-sm border-primary"
          )}
        >
          <CardContent className="px-4 py-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-primary-foreground/20">
              <span className="text-xs opacity-75">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
}
