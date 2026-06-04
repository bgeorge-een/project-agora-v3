import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { alert } = await req.json()

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 500,
    system: `You are the Agora AI enrichment agent for a physical security SOC. Given an alert, return a JSON object with exactly these fields:
{
  "recommendedAction": "string — specific operational action to take RIGHT NOW to contain or stop the threat (not 'create a case')",
  "confidence": number between 0.65 and 0.95,
  "urgency": "immediate" | "high" | "medium" | "low",
  "responsePhase": "contain" | "communicate" | "document",
  "rationale": "string — 2-3 sentences explaining why this action, what the threat is, what happens if not acted on",
  "alternatives": ["string", "string"],
  "autoExecuteActions": ["string", "string", "string"],
  "gatedActions": ["string", "string"]
}

Rules:
- recommendedAction should be CONTAINMENT-FIRST (stop the threat, not documentation)
- autoExecuteActions: notifications, evidence locking, logging — things that can happen immediately
- gatedActions: physical actions requiring human approval (lock doors, restrict badges, contact LEA)
- Return ONLY valid JSON, no other text`,
    messages: [
      {
        role: 'user',
        content: `Alert: title="${alert.title}", location="${alert.location}", sources=${JSON.stringify(alert.sources)}, type=${alert.type}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'No text response' }, { status: 500 })
  }

  try {
    const nba = JSON.parse(content.text)
    return NextResponse.json(nba)
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse NBA', raw: content.text },
      { status: 500 }
    )
  }
}
