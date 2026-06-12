'use client'

import { useMemo, useState } from 'react'
import type { Alert, IncidentLifecycleStage, Severity } from '@/lib/types'
import { ALERT_DETAILS } from '@/lib/mock-data/scenarios'
import { useSimulation } from './useSimulation'
import { IncidentDetailDrawer } from './IncidentDetailDrawer'

type AssignmentState = 'unassigned' | 'claimed' | 'assigned' | 'in_progress'
type SlaState = 'breached' | 'at_risk' | 'healthy'
type OperatorAvailability = 'available' | 'busy' | 'offline'

interface SupervisorMeta {
  slaSeconds: number
  assignmentState: AssignmentState
  assignedTo?: string
  lifecycleStage: IncidentLifecycleStage
  firstActionTaken: boolean
  timeToClaimSeconds?: number
}

interface OperatorLoad {
  name: string
  availability: OperatorAvailability
  assigned: number
  critical: number
  avgFirstActionSeconds: number
  lastActivity: string
}

const SUPERVISOR_META: Record<string, SupervisorMeta> = {
  'alert-001': {
    slaSeconds: 510,
    assignmentState: 'claimed',
    assignedTo: 'J. Torres',
    lifecycleStage: 'accepted',
    firstActionTaken: false,
    timeToClaimSeconds: 92,
  },
  'alert-002': {
    slaSeconds: 210,
    assignmentState: 'unassigned',
    lifecycleStage: 'triaged',
    firstActionTaken: false,
  },
  'alert-003': {
    slaSeconds: -420,
    assignmentState: 'unassigned',
    lifecycleStage: 'detected',
    firstActionTaken: false,
  },
  'alert-004': {
    slaSeconds: 720,
    assignmentState: 'assigned',
    assignedTo: 'N. Patel',
    lifecycleStage: 'accepted',
    firstActionTaken: true,
    timeToClaimSeconds: 180,
  },
  'alert-005': {
    slaSeconds: 1160,
    assignmentState: 'assigned',
    assignedTo: 'A. Morgan',
    lifecycleStage: 'monitoring',
    firstActionTaken: true,
    timeToClaimSeconds: 240,
  },
  'alert-006': {
    slaSeconds: 260,
    assignmentState: 'unassigned',
    lifecycleStage: 'triaged',
    firstActionTaken: false,
  },
}

const OPERATORS: OperatorLoad[] = [
  {
    name: 'J. Torres',
    availability: 'busy',
    assigned: 2,
    critical: 1,
    avgFirstActionSeconds: 188,
    lastActivity: '42s ago',
  },
  {
    name: 'N. Patel',
    availability: 'available',
    assigned: 1,
    critical: 0,
    avgFirstActionSeconds: 224,
    lastActivity: '1m ago',
  },
  {
    name: 'A. Morgan',
    availability: 'available',
    assigned: 1,
    critical: 0,
    avgFirstActionSeconds: 305,
    lastActivity: '3m ago',
  },
  {
    name: 'L. Kim',
    availability: 'available',
    assigned: 0,
    critical: 0,
    avgFirstActionSeconds: 0,
    lastActivity: '8m ago',
  },
  {
    name: 'R. Singh',
    availability: 'offline',
    assigned: 0,
    critical: 0,
    avgFirstActionSeconds: 0,
    lastActivity: 'Offline',
  },
]

const STAGE_LABEL: Record<IncidentLifecycleStage, string> = {
  detected: 'Detected',
  triaged: 'Triaged',
  accepted: 'Accepted',
  command_assigned: 'Command Assigned',
  containment_in_progress: 'Containment',
  response_in_progress: 'Response',
  stabilized: 'Stabilized',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
  closed: 'Closed',
  promoted_to_case: 'Promoted to Case',
}

const SEVERITY_META: Record<Severity, { label: string; tone: string; bg: string; weight: number }> = {
  critical: { label: 'Critical', tone: '#FF453A', bg: '#210A08', weight: 4 },
  high: { label: 'High', tone: '#FBBF24', bg: '#2A1706', weight: 3 },
  medium: { label: 'Medium', tone: '#D1D5DB', bg: '#1E293B', weight: 2 },
  low: { label: 'Low', tone: '#9CA3AF', bg: '#111827', weight: 1 },
}

const ASSIGNMENT_LABEL: Record<AssignmentState, string> = {
  unassigned: 'Unassigned',
  claimed: 'Claimed',
  assigned: 'Assigned',
  in_progress: 'In Progress',
}

const ASSIGNMENT_TONE: Record<AssignmentState, string> = {
  unassigned: '#FFB4AE',
  claimed: '#93C5FD',
  assigned: '#CBD5E1',
  in_progress: '#86EFAC',
}

function fallbackMeta(alert: Alert): SupervisorMeta {
  return {
    slaSeconds: alert.severity === 'critical' ? 300 : alert.severity === 'high' ? 900 : 1800,
    assignmentState: 'unassigned',
    lifecycleStage: alert.status === 'enriching' ? 'detected' : 'triaged',
    firstActionTaken: false,
  }
}

function formatDuration(seconds: number): string {
  const abs = Math.abs(seconds)
  if (abs < 60) return `${abs}s`
  const minutes = Math.floor(abs / 60)
  const rem = abs % 60
  if (minutes < 60) return `${minutes}m ${String(rem).padStart(2, '0')}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

function formatSla(seconds: number): string {
  return seconds < 0 ? `${formatDuration(seconds)} overdue` : `${formatDuration(seconds)} left`
}

function slaState(seconds: number): SlaState {
  if (seconds < 0) return 'breached'
  if (seconds <= 300) return 'at_risk'
  return 'healthy'
}

function scoreIncident(alert: Alert, meta: SupervisorMeta): number {
  const severityWeight = SEVERITY_META[alert.severity].weight * 1000
  const unassignedCritical = alert.severity === 'critical' && meta.assignmentState === 'unassigned' ? 2000 : 0
  const noFirstAction = !meta.firstActionTaken ? 500 : 0
  const slaWeight = slaState(meta.slaSeconds) === 'breached' ? 900 : slaState(meta.slaSeconds) === 'at_risk' ? 600 : 0
  return severityWeight + unassignedCritical + noFirstAction + slaWeight + Math.min(alert.ageSeconds, 3600) / 10
}

function availabilityTone(status: OperatorAvailability): string {
  if (status === 'available') return '#86EFAC'
  if (status === 'busy') return '#FCD34D'
  return '#94A3B8'
}

function MetricCard({
  label,
  value,
  detail,
  tone = '#E5E7EB',
}: {
  label: string
  value: string | number
  detail: string
  tone?: string
}) {
  return (
    <article className="rounded-lg border border-[#273142] bg-[#171D29] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className="mt-2 text-2xl font-black leading-none" style={{ color: tone }}>
        {value}
      </p>
      <p className="mt-2 text-sm leading-[1.45] text-[#CBD5E1]">{detail}</p>
    </article>
  )
}

function SupervisorIncidentRow({
  alert,
  meta,
  onOpen,
  onClaim,
  onAssign,
}: {
  alert: Alert
  meta: SupervisorMeta
  onOpen: (alert: Alert) => void
  onClaim: (alert: Alert) => void
  onAssign: (alert: Alert, operator: string) => void
}) {
  const severity = SEVERITY_META[alert.severity]
  const sla = slaState(meta.slaSeconds)
  const slaTone = sla === 'breached' ? '#FF453A' : sla === 'at_risk' ? '#FCD34D' : '#86EFAC'
  const confidence = alert.nba ? Math.round(alert.nba.confidence * 100) : null

  return (
    <article
      className="rounded-lg border border-[#273142] bg-[#151B26] p-4"
      style={{
        borderLeft: `5px solid ${
          meta.assignmentState === 'unassigned' && alert.severity === 'critical' ? '#FF453A' : severity.tone
        }`,
      }}
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(220px,0.35fr)_minmax(260px,0.45fr)] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border border-[#334155] px-2.5 py-1 text-sm font-black"
              style={{ backgroundColor: severity.bg, color: severity.tone }}
            >
              {severity.label}
            </span>
            <span
              className="rounded-full border border-[#334155] bg-[#0F1117] px-2.5 py-1 text-sm font-bold"
              style={{ color: ASSIGNMENT_TONE[meta.assignmentState] }}
            >
              {ASSIGNMENT_LABEL[meta.assignmentState]}
            </span>
            <span className="rounded-full border border-[#334155] bg-[#0F1117] px-2.5 py-1 text-sm font-bold text-[#CBD5E1]">
              {STAGE_LABEL[meta.lifecycleStage]}
            </span>
          </div>
          <h3 className="mt-3 text-base font-bold leading-[1.4] text-white">{alert.title}</h3>
          <p className="mt-1 text-sm leading-[1.5] text-[#CBD5E1]">
            {alert.siteName} · {alert.location}
          </p>
          <p className="mt-2 text-sm leading-[1.5] text-[#94A3B8]">
            {alert.sources.length} sources
            {confidence != null ? ` · AI ${confidence}%` : ' · AI enriching'}
            {' '}· Open {formatDuration(alert.ageSeconds)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-1">
          <div className="rounded-md border border-[#334155] bg-[#0F1117] px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">SLA</p>
            <p className="mt-1 text-sm font-black" style={{ color: slaTone }}>
              {formatSla(meta.slaSeconds)}
            </p>
          </div>
          <div className="rounded-md border border-[#334155] bg-[#0F1117] px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Owner</p>
            <p className="mt-1 truncate text-sm font-bold text-white">
              {meta.assignedTo ?? 'Unassigned'}
            </p>
          </div>
          <div className="rounded-md border border-[#334155] bg-[#0F1117] px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">First Action</p>
            <p className="mt-1 text-sm font-bold text-white">
              {meta.firstActionTaken ? 'Recorded' : 'Pending'}
            </p>
          </div>
          <div className="rounded-md border border-[#334155] bg-[#0F1117] px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Claim Time</p>
            <p className="mt-1 text-sm font-bold text-white">
              {meta.timeToClaimSeconds ? formatDuration(meta.timeToClaimSeconds) : 'None'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-1">
          <button
            type="button"
            onClick={() => onOpen(alert)}
            className="min-h-11 rounded-md bg-[#2563EB] px-3 text-sm font-bold text-white transition-colors hover:bg-[#1D4ED8]"
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => onClaim(alert)}
            disabled={meta.assignedTo === 'J. Torres'}
            className="min-h-11 rounded-md border border-[#64748B] px-3 text-sm font-bold text-[#E5E7EB] transition-colors hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:text-[#94A3B8]"
          >
            Claim
          </button>
          <label className="block">
            <span className="sr-only">Assign incident to operator</span>
            <select
              value={meta.assignedTo ?? ''}
              onChange={(event) => onAssign(alert, event.target.value)}
              className="min-h-11 w-full rounded-md border border-[#64748B] bg-[#111827] px-3 text-sm font-bold text-[#E5E7EB] outline-none focus:border-[#60A5FA]"
              aria-label={`Assign ${alert.title}`}
            >
              <option value="">Assign...</option>
              {OPERATORS.filter((operator) => operator.availability !== 'offline').map((operator) => (
                <option key={operator.name} value={operator.name}>
                  {operator.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </article>
  )
}

export default function SupervisorView() {
  const { alerts } = useSimulation()
  const [assignmentOverrides, setAssignmentOverrides] = useState<Record<string, string>>({})
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all')
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | AssignmentState>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const incidentRows = useMemo(() => {
    return alerts
      .map((alert) => {
        const base = SUPERVISOR_META[alert.id] ?? fallbackMeta(alert)
        const override = assignmentOverrides[alert.id]
        const meta: SupervisorMeta = override
          ? {
              ...base,
              assignmentState: override === 'J. Torres' ? 'claimed' : 'assigned',
              assignedTo: override,
              timeToClaimSeconds: base.timeToClaimSeconds ?? Math.min(alert.ageSeconds, 360),
            }
          : base
        return { alert, meta }
      })
      .filter(({ alert, meta }) => severityFilter === 'all' || alert.severity === severityFilter)
      .filter(({ meta }) => assignmentFilter === 'all' || meta.assignmentState === assignmentFilter)
      .sort((a, b) => scoreIncident(b.alert, b.meta) - scoreIncident(a.alert, a.meta))
  }, [alerts, assignmentFilter, assignmentOverrides, severityFilter])

  const selectedAlert = alerts.find((alert) => alert.id === selectedId) ?? null
  const drawerDetail = selectedAlert ? ALERT_DETAILS[selectedAlert.id] : null

  const allRows = alerts.map((alert) => {
    const base = SUPERVISOR_META[alert.id] ?? fallbackMeta(alert)
    const override = assignmentOverrides[alert.id]
    const meta: SupervisorMeta = override
      ? {
          ...base,
          assignmentState: override === 'J. Torres' ? 'claimed' : 'assigned',
          assignedTo: override,
          timeToClaimSeconds: base.timeToClaimSeconds ?? Math.min(alert.ageSeconds, 360),
        }
      : base
    return { alert, meta }
  })

  const openCount = allRows.length
  const unassignedCritical = allRows.filter(
    ({ alert, meta }) => alert.severity === 'critical' && meta.assignmentState === 'unassigned'
  )
  const slaAtRisk = allRows.filter(({ meta }) => slaState(meta.slaSeconds) === 'at_risk')
  const slaBreached = allRows.filter(({ meta }) => slaState(meta.slaSeconds) === 'breached')
  const claimedRows = allRows.filter(({ meta }) => typeof meta.timeToClaimSeconds === 'number')
  const avgClaim =
    claimedRows.length > 0
      ? Math.round(
          claimedRows.reduce((sum, row) => sum + (row.meta.timeToClaimSeconds ?? 0), 0) / claimedRows.length
        )
      : 0
  const availableOperators = OPERATORS.filter((operator) => operator.availability === 'available').length
  const oldestUnclaimed = allRows
    .filter(({ meta }) => meta.assignmentState === 'unassigned')
    .sort((a, b) => b.alert.ageSeconds - a.alert.ageSeconds)[0]

  function assign(alert: Alert, operatorName: string) {
    if (!operatorName) return
    setAssignmentOverrides((prev) => ({ ...prev, [alert.id]: operatorName }))
  }

  function claim(alert: Alert) {
    assign(alert, 'J. Torres')
  }

  return (
    <div className="space-y-5 bg-[#0F1117]">
      <section className="rounded-xl border border-[#273142] bg-[#171D29] p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">GSOC Supervisor Queue</h2>
            <p className="mt-1 max-w-3xl text-sm leading-[1.5] text-[#CBD5E1]">
              Live ownership, SLA health, and unclaimed incident intake across active sites.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value as 'all' | Severity)}
              className="min-h-11 rounded-md border border-[#475569] bg-[#111827] px-3 text-sm font-bold text-[#E5E7EB] outline-none focus:border-[#60A5FA]"
              aria-label="Filter incidents by severity"
            >
              <option value="all">All severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={assignmentFilter}
              onChange={(event) => setAssignmentFilter(event.target.value as 'all' | AssignmentState)}
              className="min-h-11 rounded-md border border-[#475569] bg-[#111827] px-3 text-sm font-bold text-[#E5E7EB] outline-none focus:border-[#60A5FA]"
              aria-label="Filter incidents by assignment state"
            >
              <option value="all">All ownership</option>
              <option value="unassigned">Unassigned</option>
              <option value="claimed">Claimed</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In progress</option>
            </select>
          </div>
        </div>

        {unassignedCritical.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-[#7F1D1D] bg-[#210A08] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold leading-[1.5] text-[#FFB4AE]">
              {unassignedCritical.length} critical incident{unassignedCritical.length === 1 ? '' : 's'} unassigned.
              Oldest unclaimed: {oldestUnclaimed ? formatDuration(oldestUnclaimed.alert.ageSeconds) : 'n/a'}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSeverityFilter('critical')
                setAssignmentFilter('unassigned')
              }}
              className="min-h-10 rounded-md bg-[#FF453A] px-4 text-sm font-black text-black transition-colors hover:bg-[#FF6B61]"
            >
              Review Unassigned Critical
            </button>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <MetricCard label="Open" value={openCount} detail="Active incoming incidents" />
        <MetricCard label="Unassigned Critical" value={unassignedCritical.length} detail="Need owner now" tone="#FF453A" />
        <MetricCard label="SLA At Risk" value={slaAtRisk.length} detail="Due inside 5 min" tone="#FCD34D" />
        <MetricCard label="SLA Breached" value={slaBreached.length} detail="Past target" tone="#FF453A" />
        <MetricCard label="Avg Claim" value={avgClaim ? formatDuration(avgClaim) : 'n/a'} detail="Claimed incidents" tone="#93C5FD" />
        <MetricCard label="Available Ops" value={availableOperators} detail="Can take work" tone="#86EFAC" />
        <MetricCard
          label="Oldest Unclaimed"
          value={oldestUnclaimed ? formatDuration(oldestUnclaimed.alert.ageSeconds) : 'None'}
          detail={oldestUnclaimed ? oldestUnclaimed.alert.severity : 'No gaps'}
          tone={oldestUnclaimed ? '#FCD34D' : '#86EFAC'}
        />
      </section>

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Prioritized Open Incidents</h3>
              <p className="mt-1 text-sm text-[#94A3B8]">
                Sorted by unassigned critical, SLA risk, missing first action, severity, then age.
              </p>
            </div>
            <span className="w-fit rounded-full border border-[#334155] bg-[#171D29] px-3 py-1 text-sm font-bold text-[#CBD5E1]">
              {incidentRows.length} shown
            </span>
          </div>

          {incidentRows.length === 0 ? (
            <div className="rounded-lg border border-[#273142] bg-[#151B26] p-5 text-sm text-[#CBD5E1]">
              No incidents match the current filters.
            </div>
          ) : (
            incidentRows.map(({ alert, meta }) => (
              <SupervisorIncidentRow
                key={alert.id}
                alert={alert}
                meta={meta}
                onOpen={(target) => setSelectedId(target.id)}
                onClaim={claim}
                onAssign={assign}
              />
            ))
          )}
        </section>

        <aside className="space-y-3">
          <div>
            <h3 className="text-base font-bold text-white">Operator Workload</h3>
            <p className="mt-1 text-sm text-[#94A3B8]">Shift capacity and response load.</p>
          </div>
          {OPERATORS.map((operator) => (
            <article key={operator.name} className="rounded-lg border border-[#273142] bg-[#171D29] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{operator.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide" style={{ color: availabilityTone(operator.availability) }}>
                    {operator.availability}
                  </p>
                </div>
                <span className="rounded-full border border-[#334155] bg-[#0F1117] px-2.5 py-1 text-sm font-bold text-[#CBD5E1]">
                  {operator.assigned} assigned
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-md bg-[#0F1117] px-2 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Critical</p>
                  <p className="mt-1 text-sm font-black text-white">{operator.critical}</p>
                </div>
                <div className="rounded-md bg-[#0F1117] px-2 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">First Action</p>
                  <p className="mt-1 text-sm font-black text-white">
                    {operator.avgFirstActionSeconds ? formatDuration(operator.avgFirstActionSeconds) : 'n/a'}
                  </p>
                </div>
                <div className="rounded-md bg-[#0F1117] px-2 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">Activity</p>
                  <p className="mt-1 text-sm font-black text-white">{operator.lastActivity}</p>
                </div>
              </div>
            </article>
          ))}
        </aside>
      </div>

      {selectedAlert && drawerDetail && (
        <IncidentDetailDrawer
          alert={selectedAlert}
          detail={drawerDetail}
          onClose={() => setSelectedId(null)}
          onAccept={() => claim(selectedAlert)}
          onOverride={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}
