import { TAM_CARDS } from '@/lib/icp/data'

export default function TamCards() {
  return (
    <section id="market" className="px-4 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
          Market Opportunity
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          Total Addressable Market
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Market size context for each segment. All figures from third-party analyst research.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TAM_CARDS.map((card) => (
            <div
              key={card.label}
              className="rounded-xl bg-white p-6"
              style={{
                borderTop: `4px solid ${card.accent}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: card.accent }}
              >
                {card.label}
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">{card.segment}</p>

              <p className="mt-4 text-3xl font-extrabold text-[#111827]">{card.current}</p>
              <p className="text-xs text-[#6B7280]">today</p>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: `${card.accent}15`, color: card.accent }}
                >
                  {card.cagr} CAGR
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-[#111827]">
                {card.projected}{' '}
                <span className="text-xs font-normal text-[#6B7280]">by {card.projectedYear}</span>
              </p>

              <p className="mt-4 text-[10px] text-[#9CA3AF]">
                {card.source} · {card.sourceYear}
              </p>
            </div>
          ))}
        </div>

        {/* EEN/Brivo context */}
        <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <p className="text-xs text-[#6B7280]">
            <span className="font-semibold text-[#111827]">EEN/Brivo context:</span> ~$179M estimated ARR (2024 est., Latka/CBInsights).
            Verkada (primary competitor) at $357M ARR and $5.8B valuation (Dec 2025). Full video surveillance market (hardware + software + services): $33.8B (Memoori, Q3 2025).
          </p>
        </div>
      </div>
    </section>
  )
}
