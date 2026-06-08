'use client'

import type { Entity, EntityType } from '@/lib/types'
import { ENTITIES } from '@/lib/mock-data/scenarios'

interface GraphNode {
  entity: Entity | null
  // synthetic node fallback (e.g. campaign) when not in ENTITIES
  id: string
  label: string
  type: EntityType | 'campaign'
  x: number // percent
  y: number // percent
  risk: 'low' | 'medium' | 'high'
  isCenter?: boolean
}

interface GraphEdge {
  from: string
  to: string
  label: string
}

const ENTITY_ICON: Record<EntityType | 'campaign', string> = {
  person: 'badge',
  credential: 'key',
  vehicle: 'directions_car',
  door: 'door_front',
  camera: 'videocam',
  zone: 'location_on',
  sensor: 'sensors',
  campaign: 'hub',
}

function Icon({
  name,
  size = 18,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={`material-symbols-outlined ${className ?? ''}`}
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
    >
      {name}
    </span>
  )
}

function ent(id: string): Entity | undefined {
  return ENTITIES.find((e) => e.id === id)
}

const NODES: GraphNode[] = [
  {
    id: 'ent-marcus',
    entity: ent('ent-marcus') ?? null,
    label: 'Marcus Webb',
    type: 'person',
    x: 50,
    y: 48,
    risk: 'high',
    isCenter: true,
  },
  {
    id: 'ent-badge-b4421',
    entity: ent('ent-badge-b4421') ?? null,
    label: 'Badge B-4421',
    type: 'credential',
    x: 18,
    y: 20,
    risk: 'high',
  },
  {
    id: 'ent-door-srv',
    entity: ent('ent-door-srv') ?? null,
    label: 'Server Room 2B Door',
    type: 'door',
    x: 82,
    y: 22,
    risk: 'high',
  },
  {
    id: 'ent-cam-c4',
    entity: ent('ent-cam-c4') ?? null,
    label: 'Camera C4',
    type: 'camera',
    x: 84,
    y: 78,
    risk: 'medium',
  },
  {
    id: 'campaign-001',
    entity: null,
    label: 'Campaign HXT-7291',
    type: 'campaign',
    x: 16,
    y: 80,
    risk: 'high',
  },
]

const EDGES: GraphEdge[] = [
  { from: 'ent-marcus', to: 'ent-badge-b4421', label: 'holds' },
  { from: 'ent-marcus', to: 'ent-door-srv', label: 'accessed (denied)' },
  { from: 'ent-marcus', to: 'ent-cam-c4', label: 'monitored by' },
  { from: 'ent-marcus', to: 'campaign-001', label: 'linked to' },
]

// Dark node fills per risk level
const RISK_FILL: Record<'low' | 'medium' | 'high', string> = {
  high: '#181010',
  medium: '#171D29',
  low: '#171D29',
}

const RISK_RING: Record<'low' | 'medium' | 'high', string> = {
  high: '#EF4444',
  medium: '#64748B',
  low: '#4B5563',
}

const RISK_GLOW: Record<'low' | 'medium' | 'high', string> = {
  high: 'none',
  medium: 'none',
  low: 'none',
}

export default function EntityGraph({
  selectedEntity,
  onSelect,
}: {
  selectedEntity: Entity | null
  onSelect: (e: Entity | null) => void
}) {
  function nodeById(id: string) {
    return NODES.find((n) => n.id === id)!
  }

  function handleClick(node: GraphNode) {
    if (node.entity) {
      onSelect(selectedEntity?.id === node.entity.id ? null : node.entity)
    } else {
      onSelect(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
      {/* Graph canvas */}
      <div className="relative h-[420px] overflow-hidden rounded-xl border border-[#273142] bg-[#111827]">
        {/* Edges */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          {EDGES.map((edge) => {
            const a = nodeById(edge.from)
            const b = nodeById(edge.to)
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={`${a.x}%`}
                  y1={`${a.y}%`}
                  x2={`${b.x}%`}
                  y2={`${b.y}%`}
                  stroke="#374151"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <foreignObject
                  x={`${mx - 9}%`}
                  y={`${my - 3}%`}
                  width="18%"
                  height="6%"
                  style={{ overflow: 'visible' }}
                >
                  <div className="flex justify-center">
                    <span className="rounded-full bg-[#111827] px-2 py-0.5 text-[10px] font-medium text-[#9CA3AF] ring-1 ring-[#273142]">
                      {edge.label}
                    </span>
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>

        {/* Nodes */}
        {NODES.map((node) => {
          const active =
            node.entity != null && selectedEntity?.id === node.entity.id
          return (
            <button
              key={node.id}
              onClick={() => handleClick(node)}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 focus:outline-none"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <span
                className={`flex items-center justify-center rounded-full text-[#CBD5E0] transition-transform hover:scale-105 ${
                  node.isCenter ? 'h-16 w-16' : 'h-12 w-12'
                } ${active ? 'scale-110' : ''}`}
                style={{
                  backgroundColor: RISK_FILL[node.risk],
                  boxShadow: RISK_GLOW[node.risk],
                  border: `2px solid ${active ? '#A78BFA' : RISK_RING[node.risk]}`,
                }}
              >
                <Icon name={ENTITY_ICON[node.type]} size={node.isCenter ? 28 : 20} />
              </span>
              <span
                className="max-w-[110px] rounded-md bg-[#171D29]/95 px-1.5 py-0.5 text-center text-xs font-semibold leading-tight text-white"
              >
                {node.label}
              </span>
            </button>
          )
        })}

        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[9px] text-[#6B7280]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#EF4444]" /> High risk
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#64748B]" /> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#4B5563]" /> Low
          </span>
        </div>
      </div>

      {/* Detail panel */}
      <div className="rounded-xl border border-[#273142] bg-[#171D29] p-4">
        {selectedEntity ? (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111827] text-[#9CA3AF] ring-1 ring-[#273142]">
                <Icon name={ENTITY_ICON[selectedEntity.type]} size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {selectedEntity.label}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-[#6B7280]">
                  {selectedEntity.type}
                </p>
              </div>
            </div>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">Site</dt>
                <dd className="font-medium text-[#CBD5E0]">
                  {selectedEntity.siteId}
                </dd>
              </div>
              {selectedEntity.zoneId && (
                <div className="flex justify-between gap-2">
                  <dt className="text-[#6B7280]">Zone</dt>
                  <dd className="font-medium text-[#CBD5E0]">
                    {selectedEntity.zoneId}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-[#6B7280]">Risk</dt>
                <dd
                  className="font-bold uppercase"
                  style={{ color: RISK_RING[selectedEntity.riskLevel] }}
                >
                  {selectedEntity.riskLevel}
                </dd>
              </div>
              {Object.entries(selectedEntity.metadata).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2">
                  <dt className="capitalize text-[#6B7280]">{k}</dt>
                  <dd className="font-medium text-[#CBD5E0]">{v}</dd>
                </div>
              ))}
              {Object.keys(selectedEntity.metadata).length === 0 && (
                <p className="text-[11px] italic text-[#6B7280]">
                  No additional metadata on file.
                </p>
              )}
            </dl>
          </div>
        ) : (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
            <Icon name="hub" size={28} className="text-[#6B7280]" />
            <p className="mt-2 text-xs font-semibold text-white">Click a node</p>
            <p className="mt-1 text-[11px] text-[#9CA3AF]">
              Select any entity in the graph to inspect its details and risk
              profile.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
