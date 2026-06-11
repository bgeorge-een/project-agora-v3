'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Case, Entity, EntityType } from '@/lib/types'

const ENTITY_ICON: Record<EntityType, string> = {
  person: 'badge',
  credential: 'key',
  vehicle: 'directions_car',
  door: 'door_front',
  camera: 'videocam',
  zone: 'location_on',
  sensor: 'sensors',
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

const GENERATED_RECOMMENDATIONS = [
  {
    action:
      'Suspend implicated credential access pending verification of contractor work order and authorization scope.',
    owner: 'Access Control Admin',
    status: 'In progress',
    dueOffsetDays: 0,
  },
  {
    action:
      'Complete HR review of the contractor engagement, approved work zones, and escort requirements.',
    owner: 'HR Business Partner',
    status: 'Pending',
    dueOffsetDays: 1,
  },
  {
    action:
      'Cross-reference credential activity against related campaign activity and multi-site anomaly indicators.',
    owner: 'SOC Analyst',
    status: 'Pending',
    dueOffsetDays: 1,
  },
  {
    action:
      'Preserve video, access-control logs, and case notes under the investigation retention hold.',
    owner: 'Evidence Custodian',
    status: 'Complete',
    dueOffsetDays: 0,
  },
  {
    action:
      'Tune alerting for repeat denied-entry attempts at restricted rooms within a five-minute window.',
    owner: 'Security Engineering',
    status: 'Planned',
    dueOffsetDays: 7,
  },
]

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function fmtDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Not recorded'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

function fmtDateTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Not recorded'

  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function addDays(iso: string, days: number) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Not recorded'

  date.setDate(date.getDate() + days)
  return fmtDate(date.toISOString())
}

function titleCase(value: string) {
  return value
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function buildReportNumber(caseData: Case) {
  return `PSIR-${caseData.id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()}`
}

function buildIncidentClass(caseData: Case) {
  const tags = caseData.tags.map((tag) => tag.toLowerCase())
  if (
    tags.some((tag) => tag.includes('access')) ||
    caseData.title.toLowerCase().includes('access')
  ) {
    return 'Unauthorized access / access probing'
  }

  if (
    tags.some((tag) => tag.includes('tailgate')) ||
    caseData.title.toLowerCase().includes('tailgate')
  ) {
    return 'Tailgating / entry control violation'
  }

  if (
    tags.some((tag) => tag.includes('camera')) ||
    caseData.title.toLowerCase().includes('camera')
  ) {
    return 'Video-verified physical security anomaly'
  }

  return 'Physical security investigation'
}

function severityTone(severity: Case['severity']) {
  switch (severity) {
    case 'critical':
      return 'border-[#7F1D1D] bg-[#2A1218] text-[#FCA5A5]'
    case 'high':
      return 'border-[#7C2D12] bg-[#2A1711] text-[#FDBA74]'
    case 'medium':
      return 'border-[#713F12] bg-[#241A0A] text-[#FCD34D]'
    case 'low':
      return 'border-[#14532D] bg-[#0E2218] text-[#86EFAC]'
    default:
      return 'border-[#374151] bg-[#1F2937] text-[#CBD5E0]'
  }
}

function statusTone(status: Case['status'] | string) {
  switch (status) {
    case 'closed':
    case 'resolved':
    case 'Complete':
      return 'border-[#14532D] bg-[#0E2218] text-[#86EFAC]'
    case 'investigating':
    case 'In progress':
      return 'border-[#1D4ED8] bg-[#111C35] text-[#93C5FD]'
    case 'waiting':
    case 'Pending':
      return 'border-[#713F12] bg-[#241A0A] text-[#FCD34D]'
    case 'Planned':
      return 'border-[#4C1D95] bg-[#1F1638] text-[#C4B5FD]'
    default:
      return 'border-[#374151] bg-[#1F2937] text-[#CBD5E0]'
  }
}

function AIBadge({ label = 'AI-generated' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-[#134E4A] bg-[#0E2A2A] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2DD4BF]">
      <Icon name="auto_awesome" size={12} />
      {label}
    </span>
  )
}

function Pill({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${className ?? ''}`}
    >
      {children}
    </span>
  )
}

function Section({
  title,
  icon,
  badge,
  children,
}: {
  title: string
  icon: string
  badge?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-lg bg-[#0F1117] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#243048] text-[#A78BFA]">
          <Icon name={icon} size={17} />
        </span>
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#A78BFA]">
          {title}
        </h3>
        {badge}
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  value,
  wide,
}: {
  label: string
  value: ReactNode
  wide?: boolean
}) {
  return (
    <div
      className={`rounded-lg border border-[#2D3748] bg-[#1A1F2E] px-3 py-2 ${wide ? 'sm:col-span-2 lg:col-span-3' : ''}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
        {label}
      </p>
      <div className="mt-1 text-sm font-semibold leading-snug text-[#E5E7EB]">
        {value}
      </div>
    </div>
  )
}

export default function NarrativeReport({
  caseData,
  entities,
  onClose,
}: {
  caseData: Case
  entities: Entity[]
  onClose: () => void
}) {
  const [generating, setGenerating] = useState(true)

  const report = useMemo(() => {
    const people = entities.filter((entity) => entity.type === 'person')
    const primaryPerson =
      people[0]?.label ??
      caseData.person?.name ??
      caseData.person?.label ??
      'Unidentified subject'
    const credential = entities.find((entity) => entity.type === 'credential')
    const cameras = entities.filter((entity) => entity.type === 'camera')
    const doors = entities.filter((entity) => entity.type === 'door')
    const zones = entities.filter((entity) => entity.type === 'zone')
    const incidentClass = buildIncidentClass(caseData)
    const timeline =
      caseData.timeline.length > 0
        ? caseData.timeline
        : [
            {
              id: 'generated-case-opened',
              timestamp: caseData.createdAt,
              type: 'agent' as const,
              title: 'Case opened for physical security review',
              detail: `${caseData.title} was assigned to ${caseData.owner} for investigation and documentation.`,
              entityRefs: caseData.entityRefs,
              evidenceRefs: caseData.evidenceRefs,
              isAIGenerated: true,
            },
          ]
    const evidenceRefs = Array.from(
      new Set([
        ...caseData.evidenceRefs,
        ...timeline.flatMap((event) => event.evidenceRefs),
      ])
    )
    const evidenceIds =
      evidenceRefs.length > 0
        ? evidenceRefs
        : [
            'ACS-DENIAL-001',
            'CAM-CORRIDOR-004',
            'CASE-NOTES-001',
            'WORKORDER-SEARCH-001',
          ]
    const significantEvent =
      timeline.find((event) => event.flagged) ?? timeline[0]
    const executiveSummary = [
      `This report documents ${caseData.title} at ${caseData.siteName}.`,
      `The case is classified as ${incidentClass.toLowerCase()} with ${caseData.severity} severity and is currently ${titleCase(caseData.status).toLowerCase()}.`,
      `${primaryPerson} is the primary subject identified from linked entities.`,
      credential ? `The implicated credential is ${credential.label}.` : '',
      `The key timeline marker is "${significantEvent.title}" at ${fmtDateTime(significantEvent.timestamp)}, supported by ${evidenceIds.length} evidence reference${evidenceIds.length === 1 ? '' : 's'}.`,
      'The investigation focus is authorization scope, access-control policy compliance, evidence preservation, and corrective actions required before final approval.',
    ]
      .filter(Boolean)
      .join(' ')
    const notificationTargets = [
      'SOC Shift Lead',
      'Physical Security Manager',
      caseData.severity === 'critical' || caseData.severity === 'high'
        ? 'Legal / Compliance'
        : 'Site Facilities Lead',
      credential ? 'Access Control Admin' : 'Case Owner',
    ]

    return {
      reportNumber: buildReportNumber(caseData),
      incidentClass,
      executiveSummary,
      primaryPerson,
      credential,
      cameras,
      doors,
      zones,
      timeline,
      evidenceIds,
      notificationTargets,
    }
  }, [caseData, entities])

  useEffect(() => {
    const t = setTimeout(() => setGenerating(false), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#2D3748] bg-[#1A1F2E] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2D3748] bg-[#111827] px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#243048] text-[#7C3AED]">
              <Icon name="description" size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-white">
                Physical Security Investigation Report
              </h2>
              <p className="truncate text-xs text-[#A78BFA]">
                {report.reportNumber} · {caseData.id} · {caseData.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close report"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#243048] hover:text-white"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {generating ? (
            <div className="flex h-72 flex-col items-center justify-center text-center">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#7C3AED] [animation-delay:-0.2s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#7C3AED] [animation-delay:-0.1s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-[#7C3AED]" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">
                Generating report…
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Synthesizing timeline, evidence, and entity relationships.
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              <div className="rounded-lg border border-[#2D3748] bg-[#111827] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                      Case Investigation Template
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-white">
                      {caseData.title}
                    </h3>
                    <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#CBD5E0]">
                      Formal physical-security case record prepared for
                      incident review, evidence preservation, corrective action
                      tracking, and final approval.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill className={severityTone(caseData.severity)}>
                      {caseData.severity} severity
                    </Pill>
                    <Pill className={statusTone(caseData.status)}>
                      {titleCase(caseData.status)}
                    </Pill>
                    <AIBadge label="Drafted by AI" />
                  </div>
                </div>
              </div>

              <Section title="Basic Information" icon="assignment">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Report Number" value={report.reportNumber} />
                  <Field label="Case ID" value={caseData.id} />
                  <Field
                    label="Related Incident"
                    value={caseData.incidentId ?? 'Not linked'}
                  />
                  <Field label="Site" value={caseData.siteName} />
                  <Field label="Case Owner" value={caseData.owner} />
                  <Field label="Report Version" value="Draft v1.0" />
                  <Field
                    label="Date Opened"
                    value={fmtDateTime(caseData.createdAt)}
                  />
                  <Field
                    label="Last Updated"
                    value={fmtDateTime(caseData.updatedAt)}
                  />
                  <Field
                    label="SLA Due"
                    value={
                      <span className="inline-flex items-center gap-1.5">
                        {fmtDateTime(caseData.sla.dueAt)}
                        {caseData.sla.breached && (
                          <Icon
                            name="warning"
                            size={14}
                            className="text-[#EF4444]"
                          />
                        )}
                      </span>
                    }
                  />
                </div>
              </Section>

              <Section
                title="Incident Classification & Notification"
                icon="notification_important"
                badge={<AIBadge />}
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Field
                    label="Incident Classification"
                    value={report.incidentClass}
                  />
                  <Field
                    label="Priority"
                    value={
                      <Pill className={severityTone(caseData.severity)}>
                        {caseData.severity}
                      </Pill>
                    }
                  />
                  <Field
                    label="Notification Status"
                    value="Internal notifications prepared"
                  />
                  <Field
                    label="Required Policy Review"
                    value="Access Control SOP PS-AC-04"
                  />
                  <Field
                    label="Retention Handling"
                    value="Investigation hold: 90 days minimum"
                  />
                  <Field
                    label="Campaign Link"
                    value={caseData.campaignId ?? 'No campaign assigned'}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.notificationTargets.map((target) => (
                    <span
                      key={target}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#2D3748] bg-[#1A1F2E] px-2.5 py-1.5 text-xs font-semibold text-[#CBD5E0]"
                    >
                      <Icon name="mark_email_read" size={14} />
                      {target}
                    </span>
                  ))}
                </div>
              </Section>

              <Section title="Persons Involved & Witnesses" icon="groups">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div className="rounded-lg border border-[#2D3748] bg-[#1A1F2E] p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                        Subjects / Involved Parties
                      </p>
                      <AIBadge label="Entity linked" />
                    </div>
                    <div className="space-y-2">
                      {(entities.length > 0
                        ? entities
                        : [
                            {
                              id: 'generated-subject',
                              type: 'person' as EntityType,
                              label: report.primaryPerson,
                              riskLevel: 'medium' as const,
                              metadata: {},
                              siteId: caseData.siteId,
                            },
                          ]
                      ).map((entity) => (
                        <div
                          key={entity.id}
                          className="flex items-center gap-2 rounded-lg bg-[#0F1117] px-3 py-2"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#243048] text-xs font-bold text-[#CBD5E0]">
                            {entity.type === 'person' ? (
                              initials(entity.label)
                            ) : (
                              <Icon
                                name={ENTITY_ICON[entity.type]}
                                size={18}
                                className="text-[#9CA3AF]"
                              />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-[#E5E7EB]">
                              {entity.label}
                            </p>
                            <p className="text-[11px] uppercase tracking-wide text-[#94A3B8]">
                              {titleCase(entity.type)} · {entity.riskLevel} risk
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#2D3748] bg-[#1A1F2E] p-3">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                      Witnesses / Contacts
                    </p>
                    <div className="space-y-2">
                      {[
                        {
                          name: caseData.owner,
                          role: 'Assigned investigator',
                          contact: 'Case management queue',
                          statement: 'Reviewed timeline, evidence, and policy fit.',
                        },
                        {
                          name: 'SOC Shift Lead',
                          role: 'Initial notification contact',
                          contact: 'Security Operations Center',
                          statement:
                            'Validated alert triage and confirmed no active threat remained on site.',
                        },
                        {
                          name: 'Site Facilities Supervisor',
                          role: 'Area access contact',
                          contact: caseData.siteName,
                          statement:
                            'Requested to confirm approved work orders and escort coverage.',
                        },
                      ].map((witness) => (
                        <div
                          key={`${witness.role}-${witness.name}`}
                          className="rounded-lg bg-[#0F1117] px-3 py-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-[#E5E7EB]">
                              {witness.name}
                            </p>
                            <span className="text-[11px] uppercase tracking-wide text-[#94A3B8]">
                              {witness.role}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
                            {witness.statement}
                          </p>
                          <p className="mt-1 text-[11px] text-[#64748B]">
                            Contact: {witness.contact}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              <Section
                title="Incident Description & Timeline"
                icon="timeline"
                badge={<AIBadge />}
              >
                <div className="mb-4 rounded-lg border border-[#2D3748] bg-[#1A1F2E] px-3 py-3">
                  <p className="text-sm leading-relaxed text-[#CBD5E0]">
                    {report.executiveSummary}
                  </p>
                </div>
                <ol className="space-y-2">
                  {report.timeline.map((ev) => (
                    <li
                      key={ev.id}
                      className="grid grid-cols-[74px_1fr] gap-3 rounded-lg border border-[#2D3748] bg-[#1A1F2E] px-3 py-2 sm:grid-cols-[90px_1fr_auto]"
                    >
                      <span className="font-mono text-xs font-semibold text-[#94A3B8]">
                        {fmtTime(ev.timestamp)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-white">
                          {ev.flagged && (
                            <Icon
                              name="warning"
                              size={14}
                              className="text-[#EF4444]"
                            />
                          )}
                          {ev.title}
                          {ev.isAIGenerated && <AIBadge label="AI event" />}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
                          {ev.detail}
                        </p>
                      </div>
                      <span className="hidden text-[11px] uppercase tracking-wide text-[#64748B] sm:block">
                        {titleCase(ev.type)}
                      </span>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section title="Evidence & Supporting Documentation" icon="folder">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wide text-[#94A3B8]">
                        <th className="px-3">Evidence ID</th>
                        <th className="px-3">Type / Source</th>
                        <th className="px-3">Timestamp</th>
                        <th className="px-3">Chain of Custody</th>
                        <th className="px-3">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.evidenceIds.map((evidenceId, index) => {
                        const matchingEvent =
                          report.timeline.find((event) =>
                            event.evidenceRefs.includes(evidenceId)
                          ) ?? report.timeline[index % report.timeline.length]
                        const evidenceType =
                          index % 4 === 0
                            ? 'Access-control log'
                            : index % 4 === 1
                              ? 'Video clip / still'
                              : index % 4 === 2
                                ? 'Case note'
                                : 'Policy / work-order record'

                        return (
                          <tr key={evidenceId}>
                            <td className="rounded-l-lg border-y border-l border-[#2D3748] bg-[#1A1F2E] px-3 py-2 font-mono text-xs font-semibold text-[#E5E7EB]">
                              {evidenceId}
                            </td>
                            <td className="border-y border-[#2D3748] bg-[#1A1F2E] px-3 py-2 text-xs text-[#CBD5E0]">
                              <div className="font-semibold text-[#E5E7EB]">
                                {evidenceType}
                              </div>
                              <div className="text-[11px] text-[#94A3B8]">
                                {matchingEvent?.title ?? 'Case record'}
                              </div>
                            </td>
                            <td className="border-y border-[#2D3748] bg-[#1A1F2E] px-3 py-2 text-xs text-[#CBD5E0]">
                              {fmtDateTime(
                                matchingEvent?.timestamp ?? caseData.createdAt
                              )}
                            </td>
                            <td className="border-y border-[#2D3748] bg-[#1A1F2E] px-3 py-2 text-xs text-[#CBD5E0]">
                              Preserved in case file
                            </td>
                            <td className="rounded-r-lg border-y border-r border-[#2D3748] bg-[#1A1F2E] px-3 py-2">
                              <Pill className="border-[#134E4A] bg-[#0E2A2A] text-[#2DD4BF]">
                                {index === 0
                                  ? '98%'
                                  : index === 1
                                    ? '94%'
                                    : '89%'}
                              </Pill>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Field
                    label="Video Sources"
                    value={
                      report.cameras.length > 0
                        ? report.cameras.map((camera) => camera.label).join(', ')
                        : 'No camera entity linked'
                    }
                  />
                  <Field
                    label="Access Points"
                    value={
                      report.doors.length > 0
                        ? report.doors.map((door) => door.label).join(', ')
                        : 'No door entity linked'
                    }
                  />
                  <Field
                    label="Restricted Zones"
                    value={
                      report.zones.length > 0
                        ? report.zones.map((zone) => zone.label).join(', ')
                        : 'No zone entity linked'
                    }
                  />
                </div>
              </Section>

              <Section
                title="Investigation & Root Cause Analysis"
                icon="manage_search"
                badge={<AIBadge />}
              >
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <div className="rounded-lg border border-[#2D3748] bg-[#1A1F2E] p-3 lg:col-span-2">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                      Findings
                    </p>
                    <ul className="space-y-2">
                      {[
                        `${report.primaryPerson} is the primary subject of the report and was associated with restricted-area activity requiring review.`,
                        report.credential
                          ? `${report.credential.label} should remain in a suspended or monitored state until authorization is reconciled.`
                          : 'No credential entity was linked; investigator should confirm whether a physical badge, mobile credential, or escort exception was used.',
                        'Timeline and evidence correlation support a deliberate review of access authorization, escort coverage, and local work-order controls.',
                      ].map((finding) => (
                        <li
                          key={finding}
                          className="flex items-start gap-2 text-xs leading-relaxed text-[#CBD5E0]"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A78BFA]" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-[#2D3748] bg-[#1A1F2E] p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                      Root Cause
                    </p>
                    <p className="text-sm font-semibold leading-relaxed text-[#E5E7EB]">
                      Access governance gap
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF]">
                      The likely root cause is a mismatch between active
                      credential permissions, approved work scope, and
                      restricted-area entry controls.
                    </p>
                    <div className="mt-3">
                      <Pill className="border-[#134E4A] bg-[#0E2A2A] text-[#2DD4BF]">
                        High confidence
                      </Pill>
                    </div>
                  </div>
                </div>
                {caseData.openQuestions.length > 0 && (
                  <div className="mt-3 rounded-lg border border-[#2D3748] bg-[#1A1F2E] p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                      Open Investigation Questions
                    </p>
                    <ul className="space-y-1.5">
                      {caseData.openQuestions.map((q) => (
                        <li
                          key={q}
                          className="flex items-start gap-2 text-xs leading-relaxed text-[#CBD5E0]"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Section>

              <Section
                title="Corrective Actions & Preventative Measures"
                icon="task_alt"
                badge={<AIBadge label="Recommended" />}
              >
                <div className="space-y-2">
                  {GENERATED_RECOMMENDATIONS.map((recommendation, i) => (
                    <div
                      key={recommendation.action}
                      className="grid grid-cols-[28px_1fr] gap-3 rounded-lg border border-[#2D3748] bg-[#1A1F2E] p-3 lg:grid-cols-[28px_1fr_150px_120px_110px]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <p className="text-xs leading-relaxed text-[#CBD5E0]">
                        {recommendation.action}
                      </p>
                      <div className="text-xs lg:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8] lg:hidden">
                          Owner:{' '}
                        </span>
                        <span className="font-semibold text-[#E5E7EB]">
                          {recommendation.owner}
                        </span>
                      </div>
                      <div className="text-xs lg:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[#94A3B8] lg:hidden">
                          Due:{' '}
                        </span>
                        <span className="text-[#CBD5E0]">
                          {addDays(
                            caseData.updatedAt,
                            recommendation.dueOffsetDays
                          )}
                        </span>
                      </div>
                      <div className="lg:text-right">
                        <Pill className={statusTone(recommendation.status)}>
                          {recommendation.status}
                        </Pill>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Signatures & Approvals" icon="approval">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {[
                    {
                      role: 'Investigator',
                      name: caseData.owner,
                      status: 'Prepared',
                    },
                    {
                      role: 'Physical Security Manager',
                      name: 'Pending assignment',
                      status: 'Pending',
                    },
                    {
                      role: 'HR / Contractor Administrator',
                      name: 'Pending confirmation',
                      status: 'Pending',
                    },
                    {
                      role: 'Legal / Compliance Reviewer',
                      name:
                        caseData.severity === 'critical' ||
                        caseData.severity === 'high'
                          ? 'Required'
                          : 'As needed',
                      status:
                        caseData.severity === 'critical' ||
                        caseData.severity === 'high'
                          ? 'Pending'
                          : 'Optional',
                    },
                  ].map((approval) => (
                    <div
                      key={approval.role}
                      className="rounded-lg border border-[#2D3748] bg-[#1A1F2E] p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-[#94A3B8]">
                            {approval.role}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#E5E7EB]">
                            {approval.name}
                          </p>
                        </div>
                        <Pill className={statusTone(approval.status)}>
                          {approval.status}
                        </Pill>
                      </div>
                      <div className="mt-5 border-t border-dashed border-[#4B5563] pt-2 text-[11px] uppercase tracking-wide text-[#64748B]">
                        Signature / Date
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#94A3B8]">
                  Distribution is limited to authorized security, HR, legal, and
                  site leadership recipients until approvals are complete.
                </p>
              </Section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#2D3748] bg-[#111827] px-6 py-3">
          <p className="text-xs text-[#94A3B8]">
            AI-assisted draft · Review required before distribution
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#374151] bg-[#1F2937] px-4 py-2 text-sm font-medium text-[#CBD5E0] transition-colors hover:bg-[#243048] disabled:opacity-50"
            >
              <Icon name="edit_note" size={16} /> Edit
            </button>
            <button
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:opacity-50"
            >
              <Icon name="download" size={16} /> Export PDF
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#374151] px-4 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-[#243048] hover:text-white"
            >
              <Icon name="close" size={16} /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
