'use client'

import { useEffect, useState } from 'react'
import type { Case, Entity, EntityType } from '@/lib/types'

const ENTITY_ICON: Record<EntityType, string> = {
  person: '👤',
  credential: '🪪',
  vehicle: '🚗',
  door: '🚪',
  camera: '📷',
  zone: '📍',
  sensor: '📡',
}

const EXEC_SUMMARY =
  'On 2026-06-04, contractor Marcus Webb (Badge B-4421) made two unauthorized access attempts at Server Room 2B (Austin HQ) within a four-minute window — both denied for insufficient clearance (Level 4+ required). Camera C4 confirmed his presence in the corridor, where he lingered for 4 minutes 12 seconds after the first denial before exiting via Stairwell B at 14:40. No work order was found authorizing his presence on Floor 3. The badge is correlated with Campaign HXT-7291, indicating possible coordinated multi-site activity. The behavioral pattern is consistent with deliberate access probing and warrants escalation to security leadership and HR review of the contractor authorization scope.'

const RECOMMENDATIONS = [
  'Suspend Badge B-4421 pending verification of contractor work order and authorization scope.',
  'Complete HR review of the contractor’s engagement contract and approved access zones.',
  'Cross-reference badge activity against Cedar Park Warehouse tailgating event (Campaign HXT-7291).',
  'Preserve all Camera C4 footage and Brivo ACS denial logs under legal hold.',
  'Brief security leadership and schedule a follow-up if any further access attempts occur.',
]

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function NarrativeReport({
  caseData,
  entities,
  onClose,
}: {
  caseData: Case
  entities: Entity[]
  onClose: () => void
}) {
  const [generating, setGenerating] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F5F3FF] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
              📄
            </span>
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                Investigation Report
              </h2>
              <p className="text-xs text-[#7C3AED]">
                {caseData.id} · {caseData.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {generating ? (
            <div className="flex h-72 flex-col items-center justify-center text-center">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#7C3AED] [animation-delay:-0.2s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#7C3AED] [animation-delay:-0.1s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#7C3AED]" />
              </div>
              <p className="mt-4 text-sm font-semibold text-[#374151]">
                Generating report…
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Synthesizing timeline, evidence, and entity relationships.
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              {/* Executive Summary */}
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#7C3AED]">
                  Executive Summary
                  <span className="rounded bg-[#CCFBF1] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0F766E]">
                    AI-generated
                  </span>
                </h3>
                <p className="text-sm leading-relaxed text-[#374151]">
                  {EXEC_SUMMARY}
                </p>
              </section>

              {/* Timeline */}
              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#7C3AED]">
                  Timeline
                </h3>
                <ol className="space-y-2">
                  {caseData.timeline.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex gap-3 rounded-lg bg-[#F9FAFB] px-3 py-2"
                    >
                      <span className="font-mono text-[11px] font-semibold text-[#6B7280]">
                        {fmtTime(ev.timestamp)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#111827]">
                          {ev.flagged && '⚠️ '}
                          {ev.title}
                        </p>
                        <p className="text-[11px] text-[#6B7280]">{ev.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Involved Parties */}
              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#7C3AED]">
                  Involved Parties
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {entities.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2"
                    >
                      <span className="text-base">{ENTITY_ICON[e.type]}</span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#374151]">
                          {e.label}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">
                          {e.type} · {e.riskLevel} risk
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Open Questions */}
              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#7C3AED]">
                  Open Questions
                </h3>
                <ul className="space-y-1.5">
                  {caseData.openQuestions.map((q) => (
                    <li
                      key={q}
                      className="flex items-start gap-2 text-xs leading-relaxed text-[#374151]"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                      {q}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Recommendations */}
              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#7C3AED]">
                  Recommendations
                </h3>
                <ol className="space-y-1.5">
                  {RECOMMENDATIONS.map((r, i) => (
                    <li
                      key={r}
                      className="flex gap-2.5 text-xs leading-relaxed text-[#374151]"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      {r}
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-[#E5E7EB] bg-[#F9FAFB] px-6 py-3">
          <button
            disabled={generating}
            className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-white disabled:opacity-50"
          >
            Edit
          </button>
          <button
            disabled={generating}
            className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-white disabled:opacity-50"
          >
            Export PDF
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
