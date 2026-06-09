'use client'

import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { ImageOverlay, MapContainer, Marker, Polygon, Tooltip, useMap } from 'react-leaflet'
import type { Alert, Severity } from '@/lib/types'
import {
  devicesForFloorPlan,
  hasHealthEvents,
  incidentFloorPosition,
  incidentsForFloorPlan,
  type FloorPosition,
  type MapDevice,
  type MapFloorPlan,
  type MapLayerPreset,
  type MapPanelSelection,
} from './mapOperationsData'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '',
  iconUrl: '',
  shadowUrl: '',
})

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: '#FF453A',
  high: '#F97316',
  medium: '#FCD34D',
  low: '#94A3B8',
}

const DEVICE_COLOR: Record<MapDevice['kind'], string> = {
  camera: '#38BDF8',
  access: '#F97316',
  sensor: '#FCD34D',
}

const STATUS_RING: Record<MapDevice['status'], string> = {
  online: '#22C55E',
  degraded: '#FCD34D',
  offline: '#FF453A',
}

const DEVICE_ICON: Record<MapDevice['kind'], string> = {
  camera: 'videocam',
  access: 'door_front',
  sensor: 'sensors',
}

function toLatLng(floorPlan: MapFloorPlan, point: FloorPosition): [number, number] {
  return [floorPlan.dimensions.height - point.y, point.x]
}

function floorBounds(floorPlan: MapFloorPlan): L.LatLngBoundsExpression {
  return [
    [0, 0],
    [floorPlan.dimensions.height, floorPlan.dimensions.width],
  ]
}

function markerHtml({
  color,
  ring,
  icon,
  selected,
  pulse,
  label,
}: {
  color: string
  ring: string
  icon: string
  selected?: boolean
  pulse?: boolean
  label?: string
}) {
  const pulseRing = pulse
    ? `<div style="position:absolute;inset:0;border-radius:9999px;background:${ring};opacity:0.22;animation:floor-pulse 1.8s infinite"></div>`
    : ''
  const labelBadge = label
    ? `<div style="position:absolute;right:-5px;top:-5px;min-width:18px;height:18px;border-radius:9999px;background:#FF453A;color:#0B0E14;font-size:10px;font-weight:900;line-height:18px;text-align:center;box-shadow:0 0 0 2px #0B0E14">${label}</div>`
    : ''

  return `
    <div style="position:relative;width:42px;height:42px">
      ${pulseRing}
      <div style="position:absolute;inset:5px;display:flex;align-items:center;justify-content:center;border-radius:9999px;background:#0B0E14;border:${selected ? 3 : 2}px solid ${selected ? '#FFFFFF' : ring};box-shadow:0 0 0 3px rgba(15,17,23,0.75), 0 0 18px ${ring}55;color:${color}">
        <span class="material-symbols-outlined" style="font-size:19px;line-height:1">${icon}</span>
      </div>
      ${labelBadge}
    </div>
  `
}

function buildDeviceIcon(device: MapDevice, selected: boolean): L.DivIcon {
  return L.divIcon({
    html: markerHtml({
      color: DEVICE_COLOR[device.kind],
      ring: selected ? '#FFFFFF' : STATUS_RING[device.status],
      icon: DEVICE_ICON[device.kind],
      selected,
      pulse: device.status === 'offline' || Boolean(device.healthEvents?.length),
      label: device.healthEvents?.length ? '!' : undefined,
    }),
    className: 'floor-map-marker',
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
      ring: color,
      icon: alert.type === 'deterrent' ? 'shield' : 'priority_high',
      selected,
      pulse: alert.severity === 'critical',
    }),
    className: 'floor-map-marker',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    tooltipAnchor: [0, -20],
  })
}

function FloorViewport({ floorPlan }: { floorPlan: MapFloorPlan }) {
  const map = useMap()
  const bounds = useMemo(() => floorBounds(floorPlan), [floorPlan])

  useEffect(() => {
    map.fitBounds(bounds, { animate: false, padding: [24, 24] })
    map.setMaxBounds(bounds)
  }, [bounds, map])

  return null
}

export function FloorPlanLeaflet({
  floorPlan,
  devices,
  incidents,
  selection,
  layerPreset,
  onSelectDevice,
  onOpenLiveView,
  onSelectIncident,
  floorPlans,
  onSelectFloorPlan,
}: {
  floorPlan: MapFloorPlan
  devices: MapDevice[]
  incidents: Alert[]
  selection: MapPanelSelection
  layerPreset: MapLayerPreset
  onSelectDevice: (id: string) => void
  onOpenLiveView: (id: string) => void
  onSelectIncident: (id: string) => void
  floorPlans: MapFloorPlan[]
  onSelectFloorPlan: (floorPlanId: string) => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const bounds = useMemo(() => floorBounds(floorPlan), [floorPlan])
  const showCoverage = layerPreset === 'response' || layerPreset === 'investigation'
  const showHealthOnly = layerPreset === 'health'
  const visibleDevices =
    layerPreset === 'external'
      ? []
      : showHealthOnly
        ? devices.filter((device) => device.status !== 'online' || device.healthEvents?.length)
        : devices
  const visibleIncidents = layerPreset === 'response' || layerPreset === 'investigation' ? incidents : []

  if (!mounted) return null

  return (
    <div className="relative h-full min-h-[460px] overflow-hidden rounded-xl bg-[#0B0E14]">
      <style>{`
        @keyframes floor-pulse {
          0% { transform: scale(0.68); opacity: 0.34; }
          75% { transform: scale(1.55); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        .floor-map-marker { background: transparent !important; border: none !important; }
        .floor-map .leaflet-container {
          background: #05070A;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .floor-map .leaflet-image-layer {
          filter: drop-shadow(0 18px 32px rgba(0,0,0,0.45));
        }
        .floor-map-tooltip {
          background: #151B26 !important;
          color: #E2E8F0 !important;
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 20px rgba(0,0,0,0.55) !important;
          padding: 8px 10px !important;
          font-size: 12px !important;
          white-space: nowrap;
        }
        .floor-map-tooltip::before { display: none !important; }
        .floor-map .leaflet-control-attribution { display: none; }
        .floor-map .leaflet-bar a {
          background: #151B26 !important;
          color: #CBD5E1 !important;
          border-bottom-color: #334155 !important;
        }
        .floor-map .leaflet-bar a:hover { background: #1F2937 !important; }
      `}</style>

      <div className="floor-map h-full min-h-0">
        <MapContainer
          key={floorPlan.id}
          crs={L.CRS.Simple}
          bounds={bounds}
          maxBounds={bounds}
          minZoom={2}
          maxZoom={6}
          zoomSnap={0.25}
          zoomDelta={0.5}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', borderRadius: 12 }}
        >
          <FloorViewport floorPlan={floorPlan} />
          <ImageOverlay url={floorPlan.imageUrl} bounds={bounds} />

          {showCoverage &&
            visibleDevices
              .filter((device) => device.kind === 'camera' && device.coveragePolygon?.length)
              .map((device) => (
                <Polygon
                  key={`${device.id}-coverage`}
                  positions={device.coveragePolygon!.map((point) => toLatLng(floorPlan, point))}
                  pathOptions={{
                    color: '#38BDF8',
                    weight: 1,
                    fillColor: '#38BDF8',
                    fillOpacity: 0.1,
                    dashArray: '4 4',
                  }}
                />
              ))}

          {visibleIncidents.map((incident) => {
            const position = incidentFloorPosition(incident.id)
            if (!position) return null
            const selected = selection.mode === 'incident' && selection.id === incident.id
            return (
              <Marker
                key={incident.id}
                position={toLatLng(floorPlan, { x: position.x + 5.2, y: position.y - 4.8 })}
                icon={buildIncidentIcon(incident, selected)}
                title={`${incident.title}: ${incident.severity} at ${incident.location}`}
                zIndexOffset={1500}
                eventHandlers={{ click: () => onSelectIncident(incident.id) }}
              >
                <Tooltip direction="top" opacity={1} className="floor-map-tooltip">
                  <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{incident.title}</div>
                  <div style={{ marginTop: 4, color: '#CBD5E1' }}>
                    {incident.location} ·{' '}
                    <span style={{ color: SEVERITY_COLOR[incident.severity], fontWeight: 800 }}>
                      {incident.severity}
                    </span>
                  </div>
                </Tooltip>
              </Marker>
            )
          })}

          {visibleDevices.map((device) => {
            if (!device.floorPosition) return null
            const selected = selection.id === device.id && (selection.mode === 'device' || selection.mode === 'live-view')
            const actionLabel = device.kind === 'camera' && device.status !== 'offline' ? 'Open live view for' : 'Open details for'
            const onActivate = () => {
              if (device.kind === 'camera' && device.status !== 'offline') {
                onOpenLiveView(device.id)
                return
              }
              onSelectDevice(device.id)
            }

            return (
              <Marker
                key={device.id}
                position={toLatLng(floorPlan, device.floorPosition)}
                icon={buildDeviceIcon(device, selected)}
                title={`${actionLabel} ${device.name}: ${device.status}, ${device.zone}`}
                zIndexOffset={device.kind === 'camera' ? 900 : 800}
                eventHandlers={{ click: onActivate }}
              >
                <Tooltip direction="top" opacity={1} className="floor-map-tooltip">
                  <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{device.name}</div>
                  <div style={{ marginTop: 4, color: '#CBD5E1' }}>
                    {device.floor} · {device.zone} ·{' '}
                    <span style={{ color: STATUS_RING[device.status], fontWeight: 800 }}>
                      {device.status}
                    </span>
                  </div>
                </Tooltip>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      <div className="absolute left-4 top-4 z-[1000] w-[min(520px,calc(100%-32px))] rounded-lg border border-[#334155] bg-black/75 px-3 py-3 text-sm text-[#CBD5E1] shadow-xl backdrop-blur">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-[180px] flex-1">
            <p className="font-bold text-white">{floorPlan.label}</p>
            <p className="mt-0.5 text-xs font-semibold text-[#94A3B8]">
              Image floor plan · pan and zoom · click cameras for live view
            </p>
          </div>
          <div className="min-w-[180px]">
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wide text-[#94A3B8]" htmlFor="indoor-floor-selector">
              Floor
            </label>
            <select
              id="indoor-floor-selector"
              aria-label="Select indoor floor plan"
              value={floorPlan.id}
              onChange={(event) => onSelectFloorPlan(event.target.value)}
              className="min-h-10 w-full rounded-lg border border-[#475569] bg-[#111827] px-3 text-sm font-bold text-white outline-none transition-colors hover:border-[#64748B] focus:border-[#60A5FA]"
            >
              {floorPlans.map((plan) => {
                const incidentCount = incidentsForFloorPlan(plan.id).length
                const healthCount = devicesForFloorPlan(plan.id).filter(hasHealthEvents).length
                const suffix = [
                  incidentCount ? `${incidentCount} incident${incidentCount === 1 ? '' : 's'}` : null,
                  healthCount ? `${healthCount} attention` : null,
                ].filter(Boolean).join(' · ')
                return (
                  <option key={plan.id} value={plan.id}>
                    {plan.building} · {plan.floor}{suffix ? ` · ${suffix}` : ''}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {floorPlans.map((plan) => {
            const active = plan.id === floorPlan.id
            const incidentCount = incidentsForFloorPlan(plan.id).length
            const healthCount = devicesForFloorPlan(plan.id).filter(hasHealthEvents).length
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onSelectFloorPlan(plan.id)}
                className={`min-h-9 rounded-md border px-2.5 text-xs font-extrabold transition-colors ${
                  active
                    ? 'border-[#60A5FA] bg-[#1D4ED8] text-white'
                    : 'border-[#334155] bg-[#111827] text-[#CBD5E1] hover:border-[#64748B] hover:text-white'
                }`}
              >
                {plan.floor}
                {incidentCount > 0 && <span className="ml-1 text-[#FFB4AE]">{incidentCount}</span>}
                {healthCount > 0 && <span className="ml-1 text-[#FCD34D]">!</span>}
              </button>
            )
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute right-3 top-3 z-[1000] rounded-lg border border-[#334155] bg-black/70 px-3 py-2 text-xs font-bold text-[#E5E7EB] backdrop-blur">
        {visibleDevices.length} devices · {visibleIncidents.length} incidents
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] flex flex-wrap gap-2 rounded-lg border border-[#273142] bg-black/75 px-3 py-2 text-xs font-bold text-[#CBD5E1] backdrop-blur">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#38BDF8]" /> Camera
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F97316]" /> Door
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FCD34D]" /> Sensor
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF453A]" /> Incident
        </span>
      </div>

      {layerPreset === 'external' && (
        <div className="absolute inset-x-4 bottom-16 z-[1000] rounded-lg border border-[#334155] bg-[#111827]/95 p-3 text-sm leading-[1.5] text-[#CBD5E1] shadow-xl">
          External risk is monitored at site, regional, and global altitude. Switch altitude to see public-safety, weather, traffic, and civil context around this facility.
        </div>
      )}
    </div>
  )
}
