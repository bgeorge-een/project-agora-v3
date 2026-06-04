'use client'

import { EXTERNAL_SIGNALS, MOCK_CAMPAIGNS } from '@/lib/mock-data/scenarios'

interface StatCard {
  label: string
  value: string
  trend?: string
  trendColor?: string
  accent: string
}

const STATS: StatCard[] = [
  { label: 'Open Incidents', value: '4', trend: '↑ trending', trendColor: '#EF4444', accent: '#EF4444' },
  { label: 'MTTA', value: '2.3 min', trend: '↓ 0.4m wk', trendColor: '#16A34A', accent: '#2563EB' },
  { label: 'AI Acceptance Rate', value: '87%', trend: '↑ 3% wk', trendColor: '#16A34A', accent: '#7C3AED' },
  { label: 'Active Campaigns', value: '1', accent: '#D97706' },
]

interface SiteRow {
  site: string
  open: number
  mtta: string
  mttr: string
  sla: string
  risk: string
  riskColor: string
}

const SITE_ROWS: SiteRow[] = [
  { site: 'Austin HQ', open: 3, mtta: '2.3m', mttr: '18m', sla: '✓', risk: '🔴 High', riskColor: '#EF4444' },
  { site: 'Dallas Office', open: 1, mtta: '1.1m', mttr: '12m', sla: '✓', risk: '🟡 Med', riskColor: '#D97706' },
  { site: 'Cedar Park', open: 0, mtta: '—', mttr: '—', sla: '✓', risk: '🟢 Low', riskColor: '#16A34A' },
]

interface BarRow {
  label: string
  pct: number
  color: string
}

const AI_BARS: BarRow[] = [
  { label: 'Recommendation Acceptance Rate', pct: 87, color: '#2563EB' },
  { label: 'Override: Wrong Severity', pct: 6, color: '#F59E0B' },
  { label: 'Override: False Positive', pct: 4, color: '#F97316' },
  { label: 'Override: Other', pct: 3, color: '#9CA3AF' },
]

const SIGNAL_SEV_STYLE: Record<string, { bg: string; text: string }> = {
  high: { bg: '#FEF2F2', text: '#DC2626' },
  medium: { bg: '#FFFBEB', text: '#D97706' },
  low: { bg: '#F1F5F9', text: '#64748B' },
  critical: { bg: '#FEF2F2', text: '#DC2626' },
}

function siteNames(ids: string[]): string {
  const map: Record<string, string> = {
    'site-austin': 'Austin HQ',
    'site-dallas': 'Dallas Office',
    'site-warehouse': 'Cedar Park Warehouse',
  }
  return ids.map((i) => map[i] ?? i).join(', ')
}

export default function InsightsView() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]"
            style={{ borderTop: `3px solid ${s.accent}` }}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#111827]">{s.value}</p>
            {s.trend && (
              <p
                className="mt-0.5 text-xs font-semibold"
                style={{ color: s.trendColor }}
              >
                {s.trend}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Campaign alert */}
      {MOCK_CAMPAIGNS.map((c) => (
        <div
          key={c.id}
          className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">🎯</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#92400E]">
                1 Active Campaign: {c.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#A16207]">
                {c.hypothesis}
              </p>
            </div>
            <a
              href="/case-management"
              className="shrink-0 rounded-md bg-[#D97706] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#B45309]"
            >
              View Campaign →
            </a>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Site Health */}
        <section className="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#374151]">
            Site Health
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-left text-xs uppercase tracking-wide text-[#9CA3AF]">
                <th className="pb-2 font-semibold">Site</th>
                <th className="pb-2 text-center font-semibold">Open</th>
                <th className="pb-2 text-center font-semibold">MTTA</th>
                <th className="pb-2 text-center font-semibold">MTTR</th>
                <th className="pb-2 text-center font-semibold">SLA</th>
                <th className="pb-2 text-right font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody>
              {SITE_ROWS.map((r) => (
                <tr key={r.site} className="border-b border-[#F3F4F6] last:border-0">
                  <td className="py-2.5 font-medium text-[#111827]">{r.site}</td>
                  <td className="py-2.5 text-center text-[#374151]">{r.open}</td>
                  <td className="py-2.5 text-center text-[#374151]">{r.mtta}</td>
                  <td className="py-2.5 text-center text-[#374151]">{r.mttr}</td>
                  <td className="py-2.5 text-center font-semibold text-[#16A34A]">
                    {r.sla}
                  </td>
                  <td
                    className="py-2.5 text-right text-xs font-semibold"
                    style={{ color: r.riskColor }}
                  >
                    {r.risk}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* AI Quality */}
        <section className="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#374151]">
            AI Quality
          </h2>
          <div className="space-y-3">
            {AI_BARS.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-[#374151]">{b.label}</span>
                  <span className="font-semibold text-[#111827]">{b.pct}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F1F5F9]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* External Risk */}
      <section className="rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#374151]">
          External Risk
        </h2>
        <div className="space-y-3">
          {EXTERNAL_SIGNALS.map((sig) => {
            const sev = SIGNAL_SEV_STYLE[sig.severity] ?? SIGNAL_SEV_STYLE.low
            return (
              <div
                key={sig.id}
                className="flex items-start gap-3 rounded-lg border border-[#F3F4F6] p-3"
              >
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{ backgroundColor: sev.bg, color: sev.text }}
                >
                  {sig.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111827]">
                    {sig.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">
                    {sig.description}
                  </p>
                  <p className="mt-1 text-[11px] text-[#9CA3AF]">
                    Affects: {siteNames(sig.affectedSiteIds)} · {sig.source} ·{' '}
                    {sig.timeHorizon}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
