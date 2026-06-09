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

type CasePersonRole =
  | 'subject'
  | 'case_investigator'
  | 'hr_partner'
  | 'legal'
  | 'site_supervisor'
  | 'witness'
  | 'victim'
  | 'reporting_party'
  | 'security_officer'
  | 'other'

interface CaseParticipant {
  id: string
  name: string
  role: CasePersonRole
  email?: string
  phone?: string
  organization?: string
  notes?: string
}

const CASE_PERSON_ROLES: { value: CasePersonRole; label: string; tone: string }[] = [
  { value: 'case_investigator', label: 'Case Investigator', tone: '#A78BFA' },
  { value: 'hr_partner', label: 'HR Partner', tone: '#60A5FA' },
  { value: 'legal', label: 'Legal', tone: '#FBBF24' },
  { value: 'site_supervisor', label: 'Site Supervisor', tone: '#34D399' },
  { value: 'witness', label: 'Witness', tone: '#CBD5E1' },
  { value: 'victim', label: 'Victim', tone: '#FFB4AE' },
  { value: 'reporting_party', label: 'Reporting Party', tone: '#7DD3FC' },
  { value: 'security_officer', label: 'Security Officer', tone: '#C4B5FD' },
  { value: 'subject', label: 'Subject', tone: '#F87171' },
  { value: 'other', label: 'Other', tone: '#94A3B8' },
]

const ROLE_LABEL = CASE_PERSON_ROLES.reduce(
  (acc, role) => ({ ...acc, [role.value]: role.label }),
  {} as Record<CasePersonRole, string>
)

const ROLE_TONE = CASE_PERSON_ROLES.reduce(
  (acc, role) => ({ ...acc, [role.value]: role.tone }),
  {} as Record<CasePersonRole, string>
)

const INITIAL_CASE_PARTICIPANTS: CaseParticipant[] = [
  {
    id: 'person-subject-marcus',
    name: 'Marcus Webb',
    role: 'subject',
    email: 'marcus.webb@contractor.example',
    phone: '+1 (512) 555-0134',
    organization: 'Northstar Mechanical',
    notes: 'Badge B-4421; contractor whose access attempt opened this case.',
  },
  {
    id: 'person-investigator-torres',
    name: 'J. Torres',
    role: 'case_investigator',
    email: 'j.torres@agora.example',
    phone: '+1 (512) 555-0188',
    organization: 'Corporate Security',
    notes: 'Primary owner for evidence review and case closure recommendation.',
  },
  {
    id: 'person-hr-nadia',
    name: 'Nadia Patel',
    role: 'hr_partner',
    email: 'nadia.patel@agora.example',
    organization: 'Human Resources',
    notes: 'Reviews contractor authorization scope and HR action requirements.',
  },
  {
    id: 'person-witness-chen',
    name: 'Evan Chen',
    role: 'witness',
    email: 'evan.chen@agora.example',
    phone: '+1 (512) 555-0172',
    organization: 'IT Security',
    notes: 'Reported seeing the contractor near the server corridor after the first denial.',
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
  const [participants, setParticipants] = useState<CaseParticipant[]>(INITIAL_CASE_PARTICIPANTS)

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

  function handleParticipantAdded(participant: CaseParticipant) {
    const ev: TimelineEvent = {
      id: `tl-person-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'manual',
      title: `Case person added: ${participant.name}`,
      detail: `${participant.name} added as ${ROLE_LABEL[participant.role]}.`,
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
    <div className="px-4 py-5 sm:px-6 xl:px-8">
      <div className="grid grid-cols-1 gap-6 min-[1800px]:grid-cols-[minmax(0,1.55fr)_minmax(380px,0.85fr)]">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="space-y-5">
          {/* Case header card */}
          <div className="overflow-hidden rounded-xl border border-[#273142] bg-[#171D29]">
            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#9CA3AF]">
                      {baseCase.id}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full border border-[#374151] px-2.5 py-0.5 text-xs font-semibold"
                      style={{ color: sev.text }}
                    >
                      {baseCase.severity}
                    </span>
                  </div>
                  <h2 className="mt-2 max-w-4xl text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                    {baseCase.title}
                  </h2>
                </div>
                <span className="inline-flex min-h-8 shrink-0 items-center gap-1.5 self-start rounded-full border border-[#374151] px-3 py-1 text-sm font-medium text-[#CBD5E0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
                  Investigating
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm leading-relaxed">
                <div className="min-w-max">
                  <span className="text-[#94A3B8]">Owner</span>
                  <span className="ml-1.5 font-semibold text-[#CBD5E0]">
                    {baseCase.owner}
                  </span>
                </div>
                <div className="min-w-max">
                  <span className="text-[#94A3B8]">People</span>
                  <span className="ml-1.5 font-semibold text-[#CBD5E0]">
                    {participants.length}
                  </span>
                </div>
                <div className="min-w-max">
                  <span className="text-[#94A3B8]">Site</span>
                  <span className="ml-1.5 font-semibold text-[#CBD5E0]">
                    {baseCase.siteName}
                  </span>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <span className="text-[#94A3B8]">SLA</span>
                  <span className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-full border border-[#374151] px-2.5 py-1 font-semibold text-[#CBD5E0]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
                    <span className="min-w-0">
                      {baseCase.sla.breached ? 'Breached' : 'On track'} · due{' '}
                      {fmtDateTime(baseCase.sla.dueAt)}
                    </span>
                  </span>
                </div>
              </div>

              <CaseContextStrip
                caseData={baseCase}
                entityRefs={baseCase.entityRefs}
              />
            </div>

            {campaign && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#273142] bg-[#111827] px-4 py-3 text-sm sm:px-5">
                <Icon name="hub" size={16} className="text-[#9CA3AF]" />
                <span className="font-semibold text-[#9CA3AF]">
                  Campaign Linked:
                </span>
                <span className="font-semibold text-[#CBD5E0]">
                  HXT-7291 Multi-Site Activity
                </span>
                <span className="text-[#4B5563]">·</span>
                <span className="text-[#9CA3AF]">
                  {campaign.incidentIds.length} incidents
                </span>
              </div>
            )}
          </div>

          {/* Workspace tabs */}
          <div className="rounded-xl border border-[#273142] bg-[#171D29]">
            <div className="overflow-x-auto border-b border-[#273142] bg-[#111827] px-3 pt-2">
              <div className="flex min-w-max gap-1">
                {WORKSPACE_TABS.map((t) => {
                  const active = tab === t.key
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`relative flex shrink-0 items-center gap-1.5 rounded-t-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? 'text-white'
                          : 'text-[#A1A1AA] hover:bg-[#1F2937] hover:text-white'
                      }`}
                    >
                      <Icon name={t.icon} size={16} />
                      {t.label}
                      {active && (
                        <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#A78BFA]" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-4 sm:p-5">
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
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 min-[1800px]:block min-[1800px]:space-y-5">
          {/* Person profile */}
          {baseCase.person && <PersonCard person={baseCase.person} />}

          <CasePeoplePanel
            participants={participants}
            setParticipants={setParticipants}
            onParticipantAdded={handleParticipantAdded}
          />

          {/* Open Questions */}
          <div className="rounded-xl border border-[#4A3520] bg-[#171D29]">
            <div className="border-b border-[#273142] px-5 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Icon name="help" size={16} className="text-[#FBBF24]" /> Open
                Questions
              </h3>
            </div>
            <ul className="divide-y divide-[#273142]">
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
                        className={`text-sm leading-relaxed ${
                          resolved
                            ? 'text-[#94A3B8] line-through'
                            : 'text-[#CBD5E0]'
                        }`}
                      >
                        {q}
                      </p>
                      {!resolved && (
                        <button
                          onClick={() => handleResolveQuestion(q)}
                          className="mt-1 text-xs font-semibold text-[#CBD5E0] underline-offset-4 transition-colors hover:text-white hover:underline"
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
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#374151] px-4 py-3 text-sm font-semibold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white xl:col-span-2 min-[1800px]:col-span-1"
          >
            <Icon name="auto_awesome" size={18} /> Generate Report
          </button>
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

function CaseContextStrip({
  caseData,
  entityRefs,
}: {
  caseData: Case
  entityRefs: Case['entityRefs']
}) {
  const visibleTags = caseData.tags.slice(0, 4)

  return (
    <div className="mt-4 grid gap-4 rounded-lg border border-[#273142] border-t-white/5 bg-[#111827] p-3 pt-4 min-[1700px]:grid-cols-[minmax(30rem,0.9fr)_minmax(0,1.1fr)]">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3">
        <CompactContextItem label="Created" value={fmtDateTime(caseData.createdAt)} />
        <CompactContextItem label="Updated" value={fmtDateTime(caseData.updatedAt)} />
        <CompactContextItem label="SLA Due" value={fmtDateTime(caseData.sla.dueAt)} />
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {entityRefs.map((entity) => (
            <span
              key={entity.id}
              className="inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-md border border-[#334155] bg-[#0F172A] px-2 text-xs font-semibold text-[#CBD5E0]"
              title={`${entity.label} · ${entity.type}`}
            >
              <Icon
                name={ENTITY_ICON[entity.type]}
                size={14}
                className="shrink-0 text-[#94A3B8]"
              />
              <span className="truncate">{entity.label}</span>
              <span className="text-xs uppercase tracking-wide text-[#94A3B8]">
                {entity.type}
              </span>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#334155] px-2 py-0.5 text-xs font-medium text-[#94A3B8]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function CompactContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#273142] bg-[#0F172A] px-2.5 py-2">
      <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-snug text-[#CBD5E0]" title={value}>
        {value}
      </p>
    </div>
  )
}

// ============================================================
// CASE PEOPLE PANEL
// ============================================================

const EMPTY_PARTICIPANT_FORM = {
  name: '',
  role: 'witness' as CasePersonRole,
  email: '',
  phone: '',
  organization: '',
  notes: '',
}

function CasePeoplePanel({
  participants,
  setParticipants,
  onParticipantAdded,
}: {
  participants: CaseParticipant[]
  setParticipants: React.Dispatch<React.SetStateAction<CaseParticipant[]>>
  onParticipantAdded: (participant: CaseParticipant) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_PARTICIPANT_FORM)

  const roleCounts = CASE_PERSON_ROLES.map((role) => ({
    ...role,
    count: participants.filter((person) => person.role === role.value).length,
  })).filter((role) => role.count > 0)

  function updateRole(personId: string, role: CasePersonRole) {
    setParticipants((prev) =>
      prev.map((person) => (person.id === personId ? { ...person, role } : person))
    )
  }

  function addParticipant() {
    if (!form.name.trim()) return

    const participant: CaseParticipant = {
      id: `person-${Date.now()}`,
      name: form.name.trim(),
      role: form.role,
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      organization: form.organization.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }

    setParticipants((prev) => [...prev, participant])
    onParticipantAdded(participant)
    setForm(EMPTY_PARTICIPANT_FORM)
    setShowForm(false)
  }

  return (
    <section className="rounded-xl border border-[#273142] bg-[#171D29]">
      <div className="flex items-start justify-between gap-3 border-b border-[#273142] px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Icon name="groups" size={17} className="text-[#A78BFA]" />
            Case People
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
            Participants, collaborators, witnesses, victims, and case owners.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#7C3AED] px-3 text-xs font-bold text-white transition-colors hover:bg-[#6D28D9]"
        >
          <Icon name={showForm ? 'close' : 'person_add'} size={16} />
          {showForm ? 'Cancel' : 'Add Person'}
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {roleCounts.map((role) => (
            <span
              key={role.value}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#334155] bg-[#111827] px-2.5 py-1 text-xs font-semibold text-[#CBD5E0]"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: role.tone }} />
              {role.label}
              <span className="rounded bg-[#273142] px-1.5 py-0.5 text-xs text-white">
                {role.count}
              </span>
            </span>
          ))}
        </div>

        {showForm && (
          <div className="rounded-lg border border-[#334155] bg-[#111827] p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#CBD5E0]">
                  Name
                </span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="e.g. Priya Shah"
                  className="min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#CBD5E0]">
                  Role
                </span>
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, role: event.target.value as CasePersonRole }))
                  }
                  className="min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm font-semibold text-white outline-none focus:border-[#A78BFA]"
                  aria-label="Select case person role"
                >
                  {CASE_PERSON_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#CBD5E0]">
                  Email
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="name@company.com"
                  className="min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#CBD5E0]">
                  Phone
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="+1 (512) 555-0123"
                  className="min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
                />
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-semibold text-[#CBD5E0]">
                Organization / team
              </span>
              <input
                value={form.organization}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, organization: event.target.value }))
                }
                placeholder="e.g. Human Resources, Legal, Facilities"
                className="min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-semibold text-[#CBD5E0]">
                Case context
              </span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                rows={2}
                placeholder="Why this person is involved, access scope, interview status, or constraints."
                className="w-full resize-none rounded-lg border border-[#334155] bg-[#0F1117] px-3 py-2 text-sm leading-relaxed text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
              />
            </label>

            <button
              type="button"
              onClick={addParticipant}
              disabled={!form.name.trim()}
              className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 text-sm font-bold text-white transition-colors hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:bg-[#374151] disabled:text-[#94A3B8]"
            >
              <Icon name="add" size={17} />
              Add to Case
            </button>
          </div>
        )}

        <ul className="space-y-3">
          {participants.map((person) => (
            <li
              key={person.id}
              className="rounded-lg border border-[#273142] bg-[#111827] p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-[#0F1117]"
                  style={{ backgroundColor: ROLE_TONE[person.role] }}
                >
                  {person.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-bold text-white">
                      {person.name}
                    </p>
                    <select
                      value={person.role}
                      onChange={(event) => updateRole(person.id, event.target.value as CasePersonRole)}
                      className="min-h-8 rounded-md border border-[#334155] bg-[#0F172A] px-2 text-xs font-bold text-[#E5E7EB] outline-none focus:border-[#A78BFA]"
                      aria-label={`Assign role for ${person.name}`}
                    >
                      {CASE_PERSON_ROLES.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {person.organization && (
                    <p className="mt-1 text-xs font-semibold text-[#94A3B8]">
                      {person.organization}
                    </p>
                  )}
                  <div className="mt-2 space-y-1 text-xs leading-relaxed text-[#CBD5E0]">
                    {person.email && (
                      <p className="flex items-center gap-1.5">
                        <Icon name="mail" size={14} className="text-[#94A3B8]" />
                        <span className="truncate">{person.email}</span>
                      </p>
                    )}
                    {person.phone && (
                      <p className="flex items-center gap-1.5">
                        <Icon name="call" size={14} className="text-[#94A3B8]" />
                        {person.phone}
                      </p>
                    )}
                    {person.notes && (
                      <p className="rounded-md border border-[#273142] bg-[#0F1117] px-3 py-2 text-[#D1D5DB]">
                        {person.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ============================================================
// TIMELINE TAB
// ============================================================

const CURRENT_CASE_OPERATOR = 'J. Torres'

function getTzAbbr(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short', hour: 'numeric' }).formatToParts(date)
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? 'UTC'
}

function fmtCaseDateHeader(iso: string): string {
  const d = new Date(iso)
  return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · ${getTzAbbr(d)}`
}

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
    'mt-1 w-full rounded-md border border-[#374151] bg-[#111827] px-2.5 py-1.5 text-sm font-normal text-[#E5E7EB] outline-none placeholder:text-[#94A3B8] focus:border-[#7C3AED]'

  return (
    <div>
      {/* Quick operator note */}
      <div className="mb-5 rounded-lg border border-[#273142] bg-[#111827] p-3">
        <p className="mb-2 text-xs font-semibold text-[#9CA3AF]">
          Add Operator Note
        </p>
        <textarea
          value={quickNote}
          rows={2}
          placeholder="Jot down a quick observation…"
          onChange={(e) => setQuickNote(e.target.value)}
          className="w-full resize-none rounded-md border border-[#374151] bg-[#111827] px-2.5 py-1.5 text-sm font-normal text-[#E5E7EB] outline-none placeholder:text-[#94A3B8] focus:border-[#7C3AED]"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={submitQuickNote}
            className="rounded-lg border border-[#374151] px-4 py-1.5 text-xs font-semibold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white"
          >
            Add Note
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#CBD5E0]">
          Investigation Timeline · {timeline.length} events
        </p>
        <button
          onClick={() => setShowEventForm(!showEventForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#374151] px-3 py-1.5 text-xs font-semibold text-[#9CA3AF] transition-colors hover:bg-[#1F2937] hover:text-white"
        >
          <Icon name="add" size={16} /> Add Manual Event
        </button>
      </div>

      {showEventForm && (
        <div className="mb-5 rounded-lg border border-dashed border-[#4B5563] bg-[#111827] p-4">
          <p className="mb-3 text-sm font-semibold text-[#CBD5E0]">
            New Manual Event
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[#9CA3AF]">
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
            <label className="text-xs font-semibold text-[#9CA3AF]">
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
          <label className="mt-3 block text-xs font-semibold text-[#9CA3AF]">
            Title
            <input
              type="text"
              value={form.title}
              placeholder="Short event title"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="mt-3 block text-xs font-semibold text-[#9CA3AF]">
            Description
            <textarea
              value={form.detail}
              rows={2}
              placeholder="What happened?"
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </label>
          <label className="mt-3 block text-xs font-semibold text-[#9CA3AF]">
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
        {(() => {
          let currentDate = ''
          return timeline.flatMap((ev, idx) => {
            const isLast = idx === timeline.length - 1
            const isDisposition =
              !!ev.isManual &&
              (ev.title.startsWith('Task completed') ||
                ev.title.startsWith('Question resolved'))
            const isOperatorNote = !!ev.isManual && ev.title === 'Operator Note'
            const cardCls = ev.flagged
              ? 'bg-[#181010] border border-[#7F1D1D] border-l-4 border-l-[#EF4444]'
              : isDisposition
                ? 'bg-[#111827] border border-dashed border-[#274235]'
                : isOperatorNote
                  ? 'bg-[#111827] border border-dashed border-[#4A3520]'
                  : ev.isManual
                    ? 'bg-[#171D29] border border-dashed border-[#374151]'
                    : ev.isAIGenerated
                      ? 'bg-[#171D29] border-l-2 border-l-[#64748B] border-y border-r border-[#273142]'
                      : 'bg-[#171D29] border border-[#273142]'
            const titleIcon = ev.flagged
              ? 'warning'
              : isDisposition
                ? 'check_circle'
                : isOperatorNote
                  ? 'edit_note'
                  : TYPE_ICON[ev.type]

            const evDate = new Date(ev.timestamp).toDateString()
            const items: React.ReactNode[] = []

            if (evDate !== currentDate) {
              currentDate = evDate
              items.push(
                <li key={`date-sep-${evDate}`} className="flex items-center gap-2 pb-6">
                  <div className="w-14 shrink-0" />
                  <div className="flex w-7 shrink-0 justify-center">
                    <span className="h-2 w-2 rounded-full bg-[#374151]" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className="material-symbols-outlined text-[#94A3B8]"
                      style={{ fontSize: '12px', lineHeight: 1 }}
                    >
                      calendar_today
                    </span>
                    <span className="whitespace-nowrap text-xs font-semibold text-[#94A3B8]">
                      {fmtCaseDateHeader(ev.timestamp)}
                    </span>
                    <span className="flex-1 border-t border-dashed border-[#2D3748]" />
                  </div>
                </li>
              )
            }

            items.push(
              <li key={ev.id} className="relative flex gap-3 pb-6">
                {/* Time + connector */}
                <div className="flex w-14 shrink-0 flex-col items-end">
                  <span className="font-mono text-xs font-semibold text-[#94A3B8]">
                    {fmtTime(ev.timestamp)}
                  </span>
                </div>
                <div className="relative flex flex-col items-center">
                  <span className="z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[#273142] bg-[#111827]">
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="flex items-start gap-1.5 text-[15px] font-semibold leading-snug text-white">
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
                            <span className="rounded border border-[#374151] px-1.5 py-0.5 text-xs font-semibold text-[#9CA3AF]">
                              AI
                            </span>
                          )}
                          {isDisposition && (
                            <span className="rounded border border-dashed border-[#274235] px-1.5 py-0.5 text-xs font-semibold text-[#86EFAC]">
                              Action
                            </span>
                          )}
                          {isOperatorNote && (
                            <span className="rounded border border-dashed border-[#4A3520] px-1.5 py-0.5 text-xs font-semibold text-[#FBBF24]">
                              Operator Note
                            </span>
                          )}
                          {ev.isManual && !isDisposition && !isOperatorNote && (
                            <span className="rounded border border-dashed border-[#4B5563] px-1.5 py-0.5 text-xs font-semibold text-[#9CA3AF]">
                              Manual Evidence
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[#CBD5E0]">
                        {ev.detail}
                      </p>
                      {isOperatorNote && (
                        <p className="mt-1.5 text-xs font-medium text-[#F59E0B]">
                          — {CURRENT_CASE_OPERATOR}
                        </p>
                      )}
                      {ev.entityRefs.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {ev.entityRefs.map((e) => (
                            <span
                              key={e.id}
                              className="inline-flex items-center gap-1 rounded-full bg-[#111827] px-2 py-0.5 text-xs font-medium text-[#CBD5E0] ring-1 ring-[#273142]"
                            >
                              <Icon name={ENTITY_ICON[e.type]} size={12} /> {e.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Inline camera still */}
                    {ev.cameraPreview && (
                      <div className="w-full max-w-[140px] shrink-0 sm:w-[100px]">
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
            return items
          })
        })()}
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
      <p className="mb-4 text-sm font-semibold text-[#CBD5E0]">
        Linked Evidence · {EVIDENCE.length} items · chain of custody preserved
      </p>
      <div className="overflow-x-auto rounded-lg border border-[#273142]">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead className="bg-[#111827] text-xs text-[#9CA3AF]">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Type</th>
              <th className="px-3 py-2.5 font-semibold">Label</th>
              <th className="px-3 py-2.5 font-semibold">Source</th>
              <th className="px-3 py-2.5 font-semibold">Timestamp</th>
              <th className="px-3 py-2.5 font-semibold">Confidence</th>
              <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#273142]">
            {EVIDENCE.map((ev) => (
              <tr
                key={ev.id}
                className="bg-[#171D29] transition-colors hover:bg-[#1D2533]"
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
                <td className="px-3 py-3 font-mono text-[#94A3B8]">
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
                            ev.confidence >= 0.8 ? '#94A3B8' : '#D97706',
                        }}
                      />
                    </div>
                    <span className="font-semibold text-[#CBD5E0]">
                      {Math.round(ev.confidence * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <button className="rounded-md border border-[#374151] px-2.5 py-1 text-xs font-semibold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white">
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
    'rounded-md border border-[#374151] bg-[#111827] px-2.5 py-1.5 text-xs text-[#E5E7EB] outline-none placeholder:text-[#94A3B8] focus:border-[#7C3AED]'

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
                      ? 'text-[#94A3B8] line-through'
                      : 'text-white'
                  }`}
                >
                  {t.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9CA3AF]">
                  <span>
                    Owner:{' '}
                    <span className="font-medium text-[#CBD5E0]">
                      {t.owner}
                    </span>
                    {t.ownerTag && (
                      <span className="ml-1.5 inline-flex items-center gap-1 rounded bg-[#1E1B4B] px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-[#A5B4FC]">
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
                className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
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
