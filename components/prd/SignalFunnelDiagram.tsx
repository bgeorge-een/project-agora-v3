import SectionHeader from '@/components/ui/SectionHeader'

type Shape = 'dots' | 'squares' | 'triangles' | 'stars'

interface Layer {
  num: number
  icon: string
  label: string
  sub: string
  description: string
  shape: Shape
  shapeCount: number
  bg: string
  accent: string
  funnelPath: string
  note?: string
}

const LAYERS: Layer[] = [
  {
    num: 1,
    icon: 'sensors',
    label: 'Signal',
    sub: 'Ingest & Log',
    description:
      'Raw device telemetry. A single data point from one device, such as a motion pixel change, door contact, badge scan, temperature reading, or camera frame. Visible to the system only.',
    shape: 'dots',
    shapeCount: 180,
    bg: '#DBEAFE',
    accent: '#1D4ED8',
    funnelPath: 'M64 0 H336 L308 112 H92 Z',
  },
  {
    num: 2,
    icon: 'event_note',
    label: 'Event',
    sub: 'Process & Audit',
    description:
      'A normalized state change or threshold violation from one or more signals. Logged and queryable for audit, but not necessarily actionable.',
    shape: 'squares',
    shapeCount: 30,
    bg: '#BFDBFE',
    accent: '#2563EB',
    funnelPath: 'M92 112 H308 L280 202 H120 Z',
  },
  {
    num: 3,
    icon: 'warning',
    label: 'Alert',
    sub: 'Alert & Acknowledge',
    description:
      'An event that violates a security policy and reaches the operator queue. Requires triage: dismiss with feedback or accept into an incident workflow.',
    shape: 'triangles',
    shapeCount: 4,
    bg: '#60A5FA',
    accent: '#1D4ED8',
    funnelPath: 'M120 202 H280 L238 302 H162 Z',
    note: 'Notification',
  },
  {
    num: 4,
    icon: 'emergency',
    label: 'Incident',
    sub: 'Investigate & Resolve',
    description:
      'A cluster of correlated alarms and context that demands a workflow, such as forced door plus motion plus video confirmation. Resolved incidents can create a case file.',
    shape: 'stars',
    shapeCount: 1,
    bg: '#1E3A5F',
    accent: '#93C5FD',
    funnelPath: 'M162 302 H238 V402 H162 Z',
  },
]

function LayerShapes({ layer }: { layer: Layer }) {
  if (layer.shape === 'dots') {
    return (
      <g>
        {Array.from({ length: layer.shapeCount }).map((_, i) => {
          const row = Math.floor(i / 18)
          const col = i % 18
          const x = 82 + col * 13 + ((row % 2) * 5)
          const y = 12 + row * 10
          return <circle key={i} cx={x} cy={y} r="2.5" fill={layer.accent} opacity="0.72" />
        })}
      </g>
    )
  }

  if (layer.shape === 'squares') {
    return (
      <g>
        {Array.from({ length: layer.shapeCount }).map((_, i) => {
          const row = Math.floor(i / 10)
          const col = i % 10
          const x = 132 + col * 15 + ((row % 2) * 6)
          const y = 132 + row * 18
          return <rect key={i} x={x} y={y} width="9" height="9" fill={layer.accent} opacity="0.86" />
        })}
      </g>
    )
  }

  if (layer.shape === 'triangles') {
    return (
      <g>
        {[
          [178, 248],
          [222, 248],
          [200, 216],
          [200, 276],
        ].map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y - 16} L${x - 17} ${y + 15} H${x + 17} Z`}
            fill="#DBEAFE"
            opacity="0.9"
          />
        ))}
      </g>
    )
  }

  return (
    <g>
      <path
        d="M200 328 L212 366 H252 L220 389 L232 428 L200 404 L168 428 L180 389 L148 366 H188 Z"
        fill={layer.accent}
      />
    </g>
  )
}

function FunnelBand({ layer }: { layer: Layer }) {
  return (
    <g>
      <path d={layer.funnelPath} fill={layer.bg} stroke="#1E6091" strokeWidth="2.5" />
      <clipPath id={`clip-${layer.num}`}>
        <path d={layer.funnelPath} />
      </clipPath>
      <g clipPath={`url(#clip-${layer.num})`}>
        <LayerShapes layer={layer} />
      </g>
    </g>
  )
}

function FunnelGraphic() {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 460 470"
        className="h-[470px] w-full max-w-[520px]"
        role="img"
        aria-label="Funnel reducing raw signals into events, alerts, and incidents"
      >
        <ellipse cx="200" cy="0" rx="137" ry="18" fill="none" stroke="#1E6091" strokeWidth="3" />
        {LAYERS.map((layer) => (
          <FunnelBand key={layer.num} layer={layer} />
        ))}

        <line x1="64" y1="0" x2="162" y2="302" stroke="#1E6091" strokeWidth="3" />
        <line x1="336" y1="0" x2="238" y2="302" stroke="#1E6091" strokeWidth="3" />
        <line x1="162" y1="402" x2="162" y2="452" stroke="#1E6091" strokeWidth="3" />
        <line x1="238" y1="402" x2="238" y2="452" stroke="#1E6091" strokeWidth="3" />

        <line x1="280" y1="252" x2="374" y2="252" stroke="#EA580C" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="385" y="256" fill="#C2410C" fontSize="13" fontWeight="700">
          Notification
        </text>

        <line x1="200" y1="452" x2="200" y2="466" stroke="#64748B" strokeWidth="1.5" />
        <text x="186" y="468" fill="#64748B" fontSize="13">
          resolved
        </text>
      </svg>

      <div className="mt-2 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-lg border border-[#C4B5FD] bg-[#F5F3FF] px-3 py-2 text-sm font-bold text-[#5B21B6]">
          <span>Incident closed</span>
          <span aria-hidden>→</span>
          <span>Case file when promoted</span>
        </div>
      </div>
    </div>
  )
}

function LayerRow({ layer }: { layer: Layer }) {
  return (
    <div className="grid min-h-[112px] grid-cols-[minmax(0,1fr)_160px] items-center gap-5 border-b border-[#D6E3F1] last:border-b-0">
      <div className="py-5">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
            style={{ backgroundColor: layer.accent }}
          >
            {layer.num}
          </span>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: layer.bg, color: layer.accent }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, lineHeight: 1 }}>
              {layer.icon}
            </span>
          </span>
          <div className="min-w-0">
            <h3 className="text-2xl font-black leading-tight text-[#0F172A]">
              {layer.num}. {layer.label}{' '}
              <span className="text-xl font-extrabold text-[#173B57]">({layer.sub})</span>
            </h3>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-[1.45] text-[#173B57]">
          {layer.description}
        </p>
      </div>

      <div className="hidden items-center justify-center lg:flex">
        <span
          className="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide"
          style={{ borderColor: layer.accent, color: layer.accent, backgroundColor: layer.bg }}
        >
          {layer.shape}
        </span>
      </div>
    </div>
  )
}

export default function SignalFunnelDiagram() {
  return (
    <section className="bg-[#EFF6FF] px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Signal hierarchy"
          title="From Raw Signal to Actionable Incident"
          subtitle="Each definition maps directly to the same layer in the funnel: dots become events, events become alerts, and only accepted/correlated alerts become incidents."
        />

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
          <div className="overflow-hidden rounded-xl border border-[#D6E3F1] bg-white shadow-sm">
            {LAYERS.map((layer) => (
              <LayerRow key={layer.num} layer={layer} />
            ))}
          </div>

          <div className="flex items-center justify-center rounded-xl border border-[#D6E3F1] bg-white/70 p-6 shadow-sm">
            <FunnelGraphic />
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-[#D6E3F1] bg-white p-5 shadow-sm">
          <div className="flex gap-3">
            <span
              className="material-symbols-outlined shrink-0 text-[#7C3AED]"
              style={{ fontSize: 24, lineHeight: 1 }}
            >
              info
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Why Case is an offshoot, not a funnel layer
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-[#475569]">
                The funnel represents volume reduction. Case breaks that pattern: not every Incident becomes a
                Case, one Case can span multiple Incidents or a Campaign, and Cases can be opened manually.
                Case is a deliberate forensic investigation triggered after or alongside incident resolution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
