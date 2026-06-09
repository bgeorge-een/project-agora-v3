'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Alert, Site } from '@/lib/types'
import { ALERT_DETAILS, EXTERNAL_SIGNALS, MOCK_ALERTS, SITES } from '@/lib/mock-data/scenarios'
import { FloorPlanView } from './FloorPlanView'
import { IncidentDetailDrawer } from './IncidentDetailDrawer'
import { MapSidePanel } from './MapSidePanel'
import {
  LAYER_PRESETS,
  REGIONS,
  ROLE_OPTIONS,
  defaultFloorPlanForSite,
  defaultScopeForRole,
  deviceById,
  devicesForFloorPlan,
  devicesForSite,
  floorPlanById,
  floorPlanIdForDevice,
  floorPlanIdForIncident,
  floorPlansForSite,
  incidentsForSite,
  incidentsForFloorPlan,
  siteById,
  type MapFloorPlan,
  type MapLayerPreset,
  type MapPanelSelection,
  type MapRole,
  type MapScope,
} from './mapOperationsData'

const RISK_COLOR: Record<Site['riskLevel'], string> = {
  critical: '#FF453A',
  high: '#F97316',
  medium: '#FCD34D',
  low: '#94A3B8',
}

function MapSkeleton() {
  return (
    <div
      className="flex h-full min-h-[460px] items-center justify-center rounded-xl border border-[#273142] bg-[#0B0E14]"
    >
      <div className="flex flex-col items-center gap-3 text-[#94A3B8]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2D3748] border-t-[#38BDF8]" />
        <span className="text-sm font-medium">Loading operations map…</span>
      </div>
    </div>
  )
}

const MapWithNoSSR = dynamic(() => import('./MapLeaflet'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function Breadcrumbs({
  scope,
  activeSite,
  selection,
  activeFloorPlan,
  onScope,
  onSelectSite,
}: {
  scope: MapScope
  activeSite: string | null
  selection: MapPanelSelection
  activeFloorPlan: MapFloorPlan | null
  onScope: (scope: MapScope) => void
  onSelectSite: (siteId: string) => void
}) {
  const site = siteById(activeSite)
  const selectedIncident = selection.mode === 'incident' ? MOCK_ALERTS.find((alert) => alert.id === selection.id) : null

  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Map hierarchy">
      <button
        type="button"
        onClick={() => onScope('global')}
        className="rounded-md px-2 py-1 font-semibold text-[#CBD5E1] hover:bg-[#1F2937] hover:text-white"
      >
        Global
      </button>
      <span className="text-[#64748B]">/</span>
      <button
        type="button"
        onClick={() => onScope('regional')}
        className="rounded-md px-2 py-1 font-semibold text-[#CBD5E1] hover:bg-[#1F2937] hover:text-white"
      >
        South Central
      </button>
      {site && (
        <>
          <span className="text-[#64748B]">/</span>
          <button
            type="button"
            onClick={() => onSelectSite(site.id)}
            className="rounded-md px-2 py-1 font-semibold text-[#CBD5E1] hover:bg-[#1F2937] hover:text-white"
          >
            {site.name}
          </button>
        </>
      )}
      {scope === 'floor' && activeFloorPlan && (
        <>
          <span className="text-[#64748B]">/</span>
          <span className="rounded-md bg-[#1F2937] px-2 py-1 font-bold text-white">
            {activeFloorPlan.floor}
          </span>
        </>
      )}
      {selectedIncident && (
        <>
          <span className="text-[#64748B]">/</span>
          <span className="rounded-md bg-[#1F2937] px-2 py-1 font-bold text-white">
            Incident
          </span>
        </>
      )}
    </nav>
  )
}

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone?: string
}) {
  return (
    <span className="flex min-h-8 items-center gap-2 rounded-md border border-[#273142] bg-[#111827] px-2.5 text-xs font-semibold text-[#CBD5E1]">
      <span className="text-[#94A3B8]">{label}</span>
      <span className="text-sm font-extrabold text-white" style={{ color: tone }}>
        {value}
      </span>
    </span>
  )
}

export default function MapView() {
  const [role, setRole] = useState<MapRole>('operator')
  const [scope, setScope] = useState<MapScope>('site')
  const [activeSite, setActiveSite] = useState<string | null>('site-austin')
  const [activeFloorPlanId, setActiveFloorPlanId] = useState<string>('austin-bldg-a-floor-3')
  const [layerPreset, setLayerPreset] = useState<MapLayerPreset>('response')
  const [selection, setSelection] = useState<MapPanelSelection>({ mode: 'site', id: 'site-austin' })
  const [reviewAlert, setReviewAlert] = useState<Alert | null>(null)

  const selectedRole = ROLE_OPTIONS.find((option) => option.id === role) ?? ROLE_OPTIONS[0]
  const selectedSite = siteById(activeSite)
  const totalOpen = SITES.reduce((count, site) => count + site.openIncidents, 0)
  const totalOffline = SITES.reduce((count, site) => count + site.offlineDevices, 0)
  const criticalAlert = MOCK_ALERTS.find((alert) => alert.severity === 'critical' && alert.status === 'ready')
  const floorPlanOptions = floorPlansForSite(activeSite)
  const activeFloorPlan =
    floorPlanById(activeFloorPlanId) ??
    defaultFloorPlanForSite(activeSite) ??
    defaultFloorPlanForSite('site-austin')
  const floorPlanDevices = activeFloorPlan ? devicesForFloorPlan(activeFloorPlan.id) : []
  const floorPlanIncidents = activeFloorPlan ? incidentsForFloorPlan(activeFloorPlan.id) : []

  const visibleIncidents = useMemo(() => {
    if (scope === 'global' || scope === 'regional' || !activeSite) {
      return MOCK_ALERTS
    }
    return incidentsForSite(activeSite)
  }, [activeSite, scope])

  const visibleDevices = useMemo(() => {
    if (!activeSite || (scope !== 'site' && scope !== 'floor')) return []
    const devices = devicesForSite(activeSite)
    if (layerPreset === 'health') return devices.filter((device) => device.status !== 'online')
    if (layerPreset === 'response') return devices.filter((device) => device.linkedIncidentIds.length > 0)
    if (layerPreset === 'external') return []
    return devices
  }, [activeSite, layerPreset, scope])

  const showSignals = layerPreset === 'external' || layerPreset === 'response'
  const showIncidents = layerPreset === 'response' || layerPreset === 'investigation'
  const showDevices = (layerPreset === 'health' || layerPreset === 'response' || layerPreset === 'investigation') && visibleDevices.length > 0
  const oldestActive = formatElapsed(Math.max(...MOCK_ALERTS.map((alert) => alert.ageSeconds)))

  function floorPlanForSelection(nextScope: MapScope, nextSiteId: string | null = activeSite) {
    if (nextScope !== 'floor') return null
    if (selection.mode === 'device' || selection.mode === 'live-view') {
      return floorPlanById(floorPlanIdForDevice(selection.id)) ?? defaultFloorPlanForSite(nextSiteId)
    }
    if (selection.mode === 'incident') {
      return floorPlanById(floorPlanIdForIncident(selection.id)) ?? defaultFloorPlanForSite(nextSiteId)
    }
    return defaultFloorPlanForSite(nextSiteId)
  }

  function activateFloorPlan(floorPlanId: string | null) {
    const plan = floorPlanById(floorPlanId)
    if (!plan) return
    setActiveFloorPlanId(plan.id)
    setActiveSite(plan.siteId)
  }

  function selectRole(nextRole: MapRole) {
    const nextScope = defaultScopeForRole(nextRole)
    setRole(nextRole)
    setScope(nextScope)
    if (nextScope === 'global' || nextScope === 'regional') {
      setSelection({ mode: 'region', id: REGIONS[0].id })
      return
    }
    const siteId = activeSite ?? 'site-austin'
    setActiveSite(siteId)
    activateFloorPlan(defaultFloorPlanForSite(siteId)?.id ?? null)
    setSelection({ mode: 'site', id: siteId })
  }

  function selectScope(nextScope: MapScope) {
    setScope(nextScope)
    if (nextScope === 'global' || nextScope === 'regional') {
      setSelection({ mode: 'region', id: REGIONS[0].id })
      return
    }
    const siteId = activeSite ?? 'site-austin'
    setActiveSite(siteId)
    if (nextScope === 'floor') {
      activateFloorPlan(floorPlanForSelection(nextScope, siteId)?.id ?? null)
      if (selection.mode === 'region' || selection.mode === 'site' || selection.mode === 'camera-wall') {
        setSelection({ mode: 'site', id: siteId })
      }
      return
    }
    setSelection({ mode: 'site', id: siteId })
  }

  function selectSite(siteId: string) {
    setActiveSite(siteId)
    setScope('site')
    activateFloorPlan(defaultFloorPlanForSite(siteId)?.id ?? null)
    setSelection({ mode: 'site', id: siteId })
  }

  function selectDevice(deviceId: string) {
    const device = deviceById(deviceId)
    if (device) setActiveSite(device.siteId)
    activateFloorPlan(floorPlanIdForDevice(deviceId))
    setScope('floor')
    setSelection({ mode: 'device', id: deviceId })
  }

  function selectIncident(alertId: string) {
    const alert = MOCK_ALERTS.find((item) => item.id === alertId)
    if (alert) setActiveSite(alert.siteId)
    activateFloorPlan(floorPlanIdForIncident(alertId))
    setScope('floor')
    setSelection({ mode: 'incident', id: alertId })
  }

  function showCameraWall(siteId: string) {
    setActiveSite(siteId)
    setScope('site')
    setSelection({ mode: 'camera-wall', id: siteId })
  }

  function openLiveView(deviceId: string) {
    const device = deviceById(deviceId)
    if (device) setActiveSite(device.siteId)
    activateFloorPlan(floorPlanIdForDevice(deviceId))
    setScope('floor')
    setSelection({ mode: 'live-view', id: deviceId })
  }

  function selectFloorPlan(floorPlanId: string) {
    const plan = floorPlanById(floorPlanId)
    if (!plan) return
    setActiveFloorPlanId(plan.id)
    setActiveSite(plan.siteId)
    setScope('floor')
    setSelection({ mode: 'site', id: plan.siteId })
  }

  function returnToCritical() {
    if (!criticalAlert) return
    selectIncident(criticalAlert.id)
  }

  function handleReviewIncident(alert: Alert) {
    setReviewAlert(alert)
  }

  return (
    <div className="space-y-3 bg-[#0F1117]">
      <div className="rounded-xl border border-[#273142] bg-[#171D29] px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="mr-1 text-base font-bold text-white">Operations Map</h2>
          <div className="min-w-0 flex-1">
            <Breadcrumbs
              scope={scope}
              activeSite={activeSite}
              selection={selection}
              activeFloorPlan={activeFloorPlan}
              onScope={selectScope}
              onSelectSite={selectSite}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="map-role">
              Operating role
            </label>
            <select
              id="map-role"
              value={role}
              onChange={(event) => selectRole(event.target.value as MapRole)}
              className="min-h-10 rounded-lg border border-[#334155] bg-[#111827] px-3 text-sm font-bold text-[#E5E7EB] outline-none transition-colors hover:border-[#475569] focus:border-[#2563EB]"
              title={selectedRole.description}
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="map-scope">
              Map altitude
            </label>
            <select
              id="map-scope"
              value={scope}
              onChange={(event) => selectScope(event.target.value as MapScope)}
              className="min-h-10 rounded-lg border border-[#334155] bg-[#111827] px-3 text-sm font-bold capitalize text-[#E5E7EB] outline-none transition-colors hover:border-[#475569] focus:border-[#2563EB]"
            >
              {(['global', 'regional', 'site', 'floor'] as MapScope[]).map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            {scope === 'floor' && floorPlanOptions.length > 0 && (
              <>
                <label className="sr-only" htmlFor="map-floor">
                  Select floor plan
                </label>
                <select
                  id="map-floor"
                  value={activeFloorPlan?.id ?? ''}
                  onChange={(event) => selectFloorPlan(event.target.value)}
                  className="min-h-10 max-w-[220px] rounded-lg border border-[#334155] bg-[#111827] px-3 text-sm font-bold text-[#E5E7EB] outline-none transition-colors hover:border-[#475569] focus:border-[#2563EB]"
                >
                  {floorPlanOptions.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.building} · {plan.floor}
                    </option>
                  ))}
                </select>
              </>
            )}

            <label className="sr-only" htmlFor="map-layer">
              Map layer
            </label>
            <select
              id="map-layer"
              value={layerPreset}
              onChange={(event) => setLayerPreset(event.target.value as MapLayerPreset)}
              className="min-h-10 rounded-lg border border-[#334155] bg-[#111827] px-3 text-sm font-bold text-[#E5E7EB] outline-none transition-colors hover:border-[#475569] focus:border-[#2563EB]"
            >
              {LAYER_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>

            <SummaryChip label="Sites" value={SITES.length} />
            <SummaryChip label="Open" value={totalOpen} tone="#FCA5A5" />
            <SummaryChip label="Oldest" value={oldestActive} />
            <SummaryChip label="Offline" value={totalOffline} tone={totalOffline ? '#FFB4AE' : undefined} />
            {selectedSite && (
              <SummaryChip
                label={selectedSite.name}
                value={`${selectedSite.riskLevel} risk`}
                tone={RISK_COLOR[selectedSite.riskLevel]}
              />
            )}

            {criticalAlert && (
              <button
                type="button"
                onClick={returnToCritical}
                className="flex min-h-10 items-center gap-1.5 rounded-lg bg-[#FF453A] px-3 text-sm font-extrabold text-black transition-all hover:bg-[#FF6B61] active:scale-[0.98]"
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: '18px', lineHeight: 1 }}
                >
                  my_location
                </span>
                Return to Critical
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:h-[calc(100vh-230px)] xl:min-h-[560px] xl:max-h-[840px] xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="relative h-[62vh] min-h-[460px] overflow-hidden rounded-xl border border-[#273142] bg-[#0B0E14] xl:h-full xl:min-h-0">
          {scope === 'floor' && activeFloorPlan ? (
            <FloorPlanView
              floorPlan={activeFloorPlan}
              devices={floorPlanDevices}
              incidents={floorPlanIncidents}
              selection={selection}
              layerPreset={layerPreset}
              onSelectDevice={selectDevice}
              onOpenLiveView={openLiveView}
              onSelectIncident={selectIncident}
            />
          ) : (
            <>
              <MapWithNoSSR
                sites={SITES}
                signals={EXTERNAL_SIGNALS}
                devices={visibleDevices}
                incidents={visibleIncidents}
                activeSite={activeSite}
                selection={selection}
                scope={scope}
                layerPreset={layerPreset}
                showSignals={showSignals}
                showDevices={showDevices}
                showIncidents={showIncidents}
                onSelectSite={selectSite}
                onSelectDevice={selectDevice}
                onSelectIncident={selectIncident}
              />
              <div className="absolute right-3 top-3 z-[1000] max-w-[320px] rounded-lg border border-[#334155] bg-black/70 px-3 py-2 text-xs leading-[1.5] text-[#CBD5E1] backdrop-blur">
                <span className="font-bold text-white">{LAYER_PRESETS.find((preset) => preset.id === layerPreset)?.label}</span>
                {' '}layer · {scope} altitude
              </div>
            </>
          )}
        </div>

        <MapSidePanel
          selection={selection}
          onSelectSite={selectSite}
          onSelectDevice={selectDevice}
          onSelectIncident={selectIncident}
          onShowCameraWall={showCameraWall}
          onOpenLiveView={openLiveView}
          onReviewIncident={handleReviewIncident}
        />
      </div>

      {reviewAlert && ALERT_DETAILS[reviewAlert.id] && (
        <IncidentDetailDrawer
          alert={reviewAlert}
          detail={ALERT_DETAILS[reviewAlert.id]}
          onClose={() => setReviewAlert(null)}
          onAccept={() => setReviewAlert(null)}
          onOverride={() => setReviewAlert(null)}
        />
      )}
    </div>
  )
}
