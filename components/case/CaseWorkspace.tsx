'use client'

import { useState } from 'react'
import type {
  Case,
  TimelineEvent,
  Entity,
  EntityType,
  Evidence,
  CaseLifecycleStage,
  CaseLifecycleEvent,
  CaseAccessMember,
  CasePermission,
  Severity,
} from '@/lib/types'
import { MOCK_CASES, ENTITIES, MOCK_CAMPAIGNS } from '@/lib/mock-data/scenarios'
import EntityGraph from '@/components/case/EntityGraph'
import AIAssistant from '@/components/case/AIAssistant'
import NarrativeReport from '@/components/case/NarrativeReport'
import { PersonCard } from '@/components/case/PersonCard'
import { CameraStill } from '@/components/incident/CameraStill'
import { CameraClipModal } from '@/components/incident/CameraClipModal'

const defaultCase = MOCK_CASES[0]

type WorkspaceTab = 'timeline' | 'evidence' | 'graph' | 'tasks' | 'ai'

const WORKSPACE_TABS: { key: WorkspaceTab; label: string; icon: string }[] = [
  { key: 'timeline', label: 'Timeline', icon: 'timeline' },
  { key: 'evidence', label: 'Evidence', icon: 'source' },
  { key: 'graph', label: 'Entity Graph', icon: 'hub' },
  { key: 'tasks', label: 'Tasks', icon: 'task_alt' },
  { key: 'ai', label: 'AI Assistant', icon: 'smart_toy' },
]

const CASE_STAGE_META: Record<
  CaseLifecycleStage,
  { label: string; description: string; tone: string }
> = {
  draft: {
    label: 'Draft',
    description: 'Intake is being prepared before formal opening.',
    tone: '#94A3B8',
  },
  open: {
    label: 'Open',
    description: 'Case exists and is ready for assignment.',
    tone: '#60A5FA',
  },
  triage: {
    label: 'Triage',
    description: 'Scope, severity, people, and initial evidence are being validated.',
    tone: '#7DD3FC',
  },
  under_investigation: {
    label: 'Under Investigation',
    description: 'Evidence review, interviews, tasks, and timeline reconstruction are active.',
    tone: '#A78BFA',
  },
  pending_external_input: {
    label: 'Pending External Input',
    description: 'Waiting on HR, Legal, site, law enforcement, vendor, or other partner.',
    tone: '#FBBF24',
  },
  pending_approval: {
    label: 'Pending Approval',
    description: 'Investigation is ready for reviewer approval and closure decision.',
    tone: '#F59E0B',
  },
  closed_substantiated: {
    label: 'Closed - Substantiated',
    description: 'Findings are confirmed and approved.',
    tone: '#34D399',
  },
  closed_unsubstantiated: {
    label: 'Closed - Unsubstantiated',
    description: 'Investigation did not support the allegation.',
    tone: '#94A3B8',
  },
  closed_inconclusive: {
    label: 'Closed - Inconclusive',
    description: 'Available evidence was insufficient for a finding.',
    tone: '#CBD5E1',
  },
  reopened: {
    label: 'Reopened',
    description: 'Closed case reopened due to new evidence or appeal.',
    tone: '#FB7185',
  },
  archived: {
    label: 'Archived',
    description: 'Retention-only record; editing is locked except legal/admin actions.',
    tone: '#64748B',
  },
}

const CASE_TRANSITIONS: Record<CaseLifecycleStage, CaseLifecycleStage[]> = {
  draft: ['open'],
  open: ['triage', 'under_investigation'],
  triage: ['under_investigation', 'pending_external_input'],
  under_investigation: ['pending_external_input', 'pending_approval'],
  pending_external_input: ['under_investigation', 'pending_approval'],
  pending_approval: [
    'under_investigation',
    'closed_substantiated',
    'closed_unsubstantiated',
    'closed_inconclusive',
  ],
  closed_substantiated: ['reopened', 'archived'],
  closed_unsubstantiated: ['reopened', 'archived'],
  closed_inconclusive: ['reopened', 'archived'],
  reopened: ['under_investigation'],
  archived: [],
}

type CaseAccessRole =
  | 'case_owner'
  | 'case_investigator'
  | 'reviewer'
  | 'contributor'
  | 'viewer'
  | 'hr_partner'
  | 'legal'
  | 'site_supervisor'
  | 'external_collaborator'
  | 'admin'

const ACCESS_ROLE_LABEL: Record<CaseAccessRole, string> = {
  case_owner: 'Case Owner',
  case_investigator: 'Case Investigator',
  reviewer: 'Reviewer / Approver',
  contributor: 'Contributor',
  viewer: 'Viewer',
  hr_partner: 'HR Partner',
  legal: 'Legal',
  site_supervisor: 'Site Supervisor',
  external_collaborator: 'External Collaborator',
  admin: 'Admin',
}

const ACCESS_ROLE_PERMISSIONS: Record<CaseAccessRole, CasePermission[]> = {
  case_owner: [
    'case.view',
    'case.edit',
    'case.close',
    'case.reopen',
    'case.manage_access',
    'evidence.view',
    'evidence.add',
    'evidence.edit_metadata',
    'people.add',
    'people.edit',
    'tasks.assign',
    'report.edit',
    'export.create',
    'integration.send',
  ],
  case_investigator: [
    'case.view',
    'case.edit',
    'evidence.view',
    'evidence.add',
    'evidence.edit_metadata',
    'people.add',
    'people.edit',
    'tasks.assign',
    'report.edit',
    'export.create',
    'integration.send',
  ],
  reviewer: ['case.view', 'evidence.view', 'report.approve', 'export.create'],
  contributor: ['case.view', 'evidence.view', 'evidence.add'],
  viewer: ['case.view', 'evidence.view'],
  hr_partner: ['case.view', 'people.add', 'people.edit', 'report.edit'],
  legal: ['case.view', 'evidence.view', 'report.edit', 'report.approve', 'export.create'],
  site_supervisor: ['case.view', 'evidence.view', 'evidence.add', 'tasks.assign'],
  external_collaborator: ['case.view', 'evidence.add'],
  admin: [
    'case.view',
    'case.edit',
    'case.close',
    'case.reopen',
    'case.manage_access',
    'evidence.view',
    'evidence.add',
    'evidence.edit_metadata',
    'evidence.remove',
    'people.add',
    'people.edit',
    'tasks.assign',
    'report.edit',
    'report.approve',
    'export.create',
    'integration.send',
  ],
}

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
    origin: 'system',
    fileName: 'C4-corridor-1426-1442.mp4',
    mimeType: 'video/mp4',
    sizeBytes: 18874368,
    hash: 'sha256:9c8f...7b21',
    uploadedBy: 'Avigilon VMS',
    addedAt: '2026-06-04T14:40:00Z',
    custodyEvents: [
      {
        id: 'cust-001',
        action: 'retained',
        actor: 'Agora System',
        timestamp: '2026-06-04T14:40:00Z',
        note: 'Clip retained from VMS archive during incident promotion.',
      },
    ],
  },
  {
    id: 'ev-002',
    type: 'access_event',
    label: 'Badge B-4421 denial log',
    sourceSystem: 'Brivo ACS',
    timestamp: '2026-06-04T14:34:00Z',
    confidence: 1.0,
    retention: '1 year',
    origin: 'system',
    fileName: 'brivo-denial-1434.json',
    mimeType: 'application/json',
    sizeBytes: 4096,
    hash: 'sha256:f142...ab0d',
    uploadedBy: 'Brivo ACS',
    addedAt: '2026-06-04T14:40:00Z',
    custodyEvents: [
      {
        id: 'cust-002',
        action: 'created',
        actor: 'Brivo ACS',
        timestamp: '2026-06-04T14:34:00Z',
        note: 'Access denial event imported from source system.',
      },
    ],
  },
  {
    id: 'ev-003',
    type: 'access_event',
    label: 'Badge B-4421 denial log (2)',
    sourceSystem: 'Brivo ACS',
    timestamp: '2026-06-04T14:38:00Z',
    confidence: 1.0,
    retention: '1 year',
    origin: 'system',
    fileName: 'brivo-denial-1438.json',
    mimeType: 'application/json',
    sizeBytes: 4096,
    hash: 'sha256:70ac...e914',
    uploadedBy: 'Brivo ACS',
    addedAt: '2026-06-04T14:40:00Z',
    custodyEvents: [
      {
        id: 'cust-003',
        action: 'created',
        actor: 'Brivo ACS',
        timestamp: '2026-06-04T14:38:00Z',
        note: 'Second access denial event imported from source system.',
      },
    ],
  },
  {
    id: 'ev-004',
    type: 'still',
    label: 'Camera C4 — individual ID frame',
    sourceSystem: 'Avigilon',
    timestamp: '2026-06-04T14:35:00Z',
    confidence: 0.87,
    retention: '90 days',
    origin: 'system',
    fileName: 'camera-c4-id-frame.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 842144,
    hash: 'sha256:240e...902a',
    uploadedBy: 'Avigilon VMS',
    addedAt: '2026-06-04T14:40:00Z',
    custodyEvents: [
      {
        id: 'cust-004',
        action: 'retained',
        actor: 'Agora System',
        timestamp: '2026-06-04T14:40:00Z',
        note: 'Still frame retained from incident evidence bundle.',
      },
    ],
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

const INITIAL_LIFECYCLE_EVENTS: CaseLifecycleEvent[] = [
  {
    id: 'life-001',
    fromStage: 'draft',
    toStage: 'open',
    changedBy: 'Agora System',
    changedAt: '2026-06-04T14:40:00Z',
    reason: 'Incident inc-001 promoted to case after operator accepted response workflow.',
  },
  {
    id: 'life-002',
    fromStage: 'open',
    toStage: 'under_investigation',
    changedBy: 'J. Torres',
    changedAt: '2026-06-04T15:12:00Z',
    reason: 'Initial evidence review confirmed unauthorized access probing pattern.',
  },
]

const INITIAL_ACCESS_MEMBERS: CaseAccessMember[] = [
  {
    id: 'access-owner',
    subjectType: 'user',
    subjectName: 'J. Torres',
    role: 'case_owner',
    permissions: ACCESS_ROLE_PERMISSIONS.case_owner,
    accessScope: 'full_case',
    addedBy: 'Agora System',
    addedAt: '2026-06-04T14:40:00Z',
  },
  {
    id: 'access-hr',
    subjectType: 'group',
    subjectName: 'HR Business Partners',
    role: 'hr_partner',
    permissions: ACCESS_ROLE_PERMISSIONS.hr_partner,
    accessScope: 'people_only',
    addedBy: 'J. Torres',
    addedAt: '2026-06-04T15:03:00Z',
  },
  {
    id: 'access-legal',
    subjectType: 'group',
    subjectName: 'Corporate Legal',
    role: 'legal',
    permissions: ACCESS_ROLE_PERMISSIONS.legal,
    accessScope: 'report_only',
    addedBy: 'J. Torres',
    addedAt: '2026-06-04T15:05:00Z',
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

export default function CaseWorkspace({
  initialCase = defaultCase,
  onBackToQueue,
}: {
  initialCase?: Case
  onBackToQueue?: () => void
}) {
  const [tab, setTab] = useState<WorkspaceTab>('timeline')
  const [timeline, setTimeline] = useState<TimelineEvent[]>(initialCase.timeline)
  const [caseData, setCaseData] = useState<Case>({
    ...initialCase,
    source: initialCase.source ?? 'incident_promotion',
    lifecycleStage: initialCase.lifecycleStage ?? 'under_investigation',
    lifecycleEvents: INITIAL_LIFECYCLE_EVENTS,
    accessMembers: INITIAL_ACCESS_MEMBERS,
  })
  const [evidenceItems, setEvidenceItems] = useState<Evidence[]>(EVIDENCE)
  const [showEventForm, setShowEventForm] = useState(false)
  const [tasks, setTasks] = useState<CaseTask[]>(INITIAL_TASKS)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [resolvedQuestions, setResolvedQuestions] = useState<string[]>([])
  const [showReport, setShowReport] = useState(false)
  const [participants, setParticipants] = useState<CaseParticipant[]>(INITIAL_CASE_PARTICIPANTS)
  const [showIntake, setShowIntake] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showIntegration, setShowIntegration] = useState(false)

  const campaign = MOCK_CAMPAIGNS.find((c) => c.id === caseData.campaignId)
  const sev = SEVERITY_STYLE[caseData.severity]
  const stage = caseData.lifecycleStage ?? 'under_investigation'

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

  function appendAuditEvent(title: string, detail: string) {
    const ev: TimelineEvent = {
      id: `tl-audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'manual',
      title,
      detail,
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

  function handleStageChange(nextStage: CaseLifecycleStage, reason: string) {
    const fromStage = caseData.lifecycleStage ?? 'under_investigation'
    const event: CaseLifecycleEvent = {
      id: `life-${Date.now()}`,
      fromStage,
      toStage: nextStage,
      changedBy: CURRENT_CASE_OPERATOR,
      changedAt: new Date().toISOString(),
      reason,
    }
    setCaseData((prev) => ({
      ...prev,
      lifecycleStage: nextStage,
      lifecycleEvents: [...(prev.lifecycleEvents ?? []), event],
      status: nextStage.startsWith('closed')
        ? 'closed'
        : nextStage === 'reopened'
          ? 'reopened'
          : nextStage === 'pending_external_input'
            ? 'waiting'
            : nextStage === 'draft' || nextStage === 'open' || nextStage === 'triage'
              ? 'new'
              : 'investigating',
      updatedAt: event.changedAt,
    }))
    appendAuditEvent(
      `Lifecycle changed: ${CASE_STAGE_META[fromStage].label} → ${CASE_STAGE_META[nextStage].label}`,
      reason
    )
  }

  function handleCreateCase(draft: {
    source: 'manual' | 'incident_promotion'
    title: string
    severity: Severity
    siteName: string
    location: string
    description: string
    notifiedParties: string
  }) {
    const now = new Date().toISOString()
    setCaseData((prev) => ({
      ...prev,
      id: draft.source === 'manual' ? `case-${Date.now().toString().slice(-4)}` : prev.id,
      source: draft.source,
      title: draft.title,
      severity: draft.severity,
      siteName: draft.siteName,
      location: draft.location,
      lifecycleStage: 'open',
      status: 'new',
      createdAt: now,
      updatedAt: now,
      openQuestions: [
        'Which systems contain authoritative evidence for this incident?',
        'Who must be notified before closure?',
        'Are there related incidents or repeat patterns?',
      ],
      tags: draft.source === 'manual' ? ['manual-intake', 'needs-triage'] : prev.tags,
      lifecycleEvents: [
        ...(prev.lifecycleEvents ?? []),
        {
          id: `life-${Date.now()}`,
          fromStage: 'draft',
          toStage: 'open',
          changedBy: CURRENT_CASE_OPERATOR,
          changedAt: now,
          reason:
            draft.source === 'manual'
              ? 'Manual case intake submitted with AI-assisted defaults.'
              : 'Incident promoted with inherited evidence and timeline.',
        },
      ],
    }))
    appendAuditEvent(
      draft.source === 'manual' ? 'Manual case created' : 'Incident promoted to case',
      `${draft.description} Notified parties: ${draft.notifiedParties || 'Not specified'}.`
    )
    setShowIntake(false)
  }

  function handleEvidenceAdd(evidence: Evidence) {
    setEvidenceItems((prev) => [evidence, ...prev])
    appendAuditEvent(
      `Evidence added: ${evidence.label}`,
      `${evidence.sourceSystem} · ${evidence.origin === 'external_link' ? evidence.externalUrl : evidence.fileName || evidence.retention}`
    )
  }

  function handleAccessAdd(member: CaseAccessMember) {
    setCaseData((prev) => ({
      ...prev,
      accessMembers: [...(prev.accessMembers ?? []), member],
    }))
    appendAuditEvent(
      `Access granted: ${member.subjectName}`,
      `${ACCESS_ROLE_LABEL[member.role as CaseAccessRole] ?? member.role} · ${member.accessScope ?? 'full_case'}`
    )
  }

  function handleExport(format: string, includeEvidence: boolean) {
    appendAuditEvent(
      `Case export generated: ${format}`,
      includeEvidence
        ? 'Export package includes report, structured data, audit trail, custody manifest, and attached evidence files where available.'
        : 'Export package includes report, structured data, audit trail, and custody manifest without binary evidence files.'
    )
    setShowExport(false)
  }

  function handleIntegrationSend(system: string, includeEvidence: boolean) {
    appendAuditEvent(
      `Case sent to ${system}`,
      includeEvidence
        ? 'Payload preview accepted; evidence references and manifest included.'
        : 'Payload preview accepted; case metadata and report links included.'
    )
    setShowIntegration(false)
  }

  return (
    <div className="px-4 py-5 sm:px-6 xl:px-8">
      <div className="grid grid-cols-1 gap-6 min-[1800px]:grid-cols-[minmax(0,1.55fr)_minmax(380px,0.85fr)]">
        {/* ===================== LEFT COLUMN ===================== */}
        <div className="space-y-5">
          {onBackToQueue && (
            <button
              type="button"
              onClick={onBackToQueue}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#374151] px-3 text-xs font-bold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white"
            >
              <Icon name="arrow_back" size={16} />
              Back to Case Queue
            </button>
          )}

          {/* Case header card */}
          <div className="overflow-hidden rounded-xl border border-[#273142] bg-[#171D29]">
            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#9CA3AF]">
                      {caseData.id}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full border border-[#374151] px-2.5 py-0.5 text-xs font-semibold"
                      style={{ color: sev.text }}
                    >
                      {caseData.severity}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full border border-[#374151] px-2.5 py-0.5 text-xs font-semibold"
                      style={{ color: CASE_STAGE_META[stage].tone }}
                    >
                      {CASE_STAGE_META[stage].label}
                    </span>
                  </div>
                  <h2 className="mt-2 max-w-4xl text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                    {caseData.title}
                  </h2>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowIntake(true)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#374151] px-3 text-xs font-bold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white"
                  >
                    <Icon name="post_add" size={16} />
                    New Case
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExport(true)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#374151] px-3 text-xs font-bold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white"
                  >
                    <Icon name="archive" size={16} />
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIntegration(true)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#7C3AED] px-3 text-xs font-bold text-white transition-colors hover:bg-[#6D28D9]"
                  >
                    <Icon name="ios_share" size={16} />
                    Send
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm leading-relaxed">
                <div className="min-w-max">
                  <span className="text-[#94A3B8]">Owner</span>
                  <span className="ml-1.5 font-semibold text-[#CBD5E0]">
                    {caseData.owner}
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
                    {caseData.siteName}
                  </span>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                  <span className="text-[#94A3B8]">SLA</span>
                  <span className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-full border border-[#374151] px-2.5 py-1 font-semibold text-[#CBD5E0]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
                    <span className="min-w-0">
                      {caseData.sla.breached ? 'Breached' : 'On track'} · due{' '}
                      {fmtDateTime(caseData.sla.dueAt)}
                    </span>
                  </span>
                </div>
              </div>

              <CaseContextStrip
                caseData={caseData}
                entityRefs={caseData.entityRefs}
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
              {tab === 'evidence' && (
                <EvidenceTab
                  evidenceItems={evidenceItems}
                  onEvidenceAdd={handleEvidenceAdd}
                />
              )}
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
          {caseData.person && <PersonCard person={caseData.person} />}

          <CaseLifecyclePanel
            stage={stage}
            events={caseData.lifecycleEvents ?? []}
            onStageChange={handleStageChange}
          />

          <CaseAccessPanel
            members={caseData.accessMembers ?? []}
            onAddMember={handleAccessAdd}
          />

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
              {caseData.openQuestions.map((q) => {
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
          caseData={{ ...caseData, timeline }}
          entities={ENTITIES.filter((e) =>
            caseData.entityRefs.some((r) => r.id === e.id)
          )}
          onClose={() => setShowReport(false)}
        />
      )}

      {showIntake && (
        <CaseIntakeModal
          baseCase={caseData}
          onClose={() => setShowIntake(false)}
          onCreate={handleCreateCase}
        />
      )}

      {showExport && (
        <CaseExportModal
          caseData={caseData}
          evidenceItems={evidenceItems}
          onClose={() => setShowExport(false)}
          onExport={handleExport}
        />
      )}

      {showIntegration && (
        <CaseIntegrationModal
          caseData={caseData}
          evidenceItems={evidenceItems}
          onClose={() => setShowIntegration(false)}
          onSend={handleIntegrationSend}
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
// CASE LIFECYCLE PANEL
// ============================================================

function CaseLifecyclePanel({
  stage,
  events,
  onStageChange,
}: {
  stage: CaseLifecycleStage
  events: CaseLifecycleEvent[]
  onStageChange: (stage: CaseLifecycleStage, reason: string) => void
}) {
  const [nextStage, setNextStage] = useState<CaseLifecycleStage>(
    CASE_TRANSITIONS[stage][0] ?? stage
  )
  const [reason, setReason] = useState('')
  const availableTransitions = CASE_TRANSITIONS[stage]

  function submitTransition() {
    if (!reason.trim() || nextStage === stage) return
    onStageChange(nextStage, reason.trim())
    setReason('')
  }

  return (
    <section className="rounded-xl border border-[#273142] bg-[#171D29]">
      <div className="border-b border-[#273142] px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon name="account_tree" size={17} className="text-[#7DD3FC]" />
          Case Lifecycle
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
          Stage transitions require a reason and are appended to the case audit trail.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-lg border border-[#334155] bg-[#111827] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                Current stage
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                {CASE_STAGE_META[stage].label}
              </p>
            </div>
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CASE_STAGE_META[stage].tone }}
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#CBD5E0]">
            {CASE_STAGE_META[stage].description}
          </p>
        </div>

        {availableTransitions.length > 0 ? (
          <div className="rounded-lg border border-[#334155] bg-[#111827] p-3">
            <label className="text-xs font-bold text-[#CBD5E0]">
              Change stage
              <select
                value={nextStage}
                onChange={(event) => setNextStage(event.target.value as CaseLifecycleStage)}
                className="mt-1 min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm font-semibold text-white outline-none focus:border-[#7DD3FC]"
                aria-label="Select next case lifecycle stage"
              >
                {availableTransitions.map((transition) => (
                  <option key={transition} value={transition}>
                    {CASE_STAGE_META[transition].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-xs font-bold text-[#CBD5E0]">
              Reason
              <textarea
                rows={2}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-1 w-full resize-none rounded-lg border border-[#334155] bg-[#0F1117] px-3 py-2 text-sm leading-relaxed text-white outline-none placeholder:text-[#94A3B8] focus:border-[#7DD3FC]"
                placeholder="Required for auditability, approvals, reopen, and closure."
              />
            </label>
            <button
              type="button"
              onClick={submitTransition}
              disabled={!reason.trim()}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-3 text-xs font-bold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-[#374151] disabled:text-[#94A3B8]"
            >
              <Icon name="swap_horiz" size={16} />
              Apply Stage Change
            </button>
          </div>
        ) : (
          <p className="rounded-lg border border-[#334155] bg-[#111827] p-3 text-xs leading-relaxed text-[#CBD5E0]">
            Archived cases are locked for editing. Admin or Legal can export or retain the record.
          </p>
        )}

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
            Stage history
          </p>
          <ol className="space-y-2">
            {events.slice(-4).reverse().map((event) => (
              <li key={event.id} className="rounded-lg border border-[#273142] bg-[#111827] p-3">
                <p className="text-xs font-bold text-white">
                  {CASE_STAGE_META[event.fromStage].label} → {CASE_STAGE_META[event.toStage].label}
                </p>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {fmtDateTime(event.changedAt)} · {event.changedBy}
                </p>
                {event.reason && (
                  <p className="mt-1 text-xs leading-relaxed text-[#CBD5E0]">
                    {event.reason}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// CASE ACCESS PANEL
// ============================================================

function CaseAccessPanel({
  members,
  onAddMember,
}: {
  members: CaseAccessMember[]
  onAddMember: (member: CaseAccessMember) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    subjectType: 'user' as CaseAccessMember['subjectType'],
    subjectName: '',
    role: 'viewer' as CaseAccessRole,
    accessScope: 'full_case' as NonNullable<CaseAccessMember['accessScope']>,
    expiresAt: '',
  })

  function addMember() {
    if (!form.subjectName.trim()) return
    onAddMember({
      id: `access-${Date.now()}`,
      subjectType: form.subjectType,
      subjectName: form.subjectName.trim(),
      role: form.role,
      permissions: ACCESS_ROLE_PERMISSIONS[form.role],
      accessScope: form.accessScope,
      expiresAt: form.expiresAt || undefined,
      addedBy: CURRENT_CASE_OPERATOR,
      addedAt: new Date().toISOString(),
    })
    setForm({
      subjectType: 'user',
      subjectName: '',
      role: 'viewer',
      accessScope: 'full_case',
      expiresAt: '',
    })
    setShowForm(false)
  }

  const selectedPermissions = ACCESS_ROLE_PERMISSIONS[form.role]

  return (
    <section className="rounded-xl border border-[#273142] bg-[#171D29]">
      <div className="flex items-start justify-between gap-3 border-b border-[#273142] px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Icon name="lock_person" size={17} className="text-[#FBBF24]" />
            Case Access
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">
            People and groups receive role templates plus optional scoped access.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-[#374151] px-3 text-xs font-bold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white"
        >
          <Icon name={showForm ? 'close' : 'group_add'} size={16} />
          {showForm ? 'Cancel' : 'Grant'}
        </button>
      </div>

      <div className="space-y-4 p-5">
        {showForm && (
          <div className="rounded-lg border border-[#334155] bg-[#111827] p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-[#CBD5E0]">
                Subject type
                <select
                  value={form.subjectType}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      subjectType: event.target.value as CaseAccessMember['subjectType'],
                    }))
                  }
                  className="mt-1 min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm text-white outline-none focus:border-[#FBBF24]"
                >
                  <option value="user">User</option>
                  <option value="group">Group</option>
                </select>
              </label>
              <label className="text-xs font-bold text-[#CBD5E0]">
                Person or group
                <input
                  value={form.subjectName}
                  onChange={(event) => setForm((prev) => ({ ...prev, subjectName: event.target.value }))}
                  className="mt-1 min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#FBBF24]"
                  placeholder="e.g. Legal Reviewers"
                />
              </label>
              <label className="text-xs font-bold text-[#CBD5E0]">
                Role
                <select
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as CaseAccessRole }))}
                  className="mt-1 min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm text-white outline-none focus:border-[#FBBF24]"
                >
                  {(Object.keys(ACCESS_ROLE_LABEL) as CaseAccessRole[]).map((role) => (
                    <option key={role} value={role}>
                      {ACCESS_ROLE_LABEL[role]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold text-[#CBD5E0]">
                Scope
                <select
                  value={form.accessScope}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      accessScope: event.target.value as NonNullable<CaseAccessMember['accessScope']>,
                    }))
                  }
                  className="mt-1 min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm text-white outline-none focus:border-[#FBBF24]"
                >
                  <option value="full_case">Full case</option>
                  <option value="evidence_only">Evidence only</option>
                  <option value="people_only">People only</option>
                  <option value="tasks_only">Tasks only</option>
                  <option value="report_only">Report only</option>
                </select>
              </label>
              <label className="text-xs font-bold text-[#CBD5E0] sm:col-span-2">
                Expiration
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
                  className="mt-1 min-h-10 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 text-sm text-white outline-none focus:border-[#FBBF24]"
                />
              </label>
            </div>
            <div className="mt-3 rounded-md border border-[#273142] bg-[#0F1117] p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                Generated permissions
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedPermissions.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full border border-[#334155] px-2 py-0.5 text-xs font-medium text-[#CBD5E0]"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={addMember}
              disabled={!form.subjectName.trim()}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#F59E0B] px-4 text-sm font-bold text-[#0F1117] transition-colors hover:bg-[#FBBF24] disabled:cursor-not-allowed disabled:bg-[#374151] disabled:text-[#94A3B8]"
            >
              <Icon name="verified_user" size={17} />
              Grant Case Access
            </button>
          </div>
        )}

        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="rounded-lg border border-[#273142] bg-[#111827] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {member.subjectName}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#94A3B8]">
                    {member.subjectType} · {ACCESS_ROLE_LABEL[member.role as CaseAccessRole] ?? member.role}
                  </p>
                </div>
                <span className="rounded-full border border-[#334155] px-2 py-0.5 text-xs font-semibold text-[#CBD5E0]">
                  {member.accessScope?.replace('_', ' ') ?? 'full case'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#CBD5E0]">
                {member.permissions.length} permissions · added {fmtDateTime(member.addedAt)}
                {member.expiresAt ? ` · expires ${fmtDateTime(member.expiresAt)}` : ''}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ============================================================
// CASE INTAKE / EXPORT / INTEGRATION MODALS
// ============================================================

function ModalShell({
  title,
  subtitle,
  icon,
  onClose,
  children,
}: {
  title: string
  subtitle: string
  icon: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#2D3748] bg-[#1A1F2E] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#2D3748] bg-[#111827] px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#243048] text-[#A78BFA]">
              <Icon name={icon} size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white">{title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#243048] hover:text-white"
            aria-label={`Close ${title}`}
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

function CaseIntakeModal({
  baseCase,
  onClose,
  onCreate,
}: {
  baseCase: Case
  onClose: () => void
  onCreate: (draft: {
    source: 'manual' | 'incident_promotion'
    title: string
    severity: Severity
    siteName: string
    location: string
    description: string
    notifiedParties: string
  }) => void
}) {
  const [source, setSource] = useState<'manual' | 'incident_promotion'>('manual')
  const [draftSeed, setDraftSeed] = useState('')
  const [form, setForm] = useState({
    title: 'Unauthorized access investigation',
    severity: 'medium' as Severity,
    siteName: baseCase.siteName,
    location: baseCase.location ?? 'Austin HQ · Investigation location pending',
    description:
      'Physical security investigation opened for access anomaly requiring evidence review, people assignment, and closure approval.',
    notifiedParties: 'Security leadership; Site supervisor',
  })

  function draftWithAi() {
    const seed = draftSeed.trim() || 'manual security incident'
    const critical =
      /server|restricted|violence|weapon|critical|unauthorized/i.test(seed)
    setForm((prev) => ({
      ...prev,
      title: critical
        ? 'Unauthorized restricted-area access investigation'
        : 'Physical security incident investigation',
      severity: critical ? 'critical' : 'medium',
      description: `AI draft from intake note: ${seed}. Initial scope includes validating the incident classification, preserving relevant video/access evidence, identifying people involved, assigning owner tasks, and documenting notifications.`,
      notifiedParties: critical
        ? 'Security leadership; HR; Site supervisor; Legal for evidence hold'
        : 'Security leadership; Site supervisor',
    }))
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 py-2 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]'

  return (
    <ModalShell
      title="Case Intake"
      subtitle="Create a case manually or promote an incident with fast defaults and AI-assisted drafting."
      icon="post_add"
      onClose={onClose}
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#334155] bg-[#111827] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
              Intake source
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {[
                ['manual', 'Manual case', 'Start with good defaults for a new investigation.'],
                ['incident_promotion', 'Promote incident', 'Carry incident timeline, evidence, entities, and actions forward.'],
              ].map(([key, label, desc]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSource(key as 'manual' | 'incident_promotion')}
                  className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                    source === key
                      ? 'border-[#7C3AED] bg-[#211B33]'
                      : 'border-[#334155] bg-[#0F1117] hover:bg-[#1F2937]'
                  }`}
                >
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#334155] bg-[#111827] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
              Agentic draft
            </p>
            <textarea
              rows={4}
              value={draftSeed}
              onChange={(event) => setDraftSeed(event.target.value)}
              className="mt-3 w-full resize-none rounded-lg border border-[#334155] bg-[#0F1117] px-3 py-2 text-sm leading-relaxed text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]"
              placeholder="Paste a short intake note. Example: Contractor attempted server room access twice, HR needs review."
            />
            <button
              type="button"
              onClick={draftWithAi}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-3 text-xs font-bold text-white transition-colors hover:bg-[#1D4ED8]"
            >
              <Icon name="auto_awesome" size={16} />
              Draft Case Defaults
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[#334155] bg-[#111827] p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-[#CBD5E0] sm:col-span-2">
              Case title
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className={inputCls}
              />
            </label>
            <label className="text-xs font-bold text-[#CBD5E0]">
              Severity
              <select
                value={form.severity}
                onChange={(event) => setForm((prev) => ({ ...prev, severity: event.target.value as Severity }))}
                className={inputCls}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="text-xs font-bold text-[#CBD5E0]">
              Facility
              <input
                value={form.siteName}
                onChange={(event) => setForm((prev) => ({ ...prev, siteName: event.target.value }))}
                className={inputCls}
              />
            </label>
            <label className="text-xs font-bold text-[#CBD5E0] sm:col-span-2">
              Location
              <input
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                className={inputCls}
              />
            </label>
            <label className="text-xs font-bold text-[#CBD5E0] sm:col-span-2">
              Executive intake summary
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className={`${inputCls} resize-none leading-relaxed`}
              />
            </label>
            <label className="text-xs font-bold text-[#CBD5E0] sm:col-span-2">
              Notified parties
              <input
                value={form.notifiedParties}
                onChange={(event) => setForm((prev) => ({ ...prev, notifiedParties: event.target.value }))}
                className={inputCls}
              />
            </label>
          </div>

          <div className="mt-4 rounded-lg border border-[#273142] bg-[#0F1117] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
              Defaults applied
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                'Owner = current investigator',
                'Stage = Open',
                'SLA from severity',
                'Initial task checklist',
                'Audit event created',
              ].map((item) => (
                <span key={item} className="rounded-full border border-[#334155] px-2 py-0.5 text-xs text-[#CBD5E0]">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCreate({ source, ...form })}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 text-sm font-bold text-white transition-colors hover:bg-[#6D28D9]"
          >
            <Icon name="check_circle" size={18} />
            {source === 'manual' ? 'Create Case' : 'Promote Incident to Case'}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

function CaseExportModal({
  caseData,
  evidenceItems,
  onClose,
  onExport,
}: {
  caseData: Case
  evidenceItems: Evidence[]
  onClose: () => void
  onExport: (format: string, includeEvidence: boolean) => void
}) {
  const [format, setFormat] = useState('Full ZIP package')
  const [includeEvidence, setIncludeEvidence] = useState(true)

  return (
    <ModalShell
      title="Export Case Data"
      subtitle="Generate a defensible package with report, structured data, audit trail, custody manifest, and evidence files."
      icon="archive"
      onClose={onClose}
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          {['Full ZIP package', 'PDF report only', 'JSON', 'XML', 'CSV bundle'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFormat(option)}
              className={`flex min-h-12 w-full items-center justify-between rounded-lg border px-4 text-left text-sm font-bold transition-colors ${
                format === option
                  ? 'border-[#7C3AED] bg-[#211B33] text-white'
                  : 'border-[#334155] bg-[#111827] text-[#CBD5E0] hover:bg-[#1F2937]'
              }`}
            >
              {option}
              {format === option && <Icon name="check_circle" size={17} className="text-[#A78BFA]" />}
            </button>
          ))}
          <label className="flex items-start gap-3 rounded-lg border border-[#334155] bg-[#111827] p-4">
            <input
              type="checkbox"
              checked={includeEvidence}
              onChange={(event) => setIncludeEvidence(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-bold text-white">
                Include attached evidence files
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[#94A3B8]">
                Binary files are included when available; external links remain in the manifest.
              </span>
            </span>
          </label>
        </div>
        <div className="rounded-xl border border-[#334155] bg-[#111827] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
            Package preview
          </p>
          <div className="mt-3 rounded-lg border border-[#273142] bg-[#0F1117] p-3 font-mono text-xs leading-relaxed text-[#CBD5E0]">
            <p>{caseData.id}-export.zip</p>
            <p>├─ report/case-investigation-report.pdf</p>
            <p>├─ data/case.json</p>
            <p>├─ data/case.xml</p>
            <p>├─ data/timeline.csv</p>
            <p>├─ data/evidence-manifest.csv</p>
            <p>├─ data/chain-of-custody.csv</p>
            <p>├─ audit/audit-trail.csv</p>
            <p>├─ evidence/{includeEvidence ? `${evidenceItems.length} referenced items` : 'manifest only'}</p>
            <p>└─ manifest.json</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <CompactMetric label="Evidence items" value={String(evidenceItems.length)} />
            <CompactMetric label="Custody events" value={String(evidenceItems.reduce((sum, item) => sum + (item.custodyEvents?.length ?? 0), 0))} />
            <CompactMetric label="Lifecycle stage" value={CASE_STAGE_META[caseData.lifecycleStage ?? 'under_investigation'].label} />
            <CompactMetric label="Format" value={format} />
          </div>
          <button
            type="button"
            onClick={() => onExport(format, includeEvidence)}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 text-sm font-bold text-white transition-colors hover:bg-[#6D28D9]"
          >
            <Icon name="download" size={18} />
            Generate Export
          </button>
        </div>
      </div>
    </ModalShell>
  )
}

function CompactMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#273142] bg-[#0F1117] p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-white" title={value}>{value}</p>
    </div>
  )
}

function CaseIntegrationModal({
  caseData,
  evidenceItems,
  onClose,
  onSend,
}: {
  caseData: Case
  evidenceItems: Evidence[]
  onClose: () => void
  onSend: (system: string, includeEvidence: boolean) => void
}) {
  const [system, setSystem] = useState('ServiceNow Security Incident')
  const [includeEvidence, setIncludeEvidence] = useState(true)
  const payload = {
    externalSystem: system,
    caseId: caseData.id,
    shortDescription: caseData.title,
    severity: caseData.severity,
    status: CASE_STAGE_META[caseData.lifecycleStage ?? 'under_investigation'].label,
    site: caseData.siteName,
    evidenceCount: includeEvidence ? evidenceItems.length : 0,
    reportTemplate: 'Physical Security Case Investigation Report',
  }

  return (
    <ModalShell
      title="Send Case to External System"
      subtitle="Preview the handoff payload before creating a ServiceNow record, webhook event, email package, or JSON API export."
      icon="ios_share"
      onClose={onClose}
    >
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-3">
          {[
            'ServiceNow Security Incident',
            'Generic Webhook',
            'Email Package',
            'JSON API Export',
          ].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSystem(option)}
              className={`flex min-h-12 w-full items-center justify-between rounded-lg border px-4 text-left text-sm font-bold transition-colors ${
                system === option
                  ? 'border-[#2563EB] bg-[#132548] text-white'
                  : 'border-[#334155] bg-[#111827] text-[#CBD5E0] hover:bg-[#1F2937]'
              }`}
            >
              {option}
              {system === option && <Icon name="check_circle" size={17} className="text-[#60A5FA]" />}
            </button>
          ))}
          <label className="flex items-start gap-3 rounded-lg border border-[#334155] bg-[#111827] p-4">
            <input
              type="checkbox"
              checked={includeEvidence}
              onChange={(event) => setIncludeEvidence(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="block text-sm font-bold text-white">
                Include evidence manifest and links
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-[#94A3B8]">
                Linked VMS archive URLs and custody metadata are included. Binary file transfer is connector-dependent.
              </span>
            </span>
          </label>
        </div>
        <div className="rounded-xl border border-[#334155] bg-[#111827] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
            Payload preview
          </p>
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-[#273142] bg-[#0F1117] p-3 text-xs leading-relaxed text-[#CBD5E0]">
            {JSON.stringify(payload, null, 2)}
          </pre>
          <div className="mt-4 rounded-lg border border-[#273142] bg-[#0F1117] p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
              Field mapping
            </p>
            <div className="mt-2 space-y-1 text-xs leading-relaxed text-[#CBD5E0]">
              <p>Agora title → short_description</p>
              <p>Severity → priority / impact mapping</p>
              <p>Lifecycle stage → external status</p>
              <p>Evidence manifest → attachment or related link</p>
              <p>Audit note → work_notes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSend(system, includeEvidence)}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-bold text-white transition-colors hover:bg-[#1D4ED8]"
          >
            <Icon name="send" size={18} />
            Send Demo Payload
          </button>
        </div>
      </div>
    </ModalShell>
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

function EvidenceTab({
  evidenceItems,
  onEvidenceAdd,
}: {
  evidenceItems: Evidence[]
  onEvidenceAdd: (evidence: Evidence) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [intakeMode, setIntakeMode] = useState<'upload' | 'link' | 'manual'>('upload')
  const [form, setForm] = useState({
    type: 'clip' as Evidence['type'],
    label: '',
    sourceSystem: 'Avigilon VMS',
    timestamp: '',
    retention: 'Legal hold + 1 year',
    externalUrl: '',
    fileName: '',
    fileSize: 0,
    mimeType: '',
    description: '',
  })

  function handleFileSelect(file: File | undefined) {
    if (!file) return

    const inferredType: Evidence['type'] = file.type.startsWith('image/')
      ? 'still'
      : file.type.startsWith('video/')
        ? 'clip'
        : 'document'

    setForm((prev) => ({
      ...prev,
      type: inferredType,
      label: prev.label.trim() || file.name.replace(/\.[^.]+$/, ''),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      sourceSystem: prev.sourceSystem || 'Manual Upload',
    }))
  }

  function addEvidence() {
    if (!form.label.trim()) return
    const now = new Date().toISOString()
    const evidence: Evidence = {
      id: `ev-manual-${Date.now()}`,
      type: form.type,
      label: form.label.trim(),
      sourceSystem: form.sourceSystem.trim() || 'Manual Intake',
      timestamp: form.timestamp ? new Date(form.timestamp).toISOString() : now,
      confidence: intakeMode === 'manual' ? 0.7 : 0.9,
      retention: form.retention,
      origin:
        intakeMode === 'upload'
          ? 'manual_upload'
          : intakeMode === 'link'
            ? 'external_link'
            : 'manual_record',
      fileName:
        intakeMode === 'upload'
          ? form.fileName.trim() || `${form.label.trim().toLowerCase().replace(/\s+/g, '-')}.mp4`
          : undefined,
      mimeType:
        intakeMode === 'upload'
          ? form.mimeType ||
            (form.type === 'still'
              ? 'image/jpeg'
              : form.type === 'document'
                ? 'application/pdf'
                : 'video/mp4')
          : undefined,
      sizeBytes: intakeMode === 'upload' ? form.fileSize || 7340032 : undefined,
      hash: intakeMode === 'upload' ? `sha256:${Date.now().toString(16)}...demo` : undefined,
      externalUrl: intakeMode === 'link' ? form.externalUrl.trim() : undefined,
      uploadedBy: CURRENT_CASE_OPERATOR,
      addedAt: now,
      custodyEvents: [
        {
          id: `cust-${Date.now()}`,
          action:
            intakeMode === 'upload'
              ? 'uploaded'
              : intakeMode === 'link'
                ? 'linked'
                : 'created',
          actor: CURRENT_CASE_OPERATOR,
          timestamp: now,
          note: form.description.trim() || 'Evidence added from case workspace intake form.',
        },
      ],
    }
    onEvidenceAdd(evidence)
    setForm({
      type: 'clip',
      label: '',
      sourceSystem: 'Avigilon VMS',
      timestamp: '',
      retention: 'Legal hold + 1 year',
      externalUrl: '',
      fileName: '',
      fileSize: 0,
      mimeType: '',
      description: '',
    })
    setShowForm(false)
  }

  const inputCls =
    'mt-1 w-full rounded-lg border border-[#334155] bg-[#0F1117] px-3 py-2 text-sm text-white outline-none placeholder:text-[#94A3B8] focus:border-[#A78BFA]'

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#CBD5E0]">
          Linked Evidence · {evidenceItems.length} items · chain of custody preserved
        </p>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#7C3AED] px-3 text-xs font-bold text-white transition-colors hover:bg-[#6D28D9]"
        >
          <Icon name={showForm ? 'close' : 'add'} size={16} />
          {showForm ? 'Cancel' : 'Add Evidence'}
        </button>
      </div>

      {showForm && (
        <div className="mb-5 rounded-xl border border-[#334155] bg-[#111827] p-4">
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-[#0F1117] p-1">
            {[
              ['upload', 'Upload'],
              ['link', 'VMS Link'],
              ['manual', 'Manual'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setIntakeMode(key as 'upload' | 'link' | 'manual')}
                className={`min-h-9 rounded-md text-xs font-bold transition-colors ${
                  intakeMode === key
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#CBD5E0] hover:bg-[#1F2937]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-xs font-bold text-[#CBD5E0]">
              Evidence type
              <select
                value={form.type}
                onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as Evidence['type'] }))}
                className={inputCls}
              >
                <option value="clip">Video clip</option>
                <option value="still">Image / still</option>
                <option value="document">Document</option>
                <option value="access_event">Access event</option>
                <option value="manual">Manual record</option>
              </select>
            </label>
            <label className="text-xs font-bold text-[#CBD5E0]">
              Source system
              <input
                value={form.sourceSystem}
                onChange={(event) => setForm((prev) => ({ ...prev, sourceSystem: event.target.value }))}
                className={inputCls}
                placeholder="VMS, ACS, HR, Legal, Manual"
              />
            </label>
            <label className="text-xs font-bold text-[#CBD5E0]">
              Label
              <input
                value={form.label}
                onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                className={inputCls}
                placeholder="e.g. Lobby camera export 14:21-14:45"
              />
            </label>
            <label className="text-xs font-bold text-[#CBD5E0]">
              Evidence timestamp
              <input
                type="datetime-local"
                value={form.timestamp}
                onChange={(event) => setForm((prev) => ({ ...prev, timestamp: event.target.value }))}
                className={inputCls}
              />
            </label>
            {intakeMode === 'upload' && (
              <div className="md:col-span-2">
                <p className="text-xs font-bold text-[#CBD5E0]">Upload file</p>
                <label className="mt-1 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#475569] bg-[#0F1117] px-4 py-5 text-center transition-colors hover:border-[#A78BFA] hover:bg-[#151B26]">
                  <input
                    type="file"
                    className="sr-only"
                    accept="video/*,image/*,.pdf,.doc,.docx,.csv,.json,.xml,.txt"
                    onChange={(event) => handleFileSelect(event.target.files?.[0])}
                  />
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#334155] bg-[#111827] text-[#A78BFA]">
                    <Icon name="upload_file" size={22} />
                  </span>
                  <span className="mt-3 text-sm font-bold text-white">
                    Choose evidence file
                  </span>
                  <span className="mt-1 max-w-xl text-xs leading-relaxed text-[#94A3B8]">
                    Upload a VMS clip, image, PDF, log export, statement, or other case artifact.
                    The prototype records metadata and custody; backend storage comes later.
                  </span>
                </label>
                {form.fileName && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-[#334155] bg-[#0F1117] px-3 py-2 text-xs text-[#CBD5E0]">
                    <Icon name="description" size={15} className="text-[#A78BFA]" />
                    <span className="font-bold text-white">{form.fileName}</span>
                    <span>{form.mimeType || 'unknown type'}</span>
                    <span>
                      {form.fileSize > 0
                        ? `${(form.fileSize / 1_048_576).toFixed(2)} MB`
                        : 'size pending'}
                    </span>
                  </div>
                )}
              </div>
            )}
            {intakeMode === 'link' && (
              <label className="text-xs font-bold text-[#CBD5E0]">
                Archive / external URL
                <input
                  value={form.externalUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, externalUrl: event.target.value }))}
                  className={inputCls}
                  placeholder="https://vms.example/archive/clip/..."
                />
              </label>
            )}
            <label className="text-xs font-bold text-[#CBD5E0]">
              Retention / legal hold
              <input
                value={form.retention}
                onChange={(event) => setForm((prev) => ({ ...prev, retention: event.target.value }))}
                className={inputCls}
              />
            </label>
          </div>
          <label className="mt-3 block text-xs font-bold text-[#CBD5E0]">
            Custody note
            <textarea
              rows={2}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className={`${inputCls} resize-none`}
              placeholder="How this evidence was obtained, by whom, and any handling constraints."
            />
          </label>
          <button
            type="button"
            onClick={addEvidence}
            disabled={!form.label.trim()}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 text-sm font-bold text-white transition-colors hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:bg-[#374151] disabled:text-[#94A3B8]"
          >
            <Icon name="add_link" size={17} />
            Add Evidence With Custody Event
          </button>
        </div>
      )}

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
            {evidenceItems.map((ev) => (
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
                <td className="px-3 py-3 text-[#9CA3AF]">
                  <div>{ev.sourceSystem}</div>
                  <div className="mt-1 text-xs text-[#94A3B8]">
                    {ev.origin === 'external_link'
                      ? 'Linked archive'
                      : ev.origin === 'manual_upload'
                        ? 'Manual upload'
                        : ev.origin === 'manual_record'
                          ? 'Manual record'
                          : 'System retained'}
                  </div>
                </td>
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
                  <div className="flex justify-end gap-2">
                    <button className="rounded-md border border-[#374151] px-2.5 py-1 text-xs font-semibold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white">
                      View
                    </button>
                    <button
                      className="rounded-md border border-[#374151] px-2.5 py-1 text-xs font-semibold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white"
                      title={(ev.custodyEvents ?? []).map((c) => `${fmtDateTime(c.timestamp)} · ${c.actor}: ${c.note}`).join('\n')}
                    >
                      Custody {(ev.custodyEvents ?? []).length}
                    </button>
                  </div>
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
