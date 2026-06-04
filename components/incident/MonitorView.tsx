'use client'

type DeviceStatus = 'online' | 'offline' | 'degraded'
type DeviceKind = 'camera' | 'access' | 'sensor'

interface Device {
  id: string
  kind: DeviceKind
  name: string
  zone: string
  status: DeviceStatus
}

const DEVICES: Device[] = [
  { id: 'c4', kind: 'camera', name: 'Camera C4', zone: 'Server Room Corridor', status: 'online' },
  { id: 'a7', kind: 'camera', name: 'Camera A7', zone: 'Executive Suite', status: 'online' },
  { id: 'p204', kind: 'camera', name: 'Camera P2-04', zone: 'Parking Level 2', status: 'offline' },
  { id: 'ap-srv', kind: 'access', name: 'Access Point: Server Room 2B', zone: 'Server Room', status: 'online' },
  { id: 'ap-lobby', kind: 'access', name: 'Access Point: Main Lobby', zone: 'Lobby', status: 'online' },
  { id: 'ms-exec', kind: 'sensor', name: 'Motion Sensor: Executive Suite', zone: 'Floor 4', status: 'online' },
]

const KIND_ICON: Record<DeviceKind, string> = {
  camera: '📹',
  access: '🚪',
  sensor: '📡',
}

const STATUS_STYLE: Record<DeviceStatus, { bg: string; text: string; dot: string; label: string }> = {
  online: { bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E', label: 'Online' },
  offline: { bg: '#FEF2F2', text: '#DC2626', dot: '#EF4444', label: 'Offline' },
  degraded: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', label: 'Degraded' },
}

interface MosaicTile {
  name: string
  active: boolean
  timestamp: string
}

const MOSAIC: MosaicTile[] = [
  { name: 'C4 · Server Room Corridor', active: true, timestamp: '14:38:42' },
  { name: 'A7 · Executive Suite', active: true, timestamp: '14:38:42' },
  { name: 'P2-04 · Parking Level 2', active: false, timestamp: '12:30:11' },
  { name: 'W2 · Loading Dock B', active: true, timestamp: '14:38:42' },
]

export default function MonitorView() {
  return (
    <div className="space-y-6">
      {/* Devices */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#374151]">
          Devices ({DEVICES.length})
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {DEVICES.map((d) => {
            const s = STATUS_STYLE[d.status]
            return (
              <div
                key={d.id}
                className="rounded-lg bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]"
                style={
                  d.status === 'offline'
                    ? { borderLeft: '4px solid #EF4444' }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="text-xl leading-none">
                      {KIND_ICON[d.kind]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#111827]">
                        {d.name}
                      </p>
                      <p className="truncate text-xs text-[#6B7280]">{d.zone}</p>
                    </div>
                  </div>
                  <span
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: s.dot }}
                    />
                    {s.label}
                  </span>
                </div>

                <div className="mt-3 flex gap-2 border-t border-[#F3F4F6] pt-3">
                  {d.kind === 'access' ? (
                    <>
                      <button className="rounded-md border border-[#D1D5DB] px-2.5 py-1 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
                        Lock
                      </button>
                      <button className="rounded-md border border-[#D1D5DB] px-2.5 py-1 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
                        Unlock
                      </button>
                      <button className="rounded-md bg-[#2563EB] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8]">
                        Grant Access
                      </button>
                    </>
                  ) : d.kind === 'camera' ? (
                    <>
                      <button className="rounded-md border border-[#D1D5DB] px-2.5 py-1 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
                        View Feed
                      </button>
                      <button
                        disabled={d.status === 'offline'}
                        className="rounded-md border border-[#D1D5DB] px-2.5 py-1 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Reboot
                      </button>
                    </>
                  ) : (
                    <button className="rounded-md border border-[#D1D5DB] px-2.5 py-1 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
                      Test Sensor
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Video Mosaic */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#374151]">
          Video Mosaic
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MOSAIC.map((tile) => (
            <div
              key={tile.name}
              className="relative aspect-video overflow-hidden rounded-lg"
              style={{
                background:
                  'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
              }}
            >
              {/* faux scanlines */}
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)',
                }}
              />
              <span className="absolute left-2 top-2 text-[11px] font-medium text-white/90">
                {tile.name}
              </span>
              {tile.active ? (
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-[#EF4444] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Live
                </span>
              ) : (
                <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                  No Signal
                </span>
              )}
              {!tile.active && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-[#6B7280]">
                    ⚠ Camera offline
                  </span>
                </div>
              )}
              <span className="absolute bottom-2 right-2 font-mono text-[10px] text-white/70">
                {tile.timestamp}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
