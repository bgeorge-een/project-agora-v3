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
    title: 'Map, Video & Action Assurance',
    outcome: 'Role-scoped global, regional, site, and floor response across map context, camera wall/live view, and verified playbook execution.',
    demo: 'Supervisor opens a site from the regional map, drills into devices/incidents, verifies video, and watches each action reach acknowledged state.',
  },
  {
    num: 4,
    theme: 'Investigation',
    title: 'Case Continuity & Evidence Timeline',
    outcome: 'Resolved incidents promote into cases with evidence, map evidence, actions, and ownership intact.',
    demo: 'Investigator continues from incident handoff into a timeline mixing map, system, agent, and manual events.',
  },
  {
    num: 5,
    theme: 'Investigation',
    title: 'Cross-site Pattern Analysis',
    outcome: 'Recurring threats surfaced across the portfolio.',
    demo: 'System links related cases into a Campaign via shared entities.',
  },
  {
    num: 6,
    theme: 'Governance',
    title: 'Compliance & Audit',
    outcome: 'Defensible audit trail for every decision and override.',
    demo: 'A Violation drives a tracked corrective action to closure.',
  },
  {
    num: 7,
    theme: 'Collaboration',
    title: 'External Collaborator Access',
    outcome: 'Scoped, secure case sharing with outside parties.',
    demo: 'HR collaborator completes a task seeing only the granted evidence.',
  },
  {
    num: 8,
    theme: 'Enterprise Intelligence',
    title: 'Closed-Loop Operations',
    outcome: 'Feedback, failed actions, deterrence outcomes, and case findings drive continuous improvement.',
    demo: 'An override and failed automation are labeled and surfaced in the AI quality report.',
  },
]

export default function BuildRoadmap() {
  return (
    <section className="bg-[#F9FAFB] px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Sequencing"
          title="Build Roadmap"
          subtitle="Eight vertical slices, each delivering a usable outcome and stacking toward full enterprise intelligence."
        />

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
