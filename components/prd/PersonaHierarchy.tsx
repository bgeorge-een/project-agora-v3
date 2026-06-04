import SectionHeader from '@/components/ui/SectionHeader'

interface PersonaLevel {
  level: string
  role: string
  description: string
}

const INCIDENT_PERSONAS: PersonaLevel[] = [
  {
    level: 'L1',
    role: 'Site Operator',
    description:
      'Triage live alert queue, verify incidents, follow AI-assisted response plans. Primary views: Response View, Monitor View.',
  },
  {
    level: 'L2',
    role: 'Shift Supervisor',
    description:
      'Oversee operator queue, approve high-risk escalations, manage shift handoff.',
  },
  {
    level: 'L3',
    role: 'Site SOC Director',
    description: 'Monitor site health, operator performance, shift metrics.',
  },
  {
    level: 'L4',
    role: 'Regional SOC Director',
    description:
      'Multi-site Map View, cross-site incident patterns, resource allocation.',
  },
  {
    level: 'L5',
    role: 'Global SOC Director',
    description:
      'Enterprise risk posture, AI quality oversight, executive briefs.',
  },
]

const CASE_PERSONAS: PersonaLevel[] = [
  {
    level: 'L1',
    role: 'Investigator',
    description:
      'Case workspace: evidence, entity graph, timeline, AI-assisted narrative.',
  },
  {
    level: 'L2',
    role: 'Case Supervisor',
    description: 'Case queue management, assignment, SLA oversight.',
  },
  {
    level: 'L3',
    role: 'Compliance/Safety Manager',
    description:
      'Author SOPs and Playbooks, review Violations, manage corrective actions, audit packs.',
  },
  {
    level: 'L3',
    role: 'External Collaborator',
    description:
      'Task-recipient access tier: HR, Legal, Facilities, IT. Scoped evidence only.',
  },
  {
    level: 'L4',
    role: 'Regional Security Director',
    description: 'Cross-site case trends, compliance posture.',
  },
  {
    level: 'L5',
    role: 'Global Security Director',
    description: 'Enterprise risk reporting, AI quality at scale.',
  },
]

interface LadderProps {
  title: string
  accent: string
  tint: string
  icon: string
  personas: PersonaLevel[]
}

function PersonaLadder({ title, accent, tint, icon, personas }: LadderProps) {
  return (
    <div
      className="rounded-lg bg-white p-7"
      style={{
        borderTop: `4px solid ${accent}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
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

      <div className="mt-6 space-y-3">
        {personas.map((p, i) => (
          <div
            key={`${p.level}-${p.role}`}
            className="flex gap-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB] p-4"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {p.level}
            </span>
            <div>
              <p className="text-sm font-bold text-[#111827]">{p.role}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
                {p.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PersonaHierarchy() {
  return (
    <section className="bg-[#F9FAFB] px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Who uses it"
          title="Persona Hierarchy"
          subtitle="Each app serves five levels. Each level sees only what it needs."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PersonaLadder
            title="Real-time Incident Management"
            accent="#2563EB"
            tint="#EFF6FF"
            icon="⚡"
            personas={INCIDENT_PERSONAS}
          />
          <PersonaLadder
            title="Case Management"
            accent="#7C3AED"
            tint="#F5F3FF"
            icon="🔍"
            personas={CASE_PERSONAS}
          />
        </div>
      </div>
    </section>
  )
}
