'use client'

import { useState } from 'react'
import type { Alert, AlertDetail, CorrelatedEvent, PersonDetails, Severity } from '@/lib/types'
import { CameraStill } from './CameraStill'
import { CameraClipModal } from './CameraClipModal'

interface Props {
  alert: Alert
  detail: AlertDetail
  onClose: () => void
  onAccept: () => void
  onOverride: () => void
}

const SEVERITY_BADGE: Record<Severity, { bg: string; text: string; label: string }> = {
  critical: { bg: '#7F1D1D', text: '#FCA5A5', label: 'CRITICAL' },
  high: { bg: '#7C2D12', text: '#FDBA74', label: 'HIGH' },
  medium: { bg: '#78350F', text: '#FCD34D', label: 'MEDIUM' },
  low: { bg: '#334155', text: '#CBD5E1', label: 'LOW' },
}

// ---- Confidence Ring (dark variant) ----
function ConfidenceRing({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value)
  const color = value >= 0.85 ? '#22C55E' : value >= 0.7 ? '#3B82F6' : '#D97706'

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#374151" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold leading-none text-white">{pct}%</span>
        <span className="text-[8px] font-medium uppercase tracking-wide text-gray-500">conf</span>
      </div>
    </div>
  )
}

// ---- Person Card ----
function PersonCard({ person }: { person: PersonDetails }) {
  const [copied, setCopied] = useState(false)

  if (person.type === 'known') {
    const isHighRisk = person.avatarColor === '#DC2626'
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: person.avatarColor }}
          >
            {person.avatarInitials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white">{person.name}</h4>
              {isHighRisk && (
                <span className="rounded-full bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-400">
                  ⚠️ High Risk
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {person.role}
              {person.company ? ` · ${person.company}` : ''}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Field label="Badge ID" value={person.badgeId} mono />
          <Field label="Access Level" value={person.accessLevel} />
          <Field label="Department" value={person.department} />
        </div>
        {person.email && (
          <div className="mt-2">
            <Field label="Email" value={person.email} mono />
          </div>
        )}
      </div>
    )
  }

  // Unknown person — red-tinted card
  return (
    <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl text-white"
          style={{ backgroundColor: person.avatarColor }}
        >
          ?
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="flex items-center gap-1.5 text-base font-bold text-red-300">
            <span>⚠</span> {person.label ?? 'Unknown Individual'}
          </h4>
          {person.watchlistCategory && (
            <span className="mt-1 inline-block rounded-full bg-red-900/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-300">
              {person.watchlistCategory}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {person.confidence != null && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Face Match Confidence
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800">
                <div className="h-full bg-amber-500" style={{ width: `${person.confidence}%` }} />
              </div>
              <span className="font-mono text-xs font-bold text-amber-400">{person.confidence}%</span>
            </div>
          </div>
        )}

        {person.firstSeen && (
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-gray-500">First seen</span>
            <span className="font-mono text-gray-300">{person.firstSeen}</span>
          </div>
        )}

        {person.cameraSightings && person.cameraSightings.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Camera Sightings
            </p>
            <div className="flex flex-wrap gap-1.5">
              {person.cameraSightings.map((c) => (
                <span
                  key={c}
                  className="rounded border border-gray-700 bg-gray-900 px-2 py-0.5 text-[10px] font-medium text-gray-300"
                >
                  📷 {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {person.vehiclePlate && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Vehicle Plate
            </p>
            <div className="flex items-center gap-2">
              <span className="rounded border border-gray-600 bg-gray-800 px-2 py-1 font-mono text-sm font-bold tracking-widest text-white">
                {person.vehiclePlate}
              </span>
              <button
                onClick={() => {
                  if (person.vehiclePlate) {
                    navigator.clipboard?.writeText(person.vehiclePlate)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }
                }}
                className="rounded border border-gray-700 px-2 py-1 text-[10px] font-medium text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-200"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-xs text-gray-200 ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</p>
    </div>
  )
}

// ---- Timeline ----
const EVENT_ICON: Record<CorrelatedEvent['type'], string> = {
  access: '🔑',
  camera: '📷',
  agent: '🤖',
}

function TimelineRow({
  event,
  isLast,
  onOpenClip,
}: {
  event: CorrelatedEvent
  isLast: boolean
  onOpenClip: (e: CorrelatedEvent) => void
}) {
  const denied = event.type === 'access' && event.granted === false
  const isAgent = event.type === 'agent'

  const dotColor = denied
    ? '#EF4444'
    : event.type === 'access'
      ? '#22C55E'
      : isAgent
        ? '#14B8A6'
        : '#64748B'

  return (
    <div className="flex gap-3">
      {/* Time + connector */}
      <div className="flex w-12 shrink-0 flex-col items-end pt-0.5">
        <span className="font-mono text-[11px] leading-tight text-gray-400">{event.ts}</span>
      </div>

      {/* Dot + line */}
      <div className="relative flex flex-col items-center">
        <span
          className="z-10 mt-1 h-3 w-3 shrink-0 rounded-full ring-2 ring-gray-950"
          style={{ backgroundColor: dotColor }}
        />
        {!isLast && <span className="-mt-0.5 w-px flex-1 bg-gray-700" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-5">
        <div
          className={`rounded-lg border p-3 ${
            denied
              ? 'border-red-900/70 bg-red-950/40'
              : isAgent
                ? 'border-l-2 border-l-teal-500 border-gray-700 bg-[#0f1929]'
                : 'border-gray-700 bg-gray-900'
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="text-base leading-none">{EVENT_ICON[event.type]}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-100">{event.location}</span>
                {isAgent && (
                  <span className="rounded bg-teal-900/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal-300">
                    AI
                  </span>
                )}
                {denied && (
                  <span className="rounded bg-red-900/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-300">
                    Denied
                  </span>
                )}
                {event.type === 'access' && event.granted === true && (
                  <span className="rounded bg-green-900/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-300">
                    Granted
                  </span>
                )}
                {event.tailgate && (
                  <span className="rounded bg-amber-900/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300">
                    ⚠️ Tailgate
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">{event.detail}</p>
            </div>

            {/* Inline camera thumbnail */}
            {event.cameraPreview && (
              <div className="w-[100px] shrink-0">
                <CameraStill
                  channel={event.cameraPreview.channel}
                  sceneType={event.cameraPreview.sceneType}
                  location={event.location}
                  timestamp={event.ts}
                  onClick={() => onOpenClip(event)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Main Drawer ----
export function IncidentDetailDrawer({ alert, detail, onClose, onAccept, onOverride }: Props) {
  const [clipEvent, setClipEvent] = useState<CorrelatedEvent | null>(null)
  const [whyOpen, setWhyOpen] = useState(false)
  const sevBadge = SEVERITY_BADGE[alert.severity]
  const isDeterrent = alert.type === 'deterrent'
  const { nba, sop } = alert

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-[80vw] max-w-[1400px] flex-col bg-[#111827] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: sevBadge.bg, color: sevBadge.text }}
            >
              {sevBadge.label}
            </span>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: isDeterrent ? '#78350F' : '#7F1D1D',
                color: isDeterrent ? '#FCD34D' : '#FCA5A5',
              }}
            >
              {isDeterrent ? '🛡 Deterrent' : '⚡ Reactive'}
            </span>
            <h2 className="truncate text-base font-bold text-white">{alert.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          >
            ✕ Close
          </button>
        </div>

        {/* Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[60%_40%]">
          {/* LEFT — Evidence */}
          <div className="min-h-0 overflow-y-auto border-r border-gray-800 p-6">
            <p className="mb-1 text-xs text-gray-500">
              {alert.location} · {alert.siteName}
            </p>

            <PersonCard person={detail.person} />

            {/* Timeline */}
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-300">
                  Correlated Evidence
                </h3>
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-bold text-gray-400">
                  {detail.correlatedEvents.length} events
                </span>
              </div>

              <div>
                {detail.correlatedEvents.map((event, i) => (
                  <TimelineRow
                    key={event.id}
                    event={event}
                    isLast={i === detail.correlatedEvents.length - 1}
                    onOpenClip={setClipEvent}
                  />
                ))}
              </div>
            </div>

            {/* Agent Summary */}
            <div className="mt-2 rounded-lg border border-teal-900/60 bg-[#0d1b26] p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧠</span>
                <h4 className="text-xs font-bold uppercase tracking-wide text-teal-300">
                  Agent Analysis
                </h4>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">{detail.agentSummary}</p>

              {alert.explanation && (
                <div className="mt-3 border-t border-teal-900/40 pt-3">
                  <button
                    onClick={() => setWhyOpen((v) => !v)}
                    className="flex w-full items-center justify-between text-xs font-semibold text-teal-400 transition-colors hover:text-teal-300"
                  >
                    <span>Why this fired</span>
                    <span className={`transition-transform ${whyOpen ? 'rotate-90' : ''}`}>▶</span>
                  </button>
                  {whyOpen && (
                    <p className="mt-2 text-xs leading-relaxed text-gray-400">{alert.explanation}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — NBA + SOP + Actions */}
          <div className="min-h-0 overflow-y-auto p-6">
            {nba ? (
              <div className="space-y-5">
                {/* NBA header */}
                <div className="flex items-start gap-4 border-b border-gray-800 pb-5">
                  <ConfidenceRing value={nba.confidence} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤖</span>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-violet-400">
                        Next Best Action
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Contextualized with{' '}
                      {detail.person.type === 'known'
                        ? detail.person.name
                        : detail.person.label}{' '}
                      · {detail.correlatedEvents.length} correlated events
                    </p>
                  </div>
                </div>

                {/* Recommended action */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Recommended Action
                  </p>
                  <button
                    onClick={onAccept}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    {nba.recommendedAction}
                  </button>
                  <p className="mt-2 text-xs italic leading-relaxed text-gray-400">{nba.rationale}</p>
                </div>

                {/* Alternatives */}
                {nba.alternatives.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Alternatives
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {nba.alternatives.map((alt) => (
                        <button
                          key={alt}
                          className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-blue-500 hover:text-blue-400"
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* SOP */}
                {sop && (
                  <div className="border-t border-gray-800 pt-5">
                    <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-400">
                      <span>📋</span> Per {sop.title}:
                    </p>
                    <ol className="space-y-1.5">
                      {sop.steps.map((s) => (
                        <li
                          key={s.step}
                          className="flex gap-2.5 rounded-md bg-amber-950/30 px-3 py-2 text-xs leading-relaxed text-gray-300"
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
                            {s.step}
                          </span>
                          <span>{s.instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Two-tier execution */}
                <div className="grid grid-cols-1 gap-3 border-t border-gray-800 pt-5">
                  {nba.autoExecuteActions.length > 0 && (
                    <div className="rounded-lg bg-green-950/30 p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-green-400">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Auto-executes on accept:
                      </p>
                      <ul className="space-y-1">
                        {nba.autoExecuteActions.map((a) => (
                          <li key={a} className="flex items-center gap-2 text-xs text-green-300">
                            <span className="text-green-500">✓</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {nba.gatedActions.length > 0 && (
                    <div className="rounded-lg bg-orange-950/30 p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-400">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        Requires your approval:
                      </p>
                      <ul className="space-y-1">
                        {nba.gatedActions.map((a) => (
                          <li key={a} className="flex items-center gap-2 text-xs text-orange-300">
                            <span className="text-orange-500">🔒</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action footer */}
                <div className="border-t border-gray-800 pt-5">
                  <button
                    onClick={onAccept}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    ✓ Accept AI Recommendation
                  </button>
                  <button
                    onClick={onOverride}
                    className="mt-2 w-full rounded-lg border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
                  >
                    Override with Reason
                  </button>
                  <p className="mt-3 text-center text-[11px] text-gray-500">
                    Every action is logged with attribution
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 text-3xl">🤖</div>
                <p className="text-sm font-semibold text-gray-300">No recommendation available</p>
                <p className="mt-1 max-w-[220px] text-xs text-gray-500">
                  This alert is still being enriched.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {clipEvent && clipEvent.cameraPreview && (
        <CameraClipModal
          channel={clipEvent.cameraPreview.channel}
          sceneType={clipEvent.cameraPreview.sceneType}
          location={clipEvent.location}
          timestamp={clipEvent.ts}
          detail={clipEvent.detail}
          onClose={() => setClipEvent(null)}
        />
      )}
    </div>
  )
}
