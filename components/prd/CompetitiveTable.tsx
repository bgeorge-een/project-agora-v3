import SectionHeader from '@/components/ui/SectionHeader'

type Mark = 'yes' | 'no' | 'partial'

interface Row {
  capability: string
  genetec: Mark
  motorola: Mark
  milestone: Mark
  bearing: Mark
  agora: Mark
}

const ROWS: Row[] = [
  { capability: 'Signal ingestion', genetec: 'yes', motorola: 'yes', milestone: 'yes', bearing: 'partial', agora: 'yes' },
  { capability: 'Real-time operations', genetec: 'yes', motorola: 'yes', milestone: 'partial', bearing: 'partial', agora: 'yes' },
  { capability: 'SOP + Playbook', genetec: 'yes', motorola: 'yes', milestone: 'partial', bearing: 'yes', agora: 'yes' },
  { capability: 'Investigation', genetec: 'yes', motorola: 'partial', milestone: 'yes', bearing: 'no', agora: 'yes' },
  { capability: 'AI / Agentic', genetec: 'partial', motorola: 'yes', milestone: 'partial', bearing: 'partial', agora: 'yes' },
  { capability: 'Deterrence', genetec: 'partial', motorola: 'partial', milestone: 'no', bearing: 'no', agora: 'yes' },
  { capability: 'Compliance', genetec: 'yes', motorola: 'partial', milestone: 'partial', bearing: 'yes', agora: 'yes' },
  { capability: 'Closed-loop learning', genetec: 'partial', motorola: 'partial', milestone: 'no', bearing: 'no', agora: 'yes' },
]

function MarkCell({ mark, highlight = false }: { mark: Mark; highlight?: boolean }) {
  const config: Record<Mark, { symbol: string; color: string }> = {
    yes: { symbol: '✓', color: '#16A34A' },
    no: { symbol: '✗', color: '#EF4444' },
    partial: { symbol: '~', color: '#D97706' },
  }
  const c = config[mark]
  return (
    <td className={`px-4 py-3 text-center ${highlight ? 'bg-[#EFF6FF]/60' : ''}`}>
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
        style={{
          color: c.color,
          backgroundColor:
            mark === 'yes'
              ? '#F0FDF4'
              : mark === 'no'
                ? '#FEF2F2'
                : '#FFFBEB',
        }}
      >
        {c.symbol}
      </span>
    </td>
  )
}

export default function CompetitiveTable() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Where we win"
          title="Competitive Landscape"
          subtitle="Incumbents each own a slice. Agora is the only platform that spans the full signal-to-learning loop."
        />

        <div className="mt-10 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10)]">
          <table className="min-w-[58rem] w-full border-collapse text-sm xl:min-w-0">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Capability
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Genetec
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Motorola Operator + Avigilon
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Milestone XProtect
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Bearing / ServiceNow
                </th>
                <th className="border-l-2 border-[#2563EB] bg-[#EFF6FF] px-4 py-4 text-center text-xs font-extrabold uppercase tracking-wider text-[#2563EB]">
                  Agora
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.capability}
                  className={i % 2 === 1 ? 'bg-[#FAFBFC]' : 'bg-white'}
                >
                  <td className="px-5 py-3 text-left font-semibold text-[#111827]">
                    {row.capability}
                  </td>
                  <MarkCell mark={row.genetec} />
                  <MarkCell mark={row.motorola} />
                  <MarkCell mark={row.milestone} />
                  <MarkCell mark={row.bearing} />
                  <td className="border-l-2 border-[#2563EB] bg-[#EFF6FF]/60 px-4 py-3 text-center">
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                      style={{ color: '#16A34A', backgroundColor: '#DCFCE7' }}
                    >
                      ✓
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-[#16A34A]">✓</span> Full capability
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-[#D97706]">~</span> Partial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-bold text-[#EF4444]">✗</span> Not offered
          </span>
        </div>

        <div className="mt-6 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-4">
          <h3 className="text-sm font-extrabold text-[#1E3A8A]">
            Genetec is the strongest like-for-like incumbent
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#1E3A5F]">
            Genetec spans incident response, security work management, and digital evidence through
            Mission Control, Operations Center, and Clearance. Motorola’s closest product naming is
            Operator for SOC automation, backed by Avigilon Alta/Unity and Orchestrate. Milestone
            competes through XProtect Incident Manager and XProtect Evidence Manager. Agora’s wedge
            is the agentic signal-to-learning loop: prescriptive triage, deterrence, case promotion,
            and feedback records in one operator-centered workflow.
          </p>
        </div>
      </div>
    </section>
  )
}
