import { MATRIX_ROWS, type SegmentStatus } from '@/lib/icp/data'

const STATUS_CONFIG: Record<SegmentStatus, { label: string; color: string; bg: string; symbol: string }> = {
  in:          { label: 'In',          color: '#15803D', bg: '#F0FDF4', symbol: '●' },
  out:         { label: 'Out',         color: '#6B7280', bg: '#F9FAFB', symbol: '○' },
  conditional: { label: 'Conditional', color: '#92400E', bg: '#FFFBEB', symbol: '◐' },
}

function StatusCell({ status }: { status: SegmentStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span aria-hidden>{cfg.symbol}</span>
      {cfg.label}
    </span>
  )
}

export default function TargetingMatrix() {
  return (
    <section id="matrix" className="px-4 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
          Targeting Matrix
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          Account fit at a glance
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Use this to qualify accounts in under 10 seconds. Click any row to jump to the full ICP definition.
        </p>

        {/* Desktop table */}
        <div className="mt-8 hidden overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white shadow-sm sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                  Segment
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#2563EB]">
                  MC-1 Direct
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#0D9488' }}>
                  MC-2 Channel
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#7C3AED]">
                  Case Mgmt
                </th>
                <th className="border-l border-[#E5E7EB] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                  Lead Motion
                </th>
              </tr>
            </thead>
            <tbody>
              {MATRIX_ROWS.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F8FAFC]"
                >
                  <td className="px-4 py-3 font-medium text-[#111827]">
                    {row.segmentHref ? (
                      <a href={row.segmentHref} className="hover:text-[#2563EB] hover:underline">
                        {row.segment}
                      </a>
                    ) : (
                      row.segment
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusCell status={row.mc1} /></td>
                  <td className="px-4 py-3"><StatusCell status={row.mc2} /></td>
                  <td className="px-4 py-3"><StatusCell status={row.caseManagement} /></td>
                  <td className="border-l border-[#F3F4F6] px-4 py-3 text-[#6B7280]">{row.leadMotion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div className="mt-6 flex flex-col gap-3 sm:hidden">
          {MATRIX_ROWS.map((row, i) => (
            <div key={i} className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#111827]">{row.segment}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">MC-1</p>
                  <StatusCell status={row.mc1} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#0D9488' }}>MC-2</p>
                  <StatusCell status={row.mc2} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">Cases</p>
                  <StatusCell status={row.caseManagement} />
                </div>
              </div>
              <p className="mt-3 text-xs text-[#6B7280]">{row.leadMotion}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {(Object.entries(STATUS_CONFIG) as [SegmentStatus, typeof STATUS_CONFIG[SegmentStatus]][]).map(([, cfg]) => (
            <span key={cfg.label} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <span className="font-bold" style={{ color: cfg.color }}>{cfg.symbol}</span>
              {cfg.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
