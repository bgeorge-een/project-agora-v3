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
}

const THEME_COLOR: Record<Theme, string> = {
  Foundation: '#64748B',
  'Live Operations': '#2563EB',
  Investigation: '#7C3AED',
  Governance: '#EA580C',
  Collaboration: '#0D9488',
  'Enterprise Intelligence': '#16A34A',
}

const SLICES: Slice[] = [
  {
    num: 1,
    theme: 'Foundation',
    title: 'Platform & World Model',
    outcome: 'Signal ingestion + live physical ontology online.',
  },
  {
    num: 2,
    theme: 'Live Operations',
    title: 'Real-time Alert Triage',
    outcome: 'Operators see enriched, deduplicated alerts in real time.',
  },
  {
    num: 3,
    theme: 'Live Operations',
    title: 'SOP + Playbook Execution',
    outcome: 'Guided response with policy-aware automation.',
  },
  {
    num: 4,
    theme: 'Investigation',
    title: 'Case Timeline & Evidence',
    outcome: 'Before/during/after reconstruction from any source.',
  },
  {
    num: 5,
    theme: 'Investigation',
    title: 'Cross-site Pattern Analysis',
    outcome: 'Recurring threats surfaced across the portfolio.',
  },
  {
    num: 6,
    theme: 'Governance',
    title: 'Compliance & Audit',
    outcome: 'Defensible audit trail for every decision and override.',
  },
  {
    num: 7,
    theme: 'Collaboration',
    title: 'External Collaborator Access',
    outcome: 'Scoped, secure case sharing with outside parties.',
  },
  {
    num: 8,
    theme: 'Enterprise Intelligence',
    title: 'Closed-Loop Model Tuning',
    outcome: 'Feedback records drive continuous model improvement.',
  },
]

export default function BuildRoadmap() {
  return (
    <section className="bg-[#172130] px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          dark
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
                className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: color }}
                  >
                    {slice.theme}
                  </span>
                  <span className="text-2xl font-black text-white/15">
                    {String(slice.num).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold leading-snug text-white">
                  {slice.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                  {slice.outcome}
                </p>
                <div
                  className="mt-4 h-1 w-8 rounded-full transition-all duration-200 group-hover:w-14"
                  style={{ backgroundColor: color }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
