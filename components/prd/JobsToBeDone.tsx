import SectionHeader from '@/components/ui/SectionHeader'

interface Job {
  icon: string
  question: string
  answeredBy: string
  variant: 'incident' | 'case' | 'both' | 'loop'
}

const JOBS: Job[] = [
  {
    icon: 'bolt',
    question: 'What is happening right now, and what deserves attention first?',
    answeredBy: 'Real-time Incident Management',
    variant: 'incident',
  },
  {
    icon: 'policy',
    question: 'What should we do, what does policy require, and did the action take effect?',
    answeredBy: 'Real-time Incident Management',
    variant: 'incident',
  },
  {
    icon: 'map',
    question: 'Where is the risk across sites, floors, devices, and cameras?',
    answeredBy: 'Both apps',
    variant: 'both',
  },
  {
    icon: 'manage_search',
    question: 'What happened before, during, and after, and who was involved?',
    answeredBy: 'Case Management',
    variant: 'case',
  },
  {
    icon: 'loop',
    question: 'What rule, SOP, playbook, device process, or model should improve?',
    answeredBy: 'Case Management → Platform',
    variant: 'loop',
  },
]

const TAG_STYLE: Record<Job['variant'], { bg: string; text: string }> = {
  incident: { bg: '#EFF6FF', text: '#2563EB' },
  case: { bg: '#F5F3FF', text: '#7C3AED' },
  both: { bg: '#ECFEFF', text: '#0E7490' },
  loop: { bg: '#F0FDF4', text: '#16A34A' },
}

export default function JobsToBeDone() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="What users need answered"
          title="Five Jobs to be Done"
          subtitle="Every Agora capability maps back to one of five questions a security organization must answer."
        />

        <ol className="mt-12 space-y-3">
          {JOBS.map((job, i) => {
            const tag = TAG_STYLE[job.variant]
            return (
              <li
                key={job.question}
                className="flex flex-col items-start gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 transition-colors hover:border-[#CBD5E1] hover:bg-[#F8FAFC] sm:flex-row sm:items-center sm:gap-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-base font-bold text-[#334155]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="material-symbols-outlined shrink-0 text-[#6B7280]" style={{ fontSize: 24 }}>{job.icon}</span>
                <p className="flex-1 text-base font-semibold leading-snug text-[#111827]">
                  {job.question}
                </p>
                <span className="hidden text-[#9CA3AF] sm:inline" aria-hidden>
                  →
                </span>
                <span
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold sm:shrink-0"
                  style={{ backgroundColor: tag.bg, color: tag.text }}
                >
                  {job.answeredBy}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
