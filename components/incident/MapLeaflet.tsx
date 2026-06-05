'use client'

import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Tooltip, Circle } from 'react-leaflet'
import type { Site } from '@/lib/types'
import { SITES, EXTERNAL_SIGNALS } from '@/lib/mock-data/scenarios'

// Leaflet's default marker icons reference image assets that 404 under bundlers.
// We only ever use L.divIcon, so neutralize the defaults to avoid broken images.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
})

const RISK_COLOR: Record<Site['riskLevel'], string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#22C55E',
}

const RISK_PULSES: Record<Site['riskLevel'], boolean> = {
  critical: true,
  high: true,
  medium: false,
  low: false,
}

// Center on the Texas area so all three sites are visible.
const INITIAL_CENTER: [number, number] = [31.0, -97.5]
const INITIAL_ZOOM = 6

function buildSiteIcon(site: Site): L.DivIcon {
  const color = RISK_COLOR[site.riskLevel]
  const pulse = RISK_PULSES[site.riskLevel]
  const count = site.openIncidents

  const pulseRing = pulse
    ? `<div style="position:absolute;top:50%;left:50%;width:40px;height:40px;border-radius:50%;background:${color};opacity:0.25;transform:translate(-50%,-50%);animation:agora-pulse 2s infinite"></div>`
    : ''

  const badge =
    count > 0
      ? `<div style="position:absolute;top:0;right:0;background:#EF4444;color:white;border-radius:9999px;font-size:9px;font-weight:700;line-height:12px;padding:1px 4px;min-width:14px;text-align:center;box-shadow:0 0 0 1px rgba(0,0,0,0.4)">${count}</div>`
      : ''

  const html = `
    <div style="position:relative;width:40px;height:40px">
      ${pulseRing}
      <div style="position:absolute;top:50%;left:50%;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;transform:translate(-50%,-50%);box-shadow:0 0 6px ${color}"></div>
      ${badge}
    </div>
  `

  return L.divIcon({
    html,
    className: 'agora-site-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    tooltipAnchor: [0, -16],
  })
}

interface MapLeafletProps {
  activeSite: string | null
  onSelectSite: (id: string) => void
  showSignals: boolean
}

export default function MapLeaflet({
  activeSite,
  onSelectSite,
  showSignals,
}: MapLeafletProps) {
  // Guard against any residual SSR rendering (dynamic import already sets ssr:false).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div style={{ height: 560 }} className="relative">
      {/* Marker pulse + base style injection */}
      <style>{`
        @keyframes agora-pulse {
          0%   { transform: translate(-50%,-50%) scale(0.6); opacity: 0.45; }
          70%  { transform: translate(-50%,-50%) scale(1.4); opacity: 0; }
          100% { transform: translate(-50%,-50%) scale(1.4); opacity: 0; }
        }
        .agora-site-marker { background: transparent !important; border: none !important; }
        .leaflet-container {
          background: #0B0E14;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .agora-tooltip {
          background: #1A1F2E !important;
          color: #E2E8F0 !important;
          border: 1px solid #2D3748 !important;
          border-radius: 8px !important;
          box-shadow: 0 6px 16px rgba(0,0,0,0.5) !important;
          padding: 6px 10px !important;
          font-size: 12px !important;
          white-space: nowrap;
        }
        .agora-tooltip::before { display: none !important; }
        .leaflet-control-attribution {
          background: rgba(15,17,23,0.7) !important;
          color: #6B7280 !important;
        }
        .leaflet-control-attribution a { color: #6B7280 !important; }
        .leaflet-bar a {
          background: #1A1F2E !important;
          color: #CBD5E0 !important;
          border-bottom-color: #2D3748 !important;
        }
        .leaflet-bar a:hover { background: #2D3748 !important; }
      `}</style>

      <MapContainer
        center={INITIAL_CENTER}
        zoom={INITIAL_ZOOM}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', borderRadius: 12 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap contributors © CARTO"
        />

        {/* External signal radius circles */}
        {showSignals &&
          EXTERNAL_SIGNALS.flatMap((sig) => {
            const color = sig.severity === 'high' ? '#EF4444' : '#F59E0B'
            const radiusM = (sig.radiusKm ?? 5) * 1000
            return sig.affectedSiteIds.map((sid) => {
              const site = SITES.find((s) => s.id === sid)
              if (!site) return null
              return (
                <Circle
                  key={`${sig.id}-${sid}`}
                  center={[site.lat, site.lng]}
                  radius={radiusM}
                  pathOptions={{
                    color,
                    weight: 1,
                    fillColor: color,
                    fillOpacity: 0.06,
                    dashArray: '4 4',
                  }}
                />
              )
            })
          })}

        {/* Site pins */}
        {SITES.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lng]}
            icon={buildSiteIcon(site)}
            zIndexOffset={activeSite === site.id ? 1000 : 0}
            eventHandlers={{ click: () => onSelectSite(site.id) }}
          >
            <Tooltip direction="top" opacity={1} className="agora-tooltip">
              <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{site.name}</div>
              <div style={{ marginTop: 2, color: '#9CA3AF' }}>
                {site.openIncidents} incident
                {site.openIncidents === 1 ? '' : 's'} · {site.activeAlerts} alert
                {site.activeAlerts === 1 ? '' : 's'} ·{' '}
                <span
                  style={{
                    color: RISK_COLOR[site.riskLevel],
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {site.riskLevel} risk
                </span>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend overlay */}
      <div
        className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-black/60 px-3 py-2 backdrop-blur-sm"
        style={{ pointerEvents: 'none' }}
      >
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
            External Signal
          </span>
        </div>
      </div>
    </div>
  )
}
