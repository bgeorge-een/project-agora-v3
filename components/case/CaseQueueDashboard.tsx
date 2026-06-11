'use client'

import type { Case, CaseLifecycleStage, Severity } from '@/lib/types'
import { MOCK_CASES } from '@/lib/mock-data/scenarios'

type QueueCase = Case & {
  lifecycleStage: CaseLifecycleStage
  assigneeTeam: string
  caseType: string
  lastActivity: string
  priorityReason: string
  evidenceCount: number
  taskCount: number
  completedTaskCount: number
}

const CASE_STAGE_LABEL: Record<CaseLifecycleStage, string> = {
  draft: 'Draft',
  open: 'Open',
  triage: 'Triage',
  under_investigation: 'Under Investigation',
  pending_external_input: 'Pending External Input',
  pending_approval: 'Pending Approval',
  closed_substantiated: 'Closed - Substantiated',
  closed_unsubstantiated: 'Closed - Unsubstantiated',
  closed_inconclusive: 'Closed - Inconclusive',
  reopened: 'Reopened',
  archived: 'Archived',
}

const SEVERITY_TONE: Record<Severity, string> = {
  critical: 'border-[#7F1D1D] bg-[#2A1212] text-[#FCA5A5]',
  high: 'border-[#7C2D12] bg-[#2A1711] text-[#FDBA74]',
  medium: 'border-[#713F12] bg-[#241A0A] text-[#FCD34D]',
  low: 'border-[#14532D] bg-[#0E2218] text-[#86EFAC]',
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

function daysAgo(days: number) {
  const date = new Date('2026-06-11T16:00:00Z')
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function daysFrom(days: number) {
  const date = new Date('2026-06-11T16:00:00Z')
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

const baseCase = MOCK_CASES[0]

const QUEUE_CASES: QueueCase[] = [
  {
    ...baseCase,
    lifecycleStage: 'under_investigation',
    assigneeTeam: 'Corporate Security',
    caseType: 'Unauthorized Access',
    lastActivity: '12 min ago',
    priorityReason: 'Critical incident promoted from SOC response; HR and Legal review pending.',
    evidenceCount: 7,
    taskCount: 5,
    completedTaskCount: 2,
  },
  {
    ...baseCase,
    id: 'case-002',
    incidentId: 'inc-004',
    title: 'Tailgating at Cedar Park loading dock',
    severity: 'high',
    status: 'waiting',
    owner: 'M. Okafor',
    siteId: 'site-warehouse',
    siteName: 'Cedar Park Warehouse',
    location: 'Loading Dock B',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
    sla: { dueAt: daysFrom(-1), breached: true },
    lifecycleStage: 'pending_external_input',
    tags: ['tailgating', 'warehouse', 'campaign-001'],
    openQuestions: [
      'Was the individual escorted after entry?',
      'Does vehicle HXT-7291 connect to the Austin HQ access probing case?',
    ],
    assigneeTeam: 'Regional Security',
    caseType: 'Tailgating',
    lastActivity: '1 day ago',
    priorityReason: 'Out of SLA; waiting on warehouse supervisor witness statement.',
    evidenceCount: 5,
    taskCount: 4,
    completedTaskCount: 1,
  },
  {
    ...baseCase,
    id: 'case-003',
    incidentId: undefined,
    title: 'After-hours motion in executive suite',
    severity: 'medium',
    status: 'new',
    owner: 'A. Nguyen',
    siteName: 'Austin HQ',
    location: 'Floor 4 · Executive Suite',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    sla: { dueAt: daysFrom(1), breached: false },
    lifecycleStage: 'triage',
    tags: ['after-hours', 'camera-review', 'manual-intake'],
    openQuestions: [
      'Was facilities work scheduled after hours?',
      'Is there badge activity matching the motion window?',
    ],
    assigneeTeam: 'Site Security',
    caseType: 'After-hours Activity',
    lastActivity: '35 min ago',
    priorityReason: 'Manual case intake pending initial evidence review.',
    evidenceCount: 2,
    taskCount: 3,
    completedTaskCount: 0,
  },
  {
    ...baseCase,
    id: 'case-004',
    incidentId: undefined,
    title: 'Repeated forced-door alarms at Dallas office',
    severity: 'high',
    status: 'investigating',
    owner: 'J. Torres',
    siteId: 'site-dallas',
    siteName: 'Dallas Office',
    location: 'North Stairwell · Floor 2',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(0),
    sla: { dueAt: daysFrom(0), breached: false },
    lifecycleStage: 'under_investigation',
    tags: ['door-forced', 'maintenance-check', 'dallas'],
    openQuestions: [
      'Did the latch fail or was the door forced?',
      'Are alarms correlated with cleaning crew access windows?',
    ],
    assigneeTeam: 'Corporate Security',
    caseType: 'Door Alarm',
    lastActivity: '2 hr ago',
    priorityReason: 'Due today; root cause pending facilities inspection.',
    evidenceCount: 4,
    taskCount: 6,
    completedTaskCount: 4,
  },
  {
    ...baseCase,
    id: 'case-005',
    incidentId: undefined,
    title: 'Lost badge with restricted area authorization',
    severity: 'low',
    status: 'resolved',
    owner: 'R. Patel',
    siteName: 'Austin HQ',
    location: 'Security Desk',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
    sla: { dueAt: daysFrom(3), breached: false },
    lifecycleStage: 'pending_approval',
    tags: ['credential', 'lost-badge', 'approval'],
    openQuestions: ['Is replacement badge approval complete?'],
    assigneeTeam: 'Access Control',
    caseType: 'Credential',
    lastActivity: '22 hr ago',
    priorityReason: 'Ready for reviewer closure approval.',
    evidenceCount: 3,
    taskCount: 3,
    completedTaskCount: 3,
  },
]

function isOpenCase(caseItem: QueueCase) {
  return !caseItem.lifecycleStage.startsWith('closed') && caseItem.lifecycleStage !== 'archived'
}

function isUnderSla(caseItem: QueueCase) {
  return isOpenCase(caseItem) && !caseItem.sla.breached
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getAgeDays(iso: string) {
  const now = new Date('2026-06-11T16:00:00Z').getTime()
  const then = new Date(iso).getTime()
  return Math.max(0, Math.round((now - then) / 86_400_000))
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = 'neutral',
}: {
  label: string
  value: string
  detail: string
  icon: string
  tone?: 'neutral' | 'good' | 'warning' | 'danger'
}) {
  const toneClass = {
    neutral: 'text-[#93C5FD]',
    good: 'text-[#86EFAC]',
    warning: 'text-[#FCD34D]',
    danger: 'text-[#FCA5A5]',
  }[tone]

  return (
    <article className="rounded-xl border border-[#273142] bg-[#171D29] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black leading-none text-white">{value}</p>
        </div>
        <span className={`rounded-lg border border-[#334155] bg-[#111827] p-2 ${toneClass}`}>
          <Icon name={icon} size={20} />
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#CBD5E0]">{detail}</p>
    </article>
  )
}

function AssigneePerformance({ cases }: { cases: QueueCase[] }) {
  const rows = Array.from(
    cases.reduce((map, caseItem) => {
      const current = map.get(caseItem.owner) ?? {
        owner: caseItem.owner,
        team: caseItem.assigneeTeam,
        open: 0,
        outOfSla: 0,
        tasks: 0,
        completed: 0,
        ageDays: 0,
      }
      current.open += isOpenCase(caseItem) ? 1 : 0
      current.outOfSla += caseItem.sla.breached ? 1 : 0
      current.tasks += caseItem.taskCount
      current.completed += caseItem.completedTaskCount
      current.ageDays += getAgeDays(caseItem.createdAt)
      map.set(caseItem.owner, current)
      return map
    }, new Map<string, { owner: string; team: string; open: number; outOfSla: number; tasks: number; completed: number; ageDays: number }>())
  ).map(([, row]) => ({
    ...row,
    completionRate: row.tasks > 0 ? Math.round((row.completed / row.tasks) * 100) : 0,
    avgAge: row.open > 0 ? Math.round(row.ageDays / row.open) : 0,
  }))

  return (
    <section className="rounded-xl border border-[#273142] bg-[#171D29]">
      <div className="border-b border-[#273142] px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <Icon name="analytics" size={17} className="text-[#A78BFA]" />
          Assignee Performance
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
          Workload, SLA risk, task progress, and case age by current owner.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full text-left text-sm">
          <thead className="bg-[#111827] text-xs text-[#94A3B8]">
            <tr>
              <th className="px-4 py-3 font-bold">Assignee</th>
              <th className="px-4 py-3 font-bold">Open</th>
              <th className="px-4 py-3 font-bold">Out of SLA</th>
              <th className="px-4 py-3 font-bold">Task Completion</th>
              <th className="px-4 py-3 font-bold">Avg Age</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#273142]">
            {rows.map((row) => (
              <tr key={row.owner} className="bg-[#171D29]">
                <td className="px-4 py-3">
                  <p className="font-bold text-white">{row.owner}</p>
                  <p className="mt-1 text-xs text-[#94A3B8]">{row.team}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-[#CBD5E0]">{row.open}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      row.outOfSla > 0
                        ? 'bg-[#2A1212] text-[#FCA5A5]'
                        : 'bg-[#0E2218] text-[#86EFAC]'
                    }`}
                  >
                    {row.outOfSla}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-[#334155]">
                      <div
                        className="h-full rounded-full bg-[#A78BFA]"
                        style={{ width: `${row.completionRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#CBD5E0]">
                      {row.completionRate}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-[#CBD5E0]">
                  {row.avgAge}d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function CaseQueueDashboard({
  onOpenCase,
}: {
  onOpenCase: (caseItem: Case) => void
}) {
  const openCases = QUEUE_CASES.filter(isOpenCase)
  const underSla = QUEUE_CASES.filter(isUnderSla)
  const outOfSla = QUEUE_CASES.filter((caseItem) => isOpenCase(caseItem) && caseItem.sla.breached)
  const pendingApproval = QUEUE_CASES.filter(
    (caseItem) => caseItem.lifecycleStage === 'pending_approval'
  )
  const avgOpenAge = Math.round(
    openCases.reduce((sum, caseItem) => sum + getAgeDays(caseItem.createdAt), 0) /
      Math.max(openCases.length, 1)
  )

  return (
    <main className="px-4 py-5 sm:px-6 xl:px-8">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white">Case Queue</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#CBD5E0]">
            Triage active investigations, monitor SLA exposure, and open a case workspace
            from the queue.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#374151] px-3 text-xs font-bold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white">
            <Icon name="filter_list" size={16} />
            Filters
          </button>
          <button className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#7C3AED] px-3 text-xs font-bold text-white transition-colors hover:bg-[#6D28D9]">
            <Icon name="post_add" size={16} />
            New Case
          </button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Total Open"
          value={String(openCases.length)}
          detail="Active cases excluding archived and closed dispositions."
          icon="folder_open"
        />
        <MetricCard
          label="Under SLA"
          value={String(underSla.length)}
          detail={`${Math.round((underSla.length / Math.max(openCases.length, 1)) * 100)}% of active cases on track.`}
          icon="verified"
          tone="good"
        />
        <MetricCard
          label="Out of SLA"
          value={String(outOfSla.length)}
          detail="Requires owner follow-up or supervisor escalation."
          icon="warning"
          tone={outOfSla.length > 0 ? 'danger' : 'good'}
        />
        <MetricCard
          label="Pending Approval"
          value={String(pendingApproval.length)}
          detail="Ready for reviewer disposition or closure decision."
          icon="approval"
          tone="warning"
        />
        <MetricCard
          label="Avg Open Age"
          value={`${avgOpenAge}d`}
          detail="Average age across currently active cases."
          icon="schedule"
        />
      </section>

      <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1.4fr)_minmax(420px,0.6fr)]">
        <section className="rounded-xl border border-[#273142] bg-[#171D29]">
          <div className="flex flex-col gap-3 border-b border-[#273142] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <Icon name="assignment" size={17} className="text-[#60A5FA]" />
                Active Case Queue
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
                Sorted by SLA risk, severity, and last activity.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full border border-[#334155] px-2.5 py-1 font-semibold text-[#CBD5E0]">
                All sites
              </span>
              <span className="rounded-full border border-[#334155] px-2.5 py-1 font-semibold text-[#CBD5E0]">
                Open + approval
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#273142]">
            {QUEUE_CASES.map((caseItem) => {
              const progress =
                caseItem.taskCount > 0
                  ? Math.round((caseItem.completedTaskCount / caseItem.taskCount) * 100)
                  : 0
              return (
                <button
                  key={caseItem.id}
                  type="button"
                  onClick={() => onOpenCase(caseItem)}
                  className="block w-full bg-[#171D29] px-5 py-4 text-left transition-colors hover:bg-[#1D2533] focus:bg-[#1D2533] focus:outline-none"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#94A3B8]">
                          {caseItem.id}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase ${SEVERITY_TONE[caseItem.severity]}`}
                        >
                          {caseItem.severity}
                        </span>
                        <span className="rounded-full border border-[#334155] px-2 py-0.5 text-xs font-semibold text-[#CBD5E0]">
                          {CASE_STAGE_LABEL[caseItem.lifecycleStage]}
                        </span>
                        {caseItem.sla.breached && (
                          <span className="rounded-full bg-[#2A1212] px-2 py-0.5 text-xs font-bold text-[#FCA5A5]">
                            Out of SLA
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-base font-bold leading-snug text-white">
                        {caseItem.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-[#CBD5E0]">
                        {caseItem.priorityReason}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#94A3B8]">
                        <span>{caseItem.siteName}</span>
                        <span>{caseItem.location}</span>
                        <span>Updated {caseItem.lastActivity}</span>
                        <span>SLA {fmtDateTime(caseItem.sla.dueAt)}</span>
                      </div>
                    </div>

                    <div className="grid min-w-full grid-cols-2 gap-2 text-xs sm:min-w-[22rem] sm:grid-cols-4">
                      <div className="rounded-lg border border-[#273142] bg-[#111827] p-2">
                        <p className="font-bold uppercase tracking-wide text-[#94A3B8]">Owner</p>
                        <p className="mt-1 truncate font-bold text-white">{caseItem.owner}</p>
                      </div>
                      <div className="rounded-lg border border-[#273142] bg-[#111827] p-2">
                        <p className="font-bold uppercase tracking-wide text-[#94A3B8]">Evidence</p>
                        <p className="mt-1 font-bold text-white">{caseItem.evidenceCount}</p>
                      </div>
                      <div className="rounded-lg border border-[#273142] bg-[#111827] p-2">
                        <p className="font-bold uppercase tracking-wide text-[#94A3B8]">Tasks</p>
                        <p className="mt-1 font-bold text-white">
                          {caseItem.completedTaskCount}/{caseItem.taskCount}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[#273142] bg-[#111827] p-2">
                        <p className="font-bold uppercase tracking-wide text-[#94A3B8]">Progress</p>
                        <p className="mt-1 font-bold text-white">{progress}%</p>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <div className="space-y-5">
          <AssigneePerformance cases={QUEUE_CASES} />

          <section className="rounded-xl border border-[#273142] bg-[#171D29] p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Icon name="query_stats" size={17} className="text-[#FBBF24]" />
              Queue Health
            </h2>
            <div className="mt-4 space-y-3">
              {[
                ['SLA Exposure', outOfSla.length > 0 ? '1 case requires escalation' : 'No active SLA breaches', outOfSla.length > 0 ? '#FCA5A5' : '#86EFAC'],
                ['Approval Bottleneck', `${pendingApproval.length} case awaiting reviewer`, '#FCD34D'],
                ['Evidence Load', `${QUEUE_CASES.reduce((sum, item) => sum + item.evidenceCount, 0)} evidence items under custody`, '#93C5FD'],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-lg border border-[#273142] bg-[#111827] p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-bold" style={{ color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
