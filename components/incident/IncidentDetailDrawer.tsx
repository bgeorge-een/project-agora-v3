'use client'

import React, { useEffect, useMemo, useState } from 'react'
import type {
  Alert,
  AlertDetail,
  CorrelatedEvent,
  IncidentLifecycleEvent,
  IncidentLifecycleStage,
  IncidentResponder,
  IncidentResponderRole,
  PersonDetails,
  ResponderStatus,
  Severity,
} from '@/lib/types'
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

type ExecutionStatus = 'queued' | 'running' | 'needs_confirmation' | 'manual_required' | 'complete'

type ExecutionAction = {
  id: string
  label: string
  system: string
  status: ExecutionStatus
  detail: string
  proof?: string
  updatedAt?: string
}

const STATUS_META: Record<
  ExecutionStatus,
  { label: string; icon: string; text: string; bg: string; border: string }
> = {
  queued: {
    label: 'Queued',
    icon: 'schedule',
    text: '#CBD5E1',
    bg: '#111827',
    border: '#334155',
  },
  running: {
    label: 'Running',
    icon: 'sync',
    text: '#7DD3FC',
    bg: '#082F49',
    border: '#0369A1',
  },
  needs_confirmation: {
    label: 'Needs confirmation',
    icon: 'pending_actions',
    text: '#FCD34D',
    bg: '#27200B',
    border: '#854D0E',
  },
  manual_required: {
    label: 'Manual required',
    icon: 'phone_in_talk',
    text: '#FFB4AE',
    bg: '#210A08',
    border: '#7F1D1D',
  },
  complete: {
    label: 'Complete',
    icon: 'check_circle',
    text: '#86EFAC',
    bg: '#0C2714',
    border: '#166534',
  },
}

const INCIDENT_STAGE_META: Record<
  IncidentLifecycleStage,
  { label: string; description: string; tone: string }
> = {
  detected: {
    label: 'Detected',
    description: 'Signal crossed policy threshold and became an operator-visible alert.',
    tone: '#94A3B8',
  },
  triaged: {
    label: 'Triaged',
    description: 'Operator reviewed severity, source confidence, and immediate risk.',
    tone: '#7DD3FC',
  },
  accepted: {
    label: 'Accepted',
    description: 'Operator accepted the incident for active response.',
    tone: '#60A5FA',
  },
  command_assigned: {
    label: 'Command Assigned',
    description: 'Incident commander is accountable for coordination and decisions.',
    tone: '#A78BFA',
  },
  containment_in_progress: {
    label: 'Containment',
    description: 'Physical or system actions are limiting immediate exposure.',
    tone: '#F97316',
  },
  response_in_progress: {
    label: 'Response',
    description: 'Responders are executing assigned actions and reporting status.',
    tone: '#FBBF24',
  },
  stabilized: {
    label: 'Stabilized',
    description: 'Immediate threat is controlled and no new escalation is observed.',
    tone: '#34D399',
  },
  monitoring: {
    label: 'Monitoring',
    description: 'SOC is watching for recurrence before final resolution.',
    tone: '#2DD4BF',
  },
  resolved: {
    label: 'Resolved',
    description: 'Response objective is complete; closure evidence can be reviewed.',
    tone: '#86EFAC',
  },
  closed: {
    label: 'Closed',
    description: 'Incident is closed with required notes and response history.',
    tone: '#CBD5E1',
  },
  promoted_to_case: {
    label: 'Promoted to Case',
    description: 'Incident record is handed off to Case Management for investigation.',
    tone: '#C4B5FD',
  },
}

const INCIDENT_TRANSITIONS: Record<IncidentLifecycleStage, IncidentLifecycleStage[]> = {
  detected: ['triaged', 'accepted'],
  triaged: ['accepted', 'closed'],
  accepted: ['command_assigned', 'containment_in_progress'],
  command_assigned: ['containment_in_progress', 'response_in_progress'],
  containment_in_progress: ['response_in_progress', 'stabilized'],
  response_in_progress: ['stabilized', 'monitoring'],
  stabilized: ['monitoring', 'resolved'],
  monitoring: ['resolved', 'response_in_progress'],
  resolved: ['closed', 'promoted_to_case'],
  closed: ['promoted_to_case'],
  promoted_to_case: [],
}

const RESPONDER_ROLE_LABEL: Record<IncidentResponderRole, string> = {
  incident_commander: 'Incident Commander',
  soc_operator: 'SOC Operator',
  site_supervisor: 'Site Supervisor',
  guard: 'Guard / Dispatch Officer',
  facilities: 'Facilities',
  it_access_admin: 'IT / Access Admin',
  hr: 'HR',
  legal: 'Legal',
  law_enforcement_liaison: 'Law Enforcement Liaison',
  vendor_contact: 'Vendor / Contractor Contact',
  executive_stakeholder: 'Executive Stakeholder',
  observer: 'Observer',
}

const RESPONDER_STATUS_LABEL: Record<ResponderStatus, string> = {
  assigned: 'Assigned',
  notified: 'Notified',
  acknowledged: 'Acknowledged',
  en_route: 'En route',
  on_scene: 'On scene',
  completed: 'Completed',
  unavailable: 'Unavailable',
}

const RESPONDER_STATUS_TONE: Record<ResponderStatus, string> = {
  assigned: '#CBD5E1',
  notified: '#93C5FD',
  acknowledged: '#7DD3FC',
  en_route: '#FBBF24',
  on_scene: '#A78BFA',
  completed: '#86EFAC',
  unavailable: '#FCA5A5',
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

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
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
              <div className="w-24 shrink-0 sm:w-[100px]">
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

function createInitialIncidentLifecycle(alert: Alert): IncidentLifecycleEvent[] {
  return [
    {
      id: `life-${alert.id}-detected`,
      fromStage: 'detected',
      toStage: 'triaged',
      changedBy: 'Agora Detection',
      changedAt: alert.timestamp,
      reason: 'Alert correlated from device, access, and camera signals.',
    },
    {
      id: `life-${alert.id}-accepted`,
      fromStage: 'triaged',
      toStage: 'accepted',
      changedBy: CURRENT_OPERATOR,
      changedAt: new Date().toISOString(),
      reason: 'Opened for live response review.',
    },
  ]
}

function createInitialResponders(alert: Alert): IncidentResponder[] {
  const now = new Date().toISOString()
  return [
    {
      id: `responder-${alert.id}-commander`,
      name: CURRENT_OPERATOR,
      role: 'incident_commander',
      status: 'acknowledged',
      responsibility: 'Own live response decisions, escalation, and closure readiness.',
      contact: 'soc-command@agora.example',
      team: 'Corporate Security',
      addedBy: 'Shift policy',
      addedAt: now,
      lastUpdatedAt: now,
      notes: 'Default commander assigned from active SOC shift.',
    },
    {
      id: `responder-${alert.id}-guard`,
      name: 'Austin Guard Dispatch',
      role: 'guard',
      status: alert.severity === 'critical' ? 'en_route' : 'notified',
      responsibility: 'Intercept or observe at the affected floor/entry point.',
      contact: 'Radio Ch. 3',
      team: 'Site Security',
      addedBy: CURRENT_OPERATOR,
      addedAt: now,
      lastUpdatedAt: now,
    },
    {
      id: `responder-${alert.id}-access`,
      name: 'Access Control Admin',
      role: 'it_access_admin',
      status: 'notified',
      responsibility: 'Execute or validate badge/door access changes.',
      contact: 'access-admin@agora.example',
      team: 'IT Security',
      addedBy: 'Agora Orchestration',
      addedAt: now,
      lastUpdatedAt: now,
    },
  ]
}

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

function splitRecommendation(action: string): string[] {
  return action
    .split(/\s+\+\s+|;\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function actionSignature(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(immediately|remote|remotely|all|zones|zone|door|the|to|at|in|on)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function actionSystem(label: string): string {
  const lower = label.toLowerCase()
  if (lower.includes('camera') || lower.includes('evidence') || lower.includes('clip')) {
    return 'Video Management'
  }
  if (lower.includes('badge') || lower.includes('access') || lower.includes('door') || lower.includes('lock')) {
    return 'Access Control'
  }
  if (lower.includes('guard') || lower.includes('patrol') || lower.includes('intercept') || lower.includes('sweep')) {
    return 'Guard Dispatch'
  }
  if (lower.includes('incident record') || lower.includes('ticket')) {
    return 'Case System'
  }
  if (lower.includes('law enforcement') || lower.includes('lea')) {
    return 'External Liaison'
  }
  if (lower.includes('hr') || lower.includes('legal')) {
    return 'HR / Legal'
  }
  if (lower.includes('notify') || lower.includes('alert') || lower.includes('contact')) {
    return 'Communications'
  }
  return 'Agora Orchestration'
}

function queuedDetail(label: string): string {
  const system = actionSystem(label)
  if (system === 'Access Control') return 'Waiting to submit command to Access Control.'
  if (system === 'Guard Dispatch') return 'Waiting to notify the closest available guard.'
  if (system === 'Video Management') return 'Waiting to lock supporting video evidence.'
  if (system === 'Communications') return 'Waiting to send notifications to on-duty contacts.'
  return `Waiting for ${system} acknowledgement.`
}

function runningDetail(action: ExecutionAction): string {
  if (action.system === 'Access Control') return 'Submitting command and waiting for controller acknowledgement.'
  if (action.system === 'Guard Dispatch') return 'Dispatch request sent. Waiting for guard acknowledgement.'
  if (action.system === 'Video Management') return 'Retention lock command sent to video management.'
  if (action.system === 'Communications') return 'Sending notification and collecting delivery receipt.'
  return `Command sent to ${action.system}.`
}

function needsConfirmation(action: ExecutionAction): boolean {
  return action.system === 'Guard Dispatch'
}

function needsManualResolution(action: ExecutionAction): boolean {
  return action.system === 'External Liaison' || action.system === 'HR / Legal'
}

function completionProof(action: ExecutionAction): string {
  const lower = action.label.toLowerCase()
  if (lower.includes('restrict') && lower.includes('badge')) return 'Badge restriction acknowledged across configured access zones.'
  if (lower.includes('lock') && lower.includes('door')) return 'Door controller acknowledged remote lock command.'
  if (action.system === 'Guard Dispatch') return 'Guard Unit G-12 acknowledged dispatch; ETA 2 minutes.'
  if (action.system === 'Video Management') return 'Evidence retained for the configured 30 minute window.'
  if (action.system === 'Communications') return 'Notification delivered to on-duty recipients.'
  if (action.system === 'Case System') return 'Incident record created and linked to this alert.'
  return `${action.system} acknowledged command.`
}

function buildExecutionActions(alertId: string, nba: Alert['nba']): ExecutionAction[] {
  if (!nba) return []

  const seen = new Set<string>()
  const labels = [
    ...splitRecommendation(nba.recommendedAction),
    ...nba.gatedActions,
    ...nba.autoExecuteActions,
  ].filter((label) => {
    const signature = actionSignature(label)
    if (!signature || seen.has(signature)) return false
    seen.add(signature)
    return true
  })

  return labels.map((label, index) => {
    const id = `exec-${alertId}-${index}`
    return {
      id,
      label,
      system: actionSystem(label),
      status: 'queued',
      detail: queuedDetail(label),
    }
  })
}

function formatActionTime(isoString?: string): string {
  if (!isoString) return ''
  return new Date(isoString)
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'America/Chicago',
      timeZoneName: 'short',
    })
    .replace(/\bCST\b|\bCDT\b/, 'CT')
}

type OperatorEntry = {
  id: string
  ts: string     // HH:MM for display
  isoTs: string  // full ISO for date comparison
  entryType: 'note' | 'accepted' | 'override' | 'system'
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
  system: {
    dot: '#38BDF8',
    icon: 'verified',
    iconColor: '#38BDF8',
    cardBg: '#082F49',
    cardBorder: '#0369A1',
    badge: 'System Receipt',
    badgeBg: 'rgba(3, 105, 161, 0.55)',
    badgeText: '#BAE6FD',
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

function ExecutionTracker({
  actions,
  started,
  onManualComplete,
}: {
  actions: ExecutionAction[]
  started: boolean
  onManualComplete: (id: string) => void
}) {
  if (!started || actions.length === 0) return null

  const completeCount = actions.filter((action) => action.status === 'complete').length

  return (
    <section className="rounded-lg border border-[#334155] bg-[#151B26] p-5" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-white">Action Execution</h4>
          <p className="mt-1 text-sm text-[#CBD5E1]">
            {completeCount} of {actions.length} actions complete
          </p>
        </div>
        <span className="rounded-full border border-[#334155] bg-[#0F1117] px-3 py-1 text-sm font-bold text-[#D1D5DB]">
          Execution assurance
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {actions.map((action) => {
          const meta = STATUS_META[action.status]
          return (
            <div
              key={action.id}
              className="rounded-lg border bg-[#0F1117] p-3"
              style={{ borderColor: meta.border }}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`material-symbols-outlined mt-0.5 ${action.status === 'running' ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                  style={{ color: meta.text, fontSize: '20px', lineHeight: 1 }}
                >
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-[1.5] text-white">{action.label}</p>
                      <p className="text-xs font-semibold text-[#94A3B8]">{action.system}</p>
                    </div>
                    <span
                      className="rounded-full border px-2.5 py-1 text-xs font-bold"
                      style={{ backgroundColor: meta.bg, borderColor: meta.border, color: meta.text }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-[1.5] text-[#CBD5E1]">{action.detail}</p>
                  {action.proof && (
                    <p className="mt-2 rounded-md border border-[#334155] bg-[#111827] px-3 py-2 text-sm leading-[1.5] text-[#E5E7EB]">
                      {action.proof}
                    </p>
                  )}
                  {action.updatedAt && (
                    <time className="mt-2 block text-xs font-semibold text-[#94A3B8]" dateTime={action.updatedAt}>
                      Updated {formatActionTime(action.updatedAt)}
                    </time>
                  )}

                  {action.status === 'manual_required' && (
                    <button
                      type="button"
                      onClick={() => onManualComplete(action.id)}
                      aria-label={`Mark manual action complete: ${action.label}`}
                      className="mt-3 min-h-10 rounded-md bg-[#D97706] px-3 text-sm font-bold text-black transition-all hover:bg-[#F59E0B] active:scale-[0.98]"
                    >
                      Mark Manual Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function IncidentLifecyclePanel({
  stage,
  events,
  onStageChange,
}: {
  stage: IncidentLifecycleStage
  events: IncidentLifecycleEvent[]
  onStageChange: (stage: IncidentLifecycleStage, reason: string) => void
}) {
  const transitions = INCIDENT_TRANSITIONS[stage]
  const [nextStage, setNextStage] = useState<IncidentLifecycleStage>(transitions[0] ?? stage)
  const [reason, setReason] = useState('')

  useEffect(() => {
    setNextStage(INCIDENT_TRANSITIONS[stage][0] ?? stage)
    setReason('')
  }, [stage])

  function submit() {
    if (!reason.trim() || nextStage === stage) return
    onStageChange(nextStage, reason.trim())
  }

  return (
    <section className="rounded-lg border border-[#334155] bg-[#151B26] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <span
              className="material-symbols-outlined text-[#7DD3FC]"
              aria-hidden="true"
              style={{ fontSize: '18px', lineHeight: 1 }}
            >
              account_tree
            </span>
            Incident Lifecycle
          </h3>
          <p className="mt-1 text-sm leading-[1.5] text-[#94A3B8]">
            Track live response stage changes with required rationale.
          </p>
        </div>
        <span
          className="shrink-0 rounded-full border border-[#334155] bg-[#111827] px-3 py-1 text-xs font-bold"
          style={{ color: INCIDENT_STAGE_META[stage].tone }}
        >
          {INCIDENT_STAGE_META[stage].label}
        </span>
      </div>

      <p className="mt-3 rounded-md border border-[#334155] bg-[#0F1117] px-3 py-2 text-sm leading-[1.5] text-[#CBD5E1]">
        {INCIDENT_STAGE_META[stage].description}
      </p>

      {transitions.length > 0 && (
        <div className="mt-4 rounded-md border border-[#334155] bg-[#0F1117] p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <label className="text-xs font-bold text-[#CBD5E1]">
              Next stage
              <select
                value={nextStage}
                onChange={(event) => setNextStage(event.target.value as IncidentLifecycleStage)}
                className="mt-1 min-h-10 w-full rounded-md border border-[#475569] bg-[#111827] px-3 text-sm text-white outline-none focus:border-[#7DD3FC]"
                aria-label="Select next incident lifecycle stage"
              >
                {transitions.map((transition) => (
                  <option key={transition} value={transition}>
                    {INCIDENT_STAGE_META[transition].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-[#CBD5E1]">
              Reason
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-1 min-h-10 w-full rounded-md border border-[#475569] bg-[#111827] px-3 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#7DD3FC]"
                placeholder="Required for incident audit trail"
              />
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={!reason.trim() || nextStage === stage}
              className="min-h-10 rounded-md bg-[#2563EB] px-4 text-sm font-bold text-white transition-all hover:bg-[#1D4ED8] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#334155] disabled:text-[#94A3B8]"
            >
              Apply Stage Change
            </button>
          </div>
        </div>
      )}

      <ol className="mt-4 space-y-2">
        {events.slice(-4).reverse().map((event) => (
          <li key={event.id} className="rounded-md border border-[#334155] bg-[#0F1117] px-3 py-2">
            <p className="text-xs font-bold text-white">
              {INCIDENT_STAGE_META[event.fromStage].label} → {INCIDENT_STAGE_META[event.toStage].label}
            </p>
            <p className="mt-1 text-xs text-[#94A3B8]">
              {formatActionTime(event.changedAt)} · {event.changedBy}
            </p>
            {event.reason && (
              <p className="mt-1 text-xs leading-[1.5] text-[#CBD5E1]">{event.reason}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function ResponseTeamPanel({
  responders,
  commander,
  onAddResponder,
  onStatusChange,
}: {
  responders: IncidentResponder[]
  commander?: IncidentResponder
  onAddResponder: (responder: IncidentResponder) => void
  onStatusChange: (id: string, status: ResponderStatus) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    role: 'guard' as IncidentResponderRole,
    status: 'assigned' as ResponderStatus,
    team: '',
    contact: '',
    responsibility: '',
    notes: '',
  })

  function addResponder() {
    if (!form.name.trim() || !form.responsibility.trim()) return
    const now = new Date().toISOString()
    onAddResponder({
      id: `responder-${Date.now()}`,
      name: form.name.trim(),
      role: form.role,
      status: form.status,
      team: form.team.trim() || undefined,
      contact: form.contact.trim() || undefined,
      responsibility: form.responsibility.trim(),
      notes: form.notes.trim() || undefined,
      addedBy: CURRENT_OPERATOR,
      addedAt: now,
      lastUpdatedAt: now,
    })
    setForm({
      name: '',
      role: 'guard',
      status: 'assigned',
      team: '',
      contact: '',
      responsibility: '',
      notes: '',
    })
    setShowForm(false)
  }

  return (
    <section className="rounded-lg border border-[#334155] bg-[#151B26] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <span
              className="material-symbols-outlined text-[#A78BFA]"
              aria-hidden="true"
              style={{ fontSize: '18px', lineHeight: 1 }}
            >
              groups
            </span>
            Response Team
          </h3>
          <p className="mt-1 text-sm leading-[1.5] text-[#94A3B8]">
            Commander and active responders involved in this incident.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="min-h-10 shrink-0 rounded-md border border-[#64748B] px-3 text-sm font-bold text-[#E5E7EB] transition-all hover:bg-[#1F2937] active:scale-[0.98]"
        >
          {showForm ? 'Cancel' : 'Add Responder'}
        </button>
      </div>

      {commander && (
        <div className="mt-4 rounded-md border border-[#4C1D95] bg-[#1F1638] p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-[#C4B5FD]">
            Incident Commander
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-white">{commander.name}</p>
              <p className="mt-1 text-xs text-[#CBD5E1]">
                {commander.team ?? 'Response command'} · {commander.contact ?? 'Contact not set'}
              </p>
            </div>
            <span
              className="w-fit rounded-full border border-[#334155] bg-[#111827] px-2.5 py-1 text-xs font-bold"
              style={{ color: RESPONDER_STATUS_TONE[commander.status] }}
            >
              {RESPONDER_STATUS_LABEL[commander.status]}
            </span>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mt-4 rounded-md border border-[#334155] bg-[#0F1117] p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-[#CBD5E1]">
              Name / group
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-1 min-h-10 w-full rounded-md border border-[#475569] bg-[#111827] px-3 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
                placeholder="e.g. Guard Team Bravo"
              />
            </label>
            <label className="text-xs font-bold text-[#CBD5E1]">
              Role
              <select
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as IncidentResponderRole }))}
                className="mt-1 min-h-10 w-full rounded-md border border-[#475569] bg-[#111827] px-3 text-sm text-white outline-none focus:border-[#A78BFA]"
              >
                {(Object.keys(RESPONDER_ROLE_LABEL) as IncidentResponderRole[]).map((role) => (
                  <option key={role} value={role}>
                    {RESPONDER_ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-[#CBD5E1]">
              Status
              <select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as ResponderStatus }))}
                className="mt-1 min-h-10 w-full rounded-md border border-[#475569] bg-[#111827] px-3 text-sm text-white outline-none focus:border-[#A78BFA]"
              >
                {(Object.keys(RESPONDER_STATUS_LABEL) as ResponderStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {RESPONDER_STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-[#CBD5E1]">
              Team
              <input
                value={form.team}
                onChange={(event) => setForm((prev) => ({ ...prev, team: event.target.value }))}
                className="mt-1 min-h-10 w-full rounded-md border border-[#475569] bg-[#111827] px-3 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
                placeholder="e.g. Site Security"
              />
            </label>
            <label className="text-xs font-bold text-[#CBD5E1] sm:col-span-2">
              Contact
              <input
                value={form.contact}
                onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
                className="mt-1 min-h-10 w-full rounded-md border border-[#475569] bg-[#111827] px-3 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
                placeholder="Radio channel, phone, email, or dispatch system"
              />
            </label>
            <label className="text-xs font-bold text-[#CBD5E1] sm:col-span-2">
              Responsibility
              <textarea
                value={form.responsibility}
                onChange={(event) => setForm((prev) => ({ ...prev, responsibility: event.target.value }))}
                rows={2}
                className="mt-1 w-full resize-none rounded-md border border-[#475569] bg-[#111827] px-3 py-2 text-sm leading-[1.5] text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
                placeholder="What this responder is accountable for during the live response."
              />
            </label>
            <label className="text-xs font-bold text-[#CBD5E1] sm:col-span-2">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                rows={2}
                className="mt-1 w-full resize-none rounded-md border border-[#475569] bg-[#111827] px-3 py-2 text-sm leading-[1.5] text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
                placeholder="Optional context, instructions, or escalation notes."
              />
            </label>
          </div>
          <button
            type="button"
            onClick={addResponder}
            disabled={!form.name.trim() || !form.responsibility.trim()}
            className="mt-3 min-h-10 w-full rounded-md bg-[#7C3AED] px-4 text-sm font-bold text-white transition-all hover:bg-[#6D28D9] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#334155] disabled:text-[#94A3B8]"
          >
            Add to Response Team
          </button>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {responders.map((responder) => (
          <li key={responder.id} className="rounded-md border border-[#334155] bg-[#0F1117] p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{responder.name}</p>
                <p className="mt-1 text-xs font-semibold text-[#94A3B8]">
                  {RESPONDER_ROLE_LABEL[responder.role]}
                  {responder.team ? ` · ${responder.team}` : ''}
                </p>
                <p className="mt-2 text-sm leading-[1.5] text-[#CBD5E1]">
                  {responder.responsibility}
                </p>
                {responder.contact && (
                  <p className="mt-1 text-xs text-[#94A3B8]">{responder.contact}</p>
                )}
              </div>
              <select
                value={responder.status}
                onChange={(event) => onStatusChange(responder.id, event.target.value as ResponderStatus)}
                className="min-h-10 rounded-md border border-[#475569] bg-[#111827] px-3 text-xs font-bold text-white outline-none focus:border-[#A78BFA]"
                aria-label={`Update response status for ${responder.name}`}
                style={{ color: RESPONDER_STATUS_TONE[responder.status] }}
              >
                {(Object.keys(RESPONDER_STATUS_LABEL) as ResponderStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {RESPONDER_STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ---- Main Drawer ----
export function IncidentDetailDrawer({ alert, detail, onClose, onAccept, onOverride }: Props) {
  const [clipEvent, setClipEvent] = useState<CorrelatedEvent | null>(null)
  const [whyOpen, setWhyOpen] = useState(false)
  const [operatorLog, setOperatorLog] = useState<OperatorEntry[]>([])
  const [noteText, setNoteText] = useState('')
  const initialLifecycleEvents = useMemo(() => createInitialIncidentLifecycle(alert), [alert])
  const initialResponders = useMemo(() => createInitialResponders(alert), [alert])
  const [incidentStage, setIncidentStage] = useState<IncidentLifecycleStage>('accepted')
  const [lifecycleEvents, setLifecycleEvents] = useState<IncidentLifecycleEvent[]>(initialLifecycleEvents)
  const [responders, setResponders] = useState<IncidentResponder[]>(initialResponders)
  const actionPlanKey = useMemo(
    () =>
      [
        alert.id,
        alert.nba?.recommendedAction ?? '',
        ...(alert.nba?.gatedActions ?? []),
        ...(alert.nba?.autoExecuteActions ?? []),
      ].join('|'),
    [alert.id, alert.nba?.autoExecuteActions, alert.nba?.gatedActions, alert.nba?.recommendedAction]
  )
  const initialExecutionActions = useMemo(
    () => buildExecutionActions(alert.id, alert.nba),
    [actionPlanKey]
  )
  const [executionActions, setExecutionActions] = useState<ExecutionAction[]>(initialExecutionActions)
  const [executionStarted, setExecutionStarted] = useState(false)
  const sevBadge = SEVERITY_BADGE[alert.severity]
  const isDeterrent = alert.type === 'deterrent'
  const { nba, sop } = alert
  const actionJustificationId = `action-justification-${alert.id}`
  const completedActionCount = executionActions.filter((action) => action.status === 'complete').length
  const allActionsComplete = executionStarted && executionActions.length > 0 && completedActionCount === executionActions.length
  const incidentCommander = responders.find((responder) => responder.role === 'incident_commander')

  const allItems: TimelineItem[] = [
    ...detail.correlatedEvents.map((e) => ({ kind: 'event' as const, data: e })),
    ...operatorLog.map((e) => ({ kind: 'operator' as const, data: e })),
  ].sort((a, b) => {
    const aTime =
      a.kind === 'operator'
        ? new Date(a.data.isoTs).getTime()
        : new Date(eventDateTime(alert.timestamp, a.data.ts)).getTime()
    const bTime =
      b.kind === 'operator'
        ? new Date(b.data.isoTs).getTime()
        : new Date(eventDateTime(alert.timestamp, b.data.ts)).getTime()
    return aTime - bTime
  })

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

  function addSystemReceipt(text: string) {
    setOperatorLog((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}-${prev.length}`,
        ...nowEntry(),
        entryType: 'system',
        text,
        author: 'Agora Orchestration',
      },
    ])
  }

  function addLifecycleTransition(nextStage: IncidentLifecycleStage, reason: string) {
    const previousStage = incidentStage
    const changedAt = new Date().toISOString()
    setIncidentStage(nextStage)
    setLifecycleEvents((prev) => [
      ...prev,
      {
        id: `life-${Date.now()}`,
        fromStage: previousStage,
        toStage: nextStage,
        changedBy: CURRENT_OPERATOR,
        changedAt,
        reason,
      },
    ])
    addSystemReceipt(
      `Incident lifecycle changed: ${INCIDENT_STAGE_META[previousStage].label} → ${INCIDENT_STAGE_META[nextStage].label}. ${reason}`
    )
  }

  function addResponder(responder: IncidentResponder) {
    setResponders((prev) => {
      const withoutCommander =
        responder.role === 'incident_commander'
          ? prev.filter((item) => item.role !== 'incident_commander')
          : prev
      return [...withoutCommander, responder]
    })
    addSystemReceipt(
      `${responder.name} added as ${RESPONDER_ROLE_LABEL[responder.role]} — ${responder.responsibility}`
    )
    if (responder.role === 'incident_commander') {
      addLifecycleTransition('command_assigned', `${responder.name} assigned as incident commander.`)
    }
  }

  function updateResponderStatus(id: string, status: ResponderStatus) {
    const responder = responders.find((item) => item.id === id)
    if (!responder || responder.status === status) return
    setResponders((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              lastUpdatedAt: new Date().toISOString(),
            }
          : item
      )
    )
    addSystemReceipt(
      `${responder.name} status changed: ${RESPONDER_STATUS_LABEL[responder.status]} → ${RESPONDER_STATUS_LABEL[status]}.`
    )
  }

  function updateExecutionAction(id: string, patch: Partial<ExecutionAction>) {
    setExecutionActions((prev) =>
      prev.map((action) =>
        action.id === id
          ? {
              ...action,
              ...patch,
              updatedAt: patch.updatedAt ?? new Date().toISOString(),
            }
          : action
      )
    )
  }

  function handleAccept() {
    if (!nba) return
    if (executionStarted) {
      if (allActionsComplete) {
        onAccept()
      }
      return
    }

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
    setExecutionStarted(true)
    if (incidentStage === 'accepted' || incidentStage === 'command_assigned') {
      addLifecycleTransition('containment_in_progress', 'Recommended response actions accepted and execution started.')
    }
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

  function handleManualComplete(id: string) {
    const action = executionActions.find((item) => item.id === id)
    if (!action) return
    const proof = `${action.system} confirmed manually by ${CURRENT_OPERATOR}.`
    updateExecutionAction(id, {
      status: 'complete',
      detail: 'Manual confirmation recorded.',
      proof,
    })
    addSystemReceipt(`${action.label} — ${proof}`)
  }

  useEffect(() => {
    setExecutionActions(initialExecutionActions)
    setExecutionStarted(false)
    setIncidentStage('accepted')
    setLifecycleEvents(initialLifecycleEvents)
    setResponders(initialResponders)
  }, [actionPlanKey, initialExecutionActions, initialLifecycleEvents, initialResponders])

  useEffect(() => {
    if (!executionStarted) return

    const timers: ReturnType<typeof setTimeout>[] = []
    const actionsToExecute = executionActions

    actionsToExecute.forEach((action, index) => {
      const startDelay = 250 + index * 450
      const outcomeDelay = 1000 + index * 700

      timers.push(
        setTimeout(() => {
          updateExecutionAction(action.id, {
            status: 'running',
            detail: runningDetail(action),
          })
        }, startDelay)
      )

      timers.push(
        setTimeout(() => {
          if (needsManualResolution(action)) {
            const proof = `${action.system} requires phone or policy confirmation outside Agora.`
            updateExecutionAction(action.id, {
              status: 'manual_required',
              detail: 'Manual follow-up required before this action can be marked complete.',
              proof,
            })
            addSystemReceipt(`${action.label} — manual confirmation required.`)
            return
          }

          if (needsConfirmation(action)) {
            updateExecutionAction(action.id, {
              status: 'needs_confirmation',
              detail: 'Dispatch request sent. Awaiting guard acknowledgement.',
              proof: 'Dispatch request delivered to guard channel.',
            })
            addSystemReceipt(`${action.label} — dispatch request delivered; awaiting acknowledgement.`)
            return
          }

          const proof = completionProof(action)
          updateExecutionAction(action.id, {
            status: 'complete',
            detail: 'Action completed and acknowledged by the target system.',
            proof,
          })
          addSystemReceipt(`${action.label} — ${proof}`)
        }, outcomeDelay)
      )

      if (needsConfirmation(action)) {
        timers.push(
          setTimeout(() => {
            const proof = completionProof(action)
            updateExecutionAction(action.id, {
              status: 'complete',
              detail: 'Guard dispatch acknowledged.',
              proof,
            })
            addSystemReceipt(`${action.label} — ${proof}`)
          }, outcomeDelay + 1200)
        )
      }
    })

    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [alert.id, executionStarted])

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
      executionActions,
      incidentLifecycle: {
        currentStage: incidentStage,
        events: lifecycleEvents,
      },
      responseTeam: responders,
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
    <div className="fixed inset-0 z-40 flex bg-black/60 p-0 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-none flex-col bg-[#0F1117] shadow-2xl"
        style={{ borderLeft: `5px solid ${sevBadge.rail}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[#334155] px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
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
            <h2 className="min-w-0 text-lg font-bold leading-tight text-white">{alert.title}</h2>
            <span
              className="flex shrink-0 items-center gap-1 rounded-full border border-[#334155] bg-[#111827] px-3 py-1 text-sm font-bold"
              style={{ color: INCIDENT_STAGE_META[incidentStage].tone }}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: '14px', lineHeight: 1 }}
              >
                account_tree
              </span>
              {INCIDENT_STAGE_META[incidentStage].label}
            </span>
            {incidentCommander && (
              <span className="flex min-w-0 shrink-0 items-center gap-1 rounded-full border border-[#4C1D95] bg-[#1F1638] px-3 py-1 text-sm font-bold text-[#C4B5FD]">
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: '14px', lineHeight: 1 }}
                >
                  military_tech
                </span>
                Commander: {incidentCommander.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close incident response drawer"
            className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium text-[#CBD5E1] transition-all hover:bg-[#1F2937] hover:text-white active:scale-[0.98] xl:ml-4"
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
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)] xl:overflow-hidden">
          {/* LEFT — Evidence */}
          <div
            className="min-w-0 border-b border-[#334155] p-4 sm:p-6 xl:min-h-0 xl:overflow-y-auto xl:border-b-0 xl:border-r"
            style={{ scrollbarGutter: 'stable' }}
          >
            <p className="mb-2 break-words text-sm font-medium text-[#CBD5E1]">
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
            className="min-w-0 p-4 sm:p-6 xl:min-h-0 xl:overflow-y-auto"
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
                    disabled={executionStarted}
                    role="button"
                    aria-label={
                      executionStarted
                        ? `Recommendation accepted: ${nba.recommendedAction}`
                        : `Accept recommended action: ${nba.recommendedAction}`
                    }
                    aria-describedby={actionJustificationId}
                    aria-keyshortcuts="Meta+Enter Control+Enter"
                    className={`min-h-[52px] w-full max-w-4xl rounded-lg px-4 py-3 text-left text-sm font-bold leading-[1.5] text-white transition-all ${
                      executionStarted
                        ? 'cursor-default border border-[#334155] bg-[#1F2937] text-[#D1D5DB]'
                        : 'bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98]'
                    }`}
                  >
                    {executionStarted ? 'Recommendation accepted' : nba.recommendedAction}
                  </button>
                  <p id={actionJustificationId} className="mt-2 text-sm font-medium leading-[1.5] text-[#CBD5E1]">
                    {nba.rationale}
                  </p>
                </section>

                <ExecutionTracker
                  actions={executionActions}
                  started={executionStarted}
                  onManualComplete={handleManualComplete}
                />

                <IncidentLifecyclePanel
                  stage={incidentStage}
                  events={lifecycleEvents}
                  onStageChange={addLifecycleTransition}
                />

                <ResponseTeamPanel
                  responders={responders}
                  commander={incidentCommander}
                  onAddResponder={addResponder}
                  onStatusChange={updateResponderStatus}
                />

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
                <footer className="sticky bottom-0 z-10 -mx-4 -mb-4 border-t border-[#334155] bg-[#0F1117]/95 px-4 py-4 backdrop-blur transform-gpu will-change-transform sm:-mx-6 sm:-mb-6 sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="order-2 text-xs text-[#94A3B8] sm:order-1">
                      Every action is logged with attribution
                    </p>
                    <div className="order-1 flex flex-col gap-2 sm:order-2 sm:flex-row sm:justify-end">
                      <button
                        onClick={handleOverride}
                        aria-label="Override AI recommendation with reason"
                        className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-[#64748B] px-4 text-sm font-semibold text-[#E5E7EB] transition-all hover:bg-[#1F2937] hover:text-white active:scale-[0.98] sm:w-auto sm:min-w-[13rem]"
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
                      <button
                        onClick={handleAccept}
                        disabled={executionStarted && !allActionsComplete}
                        aria-label={
                          executionStarted
                            ? allActionsComplete
                              ? 'Complete response after verified execution'
                              : `Execution in progress: ${completedActionCount} of ${executionActions.length} actions complete`
                            : 'Confirm and accept AI recommendation'
                        }
                        aria-describedby={actionJustificationId}
                        aria-keyshortcuts="Meta+Enter Control+Enter"
                        className={`flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-bold transition-all sm:w-auto sm:min-w-[17rem] ${
                          executionStarted && !allActionsComplete
                            ? 'cursor-not-allowed border border-[#334155] bg-[#1F2937] text-[#94A3B8]'
                            : 'bg-[#1D4ED8] text-white hover:bg-[#2563EB] active:scale-[0.98]'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined"
                          aria-hidden="true"
                          style={{ fontSize: '18px', lineHeight: 1 }}
                        >
                          {executionStarted && !allActionsComplete ? 'sync' : 'check_circle'}
                        </span>
                        <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                          <span>
                            {executionStarted
                              ? allActionsComplete
                                ? 'Complete Response'
                                : `Executing ${completedActionCount}/${executionActions.length}`
                              : 'Accept AI Recommendation'}
                          </span>
                          {!executionStarted && (
                            <kbd className="rounded border border-white/25 px-1.5 py-0.5 text-[11px] font-semibold text-white/80">
                              Cmd/Ctrl+Enter
                            </kbd>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
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
