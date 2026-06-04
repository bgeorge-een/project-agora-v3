import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { stats } = await req.json()

  const systemPrompt = `You are the Agora executive briefing agent. You write concise, leadership-ready security operations briefs for a physical security intelligence platform.

Current operating picture:
- Open Cases: 1 (Case-001: Unauthorized server room access — Marcus Webb, Austin HQ, CRITICAL)
- Active Campaigns: 1 (HXT-7291 Multi-Site Activity — links Austin HQ access probing and Cedar Park Warehouse tailgating)
- Compliance Score: 94%
- AI Quality: 87% (feedback breakdown: 77% correct overrides, 12% model problem, 8% policy gap, 3% data quality)
- Risk by site: Austin HQ CRITICAL, Dallas Office MEDIUM, Cedar Park Warehouse LOW

${stats ? `Supplied metrics: ${JSON.stringify(stats)}` : ''}

Write a brief with these sections using markdown headers (##):
## Operating Picture
## Priority Risks
## Compliance & AI Quality
## Recommended Leadership Actions

Keep the entire brief under 280 words. Be direct, executive in tone, no fluff.`

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 700,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: 'Generate this week’s executive security operations brief.',
      },
    ],
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
