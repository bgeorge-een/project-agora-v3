'use client'

import { useRef, useState } from 'react'
import type { FeedbackRecord } from '@/lib/types'
import { MOCK_CAMPAIGNS } from '@/lib/mock-data/scenarios'

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

// ---- Stat cards ----
const STATS = [
  { label: 'Open Cases', value: '1', accent: '#7C3AED', icon: 'folder_open' },
  { label: 'Active Campaigns', value: '1', accent: '#38BDF8', icon: 'hub' },
  {
    label: 'Compliance Score',
    value: '94%',
    accent: '#22C55E',
    icon: 'verified_user',
  },
  { label: 'AI Quality', value: '87%', accent: '#2DD4BF', icon: 'smart_toy' },
]

// ---- Risk by site ----
const RISK_BY_SITE: {
  name: string
  level: string
  pct: number
  color: string
}[] = [
  { name: 'Austin HQ', level: 'Critical', pct: 92, color: '#EF4444' },
  { name: 'Dallas Office', level: 'Medium', pct: 48, color: '#F59E0B' },
  { name: 'Cedar Park Warehouse', level: 'Low', pct: 22, color: '#22C55E' },
]

// ---- Feedback breakdown ----
const FEEDBACK: {
  label: FeedbackRecord['label'] & string
  display: string
  pct: number
  color: string
}[] = [
  {
    label: 'correct_override',
    display: 'Correct override',
    pct: 77,
    color: '#22C55E',
  },
  { label: 'model_problem', display: 'Model problem', pct: 12, color: '#EF4444' },
  { label: 'policy_gap', display: 'Policy gap', pct: 8, color: '#F59E0B' },
  { label: 'data_quality', display: 'Data quality', pct: 3, color: '#2563EB' },
]

function buildConicGradient() {
  let acc = 0
  const segments = FEEDBACK.map((f) => {
    const start = acc
    acc += f.pct
    return `${f.color} ${start}% ${acc}%`
  })
  return `conic-gradient(${segments.join(', ')})`
}

export default function ExecutiveReporting() {
  const campaign = MOCK_CAMPAIGNS[0]
  const [brief, setBrief] = useState('')
  const [generating, setGenerating] = useState(false)
  const briefRef = useRef<HTMLDivElement>(null)

  async function generateBrief() {
    if (generating) return
    setBrief('')
    setGenerating(true)
    try {
      const res = await fetch('/api/executive-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: {
            openCases: 1,
            activeCampaigns: 1,
            complianceScore: 0.94,
            aiQuality: 0.87,
          },
        }),
      })
      if (!res.ok || !res.body) throw new Error('failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setBrief(acc)
        briefRef.current?.scrollTo({ top: briefRef.current.scrollHeight })
      }
    } catch {
      setBrief(
        'Unable to reach the executive briefing agent. Verify ANTHROPIC_API_KEY is configured in .env.local.'
      )
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6 px-8 py-6">
      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-5"
          >
            <div className="flex items-center justify-between">
              <Icon name={s.icon} size={20} className="text-[#9CA3AF]" />
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: s.accent }}
              />
            </div>
            <p
              className="mt-3 text-2xl font-bold tracking-tight"
              style={{ color: s.accent }}
            >
              {s.value}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#9CA3AF]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk by site */}
        <div className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
            <Icon name="shield" size={18} className="text-[#9CA3AF]" /> Risk by
            Site
          </h3>
          <div className="space-y-4">
            {RISK_BY_SITE.map((r) => (
              <div key={r.name}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#CBD5E0]">{r.name}</span>
                  <span
                    className="font-semibold uppercase"
                    style={{ color: r.color }}
                  >
                    {r.level}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#374151]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${r.pct}%`, backgroundColor: r.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback donut */}
        <div className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-5">
          <h3 className="mb-4 text-sm font-bold text-white">
            AI Feedback Breakdown
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 shrink-0">
              <div
                className="h-full w-full rounded-full"
                style={{ background: buildConicGradient() }}
              />
              <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-[#1A1F2E]">
                <span className="text-lg font-extrabold text-white">87%</span>
                <span className="text-[9px] uppercase tracking-wide text-[#6B7280]">
                  AI Quality
                </span>
              </div>
            </div>
            <ul className="flex-1 space-y-2">
              {FEEDBACK.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-[#CBD5E0]">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: f.color }}
                    />
                    {f.display}
                  </span>
                  <span className="font-semibold text-white">{f.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Campaign summary */}
      <div className="rounded-xl border border-[#1E40AF] bg-[#0C1A2A] p-5">
        <div className="flex items-start gap-3">
          <Icon name="hub" size={22} className="text-[#38BDF8]" />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-white">
              Campaign {campaign.title.split(' ')[0]}: {campaign.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
              {campaign.hypothesis}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-[#60A5FA]">
              <span>{campaign.incidentIds.length} incidents</span>
              <span>·</span>
              <span>2 sites</span>
              <span>·</span>
              <span>1 active case</span>
              <span>·</span>
              <span className="capitalize">Status: {campaign.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive brief */}
      <div className="overflow-hidden rounded-xl border border-[#2D3748] bg-[#1A1F2E]">
        <div className="flex items-center justify-between border-b border-[#2D3748] px-5 py-3.5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <Icon name="summarize" size={18} className="text-[#A78BFA]" />{' '}
            Executive Brief
            <span className="rounded bg-[#0E2A2A] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#2DD4BF]">
              AI-generated
            </span>
          </h3>
          <button
            onClick={generateBrief}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7C3AED] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:opacity-60"
          >
            <Icon name="auto_awesome" size={16} />
            {generating ? 'Generating…' : 'Generate Executive Brief'}
          </button>
        </div>
        <div
          ref={briefRef}
          className="max-h-80 overflow-y-auto bg-[#111827] p-5"
        >
          {brief ? (
            <div className="space-y-1.5 text-sm leading-relaxed text-[#CBD5E0]">
              {brief.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return (
                    <h4
                      key={i}
                      className="pt-2 text-xs font-bold uppercase tracking-wide text-[#A78BFA]"
                    >
                      {line.replace('## ', '')}
                    </h4>
                  )
                }
                if (line.trim() === '') return <div key={i} className="h-1" />
                return (
                  <p key={i} className="whitespace-pre-wrap">
                    {line.replace(/^[-*]\s+/, '• ')}
                  </p>
                )
              })}
              {generating && (
                <span className="inline-flex gap-1 pt-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7C3AED] [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7C3AED] [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7C3AED]" />
                </span>
              )}
            </div>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-center">
              <Icon name="summarize" size={28} className="text-[#6B7280]" />
              <p className="mt-2 text-xs text-[#9CA3AF]">
                Generate a leadership-ready brief synthesizing this week’s
                operating picture, risks, and recommended actions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
