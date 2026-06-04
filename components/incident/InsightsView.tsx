'use client'

import { EXTERNAL_SIGNALS, MOCK_CAMPAIGNS } from '@/lib/mock-data/scenarios'

interface StatCard {
  label: string
  value: string
  trend?: string
  trendColor?: string
  trendIcon?: string
  accent: string
}

const STATS: StatCard[] = [
  { label: 'Open Incidents', value: '4', trend: 'trending up', trendColor: '#F87171', trendIcon: 'trending_up', accent: '#EF4444' },
  { label: 'MTTA', value: '2.3 min', trend: '0.4m wk', trendColor: '#34D399', trendIcon: 'trending_down', accent: '#2563EB' },
  { label: 'AI Acceptance Rate', value: '87%', trend: '3% wk', trendColor: '#34D399', trendIcon: 'trending_up', accent: '#7C3AED' },
  { label: 'Active Campaigns', value: '1', accent: '#D97706' },
]

interface SiteRow {
  site: string
  open: number
  mtta: string
  mttr: string
  sla: boolean
  risk: string
  riskColor: string
}

const SITE_ROWS: SiteRow[] = [
  { site: 'Austin HQ', open: 3, mtta: '2.3m', mttr: '18m', sla: true, risk: 'High', riskColor: '#EF4444' },
  { site: 'Dallas Office', open: 1, mtta: '1.1m', mttr: '12m', sla: true, risk: 'Med', riskColor: '#F59E0B' },
  { site: 'Cedar Park', open: 0, mtta: '—', mttr: '—', sla: true, risk: 'Low', riskColor: '#22C55E' },
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
  high: { bg: '#7F1D1D', text: '#FCA5A5' },
  medium: { bg: '#78350F', text: '#FCD34D' },
  low: { bg: '#334155', text: '#CBD5E1' },
  critical: { bg: '#7F1D1D', text: '#FCA5A5' },
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
    <div className="space-y-6 bg-[#0F1117]">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-4"
            style={{ borderTop: `3px solid ${s.accent}` }}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
            {s.trend && (
              <p
                className="mt-0.5 flex items-center gap-1 text-xs font-semibold"
                style={{ color: s.trendColor }}
              >
                {s.trendIcon && (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '15px', lineHeight: 1 }}
                  >
                    {s.trendIcon}
                  </span>
                )}
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
          className="rounded-xl border border-[#1E40AF] bg-[#0C1A2A] p-4"
        >
          <div className="flex items-start gap-3">
            <span
              className="material-symbols-outlined text-[#60A5FA]"
              style={{ fontSize: '20px', lineHeight: 1 }}
            >
              hub
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">
                1 Active Campaign: {c.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
                {c.hypothesis}
              </p>
            </div>
            <a
              href="/case-management"
              className="flex shrink-0 items-center gap-1 rounded-md bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB]"
            >
              View Campaign
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '15px', lineHeight: 1 }}
              >
                arrow_forward
              </span>
            </a>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Site Health */}
        <section className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-5">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
            Site Health
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2D3748] bg-[#111827] text-left text-xs uppercase tracking-wide text-[#9CA3AF]">
                <th className="px-2 py-2 font-semibold">Site</th>
                <th className="py-2 text-center font-semibold">Open</th>
                <th className="py-2 text-center font-semibold">MTTA</th>
                <th className="py-2 text-center font-semibold">MTTR</th>
                <th className="py-2 text-center font-semibold">SLA</th>
                <th className="px-2 py-2 text-right font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody>
              {SITE_ROWS.map((r) => (
                <tr key={r.site} className="border-b border-[#2D3748] last:border-0">
                  <td className="px-2 py-2.5 font-medium text-white">{r.site}</td>
                  <td className="py-2.5 text-center text-[#CBD5E0]">{r.open}</td>
                  <td className="py-2.5 text-center text-[#CBD5E0]">{r.mtta}</td>
                  <td className="py-2.5 text-center text-[#CBD5E0]">{r.mttr}</td>
                  <td className="py-2.5 text-center">
                    {r.sla && (
                      <span
                        className="material-symbols-outlined text-[#22C55E]"
                        style={{ fontSize: '18px', lineHeight: 1 }}
                      >
                        check_circle
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <span
                      className="inline-flex items-center justify-end gap-1 text-xs font-semibold"
                      style={{ color: r.riskColor }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '12px', lineHeight: 1, fontVariationSettings: "'FILL' 1" }}
                      >
                        circle
                      </span>
                      {r.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* AI Quality */}
        <section className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
            AI Quality
          </h2>
          <div className="space-y-3">
            {AI_BARS.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-[#CBD5E0]">{b.label}</span>
                  <span className="font-semibold text-white">{b.pct}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#0F1117]">
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
      <section className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">
          External Risk
        </h2>
        <div className="space-y-3">
          {EXTERNAL_SIGNALS.map((sig) => {
            const sev = SIGNAL_SEV_STYLE[sig.severity] ?? SIGNAL_SEV_STYLE.low
            return (
              <div
                key={sig.id}
                className="flex items-start gap-3 rounded-lg border border-[#2D3748] bg-[#111827] p-3"
              >
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{ backgroundColor: sev.bg, color: sev.text }}
                >
                  {sig.severity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {sig.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#9CA3AF]">
                    {sig.description}
                  </p>
                  <p className="mt-1 text-[11px] text-[#6B7280]">
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
