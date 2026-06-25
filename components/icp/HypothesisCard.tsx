import type { Hypothesis, HypothesisStatus } from '@/lib/icp/data'

const STATUS_STYLE: Record<HypothesisStatus, { label: string; bg: string; color: string }> = {
  testing:     { label: 'Testing',     bg: '#FFFBEB', color: '#92400E' },
  validated:   { label: 'Validated',   bg: '#F0FDF4', color: '#15803D' },
  invalidated: { label: 'Invalidated', bg: '#F9FAFB', color: '#6B7280' },
}

export default function HypothesisCard({ hypothesis }: { hypothesis: Hypothesis }) {
  const statusCfg = STATUS_STYLE[hypothesis.status]

  return (
    <div
      className="rounded-xl bg-white"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
    >
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
            Hypothesis {hypothesis.id.toUpperCase()}
          </p>
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Statement */}
        <p className="mt-3 text-base font-bold leading-snug text-[#111827] sm:text-lg">
          {hypothesis.statement}
        </p>

        {/* 2×2 evidence grid */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-[#F8FAFC] p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
              <span className="material-symbols-outlined text-[#2563EB]" style={{ fontSize: 14 }}>bar_chart</span>
              Quantitative Signal
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">{hypothesis.quantSignal}</p>
          </div>
          <div className="rounded-lg bg-[#F8FAFC] p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
              <span className="material-symbols-outlined text-[#7C3AED]" style={{ fontSize: 14 }}>chat</span>
              Qualitative Signal
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">{hypothesis.qualSignal}</p>
          </div>
          <div className="rounded-lg bg-[#F8FAFC] p-3 sm:col-span-2">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
              <span className="material-symbols-outlined text-[#0D9488]" style={{ fontSize: 14 }}>science</span>
              How to Test
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">{hypothesis.howToTest}</p>
          </div>
        </div>

        {/* Risk if wrong — amber callout */}
        <div className="mt-4 rounded-lg border-l-4 border-[#F59E0B] bg-[#FFFBEB] p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#92400E]">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
            Risk if Wrong
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#92400E]">{hypothesis.riskIfWrong}</p>
        </div>
      </div>
    </div>
  )
}
