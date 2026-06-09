import SectionHeader from '@/components/ui/SectionHeader'

interface Story {
  story: string
  criteria: string
}

interface Theme {
  name: string
  stories: Story[]
}

const THEMES: Theme[] = [
  {
    name: 'Case Continuity & Context',
    stories: [
      {
        story: 'Promote a resolved incident into a complete case',
        criteria:
          'Case inherits incident summary, map/floor context, camera/device evidence, action execution history, entities, notes, owners, open questions, and audit log; source incident remains linked.',
      },
      {
        story: 'Read case context immediately at the top of the workspace',
        criteria:
          'Header shows case ID, severity, status, owner, people count, site, SLA, created/updated/SLA dates, involved entity chips, tags, and campaign link without forcing the investigator into the side rail.',
      },
      {
        story: 'Preserve investigation continuity across handoffs',
        criteria:
          'Handoff summary shows what happened, what is known, what is disputed, pending actions, evidence gaps, and next owner; all updates append to case history.',
      },
      {
        story: 'Manage a complete case without leaving the app',
        criteria:
          'Summary context, timeline, evidence table, entity graph, tasks, case people, open questions, notes, AI assistant, narrative report, compliance, and executive reporting live in one workspace.',
      },
    ],
  },
  {
    name: 'Evidence Timeline & Entity Analysis',
    stories: [
      {
        story: 'Reconstruct and annotate the incident timeline',
        criteria:
          'System, camera, access, agent, action, operator note, and manual events share one timeline; AI/manual/action badges are visible; timestamps are readable; gaps and contradictions can be flagged.',
      },
      {
        story: 'Review evidence with chain-of-custody',
        criteria:
          'Each evidence item shows type, label, source system, timestamp, confidence, retention policy, related entities, and preview/clip access where applicable.',
      },
      {
        story: 'Consume incident map evidence into the case',
        criteria:
          'Site/floor markers, camera/device selections, detections, clips, and action review import as linked evidence with source context and chain-of-custody.',
      },
      {
        story: 'Explore the entity graph from evidence context',
        criteria:
          'Entity graph links people, credentials, doors, cameras, zones, sensors, vehicles, and campaigns; selecting a node exposes metadata, risk, site/zone, and relationships.',
      },
      {
        story: 'Ask the case AI assistant grounded questions',
        criteria:
          'Assistant answers are scoped to the case, cite evidence IDs, refuse unsupported claims, and help with timeline, entities, related incidents, and next investigative steps.',
      },
    ],
  },
  {
    name: 'People, Tasks & Collaboration',
    stories: [
      {
        story: 'Maintain a visible case people roster',
        criteria:
          'Investigator can add people with role, contact details, organization, and case context; supported roles include case investigator, HR, Legal, site supervisor, witness, victim, reporting party, security officer, subject, and other; role can be changed directly from the roster.',
      },
      {
        story: 'Track investigation tasks and ownership',
        criteria:
          'Tasks show title, owner, due date, status, external-collaborator tag, and completion action; completed tasks append a timeline event.',
      },
      {
        story: 'Resolve open investigative questions',
        criteria:
          'Open questions remain visible, can be marked resolved, and resolution is logged into case history.',
      },
      {
        story: 'Collaborate with HR, Legal, Facilities, and IT',
        criteria:
          'External collaborator roles can be represented in the people roster and task owners; future scoped access should limit evidence visibility and log all collaborator actions.',
      },
      {
        story: 'Add manual events and operator notes with case-grade provenance',
        criteria:
          'Manual event form captures type, timestamp, title, detail, source attribution, and timeline placement; quick notes and manual evidence remain visually distinct.',
      },
    ],
  },
  {
    name: 'Governance, Playbooks & Compliance',
    stories: [
      {
        story: 'Author and version SOPs that surface at triage',
        criteria:
          'SOP library shows ID, title, incident type, version, update date, and approval status; SOPs support draft/pending/approved lifecycle and version history.',
      },
      {
        story: 'Author, simulate, and deploy Playbooks',
        criteria:
          'Playbook library supports response/deterrence types, trigger tags, simulation output, approved-only deploy gating, and deployed state.',
      },
      {
        story: 'Review violations and drive corrective actions',
        criteria:
          'Violations queue shows violation, rule, severity, person, zone, and status; investigator can accept/reject and assign corrective action owner/due date.',
      },
      {
        story: 'Maintain a defensible audit and compliance posture',
        criteria:
          'Manual evidence, task completion, question resolution, playbook deployment, corrective action assignment, and overrides produce auditable case history.',
      },
    ],
  },
  {
    name: 'Reporting & Intelligence',
    stories: [
      {
        story: 'Generate a defensible narrative report',
        criteria:
          'Report modal generates an executive summary, timeline, involved parties, open questions, recommendations, and export/edit controls using case-scoped evidence.',
      },
      {
        story: 'Link cases to a Campaign and promote to master case',
        criteria:
          'System surfaces candidate links via shared entities; promotion creates master case with child cases; each child independently workable.',
      },
      {
        story: 'Report enterprise risk, AI quality, and action assurance',
        criteria:
          'Executive Reporting shows open cases, active campaigns, compliance score, AI quality, risk by site, AI feedback breakdown, active campaign summary, and AI-generated executive brief.',
      },
      {
        story: 'Keep the forensic UI readable under high information density',
        criteria:
          'Minimum 12px labels, high-contrast secondary text, readable inactive tabs, stronger metadata hierarchy, compact top case context, and increased timeline spacing reduce eye strain.',
      },
    ],
  },
]

const ACCENT = '#7C3AED'
const TINT = '#F5F3FF'

export default function UserStoriesCaseManagement() {
  return (
    <section className="bg-[#F9FAFB] px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="What investigators need to do"
          title="User Stories — Case Management"
          subtitle="Grouped by theme. Each story is paired with its key acceptance criteria."
        />

        <div className="mt-10 space-y-8 lg:mt-12">
          {THEMES.map((theme) => (
            <div key={theme.name}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  {theme.name}
                </span>
              </div>

              <div className="space-y-3 lg:hidden">
                {theme.stories.map((s) => (
                  <article
                    key={s.story}
                    className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-[#5B21B6]">
                      Story
                    </p>
                    <h3 className="mt-1 text-base font-bold leading-snug text-[#111827]">
                      {s.story}
                    </h3>
                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#5B21B6]">
                      Key Acceptance Criteria
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#4B5563]">
                      {s.criteria}
                    </p>
                  </article>
                ))}
              </div>

              <div
                className="hidden overflow-hidden rounded-lg border border-[#E5E7EB] bg-white lg:block"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              >
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr
                      className="border-b border-[#E5E7EB]"
                      style={{ backgroundColor: TINT }}
                    >
                      <th className="w-2/5 px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#5B21B6]">
                        Story
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#5B21B6]">
                        Key Acceptance Criteria
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {theme.stories.map((s, i) => (
                      <tr
                        key={s.story}
                        className={`border-b border-[#F3F4F6] ${
                          i % 2 === 1 ? 'bg-[#FAFBFC]' : 'bg-white'
                        }`}
                      >
                        <td className="px-5 py-4 align-top font-semibold text-[#111827]">
                          {s.story}
                        </td>
                        <td className="px-5 py-4 align-top leading-relaxed text-[#6B7280]">
                          {s.criteria}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
