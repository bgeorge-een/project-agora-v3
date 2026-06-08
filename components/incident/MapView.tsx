'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { Site } from '@/lib/types'
import { SITES, EXTERNAL_SIGNALS } from '@/lib/mock-data/scenarios'

const RISK_COLOR: Record<Site['riskLevel'], string> = {
  critical: '#EF4444',
  high: '#D97706',
  medium: '#9CA3AF',
  low: '#6B7280',
}

function MapSkeleton() {
  return (
    <div
      className="flex items-center justify-center rounded-xl border border-[#273142] bg-[#0B0E14]"
      style={{ height: 560 }}
    >
      <div className="flex flex-col items-center gap-3 text-[#6B7280]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2D3748] border-t-[#38BDF8]" />
        <span className="text-xs font-medium">Loading operations map…</span>
      </div>
    </div>
  )
}

const MapWithNoSSR = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

export default function MapView() {
  const [activeSite, setActiveSite] = useState<string | null>('site-austin')
  const [showSignals, setShowSignals] = useState(true)

  const selected = SITES.find((s) => s.id === activeSite) ?? null
  const totalOpen = SITES.reduce((n, s) => n + s.openIncidents, 0)

  return (
    <div className="space-y-4 bg-[#0F1117]">
      {/* Top stats bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-[#273142] bg-[#171D29] px-4 py-3 text-sm">
        <span className="font-semibold text-white">{SITES.length} Sites</span>
        <span className="text-[#6B7280]">·</span>
        <span className="text-[#CBD5E0]">
          <span className="font-semibold text-[#FCA5A5]">{totalOpen}</span> open
          Incidents
        </span>
        <span className="text-[#6B7280]">·</span>
        <span className="text-[#CBD5E0]">
          <span className="font-semibold text-[#CBD5E0]">
            {EXTERNAL_SIGNALS.length}
          </span>{' '}
          external signals
        </span>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs font-medium text-[#CBD5E0]">
          <input
            type="checkbox"
            checked={showSignals}
            onChange={(e) => setShowSignals(e.target.checked)}
            className="h-3.5 w-3.5 accent-[#2563EB]"
          />
          External Signals overlay
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        {/* Map */}
        <div
          className="relative min-h-[500px] overflow-hidden rounded-xl border border-[#273142]"
          style={{ backgroundColor: '#0B0E14' }}
        >
          <MapWithNoSSR
            activeSite={activeSite}
            onSelectSite={setActiveSite}
            showSignals={showSignals}
          />
        </div>

        {/* Site detail panel */}
        <div className="space-y-3">
          {selected ? (
            <div className="rounded-xl border border-[#273142] bg-[#171D29] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  {selected.name}
                </h3>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    backgroundColor: `${RISK_COLOR[selected.riskLevel]}33`,
                    color: RISK_COLOR[selected.riskLevel],
                  }}
                >
                  {selected.riskLevel} risk
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">
                {selected.city}, {selected.state}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-[#111827] py-2">
                  <dt className="text-xs text-[#6B7280]">
                    Open Incidents
                  </dt>
                  <dd className="text-lg font-bold text-[#F87171]">
                    {selected.openIncidents}
                  </dd>
                </div>
                <div className="rounded-lg bg-[#111827] py-2">
                  <dt className="text-xs text-[#6B7280]">
                    Active Alerts
                  </dt>
                  <dd className="text-lg font-bold text-[#E5E7EB]">
                    {selected.activeAlerts}
                  </dd>
                </div>
                <div className="rounded-lg bg-[#111827] py-2">
                  <dt className="text-xs text-[#6B7280]">
                    Offline Devices
                  </dt>
                  <dd className="text-lg font-bold text-white">
                    {selected.offlineDevices}
                  </dd>
                </div>
                <div className="rounded-lg bg-[#111827] py-2">
                  <dt className="text-xs text-[#6B7280]">
                    Ext. Signals
                  </dt>
                  <dd className="text-lg font-bold text-[#E5E7EB]">
                    {selected.externalSignals}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-xl border border-[#273142] bg-[#171D29] p-4 text-center text-xs text-[#9CA3AF]">
              Click a site pin to view details.
            </div>
          )}

          {/* Active signals affecting selected site */}
          {selected && (
            <div className="rounded-xl border border-[#273142] bg-[#171D29] p-4">
              <h4 className="mb-2 text-sm font-semibold text-white">
                External Signals
              </h4>
              <div className="space-y-2">
                {EXTERNAL_SIGNALS.filter((s) =>
                  s.affectedSiteIds.includes(selected.id)
                ).map((sig) => (
                  <div
                    key={sig.id}
                    className="rounded-lg border border-[#273142] bg-[#111827] p-2"
                    style={{
                      borderLeft: `3px solid ${
                        sig.severity === 'high' ? '#EF4444' : '#F59E0B'
                      }`,
                    }}
                  >
                    <p className="text-xs font-semibold text-white">
                      {sig.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#9CA3AF]">
                      {sig.source} · {sig.timeHorizon}
                    </p>
                  </div>
                ))}
                {EXTERNAL_SIGNALS.filter((s) =>
                  s.affectedSiteIds.includes(selected.id)
                ).length === 0 && (
                  <p className="text-xs text-[#6B7280]">
                    No active external signals.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
