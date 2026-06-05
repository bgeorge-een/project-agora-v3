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
  const color = value >= 0.8 ? '#22C55E' : value >= 0.6 ? '#FBBF24' : '#EF4444'

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
      <div className="rounded-lg border border-[#2D3748] bg-[#1A1F2E] p-4">
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
                <span className="flex items-center gap-1 rounded-full bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-400">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', lineHeight: 1 }}
                  >
                    warning
                  </span>
                  High Risk
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
          <Field label="Badge ID" value={person.badgeId} mono icon="badge" />
          <Field label="Access Level" value={person.accessLevel} icon="security" />
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
    <div className="rounded-lg border border-[#7F1D1D] bg-[#1C0A0A] p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: person.avatarColor }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '28px', lineHeight: 1 }}
          >
            person_off
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="flex items-center gap-1.5 text-base font-bold text-red-300">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px', lineHeight: 1 }}
            >
              person_off
            </span>
            {person.label ?? 'Unknown Individual'}
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
                  className="flex items-center gap-1 rounded border border-[#2D3748] bg-[#1A1F2E] px-2 py-0.5 text-[10px] font-medium text-gray-300"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '13px', lineHeight: 1 }}
                  >
                    videocam
                  </span>
                  {c}
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
                className="flex items-center gap-1 rounded border border-gray-700 px-2 py-1 text-[10px] font-medium text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-200"
              >
                {copied && (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '13px', lineHeight: 1 }}
                  >
                    check
                  </span>
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  mono,
  icon,
}: {
  label: string
  value?: string
  mono?: boolean
  icon?: string
}) {
  return (
    <div>
      <p className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
        {icon && (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '12px', lineHeight: 1 }}
          >
            {icon}
          </span>
        )}
        {label}
      </p>
      <p className={`text-xs text-gray-200 ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</p>
    </div>
  )
}

// ---- Timeline ----
const EVENT_ICON: Record<CorrelatedEvent['type'], string> = {
  access: 'key',
  camera: 'videocam',
  agent: 'psychology',
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
        ? '#2DD4BF'
        : '#3B82F6'

  // Material icon + color for the event row
  const iconName = denied
    ? 'cancel'
    : event.type === 'access'
      ? 'check_circle'
      : EVENT_ICON[event.type]
  const iconColor = denied
    ? '#EF4444'
    : event.type === 'access'
      ? '#22C55E'
      : event.type === 'camera'
        ? '#3B82F6'
        : '#2DD4BF'

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
              ? 'border-[#7F1D1D] bg-[#1C0A0A]'
              : isAgent
                ? 'border-l-2 border-l-teal-500 border-[#2D3748] bg-[#0A1F1F]'
                : 'border-[#2D3748] bg-[#1A1F2E]'
          }`}
        >
          <div className="flex items-start gap-2">
            <span
              className="material-symbols-outlined leading-none"
              style={{ fontSize: '18px', lineHeight: 1, color: iconColor }}
            >
              {iconName}
            </span>
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
                  <span className="flex items-center gap-1 rounded bg-amber-900/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '12px', lineHeight: 1 }}
                    >
                      warning
                    </span>
                    Tailgate
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

// ---- Operator Log ----
type OperatorEntry = {
  id: string
  ts: string // HH:MM format (same as CorrelatedEvent.ts)
  entryType: 'note' | 'accepted' | 'override'
  text: string
}

type TimelineItem =
  | { kind: 'event'; data: CorrelatedEvent }
  | { kind: 'operator'; data: OperatorEntry }

const OPERATOR_STYLE: Record<
  OperatorEntry['entryType'],
  { dot: string; icon: string; iconColor: string; cardBg: string; cardBorder: string; badge: string; badgeBg: string; badgeText: string }
> = {
  note: {
    dot: '#F59E0B',
    icon: 'edit_note',
    iconColor: '#F59E0B',
    cardBg: '#1A1502',
    cardBorder: '#78350F',
    badge: 'Operator Note',
    badgeBg: 'rgba(120, 53, 15, 0.6)',
    badgeText: '#FCD34D',
  },
  accepted: {
    dot: '#22C55E',
    icon: 'check_circle',
    iconColor: '#22C55E',
    cardBg: '#0C2714',
    cardBorder: '#166534',
    badge: 'Accepted',
    badgeBg: 'rgba(22, 101, 52, 0.6)',
    badgeText: '#86EFAC',
  },
  override: {
    dot: '#EA580C',
    icon: 'edit_note',
    iconColor: '#EA580C',
    cardBg: '#1C1000',
    cardBorder: '#9A3412',
    badge: 'Override',
    badgeBg: 'rgba(154, 52, 18, 0.6)',
    badgeText: '#FDBA74',
  },
}

function OperatorEntryRow({ entry, isLast }: { entry: OperatorEntry; isLast: boolean }) {
  const s = OPERATOR_STYLE[entry.entryType]

  return (
    <div className="flex gap-3">
      {/* Time + connector */}
      <div className="flex w-12 shrink-0 flex-col items-end pt-0.5">
        <span className="font-mono text-[11px] leading-tight text-gray-400">{entry.ts}</span>
      </div>

      {/* Dot + line */}
      <div className="relative flex flex-col items-center">
        <span
          className="z-10 mt-1 h-3 w-3 shrink-0 rounded-full ring-2 ring-gray-950"
          style={{ backgroundColor: s.dot }}
        />
        {!isLast && <span className="-mt-0.5 w-px flex-1 bg-gray-700" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-5">
        <div
          className="rounded-lg border p-3"
          style={{ backgroundColor: s.cardBg, borderColor: s.cardBorder }}
        >
          <div className="flex items-start gap-2">
            <span
              className="material-symbols-outlined leading-none"
              style={{ fontSize: '18px', lineHeight: 1, color: s.iconColor }}
            >
              {s.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                  style={{ backgroundColor: s.badgeBg, color: s.badgeText }}
                >
                  {s.badge}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-gray-300">{entry.text}</p>
            </div>
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
  const [operatorLog, setOperatorLog] = useState<OperatorEntry[]>([])
  const [noteText, setNoteText] = useState('')
  const sevBadge = SEVERITY_BADGE[alert.severity]
  const isDeterrent = alert.type === 'deterrent'
  const { nba, sop } = alert

  const allItems: TimelineItem[] = [
    ...detail.correlatedEvents.map((e) => ({ kind: 'event' as const, data: e })),
    ...operatorLog.map((e) => ({ kind: 'operator' as const, data: e })),
  ].sort((a, b) => a.data.ts.localeCompare(b.data.ts))

  function nowTs() {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  function addNote() {
    if (!noteText.trim()) return
    setOperatorLog((prev) => [
      ...prev,
      { id: `op-${Date.now()}`, ts: nowTs(), entryType: 'note', text: noteText.trim() },
    ])
    setNoteText('')
  }

  function handleAccept() {
    setOperatorLog((prev) => [
      ...prev,
      {
        id: `op-${Date.now()}`,
        ts: nowTs(),
        entryType: 'accepted',
        text: nba?.recommendedAction ?? 'AI recommendation accepted',
      },
    ])
    onAccept()
  }

  function handleOverride() {
    setOperatorLog((prev) => [
      ...prev,
      {
        id: `op-${Date.now()}`,
        ts: nowTs(),
        entryType: 'override',
        text: 'Operator overrode AI recommendation',
      },
    ])
    onOverride()
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-[80vw] max-w-[1400px] flex-col bg-[#0F1117] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2D3748] px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: sevBadge.bg, color: sevBadge.text }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: sevBadge.text }}
              />
              {sevBadge.label}
            </span>
            <span
              className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: isDeterrent ? '#78350F' : '#7F1D1D',
                color: isDeterrent ? '#FDE68A' : '#FCA5A5',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '14px', lineHeight: 1 }}
              >
                {isDeterrent ? 'shield' : 'bolt'}
              </span>
              {isDeterrent ? 'Deterrent' : 'Reactive'}
            </span>
            <h2 className="truncate text-base font-bold text-white">{alert.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-gray-400 transition-colors hover:bg-[#1F2937] hover:text-white"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px', lineHeight: 1 }}
            >
              close
            </span>
            Close
          </button>
        </div>

        {/* Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[60%_40%]">
          {/* LEFT — Evidence */}
          <div className="min-h-0 overflow-y-auto border-r border-[#2D3748] p-6">
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
                <span className="rounded-full bg-[#2D3748] px-2 py-0.5 text-[10px] font-bold text-gray-400">
                  {allItems.length} events
                </span>
              </div>

              <div>
                {allItems.map((item, i) => {
                  const isLast = i === allItems.length - 1
                  if (item.kind === 'event') {
                    return (
                      <TimelineRow
                        key={item.data.id}
                        event={item.data}
                        isLast={isLast}
                        onOpenClip={setClipEvent}
                      />
                    )
                  }
                  return <OperatorEntryRow key={item.data.id} entry={item.data} isLast={isLast} />
                })}
              </div>
            </div>

            {/* Add Operator Note */}
            <div className="mt-2 rounded-lg border border-[#374151] bg-[#111827] p-4">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[#F59E0B]"
                  style={{ fontSize: '18px', lineHeight: 1 }}
                >
                  edit_note
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-300">
                  Add Operator Note
                </h4>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                placeholder="Type a note visible to all operators..."
                className="w-full resize-none rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-xs leading-relaxed text-gray-200 placeholder:text-gray-500 focus:border-[#F59E0B] focus:outline-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={addNote}
                  disabled={!noteText.trim()}
                  className="flex items-center gap-1.5 rounded-md bg-[#92400E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#B45309] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '16px', lineHeight: 1 }}
                  >
                    add
                  </span>
                  Add Note
                </button>
              </div>
            </div>

            {/* Agent Summary */}
            <div className="mt-2 rounded-lg border border-[#1E3A5F] bg-[#0A1525] p-4">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[#38BDF8]"
                  style={{ fontSize: '20px', lineHeight: 1 }}
                >
                  psychology
                </span>
                <h4 className="text-xs font-bold uppercase tracking-wide text-[#38BDF8]">
                  Agent Analysis
                </h4>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">{detail.agentSummary}</p>

              {alert.explanation && (
                <div className="mt-3 border-t border-[#1E3A5F] pt-3">
                  <button
                    onClick={() => setWhyOpen((v) => !v)}
                    className="flex w-full items-center justify-between text-xs font-semibold text-[#38BDF8] transition-colors hover:text-[#7DD3FC]"
                  >
                    <span>Why this fired</span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', lineHeight: 1 }}
                    >
                      {whyOpen ? 'unfold_less' : 'unfold_more'}
                    </span>
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
                <div className="flex items-start gap-4 border-b border-[#2D3748] pb-5">
                  <ConfidenceRing value={nba.confidence} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="material-symbols-outlined text-[#38BDF8]"
                        style={{ fontSize: '18px', lineHeight: 1 }}
                      >
                        smart_toy
                      </span>
                      <h3 className="text-sm font-bold uppercase tracking-wide text-[#A78BFA]">
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
                    onClick={handleAccept}
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
                  <div className="rounded-lg border border-[#2D3748] bg-[#0F1117] p-4">
                    <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#FCD34D]">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '18px', lineHeight: 1 }}
                      >
                        checklist
                      </span>
                      Per {sop.title}:
                    </p>
                    <ol className="space-y-1.5">
                      {sop.steps.map((s) => (
                        <li
                          key={s.step}
                          className="flex gap-2.5 rounded-md bg-[#1A1F2E] px-3 py-2 text-xs leading-relaxed text-[#CBD5E0]"
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#78350F] text-[10px] font-bold text-[#FDE68A]">
                            {s.step}
                          </span>
                          <span>{s.instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Two-tier execution */}
                <div className="grid grid-cols-1 gap-3">
                  {nba.autoExecuteActions.length > 0 && (
                    <div className="rounded-lg border border-[#166534] bg-[#0C2714] p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#34D399]">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '16px', lineHeight: 1 }}
                        >
                          check_circle
                        </span>
                        Auto-executes on accept:
                      </p>
                      <ul className="space-y-1">
                        {nba.autoExecuteActions.map((a) => (
                          <li key={a} className="flex items-center gap-2 text-xs text-[#86EFAC]">
                            <span
                              className="material-symbols-outlined text-[#22C55E]"
                              style={{ fontSize: '16px', lineHeight: 1 }}
                            >
                              check_circle
                            </span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {nba.gatedActions.length > 0 && (
                    <div className="rounded-lg border border-[#7F1D1D] bg-[#2D1515] p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#FCA5A5]">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: '16px', lineHeight: 1 }}
                        >
                          lock
                        </span>
                        Requires your approval:
                      </p>
                      <ul className="space-y-1">
                        {nba.gatedActions.map((a) => (
                          <li key={a} className="flex items-center gap-2 text-xs text-[#FCA5A5]">
                            <span
                              className="material-symbols-outlined text-[#EF4444]"
                              style={{ fontSize: '16px', lineHeight: 1 }}
                            >
                              lock
                            </span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action footer */}
                <div className="border-t border-[#2D3748] pt-5">
                  <button
                    onClick={handleAccept}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', lineHeight: 1 }}
                    >
                      check_circle
                    </span>
                    Accept AI Recommendation
                  </button>
                  <button
                    onClick={handleOverride}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#374151] px-4 py-2.5 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-[#1F2937] hover:text-white"
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', lineHeight: 1 }}
                    >
                      edit_note
                    </span>
                    Override with Reason
                  </button>
                  <p className="mt-3 text-center text-[11px] text-gray-500">
                    Every action is logged with attribution
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span
                  className="material-symbols-outlined mb-3 text-[#6B7280]"
                  style={{ fontSize: '40px', lineHeight: 1 }}
                >
                  smart_toy
                </span>
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
