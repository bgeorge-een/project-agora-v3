'use client'

import React, { useEffect, useState } from 'react'
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

const SEVERITY_BADGE: Record<Severity, { bg: string; text: string; label: string; rail: string }> = {
  critical: { bg: '#210A08', text: '#FF453A', label: 'Critical', rail: '#FF453A' },
  high: { bg: '#2A1706', text: '#FDBA74', label: 'High', rail: '#F97316' },
  medium: { bg: '#27200B', text: '#FCD34D', label: 'Medium', rail: '#FBBF24' },
  low: { bg: '#1E293B', text: '#CBD5E1', label: 'Low', rail: '#64748B' },
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
        <span className="text-[10px] font-medium text-[#94A3B8]">Conf.</span>
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
      <div className="rounded-lg border border-[#334155] bg-[#151B26] p-5">
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
                <span className="flex items-center gap-1 rounded-full border border-[#FF453A]/70 bg-[#210A08] px-2.5 py-1 text-xs font-bold text-[#FF453A]">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                    style={{ fontSize: '14px', lineHeight: 1 }}
                  >
                    warning
                  </span>
                  High Risk
                </span>
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[#D1D5DB]">
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
    <div className="rounded-lg border border-[#7F1D1D] bg-[#210A08] p-5">
      <div className="flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: person.avatarColor }}
        >
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
            style={{ fontSize: '28px', lineHeight: 1 }}
          >
            person_off
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="flex items-center gap-1.5 text-base font-bold text-red-300">
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: '18px', lineHeight: 1 }}
            >
              person_off
            </span>
            {person.label ?? 'Unknown Individual'}
          </h4>
          {person.watchlistCategory && (
            <span className="mt-2 inline-block rounded-full border border-[#FF453A]/60 bg-[#210A08] px-2.5 py-1 text-xs font-bold text-[#FFB4AE]">
              {person.watchlistCategory}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {person.confidence != null && (
          <div>
            <p className="mb-1 text-xs font-semibold text-[#94A3B8]">
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
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-[#94A3B8]">First seen</span>
            <span className="font-mono text-[#E5E7EB]">{person.firstSeen}</span>
          </div>
        )}

        {person.cameraSightings && person.cameraSightings.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold text-[#94A3B8]">
              Camera Sightings
            </p>
            <div className="flex flex-wrap gap-1.5">
              {person.cameraSightings.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1 rounded border border-[#334155] bg-[#151B26] px-2 py-1 text-xs font-medium text-[#D1D5DB]"
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
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
            <p className="mb-1 text-xs font-semibold text-[#94A3B8]">
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
                aria-label={copied ? 'Vehicle plate copied' : 'Copy vehicle plate'}
                className="flex min-h-9 items-center gap-1 rounded border border-[#475569] px-2 text-xs font-semibold text-[#D1D5DB] transition-all hover:border-[#94A3B8] hover:text-white active:scale-[0.98]"
              >
                {copied && (
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
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
      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#94A3B8]">
        {icon && (
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
            style={{ fontSize: '12px', lineHeight: 1 }}
          >
            {icon}
          </span>
        )}
        {label}
      </p>
      <p className={`text-sm text-[#E5E7EB] ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</p>
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
  dateTime,
  isLast,
  onOpenClip,
}: {
  event: CorrelatedEvent
  dateTime: string
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
        <time className="font-mono text-xs leading-tight text-[#CBD5E1]" dateTime={dateTime}>
          {event.ts}
        </time>
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
              ? 'border-[#7F1D1D] bg-[#210A08]'
              : isAgent
                ? 'border-l-2 border-l-teal-400 border-[#334155] bg-[#151B26]'
                : 'border-[#334155] bg-[#151B26]'
          }`}
        >
          <div className="flex items-start gap-2">
            <span
              className="material-symbols-outlined leading-none"
              aria-hidden="true"
              style={{ fontSize: '18px', lineHeight: 1, color: iconColor }}
            >
              {iconName}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold text-[#F8FAFC]">{event.location}</span>
                {isAgent && (
                  <span className="rounded bg-teal-900/60 px-1.5 py-0.5 text-[11px] font-bold text-teal-200">
                    AI
                  </span>
                )}
                {denied && (
                  <span className="rounded bg-red-900/70 px-1.5 py-0.5 text-[11px] font-bold text-red-200">
                    Denied
                  </span>
                )}
                {event.type === 'access' && event.granted === true && (
                  <span className="rounded bg-green-900/50 px-1.5 py-0.5 text-[11px] font-bold text-green-200">
                    Granted
                  </span>
                )}
                {event.tailgate && (
                  <span className="flex items-center gap-1 rounded bg-amber-900/60 px-1.5 py-0.5 text-[11px] font-bold text-amber-200">
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                      style={{ fontSize: '12px', lineHeight: 1 }}
                    >
                      warning
                    </span>
                    Tailgate
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">{event.detail}</p>
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
const CURRENT_OPERATOR = 'J. Torres'

function getTzAbbr(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
    hour: 'numeric',
  }).formatToParts(date)
  const zone = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'CT'
  return zone.replace(/\bCST\b|\bCDT\b/, 'CT')
}

function fmtAlertDate(isoString: string): string {
  const d = new Date(isoString)
  const datePart = d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Chicago',
  })
  return `${datePart} · ${getTzAbbr(d)}`
}

function centralDateForDateTime(isoString: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(isoString))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '01'
  return `${get('year')}-${get('month')}-${get('day')}`
}

function eventDateTime(baseIso: string, hhmm: string): string {
  const safeTime = /^\d{2}:\d{2}$/.test(hhmm) ? hhmm : '00:00'
  return `${centralDateForDateTime(baseIso)}T${safeTime}:00`
}

type OperatorEntry = {
  id: string
  ts: string     // HH:MM for display
  isoTs: string  // full ISO for date comparison
  entryType: 'note' | 'accepted' | 'override'
  text: string
  author: string
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
        <time className="font-mono text-xs leading-tight text-[#CBD5E1]" dateTime={entry.isoTs}>
          {entry.ts}
        </time>
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
              aria-hidden="true"
              style={{ fontSize: '18px', lineHeight: 1, color: s.iconColor }}
            >
              {s.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="rounded px-1.5 py-0.5 text-[11px] font-bold"
                  style={{ backgroundColor: s.badgeBg, color: s.badgeText }}
                >
                  {s.badge}
                </span>
                <span className="text-xs font-medium text-[#94A3B8]">{entry.author}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[#D1D5DB]">{entry.text}</p>
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
  const actionJustificationId = `action-justification-${alert.id}`

  const allItems: TimelineItem[] = [
    ...detail.correlatedEvents.map((e) => ({ kind: 'event' as const, data: e })),
    ...operatorLog.map((e) => ({ kind: 'operator' as const, data: e })),
  ].sort((a, b) => a.data.ts.localeCompare(b.data.ts))

  const alertDateStr = new Date(alert.timestamp).toDateString()

  function nowEntry(): Pick<OperatorEntry, 'ts' | 'isoTs'> {
    const now = new Date()
    return {
      ts: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      isoTs: now.toISOString(),
    }
  }

  function addNote() {
    if (!noteText.trim()) return
    setOperatorLog((prev) => [
      ...prev,
      { id: `op-${Date.now()}`, ...nowEntry(), entryType: 'note', text: noteText.trim(), author: CURRENT_OPERATOR },
    ])
    setNoteText('')
  }

  function handleAccept() {
    setOperatorLog((prev) => [
      ...prev,
      {
        id: `op-${Date.now()}`,
        ...nowEntry(),
        entryType: 'accepted',
        text: nba?.recommendedAction ?? 'AI recommendation accepted',
        author: CURRENT_OPERATOR,
      },
    ])
    onAccept()
  }

  function handleOverride() {
    setOperatorLog((prev) => [
      ...prev,
      {
        id: `op-${Date.now()}`,
        ...nowEntry(),
        entryType: 'override',
        text: 'Operator overrode AI recommendation',
        author: CURRENT_OPERATOR,
      },
    ])
    onOverride()
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (!nba) return
      if (!(event.metaKey || event.ctrlKey) || event.key !== 'Enter') return
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select')) return
      event.preventDefault()
      handleAccept()
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  })

  function viewAllEvidence() {
    document.getElementById('correlated-evidence-timeline')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function exportEvidence() {
    const payload = {
      exportedAt: new Date().toISOString(),
      alert: {
        id: alert.id,
        title: alert.title,
        severity: alert.severity,
        type: alert.type,
        location: alert.location,
        siteName: alert.siteName,
        timestamp: alert.timestamp,
      },
      person: detail.person,
      agentSummary: detail.agentSummary,
      correlatedEvents: detail.correlatedEvents,
      operatorLog,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${alert.id}-evidence-chain.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-[80vw] max-w-[1400px] flex-col bg-[#0F1117] shadow-2xl"
        style={{ borderLeft: `5px solid ${sevBadge.rail}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#334155] px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-extrabold"
              style={{ backgroundColor: sevBadge.bg, color: sevBadge.text }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: sevBadge.text }}
              />
              {sevBadge.label}
            </span>
            <span
              className="flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-sm font-bold"
              style={{
                backgroundColor: isDeterrent ? '#27200B' : '#210A08',
                borderColor: isDeterrent ? '#854D0E' : '#7F1D1D',
                color: isDeterrent ? '#FDE68A' : '#FFB4AE',
              }}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: '14px', lineHeight: 1 }}
              >
                {isDeterrent ? 'shield' : 'bolt'}
              </span>
              {isDeterrent ? 'Deterrent' : 'Reactive'}
            </span>
            <h2 className="truncate text-lg font-bold text-white">{alert.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close incident response drawer"
            className="ml-4 flex min-h-11 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-[#CBD5E1] transition-all hover:bg-[#1F2937] hover:text-white active:scale-[0.98]"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
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
          <div
            className="min-h-0 overflow-y-auto border-r border-[#334155] p-6"
            style={{ scrollbarGutter: 'stable' }}
          >
            <p className="mb-2 text-sm font-medium text-[#CBD5E1]">
              {alert.location} · {alert.siteName}
            </p>

            <PersonCard person={detail.person} />

            {/* Agent Summary */}
            <section className="mt-5 rounded-lg border border-[#334155] bg-[#151B26] p-5">
              <div className="flex items-start gap-3">
                <span
                  className="material-symbols-outlined mt-0.5 text-[#38BDF8]"
                  aria-hidden="true"
                  style={{ fontSize: '22px', lineHeight: 1 }}
                >
                  psychology
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-white">Agent Analysis</h3>
                  <p className="mt-2 text-sm leading-[1.6] text-[#D1D5DB]">{detail.agentSummary}</p>
                </div>
              </div>

              {alert.explanation && (
                <div className="mt-4 border-t border-[#334155] pt-3">
                  <button
                    onClick={() => setWhyOpen((v) => !v)}
                    aria-label="Toggle explanation for why this alert fired"
                    aria-expanded={whyOpen}
                    className="flex min-h-11 w-full items-center justify-between text-sm font-semibold text-[#7DD3FC] transition-all hover:text-[#BAE6FD] active:scale-[0.98]"
                  >
                    <span>Why this fired</span>
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                      style={{ fontSize: '20px', lineHeight: 1 }}
                    >
                      {whyOpen ? 'unfold_less' : 'unfold_more'}
                    </span>
                  </button>
                  {whyOpen && (
                    <p className="mt-2 text-sm leading-[1.6] text-[#CBD5E1]">{alert.explanation}</p>
                  )}
                </div>
              )}
            </section>

            {/* Timeline */}
            <div className="mt-5" id="correlated-evidence-timeline">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-white">
                  Correlated Evidence
                </h3>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-[#334155] bg-[#151B26] px-3 py-1 text-sm font-bold text-[#D1D5DB]">
                    All {allItems.length} events visible
                  </span>
                  <button
                    type="button"
                    onClick={viewAllEvidence}
                    aria-label="View all correlated evidence events"
                    className="min-h-10 rounded-md border border-[#64748B] px-3 text-sm font-semibold text-[#F8FAFC] transition-all hover:bg-[#1F2937] active:scale-[0.98]"
                  >
                    View All
                  </button>
                  <button
                    type="button"
                    onClick={exportEvidence}
                    aria-label="Export evidence chain as JSON"
                    className="flex min-h-10 items-center gap-1.5 rounded-md bg-[#2563EB] px-3 text-sm font-semibold text-white transition-all hover:bg-[#1D4ED8] active:scale-[0.98]"
                  >
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                      style={{ fontSize: '18px', lineHeight: 1 }}
                    >
                      download
                    </span>
                    Export
                  </button>
                </div>
              </div>

              {/* Date header */}
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[#94A3B8]"
                  aria-hidden="true"
                  style={{ fontSize: '14px', lineHeight: 1 }}
                >
                  calendar_today
                </span>
                <span className="text-xs font-semibold text-[#94A3B8]">
                  {fmtAlertDate(alert.timestamp)}
                </span>
                <span className="flex-1 border-t border-dashed border-[#334155]" />
              </div>

              <div>
                {(() => {
                  let currentDateStr = alertDateStr
                  const rows: React.ReactNode[] = []
                  allItems.forEach((item, i) => {
                    const isLast = i === allItems.length - 1
                    // Insert date separator when operator note crosses into a new day
                    if (item.kind === 'operator') {
                      const itemDateStr = new Date(item.data.isoTs).toDateString()
                      if (itemDateStr !== currentDateStr) {
                        currentDateStr = itemDateStr
                        rows.push(
                          <div key={`date-sep-${item.data.id}`} className="my-3 flex items-center gap-2">
                            <span className="flex-1 border-t border-dashed border-[#334155]" />
                            <span className="text-xs font-semibold text-[#94A3B8]">
                              {fmtAlertDate(item.data.isoTs)}
                            </span>
                            <span className="flex-1 border-t border-dashed border-[#334155]" />
                          </div>
                        )
                      }
                    }
                    if (item.kind === 'event') {
                      rows.push(
                        <TimelineRow
                          key={item.data.id}
                          event={item.data}
                          dateTime={eventDateTime(alert.timestamp, item.data.ts)}
                          isLast={isLast}
                          onOpenClip={setClipEvent}
                        />
                      )
                    } else {
                      rows.push(
                        <OperatorEntryRow key={item.data.id} entry={item.data} isLast={isLast} />
                      )
                    }
                  })
                  return rows
                })()}
              </div>
            </div>

            {/* Add Operator Note */}
            <div className="mt-1 rounded-lg border border-[#334155] bg-[#151B26] p-5">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[#F59E0B]"
                  aria-hidden="true"
                  style={{ fontSize: '18px', lineHeight: 1 }}
                >
                  edit_note
                </span>
                <h3 className="text-base font-bold text-white">
                  Add Operator Note
                </h3>
              </div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                placeholder="Type a note visible to all operators..."
                className="w-full resize-none rounded-md border border-[#475569] bg-[#0F1117] px-3 py-2 text-sm leading-[1.5] text-[#E5E7EB] placeholder:text-[#94A3B8] focus:border-[#F59E0B] focus:outline-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={addNote}
                  disabled={!noteText.trim()}
                  aria-label="Add operator note to incident timeline"
                  className="flex min-h-11 items-center gap-1.5 rounded-md bg-[#D97706] px-4 text-sm font-bold text-black transition-all hover:bg-[#F59E0B] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                    style={{ fontSize: '16px', lineHeight: 1 }}
                  >
                    add
                  </span>
                  Add Note
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — NBA + SOP + Actions */}
          <div
            className="min-h-0 overflow-y-auto p-6"
            style={{ scrollbarGutter: 'stable' }}
          >
            {nba ? (
              <div className="space-y-5">
                {/* NBA header */}
                <div className="flex items-start gap-4 border-b border-[#334155] pb-5">
                  <ConfidenceRing value={nba.confidence} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="material-symbols-outlined text-[#38BDF8]"
                        aria-hidden="true"
                        style={{ fontSize: '18px', lineHeight: 1 }}
                      >
                        smart_toy
                      </span>
                      <h3 className="text-base font-bold text-white">
                        Next Best Action
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-[1.5] text-[#D1D5DB]">
                      Contextualized with{' '}
                      {detail.person.type === 'known'
                        ? detail.person.name
                        : detail.person.label}{' '}
                      · {detail.correlatedEvents.length} correlated events
                    </p>
                  </div>
                </div>

                {/* Recommended action */}
                <section>
                  <h4 className="mb-2 text-sm font-semibold text-[#94A3B8]">
                    Recommended Action
                  </h4>
                  <button
                    onClick={handleAccept}
                    role="button"
                    aria-label={`Accept recommended action: ${nba.recommendedAction}`}
                    aria-describedby={actionJustificationId}
                    aria-keyshortcuts="Meta+Enter Control+Enter"
                    className="min-h-[52px] w-full rounded-lg bg-[#2563EB] px-4 py-3 text-left text-sm font-bold leading-[1.5] text-white transition-all hover:bg-[#1D4ED8] active:scale-[0.98]"
                  >
                    {nba.recommendedAction}
                  </button>
                  <p id={actionJustificationId} className="mt-2 text-sm font-medium leading-[1.5] text-[#CBD5E1]">
                    {nba.rationale}
                  </p>
                </section>

                {/* Alternatives */}
                {nba.alternatives.length > 0 && (
                  <section>
                    <h4 className="mb-2 text-sm font-semibold text-[#94A3B8]">
                      Alternatives
                    </h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {nba.alternatives.map((alt) => (
                        <button
                          key={alt}
                          aria-label={`Choose alternative action: ${alt}`}
                          className="min-h-12 rounded-lg border border-[#64748B] px-3 text-left text-sm font-semibold text-[#E5E7EB] transition-all hover:border-blue-500 hover:text-white active:scale-[0.98]"
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* SOP */}
                {sop && (
                  <div className="rounded-lg border border-[#334155] bg-[#151B26] p-5">
                    <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-[#FCD34D]">
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
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
                          className="flex gap-2.5 rounded-md border border-[#334155] bg-[#111827] px-3 py-2 text-sm leading-[1.5] text-[#D1D5DB]"
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
                      <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#34D399]">
                        <span
                          className="material-symbols-outlined"
                          aria-hidden="true"
                          style={{ fontSize: '16px', lineHeight: 1 }}
                        >
                          check_circle
                        </span>
                        Auto-executes on accept:
                      </p>
                      <ul className="space-y-1">
                        {nba.autoExecuteActions.map((a) => (
                          <li key={a} className="flex items-center gap-2 text-sm leading-[1.5] text-[#86EFAC]">
                            <span
                              className="material-symbols-outlined text-[#22C55E]"
                              aria-hidden="true"
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
                      <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#FFB4AE]">
                        <span
                          className="material-symbols-outlined"
                          aria-hidden="true"
                          style={{ fontSize: '16px', lineHeight: 1 }}
                        >
                          lock
                        </span>
                        Requires your approval:
                      </p>
                      <ul className="space-y-1">
                        {nba.gatedActions.map((a) => (
                          <li key={a} className="flex items-center gap-2 text-sm leading-[1.5] text-[#FFB4AE]">
                            <span
                              className="material-symbols-outlined text-[#EF4444]"
                              aria-hidden="true"
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
                <footer className="sticky bottom-0 z-10 -mx-6 -mb-6 border-t border-[#334155] bg-[#0F1117]/95 px-6 py-5 backdrop-blur transform-gpu will-change-transform">
                  <button
                    onClick={handleAccept}
                    aria-label="Confirm and accept AI recommendation"
                    aria-describedby={actionJustificationId}
                    aria-keyshortcuts="Meta+Enter Control+Enter"
                    className="flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 text-sm font-bold text-white transition-all hover:bg-[#2563EB] active:scale-[0.98]"
                  >
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                      style={{ fontSize: '18px', lineHeight: 1 }}
                    >
                      check_circle
                    </span>
                    <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                      <span>Accept AI Recommendation</span>
                      <kbd className="rounded border border-white/25 px-1.5 py-0.5 text-[11px] font-semibold text-white/80">
                        Cmd/Ctrl+Enter
                      </kbd>
                    </span>
                  </button>
                  <button
                    onClick={handleOverride}
                    aria-label="Override AI recommendation with reason"
                    className="mt-2 flex min-h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-[#64748B] px-4 text-sm font-semibold text-[#E5E7EB] transition-all hover:bg-[#1F2937] hover:text-white active:scale-[0.98]"
                  >
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                      style={{ fontSize: '18px', lineHeight: 1 }}
                    >
                      edit_note
                    </span>
                    Override with Reason
                  </button>
                  <p className="mt-3 text-center text-xs text-[#94A3B8]">
                    Every action is logged with attribution
                  </p>
                </footer>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span
                  className="material-symbols-outlined mb-3 text-[#6B7280]"
                  aria-hidden="true"
                  style={{ fontSize: '40px', lineHeight: 1 }}
                >
                  smart_toy
                </span>
                <p className="text-sm font-semibold text-gray-300">No recommendation available</p>
                <p className="mt-1 max-w-[220px] text-sm leading-[1.5] text-[#94A3B8]">
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
