'use client'

import dynamic from 'next/dynamic'
import type { Alert } from '@/lib/types'
import type {
  MapDevice,
  MapFloorPlan,
  MapLayerPreset,
  MapPanelSelection,
} from './mapOperationsData'

const FloorPlanLeaflet = dynamic(
  () => import('./FloorPlanLeaflet').then((mod) => mod.FloorPlanLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[460px] items-center justify-center rounded-xl border border-[#273142] bg-[#0B0E14]">
        <div className="flex flex-col items-center gap-3 text-[#94A3B8]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2D3748] border-t-[#38BDF8]" />
          <span className="text-sm font-medium">Loading indoor floor plan...</span>
        </div>
      </div>
    ),
  }
)

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
  return (
    <FloorPlanLeaflet
      floorPlan={floorPlan}
      devices={devices}
      incidents={incidents}
      selection={selection}
      layerPreset={layerPreset}
      onSelectDevice={onSelectDevice}
      onOpenLiveView={onOpenLiveView}
      onSelectIncident={onSelectIncident}
    />
  )
}
