import { NextRequest } from "next/server";

interface ADKSessionResponse {
  id: string;
  appName: string;
  userId: string;
  state: Record<string, unknown>;
  events: unknown[];
  lastUpdateTime: number;
}

interface ADKAgentRequest {
  app_name: string;
  user_id: string;
  session_id: string;
  new_message: {
    role: string;
    parts: Array<{ text: string }>;
  };
  streaming: boolean;
}

export async function POST(request: NextRequest): Promise<Response> {
  console.log("[ADK CHAT] 🚀 Starting chat request...");

  try {
    const { userId, message, sessionId } = await request.json();
    console.log("[ADK CHAT] 📋 Request data:", {
      userId,
      message,
      hasSessionId: !!sessionId,
    });

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    let currentSessionId = sessionId;

    // If no session provided, create new session with initial state
    if (!currentSessionId) {
      console.log(
        "[ADK CHAT] 🆕 Creating new ADK session with spending context..."
      );

      try {
        // Try to get current spending snapshot for context
        const snapshotResponse = await fetch(
          `http://localhost:3000/api/cymbal/spending-snapshot`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          }
        );

        let contextData = null;
        if (snapshotResponse.ok) {
          contextData = await snapshotResponse.json();
          console.log("[ADK CHAT] 📊 Snapshot context retrieved for session");
        } else {
          console.log(
            "[ADK CHAT] ⚠️ Could not retrieve snapshot context, proceeding without"
          );
        }

        // Create session with initial state containing topic and context
        const sessionState = {
          topic: "spending",
          ...(contextData && { contextData }),
        };

        console.log("[ADK CHAT] 📡 Creating session with state:", sessionState);

        const sessionResponse = await fetch(
          `http://localhost:8081/apps/spending_snapshot_agent/users/${userId}/sessions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: sessionState }),
          }
        );

        if (!sessionResponse.ok) {
          throw new Error(
            `Failed to create ADK session: ${sessionResponse.status}`
          );
        }

        const session: ADKSessionResponse = await sessionResponse.json();
        currentSessionId = session.id;

        console.log("[ADK CHAT] ✅ ADK session created:", currentSessionId);
        console.log("[ADK CHAT] 📋 Session details:", {
          id: session.id,
          appName: session.appName,
          userId: session.userId,
          stateKeys: Object.keys(session.state),
        });
      } catch (sessionError) {
        console.error("[ADK CHAT] ❌ Session creation failed:", sessionError);
        // Continue without context if session creation fails
        const fallbackResponse = await fetch(
          `http://localhost:8081/apps/spending_snapshot_agent/users/${userId}/sessions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state: { topic: "spending" } }),
          }
        );

        if (!fallbackResponse.ok) {
          throw new Error("Failed to create fallback ADK session");
        }

        const fallbackSession: ADKSessionResponse =
          await fallbackResponse.json();
        currentSessionId = fallbackSession.id;
        console.log(
          "[ADK CHAT] ⚠️ Created fallback session without context:",
          currentSessionId
        );
      }
    }

    // Send message to ADK agent with SSE streaming
    console.log("[ADK CHAT] 🤖 Sending message to ADK agent...");
    const agentRequest: ADKAgentRequest = {
      app_name: "spending_snapshot_agent",
      user_id: userId,
      session_id: currentSessionId,
      new_message: {
        role: "user",
        parts: [{ text: message }],
      },
      streaming: true, // Enable SSE streaming
    };

    console.log("[ADK CHAT] 📡 Agent request details:", {
      app_name: agentRequest.app_name,
      user_id: agentRequest.user_id,
      session_id: agentRequest.session_id,
      message_preview: message.substring(0, 50),
      streaming: agentRequest.streaming,
    });

    const agentResponse = await fetch(`http://localhost:8081/run_sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agentRequest),
    });

    if (!agentResponse.ok) {
      throw new Error(`ADK agent SSE request failed: ${agentResponse.status}`);
    }

    console.log("[ADK CHAT] ✅ ADK agent SSE stream initiated");

    // Create SSE response stream for client
    const stream = new ReadableStream({
      start(controller) {
        console.log("[ADK CHAT] 🌊 Starting SSE stream to client...");

        // Send session ID to client first
        const sessionData = `data: ${JSON.stringify({
          type: "session",
          sessionId: currentSessionId,
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(sessionData));

        // Process ADK agent SSE stream
        const reader = agentResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) {
                console.log("[ADK CHAT] ✅ ADK stream completed");
                controller.close();
                break;
              }

              const chunk = new TextDecoder().decode(value);
              console.log(
                "[ADK CHAT] 📦 Received chunk from ADK:",
                chunk.substring(0, 100)
              );

              // Parse ADK SSE events and extract content
              const lines = chunk.split("\n");
              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const eventData = JSON.parse(line.slice(6));
                    console.log("[ADK CHAT] 🔍 Parsing ADK event:", {
                      hasContent: !!eventData.content,
                      hasActions: !!eventData.actions,
                      contentParts: eventData.content?.parts?.length || 0,
                    });

                    // Extract text content from ADK event
                    if (eventData.content?.parts) {
                      for (const part of eventData.content.parts) {
                        if (part.text) {
                          console.log(
                            "[ADK CHAT] 💬 Forwarding text content:",
                            part.text.substring(0, 50)
                          );

                          // Forward as SSE to client
                          const clientData = `data: ${JSON.stringify({
                            type: "content",
                            text: part.text,
                            timestamp: Date.now(),
                          })}\n\n`;

                          controller.enqueue(
                            new TextEncoder().encode(clientData)
                          );
                        }
                      }
                    }
                  } catch {
                    console.log(
                      "[ADK CHAT] ⚠️ Could not parse ADK event data:",
                      line.substring(0, 100)
                    );
                  }
                }
              }
            }
          } catch (streamError) {
            console.error(
              "[ADK CHAT] ❌ Stream processing error:",
              streamError
            );
            controller.error(streamError);
          }
        };

        processStream();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("[ADK CHAT] ❌ Chat request error:", error);

    return Response.json(
      {
        error: "Failed to process chat request",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
