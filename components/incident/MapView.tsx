'use client'

import { useMemo, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import type { Alert, Site } from '@/lib/types'
import { ALERT_DETAILS, EXTERNAL_SIGNALS, MOCK_ALERTS, SITES } from '@/lib/mock-data/scenarios'
import { IncidentDetailDrawer } from './IncidentDetailDrawer'
import { MapSidePanel } from './MapSidePanel'
import {
  LAYER_PRESETS,
  REGIONS,
  ROLE_OPTIONS,
  defaultScopeForRole,
  deviceById,
  devicesForSite,
  incidentsForSite,
  regionById,
  siteById,
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
      className="flex items-center justify-center rounded-xl border border-[#273142] bg-[#0B0E14]"
      style={{ height: 620 }}
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

function PillButton({
  selected,
  children,
  onClick,
  icon,
}: {
  selected: boolean
  children: ReactNode
  onClick: () => void
  icon?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-bold transition-all active:scale-[0.98] ${
        selected
          ? 'bg-[#2563EB] text-white'
          : 'border border-[#334155] bg-[#111827] text-[#CBD5E1] hover:bg-[#1F2937] hover:text-white'
      }`}
    >
      {icon && (
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{ fontSize: '18px', lineHeight: 1 }}
        >
          {icon}
        </span>
      )}
      {children}
    </button>
  )
}

function Breadcrumbs({
  scope,
  activeSite,
  selection,
  onScope,
  onSelectSite,
}: {
  scope: MapScope
  activeSite: string | null
  selection: MapPanelSelection
  onScope: (scope: MapScope) => void
  onSelectSite: (siteId: string) => void
}) {
  const site = siteById(activeSite)
  const selectedDevice = selection.mode === 'device' || selection.mode === 'live-view' ? deviceById(selection.id) : null
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
      {scope === 'floor' && selectedDevice && (
        <>
          <span className="text-[#64748B]">/</span>
          <span className="rounded-md bg-[#1F2937] px-2 py-1 font-bold text-white">
            {selectedDevice.floor}
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

export default function MapView() {
  const [role, setRole] = useState<MapRole>('operator')
  const [scope, setScope] = useState<MapScope>('site')
  const [activeSite, setActiveSite] = useState<string | null>('site-austin')
  const [layerPreset, setLayerPreset] = useState<MapLayerPreset>('response')
  const [selection, setSelection] = useState<MapPanelSelection>({ mode: 'site', id: 'site-austin' })
  const [reviewAlert, setReviewAlert] = useState<Alert | null>(null)

  const selectedRole = ROLE_OPTIONS.find((option) => option.id === role) ?? ROLE_OPTIONS[0]
  const selectedSite = siteById(activeSite)
  const totalOpen = SITES.reduce((count, site) => count + site.openIncidents, 0)
  const totalOffline = SITES.reduce((count, site) => count + site.offlineDevices, 0)
  const criticalAlert = MOCK_ALERTS.find((alert) => alert.severity === 'critical' && alert.status === 'ready')

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

  function selectRole(nextRole: MapRole) {
    const nextScope = defaultScopeForRole(nextRole)
    setRole(nextRole)
    setScope(nextScope)
    if (nextScope === 'global' || nextScope === 'regional') {
      setSelection({ mode: 'region', id: REGIONS[0].id })
      return
    }
    setActiveSite(activeSite ?? 'site-austin')
    setSelection({ mode: 'site', id: activeSite ?? 'site-austin' })
  }

  function selectScope(nextScope: MapScope) {
    setScope(nextScope)
    if (nextScope === 'global' || nextScope === 'regional') {
      setSelection({ mode: 'region', id: REGIONS[0].id })
      return
    }
    const siteId = activeSite ?? 'site-austin'
    setActiveSite(siteId)
    setSelection({ mode: 'site', id: siteId })
  }

  function selectSite(siteId: string) {
    setActiveSite(siteId)
    setScope('site')
    setSelection({ mode: 'site', id: siteId })
  }

  function selectDevice(deviceId: string) {
    const device = deviceById(deviceId)
    if (device) setActiveSite(device.siteId)
    setScope('floor')
    setSelection({ mode: 'device', id: deviceId })
  }

  function selectIncident(alertId: string) {
    const alert = MOCK_ALERTS.find((item) => item.id === alertId)
    if (alert) setActiveSite(alert.siteId)
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
    setScope('floor')
    setSelection({ mode: 'live-view', id: deviceId })
  }

  function returnToCritical() {
    if (!criticalAlert) return
    selectIncident(criticalAlert.id)
  }

  function handleReviewIncident(alert: Alert) {
    setReviewAlert(alert)
  }

  const selectedRegion = regionById(REGIONS[0].id)

  return (
    <div className="space-y-4 bg-[#0F1117]">
      <div className="rounded-xl border border-[#273142] bg-[#171D29] p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Operations Map</h2>
            <p className="mt-1 max-w-2xl text-sm leading-[1.5] text-[#CBD5E1]">
              Role-aware command view for regional posture, site operations, device health, cameras,
              and incident review.
            </p>
          </div>
          {criticalAlert && (
            <button
              type="button"
              onClick={returnToCritical}
              className="flex min-h-12 items-center gap-1.5 rounded-lg bg-[#FF453A] px-4 text-sm font-extrabold text-black transition-all hover:bg-[#FF6B61] active:scale-[0.98]"
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

        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Operating role
            </p>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((option) => (
                <PillButton
                  key={option.id}
                  selected={role === option.id}
                  onClick={() => selectRole(option.id)}
                >
                  {option.label}
                </PillButton>
              ))}
            </div>
            <p className="mt-2 text-sm text-[#CBD5E1]">{selectedRole.description}</p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
              Altitude
            </p>
            <div className="flex flex-wrap gap-2">
              {(['global', 'regional', 'site', 'floor'] as MapScope[]).map((level) => (
                <PillButton key={level} selected={scope === level} onClick={() => selectScope(level)}>
                  {level}
                </PillButton>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#273142] pt-4">
          <Breadcrumbs
            scope={scope}
            activeSite={activeSite}
            selection={selection}
            onScope={selectScope}
            onSelectSite={selectSite}
          />
          <div className="flex flex-wrap gap-2">
            {LAYER_PRESETS.map((preset) => (
              <PillButton
                key={preset.id}
                selected={layerPreset === preset.id}
                onClick={() => setLayerPreset(preset.id)}
                icon={preset.icon}
              >
                {preset.label}
              </PillButton>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-lg border border-[#273142] bg-[#171D29] p-4">
          <p className="text-xs font-semibold text-[#94A3B8]">Sites</p>
          <p className="mt-1 text-2xl font-bold text-white">{SITES.length}</p>
          <p className="mt-1 text-xs font-medium text-[#CBD5E1]">{selectedRegion?.label ?? 'Global estate'}</p>
        </div>
        <div className="rounded-lg border border-[#273142] bg-[#171D29] p-4">
          <p className="text-xs font-semibold text-[#94A3B8]">Open Incidents</p>
          <p className="mt-1 text-2xl font-bold text-[#FCA5A5]">{totalOpen}</p>
          <p className="mt-1 text-xs font-medium text-[#CBD5E1]">
            Oldest active {formatElapsed(Math.max(...MOCK_ALERTS.map((alert) => alert.ageSeconds)))}
          </p>
        </div>
        <div className="rounded-lg border border-[#273142] bg-[#171D29] p-4">
          <p className="text-xs font-semibold text-[#94A3B8]">Offline Devices</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalOffline}</p>
          <p className="mt-1 text-xs font-medium text-[#CBD5E1]">Camera and sensor coverage gaps</p>
        </div>
        <div className="rounded-lg border border-[#273142] bg-[#171D29] p-4">
          <p className="text-xs font-semibold text-[#94A3B8]">Selected Site</p>
          <p className="mt-1 truncate text-2xl font-bold text-white">{selectedSite?.name ?? 'Regional'}</p>
          {selectedSite && (
            <p className="mt-1 text-xs font-extrabold uppercase" style={{ color: RISK_COLOR[selectedSite.riskLevel] }}>
              {selectedSite.riskLevel} risk
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="relative overflow-hidden rounded-xl border border-[#273142] bg-[#0B0E14]">
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
