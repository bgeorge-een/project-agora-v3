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

function Icon({
  name,
  size = 18,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={`material-symbols-outlined ${className ?? ''}`}
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
    >
      {name}
    </span>
  )
}

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
            'Unable to reach the investigation agent. Verify ANTHROPIC_API_KEY is configured in .env.local.',
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
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#273142] bg-[#111827] px-3 py-2 text-xs font-medium text-[#9CA3AF]">
        <Icon name="lock" size={14} />
        Answers are scoped to Case-001 evidence only.
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-[#273142] bg-[#0F1117] p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Icon name="smart_toy" size={36} className="text-[#94A3B8]" />
            <p className="mt-3 text-sm font-semibold text-white">
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
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  m.role === 'user'
                    ? 'bg-[#243048] text-white'
                    : 'bg-[#171D29] text-[#9CA3AF] ring-1 ring-[#273142]'
                }`}
              >
                <Icon name={m.role === 'user' ? 'person' : 'smart_toy'} size={16} />
              </span>
              <div
                className={`max-w-[78%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#243048] text-white'
                    : 'bg-[#171D29] text-[#CBD5E0] ring-1 ring-[#273142]'
                }`}
              >
                {m.content ? (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                ) : (
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B7280] [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B7280] [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B7280]" />
                  </span>
                )}
                {m.role === 'assistant' &&
                  m.content &&
                  m.citedEvidenceIds &&
                  m.citedEvidenceIds.length > 0 && (
                    <p className="mt-2 border-t border-[#273142] pt-1.5 text-xs text-[#94A3B8]">
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
              className="rounded-full border border-[#273142] bg-[#171D29] px-3 py-1.5 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#4B5563] hover:text-white"
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
          className="flex-1 rounded-lg border border-[#273142] bg-[#171D29] px-3.5 py-2.5 text-sm text-[#E5E7EB] outline-none placeholder:text-[#94A3B8] focus:border-[#7C3AED] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {streaming ? (
            <Icon name="more_horiz" size={18} />
          ) : (
            <>
              <Icon name="send" size={16} /> Send
            </>
          )}
        </button>
      </form>
    </div>
  )
}
