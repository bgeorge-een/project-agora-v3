import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { messages, caseId } = await req.json()

  const systemPrompt = `You are a case investigation AI assistant for Case ${caseId}: "Unauthorized server room access — Marcus Webb". You are strictly scoped to the evidence in this case.

Evidence summary:
- Marcus Webb (Badge B-4421, Contractor) attempted access to Server Room 2B at Austin HQ twice: 14:34 and 14:38 on 2026-06-04. Both denied (insufficient clearance, Level 4+ required).
- Camera C4 confirmed his presence in the corridor. He lingered 4 min 12 sec after first denial.
- He exited via Stairwell B at 14:40.
- No work order found for Floor 3 on that date.
- Badge B-4421 is linked to Campaign HXT-7291 (multi-site activity).

Rules:
- Only answer based on the evidence above
- If asked about something not in evidence, say "That information is not in the case evidence — consider it an open question"
- Always cite which evidence you're drawing from
- Keep answers under 120 words
- Be precise and investigative in tone`

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
