import SectionHeader from '@/components/ui/SectionHeader'

const FONT = 'Inter, system-ui, sans-serif'

interface SvgNodeProps {
  x: number
  y: number
  w: number
  h: number
  fill: string
  textColor: string
  title: string
  subtitle?: string
  stroke?: string
  strokeWidth?: number
  titleSize?: number
}

function SvgNode({
  x,
  y,
  w,
  h,
  fill,
  textColor,
  title,
  subtitle,
  stroke,
  strokeWidth,
  titleSize = 13,
}: SvgNodeProps) {
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <g filter="url(#node-shadow)">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={6}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <text
        x={cx}
        y={subtitle ? cy - 5 : cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={FONT}
        fontSize={titleSize}
        fontWeight={700}
        fill={textColor}
      >
        {title}
      </text>
      {subtitle && (
        <text
          x={cx}
          y={cy + 11}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily={FONT}
          fontSize={10}
          fontWeight={500}
          fill={textColor}
          opacity={0.85}
        >
          {subtitle}
        </text>
      )}
    </g>
  )
}

interface LegendItem {
  color: string
  label: string
}

const LEGEND: LegendItem[] = [
  { color: '#374151', label: 'Signal Normalizer' },
  { color: '#1D4ED8', label: 'Enrichment (Claude tool use)' },
  { color: '#7C3AED', label: 'Analysis' },
  { color: '#15803D', label: 'Recommendation + Explanation' },
]

export default function AgentPipelineDiagram() {
  return (
    <section className="bg-white px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="The AI core"
          title="Agentic Enrichment Pipeline"
          subtitle="Every signal passes through five agents before any human sees it. Partial results stream to the app UI as each completes."
        />

        <div className="mt-12 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-6">
          <svg
            viewBox="0 0 900 420"
            width="100%"
            role="img"
            aria-label="Agentic enrichment pipeline flow diagram"
            style={{ display: 'block' }}
          >
            <defs>
              <marker
                id="ap-arrow-gray"
                markerWidth="9"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="#6B7280" />
              </marker>
              <marker
                id="ap-arrow-blue"
                markerWidth="9"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="#1D4ED8" />
              </marker>
              <marker
                id="ap-arrow-purple"
                markerWidth="9"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="#7C3AED" />
              </marker>
              <marker
                id="ap-arrow-green"
                markerWidth="9"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="#15803D" />
              </marker>
              <marker
                id="ap-arrow-teal"
                markerWidth="9"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="#0E7490" />
              </marker>
              <filter
                id="node-shadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="160%"
              >
                <feDropShadow
                  dx="0"
                  dy="1"
                  stdDeviation="2"
                  floodOpacity="0.15"
                />
              </filter>
            </defs>

            <rect x="0" y="0" width="900" height="420" fill="#F9FAFB" />

            {/*
              Vertical centerline of the main pipeline row = y 175 (nodes 150-200).
              Columns:
                Raw Signal       x 8   w 96
                Normalizer       x 128 w 150
                Enrichment       x 300 w 150
                Tools            x 480 w 140 (three rows: y 80 / 157 / 234)
                Analysis         x 660 w 150
              Parallel agents (right edge):
                Recommendation   x 660 w 200 y 60
                Explanation      x 660 w 200 y 300
              Human Review UI    x 300 w 180 y 350
            */}

            {/* Raw Signal -> Normalizer */}
            <line
              x1="104"
              y1="175"
              x2="124"
              y2="175"
              stroke="#6B7280"
              strokeWidth={2}
              markerEnd="url(#ap-arrow-gray)"
            />
            {/* Normalizer -> Enrichment */}
            <line
              x1="278"
              y1="175"
              x2="296"
              y2="175"
              stroke="#6B7280"
              strokeWidth={2}
              markerEnd="url(#ap-arrow-gray)"
            />

            {/* Enrichment -> three tools (fan out) */}
            <path
              d="M450 168 C 466 168, 466 98, 476 98"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#ap-arrow-blue)"
            />
            <line
              x1="450"
              y1="175"
              x2="476"
              y2="175"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#ap-arrow-blue)"
            />
            <path
              d="M450 182 C 466 182, 466 252, 476 252"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#ap-arrow-blue)"
            />

            {/* three tools -> Analysis (fan in) */}
            <path
              d="M620 98 C 640 98, 640 168, 656 168"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#ap-arrow-blue)"
            />
            <line
              x1="620"
              y1="175"
              x2="656"
              y2="175"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#ap-arrow-blue)"
            />
            <path
              d="M620 252 C 640 252, 640 182, 656 182"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#ap-arrow-blue)"
            />

            {/* Analysis -> Recommendation (up) */}
            <path
              d="M735 150 C 735 120, 745 86, 656 86"
              fill="none"
              stroke="#7C3AED"
              strokeWidth={1.75}
              markerEnd="url(#ap-arrow-purple)"
            />
            {/* Analysis -> Explanation (down) */}
            <path
              d="M735 200 C 735 260, 745 326, 656 326"
              fill="none"
              stroke="#7C3AED"
              strokeWidth={1.75}
              markerEnd="url(#ap-arrow-purple)"
            />

            {/* Recommendation -> Human Review UI */}
            <path
              d="M656 86 C 420 86, 400 350, 392 350"
              fill="none"
              stroke="#15803D"
              strokeWidth={1.75}
              markerEnd="url(#ap-arrow-green)"
            />
            {/* Explanation -> Human Review UI */}
            <path
              d="M656 326 C 470 326, 470 375, 484 375"
              fill="none"
              stroke="#0E7490"
              strokeWidth={1.75}
              markerEnd="url(#ap-arrow-teal)"
            />

            {/* ---- Nodes ---- */}
            <SvgNode
              x={8}
              y={150}
              w={96}
              h={50}
              fill="#F3F4F6"
              textColor="#374151"
              title="Raw Signal"
              stroke="#D1D5DB"
              strokeWidth={1.5}
              titleSize={12}
            />
            <SvgNode
              x={128}
              y={150}
              w={150}
              h={50}
              fill="#374151"
              textColor="#FFFFFF"
              title="Signal Normalizer"
              subtitle="Sync · <100ms"
            />
            <SvgNode
              x={300}
              y={150}
              w={150}
              h={50}
              fill="#1D4ED8"
              textColor="#FFFFFF"
              title="Enrichment Agent"
              subtitle="Async · Claude tool use"
            />

            {/* tools */}
            <SvgNode
              x={476}
              y={80}
              w={140}
              h={36}
              fill="#1D4ED8"
              textColor="#FFFFFF"
              title="entity_resolver"
              titleSize={12}
            />
            <SvgNode
              x={476}
              y={157}
              w={140}
              h={36}
              fill="#1D4ED8"
              textColor="#FFFFFF"
              title="evidence_gatherer"
              titleSize={12}
            />
            <SvgNode
              x={476}
              y={234}
              w={140}
              h={36}
              fill="#1D4ED8"
              textColor="#FFFFFF"
              title="case_linker"
              titleSize={12}
            />

            <SvgNode
              x={660}
              y={150}
              w={150}
              h={50}
              fill="#7C3AED"
              textColor="#FFFFFF"
              title="Analysis Agent"
              subtitle="Async · after enrichment"
            />

            {/* parallel agents */}
            <SvgNode
              x={656}
              y={60}
              w={204}
              h={52}
              fill="#15803D"
              textColor="#FFFFFF"
              title="Recommendation Agent"
              subtitle="NBA + 2 alternatives · sonnet-4-6"
            />
            <SvgNode
              x={656}
              y={300}
              w={204}
              h={52}
              fill="#0E7490"
              textColor="#FFFFFF"
              title="Explanation Agent"
              subtitle="Why this fired · sonnet-4-6"
            />

            {/* Human Review UI */}
            <SvgNode
              x={300}
              y={350}
              w={184}
              h={52}
              fill="#FFFFFF"
              textColor="#1D4ED8"
              title="Human Review UI"
              subtitle="Streaming to UI"
              stroke="#1D4ED8"
              strokeWidth={1.75}
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="inline-block h-3.5 w-3.5 rounded-sm"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className="text-xs font-medium text-[#374151]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 max-w-3xl rounded-lg border-l-4 border-[#15803D] bg-[#F0FDF4] px-4 py-3 text-sm leading-relaxed text-[#15803D]">
          Recommendation and Explanation agents run in parallel — both consume
          the Analysis Agent output.
        </p>
      </div>
    </section>
  )
}
