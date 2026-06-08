'use client'

import { useState } from 'react'
import ResponseView from '@/components/incident/ResponseView'
import MonitorView from '@/components/incident/MonitorView'
import MapView from '@/components/incident/MapView'
import InsightsView from '@/components/incident/InsightsView'

type ViewTab = 'response' | 'monitor' | 'map' | 'insights'

const TABS: { id: ViewTab; label: string }[] = [
  { id: 'response', label: 'Response View' },
  { id: 'monitor', label: 'Monitor View' },
  { id: 'map', label: 'Map View' },
  { id: 'insights', label: 'Insights' },
]

const SITES = ['Austin HQ', 'Dallas Office', 'Cedar Park Warehouse']

export default function IncidentManagementPage() {
  const [tab, setTab] = useState<ViewTab>('response')
  const [site, setSite] = useState('Austin HQ')

  return (
    <div className="min-h-screen bg-[#0F1117]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[#273142] bg-[#171D29]/95 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-4 px-6 py-4">
          <h1 className="text-lg font-semibold text-white">
            Real-time Incident Management
          </h1>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                aria-label="Select facility location"
                className="appearance-none rounded-lg border border-[#374151] bg-[#111827] py-1.5 pl-3 pr-8 text-sm font-medium text-[#CBD5E0] outline-none transition-colors hover:border-[#4B5563] focus:border-[#2563EB]"
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

            <span className="flex items-center gap-1.5 rounded-full border border-[#374151] px-2.5 py-1 text-xs font-medium text-[#CBD5E0]">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
              </span>
              Live
            </span>
          </div>
        </div>

        {/* View toggle tabs */}
        <nav className="flex gap-1 px-6">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#60A5FA]" />
                )}
              </button>
            )
          })}
        </nav>
      </header>

      {/* Active view */}
      <div className="px-6 py-6">
        {tab === 'response' && <ResponseView />}
        {tab === 'monitor' && <MonitorView />}
        {tab === 'map' && <MapView />}
        {tab === 'insights' && <InsightsView />}
      </div>
    </div>
  )
}
