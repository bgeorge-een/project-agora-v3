import SectionHeader from '@/components/ui/SectionHeader'

interface NodeProps {
  label: string
  sublabel?: string
  accent: string
  tint: string
  textColor: string
  variant?: 'solid' | 'soft'
}

function FlowNode({
  label,
  sublabel,
  accent,
  tint,
  textColor,
  variant = 'soft',
}: NodeProps) {
  if (variant === 'solid') {
    return (
      <div
        className="flex min-w-[120px] flex-col items-center justify-center rounded-lg px-4 py-3 text-center"
        style={{ backgroundColor: accent }}
      >
        <span className="text-sm font-bold text-white">{label}</span>
        {sublabel && (
          <span className="mt-0.5 text-[11px] text-white/80">{sublabel}</span>
        )}
      </div>
    )
  }
  return (
    <div
      className="flex min-w-[120px] flex-col items-center justify-center rounded-lg bg-white px-4 py-3 text-center"
      style={{
        border: `1.5px solid ${tint}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <span className="text-sm font-semibold" style={{ color: textColor }}>
        {label}
      </span>
      {sublabel && (
        <span className="mt-0.5 text-[11px] text-[#6B7280]">{sublabel}</span>
      )}
    </div>
  )
}

function Arrow({ color }: { color: string }) {
  return (
    <span
      className="self-center text-2xl font-bold"
      style={{ color }}
      aria-hidden
    >
      →
    </span>
  )
}

export default function AlertLifecycleFlow() {
  return (
    <section className="bg-white px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="End to end"
          title="Alert + Case Lifecycle"
          subtitle="Two lanes: reactive (confirmed signals → incidents) and deterrence (leading indicators → proactive action)."
        />

        {/* Reactive lane */}
        <div className="mt-12 rounded-2xl border-l-4 border-[#2563EB] bg-[#EFF6FF] p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <span className="rounded-full bg-[#2563EB] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Reactive Lane
            </span>
            <span className="text-xs text-[#6B7280]">
              Confirmed signals → incidents
            </span>
          </div>
          <div className="flex flex-wrap items-stretch gap-2">
            <FlowNode
              label="External Signal / Device"
              accent="#2563EB"
              tint="#BFDBFE"
              textColor="#1E40AF"
            />
            <Arrow color="#2563EB" />
            <FlowNode
              label="Platform Pipeline"
              sublabel="Normalize → Enrich → Analyze → Recommend + Explain"
              accent="#2563EB"
              tint="#BFDBFE"
              textColor="#1E40AF"
            />
            <Arrow color="#2563EB" />
            <FlowNode
              label="Alert in Queue"
              accent="#2563EB"
              tint="#BFDBFE"
              textColor="#1E40AF"
            />
            <Arrow color="#2563EB" />
            <FlowNode
              label="Operator Triage"
              accent="#2563EB"
              tint="#BFDBFE"
              textColor="#1E40AF"
            />
            <Arrow color="#2563EB" />
            <div className="flex flex-col gap-2">
              <FlowNode
                label="Accept → Incident → Case"
                accent="#2563EB"
                tint="#BFDBFE"
                textColor="#1E40AF"
                variant="solid"
              />
              <FlowNode
                label="Reject → FeedbackRecord"
                accent="#6B7280"
                tint="#D1D5DB"
                textColor="#374151"
              />
            </div>
          </div>
        </div>

        {/* Deterrence lane */}
        <div className="mt-6 rounded-2xl border-l-4 border-[#D97706] bg-[#FFFBEB] p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <span className="rounded-full bg-[#D97706] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              Deterrence Lane
            </span>
            <span className="text-xs text-[#92400E]">
              Leading indicators → proactive action
            </span>
          </div>
          <div className="flex flex-wrap items-stretch gap-2">
            <FlowNode
              label="External Context Signal"
              accent="#D97706"
              tint="#FDE68A"
              textColor="#92400E"
            />
            <Arrow color="#D97706" />
            <FlowNode
              label="Deterrence Engine"
              accent="#D97706"
              tint="#FDE68A"
              textColor="#92400E"
            />
            <Arrow color="#D97706" />
            <FlowNode
              label="Deterrence Alert"
              accent="#D97706"
              tint="#FDE68A"
              textColor="#92400E"
            />
            <Arrow color="#D97706" />
            <div className="flex flex-col gap-2">
              <FlowNode
                label="Operator accepts → Deterrence Playbook → Proactive Actions"
                accent="#D97706"
                tint="#FDE68A"
                textColor="#92400E"
                variant="solid"
              />
              <FlowNode
                label="Auto-trigger on high-confidence conditions"
                accent="#D97706"
                tint="#FDE68A"
                textColor="#92400E"
              />
            </div>
          </div>
        </div>

        {/* Shared learning loop */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-6">
          <FlowNode
            label="Case Closed"
            accent="#16A34A"
            tint="#BBF7D0"
            textColor="#15803D"
          />
          <Arrow color="#16A34A" />
          <FlowNode
            label="FeedbackRecord"
            accent="#16A34A"
            tint="#BBF7D0"
            textColor="#15803D"
          />
          <Arrow color="#16A34A" />
          <FlowNode
            label="Platform Learning Loop ↺"
            accent="#16A34A"
            tint="#BBF7D0"
            textColor="#15803D"
            variant="solid"
          />
        </div>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          many Signals → one Alert · one Alert accepted → one Incident · one or
          more Incidents → one Case · many Incidents → one Campaign
        </p>
      </div>
    </section>
  )
}
