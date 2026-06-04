'use client'

import { useState } from 'react'
import type { Site } from '@/lib/types'
import { SITES, EXTERNAL_SIGNALS } from '@/lib/mock-data/scenarios'

// Texas bounding box (approximate) for projecting lat/lng onto the SVG viewport.
const BOUNDS = { minLng: -106.7, maxLng: -93.5, minLat: 25.8, maxLat: 36.6 }
const VIEW = { w: 700, h: 560 }

function project(lat: number, lng: number): { x: number; y: number } {
  const x =
    ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * VIEW.w
  const y =
    ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * VIEW.h
  return { x, y }
}

const RISK_COLOR: Record<Site['riskLevel'], string> = {
  critical: '#EF4444',
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#22C55E',
}

// Simplified Texas silhouette (hand-tuned to the viewbox).
const TEXAS_PATH =
  'M120,70 L300,70 L300,40 L360,40 L360,70 L520,70 L520,150 L590,210 L600,300 ' +
  'L560,330 L540,400 L500,430 L470,500 L430,520 L410,470 L360,450 L300,470 ' +
  'L250,440 L210,460 L150,430 L120,360 L70,330 L60,250 L100,200 Z'

export default function MapView() {
  const [activeSite, setActiveSite] = useState<string | null>('site-austin')
  const [showSignals, setShowSignals] = useState(true)

  const selected = SITES.find((s) => s.id === activeSite) ?? null
  const totalOpen = SITES.reduce((n, s) => n + s.openIncidents, 0)

  return (
    <div className="space-y-4 bg-[#0F1117]">
      {/* Top stats bar */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-[#2D3748] bg-[#1A1F2E] px-4 py-3 text-sm">
        <span className="font-semibold text-white">
          {SITES.length} Sites
        </span>
        <span className="text-[#6B7280]">·</span>
        <span className="text-[#CBD5E0]">
          <span className="font-semibold text-[#F87171]">{totalOpen}</span> Open
          Incidents
        </span>
        <span className="text-[#6B7280]">·</span>
        <span className="text-[#CBD5E0]">
          <span className="font-semibold text-[#FBBF24]">
            {EXTERNAL_SIGNALS.length}
          </span>{' '}
          External Signals Active
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
          className="relative overflow-hidden rounded-xl"
          style={{ backgroundColor: '#172130' }}
        >
          <svg
            viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* subtle grid */}
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M40 0 L0 0 0 40"
                  fill="none"
                  stroke="#22324A"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width={VIEW.w} height={VIEW.h} fill="url(#grid)" />

            {/* Texas outline */}
            <path
              d={TEXAS_PATH}
              fill="#1E2D42"
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />

            {/* External signal radius circles */}
            {showSignals &&
              EXTERNAL_SIGNALS.flatMap((sig) =>
                sig.affectedSiteIds.map((sid) => {
                  const site = SITES.find((s) => s.id === sid)
                  if (!site) return null
                  const { x, y } = project(site.lat, site.lng)
                  const r = (sig.radiusKm ?? 6) * 4 + 26
                  const color =
                    sig.severity === 'high' ? '#EF4444' : '#F59E0B'
                  return (
                    <circle
                      key={`${sig.id}-${sid}`}
                      cx={x}
                      cy={y}
                      r={r}
                      fill={color}
                      fillOpacity="0.08"
                      stroke={color}
                      strokeOpacity="0.4"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  )
                })
              )}

            {/* Site pins */}
            {SITES.map((site) => {
              const { x, y } = project(site.lat, site.lng)
              const color = RISK_COLOR[site.riskLevel]
              const isActive = activeSite === site.id
              return (
                <g
                  key={site.id}
                  className="cursor-pointer"
                  onClick={() => setActiveSite(site.id)}
                >
                  {isActive && (
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill={color}
                      fillOpacity="0.2"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r="14"
                    fill={color}
                    fillOpacity="0.25"
                  >
                    <animate
                      attributeName="r"
                      values="9;16;9"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="fill-opacity"
                      values="0.3;0;0.3"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={color}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x + 11}
                    y={y + 4}
                    fill="#CED7E2"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {site.name}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 rounded-lg bg-black/40 px-3 py-2 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-[#CED7E2]">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#EF4444]" />
                Critical/High
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                Low
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full border border-dashed border-[#F59E0B]" />
                External signal
              </span>
            </div>
          </div>
        </div>

        {/* Site detail panel */}
        <div className="space-y-3">
          {selected ? (
            <div className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-4">
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
                <div className="rounded-lg bg-[#0F1117] py-2">
                  <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                    Open Incidents
                  </dt>
                  <dd className="text-lg font-bold text-[#F87171]">
                    {selected.openIncidents}
                  </dd>
                </div>
                <div className="rounded-lg bg-[#0F1117] py-2">
                  <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                    Active Alerts
                  </dt>
                  <dd className="text-lg font-bold text-[#FBBF24]">
                    {selected.activeAlerts}
                  </dd>
                </div>
                <div className="rounded-lg bg-[#0F1117] py-2">
                  <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                    Offline Devices
                  </dt>
                  <dd className="text-lg font-bold text-white">
                    {selected.offlineDevices}
                  </dd>
                </div>
                <div className="rounded-lg bg-[#0F1117] py-2">
                  <dt className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                    Ext. Signals
                  </dt>
                  <dd className="text-lg font-bold text-[#A78BFA]">
                    {selected.externalSignals}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-4 text-center text-xs text-[#9CA3AF]">
              Click a site pin to view details.
            </div>
          )}

          {/* Active signals affecting selected site */}
          {selected && (
            <div className="rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-4">
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-white">
                External Signals
              </h4>
              <div className="space-y-2">
                {EXTERNAL_SIGNALS.filter((s) =>
                  s.affectedSiteIds.includes(selected.id)
                ).map((sig) => (
                  <div
                    key={sig.id}
                    className="rounded-lg border border-[#2D3748] bg-[#111827] p-2"
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
