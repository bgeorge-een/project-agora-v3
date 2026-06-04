import SectionHeader from '@/components/ui/SectionHeader'

interface Agent {
  name: string
  runs: string
  io: string
  color: string
  tint: string
  textColor: string
}

const AGENTS: Agent[] = [
  {
    name: 'Signal Normalizer',
    runs: 'Sync · <100ms · No AI',
    io: 'Raw signal → canonical Signal',
    color: '#6B7280',
    tint: '#F3F4F6',
    textColor: '#374151',
  },
  {
    name: 'Enrichment Agent',
    runs: 'Async · Claude tool use',
    io: 'Signal → resolved entities + evidence + case links',
    color: '#2563EB',
    tint: '#EFF6FF',
    textColor: '#1E40AF',
  },
  {
    name: 'Analysis Agent',
    runs: 'Async · after enrichment',
    io: 'Enriched signal → severity, type, scored Alert',
    color: '#7C3AED',
    tint: '#F5F3FF',
    textColor: '#5B21B6',
  },
]

const PARALLEL: Agent[] = [
  {
    name: 'Recommendation Agent',
    runs: 'Async · consumes Analysis output',
    io: 'Analysis → Next Best Action + alternatives',
    color: '#16A34A',
    tint: '#F0FDF4',
    textColor: '#15803D',
  },
  {
    name: 'Explanation Agent',
    runs: 'Async · consumes Analysis output',
    io: 'Analysis → human-readable rationale',
    color: '#16A34A',
    tint: '#F0FDF4',
    textColor: '#15803D',
  },
]

const ENRICHMENT_TOOLS = ['entity_resolver', 'evidence_gatherer', 'case_linker']

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div
      className="flex h-full flex-col rounded-lg bg-white p-5"
      style={{
        borderTop: `4px solid ${agent.color}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <h3 className="text-sm font-bold leading-snug text-[#111827]">
        {agent.name}
      </h3>
      <span
        className="mt-2 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
        style={{ backgroundColor: agent.tint, color: agent.textColor }}
      >
        {agent.runs}
      </span>
      <p className="mt-3 text-xs leading-relaxed text-[#6B7280]">{agent.io}</p>
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex items-center justify-center text-2xl font-bold text-[#9CA3AF] lg:px-1">
      →
    </div>
  )
}

export default function AgentPipelineDiagram() {
  return (
    <section className="bg-white px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="The AI core"
          title="Agentic Enrichment Pipeline"
          subtitle="Every signal passes through five agents before any human sees it. Partial results stream to the app UI as each completes."
        />

        <div className="mt-12 rounded-2xl bg-[#F9FAFB] p-6 sm:p-8">
          {/* Raw signal + first three agents */}
          <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[auto_1fr_auto_1fr_auto_1fr]">
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#D1D5DB] bg-white px-5 py-4 text-center text-sm font-bold text-[#374151]">
              Raw Signal
            </div>
            <Arrow />
            <AgentCard agent={AGENTS[0]} />
            <Arrow />
            <AgentCard agent={AGENTS[1]} />
            <Arrow />
            <AgentCard agent={AGENTS[2]} />
          </div>

          {/* Enrichment tools fan-out */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
              Enrichment Agent tools (parallel fan-out)
            </span>
            <div className="flex flex-wrap gap-2">
              {ENRICHMENT_TOOLS.map((tool) => (
                <span
                  key={tool}
                  className="rounded-md border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 font-mono text-xs text-[#1E40AF]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Analysis fans out to parallel rec + explanation */}
          <div className="mt-6 flex items-center gap-2">
            <span className="text-2xl font-bold text-[#9CA3AF]">↓</span>
            <span className="text-xs font-semibold text-[#6B7280]">
              Analysis output fans out to two agents running in parallel
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PARALLEL.map((agent) => (
              <AgentCard key={agent.name} agent={agent} />
            ))}
          </div>

          {/* To human */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-[#9CA3AF]">→</span>
            <div className="rounded-lg border-2 border-[#172130] bg-white px-5 py-3 text-sm font-bold text-[#172130]">
              Human Review UI
            </div>
          </div>
        </div>

        <p className="mt-6 max-w-3xl rounded-lg border-l-4 border-[#16A34A] bg-[#F0FDF4] px-4 py-3 text-sm leading-relaxed text-[#15803D]">
          Recommendation and Explanation agents run in parallel — both consume
          the Analysis output.
        </p>
      </div>
    </section>
  )
}
