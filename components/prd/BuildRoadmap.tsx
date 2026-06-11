import SectionHeader from '@/components/ui/SectionHeader'

type Theme =
  | 'Foundation'
  | 'Live Operations'
  | 'Investigation'
  | 'Governance'
  | 'Collaboration'
  | 'Enterprise Intelligence'

interface Slice {
  num: number
  theme: Theme
  title: string
  outcome: string
  demo: string
}

const THEME_COLOR: Record<Theme, string> = {
  Foundation: '#64748B',
  'Live Operations': '#2563EB',
  Investigation: '#7C3AED',
  Governance: '#EA580C',
  Collaboration: '#0891B2',
  'Enterprise Intelligence': '#16A34A',
}

const SLICES: Slice[] = [
  {
    num: 1,
    theme: 'Foundation',
    title: 'Platform & World Model',
    outcome: 'Signal ingestion + live physical ontology online.',
    demo: 'A signal from any vendor lands as a normalized Signal mapped to a zone.',
  },
  {
    num: 2,
    theme: 'Live Operations',
    title: 'SOC Load Reduction',
    outcome: 'Operators see enriched, deduplicated, role-filtered alerts in real time.',
    demo: 'Operator triages one incident-centered queue and sees the recommended next best action.',
  },
  {
    num: 3,
    theme: 'Live Operations',
    title: 'Map, Indoor Floors & Action Assurance',
    outcome: 'Role-scoped global, regional, site, and floor response across map context, CAD-style floor plans, live video, and verified playbook execution.',
    demo: 'Supervisor opens a site, switches floors, clicks a camera for live view, reviews device health anomalies, and watches each response action reach acknowledged state.',
  },
  {
    num: 4,
    theme: 'Investigation',
    title: 'Case Intake & Lifecycle Foundation',
    outcome: 'Incidents promote into cases and investigators can manually create cases with full lifecycle tracking.',
    demo: 'Investigator promotes an incident, creates a manual case, assigns owner/severity/site, and advances stages from Intake through Active Investigation with every transition audited.',
  },
  {
    num: 5,
    theme: 'Investigation',
    title: 'Evidence, Custody & AI Drafting',
    outcome: 'Manual and system evidence link into the case with chain of custody and AI-assisted drafting.',
    demo: 'Investigator uploads a witness statement, links video and access logs to timeline events, reviews custody history, and accepts an AI-drafted summary with evidence citations.',
  },
  {
    num: 6,
    theme: 'Governance',
    title: 'Access Control & Case Governance',
    outcome: 'RBAC and case-level people/group permissions protect evidence, notes, reports, approvals, and exports.',
    demo: 'Case owner grants Legal group report-only access, restricts sensitive evidence to investigators, and reviews the permission audit trail.',
  },
  {
    num: 7,
    theme: 'Collaboration',
    title: 'Reports, Signatures & Export',
    outcome: 'Physical security investigation reports route for approval and export as complete evidence packages.',
    demo: 'Investigator generates the investigation report template, routes it for signatures, then exports PDF, ZIP, JSON, XML, and CSV deliverables.',
  },
  {
    num: 8,
    theme: 'Enterprise Intelligence',
    title: 'ServiceNow & Generic Integrations',
    outcome: 'Case data synchronizes with ServiceNow and configurable generic integration endpoints.',
    demo: 'A case opens a linked ServiceNow ticket, syncs status/comments/attachments, sends closure export to a webhook, and surfaces integration failures in enterprise reporting.',
  },
]

export default function BuildRoadmap() {
  return (
    <section className="bg-[#F9FAFB] px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Sequencing"
          title="Build Roadmap"
          subtitle="Eight vertical slices, each delivering a usable outcome and stacking toward full enterprise intelligence."
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {SLICES.map((slice) => {
            const color = THEME_COLOR[slice.theme]
            return (
              <div
                key={slice.num}
                className="flex flex-col rounded-lg bg-white p-5"
                style={{
                  borderLeft: `4px solid ${color}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: color }}
                  >
                    {slice.theme}
                  </span>
                  <span
                    className="text-2xl font-black"
                    style={{ color: `${color}33` }}
                  >
                    {String(slice.num).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold leading-snug text-[#111827]">
                  {slice.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  {slice.outcome}
                </p>
                <div className="mt-4 border-t border-[#F3F4F6] pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Demo success
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#374151]">
                    {slice.demo}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
