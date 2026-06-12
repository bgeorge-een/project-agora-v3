'use client'

import { useState } from 'react'
import ResponseView from '@/components/incident/ResponseView'
import SupervisorView from '@/components/incident/SupervisorView'
import MonitorView from '@/components/incident/MonitorView'
import MapView from '@/components/incident/MapView'
import InsightsView from '@/components/incident/InsightsView'

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
