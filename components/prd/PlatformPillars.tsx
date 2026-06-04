import SectionHeader from '@/components/ui/SectionHeader'

interface Pillar {
  title: string
  icon: string
  description: string
  color: string
  tint: string
}

const PILLARS: Pillar[] = [
  {
    title: 'Signal Intelligence',
    icon: '📡',
    description: 'Ingests and normalizes signals from any vendor.',
    color: '#2563EB',
    tint: '#EFF6FF',
  },
  {
    title: 'World Model',
    icon: '🌐',
    description: 'Live physical ontology: sites, zones, doors, devices.',
    color: '#0D9488',
    tint: '#F0FDFA',
  },
  {
    title: 'Agentic Enrichment',
    icon: '🧠',
    description:
      '5-agent AI pipeline enriches every alert before human review.',
    color: '#7C3AED',
    tint: '#F5F3FF',
  },
  {
    title: 'SOP + Playbook Engine',
    icon: '✅',
    description: 'Human procedures + system automation, served platform-wide.',
    color: '#EA580C',
    tint: '#FFF7ED',
  },
  {
    title: 'Closed-Loop Learning',
    icon: '🔄',
    description:
      'Every override becomes a FeedbackRecord feeding model improvement.',
    color: '#16A34A',
    tint: '#F0FDF4',
  },
]

export default function PlatformPillars() {
  return (
    <section className="bg-[#F1F5F9] px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Inside the platform"
          title="Five Platform Pillars"
          subtitle="The five capabilities every Agora app inherits — built once, served everywhere."
        />

        <div className="mt-12 flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              className="flex min-w-[220px] flex-1 flex-col rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_10px_15px_rgba(0,0,0,0.08)]"
              style={{ borderTop: `4px solid ${pillar.color}` }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: pillar.tint }}
              >
                {pillar.icon}
              </div>
              <span
                className="mt-4 text-xs font-bold uppercase tracking-wider"
                style={{ color: pillar.color }}
              >
                Pillar {i + 1}
              </span>
              <h3 className="mt-1 text-base font-bold leading-snug text-[#111827]">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
