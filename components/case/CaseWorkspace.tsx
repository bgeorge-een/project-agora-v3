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
import { PersonCard } from '@/components/case/PersonCard'
import { CameraStill } from '@/components/incident/CameraStill'
import { CameraClipModal } from '@/components/incident/CameraClipModal'

const baseCase = MOCK_CASES[0]

type WorkspaceTab = 'timeline' | 'evidence' | 'graph' | 'tasks' | 'ai'

const WORKSPACE_TABS: { key: WorkspaceTab; label: string; icon: string }[] = [
  { key: 'timeline', label: 'Timeline', icon: 'timeline' },
  { key: 'evidence', label: 'Evidence', icon: 'source' },
  { key: 'graph', label: 'Entity Graph', icon: 'hub' },
  { key: 'tasks', label: 'Tasks', icon: 'task_alt' },
  { key: 'ai', label: 'AI Assistant', icon: 'smart_toy' },
]

// Small inline Material icon helper
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
  critical: { bg: '#2A1212', text: '#F87171' },
  high: { bg: '#2A1B0E', text: '#FB923C' },
  medium: { bg: '#2A2310', text: '#FBBF24' },
  low: { bg: '#1F2937', text: '#9CA3AF' },
}

const ENTITY_ICON: Record<EntityType, string> = {
  person: 'badge',
  credential: 'key',
  vehicle: 'directions_car',
  door: 'door_front',
  camera: 'videocam',
  zone: 'location_on',
  sensor: 'sensors',
}

const TYPE_ICON: Record<TimelineEvent['type'], string> = {
  access: 'key',
  camera: 'videocam',
  agent: 'psychology',
  manual: 'edit_note',
  external_context: 'public',
  annotation: 'sticky_note_2',
}

const TYPE_ICON_COLOR: Record<TimelineEvent['type'], string> = {
  access: '#3B82F6',
  camera: '#3B82F6',
  agent: '#2DD4BF',
  manual: '#9CA3AF',
  external_context: '#9CA3AF',
  annotation: '#9CA3AF',
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

  function handleTaskComplete(taskTitle: string) {
    const ev: TimelineEvent = {
      id: `tl-task-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'manual',
      title: `Task completed: ${taskTitle}`,
      detail: `Investigation task marked complete`,
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
  }

  function handleResolveQuestion(q: string) {
    setResolvedQuestions((prev) => [...prev, q])
    const ev: TimelineEvent = {
      id: `tl-q-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'manual',
      title: 'Question resolved',
      detail: q,
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
  }

  return (
    <div className="px-8 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65fr_35fr]">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Case header card */}
          <div className="overflow-hidden rounded-xl border border-[#2D3748] bg-[#1A1F2E]">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      {baseCase.id}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: sev.bg, color: sev.text }}
                    >
                      {baseCase.severity}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-xl font-bold tracking-tight text-white">
                    {baseCase.title}
                  </h2>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0C1A2A] px-3 py-1 text-xs font-semibold text-[#38BDF8]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
                  Investigating
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
                <div>
                  <span className="text-[#6B7280]">Owner</span>
                  <span className="ml-1.5 font-semibold text-[#CBD5E0]">
                    {baseCase.owner}
                  </span>
                </div>
                <div>
                  <span className="text-[#6B7280]">Site</span>
                  <span className="ml-1.5 font-semibold text-[#CBD5E0]">
                    {baseCase.siteName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#6B7280]">SLA</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0C2714] px-2 py-0.5 font-semibold text-[#22C55E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                    {baseCase.sla.breached ? 'Breached' : 'On track'} · due{' '}
                    {fmtDateTime(baseCase.sla.dueAt)}
                  </span>
                </div>
              </div>
            </div>

            {campaign && (
              <div className="flex items-center gap-2 border-t border-[#78350F] bg-[#1C1500] px-5 py-2.5 text-xs">
                <Icon name="hub" size={16} className="text-[#FBBF24]" />
                <span className="font-semibold uppercase tracking-wide text-[#FDE68A]">
                  Campaign Linked:
                </span>
                <span className="font-semibold text-[#FDE68A]">
                  HXT-7291 Multi-Site Activity
                </span>
                <span className="text-[#FBBF24]">·</span>
                <span className="text-[#FDE68A]">
                  {campaign.incidentIds.length} incidents
                </span>
              </div>
            )}
          </div>

          {/* Workspace tabs */}
          <div className="rounded-xl border border-[#2D3748] bg-[#1A1F2E]">
            <div className="flex gap-1 border-b border-[#2D3748] bg-[#111827] px-3 pt-2">
              {WORKSPACE_TABS.map((t) => {
                const active = tab === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'text-[#38BDF8]'
                        : 'text-[#6B7280] hover:text-[#9CA3AF]'
                    }`}
                  >
                    <Icon name={t.icon} size={16} />
                    {t.label}
                    {active && (
                      <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#38BDF8]" />
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
                <TasksTab
                  tasks={tasks}
                  setTasks={setTasks}
                  onTaskComplete={handleTaskComplete}
                />
              )}
              {tab === 'ai' && <AIAssistant />}
            </div>
          </div>
        </div>

        {/* ===================== RIGHT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Person profile */}
          {baseCase.person && <PersonCard person={baseCase.person} />}

          {/* Open Questions */}
          <div className="rounded-xl border border-[#2D3748] bg-[#1A1F2E]">
            <div className="border-b border-[#2D3748] px-5 py-3">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                <Icon name="help" size={16} className="text-[#9CA3AF]" /> Open
                Questions
              </h3>
            </div>
            <ul className="divide-y divide-[#2D3748]">
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
                            ? 'text-[#6B7280] line-through'
                            : 'text-[#CBD5E0]'
                        }`}
                      >
                        {q}
                      </p>
                      {!resolved && (
                        <button
                          onClick={() => handleResolveQuestion(q)}
                          className="mt-1 text-[11px] font-semibold text-[#38BDF8] transition-colors hover:text-white"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9]"
          >
            <Icon name="auto_awesome" size={18} /> Generate Report
          </button>

          {/* Case Details */}
          <div className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              Case Details
            </h3>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Created</dt>
                <dd className="font-medium text-[#CBD5E0]">
                  {fmtDateTime(baseCase.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Updated</dt>
                <dd className="font-medium text-[#CBD5E0]">
                  {fmtDateTime(baseCase.updatedAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">SLA Due</dt>
                <dd className="font-medium text-[#CBD5E0]">
                  {fmtDateTime(baseCase.sla.dueAt)}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {baseCase.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[#2D1F47] px-2 py-0.5 text-[11px] font-medium text-[#A78BFA]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Entity refs */}
          <div className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-5">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
              Involved Entities
            </h3>
            <ul className="space-y-2">
              {baseCase.entityRefs.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-2.5 rounded-lg border border-[#2D3748] bg-[#111827] px-3 py-2"
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
  const [quickNote, setQuickNote] = useState('')
  const [playingClip, setPlayingClip] = useState<TimelineEvent | null>(null)

  function submitQuickNote() {
    if (!quickNote.trim()) return
    const ev: TimelineEvent = {
      id: `tl-note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'manual',
      title: 'Operator Note',
      detail: quickNote.trim(),
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
    setQuickNote('')
  }

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

  const inputCls =
    'mt-1 w-full rounded-md border border-[#374151] bg-[#111827] px-2.5 py-1.5 text-xs font-normal text-[#E5E7EB] outline-none placeholder:text-[#6B7280] focus:border-[#7C3AED]'

  return (
    <div>
      {/* Quick operator note */}
      <div className="mb-5 rounded-lg border border-[#2D3748] bg-[#111827] p-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Add Operator Note
        </p>
        <textarea
          value={quickNote}
          rows={2}
          placeholder="Jot down a quick observation…"
          onChange={(e) => setQuickNote(e.target.value)}
          className="w-full resize-none rounded-md border border-[#374151] bg-[#111827] px-2.5 py-1.5 text-xs font-normal text-[#E5E7EB] outline-none placeholder:text-[#6B7280] focus:border-[#7C3AED]"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={submitQuickNote}
            className="rounded-lg bg-[#7C3AED] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#6D28D9]"
          >
            Add Note
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Investigation Timeline · {timeline.length} events
        </p>
        <button
          onClick={() => setShowEventForm(!showEventForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#2D3748] bg-[#1A1F2E] px-3 py-1.5 text-xs font-semibold text-[#9CA3AF] transition-colors hover:border-[#7C3AED] hover:text-white"
        >
          <Icon name="add" size={16} /> Add Manual Event
        </button>
      </div>

      {showEventForm && (
        <div className="mb-5 rounded-lg border border-dashed border-[#5B4691] bg-[#1A1530] p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#A78BFA]">
            New Manual Event
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[11px] font-semibold text-[#9CA3AF]">
              Timestamp
              <input
                type="datetime-local"
                value={form.timestamp}
                onChange={(e) =>
                  setForm({ ...form, timestamp: e.target.value })
                }
                className={inputCls}
              />
            </label>
            <label className="text-[11px] font-semibold text-[#9CA3AF]">
              Event Type
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as TimelineEvent['type'],
                  })
                }
                className={inputCls}
              >
                <option value="manual">Manual Note</option>
                <option value="access">Access</option>
                <option value="camera">Camera</option>
                <option value="annotation">Annotation</option>
                <option value="external_context">External Context</option>
              </select>
            </label>
          </div>
          <label className="mt-3 block text-[11px] font-semibold text-[#9CA3AF]">
            Title
            <input
              type="text"
              value={form.title}
              placeholder="Short event title"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="mt-3 block text-[11px] font-semibold text-[#9CA3AF]">
            Description
            <textarea
              value={form.detail}
              rows={2}
              placeholder="What happened?"
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </label>
          <label className="mt-3 block text-[11px] font-semibold text-[#9CA3AF]">
            Source Attribution
            <input
              type="text"
              value={form.source}
              placeholder="e.g. Reviewed by J. Torres / HR record"
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className={inputCls}
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
              className="rounded-lg border border-[#374151] px-4 py-2 text-xs font-medium text-[#CBD5E0] transition-colors hover:bg-[#1F2937]"
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
          const isDisposition =
            !!ev.isManual &&
            (ev.title.startsWith('Task completed') ||
              ev.title.startsWith('Question resolved'))
          const isOperatorNote = !!ev.isManual && ev.title === 'Operator Note'
          const cardCls = ev.flagged
            ? 'bg-[#1C0A0A] border border-[#7F1D1D]'
            : isDisposition
              ? 'bg-[#0C2714] border border-dashed border-[#166534]'
              : isOperatorNote
                ? 'bg-[#1A1502] border border-dashed border-[#78350F]'
                : ev.isManual
                  ? 'bg-[#1A1F2E] border border-dashed border-[#374151]'
                  : ev.isAIGenerated
                    ? 'bg-[#0A1F1F] border-l-2 border-l-[#2DD4BF] border-y border-r border-[#143A3A]'
                    : 'bg-[#1A1F2E] border border-[#2D3748]'
          const titleIcon = ev.flagged
            ? 'warning'
            : isDisposition
              ? 'check_circle'
              : isOperatorNote
                ? 'edit_note'
                : TYPE_ICON[ev.type]
          return (
            <li key={ev.id} className="relative flex gap-3 pb-5">
              {/* Time + connector */}
              <div className="flex w-14 shrink-0 flex-col items-end">
                <span className="font-mono text-[11px] font-semibold text-[#6B7280]">
                  {fmtTime(ev.timestamp)}
                </span>
              </div>
              <div className="relative flex flex-col items-center">
                <span className="z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#2D3748] bg-[#111827]">
                  <Icon
                    name={titleIcon}
                    size={15}
                    className={
                      isDisposition
                        ? 'text-[#22C55E]'
                        : isOperatorNote
                          ? 'text-[#F59E0B]'
                          : ''
                    }
                  />
                </span>
                {!isLast && (
                  <span className="absolute top-7 h-full w-px bg-[#374151]" />
                )}
              </div>
              {/* Card */}
              <div className={`min-w-0 flex-1 rounded-lg p-3 ${cardCls}`}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-white">
                        <Icon
                          name={titleIcon}
                          size={16}
                          className={`mt-0.5 shrink-0 ${
                            ev.flagged
                              ? 'text-[#EF4444]'
                              : isDisposition
                                ? 'text-[#22C55E]'
                                : isOperatorNote
                                  ? 'text-[#F59E0B]'
                                  : ''
                          }`}
                        />
                        <span>{ev.title}</span>
                      </p>
                      <div className="flex shrink-0 gap-1">
                        {ev.isAIGenerated && (
                          <span className="rounded bg-[#0E2A2A] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#2DD4BF]">
                            AI
                          </span>
                        )}
                        {isDisposition && (
                          <span className="rounded border border-dashed border-[#166534] bg-[#0C2714] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#22C55E]">
                            Action
                          </span>
                        )}
                        {isOperatorNote && (
                          <span className="rounded border border-dashed border-[#78350F] bg-[#1A1502] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#F59E0B]">
                            Operator Note
                          </span>
                        )}
                        {ev.isManual && !isDisposition && !isOperatorNote && (
                          <span className="rounded border border-dashed border-[#5B4691] bg-[#1A1530] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#A78BFA]">
                            Manual Evidence
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
                      {ev.detail}
                    </p>
                    {ev.entityRefs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {ev.entityRefs.map((e) => (
                          <span
                            key={e.id}
                            className="inline-flex items-center gap-1 rounded-full bg-[#111827] px-2 py-0.5 text-[10px] font-medium text-[#CBD5E0] ring-1 ring-[#2D3748]"
                          >
                            <Icon name={ENTITY_ICON[e.type]} size={12} /> {e.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Inline camera still */}
                  {ev.cameraPreview && (
                    <div className="w-[100px] shrink-0">
                      <CameraStill
                        channel={ev.cameraPreview.channel}
                        sceneType={ev.cameraPreview.sceneType}
                        location={ev.title}
                        timestamp={fmtTime(ev.timestamp)}
                        onClick={() => setPlayingClip(ev)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {playingClip && playingClip.cameraPreview && (
        <CameraClipModal
          channel={playingClip.cameraPreview.channel}
          sceneType={playingClip.cameraPreview.sceneType}
          location={playingClip.title}
          timestamp={fmtTime(playingClip.timestamp)}
          detail={playingClip.detail}
          onClose={() => setPlayingClip(null)}
        />
      )}
    </div>
  )
}

// ============================================================
// EVIDENCE TAB
// ============================================================
const EVIDENCE_ICON: Record<Evidence['type'], string> = {
  clip: 'videocam',
  still: 'image',
  access_event: 'key',
  document: 'description',
  manual: 'edit_note',
}

function EvidenceTab() {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
        Linked Evidence · {EVIDENCE.length} items · chain of custody preserved
      </p>
      <div className="overflow-hidden rounded-lg border border-[#2D3748]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#111827] text-[10px] uppercase tracking-wide text-[#9CA3AF]">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Type</th>
              <th className="px-3 py-2.5 font-semibold">Label</th>
              <th className="px-3 py-2.5 font-semibold">Source</th>
              <th className="px-3 py-2.5 font-semibold">Timestamp</th>
              <th className="px-3 py-2.5 font-semibold">Confidence</th>
              <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2D3748]">
            {EVIDENCE.map((ev) => (
              <tr
                key={ev.id}
                className="bg-[#1A1F2E] transition-colors hover:bg-[#243048]"
              >
                <td className="px-3 py-3">
                  <Icon
                    name={EVIDENCE_ICON[ev.type]}
                    size={18}
                    className="text-[#9CA3AF]"
                  />
                </td>
                <td className="px-3 py-3 font-medium text-white">{ev.label}</td>
                <td className="px-3 py-3 text-[#9CA3AF]">{ev.sourceSystem}</td>
                <td className="px-3 py-3 font-mono text-[#6B7280]">
                  {fmtTime(ev.timestamp)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[#374151]">
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
                    <span className="font-semibold text-[#CBD5E0]">
                      {Math.round(ev.confidence * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <button className="rounded-md border border-[#374151] px-2.5 py-1 text-[11px] font-semibold text-[#CBD5E0] transition-colors hover:border-[#7C3AED] hover:text-[#A78BFA]">
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
  onTaskComplete,
}: {
  tasks: CaseTask[]
  setTasks: React.Dispatch<React.SetStateAction<CaseTask[]>>
  onTaskComplete?: (title: string) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', owner: '', due: '' })

  const STATUS_STYLE: Record<
    CaseTask['status'],
    { bg: string; text: string; label: string }
  > = {
    open: { bg: '#0C1A2A', text: '#38BDF8', label: 'Open' },
    pending: { bg: '#2A2310', text: '#FBBF24', label: 'Pending' },
    done: { bg: '#0C2714', text: '#22C55E', label: 'Done' },
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
      prev.map((t) => {
        if (t.id === id) {
          const next = t.status === 'done' ? 'open' : 'done'
          if (next === 'done') onTaskComplete?.(t.title)
          return { ...t, status: next }
        }
        return t
      })
    )
  }

  const inputCls =
    'rounded-md border border-[#374151] bg-[#111827] px-2.5 py-1.5 text-xs text-[#E5E7EB] outline-none placeholder:text-[#6B7280] focus:border-[#7C3AED]'

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
          Investigation Tasks
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#2D3748] bg-[#1A1F2E] px-3 py-1.5 text-xs font-semibold text-[#9CA3AF] transition-colors hover:border-[#7C3AED] hover:text-white"
        >
          <Icon name="add" size={16} /> Add Task
        </button>
      </div>

      {showForm && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-dashed border-[#5B4691] bg-[#1A1530] p-4 sm:grid-cols-3">
          <input
            type="text"
            value={form.title}
            placeholder="Task title"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={`${inputCls} sm:col-span-3`}
          />
          <input
            type="text"
            value={form.owner}
            placeholder="Owner"
            onChange={(e) => setForm({ ...form, owner: e.target.value })}
            className={inputCls}
          />
          <input
            type="text"
            value={form.due}
            placeholder="Due (e.g. Tomorrow)"
            onChange={(e) => setForm({ ...form, due: e.target.value })}
            className={inputCls}
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
              className="rounded-md border border-[#374151] px-3 py-1.5 text-xs font-medium text-[#CBD5E0] hover:bg-[#1F2937]"
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
              className="flex items-center gap-3 rounded-lg border border-[#2D3748] bg-[#1A1F2E] px-4 py-3"
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
                      ? 'text-[#6B7280] line-through'
                      : 'text-white'
                  }`}
                >
                  {t.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#9CA3AF]">
                  <span>
                    Owner:{' '}
                    <span className="font-medium text-[#CBD5E0]">
                      {t.owner}
                    </span>
                    {t.ownerTag && (
                      <span className="ml-1.5 inline-flex items-center gap-1 rounded bg-[#1E1B4B] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#A5B4FC]">
                        <Icon name="group" size={11} /> {t.ownerTag}
                      </span>
                    )}
                  </span>
                  <span>·</span>
                  <span>
                    Due:{' '}
                    <span className="font-medium text-[#CBD5E0]">{t.due}</span>
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
