import SectionHeader from '@/components/ui/SectionHeader'

type Mark = 'yes' | 'no' | 'partial'

interface Row {
  capability: string
  motorola: Mark
  bearing: Mark
  ontic: Mark
  agora: Mark
}

const ROWS: Row[] = [
  { capability: 'Signal ingestion', motorola: 'yes', bearing: 'partial', ontic: 'no', agora: 'yes' },
  { capability: 'Real-time operations', motorola: 'yes', bearing: 'partial', ontic: 'no', agora: 'yes' },
  { capability: 'SOP + Playbook', motorola: 'partial', bearing: 'yes', ontic: 'partial', agora: 'yes' },
  { capability: 'Investigation', motorola: 'partial', bearing: 'no', ontic: 'yes', agora: 'yes' },
  { capability: 'AI / Agentic', motorola: 'no', bearing: 'partial', ontic: 'partial', agora: 'yes' },
  { capability: 'Deterrence', motorola: 'partial', bearing: 'no', ontic: 'no', agora: 'yes' },
  { capability: 'Compliance', motorola: 'no', bearing: 'yes', ontic: 'yes', agora: 'yes' },
  { capability: 'Closed-loop learning', motorola: 'no', bearing: 'no', ontic: 'no', agora: 'yes' },
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
          <table className="min-w-[44rem] w-full border-collapse text-sm lg:min-w-0">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Capability
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Motorola Operator
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Bearing / ServiceNow
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  Ontic
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
                  <MarkCell mark={row.motorola} />
                  <MarkCell mark={row.bearing} />
                  <MarkCell mark={row.ontic} />
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
      </div>
    </section>
  )
}
