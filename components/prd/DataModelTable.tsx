import SectionHeader from '@/components/ui/SectionHeader'

interface Term {
  term: string
  definition: string
  createdBy: string
  ownedBy: string
  becomes: string
}

const TERMS: Term[] = [
  {
    term: 'Signal',
    definition:
      'Raw device telemetry. A single data point from one device or feed — a motion pixel change, door contact state, badge scan, or camera frame. No meaning on its own. Invisible to users; processed by the platform only.',
    createdBy: 'Any device / feed',
    ownedBy: 'Signal Normalizer',
    becomes: 'Event (via normalization)',
  },
  {
    term: 'Event',
    definition:
      'A normalized, meaningful state change the platform produced from one or more signals. Examples: "Door opened," "Person entered Zone B," "Temperature exceeded 90°F." Logged and queryable. Not necessarily actionable — the audit log shows Events.',
    createdBy: 'Signal Intelligence layer',
    ownedBy: 'Platform (audit log)',
    becomes: 'Alert (if policy match)',
  },
  {
    term: 'Alert',
    definition:
      'An event (or cluster of events) evaluated against a security policy and surfaced to an operator for triage. Sits in the operator queue. Requires a human decision: accept or dismiss. Also triggers Notifications to configured recipients.',
    createdBy: 'Signal Normalizer + agents',
    ownedBy: 'Operator',
    becomes: 'Incident (on accept) or Dismissed → FeedbackRecord',
  },
  {
    term: 'Notification',
    definition:
      'An outbound message (push, SMS, email) sent to a person when an Alert meets a delivery rule. The Notification is the delivery mechanism; the Alert is the system-side object. "I got an alert" typically means the person received a Notification about an Alert.',
    createdBy: 'Notification engine (on Alert)',
    ownedBy: 'Recipient',
    becomes: 'Acknowledged or ignored',
  },
  {
    term: 'Incident',
    definition:
      'A confirmed, active situation requiring real-time operational response. Covers the full live lifecycle: deterrence actions, containment, recovery, and handoff. An Incident is time-sensitive and action-oriented — it is open while the threat is active and closes when the threat is neutralized, handed off, or resolved. Incidents can be correlated into a Campaign when a pattern is detected across multiple active situations.',
    createdBy: 'Operator (on Alert accept)',
    ownedBy: 'Operator / Shift Supervisor',
    becomes: 'Resolved (threat neutralized) or Promoted → Case',
  },
  {
    term: 'Case',
    definition:
      'A post-incident forensic investigation. Created when one or more resolved Incidents — or a Campaign of correlated Incidents — require deep investigation beyond real-time response. A Case owns the full chain of custody: evidence with provenance, timeline reconstruction, entity graph traversal, AI-assisted narrative, tasks, external collaborator access, corrective actions, and audit trail. Cases answer what happened, why, who was involved, and what must change.',
    createdBy: 'Investigator (promotes from Incident)',
    ownedBy: 'Investigator / Case Supervisor',
    becomes: 'Closed → Report + audit pack + model feedback',
  },
  {
    term: 'Violation',
    definition:
      'A breach of a compliance rule with evidence and corrective action.',
    createdBy: 'Compliance rule engine',
    ownedBy: 'Compliance Manager',
    becomes: 'Corrective Action',
  },
  {
    term: 'Campaign',
    definition:
      'Linked pattern across multiple incidents sharing entities or behavioral signatures.',
    createdBy: 'Campaign detector',
    ownedBy: 'Manager / Investigator',
    becomes: 'Master Case',
  },
  {
    term: 'SOP',
    definition:
      'Human-readable Standard Operating Procedure. Versioned, incident-type tagged.',
    createdBy: 'Compliance Manager',
    ownedBy: 'Compliance Manager',
    becomes: 'Surfaced at triage time',
  },
  {
    term: 'Playbook',
    definition:
      'System automation rule. Response (post-incident) or Deterrence (pre-incident).',
    createdBy: 'Compliance Manager',
    ownedBy: 'Compliance Manager',
    becomes: 'Drives automated actions',
  },
  {
    term: 'Evidence',
    definition:
      'Media or data object (clip, still, access event, doc) with source, timestamp, confidence.',
    createdBy: 'Enrichment Agent / human',
    ownedBy: 'Case owner',
    becomes: 'Cited in timeline / audit pack',
  },
  {
    term: 'Entity',
    definition:
      'Real-world actor or object: person, credential, vehicle, door, camera, zone, sensor.',
    createdBy: 'Admin / entity resolver',
    ownedBy: 'Platform Admin',
    becomes: 'Linked into alerts / cases',
  },
  {
    term: 'FeedbackRecord',
    definition: 'Captured human override of an agent recommendation.',
    createdBy: 'Any user overriding agent',
    ownedBy: 'Platform (AI queue)',
    becomes: 'Model improvement',
  },
  {
    term: 'External Collaborator',
    definition:
      'Task-recipient access tier (HR, Legal, Facilities, IT). Scoped evidence only.',
    createdBy: 'Case owner',
    ownedBy: 'Case owner',
    becomes: 'Task completion → audit log',
  },
]

export default function DataModelTable() {
  return (
    <section className="bg-[#F9FAFB] px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Shared vocabulary"
          title="Canonical Data Model"
          subtitle="These definitions are used consistently across both apps and the platform."
        />

        <div
          className="mt-10 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <table className="min-w-[58rem] w-full border-collapse text-sm lg:min-w-0">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F3F4F6]">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Term
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Definition
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Created by
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Owned by
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Becomes
                </th>
              </tr>
            </thead>
            <tbody>
              {TERMS.map((t, i) => (
                <tr
                  key={t.term}
                  className={`border-b border-[#F3F4F6] ${
                    i % 2 === 1 ? 'bg-[#FAFBFC]' : 'bg-white'
                  }`}
                >
                  <td className="whitespace-nowrap px-5 py-4 align-top">
                    <span className="rounded-md bg-[#EFF6FF] px-2.5 py-1 font-mono text-xs font-bold text-[#2563EB]">
                      {t.term}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top text-[#374151]">
                    {t.definition}
                  </td>
                  <td className="px-5 py-4 align-top text-[#6B7280]">
                    {t.createdBy}
                  </td>
                  <td className="px-5 py-4 align-top text-[#6B7280]">
                    {t.ownedBy}
                  </td>
                  <td className="px-5 py-4 align-top font-medium text-[#111827]">
                    {t.becomes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Incident vs Case boundary callout */}
        <div
          className="mt-8 rounded-xl bg-white p-6"
          style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Key distinction</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg p-4" style={{ background: '#EFF6FF', borderLeft: '4px solid #2563EB' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded bg-[#2563EB] px-2 py-0.5 text-xs font-bold text-white">INCIDENT</span>
                <span className="text-xs font-semibold text-[#1D4ED8]">Real-time Incident Management app</span>
              </div>
              <p className="text-sm text-[#1E40AF] leading-relaxed">
                <strong>Stop the threat.</strong> The Incident is live and time-sensitive. Operators deter, contain, and recover — following AI-recommended actions and SOPs. An Incident closes when the threat is neutralized, not when the paperwork is done.
              </p>
              <p className="mt-2 text-xs text-[#3B82F6]">Owned by: Operator → Shift Supervisor</p>
            </div>
            <div className="rounded-lg p-4" style={{ background: '#F5F3FF', borderLeft: '4px solid #7C3AED' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded bg-[#7C3AED] px-2 py-0.5 text-xs font-bold text-white">CASE</span>
                <span className="text-xs font-semibold text-[#6D28D9]">Case Management app</span>
              </div>
              <p className="text-sm text-[#4C1D95] leading-relaxed">
                <strong>Understand what happened.</strong> Once the threat is resolved, a Case is opened to investigate root cause, assemble evidence with chain of custody, reconstruct the timeline, and drive corrective actions. A Case may contain one Incident or a correlated Campaign of multiple Incidents.
              </p>
              <p className="mt-2 text-xs text-[#7C3AED]">Owned by: Investigator → Case Supervisor</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-[#9CA3AF] border-t border-[#F3F4F6] pt-4">
            <strong className="text-[#6B7280]">The handoff:</strong> An Incident is promoted to a Case by the Investigator once the operator declares the live threat resolved. The Case inherits all evidence, timeline events, and entity references from the Incident. Multiple correlated Incidents (a Campaign) can be grouped into a single master Case for unified investigation.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div
            className="rounded-lg bg-white p-6"
            style={{
              borderLeft: '4px solid #EA580C',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3 className="text-base font-bold text-[#111827]">
              External Context Signal
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              A signal from outside the physical security system. Subtypes:
              <span className="font-medium text-[#374151]">
                {' '}
                civil_unrest, weather, law_enforcement, person_of_interest,
                news, traffic
              </span>
              .
            </p>
          </div>
          <div
            className="rounded-lg bg-white p-6"
            style={{
              borderLeft: '4px solid #D97706',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3 className="text-base font-bold text-[#111827]">
              Deterrence Alert
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              Generated when leading indicators suggest an incident MAY occur
              before it does. Created by the Deterrence Engine from External
              Context Signals + behavioral patterns.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
