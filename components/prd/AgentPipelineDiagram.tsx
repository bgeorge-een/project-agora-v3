import SectionHeader from '@/components/ui/SectionHeader'

interface StageRowProps {
  stage: string
  children: React.ReactNode
}

function StageRow({ stage, children }: StageRowProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-4">
      <div className="flex shrink-0 items-center sm:w-20 sm:justify-end sm:pt-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">
          {stage}
        </span>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

interface NodeCardProps {
  borderColor: string
  background: string
  title: string
  subtitle?: string
  dashed?: boolean
  textColor?: string
}

function NodeCard({
  borderColor,
  background,
  title,
  subtitle,
  dashed = false,
  textColor = '#111827',
}: NodeCardProps) {
  const borderStyle: React.CSSProperties = dashed
    ? {
        border: `2px dashed ${borderColor}`,
        borderLeft: `4px solid ${borderColor}`,
      }
    : { borderLeft: `4px solid ${borderColor}` }
  return (
    <div
      style={{
        ...borderStyle,
        background,
        borderRadius: 8,
        padding: '10px 16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, color: textColor }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}

function DownArrow() {
  return (
    <div className="flex w-20 shrink-0 items-center justify-end pr-4">
      <span style={{ color: '#9CA3AF', fontSize: 20, lineHeight: 1 }}>↓</span>
    </div>
  )
}

function StageGap() {
  return (
    <div className="flex items-center" style={{ margin: '4px 0' }}>
      <DownArrow />
      <div className="flex-1" />
    </div>
  )
}

const TOOLS = ['entity_resolver', 'evidence_gatherer', 'case_linker']

const LEGEND = [
  { color: '#6B7280', label: 'No AI (normalize)' },
  { color: '#1D4ED8', label: 'Claude tool use (enrichment)' },
  { color: '#7C3AED', label: 'Analysis' },
  { color: '#15803D', label: 'Output agents (recommend / explain)' },
]

export default function AgentPipelineDiagram() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          label="The AI core"
          title="Agentic Enrichment Pipeline"
          subtitle="Every signal passes through the agent stack before any human sees it. Partial results stream to the app UI as each stage completes."
        />

        <div className="mt-10 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-6 lg:p-8">
          {/* STAGE 1 */}
          <StageRow stage="Stage 1">
            <NodeCard
              borderColor="#6B7280"
              background="#F9FAFB"
              title="Raw Signal"
              subtitle="Line cross · motion · access event · sensor"
            />
          </StageRow>

          <StageGap />

          {/* STAGE 2 */}
          <StageRow stage="Stage 2">
            <NodeCard
              borderColor="#374151"
              background="#F3F4F6"
              title="Signal Normalizer"
              subtitle="Sync · <100ms · No AI"
            />
          </StageRow>

          <StageGap />

          {/* STAGE 3 — Enrichment with parallel fan-out */}
          <StageRow stage="Stage 3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="lg:w-[min(17.5rem,38%)] lg:shrink-0">
                <NodeCard
                  borderColor="#1D4ED8"
                  background="#EFF6FF"
                  title="Enrichment Agent"
                  subtitle="Async · Claude tool use · parallel fan-out"
                />
              </div>
              <div className="hidden self-center px-1 text-xl text-[#9CA3AF] lg:block">
                →
              </div>
              <div
                className="flex-1 rounded-lg border p-3"
                style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {TOOLS.map((tool, i) => (
                    <div key={tool} className="flex items-center gap-2">
                      <span
                        className="rounded-md px-3 py-1.5 font-mono text-xs font-semibold"
                        style={{ background: '#1D4ED8', color: '#FFFFFF' }}
                      >
                        {tool}
                      </span>
                      {i < TOOLS.length - 1 && (
                        <span className="text-base text-[#60A5FA]">→</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-[#6B7280]">
                  Parallel tool calls — results merge back into the enrichment
                  context
                </div>
              </div>
            </div>
          </StageRow>

          <StageGap />

          {/* STAGE 4 */}
          <StageRow stage="Stage 4">
            <NodeCard
              borderColor="#7C3AED"
              background="#F5F3FF"
              title="Analysis Agent"
              subtitle="Async · runs after enrichment · campaign / pattern detection"
            />
          </StageRow>

          {/* split arrow into two parallel outputs */}
          <div className="flex items-center" style={{ margin: '4px 0' }}>
            <DownArrow />
            <div className="flex-1 text-xs italic text-[#9CA3AF]">
              splits into two parallel outputs
            </div>
          </div>

          {/* STAGE 5 — two parallel cards */}
          <StageRow stage="Stage 5">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <NodeCard
                  borderColor="#15803D"
                  background="#F0FDF4"
                  title="Recommendation Agent"
                  subtitle="Next best action + 2 alternatives"
                />
              </div>
              <div className="flex-1">
                <NodeCard
                  borderColor="#0E7490"
                  background="#ECFEFF"
                  title="Explanation Agent"
                  subtitle="Why this fired · claude-sonnet-4-6"
                />
              </div>
            </div>
          </StageRow>

          {/* U-bracket joining the two parallel cards back to one arrow */}
          <div className="flex items-stretch">
            <div className="w-20 shrink-0" />
            <div className="flex-1">
              <div
                style={{
                  height: 16,
                  margin: '0 12.5%',
                  borderBottom: '2px solid #CBD5E1',
                  borderLeft: '2px solid #CBD5E1',
                  borderRight: '2px solid #CBD5E1',
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              />
              <div className="flex justify-center">
                <span style={{ color: '#9CA3AF', fontSize: 20, lineHeight: 1 }}>
                  ↓
                </span>
              </div>
            </div>
          </div>

          {/* STAGE 6 */}
          <StageRow stage="Stage 6">
            <NodeCard
              borderColor="#2563EB"
              background="#EFF6FF"
              title="Human Review UI — Streaming"
              subtitle="Partial results render as each agent completes"
              dashed
              textColor="#1D4ED8"
            />
          </StageRow>
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
