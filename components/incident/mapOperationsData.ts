'use client'

import type { Alert, SceneType, Severity, Site } from '@/lib/types'
import { MOCK_ALERTS, SITES } from '@/lib/mock-data/scenarios'

export type MapRole = 'operator' | 'site_supervisor' | 'regional_supervisor' | 'global_supervisor'
export type MapScope = 'global' | 'regional' | 'site' | 'floor'
export type MapLayerPreset = 'response' | 'health' | 'external' | 'investigation'
export type DeviceKind = 'camera' | 'access' | 'sensor'
export type DeviceStatus = 'online' | 'offline' | 'degraded'
export type PanelMode = 'region' | 'site' | 'device' | 'incident' | 'camera-wall' | 'live-view'
export type DeviceHealthSeverity = 'warning' | 'critical'

export interface DeviceHealthEvent {
  id: string
  severity: DeviceHealthSeverity
  label: string
  detail: string
  observedAt: string
}

export interface MapDevice {
  id: string
  siteId: string
  name: string
  kind: DeviceKind
  status: DeviceStatus
  lat: number
  lng: number
  building: string
  floor: string
  zone: string
  lastHeartbeat: string
  streamHealth?: 'live' | 'degraded' | 'offline'
  recording?: 'recording' | 'gap' | 'unknown'
  sceneType?: SceneType
  channel?: string
  coverage?: string
  state?: string
  responseContext?: string
  healthEvents?: DeviceHealthEvent[]
  linkedIncidentIds: string[]
  recentEvents: string[]
}

export interface MapRegion {
  id: string
  name: string
  label: string
  siteIds: string[]
  lat: number
  lng: number
}

export interface MapPanelSelection {
  mode: PanelMode
  id: string
}

export const ROLE_OPTIONS: Array<{
  id: MapRole
  label: string
  defaultScope: MapScope
  description: string
}> = [
  {
    id: 'operator',
    label: 'Operator',
    defaultScope: 'site',
    description: 'Assigned site and incident response context',
  },
  {
    id: 'site_supervisor',
    label: 'Site Supervisor',
    defaultScope: 'site',
    description: 'Facility health, guards, devices, and active incidents',
  },
  {
    id: 'regional_supervisor',
    label: 'Regional Supervisor',
    defaultScope: 'regional',
    description: 'Site load, escalations, and external risk across a region',
  },
  {
    id: 'global_supervisor',
    label: 'Global Supervisor',
    defaultScope: 'global',
    description: 'Cross-region operational health and critical hotspots',
  },
]

export const LAYER_PRESETS: Array<{
  id: MapLayerPreset
  label: string
  icon: string
  description: string
}> = [
  {
    id: 'response',
    label: 'Response',
    icon: 'bolt',
    description: 'Critical incidents, response assets, and affected zones',
  },
  {
    id: 'health',
    label: 'Health',
    icon: 'monitor_heart',
    description: 'Offline cameras, degraded devices, and coverage gaps',
  },
  {
    id: 'external',
    label: 'External Risk',
    icon: 'public',
    description: 'Weather, public-safety, traffic, and civil-unrest context',
  },
  {
    id: 'investigation',
    label: 'Investigation',
    icon: 'timeline',
    description: 'Evidence trails, linked cameras, and incident movement',
  },
]

export const REGIONS: MapRegion[] = [
  {
    id: 'region-south-central',
    name: 'South Central',
    label: 'South Central Region',
    siteIds: ['site-austin', 'site-dallas', 'site-warehouse'],
    lat: 31.25,
    lng: -97.45,
  },
]

export const OPERATIONAL_DEVICES: MapDevice[] = [
  {
    id: 'cam-c4',
    siteId: 'site-austin',
    name: 'Camera C4',
    kind: 'camera',
    status: 'online',
    lat: 30.2689,
    lng: -97.7422,
    building: 'Bldg A',
    floor: 'Floor 3',
    zone: 'Server Room Corridor',
    lastHeartbeat: '7s ago',
    streamHealth: 'live',
    recording: 'recording',
    sceneType: 'restricted',
    channel: 'C4',
    coverage: 'Server Room 2B approach',
    responseContext: 'Primary camera for unauthorized server room access review.',
    linkedIncidentIds: ['alert-001'],
    recentEvents: ['14:38 badge denial confirmed on camera', '14:34 contractor observed near Server Room 2B'],
  },
  {
    id: 'cam-a7',
    siteId: 'site-austin',
    name: 'Camera A7',
    kind: 'camera',
    status: 'online',
    lat: 30.2698,
    lng: -97.744,
    building: 'Bldg A',
    floor: 'Floor 4',
    zone: 'Executive Suite',
    lastHeartbeat: '5s ago',
    streamHealth: 'live',
    recording: 'recording',
    sceneType: 'hallway',
    channel: 'A7',
    coverage: 'Executive Suite entrance and elevator lobby',
    responseContext: 'Linked to after-hours motion review; no current device health exception.',
    linkedIncidentIds: ['alert-003'],
    recentEvents: ['02:14 after-hours motion detected', '02:13 motion sensor wake event'],
  },
  {
    id: 'cam-e2',
    siteId: 'site-austin',
    name: 'Employee Entrance Cam E2',
    kind: 'camera',
    status: 'online',
    lat: 30.2667,
    lng: -97.7425,
    building: 'Bldg A',
    floor: 'Ground',
    zone: 'Employee Entrance',
    lastHeartbeat: '4s ago',
    streamHealth: 'live',
    recording: 'recording',
    sceneType: 'exterior',
    channel: 'E2',
    coverage: 'Employee entrance doors and badge reader',
    healthEvents: [
      {
        id: 'health-cam-e2-bandwidth',
        severity: 'warning',
        label: 'Bandwidth below threshold',
        detail: 'Average stream bandwidth is 38% below baseline for the last 6 minutes.',
        observedAt: '09:55 CT',
      },
      {
        id: 'health-cam-e2-previews',
        severity: 'warning',
        label: 'Missed preview images',
        detail: '3 of the last 12 preview frames failed to generate during the active incident.',
        observedAt: '09:56 CT',
      },
    ],
    responseContext: 'Active forced-entry camera; verify stream quality before relying on live view.',
    linkedIncidentIds: ['alert-006'],
    recentEvents: ['09:53 door pressure sensor triggered', '09:52 unauthorized vehicle arrived'],
  },
  {
    id: 'cam-east-entry',
    siteId: 'site-austin',
    name: 'East Entry Camera',
    kind: 'camera',
    status: 'online',
    lat: 30.2675,
    lng: -97.7417,
    building: 'Bldg A',
    floor: 'Ground',
    zone: 'East Entry',
    lastHeartbeat: '6s ago',
    streamHealth: 'live',
    recording: 'recording',
    sceneType: 'exterior',
    channel: 'E1',
    coverage: 'East perimeter entry and approach path',
    healthEvents: [
      {
        id: 'health-east-entry-preview',
        severity: 'warning',
        label: 'Preview latency elevated',
        detail: 'Preview generation is delayed by 9 seconds; live stream is still available.',
        observedAt: '14:36 CT',
      },
    ],
    responseContext: 'Perimeter camera linked to watchlist deterrence event.',
    linkedIncidentIds: ['alert-002'],
    recentEvents: ['14:35 watchlist match at perimeter', '14:34 secondary angle requested'],
  },
  {
    id: 'cam-p204',
    siteId: 'site-austin',
    name: 'Camera P2-04',
    kind: 'camera',
    status: 'offline',
    lat: 30.2658,
    lng: -97.7447,
    building: 'Garage',
    floor: 'Parking L2',
    zone: 'Parking Level 2',
    lastHeartbeat: '2h 14m ago',
    streamHealth: 'offline',
    recording: 'gap',
    sceneType: 'parking',
    channel: 'P2-04',
    coverage: 'Parking row C and elevator vestibule',
    healthEvents: [
      {
        id: 'health-p204-offline',
        severity: 'critical',
        label: 'Camera offline',
        detail: 'No stream heartbeat for 2h 14m; recording gap is active for Parking Level 2.',
        observedAt: '12:30 CT',
      },
    ],
    linkedIncidentIds: ['alert-005'],
    recentEvents: ['12:30 camera health monitor marked offline', '12:29 last frame received'],
  },
  {
    id: 'door-server-2b',
    siteId: 'site-austin',
    name: 'Server Room 2B Door',
    kind: 'access',
    status: 'online',
    lat: 30.2686,
    lng: -97.7425,
    building: 'Bldg A',
    floor: 'Floor 3',
    zone: 'Server Room 2B',
    lastHeartbeat: '8s ago',
    state: 'Locked · badge restricted',
    responseContext: 'Access point involved in denied badge attempts; controller healthy.',
    linkedIncidentIds: ['alert-001'],
    recentEvents: ['14:38 access denied for Badge B-4421', '14:34 access denied for Badge B-4421'],
  },
  {
    id: 'door-employee-entrance',
    siteId: 'site-austin',
    name: 'Employee Entrance Door',
    kind: 'access',
    status: 'online',
    lat: 30.2664,
    lng: -97.7428,
    building: 'Bldg A',
    floor: 'Ground',
    zone: 'Employee Entrance',
    lastHeartbeat: '3s ago',
    state: 'Remote lock available',
    healthEvents: [
      {
        id: 'health-door-employee-pressure',
        severity: 'warning',
        label: 'Pressure sensor noisy',
        detail: 'Door pressure sensor is reporting repeated high-force spikes; verify latch after response.',
        observedAt: '09:54 CT',
      },
    ],
    responseContext: 'Primary forced-entry access point; remote lock action available.',
    linkedIncidentIds: ['alert-006'],
    recentEvents: ['09:53 forced-entry pressure detected', '09:52 no badge presented'],
  },
  {
    id: 'sensor-exec-motion',
    siteId: 'site-austin',
    name: 'Motion Sensor: Executive Suite',
    kind: 'sensor',
    status: 'online',
    lat: 30.2696,
    lng: -97.7443,
    building: 'Bldg A',
    floor: 'Floor 4',
    zone: 'Executive Suite',
    lastHeartbeat: '21s ago',
    state: 'Motion quiet',
    responseContext: 'Sensor triggered after-hours motion alert; currently quiet.',
    linkedIncidentIds: ['alert-003'],
    recentEvents: ['02:14 after-hours motion event', '02:15 no follow-up motion'],
  },
  {
    id: 'cam-d1-lobby',
    siteId: 'site-dallas',
    name: 'Camera D1',
    kind: 'camera',
    status: 'online',
    lat: 32.7772,
    lng: -96.7966,
    building: 'Dallas Office',
    floor: 'Lobby',
    zone: 'Main Lobby',
    lastHeartbeat: '9s ago',
    streamHealth: 'live',
    recording: 'recording',
    sceneType: 'lobby',
    channel: 'D1',
    coverage: 'Main lobby badge lanes',
    linkedIncidentIds: [],
    recentEvents: ['No active camera-linked incidents'],
  },
  {
    id: 'cam-w2',
    siteId: 'site-warehouse',
    name: 'Camera W2',
    kind: 'camera',
    status: 'online',
    lat: 30.506,
    lng: -97.8192,
    building: 'Warehouse',
    floor: 'Ground',
    zone: 'Loading Dock B',
    lastHeartbeat: '5s ago',
    streamHealth: 'live',
    recording: 'recording',
    sceneType: 'exterior',
    channel: 'W2',
    coverage: 'Loading Dock B door and vehicle apron',
    linkedIncidentIds: ['alert-004'],
    recentEvents: ['13:52 tailgating detected', '13:53 unknown individual moved inside dock'],
  },
  {
    id: 'cam-w5',
    siteId: 'site-warehouse',
    name: 'Camera W5',
    kind: 'camera',
    status: 'degraded',
    lat: 30.5048,
    lng: -97.8198,
    building: 'Warehouse',
    floor: 'Ground',
    zone: 'Aisle 5',
    lastHeartbeat: '44s ago',
    streamHealth: 'degraded',
    recording: 'recording',
    sceneType: 'hallway',
    channel: 'W5',
    coverage: 'Aisle 5 and cross-dock corridor',
    healthEvents: [
      {
        id: 'health-w5-packet-loss',
        severity: 'warning',
        label: 'Packet loss above threshold',
        detail: 'Video packet loss is averaging 14%; incident tracking may miss fast movement.',
        observedAt: '13:54 CT',
      },
    ],
    responseContext: 'Tracking handoff camera for warehouse tailgating incident.',
    linkedIncidentIds: ['alert-004'],
    recentEvents: ['13:54 tracking handoff requested from W2', 'Packet loss above normal threshold'],
  },
  {
    id: 'dock-b-door',
    siteId: 'site-warehouse',
    name: 'Loading Dock B Door',
    kind: 'access',
    status: 'online',
    lat: 30.5057,
    lng: -97.8195,
    building: 'Warehouse',
    floor: 'Ground',
    zone: 'Loading Dock B',
    lastHeartbeat: '11s ago',
    state: 'Unlocked · guard intercept pending',
    responseContext: 'Loading dock access point associated with tailgate event.',
    linkedIncidentIds: ['alert-004'],
    recentEvents: ['13:52 tailgate event', '13:52 valid badge followed by unknown entry'],
  },
]

export function siteById(siteId: string | null): Site | null {
  if (!siteId) return null
  return SITES.find((site) => site.id === siteId) ?? null
}

export function regionById(regionId: string | null): MapRegion | null {
  if (!regionId) return null
  return REGIONS.find((region) => region.id === regionId) ?? null
}

export function devicesForSite(siteId: string): MapDevice[] {
  return OPERATIONAL_DEVICES.filter((device) => device.siteId === siteId)
}

export function camerasForSite(siteId: string): MapDevice[] {
  return devicesForSite(siteId).filter((device) => device.kind === 'camera')
}

export function incidentsForSite(siteId: string): Alert[] {
  return MOCK_ALERTS.filter((alert) => alert.siteId === siteId)
}

export function incidentById(alertId: string): Alert | null {
  return MOCK_ALERTS.find((alert) => alert.id === alertId) ?? null
}

export function deviceById(deviceId: string): MapDevice | null {
  return OPERATIONAL_DEVICES.find((device) => device.id === deviceId) ?? null
}

export function linkedDevicesForIncident(alertId: string): MapDevice[] {
  return OPERATIONAL_DEVICES.filter((device) => device.linkedIncidentIds.includes(alertId))
}

export function hasHealthEvents(device: MapDevice): boolean {
  return device.status !== 'online' || Boolean(device.healthEvents?.length)
}

export function highestSeverity(alerts: Alert[]): Severity {
  if (alerts.some((alert) => alert.severity === 'critical')) return 'critical'
  if (alerts.some((alert) => alert.severity === 'high')) return 'high'
  if (alerts.some((alert) => alert.severity === 'medium')) return 'medium'
  return 'low'
}

export function defaultScopeForRole(role: MapRole): MapScope {
  return ROLE_OPTIONS.find((option) => option.id === role)?.defaultScope ?? 'site'
}
