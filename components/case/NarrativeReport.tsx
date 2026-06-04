'use client'

import { useEffect, useState } from 'react'
import type { Case, Entity, EntityType } from '@/lib/types'

const ENTITY_ICON: Record<EntityType, string> = {
  person: 'badge',
  credential: 'key',
  vehicle: 'directions_car',
  door: 'door_front',
  camera: 'videocam',
  zone: 'location_on',
  sensor: 'sensors',
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#2D3748] bg-[#1A1F2E] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2D3748] bg-[#111827] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#243048] text-[#7C3AED]">
              <Icon name="description" size={20} />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                Investigation Report
              </h2>
              <p className="text-xs text-[#A78BFA]">
                {caseData.id} · {caseData.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#243048] hover:text-white"
          >
            <Icon name="close" size={18} />
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
              <p className="mt-4 text-sm font-semibold text-white">
                Generating report…
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Synthesizing timeline, evidence, and entity relationships.
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              {/* Executive Summary */}
              <section className="rounded-lg bg-[#0F1117] p-4">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#A78BFA]">
                  Executive Summary
                  <span className="rounded bg-[#0E2A2A] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#2DD4BF]">
                    AI-generated
                  </span>
                </h3>
                <p className="text-sm leading-relaxed text-[#CBD5E0]">
                  {EXEC_SUMMARY}
                </p>
              </section>

              {/* Timeline */}
              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#A78BFA]">
                  Timeline
                </h3>
                <ol className="space-y-2">
                  {caseData.timeline.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex gap-3 rounded-lg bg-[#0F1117] px-3 py-2"
                    >
                      <span className="font-mono text-[11px] font-semibold text-[#6B7280]">
                        {fmtTime(ev.timestamp)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-white">
                          {ev.flagged && (
                            <Icon
                              name="warning"
                              size={14}
                              className="text-[#EF4444]"
                            />
                          )}
                          {ev.title}
                        </p>
                        <p className="text-[11px] text-[#9CA3AF]">{ev.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Involved Parties */}
              <section className="rounded-lg bg-[#0F1117] p-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#A78BFA]">
                  Involved Parties
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {entities.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-2 rounded-lg border border-[#2D3748] bg-[#1A1F2E] px-3 py-2"
                    >
                      <Icon
                        name={ENTITY_ICON[e.type]}
                        size={18}
                        className="text-[#9CA3AF]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#CBD5E0]">
                          {e.label}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                          {e.type} · {e.riskLevel} risk
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Open Questions */}
              <section>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#A78BFA]">
                  Open Questions
                </h3>
                <ul className="space-y-1.5">
                  {caseData.openQuestions.map((q) => (
                    <li
                      key={q}
                      className="flex items-start gap-2 text-xs leading-relaxed text-[#CBD5E0]"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                      {q}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Recommendations */}
              <section className="rounded-lg bg-[#0F1117] p-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#A78BFA]">
                  Recommendations
                </h3>
                <ol className="space-y-1.5">
                  {RECOMMENDATIONS.map((r, i) => (
                    <li
                      key={r}
                      className="flex gap-2.5 text-xs leading-relaxed text-[#CBD5E0]"
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
        <div className="flex justify-end gap-2 border-t border-[#2D3748] bg-[#111827] px-6 py-3">
          <button
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#374151] bg-[#1F2937] px-4 py-2 text-sm font-medium text-[#CBD5E0] transition-colors hover:bg-[#243048] disabled:opacity-50"
          >
            <Icon name="edit_note" size={16} /> Edit
          </button>
          <button
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:opacity-50"
          >
            <Icon name="download" size={16} /> Export PDF
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#374151] px-4 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-[#243048] hover:text-white"
          >
            <Icon name="close" size={16} /> Close
          </button>
        </div>
      </div>
    </div>
  )
}
