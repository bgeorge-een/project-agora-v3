'use client'

import type { ReactNode } from 'react'
import type { Alert, Severity, Site } from '@/lib/types'
import { EXTERNAL_SIGNALS, ALERT_DETAILS, MOCK_ALERTS, SITES } from '@/lib/mock-data/scenarios'
import { CameraStill } from './CameraStill'
import {
  camerasForSite,
  camerasForFloorPlan,
  deviceById,
  devicesForFloorPlan,
  devicesForSite,
  floorPlansForSite,
  incidentById,
  incidentsForSite,
  linkedDevicesForIncident,
  REGIONS,
  regionById,
  siteById,
  hasHealthEvents,
  type MapDevice,
  type MapPanelSelection,
} from './mapOperationsData'

const RISK_COLOR: Record<Site['riskLevel'], string> = {
  critical: '#FF453A',
  high: '#F97316',
  medium: '#FCD34D',
  low: '#94A3B8',
}

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: '#FF453A',
  high: '#F97316',
  medium: '#FCD34D',
  low: '#94A3B8',
}

const DEVICE_ICON: Record<MapDevice['kind'], string> = {
  camera: 'videocam',
  access: 'door_front',
  sensor: 'sensors',
}

const DEVICE_STATUS: Record<
  MapDevice['status'],
  { label: string; text: string; bg: string; border: string }
> = {
  online: { label: 'Online', text: '#86EFAC', bg: '#0C2714', border: '#166534' },
  degraded: { label: 'Degraded', text: '#FCD34D', bg: '#27200B', border: '#854D0E' },
  offline: { label: 'Offline', text: '#FFB4AE', bg: '#210A08', border: '#7F1D1D' },
}

const HEALTH_EVENT_STYLE = {
  warning: { text: '#FCD34D', bg: '#27200B', border: '#854D0E', icon: 'warning' },
  critical: { text: '#FF453A', bg: '#210A08', border: '#7F1D1D', icon: 'error' },
}

function PanelShell({
  title,
  eyebrow,
  icon,
  children,
}: {
  title: string
  eyebrow?: string
  icon: string
  children: ReactNode
}) {
  return (
    <aside className="flex h-full min-h-[460px] flex-col overflow-hidden rounded-xl border border-[#273142] bg-[#171D29]">
      <div className="border-b border-[#273142] p-4">
        <div className="flex items-start gap-3">
          <span
            className="material-symbols-outlined mt-0.5 text-[#38BDF8]"
            aria-hidden="true"
            style={{ fontSize: '22px', lineHeight: 1 }}
          >
            {icon}
          </span>
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-0.5 text-base font-bold leading-[1.4] text-white">
              {title}
            </h2>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4" style={{ scrollbarGutter: 'stable' }}>
        {children}
      </div>
    </aside>
  )
}

function StatGrid({
  stats,
}: {
  stats: Array<{ label: string; value: string | number; tone?: string }>
}) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-[#273142] bg-[#111827] px-3 py-2">
          <dt className="text-xs font-medium text-[#94A3B8]">{stat.label}</dt>
          <dd className="mt-1 text-lg font-bold text-white" style={{ color: stat.tone }}>
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function ActionButton({
  children,
  icon,
  onClick,
  variant = 'secondary',
  disabled = false,
}: {
  children: ReactNode
  icon?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}) {
  const className =
    variant === 'primary'
      ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
      : variant === 'danger'
        ? 'bg-[#FF453A] text-black hover:bg-[#FF6B61]'
        : 'border border-[#475569] text-[#E5E7EB] hover:bg-[#1F2937] hover:text-white'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
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

function DeviceStatusBadge({ status }: { status: MapDevice['status'] }) {
  const meta = DEVICE_STATUS[status]
  return (
    <span
      className="rounded-full border px-2.5 py-1 text-xs font-bold"
      style={{ backgroundColor: meta.bg, borderColor: meta.border, color: meta.text }}
    >
      {meta.label}
    </span>
  )
}

function HealthEventList({ device, compact = false }: { device: MapDevice; compact?: boolean }) {
  if (!device.healthEvents?.length) return null

  return (
    <div className={compact ? 'mt-2 space-y-1.5' : 'space-y-2'}>
      {device.healthEvents.map((event) => {
        const style = HEALTH_EVENT_STYLE[event.severity]
        return (
          <div
            key={event.id}
            className="rounded-md border px-2.5 py-2"
            style={{ backgroundColor: style.bg, borderColor: style.border }}
          >
            <div className="flex items-start gap-2">
              <span
                className="material-symbols-outlined mt-0.5"
                aria-hidden="true"
                style={{ color: style.text, fontSize: '16px', lineHeight: 1 }}
              >
                {style.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-[1.4]" style={{ color: style.text }}>
                  {event.label}
                </p>
                {!compact && (
                  <p className="mt-1 text-sm leading-[1.5] text-[#E5E7EB]">{event.detail}</p>
                )}
                <p className="mt-1 text-xs font-semibold text-[#CBD5E1]">Observed {event.observedAt}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DeviceRow({
  device,
  onSelectDevice,
  onOpenLiveView,
}: {
  device: MapDevice
  onSelectDevice: (id: string) => void
  onOpenLiveView: (id: string) => void
}) {
  return (
    <div className="w-full rounded-lg border border-[#273142] bg-[#111827] p-3">
      <div className="flex items-start gap-3">
        <span
          className="material-symbols-outlined mt-0.5 text-[#94A3B8]"
          aria-hidden="true"
          style={{ fontSize: '20px', lineHeight: 1 }}
        >
          {DEVICE_ICON[device.kind]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold leading-[1.4] text-white">{device.name}</p>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <DeviceStatusBadge status={device.status} />
              {device.healthEvents?.length ? (
                <span className="rounded-full border border-[#854D0E] bg-[#27200B] px-2 py-0.5 text-[11px] font-bold text-[#FCD34D]">
                  Health warning
                </span>
              ) : null}
            </div>
          </div>
          <p className="mt-1 text-sm leading-[1.5] text-[#CBD5E1]">
            {device.floor} · {device.zone}
          </p>
          <p className="mt-1 text-xs font-medium text-[#94A3B8]">
            Last heartbeat {device.lastHeartbeat}
          </p>
          {device.responseContext && !hasHealthEvents(device) && (
            <p className="mt-2 rounded-md border border-[#334155] bg-[#0F1117] px-2.5 py-2 text-sm leading-[1.5] text-[#CBD5E1]">
              {device.responseContext}
            </p>
          )}
          <HealthEventList device={device} compact />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ActionButton icon="info" onClick={() => onSelectDevice(device.id)}>
              Details
            </ActionButton>
            {device.kind === 'camera' && (
              <ActionButton
                icon="live_tv"
                onClick={() => onOpenLiveView(device.id)}
                variant="secondary"
                disabled={device.status === 'offline'}
              >
                Live View
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function IncidentCard({
  alert,
  onSelectIncident,
  onReviewIncident,
}: {
  alert: Alert
  onSelectIncident: (id: string) => void
  onReviewIncident: (alert: Alert) => void
}) {
  return (
    <div
      className="rounded-lg border border-[#273142] bg-[#111827] p-3"
      style={{ borderLeft: `4px solid ${SEVERITY_COLOR[alert.severity]}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold leading-[1.45] text-white">{alert.title}</p>
          <p className="mt-1 text-sm leading-[1.5] text-[#CBD5E1]">{alert.location}</p>
          <p className="mt-1 text-xs font-semibold text-[#94A3B8]">
            {alert.sources.length} sources · {alert.nba ? 'AI recommendation ready' : 'AI enriching'}
          </p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-extrabold"
          style={{ color: SEVERITY_COLOR[alert.severity], backgroundColor: `${SEVERITY_COLOR[alert.severity]}22` }}
        >
          {alert.severity}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ActionButton icon="visibility" onClick={() => onSelectIncident(alert.id)}>
          Preview
        </ActionButton>
        <ActionButton icon="rate_review" onClick={() => onReviewIncident(alert)} variant="primary">
          Review
        </ActionButton>
      </div>
    </div>
  )
}

function CameraTile({
  camera,
  onOpenLiveView,
}: {
  camera: MapDevice
  onOpenLiveView: (id: string) => void
}) {
  const live = camera.status !== 'offline'
  return (
    <button
      type="button"
      onClick={() => live && onOpenLiveView(camera.id)}
      disabled={!live}
      className="rounded-lg border border-[#273142] bg-[#111827] p-2 text-left transition-colors hover:border-[#475569] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <CameraStill
        channel={camera.channel ?? camera.name}
        sceneType={camera.sceneType ?? 'hallway'}
        location={camera.zone}
        timestamp={live ? 'LIVE' : 'OFFLINE'}
        className="aspect-video"
      />
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{camera.name}</p>
          <p className="truncate text-xs font-medium text-[#94A3B8]">{camera.floor}</p>
        </div>
        <DeviceStatusBadge status={camera.status} />
      </div>
    </button>
  )
}

function GlobalPanel({
  onSelectRegion,
  onSelectSite,
}: {
  onSelectRegion: (id: string) => void
  onSelectSite: (id: string) => void
}) {
  const totalOpen = MOCK_ALERTS.length
  const totalAlerts = SITES.reduce((total, site) => total + site.activeAlerts, 0)
  const totalOffline = SITES.reduce((total, site) => total + site.offlineDevices, 0)
  const criticalSites = SITES.filter((site) => site.riskLevel === 'critical' || site.riskLevel === 'high')
  const oldestCritical = MOCK_ALERTS
    .filter((alert) => alert.severity === 'critical')
    .sort((a, b) => b.ageSeconds - a.ageSeconds)[0]

  return (
    <PanelShell title="Global Command" eyebrow="Enterprise Operations" icon="public">
      <StatGrid
        stats={[
          { label: 'Regions', value: REGIONS.length },
          { label: 'Sites', value: SITES.length },
          { label: 'Open Incidents', value: totalOpen, tone: totalOpen ? '#FCA5A5' : undefined },
          { label: 'Offline Devices', value: totalOffline, tone: totalOffline ? '#FFB4AE' : undefined },
        ]}
      />

      <section>
        <h3 className="mb-2 text-sm font-bold text-white">Regional Posture</h3>
        <div className="space-y-2">
          {REGIONS.map((region) => {
            const sites = region.siteIds.map((siteId) => siteById(siteId)).filter(Boolean) as Site[]
            const open = sites.reduce((total, site) => total + incidentsForSite(site.id).length, 0)
            const active = sites.reduce((total, site) => total + site.activeAlerts, 0)
            const offline = sites.reduce((total, site) => total + site.offlineDevices, 0)
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => onSelectRegion(region.id)}
                className="w-full rounded-lg border border-[#273142] bg-[#111827] p-3 text-left transition-colors hover:border-[#475569] hover:bg-[#151B26]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-white">{region.label}</span>
                  <span className="rounded-full border border-[#334155] px-2 py-0.5 text-xs font-bold text-[#CBD5E1]">
                    {sites.length} sites
                  </span>
                </div>
                <p className="mt-1 text-sm leading-[1.5] text-[#CBD5E1]">
                  {open} open incidents · {offline} offline devices · {active} active alerts
                </p>
              </button>
            )
          })}
        </div>
      </section>

      {criticalSites.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-white">Sites Requiring Attention</h3>
          <div className="space-y-2">
            {criticalSites.map((site) => (
              <button
                key={site.id}
                type="button"
                onClick={() => onSelectSite(site.id)}
                className="flex min-h-12 w-full items-center justify-between rounded-lg border border-[#273142] bg-[#111827] px-3 text-left transition-colors hover:border-[#475569] hover:bg-[#151B26]"
              >
                <span>
                  <span className="block text-sm font-bold text-white">{site.name}</span>
                  <span className="block text-xs font-medium text-[#94A3B8]">
                    {incidentsForSite(site.id).length} incidents · {site.offlineDevices} offline devices
                  </span>
                </span>
                <span className="text-xs font-extrabold uppercase" style={{ color: RISK_COLOR[site.riskLevel] }}>
                  {site.riskLevel}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {oldestCritical && (
        <p className="rounded-lg border border-[#7F1D1D] bg-[#210A08] p-3 text-sm leading-[1.5] text-[#FECACA]">
          Oldest critical incident: <span className="font-bold text-white">{oldestCritical.title}</span>
        </p>
      )}
    </PanelShell>
  )
}

function RegionPanel({
  id,
  onSelectSite,
  onShowCameraWall,
  onSelectIncident,
}: {
  id: string
  onSelectSite: (id: string) => void
  onShowCameraWall: (siteId: string) => void
  onSelectIncident: (id: string) => void
}) {
  const region = regionById(id)
  if (!region) return null

  const sites = region.siteIds.map((siteId) => siteById(siteId)).filter(Boolean) as Site[]
  const openIncidents = sites.reduce((total, site) => total + incidentsForSite(site.id).length, 0)
  const activeAlerts = sites.reduce((total, site) => total + site.activeAlerts, 0)
  const offlineDevices = sites.reduce((total, site) => total + site.offlineDevices, 0)
  const criticalSites = sites.filter((site) => site.riskLevel === 'critical' || site.riskLevel === 'high').length

  return (
    <PanelShell title={region.label} eyebrow="Regional Command" icon="public">
      <StatGrid
        stats={[
          { label: 'Sites', value: sites.length },
          { label: 'Critical/High', value: criticalSites, tone: '#FFB4AE' },
          { label: 'Open Incidents', value: openIncidents, tone: '#FCA5A5' },
          { label: 'Offline Devices', value: offlineDevices },
        ]}
      />
      <section>
        <h3 className="mb-2 text-sm font-bold text-white">Sites Requiring Attention</h3>
        <div className="space-y-2">
          {sites.map((site) => (
            <div
              key={site.id}
              className="rounded-lg border border-[#273142] bg-[#111827] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span>
                  <span className="block text-sm font-bold text-white">{site.name}</span>
                  <span className="block text-xs font-medium text-[#94A3B8]">
                    {incidentsForSite(site.id).length} incidents · {site.activeAlerts} alerts · {site.offlineDevices} offline
                  </span>
                </span>
                <span className="text-xs font-extrabold uppercase" style={{ color: RISK_COLOR[site.riskLevel] }}>
                  {site.riskLevel}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <ActionButton icon="location_on" onClick={() => onSelectSite(site.id)}>
                  Site
                </ActionButton>
                <ActionButton icon="grid_view" onClick={() => onShowCameraWall(site.id)}>
                  Cameras
                </ActionButton>
                <ActionButton
                  icon="priority_high"
                  onClick={() => {
                    const incident = incidentsForSite(site.id)[0]
                    if (incident) onSelectIncident(incident.id)
                  }}
                  disabled={incidentsForSite(site.id).length === 0}
                >
                  Incident
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      </section>
      <p className="rounded-lg border border-[#273142] bg-[#111827] p-3 text-sm leading-[1.5] text-[#CBD5E1]">
        Regional supervisors start here to balance site load, detect multi-site stress, and drill into
        the facility that needs immediate support.
      </p>
    </PanelShell>
  )
}

function SitePanel({
  id,
  onSelectDevice,
  onSelectIncident,
  onShowCameraWall,
  onOpenLiveView,
  onReviewIncident,
  onSelectFloorPlan,
}: {
  id: string
  onSelectDevice: (id: string) => void
  onSelectIncident: (id: string) => void
  onShowCameraWall: (siteId: string) => void
  onOpenLiveView: (id: string) => void
  onReviewIncident: (alert: Alert) => void
  onSelectFloorPlan: (floorPlanId: string) => void
}) {
  const site = siteById(id)
  if (!site) return null

  const devices = devicesForSite(site.id)
  const cameras = camerasForSite(site.id)
  const incidents = incidentsForSite(site.id)
  const signals = EXTERNAL_SIGNALS.filter((signal) => signal.affectedSiteIds.includes(site.id))
  const offline = devices.filter((device) => device.status === 'offline').length
  const healthExceptionDevices = devices.filter(hasHealthEvents)
  const responseDevices = devices.filter(
    (device) => device.linkedIncidentIds.length > 0 && !hasHealthEvents(device)
  )
  const floorPlans = floorPlansForSite(site.id)

  return (
    <PanelShell title={site.name} eyebrow={`${site.city}, ${site.state}`} icon="location_city">
      <div className="flex items-center justify-between rounded-lg border border-[#273142] bg-[#111827] px-3 py-2">
        <span className="text-sm font-semibold text-[#CBD5E1]">Current posture</span>
        <span
          className="rounded-full px-3 py-1 text-sm font-extrabold uppercase"
          style={{ color: RISK_COLOR[site.riskLevel], backgroundColor: `${RISK_COLOR[site.riskLevel]}22` }}
        >
          {site.riskLevel} risk
        </span>
      </div>

      <StatGrid
        stats={[
          { label: 'Open Incidents', value: incidents.length, tone: incidents.length ? '#FCA5A5' : undefined },
          { label: 'Active Alerts', value: site.activeAlerts },
          { label: 'Cameras', value: cameras.length },
          { label: 'Offline', value: offline, tone: offline ? '#FFB4AE' : undefined },
        ]}
      />

      <div className="grid grid-cols-2 gap-2">
        <ActionButton icon="grid_view" onClick={() => onShowCameraWall(site.id)} variant="primary">
          View Cameras
        </ActionButton>
        <ActionButton
          icon="priority_high"
          onClick={() => incidents[0] && onSelectIncident(incidents[0].id)}
          disabled={incidents.length === 0}
        >
          Open Incident
        </ActionButton>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-bold text-white">Active Incidents</h3>
        <div className="space-y-2">
          {incidents.slice(0, 3).map((alert) => (
            <IncidentCard
              key={alert.id}
              alert={alert}
              onSelectIncident={onSelectIncident}
              onReviewIncident={onReviewIncident}
            />
          ))}
          {incidents.length === 0 && (
            <p className="rounded-lg border border-[#273142] bg-[#111827] p-3 text-sm text-[#94A3B8]">
              No active incidents at this site.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold text-white">Floors & Camera Coverage</h3>
        <div className="space-y-2">
          {floorPlans.map((plan) => {
            const floorDevices = devicesForFloorPlan(plan.id)
            const floorCameras = camerasForFloorPlan(plan.id)
            const floorHealth = floorDevices.filter(hasHealthEvents).length
            const floorIncidents = incidentsForSite(site.id).filter((alert) =>
              linkedDevicesForIncident(alert.id).some((device) => device.floorPlanId === plan.id)
            )
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onSelectFloorPlan(plan.id)}
                className="w-full rounded-lg border border-[#273142] bg-[#111827] p-3 text-left transition-colors hover:border-[#475569] hover:bg-[#151B26]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span>
                    <span className="block text-sm font-bold text-white">{plan.building} · {plan.floor}</span>
                    <span className="block text-xs font-medium text-[#94A3B8]">{plan.label}</span>
                  </span>
                  {floorIncidents.length > 0 && (
                    <span className="rounded-full bg-[#210A08] px-2 py-0.5 text-xs font-extrabold text-[#FF453A]">
                      {floorIncidents.length} incident
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-[1.5] text-[#CBD5E1]">
                  {floorCameras.length} cameras · {floorDevices.length} devices · {floorHealth} health exceptions
                </p>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold text-white">Device Health Exceptions</h3>
        <div className="space-y-2">
          {healthExceptionDevices.length > 0 ? (
            healthExceptionDevices.slice(0, 4).map((device) => (
              <DeviceRow
                key={device.id}
                device={device}
                onSelectDevice={onSelectDevice}
                onOpenLiveView={onOpenLiveView}
              />
            ))
          ) : (
            <p className="rounded-lg border border-[#273142] bg-[#111827] p-3 text-sm leading-[1.5] text-[#94A3B8]">
              No active device health exceptions at this site.
            </p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold text-white">Incident-Linked Devices</h3>
        <div className="space-y-2">
          {responseDevices.length > 0 ? (
            responseDevices.slice(0, 4).map((device) => (
              <DeviceRow
                key={device.id}
                device={device}
                onSelectDevice={onSelectDevice}
                onOpenLiveView={onOpenLiveView}
              />
            ))
          ) : (
            <p className="rounded-lg border border-[#273142] bg-[#111827] p-3 text-sm leading-[1.5] text-[#94A3B8]">
              No additional healthy devices are attached to active incidents.
            </p>
          )}
        </div>
      </section>

      {signals.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-white">External Signals</h3>
          <div className="space-y-2">
            {signals.map((signal) => (
              <div key={signal.id} className="rounded-lg border border-[#273142] bg-[#111827] p-3">
                <p className="text-sm font-bold text-white">{signal.title}</p>
                <p className="mt-1 text-sm leading-[1.5] text-[#CBD5E1]">{signal.description}</p>
                <p className="mt-2 text-xs font-semibold text-[#94A3B8]">
                  {signal.source} · {signal.timeHorizon}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </PanelShell>
  )
}

function DevicePanel({
  id,
  onSelectIncident,
  onOpenLiveView,
}: {
  id: string
  onSelectIncident: (id: string) => void
  onOpenLiveView: (id: string) => void
}) {
  const device = deviceById(id)
  if (!device) return null

  const linkedIncidents = device.linkedIncidentIds.map((alertId) => incidentById(alertId)).filter(Boolean) as Alert[]

  return (
    <PanelShell title={device.name} eyebrow={`${device.building} · ${device.floor}`} icon={DEVICE_ICON[device.kind]}>
      <div className="flex items-center justify-between rounded-lg border border-[#273142] bg-[#111827] px-3 py-2">
        <span className="text-sm font-semibold text-[#CBD5E1]">{device.zone}</span>
        <DeviceStatusBadge status={device.status} />
      </div>
      <StatGrid
        stats={[
          { label: 'Type', value: device.kind },
          { label: 'Heartbeat', value: device.lastHeartbeat },
          { label: 'Linked Incidents', value: linkedIncidents.length, tone: linkedIncidents.length ? '#FCA5A5' : undefined },
          { label: 'State', value: device.state ?? device.streamHealth ?? 'Nominal' },
        ]}
      />
      {device.healthEvents?.length ? (
        <section>
          <h3 className="mb-2 text-sm font-bold text-white">Health Events</h3>
          <HealthEventList device={device} />
        </section>
      ) : (
        device.responseContext && (
          <p className="rounded-lg border border-[#334155] bg-[#111827] p-3 text-sm leading-[1.5] text-[#CBD5E1]">
            {device.responseContext}
          </p>
        )
      )}
      {device.kind === 'camera' && (
        <CameraTile camera={device} onOpenLiveView={onOpenLiveView} />
      )}
      {device.kind === 'camera' && (
        <ActionButton
          icon="live_tv"
          onClick={() => onOpenLiveView(device.id)}
          variant="primary"
          disabled={device.status === 'offline'}
        >
          Open Live View
        </ActionButton>
      )}
      <section>
        <h3 className="mb-2 text-sm font-bold text-white">Recent Device Events</h3>
        <div className="space-y-2">
          {device.recentEvents.map((event) => (
            <p key={event} className="rounded-lg border border-[#273142] bg-[#111827] p-3 text-sm leading-[1.5] text-[#CBD5E1]">
              {event}
            </p>
          ))}
        </div>
      </section>
      {linkedIncidents.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-white">Linked Incidents</h3>
          <div className="space-y-2">
            {linkedIncidents.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => onSelectIncident(alert.id)}
                className="w-full rounded-lg border border-[#273142] bg-[#111827] p-3 text-left transition-colors hover:border-[#475569] hover:bg-[#151B26]"
              >
                <p className="text-sm font-bold text-white">{alert.title}</p>
                <p className="mt-1 text-xs font-semibold text-[#94A3B8]">{alert.location}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </PanelShell>
  )
}

function CameraWallPanel({
  siteId,
  onOpenLiveView,
  onSelectFloorPlan,
}: {
  siteId: string
  onOpenLiveView: (id: string) => void
  onSelectFloorPlan: (floorPlanId: string) => void
}) {
  const site = siteById(siteId)
  const cameras = camerasForSite(siteId)
  const incidentCameras = cameras.filter((camera) => camera.linkedIncidentIds.length > 0)
  const otherCameras = cameras.filter((camera) => camera.linkedIncidentIds.length === 0)
  const floorPlans = floorPlansForSite(siteId)

  return (
    <PanelShell title="Camera Wall" eyebrow={site?.name ?? 'Selected Site'} icon="grid_view">
      <section>
        <h3 className="mb-2 text-sm font-bold text-white">Floor Coverage</h3>
        <div className="grid grid-cols-1 gap-2">
          {floorPlans.map((plan) => {
            const floorCameras = camerasForFloorPlan(plan.id)
            const unhealthy = floorCameras.filter(hasHealthEvents).length
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onSelectFloorPlan(plan.id)}
                className="flex min-h-12 items-center justify-between rounded-lg border border-[#273142] bg-[#111827] px-3 text-left transition-colors hover:border-[#475569] hover:bg-[#151B26]"
              >
                <span>
                  <span className="block text-sm font-bold text-white">{plan.building} · {plan.floor}</span>
                  <span className="block text-xs font-medium text-[#94A3B8]">
                    {floorCameras.length} cameras · {unhealthy} attention
                  </span>
                </span>
                <span className="material-symbols-outlined text-[#94A3B8]" aria-hidden="true" style={{ fontSize: '18px', lineHeight: 1 }}>
                  map
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {incidentCameras.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-white">Incident-Relevant Cameras</h3>
          <div className="grid grid-cols-1 gap-3">
            {incidentCameras.map((camera) => (
              <CameraTile key={camera.id} camera={camera} onOpenLiveView={onOpenLiveView} />
            ))}
          </div>
        </section>
      )}
      <section>
        <h3 className="mb-2 text-sm font-bold text-white">All Site Cameras</h3>
        <div className="grid grid-cols-1 gap-3">
          {[...incidentCameras, ...otherCameras].map((camera) => (
            <CameraTile key={camera.id} camera={camera} onOpenLiveView={onOpenLiveView} />
          ))}
        </div>
      </section>
    </PanelShell>
  )
}

function LiveViewPanel({
  id,
  onSelectIncident,
}: {
  id: string
  onSelectIncident: (id: string) => void
}) {
  const camera = deviceById(id)
  if (!camera) return null

  const linkedIncidents = camera.linkedIncidentIds.map((alertId) => incidentById(alertId)).filter(Boolean) as Alert[]
  const live = camera.status !== 'offline'

  return (
    <PanelShell title={camera.name} eyebrow="Live View" icon="live_tv">
      <div className="rounded-lg border border-[#273142] bg-black p-2">
        <CameraStill
          channel={camera.channel ?? camera.name}
          sceneType={camera.sceneType ?? 'hallway'}
          location={camera.zone}
          timestamp={live ? 'LIVE' : 'OFFLINE'}
          className="aspect-video"
        />
      </div>
      <StatGrid
        stats={[
          { label: 'Stream', value: camera.streamHealth ?? 'unknown', tone: live ? '#86EFAC' : '#FFB4AE' },
          { label: 'Recording', value: camera.recording ?? 'unknown' },
          { label: 'Coverage', value: camera.coverage ?? camera.zone },
          { label: 'Heartbeat', value: camera.lastHeartbeat },
        ]}
      />
      <div className="grid grid-cols-2 gap-2">
        <ActionButton icon="photo_camera" disabled={!live}>Snapshot</ActionButton>
        <ActionButton icon="lock_clock" disabled={!live}>Lock Evidence</ActionButton>
        <ActionButton icon="movie" disabled={!live}>Open Clip</ActionButton>
        <ActionButton icon="security" variant="primary">Dispatch Guard</ActionButton>
      </div>
      <section>
        <h3 className="mb-2 text-sm font-bold text-white">Recent Camera Events</h3>
        <div className="space-y-2">
          {camera.recentEvents.map((event) => (
            <div
              key={event}
              className="rounded-lg border border-[#273142] bg-[#111827] p-3 text-sm leading-[1.5] text-[#CBD5E1]"
            >
              {event}
            </div>
          ))}
        </div>
      </section>
      {linkedIncidents.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-white">Incident Context</h3>
          <div className="space-y-2">
            {linkedIncidents.map((alert) => (
              <button
                key={alert.id}
                type="button"
                onClick={() => onSelectIncident(alert.id)}
                className="w-full rounded-lg border border-[#273142] bg-[#111827] p-3 text-left transition-colors hover:border-[#475569] hover:bg-[#151B26]"
              >
                <p className="text-sm font-bold text-white">{alert.title}</p>
                <p className="mt-1 text-sm text-[#CBD5E1]">{alert.location}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </PanelShell>
  )
}

function IncidentPanel({
  id,
  onReviewIncident,
  onOpenLiveView,
  onSelectDevice,
}: {
  id: string
  onReviewIncident: (alert: Alert) => void
  onOpenLiveView: (id: string) => void
  onSelectDevice: (id: string) => void
}) {
  const alert = incidentById(id)
  if (!alert) return null

  const detail = ALERT_DETAILS[alert.id]
  const linkedDevices = linkedDevicesForIncident(alert.id)
  const linkedCameras = linkedDevices.filter((device) => device.kind === 'camera')

  return (
    <PanelShell title={alert.title} eyebrow="Incident Preview" icon="priority_high">
      <div className="flex items-center justify-between rounded-lg border border-[#273142] bg-[#111827] px-3 py-2">
        <span className="text-sm font-semibold text-[#CBD5E1]">{alert.location}</span>
        <span
          className="rounded-full px-3 py-1 text-sm font-extrabold uppercase"
          style={{ color: SEVERITY_COLOR[alert.severity], backgroundColor: `${SEVERITY_COLOR[alert.severity]}22` }}
        >
          {alert.severity}
        </span>
      </div>
      <p className="rounded-lg border border-[#273142] bg-[#111827] p-3 text-sm leading-[1.6] text-[#CBD5E1]">
        {alert.explanation ?? alert.nba?.rationale ?? 'Incident is active and awaiting review.'}
      </p>
      <StatGrid
        stats={[
          { label: 'Sources', value: alert.sources.length },
          { label: 'Timeline Events', value: detail?.correlatedEvents.length ?? 'Pending' },
          { label: 'Linked Devices', value: linkedDevices.length },
          { label: 'Phase', value: alert.nba?.responsePhase ?? 'review' },
        ]}
      />
      <div className="grid grid-cols-2 gap-2">
        <ActionButton icon="rate_review" onClick={() => onReviewIncident(alert)} variant="primary">
          Review Incident
        </ActionButton>
        <ActionButton
          icon="live_tv"
          onClick={() => linkedCameras[0] && onOpenLiveView(linkedCameras[0].id)}
          disabled={linkedCameras.length === 0}
        >
          Open Cameras
        </ActionButton>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-bold text-white">Review Sequence</h3>
        <div className="space-y-2">
          {[
            { label: '1. Confirm threat context', detail: `${alert.sources.length} sources correlated at ${alert.location}` },
            { label: '2. Verify visual evidence', detail: linkedCameras.length ? `${linkedCameras.length} camera view available` : 'No linked live camera yet' },
            { label: '3. Execute or override action', detail: alert.nba?.recommendedAction ?? 'Recommendation pending enrichment' },
          ].map((step) => (
            <div key={step.label} className="rounded-lg border border-[#273142] bg-[#111827] p-3">
              <p className="text-sm font-bold text-white">{step.label}</p>
              <p className="mt-1 text-sm leading-[1.5] text-[#CBD5E1]">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {linkedCameras.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-white">Incident Cameras</h3>
          <div className="grid grid-cols-1 gap-3">
            {linkedCameras.map((camera) => (
              <CameraTile key={camera.id} camera={camera} onOpenLiveView={onOpenLiveView} />
            ))}
          </div>
        </section>
      )}

      {linkedDevices.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-white">Related Devices</h3>
          <div className="space-y-2">
            {linkedDevices.map((device) => (
              <button
                key={device.id}
                type="button"
                onClick={() => onSelectDevice(device.id)}
                className="w-full rounded-lg border border-[#273142] bg-[#111827] p-3 text-left transition-colors hover:border-[#475569] hover:bg-[#151B26]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-white">{device.name}</p>
                    <p className="mt-1 text-xs font-medium text-[#94A3B8]">
                      {device.floor} · {device.zone}
                    </p>
                  </div>
                  <DeviceStatusBadge status={device.status} />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
      {detail && (
        <section>
          <h3 className="mb-2 text-sm font-bold text-white">Evidence Timeline</h3>
          <div className="space-y-2">
            {detail.correlatedEvents.map((event) => (
              <div key={event.id} className="rounded-lg border border-[#273142] bg-[#111827] p-3">
                <p className="font-mono text-xs font-bold text-[#94A3B8]">{event.ts}</p>
                <p className="mt-1 text-sm font-semibold text-white">{event.location}</p>
                <p className="mt-1 text-sm leading-[1.5] text-[#CBD5E1]">{event.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </PanelShell>
  )
}

export function MapSidePanel({
  selection,
  onSelectRegion,
  onSelectSite,
  onSelectDevice,
  onSelectIncident,
  onShowCameraWall,
  onOpenLiveView,
  onReviewIncident,
  onSelectFloorPlan,
}: {
  selection: MapPanelSelection
  onSelectRegion: (id: string) => void
  onSelectSite: (id: string) => void
  onSelectDevice: (id: string) => void
  onSelectIncident: (id: string) => void
  onShowCameraWall: (siteId: string) => void
  onOpenLiveView: (id: string) => void
  onReviewIncident: (alert: Alert) => void
  onSelectFloorPlan: (floorPlanId: string) => void
}) {
  if (selection.mode === 'global') {
    return <GlobalPanel onSelectRegion={onSelectRegion} onSelectSite={onSelectSite} />
  }

  if (selection.mode === 'region') {
    return (
      <RegionPanel
        id={selection.id}
        onSelectSite={onSelectSite}
        onShowCameraWall={onShowCameraWall}
        onSelectIncident={onSelectIncident}
      />
    )
  }

  if (selection.mode === 'device') {
    return (
      <DevicePanel
        id={selection.id}
        onSelectIncident={onSelectIncident}
        onOpenLiveView={onOpenLiveView}
      />
    )
  }

  if (selection.mode === 'incident') {
    return (
      <IncidentPanel
        id={selection.id}
        onReviewIncident={onReviewIncident}
        onOpenLiveView={onOpenLiveView}
        onSelectDevice={onSelectDevice}
      />
    )
  }

  if (selection.mode === 'camera-wall') {
    return (
      <CameraWallPanel
        siteId={selection.id}
        onOpenLiveView={onOpenLiveView}
        onSelectFloorPlan={onSelectFloorPlan}
      />
    )
  }

  if (selection.mode === 'live-view') {
    return <LiveViewPanel id={selection.id} onSelectIncident={onSelectIncident} />
  }

  return (
    <SitePanel
      id={selection.id}
      onSelectDevice={onSelectDevice}
      onSelectIncident={onSelectIncident}
      onShowCameraWall={onShowCameraWall}
      onOpenLiveView={onOpenLiveView}
      onReviewIncident={onReviewIncident}
      onSelectFloorPlan={onSelectFloorPlan}
    />
  )
}
