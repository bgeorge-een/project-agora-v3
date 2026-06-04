'use client'

import { useState } from 'react'
import type {
  Case,
  TimelineEvent,
  Entity,
  EntityType,
  Evidence,
} from '@/lib/types'
import { MOCK_CASES, ENTITIES, MOCK_CAMPAIGNS } from '@/lib/mock-data/scenarios'
import EntityGraph from '@/components/case/EntityGraph'
import AIAssistant from '@/components/case/AIAssistant'
import NarrativeReport from '@/components/case/NarrativeReport'

const baseCase = MOCK_CASES[0]

type WorkspaceTab = 'timeline' | 'evidence' | 'graph' | 'tasks' | 'ai'

const WORKSPACE_TABS: { key: WorkspaceTab; label: string; icon: string }[] = [
  { key: 'timeline', label: 'Timeline', icon: '🕑' },
  { key: 'evidence', label: 'Evidence', icon: '🗂️' },
  { key: 'graph', label: 'Entity Graph', icon: '🕸️' },
  { key: 'tasks', label: 'Tasks', icon: '✅' },
  { key: 'ai', label: 'AI Assistant', icon: '🤖' },
]

// ---- Sample evidence ----
const EVIDENCE: Evidence[] = [
  {
    id: 'ev-001',
    type: 'clip',
    label: 'C4 corridor 14:26–14:42',
    sourceSystem: 'Avigilon VMS',
    timestamp: '2026-06-04T14:38:00Z',
    confidence: 0.94,
    retention: '90 days',
  },
  {
    id: 'ev-002',
    type: 'access_event',
    label: 'Badge B-4421 denial log',
    sourceSystem: 'Brivo ACS',
    timestamp: '2026-06-04T14:34:00Z',
    confidence: 1.0,
    retention: '1 year',
  },
  {
    id: 'ev-003',
    type: 'access_event',
    label: 'Badge B-4421 denial log (2)',
    sourceSystem: 'Brivo ACS',
    timestamp: '2026-06-04T14:38:00Z',
    confidence: 1.0,
    retention: '1 year',
  },
  {
    id: 'ev-004',
    type: 'still',
    label: 'Camera C4 — individual ID frame',
    sourceSystem: 'Avigilon',
    timestamp: '2026-06-04T14:35:00Z',
    confidence: 0.87,
    retention: '90 days',
  },
]

// ---- Tasks ----
interface CaseTask {
  id: string
  title: string
  owner: string
  ownerTag?: string
  due: string
  status: 'open' | 'pending' | 'done'
}

const INITIAL_TASKS: CaseTask[] = [
  {
    id: 'task-1',
    title: 'Verify Marcus Webb work order for 2026-06-04',
    owner: 'J. Torres',
    due: 'Today',
    status: 'open',
  },
  {
    id: 'task-2',
    title: 'Pull all badge access history for B-4421 (30 days)',
    owner: 'IT',
    due: 'Tomorrow',
    status: 'open',
  },
  {
    id: 'task-3',
    title: 'HR review: contractor authorization scope',
    owner: 'HR Reviewer',
    ownerTag: 'External Collaborator',
    due: '+2 days',
    status: 'pending',
  },
]

const SEVERITY_STYLE: Record<string, { bg: string; text: string }> = {
  critical: { bg: '#FEF2F2', text: '#DC2626' },
  high: { bg: '#FFF7ED', text: '#EA580C' },
  medium: { bg: '#FFFBEB', text: '#D97706' },
  low: { bg: '#F1F5F9', text: '#64748B' },
}

const ENTITY_ICON: Record<EntityType, string> = {
  person: '👤',
  credential: '🪪',
  vehicle: '🚗',
  door: '🚪',
  camera: '📷',
  zone: '📍',
  sensor: '📡',
}

const TYPE_ICON: Record<TimelineEvent['type'], string> = {
  access: '🔑',
  camera: '📷',
  agent: '🤖',
  manual: '✏️',
  external_context: '🌐',
  annotation: '📝',
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
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

export default function CaseWorkspace() {
  const [tab, setTab] = useState<WorkspaceTab>('timeline')
  const [timeline, setTimeline] = useState<TimelineEvent[]>(baseCase.timeline)
  const [showEventForm, setShowEventForm] = useState(false)
  const [tasks, setTasks] = useState<CaseTask[]>(INITIAL_TASKS)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [resolvedQuestions, setResolvedQuestions] = useState<string[]>([])
  const [showReport, setShowReport] = useState(false)

  const campaign = MOCK_CAMPAIGNS.find((c) => c.id === baseCase.campaignId)
  const sev = SEVERITY_STYLE[baseCase.severity]

  return (
    <div className="px-8 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr]">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Case header card */}
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wide text-[#7C3AED]">
                      {baseCase.id}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: sev.bg, color: sev.text }}
                    >
                      {baseCase.severity}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-xl font-bold tracking-tight text-[#111827]">
                    {baseCase.title}
                  </h2>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
                  Investigating
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-[#9CA3AF]">Owner</span>
                  <span className="ml-1.5 font-semibold text-[#374151]">
                    {baseCase.owner}
                  </span>
                </div>
                <div>
                  <span className="text-[#9CA3AF]">Site</span>
                  <span className="ml-1.5 font-semibold text-[#374151]">
                    {baseCase.siteName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#9CA3AF]">SLA</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 font-semibold text-[#16A34A]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                    {baseCase.sla.breached ? 'Breached' : 'On track'} · due{' '}
                    {fmtDateTime(baseCase.sla.dueAt)}
                  </span>
                </div>
              </div>
            </div>

            {campaign && (
              <div className="flex items-center gap-2 border-t border-[#FDE68A] bg-[#FFFBEB] px-5 py-2.5 text-xs">
                <span>🔗</span>
                <span className="font-semibold uppercase tracking-wide text-[#B45309]">
                  Campaign Linked:
                </span>
                <span className="font-semibold text-[#92400E]">
                  HXT-7291 Multi-Site Activity
                </span>
                <span className="text-[#B45309]">·</span>
                <span className="text-[#92400E]">
                  {campaign.incidentIds.length} incidents
                </span>
              </div>
            )}
          </div>

          {/* Workspace tabs */}
          <div className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
            <div className="flex gap-1 border-b border-[#E5E7EB] px-3 pt-2">
              {WORKSPACE_TABS.map((t) => {
                const active = tab === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'text-[#7C3AED]'
                        : 'text-[#6B7280] hover:text-[#374151]'
                    }`}
                  >
                    <span>{t.icon}</span>
                    {t.label}
                    {active && (
                      <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#7C3AED]" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="p-5">
              {tab === 'timeline' && (
                <TimelineTab
                  timeline={timeline}
                  setTimeline={setTimeline}
                  showEventForm={showEventForm}
                  setShowEventForm={setShowEventForm}
                />
              )}
              {tab === 'evidence' && <EvidenceTab />}
              {tab === 'graph' && (
                <EntityGraph
                  selectedEntity={selectedEntity}
                  onSelect={setSelectedEntity}
                />
              )}
              {tab === 'tasks' && (
                <TasksTab tasks={tasks} setTasks={setTasks} />
              )}
              {tab === 'ai' && <AIAssistant />}
            </div>
          </div>
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Open Questions */}
          <div className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
            <div className="border-b border-[#E5E7EB] px-5 py-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
                <span>❓</span> Open Questions
              </h3>
            </div>
            <ul className="divide-y divide-[#F1F5F9]">
              {baseCase.openQuestions.map((q) => {
                const resolved = resolvedQuestions.includes(q)
                return (
                  <li key={q} className="flex items-start gap-3 px-5 py-3">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        resolved ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs leading-relaxed ${
                          resolved
                            ? 'text-[#9CA3AF] line-through'
                            : 'text-[#374151]'
                        }`}
                      >
                        {q}
                      </p>
                      {!resolved && (
                        <button
                          onClick={() =>
                            setResolvedQuestions((prev) => [...prev, q])
                          }
                          className="mt-1 text-[11px] font-semibold text-[#2563EB] hover:underline"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Generate Report */}
          <button
            onClick={() => setShowReport(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.10)] transition-colors hover:bg-[#6D28D9]"
          >
            <span>📄</span> Generate Report
          </button>

          {/* Case Details */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
            <h3 className="mb-3 text-sm font-bold text-[#111827]">
              Case Details
            </h3>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-[#9CA3AF]">Created</dt>
                <dd className="font-medium text-[#374151]">
                  {fmtDateTime(baseCase.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#9CA3AF]">Updated</dt>
                <dd className="font-medium text-[#374151]">
                  {fmtDateTime(baseCase.updatedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#9CA3AF]">SLA Due</dt>
                <dd className="font-medium text-[#374151]">
                  {fmtDateTime(baseCase.sla.dueAt)}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {baseCase.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[#F5F3FF] px-2 py-0.5 text-[11px] font-medium text-[#7C3AED]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Entity refs */}
          <div className="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
            <h3 className="mb-3 text-sm font-bold text-[#111827]">
              Involved Entities
            </h3>
            <ul className="space-y-2">
              {baseCase.entityRefs.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-2.5 rounded-lg border border-[#F1F5F9] px-3 py-2"
                >
                  <span className="text-base">{ENTITY_ICON[e.type]}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#374151]">
                      {e.label}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">
                      {e.type}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showReport && (
        <NarrativeReport
          caseData={{ ...baseCase, timeline }}
          entities={ENTITIES.filter((e) =>
            baseCase.entityRefs.some((r) => r.id === e.id)
          )}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}

// ============================================================
// TIMELINE TAB
// ============================================================
function TimelineTab({
  timeline,
  setTimeline,
  showEventForm,
  setShowEventForm,
}: {
  timeline: TimelineEvent[]
  setTimeline: React.Dispatch<React.SetStateAction<TimelineEvent[]>>
  showEventForm: boolean
  setShowEventForm: (v: boolean) => void
}) {
  const [form, setForm] = useState({
    timestamp: '',
    type: 'manual' as TimelineEvent['type'],
    title: '',
    detail: '',
    source: '',
  })

  function handleAdd() {
    if (!form.title.trim()) return
    const iso = form.timestamp
      ? new Date(form.timestamp).toISOString()
      : new Date().toISOString()
    const ev: TimelineEvent = {
      id: `tl-manual-${Date.now()}`,
      timestamp: iso,
      type: form.type,
      title: form.title.trim(),
      detail: form.source.trim()
        ? `${form.detail.trim()} — Source: ${form.source.trim()}`
        : form.detail.trim(),
      entityRefs: [],
      evidenceRefs: [],
      isAIGenerated: false,
      isManual: true,
    }
    setTimeline((prev) =>
      [...prev, ev].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    )
    setForm({
      timestamp: '',
      type: 'manual',
      title: '',
      detail: '',
      source: '',
    })
    setShowEventForm(false)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Investigation Timeline · {timeline.length} events
        </p>
        <button
          onClick={() => setShowEventForm(!showEventForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#7C3AED] px-3 py-1.5 text-xs font-semibold text-[#7C3AED] transition-colors hover:bg-[#F5F3FF]"
        >
          <span>＋</span> Add Manual Event
        </button>
      </div>

      {showEventForm && (
        <div className="mb-5 rounded-lg border border-dashed border-[#C4B5FD] bg-[#F5F3FF] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#7C3AED]">
            New Manual Event
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[11px] font-semibold text-[#6B7280]">
              Timestamp
              <input
                type="datetime-local"
                value={form.timestamp}
                onChange={(e) =>
                  setForm({ ...form, timestamp: e.target.value })
                }
                className="mt-1 w-full rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs font-normal text-[#374151] outline-none focus:border-[#7C3AED]"
              />
            </label>
            <label className="text-[11px] font-semibold text-[#6B7280]">
              Event Type
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as TimelineEvent['type'],
                  })
                }
                className="mt-1 w-full rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs font-normal text-[#374151] outline-none focus:border-[#7C3AED]"
              >
                <option value="manual">Manual Note</option>
                <option value="access">Access</option>
                <option value="camera">Camera</option>
                <option value="annotation">Annotation</option>
                <option value="external_context">External Context</option>
              </select>
            </label>
          </div>
          <label className="mt-3 block text-[11px] font-semibold text-[#6B7280]">
            Title
            <input
              type="text"
              value={form.title}
              placeholder="Short event title"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs font-normal text-[#374151] outline-none focus:border-[#7C3AED]"
            />
          </label>
          <label className="mt-3 block text-[11px] font-semibold text-[#6B7280]">
            Description
            <textarea
              value={form.detail}
              rows={2}
              placeholder="What happened?"
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              className="mt-1 w-full resize-none rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs font-normal text-[#374151] outline-none focus:border-[#7C3AED]"
            />
          </label>
          <label className="mt-3 block text-[11px] font-semibold text-[#6B7280]">
            Source Attribution
            <input
              type="text"
              value={form.source}
              placeholder="e.g. Reviewed by J. Torres / HR record"
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="mt-1 w-full rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs font-normal text-[#374151] outline-none focus:border-[#7C3AED]"
            />
          </label>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAdd}
              className="rounded-lg bg-[#7C3AED] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#6D28D9]"
            >
              Add Event
            </button>
            <button
              onClick={() => setShowEventForm(false)}
              className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Vertical timeline */}
      <ol className="relative space-y-0">
        {timeline.map((ev, idx) => {
          const isLast = idx === timeline.length - 1
          const accentBorder = ev.flagged
            ? 'border-l-[#EF4444]'
            : ev.isManual
              ? 'border-l-[#7C3AED] border-dashed'
              : ev.isAIGenerated
                ? 'border-l-[#14B8A6]'
                : 'border-l-[#E5E7EB]'
          return (
            <li key={ev.id} className="relative flex gap-3 pb-5">
              {/* Time + connector */}
              <div className="flex w-14 shrink-0 flex-col items-end">
                <span className="font-mono text-[11px] font-semibold text-[#6B7280]">
                  {fmtTime(ev.timestamp)}
                </span>
              </div>
              <div className="relative flex flex-col items-center">
                <span className="z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-xs shadow-sm">
                  {TYPE_ICON[ev.type]}
                </span>
                {!isLast && (
                  <span className="absolute top-7 h-full w-px bg-[#E5E7EB]" />
                )}
              </div>
              {/* Card */}
              <div
                className={`min-w-0 flex-1 rounded-lg border-l-2 bg-[#F9FAFB] p-3 ${accentBorder}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug text-[#111827]">
                    {ev.flagged && <span className="mr-1">⚠️</span>}
                    {ev.title}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    {ev.isAIGenerated && (
                      <span className="rounded bg-[#CCFBF1] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#0F766E]">
                        AI
                      </span>
                    )}
                    {ev.isManual && (
                      <span className="rounded border border-dashed border-[#C4B5FD] bg-[#F5F3FF] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#7C3AED]">
                        Manual Evidence
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
                  {ev.detail}
                </p>
                {ev.entityRefs.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ev.entityRefs.map((e) => (
                      <span
                        key={e.id}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[#374151] ring-1 ring-[#E5E7EB]"
                      >
                        {ENTITY_ICON[e.type]} {e.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ============================================================
// EVIDENCE TAB
// ============================================================
const EVIDENCE_ICON: Record<Evidence['type'], string> = {
  clip: '📹',
  still: '📷',
  access_event: '🔑',
  document: '📄',
  manual: '✏️',
}

function EvidenceTab() {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        Linked Evidence · {EVIDENCE.length} items · chain of custody preserved
      </p>
      <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F9FAFB] text-[10px] uppercase tracking-wide text-[#9CA3AF]">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Type</th>
              <th className="px-3 py-2.5 font-semibold">Label</th>
              <th className="px-3 py-2.5 font-semibold">Source</th>
              <th className="px-3 py-2.5 font-semibold">Timestamp</th>
              <th className="px-3 py-2.5 font-semibold">Confidence</th>
              <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {EVIDENCE.map((ev) => (
              <tr key={ev.id} className="hover:bg-[#F9FAFB]">
                <td className="px-3 py-3">
                  <span className="text-base">{EVIDENCE_ICON[ev.type]}</span>
                </td>
                <td className="px-3 py-3 font-medium text-[#111827]">
                  {ev.label}
                </td>
                <td className="px-3 py-3 text-[#6B7280]">{ev.sourceSystem}</td>
                <td className="px-3 py-3 font-mono text-[#6B7280]">
                  {fmtTime(ev.timestamp)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[#E5E7EB]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${ev.confidence * 100}%`,
                          backgroundColor:
                            ev.confidence >= 0.9
                              ? '#22C55E'
                              : ev.confidence >= 0.8
                                ? '#2563EB'
                                : '#F59E0B',
                        }}
                      />
                    </div>
                    <span className="font-semibold text-[#374151]">
                      {Math.round(ev.confidence * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <button className="rounded-md border border-[#D1D5DB] px-2.5 py-1 text-[11px] font-semibold text-[#374151] transition-colors hover:border-[#7C3AED] hover:text-[#7C3AED]">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================
// TASKS TAB
// ============================================================
function TasksTab({
  tasks,
  setTasks,
}: {
  tasks: CaseTask[]
  setTasks: React.Dispatch<React.SetStateAction<CaseTask[]>>
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', owner: '', due: '' })

  const STATUS_STYLE: Record<CaseTask['status'], { bg: string; text: string; label: string }> =
    {
      open: { bg: '#EFF6FF', text: '#2563EB', label: 'Open' },
      pending: { bg: '#FFFBEB', text: '#D97706', label: 'Pending' },
      done: { bg: '#F0FDF4', text: '#16A34A', label: 'Done' },
    }

  function addTask() {
    if (!form.title.trim()) return
    setTasks((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}`,
        title: form.title.trim(),
        owner: form.owner.trim() || 'Unassigned',
        due: form.due.trim() || 'TBD',
        status: 'open',
      },
    ])
    setForm({ title: '', owner: '', due: '' })
    setShowForm(false)
  }

  function toggle(id: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'done' ? 'open' : 'done' }
          : t
      )
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Investigation Tasks
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#7C3AED] px-3 py-1.5 text-xs font-semibold text-[#7C3AED] transition-colors hover:bg-[#F5F3FF]"
        >
          <span>＋</span> Add Task
        </button>
      </div>

      {showForm && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-dashed border-[#C4B5FD] bg-[#F5F3FF] p-4 sm:grid-cols-3">
          <input
            type="text"
            value={form.title}
            placeholder="Task title"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#7C3AED] sm:col-span-3"
          />
          <input
            type="text"
            value={form.owner}
            placeholder="Owner"
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            className="rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#7C3AED]"
          />
          <input
            type="text"
            value={form.due}
            placeholder="Due (e.g. Tomorrow)"
            onChange={(e) => setForm({ ...form, due: e.target.value })}
            className="rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#7C3AED]"
          />
          <div className="flex gap-2">
            <button
              onClick={addTask}
              className="rounded-md bg-[#7C3AED] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6D28D9]"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-md border border-[#D1D5DB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ul className="space-y-2">
        {tasks.map((t) => {
          const s = STATUS_STYLE[t.status]
          return (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3"
            >
              <input
                type="checkbox"
                checked={t.status === 'done'}
                onChange={() => toggle(t.id)}
                className="h-4 w-4 shrink-0 cursor-pointer accent-[#7C3AED]"
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    t.status === 'done'
                      ? 'text-[#9CA3AF] line-through'
                      : 'text-[#111827]'
                  }`}
                >
                  {t.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6B7280]">
                  <span>
                    Owner:{' '}
                    <span className="font-medium text-[#374151]">
                      {t.owner}
                    </span>
                    {t.ownerTag && (
                      <span className="ml-1.5 rounded bg-[#F5F3FF] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#7C3AED]">
                        {t.ownerTag}
                      </span>
                    )}
                  </span>
                  <span>·</span>
                  <span>
                    Due: <span className="font-medium text-[#374151]">{t.due}</span>
                  </span>
                </div>
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ backgroundColor: s.bg, color: s.text }}
              >
                {s.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
