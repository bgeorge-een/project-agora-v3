'use client'

import type { KeyboardEvent } from 'react'
import type { Alert, Severity } from '@/lib/types'
import {
  incidentFloorPosition,
  type MapDevice,
  type MapFloorPlan,
  type MapLayerPreset,
  type MapPanelSelection,
} from './mapOperationsData'

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

const DEVICE_LABEL: Record<MapDevice['kind'], string> = {
  camera: 'C',
  access: 'D',
  sensor: 'S',
}

const STATUS_RING: Record<MapDevice['status'], string> = {
  online: '#22C55E',
  degraded: '#FCD34D',
  offline: '#FF453A',
}

const ZONE_STYLE: Record<MapFloorPlan['zones'][number]['kind'], { fill: string; stroke: string }> = {
  room: { fill: '#111827', stroke: '#334155' },
  corridor: { fill: '#182235', stroke: '#475569' },
  lobby: { fill: '#102437', stroke: '#2563EB' },
  parking: { fill: '#151B26', stroke: '#475569' },
  restricted: { fill: '#2A1215', stroke: '#FF453A' },
  service: { fill: '#1F2937', stroke: '#64748B' },
}

function handleActivation(event: KeyboardEvent<SVGGElement>, onActivate: () => void) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  onActivate()
}

function polygonPoints(device: MapDevice) {
  return device.coveragePolygon?.map((point) => `${point.x},${point.y}`).join(' ') ?? ''
}

export function FloorPlanView({
  floorPlan,
  devices,
  incidents,
  selection,
  layerPreset,
  onSelectDevice,
  onOpenLiveView,
  onSelectIncident,
}: {
  floorPlan: MapFloorPlan
  devices: MapDevice[]
  incidents: Alert[]
  selection: MapPanelSelection
  layerPreset: MapLayerPreset
  onSelectDevice: (id: string) => void
  onOpenLiveView: (id: string) => void
  onSelectIncident: (id: string) => void
}) {
  const showCoverage = layerPreset === 'response' || layerPreset === 'investigation'
  const showHealthOnly = layerPreset === 'health'
  const visibleDevices =
    layerPreset === 'external'
      ? []
      : showHealthOnly
        ? devices.filter((device) => device.status !== 'online' || device.healthEvents?.length)
        : devices
  const visibleIncidents = layerPreset === 'response' || layerPreset === 'investigation' ? incidents : []

  return (
    <div className="relative flex h-full min-h-[460px] flex-col overflow-hidden rounded-xl bg-[#0B0E14]">
      <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[460px] rounded-lg border border-[#334155] bg-black/70 px-3 py-2 text-sm text-[#CBD5E1] backdrop-blur">
        <p className="font-bold text-white">{floorPlan.label}</p>
        <p className="mt-0.5 text-xs font-semibold text-[#94A3B8]">
          Indoor floor plan · click cameras for live view
        </p>
      </div>

      <svg
        role="group"
        aria-label={`${floorPlan.label} indoor operations floor plan`}
        viewBox={`0 0 ${floorPlan.dimensions.width} ${floorPlan.dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        <style>{`
          .floor-plan-target:focus .focus-ring {
            opacity: 1;
          }
        `}</style>
        <defs>
          <pattern id={`floor-grid-${floorPlan.id}`} width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 4 0 L 0 0 0 4" fill="none" stroke="#1F2937" strokeWidth="0.18" />
          </pattern>
          <filter id={`critical-glow-${floorPlan.id}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="100" height="64" fill="#0F1117" />
        <rect width="100" height="64" fill={`url(#floor-grid-${floorPlan.id})`} opacity="0.85" />

        {floorPlan.zones.map((zone) => {
          const style = ZONE_STYLE[zone.kind]
          return (
            <g key={zone.id}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                rx="1.2"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={zone.kind === 'restricted' ? 0.8 : 0.45}
                opacity={zone.kind === 'restricted' ? 0.96 : 0.9}
              />
              <text
                x={zone.x + 1.4}
                y={zone.y + 3.2}
                fill={zone.kind === 'restricted' ? '#FFB4AE' : '#CBD5E1'}
                fontSize="1.9"
                fontWeight="700"
              >
                {zone.label}
              </text>
            </g>
          )
        })}

        {showCoverage &&
          visibleDevices
            .filter((device) => device.kind === 'camera' && device.coveragePolygon?.length)
            .map((device) => (
              <polygon
                key={`${device.id}-coverage`}
                points={polygonPoints(device)}
                fill="#38BDF8"
                fillOpacity="0.11"
                stroke="#38BDF8"
                strokeWidth="0.35"
                strokeDasharray="1.2 0.9"
              />
            ))}

        {visibleIncidents.map((incident) => {
          const position = incidentFloorPosition(incident.id)
          if (!position) return null
          const selected = selection.mode === 'incident' && selection.id === incident.id
          const color = SEVERITY_COLOR[incident.severity]
          return (
            <g
              key={incident.id}
              role="button"
              tabIndex={0}
              aria-label={`Open incident ${incident.title}`}
              onClick={() => onSelectIncident(incident.id)}
              onKeyDown={(event) => handleActivation(event, () => onSelectIncident(incident.id))}
              className="floor-plan-target cursor-pointer"
              filter={incident.severity === 'critical' ? `url(#critical-glow-${floorPlan.id})` : undefined}
            >
              <title>{`Open incident ${incident.title}`}</title>
              <circle className="focus-ring" cx={position.x + 5.2} cy={position.y - 4.8} r="5.2" fill="none" stroke="#FFFFFF" strokeWidth="0.7" opacity="0" />
              <circle cx={position.x + 5.2} cy={position.y - 4.8} r={selected ? 3.1 : 2.6} fill={color} />
              <circle cx={position.x + 5.2} cy={position.y - 4.8} r={selected ? 4.2 : 3.5} fill="none" stroke={color} strokeWidth="0.55" />
              <text
                x={position.x + 5.2}
                y={position.y - 3.8}
                textAnchor="middle"
                fill={incident.severity === 'critical' ? '#111827' : '#0B0E14'}
                fontSize="3.8"
                fontWeight="900"
              >
                !
              </text>
            </g>
          )
        })}

        {visibleDevices.map((device) => {
          if (!device.floorPosition) return null
          const selected = selection.id === device.id && (selection.mode === 'device' || selection.mode === 'live-view')
          const onActivate = () => {
            if (device.kind === 'camera' && device.status !== 'offline') {
              onOpenLiveView(device.id)
              return
            }
            onSelectDevice(device.id)
          }

          return (
            <g
              key={device.id}
              role="button"
              tabIndex={0}
              aria-label={`${device.kind === 'camera' ? 'Open live view for' : 'Open details for'} ${device.name}`}
              onClick={onActivate}
              onKeyDown={(event) => handleActivation(event, onActivate)}
              className="floor-plan-target cursor-pointer"
            >
              <title>
                {`${device.kind === 'camera' && device.status !== 'offline' ? 'Open live view for' : 'Open details for'} ${device.name}`}
              </title>
              <circle
                className="focus-ring"
                cx={device.floorPosition.x}
                cy={device.floorPosition.y}
                r="4.4"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="0.65"
                opacity="0"
              />
              <circle
                cx={device.floorPosition.x}
                cy={device.floorPosition.y}
                r={selected ? 3.5 : 2.9}
                fill="#0B0E14"
                stroke={selected ? '#FFFFFF' : STATUS_RING[device.status]}
                strokeWidth={selected ? 0.85 : 0.6}
              />
              <circle
                cx={device.floorPosition.x}
                cy={device.floorPosition.y}
                r="2.1"
                fill={DEVICE_COLOR[device.kind]}
                opacity={device.status === 'offline' ? 0.55 : 1}
              />
              <text
                x={device.floorPosition.x}
                y={device.floorPosition.y + 0.95}
                textAnchor="middle"
                fill="#06111F"
                fontSize="2.7"
                fontWeight="900"
              >
                {DEVICE_LABEL[device.kind]}
              </text>
              {device.healthEvents?.length ? (
                <circle cx={device.floorPosition.x + 2.4} cy={device.floorPosition.y - 2.4} r="1.1" fill="#FCD34D" />
              ) : null}
            </g>
          )
        })}
      </svg>

      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 rounded-lg border border-[#273142] bg-black/75 px-3 py-2 text-xs font-bold text-[#CBD5E1] backdrop-blur">
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

      <div className="absolute right-3 top-3 z-10 rounded-lg border border-[#334155] bg-black/70 px-3 py-2 text-xs font-bold text-[#E5E7EB] backdrop-blur">
        {visibleDevices.length} devices · {visibleIncidents.length} incidents
      </div>

      {layerPreset === 'external' && (
        <div className="absolute inset-x-4 bottom-16 z-10 rounded-lg border border-[#334155] bg-[#111827]/95 p-3 text-sm leading-[1.5] text-[#CBD5E1] shadow-xl">
          External risk is monitored at site, regional, and global altitude. Switch altitude to see public-safety, weather, traffic, and civil context around this facility.
        </div>
      )}
    </div>
  )
}
