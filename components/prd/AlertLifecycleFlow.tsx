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
  titleSize = 12,
}: SvgNodeProps) {
  const cx = x + w / 2
  const cy = y + h / 2
  return (
    <g filter="url(#lc-node-shadow)">
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
          fontSize={9.5}
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

interface LaneLabelProps {
  x: number
  cy: number
  text: string
  color: string
}

function LaneLabel({ x, cy, text, color }: LaneLabelProps) {
  return (
    <text
      x={x}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily={FONT}
      fontSize={12}
      fontWeight={700}
      fill={color}
      transform={`rotate(-90 ${x} ${cy})`}
      style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
    >
      {text}
    </text>
  )
}

const CARDINALITIES = [
  'many Signals → 1 Alert',
  '1 Alert (accepted) → 1 Incident',
  '1+ Incidents → 1 Case',
  'many Incidents → 1 Campaign',
]

export default function AlertLifecycleFlow() {
  return (
    <section className="bg-white px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="End to end"
          title="Alert + Case Lifecycle"
          subtitle="Two lanes: reactive (confirmed signals → incidents) and deterrence (leading indicators → proactive action), closing into a shared learning loop."
        />

        <div className="mt-12 rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-6">
          <svg
            viewBox="0 0 960 500"
            width="100%"
            role="img"
            aria-label="Alert and case lifecycle swimlane diagram"
            style={{ display: 'block' }}
          >
            <defs>
              <marker
                id="lc-arrow-blue"
                markerWidth="9"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="#1D4ED8" />
              </marker>
              <marker
                id="lc-arrow-amber"
                markerWidth="9"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="#B45309" />
              </marker>
              <marker
                id="lc-arrow-green"
                markerWidth="9"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="#15803D" />
              </marker>
              <marker
                id="lc-arrow-gray"
                markerWidth="9"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="#6B7280" />
              </marker>
              <filter
                id="lc-node-shadow"
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

            <rect x="0" y="0" width="960" height="500" fill="#FFFFFF" />

            {/* ---- Lane background strips ---- */}
            {/* Reactive lane */}
            <rect x="36" y="20" width="904" height="180" rx="10" fill="#EFF6FF" />
            {/* Deterrence lane */}
            <rect
              x="36"
              y="216"
              width="904"
              height="120"
              rx="10"
              fill="#FFFBEB"
            />
            {/* Closed loop lane */}
            <rect
              x="36"
              y="352"
              width="904"
              height="120"
              rx="10"
              fill="#F0FDF4"
            />

            {/* ---- Lane labels ---- */}
            <LaneLabel x={22} cy={110} text="Reactive Lane" color="#1D4ED8" />
            <LaneLabel x={22} cy={276} text="Deterrence Lane" color="#B45309" />
            <LaneLabel x={22} cy={412} text="Closed Loop" color="#15803D" />

            {/* ================= REACTIVE LANE ================= */}
            {/* Row 1 connectors (y center 70) */}
            <line
              x1="160"
              y1="70"
              x2="180"
              y2="70"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-blue)"
            />
            <line
              x1="400"
              y1="70"
              x2="420"
              y2="70"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-blue)"
            />
            <line
              x1="540"
              y1="70"
              x2="560"
              y2="70"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-blue)"
            />
            <line
              x1="680"
              y1="70"
              x2="700"
              y2="70"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-blue)"
            />

            {/* Device/Signal */}
            <SvgNode
              x={56}
              y={50}
              w={104}
              h={40}
              fill="#1D4ED8"
              textColor="#FFFFFF"
              title="Device / Signal"
            />
            {/* Platform box (wide) */}
            <SvgNode
              x={180}
              y={48}
              w={220}
              h={44}
              fill="#172130"
              textColor="#FFFFFF"
              title="Platform Pipeline"
              subtitle="Normalize → Enrich → Analyze → Recommend+Explain"
              titleSize={12}
            />
            {/* Alert in Queue */}
            <SvgNode
              x={420}
              y={50}
              w={120}
              h={40}
              fill="#1D4ED8"
              textColor="#FFFFFF"
              title="Alert in Queue"
            />
            {/* Operator Triage */}
            <SvgNode
              x={560}
              y={50}
              w={120}
              h={40}
              fill="#1D4ED8"
              textColor="#FFFFFF"
              title="Operator Triage"
            />

            {/* Decision diamond: Accept? (center 760,70) */}
            <g filter="url(#lc-node-shadow)">
              <polygon
                points="760,42 808,70 760,98 712,70"
                fill="#FFFFFF"
                stroke="#1D4ED8"
                strokeWidth={1.75}
              />
              <text
                x="760"
                y="70"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={FONT}
                fontSize={12}
                fontWeight={700}
                fill="#1D4ED8"
              >
                Accept?
              </text>
            </g>

            {/* Accept? -> Incident (Yes, down) */}
            <path
              d="M760 98 C 760 120, 720 120, 720 138"
              fill="none"
              stroke="#1D4ED8"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-blue)"
            />
            <text
              x="700"
              y="118"
              fontFamily={FONT}
              fontSize={10}
              fontWeight={700}
              fill="#15803D"
            >
              Yes
            </text>
            {/* Accept? -> Dismissed (No, right/down) */}
            <path
              d="M808 70 C 850 70, 858 120, 858 138"
              fill="none"
              stroke="#6B7280"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-gray)"
            />
            <text
              x="826"
              y="100"
              fontFamily={FONT}
              fontSize={10}
              fontWeight={700}
              fill="#6B7280"
            >
              No
            </text>

            {/* Incident */}
            <SvgNode
              x={660}
              y={138}
              w={120}
              h={40}
              fill="#1E3A5F"
              textColor="#FFFFFF"
              title="Incident"
            />
            {/* Dismissed */}
            <SvgNode
              x={790}
              y={138}
              w={140}
              h={40}
              fill="#6B7280"
              textColor="#FFFFFF"
              title="Dismissed"
              subtitle="+ FeedbackRecord"
            />

            {/* ================= DETERRENCE LANE ================= */}
            {/* connectors row center 276 */}
            <line
              x1="216"
              y1="276"
              x2="236"
              y2="276"
              stroke="#B45309"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-amber)"
            />
            <line
              x1="372"
              y1="276"
              x2="392"
              y2="276"
              stroke="#B45309"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-amber)"
            />
            <line
              x1="512"
              y1="276"
              x2="532"
              y2="276"
              stroke="#B45309"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-amber)"
            />
            <line
              x1="678"
              y1="276"
              x2="698"
              y2="276"
              stroke="#B45309"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-amber)"
            />
            <line
              x1="818"
              y1="276"
              x2="838"
              y2="276"
              stroke="#B45309"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-amber)"
            />

            <SvgNode
              x={56}
              y={256}
              w={160}
              h={40}
              fill="#B45309"
              textColor="#FFFFFF"
              title="External Context Signal"
              titleSize={11}
            />
            <SvgNode
              x={236}
              y={256}
              w={136}
              h={40}
              fill="#B45309"
              textColor="#FFFFFF"
              title="Deterrence Engine"
              titleSize={11}
            />
            <SvgNode
              x={392}
              y={256}
              w={120}
              h={40}
              fill="#B45309"
              textColor="#FFFFFF"
              title="Deterrence Alert"
              titleSize={11}
            />
            <SvgNode
              x={532}
              y={256}
              w={146}
              h={40}
              fill="#B45309"
              textColor="#FFFFFF"
              title="Operator / Auto-trigger"
              titleSize={11}
            />
            <SvgNode
              x={698}
              y={256}
              w={120}
              h={40}
              fill="#B45309"
              textColor="#FFFFFF"
              title="Deterrence Playbook"
              titleSize={11}
            />
            <SvgNode
              x={838}
              y={256}
              w={96}
              h={40}
              fill="#B45309"
              textColor="#FFFFFF"
              title="Proactive Actions"
              titleSize={10}
            />

            {/* ================= CLOSED LOOP LANE ================= */}
            {/* feed-ins from above lanes into Case Closed */}
            {/* Incident -> Case (into closed loop) */}
            <path
              d="M720 178 C 720 210, 150 210, 150 392"
              fill="none"
              stroke="#1E3A5F"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              markerEnd="url(#lc-arrow-green)"
            />

            <line
              x1="248"
              y1="412"
              x2="268"
              y2="412"
              stroke="#15803D"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-green)"
            />
            <line
              x1="420"
              y1="412"
              x2="440"
              y2="412"
              stroke="#15803D"
              strokeWidth={1.75}
              markerEnd="url(#lc-arrow-green)"
            />

            <SvgNode
              x={88}
              y={392}
              w={160}
              h={40}
              fill="#15803D"
              textColor="#FFFFFF"
              title="Case Closed / Outcome"
              titleSize={11}
            />
            <SvgNode
              x={268}
              y={392}
              w={152}
              h={40}
              fill="#15803D"
              textColor="#FFFFFF"
              title="FeedbackRecord"
            />
            <SvgNode
              x={440}
              y={392}
              w={180}
              h={40}
              fill="#15803D"
              textColor="#FFFFFF"
              title="Platform Learning Loop ↺"
              titleSize={11}
            />

            {/* Learning loop curved arrow back to Platform / Signal Normalizer */}
            <path
              d="M620 412 C 760 412, 820 412, 820 360 C 820 200, 300 230, 290 92"
              fill="none"
              stroke="#15803D"
              strokeWidth={1.75}
              strokeDasharray="5 4"
              markerEnd="url(#lc-arrow-green)"
            />
            <text
              x="700"
              y="438"
              fontFamily={FONT}
              fontSize={10}
              fontWeight={600}
              fill="#15803D"
            >
              feeds back into Signal Normalizer
            </text>
          </svg>
        </div>

        {/* Cardinalities */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {CARDINALITIES.map((c) => (
            <span
              key={c}
              className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 font-mono text-xs text-[#374151]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
