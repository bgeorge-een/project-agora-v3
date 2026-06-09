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
    funnelPath: 'M42 0 H378 L346 160 H74 Z',
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
    funnelPath: 'M74 160 H346 L306 320 H114 Z',
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
    funnelPath: 'M114 320 H306 L250 480 H170 Z',
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
    funnelPath: 'M170 480 H250 V640 H170 Z',
  },
]

function LayerShapes({ layer }: { layer: Layer }) {
  if (layer.shape === 'dots') {
    return (
      <g>
        {Array.from({ length: layer.shapeCount }).map((_, i) => {
          const row = Math.floor(i / 18)
          const col = i % 18
          const x = 88 + col * 13 + ((row % 2) * 5)
          const y = 28 + row * 13
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
          const x = 128 + col * 15 + ((row % 2) * 6)
          const y = 204 + row * 24
          return <rect key={i} x={x} y={y} width="9" height="9" fill={layer.accent} opacity="0.86" />
        })}
      </g>
    )
  }

  if (layer.shape === 'triangles') {
    return (
      <g>
        {[
          [178, 408],
          [222, 408],
          [200, 370],
          [200, 448],
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
        d="M210 512 L224 558 H270 L233 588 L247 636 L210 607 L173 636 L187 588 L150 558 H196 Z"
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
    <div className="absolute inset-x-4 inset-y-0 flex items-center justify-center sm:inset-x-6 lg:inset-x-5">
      <svg
        viewBox="0 0 420 640"
        className="h-full w-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Funnel reducing raw signals into events, alerts, and incidents"
      >
        <ellipse cx="210" cy="0" rx="168" ry="20" fill="none" stroke="#1E6091" strokeWidth="3" />
        {LAYERS.map((layer) => (
          <FunnelBand key={layer.num} layer={layer} />
        ))}

        <line x1="42" y1="0" x2="170" y2="480" stroke="#1E6091" strokeWidth="3" />
        <line x1="378" y1="0" x2="250" y2="480" stroke="#1E6091" strokeWidth="3" />

        <line x1="306" y1="400" x2="360" y2="400" stroke="#EA580C" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x="366" y="404" fill="#C2410C" fontSize="13" fontWeight="700">
          Notification
        </text>
      </svg>
    </div>
  )
}

function LayerRow({ layer }: { layer: Layer }) {
  return (
    <div className="min-h-[clamp(8.75rem,12vw,10rem)] border-b border-[#D6E3F1] px-5 last:border-b-0 sm:px-7">
      <div className="flex h-full flex-col justify-center py-5">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-black text-white"
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
            <h3 className="flex flex-wrap items-baseline gap-x-2 text-[clamp(1.25rem,2vw,1.5rem)] font-black leading-[1.15] text-[#0F172A]">
              <span>{layer.label}</span>
              <span className="text-[clamp(1rem,1.5vw,1.125rem)] font-extrabold text-[#173B57]">
                ({layer.sub})
              </span>
            </h3>
          </div>
        </div>
        <p className="mt-3 max-w-[68ch] text-[clamp(0.95rem,1.15vw,1rem)] leading-[1.5] text-[#173B57]">
          {layer.description}
        </p>
      </div>
    </div>
  )
}

export default function SignalFunnelDiagram() {
  return (
    <section className="bg-[#EFF6FF] px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Signal hierarchy"
          title="From Raw Signal to Actionable Incident"
          subtitle="Each definition maps directly to the same layer in the funnel: dots become events, events become alerts, and only accepted/correlated alerts become incidents."
        />

        <div className="mt-12 overflow-hidden rounded-xl border border-[#D6E3F1] bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,40%)]">
            <div className="grid lg:[grid-template-rows:repeat(4,minmax(clamp(8.75rem,12vw,10rem),1fr))]">
              {LAYERS.map((layer) => (
                <LayerRow key={layer.num} layer={layer} />
              ))}
            </div>

            <div className="relative min-h-[clamp(24rem,65vw,40rem)] border-t border-[#D6E3F1] bg-[#F8FBFF] lg:min-h-0 lg:border-l lg:border-t-0">
              <FunnelGraphic />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#C4B5FD] bg-[#F5F3FF] px-4 py-2 text-sm font-bold text-[#5B21B6]">
            <span>Incident closed</span>
            <span aria-hidden>→</span>
            <span>Case file when promoted</span>
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
