'use client'

import { useRef, useState } from 'react'
import type { ChatMessage } from '@/lib/types'

const STARTERS = [
  'Summarize what happened',
  'What evidence supports the timeline?',
  'Are there related incidents at other sites?',
  'What should the next investigative step be?',
]

const EVIDENCE_REFS = ['ev-002 Badge denial log', 'ev-001 Camera C4 clip']

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  async function send(text: string) {
    const content = text.trim()
    if (!content || streaming) return

    const userMsg: ChatMessage = { role: 'user', content }
    const nextMessages = [...messages, userMsg]
    setMessages([...nextMessages, { role: 'assistant', content: '' }])
    setInput('')
    setStreaming(true)
    scrollToBottom()

    try {
      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: 'case-001',
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Request failed')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            role: 'assistant',
            content: acc,
            citedEvidenceIds: EVIDENCE_REFS,
          }
          return copy
        })
        scrollToBottom()
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = {
          role: 'assistant',
          content:
            '⚠️ Unable to reach the investigation agent. Verify ANTHROPIC_API_KEY is configured in .env.local.',
        }
        return copy
      })
    } finally {
      setStreaming(false)
      scrollToBottom()
    }
  }

  return (
    <div className="flex h-[480px] flex-col">
      {/* Disclaimer */}
      <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#F5F3FF] px-3 py-2 text-[11px] font-medium text-[#7C3AED]">
        <span>🔒</span>
        Answers are scoped to Case-001 evidence only.
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="text-3xl">🤖</span>
            <p className="mt-3 text-sm font-semibold text-[#374151]">
              Case Investigation Assistant
            </p>
            <p className="mt-1 max-w-xs text-xs text-[#9CA3AF]">
              Ask about the evidence, timeline, or related activity. Try a
              starter question below.
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                  m.role === 'user'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white ring-1 ring-[#E5E7EB]'
                }`}
              >
                {m.role === 'user' ? '🧑' : '🤖'}
              </span>
              <div
                className={`max-w-[78%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-white text-[#374151] ring-1 ring-[#E5E7EB]'
                }`}
              >
                {m.content ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9CA3AF] [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#9CA3AF]" />
                  </span>
                )}
                {m.role === 'assistant' &&
                  m.content &&
                  m.citedEvidenceIds &&
                  m.citedEvidenceIds.length > 0 && (
                    <p className="mt-2 border-t border-[#F1F5F9] pt-1.5 text-[10px] text-[#9CA3AF]">
                      Citing: {m.citedEvidenceIds.join(' · ')}
                    </p>
                  )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Starter chips */}
      {messages.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-[#7C3AED] hover:text-[#7C3AED]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="mt-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Case-001 evidence…"
          disabled={streaming}
          className="flex-1 rounded-lg border border-[#D1D5DB] px-3.5 py-2.5 text-sm outline-none focus:border-[#7C3AED] disabled:bg-[#F9FAFB]"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="rounded-lg bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {streaming ? '…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
