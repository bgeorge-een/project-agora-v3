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
    name: 'Case Intake & Creation',
    stories: [
      {
        story: 'Start from a case queue dashboard',
        criteria:
          'Investigator lands on a queue that shows total open cases, under-SLA cases, out-of-SLA cases, pending approvals, average open age, assignee performance, queue health, and a prioritized case list; selecting a case opens the full workspace.',
      },
      {
        story: 'Promote an incident into a case',
        criteria:
          'Investigator can promote a live or resolved incident into a case that inherits incident summary, map/floor context, camera/device evidence, action execution history, entities, notes, owners, open questions, and audit log; source incident remains linked.',
      },
      {
        story: 'Create a case manually when there is no source incident',
        criteria:
          'Authorized users can create a case from a blank or templated intake form with case type, severity, site, owner, reporting party, involved people/groups, narrative, initial evidence links, and due dates.',
      },
      {
        story: 'Use AI assistance to draft initial case context',
        criteria:
          'AI can draft the case title, summary, initial timeline, investigative questions, recommended next steps, and report outline from incident context or manual intake fields; investigator must review and accept edits before they become official.',
      },
      {
        story: 'Read case context immediately at the top of the workspace',
        criteria:
          'Header shows case ID, source, lifecycle stage, severity, owner, access group, site, people count, SLA, created/updated dates, involved entity chips, tags, and external system IDs without forcing the investigator into the side rail.',
      },
    ],
  },
  {
    name: 'Lifecycle, Workflow & Drafting',
    stories: [
      {
        story: 'Move a case through the full lifecycle',
        criteria:
          'Supported stages include Intake, Triage, Active Investigation, Evidence Review, Report Drafting, Approval, Closed, Reopened, and Archived; every stage change captures actor, timestamp, reason, and optional required fields.',
      },
      {
        story: 'Preserve investigation continuity across handoffs',
        criteria:
          'Handoff summary shows what happened, what is known, what is disputed, pending actions, evidence gaps, lifecycle blockers, and next owner; all updates append to case history.',
      },
      {
        story: 'Track investigation tasks, decisions, and ownership',
        criteria:
          'Tasks show title, owner, due date, status, external-collaborator tag, and completion action; key decisions and task completions append timeline events and can be referenced in the final report.',
      },
      {
        story: 'Draft case content with AI while keeping human control',
        criteria:
          'Assistant answers are scoped to the case, cite evidence IDs, refuse unsupported claims, and help draft summaries, timeline language, findings, recommendations, and approval notes without publishing automatically.',
      },
    ],
  },
  {
    name: 'Evidence Intake & Chain of Custody',
    stories: [
      {
        story: 'Add manual evidence to the case',
        criteria:
          'Investigator can upload or register documents, images, video clips, audio, witness statements, device logs, physical item records, and external URLs with source, collector, collection time, retention policy, and description.',
      },
      {
        story: 'Link evidence to timeline, entities, and locations',
        criteria:
          'Evidence can be linked to incidents, manual events, people, groups, vehicles, credentials, doors, cameras, zones, floors, sites, tasks, findings, and report sections; links remain visible from both sides.',
      },
      {
        story: 'Review evidence with defensible chain of custody',
        criteria:
          'Each evidence item shows type, label, source system, timestamp, hash or integrity marker where available, custody owner, access history, transfer history, related entities, and preview/clip access where applicable.',
      },
      {
        story: 'Reconstruct and annotate the case timeline',
        criteria:
          'System, camera, access, agent, action, operator note, manual event, evidence collection, custody transfer, approval, and export events share one timeline; AI/manual/action badges are visible and gaps or contradictions can be flagged.',
      },
    ],
  },
  {
    name: 'Access Control & Collaboration',
    stories: [
      {
        story: 'Maintain a visible case people roster',
        criteria:
          'Investigator can add people with role, contact details, organization, and case context; supported roles include case investigator, approver, HR, Legal, site supervisor, witness, victim, reporting party, security officer, subject, and other.',
      },
      {
        story: 'Apply RBAC and case-specific access control',
        criteria:
          'Case permissions combine platform RBAC with case-level access for named people and groups; users only see cases, evidence, notes, reports, and exports allowed by their role and case assignment.',
      },
      {
        story: 'Grant scoped access to collaborators',
        criteria:
          'Investigator can invite internal groups or external collaborators to specific tasks, evidence, notes, or report sections; all views, downloads, edits, and permission changes are logged.',
      },
      {
        story: 'Resolve open investigative questions with accountable owners',
        criteria:
          'Open questions remain visible, can be assigned to people or groups, can be marked resolved with supporting evidence, and resolution is logged into case history.',
      },
    ],
  },
  {
    name: 'Reports, Approvals & Export',
    stories: [
      {
        story: 'Generate a physical security investigation report',
        criteria:
          'Report template includes executive summary, incident/case background, involved parties, location/site context, timeline, evidence inventory, findings, policy/SOP references, recommendations, attachments, approvals, and signature blocks.',
      },
      {
        story: 'Route reports for signatures and approvals',
        criteria:
          'Case owner can route draft or final reports to required approvers; approvers can approve, reject, request changes, sign, and leave timestamped comments that are retained in the audit history.',
      },
      {
        story: 'Export the complete case package',
        criteria:
          'Authorized users can export PDF reports, ZIP evidence packages, JSON case records, XML records, and CSV tables for cases, people, tasks, timelines, evidence, custody events, approvals, and audit history.',
      },
      {
        story: 'Keep generated reports defensible and editable',
        criteria:
          'AI-drafted report sections cite supporting evidence, remain editable by investigators, preserve version history, and clearly distinguish draft text from approved final content.',
      },
    ],
  },
  {
    name: 'Integrations & Enterprise Operations',
    stories: [
      {
        story: 'Integrate case workflow with ServiceNow',
        criteria:
          'Cases can create, link, update, or synchronize ServiceNow records with external IDs, status mapping, assignment mapping, priority/severity mapping, comments, attachments, and audit-safe retry handling.',
      },
      {
        story: 'Configure generic inbound and outbound integrations',
        criteria:
          'Admins can configure generic API, webhook, file drop, or message-based integrations for intake, evidence references, case updates, lifecycle events, approvals, and export delivery.',
      },
      {
        story: 'Link cases to a campaign and promote to master case',
        criteria:
          'System surfaces candidate links via shared entities, locations, incidents, signatures, and behaviors; promotion creates a master case with child cases while each child remains independently workable.',
      },
      {
        story: 'Maintain enterprise reporting over cases and investigations',
        criteria:
          'Executive Reporting shows open cases by lifecycle stage, aging/SLA risk, approval backlog, export activity, custody exceptions, integration failures, case outcomes, and AI drafting quality.',
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
