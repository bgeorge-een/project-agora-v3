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
      'A single raw event from one device or feed. No inherent value alone.',
    createdBy: 'Any device/feed',
    ownedBy: 'Signal Normalizer',
    becomes: 'Alert',
  },
  {
    term: 'Alert',
    definition:
      'Normalized, enriched, scored notification. Many signals → one alert.',
    createdBy: 'Signal Normalizer + agents',
    ownedBy: 'Operator',
    becomes: 'Incident (on accept) or Dismissed',
  },
  {
    term: 'Incident',
    definition: 'An accepted Alert — the unit of operational work.',
    createdBy: 'Operator',
    ownedBy: 'Operator / reviewer',
    becomes: 'Case (on promote)',
  },
  {
    term: 'Case',
    definition:
      'Investigation container: evidence, timeline, entities, tasks, narrative.',
    createdBy: 'Investigator',
    ownedBy: 'Investigator',
    becomes: 'Report / Campaign / model feedback',
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
    <section className="bg-[#F9FAFB] px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Shared vocabulary"
          title="Canonical Data Model"
          subtitle="These definitions are used consistently across both apps and the platform."
        />

        <div
          className="mt-12 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <table className="w-full border-collapse text-sm">
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

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
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
