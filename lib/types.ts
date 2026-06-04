// ============================================================
// Agora V3 — Canonical Types
// ============================================================

export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type AlertType = 'reactive' | 'deterrent'
export type AlertStatus = 'enriching' | 'ready' | 'accepted' | 'rejected' | 'dismissed'
export type IncidentStatus = 'new' | 'investigating' | 'waiting' | 'resolved' | 'closed'
export type CaseStatus = 'new' | 'investigating' | 'waiting' | 'resolved' | 'closed' | 'reopened'
export type ViolationStatus = 'open' | 'accepted' | 'rejected' | 'closed'
export type EntityType = 'person' | 'credential' | 'vehicle' | 'door' | 'camera' | 'zone' | 'sensor'
export type SignalCategory = 'security' | 'environmental' | 'operational' | 'identity' | 'vehicle' | 'building_systems' | 'external_context'

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
export interface NextBestAction {
  recommendationId: string
  recommendedAction: string
  rationale: string
  confidence: number
  urgency: 'immediate' | 'high' | 'medium' | 'low'
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
}

// --- Case ---
export interface Case {
  id: string
  incidentId?: string
  title: string
  severity: Severity
  status: CaseStatus
  owner: string
  siteId: string
  siteName: string
  createdAt: string
  updatedAt: string
  sla: { dueAt: string; breached: boolean }
  entityRefs: EntityRef[]
  evidenceRefs: string[]
  timeline: TimelineEvent[]
  campaignId?: string
  openQuestions: string[]
  tags: string[]
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
