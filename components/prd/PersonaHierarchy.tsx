import SectionHeader from '@/components/ui/SectionHeader'

interface PersonaLevel {
  level: string
  role: string
}

const INCIDENT_PERSONAS: PersonaLevel[] = [
  { level: 'L1', role: 'Site Operator' },
  { level: 'L2', role: 'Shift Supervisor' },
  { level: 'L3', role: 'Site SOC Director' },
  { level: 'L4', role: 'Regional SOC Director' },
  { level: 'L5', role: 'Global SOC Director' },
]

const CASE_PERSONAS: PersonaLevel[] = [
  { level: 'L1', role: 'Investigator' },
  { level: 'L2', role: 'Case Supervisor' },
  {
    level: 'L3',
    role: 'Compliance/Safety Manager + External Collaborator',
  },
  { level: 'L4', role: 'Regional Security Director' },
  { level: 'L5', role: 'Global Security Director' },
]

interface LadderProps {
  title: string
  accent: string
  tint: string
  border: string
  icon: string
  personas: PersonaLevel[]
}

function PersonaLadder({
  title,
  accent,
  tint,
  border,
  icon,
  personas,
}: LadderProps) {
  return (
    <div
      className="rounded-2xl bg-white p-7 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]"
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
          style={{ backgroundColor: tint }}
        >
          {icon}
        </span>
        <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
      </div>

      <div className="mt-6 space-y-2">
        {personas.map((p, i) => (
          <div
            key={p.level}
            className="flex items-center gap-4 rounded-xl border px-4 py-3 transition-transform hover:translate-x-1"
            style={{
              backgroundColor: tint,
              borderColor: border,
              marginLeft: `${i * 14}px`,
            }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {p.level}
            </span>
            <span className="text-sm font-semibold text-[#1F2937]">
              {p.role}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
        L1 site scope → L5 enterprise scope
      </p>
    </div>
  )
}

export default function PersonaHierarchy() {
  return (
    <section className="bg-[#F1F5F9] px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Who uses it"
          title="Persona Hierarchy"
          subtitle="Each app scales from a single site operator (L1) to a global director (L5), with responsibilities widening at every level."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PersonaLadder
            title="Real-time Incident Management"
            accent="#2563EB"
            tint="#EFF6FF"
            border="#BFDBFE"
            icon="⚡"
            personas={INCIDENT_PERSONAS}
          />
          <PersonaLadder
            title="Case Management"
            accent="#7C3AED"
            tint="#F5F3FF"
            border="#DDD6FE"
            icon="🔍"
            personas={CASE_PERSONAS}
          />
        </div>
      </div>
    </section>
  )
}
