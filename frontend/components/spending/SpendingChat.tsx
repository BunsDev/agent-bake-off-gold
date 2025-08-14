"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ChatMessage, ChatState, SSEEvent } from "@/lib/types/chat";

import { UserMessage } from "./UserMessage";
import { AgentMessage } from "./AgentMessage";
import { ChatInput } from "./ChatInput";
import { Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface SpendingChatProps {
  userId: string;
  isEnabled: boolean; // Chat appears after snapshot loads
}

export function SpendingChat({ userId, isEnabled }: SpendingChatProps) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: null,
    currentStreamingMessage: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.currentStreamingMessage]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || chatState.isLoading) {
        return;
      }

      console.log("[CHAT] 🚀 Sending message:", message);

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: message.trim(),
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
        currentStreamingMessage: "",
      }));

      try {
        // Send message to API (simple body structure)
        const response = await fetch("/api/cymbal/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            message: message.trim(),
            ...(chatState.sessionId && { sessionId: chatState.sessionId }),
          }),
        });

        if (!response.ok) {
          throw new Error(`Chat request failed: ${response.status}`);
        }

        console.log("[CHAT] ✅ SSE stream initiated");

        // Process SSE stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response stream available");
        }

        const agentMessageId = `agent-${Date.now()}`;
        let streamingContent = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log("[CHAT] ✅ SSE stream completed");
            break;
          }

          const chunk = new TextDecoder().decode(value);
          console.log("[CHAT] 📦 Received SSE chunk:", chunk.substring(0, 100));

          // Parse SSE events
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const eventData: SSEEvent = JSON.parse(line.slice(6));
                console.log("[CHAT] 🔍 Processing SSE event:", eventData.type);

                if (eventData.type === "session" && eventData.sessionId) {
                  // Store session ID for subsequent messages
                  setChatState((prev) => ({
                    ...prev,
                    sessionId: eventData.sessionId!,
                  }));
                  console.log(
                    "[CHAT] 📋 Session ID stored:",
                    eventData.sessionId
                  );
                } else if (eventData.type === "content" && eventData.text) {
                  // Accumulate streaming content
                  streamingContent += eventData.text;

                  setChatState((prev) => ({
                    ...prev,
                    currentStreamingMessage: streamingContent,
                  }));

                  console.log(
                    "[CHAT] 💬 Streaming content updated, length:",
                    streamingContent.length
                  );
                } else if (eventData.type === "error") {
                  throw new Error(eventData.error || "Stream error");
                }
              } catch {
                console.log(
                  "[CHAT] ⚠️ Could not parse SSE event:",
                  line.substring(0, 100)
                );
              }
            }
          }
        }

        // Finalize agent message when streaming completes
        if (streamingContent.trim()) {
          const agentMessage: ChatMessage = {
            id: agentMessageId,
            type: "agent",
            content: streamingContent.trim(),
            timestamp: new Date(),
          };

          setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages, agentMessage],
            isLoading: false,
            currentStreamingMessage: "",
          }));

          console.log("[CHAT] ✅ Agent message finalized");
        } else {
          console.log("[CHAT] ⚠️ No content received from agent");
          setChatState((prev) => ({
            ...prev,
            isLoading: false,
            currentStreamingMessage: "",
            error: "No response received from agent",
          }));
        }
      } catch (error) {
        console.error("[CHAT] ❌ Chat error:", error);

        setChatState((prev) => ({
          ...prev,
          isLoading: false,
          currentStreamingMessage: "",
          error:
            error instanceof Error ? error.message : "Failed to send message",
        }));
      }
    },
    [userId, chatState.sessionId, chatState.isLoading]
  );

  // Don't render chat until snapshot is loaded
  if (!isEnabled) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p>Loading spending data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (chatState.error) {
    return (
      <div className="flex-1 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {chatState.error}
            <button
              onClick={() => setChatState((prev) => ({ ...prev, error: null }))}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-primary" />
            Spending Assistant
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatState.messages.length === 0 && !chatState.isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p>
              Ask me anything about your spending habits, financial insights, or
              recommendations!
            </p>
          </div>
        ) : (
          <>
            {chatState.messages.map((message) =>
              message.type === "user" ? (
                <UserMessage key={message.id} message={message} />
              ) : (
                <AgentMessage key={message.id} message={message} />
              )
            )}

            {/* Show streaming message */}
            {chatState.currentStreamingMessage && (
              <AgentMessage
                message={{
                  id: "streaming",
                  type: "agent",
                  content: chatState.currentStreamingMessage,
                  timestamp: new Date(),
                  streaming: true,
                }}
              />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0 border-t bg-background">
        <ChatInput
          onSendMessage={sendMessage}
          disabled={chatState.isLoading}
          isLoading={chatState.isLoading}
        />
      </div>
    </div>
  );
}
