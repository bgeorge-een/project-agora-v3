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
    name: 'Investigation Continuity',
    stories: [
      {
        story: 'Promote a resolved incident into a complete case',
        criteria:
          'Case inherits incident summary, correlated evidence, action execution history, map context, entities, notes, owners, and audit log; source incident remains linked.',
      },
      {
        story: 'Manage a complete case without leaving the app',
        criteria:
          'Summary, timeline, evidence, entity graph, tasks, notes, reports, audit log in one workspace; every change logged.',
      },
      {
        story: 'Preserve investigation continuity across handoffs',
        criteria:
          'Handoff summary shows what happened, what is known, what is disputed, pending actions, evidence gaps, and next owner; all updates append to case history.',
      },
      {
        story: 'Ask the case AI assistant grounded questions',
        criteria:
          'Answers cite specific evidence objects; refuses unsupported claims; covers who/what/when/where/why-likely/what-next; suggests follow-up queries.',
      },
    ],
  },
  {
    name: 'Evidence Timeline',
    stories: [
      {
        story: 'Reconstruct and edit the incident timeline',
        criteria:
          'System + agent + manual events on one timeline; AI-generated events visually distinct; add/remove/reorder/annotate; flag gaps and contradictions.',
      },
      {
        story: 'Review evidence with chain-of-custody',
        criteria:
          'Each evidence item shows source device/feed, timestamp, location, retention policy, access log, confidence, related entities, and export state.',
      },
      {
        story: 'Explore the entity graph from evidence context',
        criteria:
          'One-hop expansion from any person, credential, vehicle, door, camera, zone, or sensor; selecting entity filters timeline; confidence and retention per evidence item.',
      },
    ],
  },
  {
    name: 'Governance & Collaboration',
    stories: [
      {
        story: 'Add manual events and notes with chain-of-custody',
        criteria:
          'Incident-level: lightweight note, no chain-of-custody; Case-level: formal manual event with type, timestamp, location, source attribution, file attachment, "Manual Evidence" badge.',
      },
      {
        story: 'Collaborate with external parties (HR, Legal)',
        criteria:
          'External Collaborator sees only granted evidence; can add notes and complete assigned task; cannot see other cases; all actions logged.',
      },
      {
        story: 'Author and version SOPs that surface at triage',
        criteria:
          'Plain English; tagged by incident type; version control with effective date; approval workflow; SOP usage history visible.',
      },
      {
        story: 'Author, simulate, and deploy Playbooks',
        criteria:
          'Plain English → AI-structured conditions; simulate against historical events before deploy; Response and Deterrence types; approval required.',
      },
      {
        story: 'Review violations and drive corrective actions',
        criteria:
          'Each violation shows evidence + rule + involved party + severity; accept/reject/escalate; corrective actions tracked to closure.',
      },
    ],
  },
  {
    name: 'Reporting & Intelligence',
    stories: [
      {
        story: 'Generate a defensible narrative report',
        criteria:
          'Executive summary, evidence timeline, involved parties, action execution history, policy impact, open questions, recommendations; editable before export.',
      },
      {
        story: 'Link cases to a Campaign and promote to master case',
        criteria:
          'System surfaces candidate links via shared entities; promotion creates master case with child cases; each child independently workable.',
      },
      {
        story: 'Report enterprise risk, AI quality, and action assurance',
        criteria:
          'Open cases by severity, campaign count, FeedbackRecord breakdown (model/policy/data/correct), recommendation acceptance rate, failed action trends; executive brief generated.',
      },
    ],
  },
]

const ACCENT = '#7C3AED'
const TINT = '#F5F3FF'

export default function UserStoriesCaseManagement() {
  return (
    <section className="bg-[#F9FAFB] px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="What investigators need to do"
          title="User Stories — Case Management"
          subtitle="Grouped by theme. Each story is paired with its key acceptance criteria."
        />

        <div className="mt-12 space-y-8">
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
              <div
                className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white"
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
