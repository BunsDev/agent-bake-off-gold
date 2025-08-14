export interface ChatMessage {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  currentStreamingMessage: string;
}

export interface SSEEvent {
  type: "session" | "content" | "error";
  sessionId?: string;
  text?: string;
  timestamp?: number;
  error?: string;
}
