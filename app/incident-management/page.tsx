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
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-4 px-6 py-4">
          <h1 className="text-lg font-bold text-[#111827]">
            Real-time Incident Management
          </h1>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <select
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="appearance-none rounded-lg border border-[#D1D5DB] bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-[#374151] outline-none transition-colors hover:border-[#9CA3AF] focus:border-[#2563EB]"
              >
                {SITES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9CA3AF]">
                ▾
              </span>
            </div>

            <span className="flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#16A34A]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75" />
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
                    ? 'text-[#2563EB]'
                    : 'text-[#6B7280] hover:text-[#374151]'
                }`}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#2563EB]" />
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
