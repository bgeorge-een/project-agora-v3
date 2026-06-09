import SectionHeader from '@/components/ui/SectionHeader'

interface StepCardProps {
  background: string
  borderColor: string
  textColor: string
  title: string
  subtitle?: string
}

function StepCard({
  background,
  borderColor,
  textColor,
  title,
  subtitle,
}: StepCardProps) {
  return (
    <div
      className="max-w-full"
      style={{
        background,
        border: `1px solid ${borderColor}`,
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 600,
        color: textColor,
      }}
    >
      <div>{title}</div>
      {subtitle && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 500,
            opacity: 0.85,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  )
}

interface ArrowProps {
  color: string
}

function Arrow({ color }: ArrowProps) {
  return (
    <span style={{ color, fontSize: 18, padding: '0 4px', alignSelf: 'center' }}>
      →
    </span>
  )
}

interface LaneProps {
  label: string
  labelColor: string
  background: string
  children: React.ReactNode
}

function Lane({ label, labelColor, background, children }: LaneProps) {
  return (
    <div
      className="flex items-stretch overflow-hidden rounded-xl"
      style={{ background, border: '1px solid #E5E7EB' }}
    >
      <div
        className="flex w-14 shrink-0 items-center justify-center"
        style={{ background: '#172130' }}
      >
        <span
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: labelColor,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      </div>
      <div className="min-w-0 flex-1 p-4">{children}</div>
    </div>
  )
}

const PLATFORM_STEPS = ['Normalize', 'Enrich', 'Analyze', 'Recommend + Explain']

const DETERRENCE_STEPS = [
  'External Context Signal',
  'Deterrence Engine',
  'Deterrence Alert',
  'Operator / Auto-trigger',
  'Deterrence Playbook',
  'Proactive Actions',
]

const CLOSED_LOOP_STEPS = [
  { title: 'Case Closed / Outcome recorded' },
  { title: 'FeedbackRecord written' },
  { title: 'AI Analyst labels' },
  { title: 'Platform Learning Loop ↺' },
]

const CARDINALITIES = [
  'many Signals → 1 Alert',
  '1 Alert (accepted) → 1 Incident',
  '1+ Incidents → 1 Case',
  'many Incidents → 1 Campaign',
]

export default function AlertLifecycleFlow() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="End to end"
          title="Alert + Case Lifecycle"
          subtitle="Two lanes: reactive (confirmed signals → incidents) and deterrence (leading indicators → proactive action), closing into a shared learning loop."
        />

        <div className="mt-12 flex flex-col gap-3">
          {/* ============ REACTIVE LANE ============ */}
          <Lane label="Reactive" labelColor="#93C5FD" background="#EFF6FF">
            <div className="flex flex-wrap items-stretch gap-y-3">
              <StepCard
                background="#DBEAFE"
                borderColor="#93C5FD"
                textColor="#1E40AF"
                title="Device / Signal"
              />
              <Arrow color="#93C5FD" />

              {/* Platform composite card */}
              <div
                className="rounded-md"
                style={{
                  background: '#172130',
                  border: '1px solid #1E2D42',
                  padding: '8px 12px',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#CED7E2',
                    marginBottom: 6,
                  }}
                >
                  Platform Pipeline
                </div>
                <div className="flex flex-wrap items-center gap-y-1">
                  {PLATFORM_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center">
                      <span
                        className="rounded px-2 py-1"
                        style={{
                          background: '#1E2D42',
                          color: '#38BDF8',
                          fontSize: 10,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step}
                      </span>
                      {i < PLATFORM_STEPS.length - 1 && (
                        <span
                          style={{
                            color: '#475569',
                            fontSize: 13,
                            padding: '0 4px',
                          }}
                        >
                          →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Arrow color="#93C5FD" />
              <StepCard
                background="#DBEAFE"
                borderColor="#93C5FD"
                textColor="#1E40AF"
                title="Alert in Queue"
              />
              <Arrow color="#93C5FD" />
              <StepCard
                background="#DBEAFE"
                borderColor="#93C5FD"
                textColor="#1E40AF"
                title="Operator Triage"
              />
            </div>

            {/* Outcomes */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              {/* Accepted → Incident → Case */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#15803D]">
                    Accepted
                  </span>
                  <StepCard
                    background="#DBEAFE"
                    borderColor="#60A5FA"
                    textColor="#1E40AF"
                    title="Incident created"
                  />
                </div>
                <Arrow color="#60A5FA" />
                <StepCard
                  background="#1E3A5F"
                  borderColor="#1E3A5F"
                  textColor="#FFFFFF"
                  title="Case opened"
                  subtitle="→ feeds Closed Loop"
                />
              </div>

              {/* Dismissed */}
              <div className="flex flex-col items-start gap-1 sm:border-l sm:border-[#BFDBFE] sm:pl-4">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">
                  Dismissed
                </span>
                <StepCard
                  background="#F3F4F6"
                  borderColor="#D1D5DB"
                  textColor="#374151"
                  title="Dismissed"
                  subtitle="→ FeedbackRecord"
                />
              </div>
            </div>
          </Lane>

          {/* ============ DETERRENCE LANE ============ */}
          <Lane label="Deterrence" labelColor="#FCD34D" background="#FFFBEB">
            <div className="flex flex-wrap items-stretch gap-y-3">
              {DETERRENCE_STEPS.map((step, i) => (
                <div key={step} className="flex items-stretch">
                  <StepCard
                    background="#FEF3C7"
                    borderColor="#FCD34D"
                    textColor="#92400E"
                    title={step}
                  />
                  {i < DETERRENCE_STEPS.length - 1 && <Arrow color="#FCD34D" />}
                </div>
              ))}
            </div>
          </Lane>

          {/* both lanes feed into closed loop */}
          <div className="flex items-center justify-center gap-2 py-1">
            <span style={{ color: '#9CA3AF', fontSize: 20, lineHeight: 1 }}>
              ↓
            </span>
            <span className="text-xs italic text-[#9CA3AF]">
              both lanes feed into the learning loop
            </span>
          </div>

          {/* ============ CLOSED LOOP LANE ============ */}
          <Lane label="Closed Loop" labelColor="#86EFAC" background="#F0FDF4">
            <div className="flex flex-wrap items-stretch gap-y-3">
              {CLOSED_LOOP_STEPS.map((step, i) => (
                <div key={step.title} className="flex items-stretch">
                  <StepCard
                    background="#DCFCE7"
                    borderColor="#86EFAC"
                    textColor="#166534"
                    title={step.title}
                  />
                  {i < CLOSED_LOOP_STEPS.length - 1 && (
                    <Arrow color="#86EFAC" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] italic text-[#15803D]">
              Learning Loop feeds back into the Signal Normalizer to tune future
              enrichment.
            </p>
          </Lane>
        </div>

        {/* Cardinalities */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {CARDINALITIES.map((c) => (
            <span
              key={c}
              style={{
                background: '#F3F4F6',
                borderRadius: 4,
                padding: '3px 10px',
                fontSize: 11,
                color: '#374151',
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
