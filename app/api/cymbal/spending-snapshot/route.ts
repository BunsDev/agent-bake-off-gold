import { NextRequest } from 'next/server';

interface SpendingSnapshotData {
  activities: string[];
  income: number;
  expenses: number;
  insights: string;
}

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
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Create ADK session for the cymbal agent
    const sessionResponse = await fetch(`http://localhost:8081/apps/cymbal/users/${userId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: {} })
    });

    if (!sessionResponse.ok) {
      throw new Error(`Failed to create ADK session: ${sessionResponse.status}`);
    }

    const session: ADKSessionResponse = await sessionResponse.json();

    // 2. Send message to cymbal agent to get spending summary
    const agentRequest: ADKAgentRequest = {
      app_name: 'cymbal',
      user_id: userId,
      session_id: session.id,
      new_message: {
        role: 'user',
        parts: [{ text: `Get spending summary for ${userId}` }]
      },
      streaming: false
    };

    const agentResponse = await fetch(`http://localhost:8081/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentRequest)
    });

    if (!agentResponse.ok) {
      throw new Error(`ADK agent request failed: ${agentResponse.status}`);
    }

    const agentData = await agentResponse.json();

    // 3. Parse and transform the response to expected format
    // The agent should return the data in the expected format:
    // { activities: string[], income: number, expenses: number, insights: string }
    const spendingData: SpendingSnapshotData = {
      activities: agentData.activities || [],
      income: agentData.income || 0,
      expenses: agentData.expenses || 0,
      insights: agentData.insights || ''
    };

    return Response.json(spendingData);

  } catch (error) {
    console.error('ADK spending snapshot error:', error);
    
    return Response.json(
      { 
        error: 'Failed to fetch spending data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
