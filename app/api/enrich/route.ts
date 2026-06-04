import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { alert } = await req.json()

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    system: `You are the Agora enrichment agent. Given an alert, produce a brief JSON response with:
- "recommendedAction": string (one clear action)
- "confidence": number 0-1
- "rationale": string (2-3 sentences max)
- "explanation": string (why this alert fired, 1-2 sentences)
Respond with only valid JSON.`,
    messages: [{ role: 'user', content: `Alert: ${JSON.stringify(alert)}` }],
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
