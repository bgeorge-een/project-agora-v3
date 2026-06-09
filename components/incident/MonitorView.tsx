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
  camera: 'videocam',
  access: 'door_front',
  sensor: 'sensors',
}

const STATUS_STYLE: Record<
  DeviceStatus,
  { bg: string; text: string; icon: string; label: string }
> = {
  online: { bg: 'transparent', text: '#9CA3AF', icon: 'check_circle', label: 'Online' },
  offline: { bg: '#1C0A0A', text: '#FCA5A5', icon: 'cancel', label: 'Offline' },
  degraded: { bg: '#1A1502', text: '#FBBF24', icon: 'warning', label: 'Degraded' },
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
    <div className="space-y-6 bg-[#0F1117]">
      {/* Devices */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-white">
          Devices ({DEVICES.length})
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {DEVICES.map((d) => {
            const s = STATUS_STYLE[d.status]
            return (
              <div
                key={d.id}
                className="rounded-lg border border-[#273142] bg-[#171D29] p-4"
                style={
                  d.status === 'offline'
                    ? { borderLeft: '4px solid #EF4444' }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span
                      className="material-symbols-outlined leading-none text-[#9CA3AF]"
                      style={{ fontSize: '22px', lineHeight: 1 }}
                    >
                      {KIND_ICON[d.kind]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug text-white">
                        {d.name}
                      </p>
                      <p className="text-sm leading-snug text-[#9CA3AF]">{d.zone}</p>
                    </div>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      d.status === 'online' ? '' : 'border border-[#374151]'
                    }`}
                    style={{ backgroundColor: s.bg, color: s.text }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '14px', lineHeight: 1 }}
                    >
                      {s.icon}
                    </span>
                    {s.label}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-[#273142] pt-3">
                  {d.kind === 'access' ? (
                    <>
                      <button className="min-h-10 flex-1 rounded-md border border-[#374151] px-2.5 py-1 text-xs font-medium text-[#CBD5E0] transition-colors hover:bg-[#1F2937]">
                        Lock
                      </button>
                      <button className="min-h-10 flex-1 rounded-md border border-[#374151] px-2.5 py-1 text-xs font-medium text-[#CBD5E0] transition-colors hover:bg-[#1F2937]">
                        Unlock
                      </button>
                      <button className="min-h-10 flex-[1.4] rounded-md bg-[#1D4ED8] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB]">
                        Grant Access
                      </button>
                    </>
                  ) : d.kind === 'camera' ? (
                    <>
                      <button className="min-h-10 flex-1 rounded-md border border-[#374151] px-2.5 py-1 text-xs font-medium text-[#CBD5E0] transition-colors hover:bg-[#1F2937]">
                        View Feed
                      </button>
                      <button
                        disabled={d.status === 'offline'}
                        className="min-h-10 flex-1 rounded-md border border-[#374151] px-2.5 py-1 text-xs font-medium text-[#CBD5E0] transition-colors hover:bg-[#1F2937] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Reboot
                      </button>
                    </>
                  ) : (
                    <button className="min-h-10 flex-1 rounded-md border border-[#374151] px-2.5 py-1 text-xs font-medium text-[#CBD5E0] transition-colors hover:bg-[#1F2937]">
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
        <h2 className="mb-3 text-base font-semibold text-white">
          Video Mosaic
        </h2>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
                <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold text-[#E5E7EB]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                  Live
                </span>
              ) : (
                <span className="absolute right-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-[#9CA3AF]">
                  No Signal
                </span>
              )}
              {!tile.active && (
                <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                  <span
                    className="material-symbols-outlined text-[#6B7280]"
                    style={{ fontSize: '18px', lineHeight: 1 }}
                  >
                    warning
                  </span>
                  <span className="text-xs font-medium text-[#6B7280]">
                    Camera offline
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
