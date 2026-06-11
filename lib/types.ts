// ============================================================
// Agora V3 — Canonical Types
// ============================================================

export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type AlertType = 'reactive' | 'deterrent'
export type AlertStatus = 'enriching' | 'ready' | 'accepted' | 'rejected' | 'dismissed'
export type IncidentStatus = 'new' | 'investigating' | 'waiting' | 'resolved' | 'closed'
export type CaseStatus = 'new' | 'investigating' | 'waiting' | 'resolved' | 'closed' | 'reopened'
export type CaseSource = 'incident_promotion' | 'manual' | 'external_import'
export type CaseLifecycleStage =
  | 'draft'
  | 'open'
  | 'triage'
  | 'under_investigation'
  | 'pending_external_input'
  | 'pending_approval'
  | 'closed_substantiated'
  | 'closed_unsubstantiated'
  | 'closed_inconclusive'
  | 'reopened'
  | 'archived'
export type ViolationStatus = 'open' | 'accepted' | 'rejected' | 'closed'
export type EntityType = 'person' | 'credential' | 'vehicle' | 'door' | 'camera' | 'zone' | 'sensor'
export type SignalCategory = 'security' | 'environmental' | 'operational' | 'identity' | 'vehicle' | 'building_systems' | 'external_context'
export type CasePermission =
  | 'case.view'
  | 'case.edit'
  | 'case.close'
  | 'case.reopen'
  | 'case.manage_access'
  | 'evidence.view'
  | 'evidence.add'
  | 'evidence.edit_metadata'
  | 'evidence.remove'
  | 'people.add'
  | 'people.edit'
  | 'tasks.assign'
  | 'report.edit'
  | 'report.approve'
  | 'export.create'
  | 'integration.send'

// --- Signal ---
export interface Signal {
  id: string
  timestamp: string
  sourceSystem: string
  eventType: string
  siteId: string
  zoneId: string
  entityRefs: EntityRef[]
  confidence: number
  policyRefs: string[]
  sopRefs: string[]
  normalizedSummary: string
  category: SignalCategory
}

// --- Entity ---
export interface EntityRef {
  id: string
  type: EntityType
  label: string
}

export interface Entity extends EntityRef {
  siteId: string
  zoneId?: string
  parentId?: string
  riskLevel: 'low' | 'medium' | 'high'
  metadata: Record<string, string>
}

// --- NBA ---
export type ResponsePhase = 'contain' | 'communicate' | 'document'

export interface NextBestAction {
  recommendationId: string
  recommendedAction: string
  rationale: string
  confidence: number
  urgency: 'immediate' | 'high' | 'medium' | 'low'
  responsePhase?: ResponsePhase
  alternatives: string[]
  requiresApproval: boolean
  autoExecuteActions: string[]
  gatedActions: string[]
}

// --- SOP ---
export interface SOPStep {
  step: number
  instruction: string
}

export interface SOP {
  id: string
  title: string
  incidentType: string
  version: string
  effectiveDate: string
  steps: SOPStep[]
}

// --- Alert ---
export interface Alert {
  id: string
  type: AlertType
  severity: Severity
  status: AlertStatus
  title: string
  location: string
  siteId: string
  siteName: string
  timestamp: string
  ageSeconds: number
  sources: string[]
  nba?: NextBestAction
  sop?: SOP
  explanation?: string
  entityRefs: EntityRef[]
  campaignId?: string
}

// --- Incident ---
export interface Incident {
  id: string
  alertId: string
  title: string
  severity: Severity
  status: IncidentStatus
  siteId: string
  siteName: string
  location: string
  timestamp: string
  owner?: string
  entityRefs: EntityRef[]
  campaignId?: string
}

// --- Evidence ---
export interface Evidence {
  id: string
  type: 'clip' | 'still' | 'access_event' | 'document' | 'manual'
  label: string
  sourceSystem: string
  timestamp: string
  confidence: number
  retention: string
  url?: string
  origin?: 'system' | 'manual_upload' | 'external_link' | 'manual_record'
  fileName?: string
  mimeType?: string
  sizeBytes?: number
  hash?: string
  externalUrl?: string
  uploadedBy?: string
  addedAt?: string
  custodyEvents?: EvidenceCustodyEvent[]
}

export interface EvidenceCustodyEvent {
  id: string
  action: 'created' | 'uploaded' | 'linked' | 'viewed' | 'exported' | 'transferred' | 'retained'
  actor: string
  timestamp: string
  note: string
}

// --- Timeline Event ---
export interface TimelineEvent {
  id: string
  timestamp: string
  type: 'access' | 'camera' | 'agent' | 'manual' | 'external_context' | 'annotation'
  title: string
  detail: string
  entityRefs: EntityRef[]
  evidenceRefs: string[]
  isAIGenerated: boolean
  isManual?: boolean
  flagged?: boolean
  cameraPreview?: CameraPreview
}

// --- Case ---
export interface Case {
  id: string
  incidentId?: string
  source?: CaseSource
  lifecycleStage?: CaseLifecycleStage
  title: string
  severity: Severity
  status: CaseStatus
  owner: string
  siteId: string
  siteName: string
  location?: string
  createdAt: string
  updatedAt: string
  sla: { dueAt: string; breached: boolean }
  entityRefs: EntityRef[]
  evidenceRefs: string[]
  timeline: TimelineEvent[]
  campaignId?: string
  openQuestions: string[]
  tags: string[]
  person?: PersonDetails
  lifecycleEvents?: CaseLifecycleEvent[]
  accessMembers?: CaseAccessMember[]
}

export interface CaseLifecycleEvent {
  id: string
  fromStage: CaseLifecycleStage
  toStage: CaseLifecycleStage
  changedBy: string
  changedAt: string
  reason?: string
  approvalId?: string
}

export interface CaseAccessMember {
  id: string
  subjectType: 'user' | 'group'
  subjectName: string
  role: string
  permissions: CasePermission[]
  accessScope?: 'full_case' | 'evidence_only' | 'people_only' | 'tasks_only' | 'report_only'
  expiresAt?: string
  addedBy: string
  addedAt: string
}

// --- Violation ---
export interface Violation {
  id: string
  caseId?: string
  ruleId: string
  ruleTitle: string
  description: string
  severity: Severity
  status: ViolationStatus
  personName?: string
  zone: string
  siteId: string
  timestamp: string
  evidenceRefs: string[]
}

// --- Campaign ---
export interface Campaign {
  id: string
  title: string
  hypothesis: string
  incidentIds: string[]
  entityRefs: EntityRef[]
  detectedAt: string
  status: 'active' | 'investigating' | 'closed'
}

// --- External Context Signal ---
export interface ExternalContextSignal {
  id: string
  subtype: 'civil_unrest' | 'weather' | 'law_enforcement' | 'person_of_interest' | 'news' | 'traffic'
  title: string
  description: string
  severity: Severity
  affectedSiteIds: string[]
  timeHorizon: 'immediate' | 'hours' | 'days'
  source: string
  timestamp: string
  radiusKm?: number
}

// --- Site (World Model) ---
export interface Site {
  id: string
  name: string
  city: string
  state: string
  lat: number
  lng: number
  openIncidents: number
  activeAlerts: number
  offlineDevices: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  externalSignals: number
}

// --- Feedback ---
export interface FeedbackRecord {
  feedbackId: string
  incidentId: string
  agentId: string
  agentRecommendation: string
  humanDecision: string
  overrideAction: string
  overrideReason: string
  label?: 'model_problem' | 'policy_gap' | 'data_quality' | 'correct_override' | 'unclear'
}

// --- Playbook ---
export interface PlaybookRule {
  id: string
  name: string
  type: 'response' | 'deterrence'
  incidentType: string
  description: string
  triggers: string[]
  autoActions: string[]
  gatedActions: string[]
  enabled: boolean
  version: string
  approvedAt?: string
}

// --- Chat Message (AI assistant) ---
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  citedEvidenceIds?: string[]
}

// --- Incident Detail (correlated evidence view) ---
export type SceneType = 'parking' | 'lobby' | 'hallway' | 'elevator' | 'exterior' | 'restricted'

export interface CameraPreview {
  channel: string
  sceneType: SceneType
}

export interface CorrelatedEvent {
  id: string
  ts: string
  type: 'access' | 'camera' | 'agent'
  location: string
  detail: string
  granted?: boolean
  tailgate?: boolean
  agentFlag?: boolean
  cameraPreview?: CameraPreview
}

export interface PersonDetails {
  type: 'known' | 'unknown'
  // known
  name?: string
  role?: string
  company?: string
  badgeId?: string
  accessLevel?: string
  department?: string
  email?: string
  // unknown
  label?: string
  watchlistCategory?: string | null
  confidence?: number | null
  firstSeen?: string
  cameraSightings?: string[]
  vehiclePlate?: string | null
  // shared
  avatarInitials?: string
  avatarColor: string
}

export interface AlertDetail {
  alertId: string
  person: PersonDetails
  correlatedEvents: CorrelatedEvent[]
  agentSummary: string
}
