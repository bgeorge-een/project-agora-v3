'use client'

import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { Alert, ExternalContextSignal, Site } from '@/lib/types'
import {
  deviceById,
  linkedDevicesForIncident,
  regionById,
  siteById,
  type MapDevice,
  type MapLayerPreset,
  type MapPanelSelection,
  type MapScope,
} from './mapOperationsData'

// Leaflet's default marker icons reference image assets that 404 under bundlers.
// We only ever use L.divIcon, so neutralize the defaults to avoid broken images.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
})

const SITE_RISK_COLOR: Record<Site['riskLevel'], string> = {
  critical: '#FF453A',
  high: '#F97316',
  medium: '#FCD34D',
  low: '#94A3B8',
}

const SEVERITY_COLOR: Record<Alert['severity'], string> = {
  critical: '#FF453A',
  high: '#F97316',
  medium: '#FCD34D',
  low: '#94A3B8',
}

const DEVICE_COLOR: Record<MapDevice['status'], string> = {
  online: '#38BDF8',
  degraded: '#FCD34D',
  offline: '#FF453A',
}

const DEVICE_ICON: Record<MapDevice['kind'], string> = {
  camera: 'videocam',
  access: 'door_front',
  sensor: 'sensors',
}

const SCOPE_ZOOM: Record<MapScope, number> = {
  global: 4,
  regional: 7,
  site: 14,
  floor: 16,
}

function markerHtml({
  color,
  icon,
  count,
  selected,
  pulse,
}: {
  color: string
  icon: string
  count?: number
  selected?: boolean
  pulse?: boolean
}) {
  const ring = pulse
    ? `<div style="position:absolute;inset:0;border-radius:9999px;background:${color};opacity:0.20;animation:agora-pulse 2s infinite"></div>`
    : ''
  const badge =
    count && count > 0
      ? `<div style="position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;border-radius:9999px;background:#FF453A;color:#000;font-size:10px;font-weight:900;line-height:18px;text-align:center;box-shadow:0 0 0 2px #0B0E14">${count}</div>`
      : ''

  return `
    <div style="position:relative;width:42px;height:42px">
      ${ring}
      <div style="position:absolute;inset:5px;display:flex;align-items:center;justify-content:center;border-radius:9999px;background:#111827;border:${selected ? '3px' : '2px'} solid ${selected ? '#FFFFFF' : color};box-shadow:0 0 0 3px rgba(15,17,23,0.8), 0 0 18px ${color}55;color:${color}">
        <span class="material-symbols-outlined" style="font-size:19px;line-height:1">${icon}</span>
      </div>
      ${badge}
    </div>
  `
}

function buildSiteIcon(site: Site, selected: boolean): L.DivIcon {
  const color = SITE_RISK_COLOR[site.riskLevel]
  return L.divIcon({
    html: markerHtml({
      color,
      icon: 'location_city',
      count: site.openIncidents,
      selected,
      pulse: site.riskLevel === 'critical' || site.riskLevel === 'high',
    }),
    className: 'agora-map-marker',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    tooltipAnchor: [0, -20],
  })
}

function buildDeviceIcon(device: MapDevice, selected: boolean): L.DivIcon {
  const color = DEVICE_COLOR[device.status]
  return L.divIcon({
    html: markerHtml({
      color,
      icon: DEVICE_ICON[device.kind],
      selected,
      pulse: device.status === 'offline',
    }),
    className: 'agora-map-marker',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    tooltipAnchor: [0, -20],
  })
}

function buildIncidentIcon(alert: Alert, selected: boolean): L.DivIcon {
  const color = SEVERITY_COLOR[alert.severity]
  return L.divIcon({
    html: markerHtml({
      color,
      icon: alert.type === 'deterrent' ? 'shield' : 'priority_high',
      selected,
      pulse: alert.severity === 'critical',
    }),
    className: 'agora-map-marker',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    tooltipAnchor: [0, -20],
  })
}

function incidentPosition(alert: Alert): [number, number] {
  const linkedDevice = linkedDevicesForIncident(alert.id)[0]
  if (linkedDevice) return [linkedDevice.lat, linkedDevice.lng]

  const site = siteById(alert.siteId)
  if (!site) return [31.0, -97.5]

  const offset = Number(alert.id.replace(/\D/g, '').slice(-2) || 1) * 0.00035
  return [site.lat + offset, site.lng - offset]
}

function scopeCenter(scope: MapScope, activeSite: string | null, selected: MapPanelSelection): [number, number] {
  if (selected.mode === 'device' || selected.mode === 'live-view') {
    const device = deviceById(selected.id)
    if (device) return [device.lat, device.lng]
  }

  if (selected.mode === 'incident') {
    const fakeAlert = { id: selected.id, siteId: activeSite ?? '' } as Alert
    const linkedDevice = linkedDevicesForIncident(fakeAlert.id)[0]
    if (linkedDevice) return [linkedDevice.lat, linkedDevice.lng]
  }

  if ((scope === 'site' || scope === 'floor') && activeSite) {
    const site = siteById(activeSite)
    if (site) return [site.lat, site.lng]
  }

  const region = regionById('region-south-central')
  if (scope === 'regional' && region) return [region.lat, region.lng]

  return [37.8, -96.0]
}

function MapViewport({
  scope,
  activeSite,
  selection,
}: {
  scope: MapScope
  activeSite: string | null
  selection: MapPanelSelection
}) {
  const map = useMap()
  const center = useMemo(() => scopeCenter(scope, activeSite, selection), [activeSite, scope, selection])

  useEffect(() => {
    map.setView(center, SCOPE_ZOOM[scope], { animate: true })
  }, [center, map, scope])

  return null
}

interface MapLeafletProps {
  sites: Site[]
  signals: ExternalContextSignal[]
  devices: MapDevice[]
  incidents: Alert[]
  activeSite: string | null
  selection: MapPanelSelection
  scope: MapScope
  layerPreset: MapLayerPreset
  showSignals: boolean
  showDevices: boolean
  showIncidents: boolean
  onSelectSite: (id: string) => void
  onSelectDevice: (id: string) => void
  onSelectIncident: (id: string) => void
}

export default function MapLeaflet({
  sites,
  signals,
  devices,
  incidents,
  activeSite,
  selection,
  scope,
  layerPreset,
  showSignals,
  showDevices,
  showIncidents,
  onSelectSite,
  onSelectDevice,
  onSelectIncident,
}: MapLeafletProps) {
  // Guard against any residual SSR rendering (dynamic import already sets ssr:false).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const visibleSites =
    scope === 'global' || scope === 'regional'
      ? sites
      : sites.filter((site) => site.id === activeSite)

  return (
    <div style={{ height: 620 }} className="relative">
      <style>{`
        @keyframes agora-pulse {
          0%   { transform: scale(0.7); opacity: 0.35; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .agora-map-marker { background: transparent !important; border: none !important; }
        .leaflet-container {
          background: #0B0E14;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .agora-tooltip {
          background: #151B26 !important;
          color: #E2E8F0 !important;
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 20px rgba(0,0,0,0.55) !important;
          padding: 8px 10px !important;
          font-size: 12px !important;
          white-space: nowrap;
        }
        .agora-tooltip::before { display: none !important; }
        .leaflet-control-attribution {
          background: rgba(15,17,23,0.7) !important;
          color: #94A3B8 !important;
        }
        .leaflet-control-attribution a { color: #94A3B8 !important; }
        .leaflet-bar a {
          background: #151B26 !important;
          color: #CBD5E1 !important;
          border-bottom-color: #334155 !important;
        }
        .leaflet-bar a:hover { background: #1F2937 !important; }
      `}</style>

      <MapContainer
        center={scopeCenter(scope, activeSite, selection)}
        zoom={SCOPE_ZOOM[scope]}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', borderRadius: 12 }}
      >
        <MapViewport scope={scope} activeSite={activeSite} selection={selection} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap contributors © CARTO"
        />

        {showSignals &&
          signals.flatMap((signal) => {
            const color = signal.severity === 'high' || signal.severity === 'critical' ? '#FF453A' : '#FCD34D'
            const radiusM = (signal.radiusKm ?? 5) * 1000
            return signal.affectedSiteIds.map((siteId) => {
              const site = siteById(siteId)
              if (!site) return null
              return (
                <Circle
                  key={`${signal.id}-${siteId}`}
                  center={[site.lat, site.lng]}
                  radius={radiusM}
                  pathOptions={{
                    color,
                    weight: 1,
                    fillColor: color,
                    fillOpacity: layerPreset === 'external' ? 0.1 : 0.05,
                    dashArray: '4 4',
                  }}
                />
              )
            })
          })}

        {visibleSites.map((site) => (
          <Marker
            key={site.id}
            position={[site.lat, site.lng]}
            icon={buildSiteIcon(site, selection.mode === 'site' && selection.id === site.id)}
            zIndexOffset={selection.mode === 'site' && selection.id === site.id ? 1000 : 0}
            eventHandlers={{ click: () => onSelectSite(site.id) }}
          >
            <Tooltip direction="top" opacity={1} className="agora-tooltip">
              <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{site.name}</div>
              <div style={{ marginTop: 4, color: '#CBD5E1' }}>
                {site.openIncidents} incidents · {site.activeAlerts} alerts ·{' '}
                <span
                  style={{
                    color: SITE_RISK_COLOR[site.riskLevel],
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {site.riskLevel}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {showIncidents &&
          incidents.map((alert) => {
            const position = incidentPosition(alert)
            return (
              <Marker
                key={alert.id}
                position={position}
                icon={buildIncidentIcon(alert, selection.mode === 'incident' && selection.id === alert.id)}
                zIndexOffset={1500}
                eventHandlers={{ click: () => onSelectIncident(alert.id) }}
              >
                <Tooltip direction="top" opacity={1} className="agora-tooltip">
                  <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{alert.title}</div>
                  <div style={{ marginTop: 4, color: '#CBD5E1' }}>
                    {alert.location} ·{' '}
                    <span style={{ color: SEVERITY_COLOR[alert.severity], fontWeight: 800 }}>
                      {alert.severity}
                    </span>
                  </div>
                </Tooltip>
              </Marker>
            )
          })}

        {showDevices &&
          devices.map((device) => (
            <Marker
              key={device.id}
              position={[device.lat, device.lng]}
              icon={buildDeviceIcon(
                device,
                (selection.mode === 'device' || selection.mode === 'live-view') && selection.id === device.id
              )}
              zIndexOffset={device.kind === 'camera' ? 900 : 800}
              eventHandlers={{ click: () => onSelectDevice(device.id) }}
            >
              <Tooltip direction="top" opacity={1} className="agora-tooltip">
                <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{device.name}</div>
                <div style={{ marginTop: 4, color: '#CBD5E1' }}>
                  {device.floor} · {device.zone} ·{' '}
                  <span style={{ color: DEVICE_COLOR[device.status], fontWeight: 800 }}>
                    {device.status}
                  </span>
                </div>
              </Tooltip>
            </Marker>
          ))}
      </MapContainer>

      <div
        className="absolute bottom-3 left-3 z-[1000] max-w-[calc(100%-24px)] rounded-lg bg-black/70 px-3 py-2 backdrop-blur-sm"
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#CBD5E1]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#FF453A]" />
            Critical incident
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
            Device
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#FCD34D]" />
            Degraded
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full border border-dashed border-[#FCD34D]" />
            External risk
          </span>
        </div>
      </div>
    </div>
  )
}
