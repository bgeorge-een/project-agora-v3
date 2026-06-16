'use client'

import { useState } from 'react'
import ResponseView from '@/components/incident/ResponseView'
import SupervisorView from '@/components/incident/SupervisorView'
import MonitorView from '@/components/incident/MonitorView'
import MapView from '@/components/incident/MapView'
import InsightsView from '@/components/incident/InsightsView'
import { MOCK_ALERTS } from '@/lib/mock-data/scenarios'

type ViewTab = 'response' | 'supervisor' | 'monitor' | 'map' | 'insights'

const TABS: { id: ViewTab; label: string }[] = [
  { id: 'response', label: 'Response View' },
  { id: 'supervisor', label: 'Supervisor View' },
  { id: 'monitor', label: 'Monitor View' },
  { id: 'map', label: 'Map View' },
  { id: 'insights', label: 'Insights' },
]

const SITES = ['Austin HQ', 'Dallas Office', 'Cedar Park Warehouse']

export default function IncidentManagementPage() {
  const [tab, setTab] = useState<ViewTab>('response')
  const [site, setSite] = useState('Austin HQ')
  const [highContrast, setHighContrast] = useState(false)
  const siteAlerts = MOCK_ALERTS.filter((alert) => alert.siteName === site)
  const criticalCount = siteAlerts.filter((alert) => alert.severity === 'critical').length
  const highCount = siteAlerts.filter((alert) => alert.severity === 'high').length
  const enrichingCount = siteAlerts.filter((alert) => alert.status === 'enriching').length
  const slaRiskCount = site === 'Austin HQ' ? 2 : site === 'Cedar Park Warehouse' ? 1 : 0
  const unassignedCriticalCount = site === 'Austin HQ' ? 1 : 0

  return (
    <div
      className={`min-h-screen ${highContrast ? 'soc-high-contrast bg-black' : 'bg-[#0F1117]'}`}
    >
      {/* Top bar */}
      <header
        className={`sticky top-0 z-20 border-b backdrop-blur-sm ${
          highContrast
            ? 'border-[#64748B] bg-black'
            : 'border-[#273142] bg-[#171D29]/95'
        }`}
      >
        <div className="flex flex-col gap-3 px-4 py-4 sm:px-5 xl:flex-row xl:items-center xl:px-6">
          <h1 className="min-w-0 text-lg font-semibold leading-tight text-white">
            Real-time Incident Management
          </h1>

          <div className="flex w-full flex-wrap items-center gap-2 xl:ml-auto xl:w-auto xl:justify-end">
            <div className="relative min-w-[180px] flex-1 sm:flex-none">
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                aria-label="Select facility location"
                className="w-full appearance-none rounded-lg border border-[#374151] bg-[#111827] py-2 pl-3 pr-8 text-sm font-medium text-[#CBD5E0] outline-none transition-colors hover:border-[#4B5563] focus:border-[#2563EB]"
              >
                {SITES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span
                className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                aria-hidden="true"
                style={{ fontSize: '18px', lineHeight: 1 }}
              >
                expand_more
              </span>
            </div>

            <span className="flex min-h-10 items-center gap-1.5 rounded-full border border-[#374151] px-3 text-xs font-medium text-[#CBD5E0]">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
              </span>
              Live
            </span>

            <button
              type="button"
              aria-pressed={highContrast}
              onClick={() => setHighContrast((value) => !value)}
              className={`min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors sm:min-h-12 ${
                highContrast
                  ? 'bg-white text-black'
                  : 'border border-[#374151] bg-[#111827] text-[#D1D5DB] hover:bg-[#1F2937]'
              }`}
            >
              High Contrast
            </button>
          </div>
        </div>

        <div className="border-t border-[#273142] px-4 py-3 sm:px-5 xl:px-6">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-[repeat(6,minmax(0,1fr))_auto]">
            {[
              { label: 'Open', value: siteAlerts.length, tone: '#E5E7EB' },
              { label: 'Critical', value: criticalCount, tone: '#FF453A' },
              { label: 'High', value: highCount, tone: '#FCD34D' },
              { label: 'Unassigned Critical', value: unassignedCriticalCount, tone: '#FFB4AE' },
              { label: 'SLA Risk', value: slaRiskCount, tone: '#FCD34D' },
              { label: 'Enriching', value: enrichingCount, tone: '#93C5FD' },
            ].map((metric) => (
              <div key={metric.label} className="rounded-lg border border-[#273142] bg-[#111827] px-3 py-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#94A3B8]">{metric.label}</p>
                <p className="mt-1 text-lg font-black leading-none" style={{ color: metric.tone }}>
                  {metric.value}
                </p>
              </div>
            ))}
            <div className="col-span-2 flex gap-2 md:col-span-4 xl:col-span-1 xl:justify-end">
              <button
                type="button"
                onClick={() => setTab('supervisor')}
                className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-bold transition-colors xl:flex-none ${
                  tab === 'supervisor'
                    ? 'bg-[#2563EB] text-white'
                    : 'border border-[#374151] bg-[#111827] text-[#D1D5DB] hover:bg-[#1F2937]'
                }`}
              >
                Supervisor
              </button>
              <button
                type="button"
                onClick={() => setTab('monitor')}
                className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-bold transition-colors xl:flex-none ${
                  tab === 'monitor'
                    ? 'bg-[#2563EB] text-white'
                    : 'border border-[#374151] bg-[#111827] text-[#D1D5DB] hover:bg-[#1F2937]'
                }`}
              >
                Monitor
              </button>
            </div>
          </div>
        </div>

        {/* View toggle tabs */}
        <div className="overflow-x-auto px-4 sm:px-5 xl:px-6" style={{ scrollbarGutter: 'stable' }}>
          <nav className="flex min-w-max gap-1" aria-label="Incident management views">
            {TABS.map((t) => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative min-h-[48px] shrink-0 px-4 py-3 text-sm font-semibold transition-colors sm:min-h-[52px] sm:px-5 ${
                    active
                      ? 'text-white'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  {t.label}
                  {active && (
                    <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-[#60A5FA]" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Active view */}
      <div className="px-3 py-4 sm:px-5 xl:px-6 xl:py-6">
        {tab === 'response' && <ResponseView highContrast={highContrast} />}
        {tab === 'supervisor' && <SupervisorView />}
        {tab === 'monitor' && <MonitorView />}
        {tab === 'map' && <MapView />}
        {tab === 'insights' && <InsightsView />}
      </div>
    </div>
  )
}
