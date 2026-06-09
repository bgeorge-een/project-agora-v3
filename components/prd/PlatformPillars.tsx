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
    icon: 'sensors',
    description:
      'Ingests and normalizes signals from any vendor, camera, sensor, or external feed into a common queryable schema. Signal categories: security, environmental, operational, identity, vehicle, building_systems, external_context.',
    color: '#2563EB',
    tint: '#EFF6FF',
  },
  {
    title: 'World Model',
    icon: 'layers',
    description:
      'A continuously maintained physical ontology: sites, buildings, floors, zones, doors, cameras, sensors, people, vehicles, credentials. Every event is interpreted spatially.',
    color: '#0891B2',
    tint: '#ECFEFF',
  },
  {
    title: 'Agentic Enrichment',
    icon: 'psychology',
    description:
      'Five-agent AI pipeline: Signal Normalizer → Enrichment Agent → Analysis Agent → Recommendation Agent + Explanation Agent. Partial results stream to app UIs as each agent completes.',
    color: '#7C3AED',
    tint: '#F5F3FF',
  },
  {
    title: 'SOP + Playbook Engine',
    icon: 'checklist',
    description:
      'SOPs define what humans do (retrieved at triage time). Playbooks define what the system does (Response and Deterrence types). Both authored in Case Management, served platform-wide.',
    color: '#EA580C',
    tint: '#FFF7ED',
  },
  {
    title: 'Closed-Loop Learning',
    icon: 'loop',
    description:
      'Every human override writes a FeedbackRecord. AI Analyst labels each: model problem / policy gap / data quality / correct override. Feeds model improvement.',
    color: '#16A34A',
    tint: '#F0FDF4',
  },
]

export default function PlatformPillars() {
  return (
    <section className="bg-[#F9FAFB] px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Inside the platform"
          title="Five Platform Pillars"
          subtitle="The five capabilities every Agora app inherits — built once, served everywhere."
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {PILLARS.map((pillar, i) => (
            <div
              key={pillar.title}
              className="flex flex-col rounded-lg bg-white p-6"
              style={{
                borderTop: `4px solid ${pillar.color}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: pillar.tint, color: pillar.color }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 26 }}>{pillar.icon}</span>
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
