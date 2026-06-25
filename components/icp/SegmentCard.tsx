import type { SegmentData } from '@/lib/icp/data'

interface Props {
  segment: SegmentData
  sectionBg?: string
}

function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
      {children}
    </p>
  )
}

function Callout({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: `${accent}12`, borderLeft: `3px solid ${accent}` }}
    >
      {children}
    </div>
  )
}

export default function SegmentCard({ segment, sectionBg = '#FFFFFF' }: Props) {
  const accentStyle = { color: segment.accent }

  return (
    <section
      id={segment.id}
      className="px-4 py-14 sm:px-6 lg:px-12"
      style={{ backgroundColor: sectionBg }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={accentStyle}>
          {segment.shortLabel}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          {segment.label}
        </h2>

        {/* Card */}
        <div
          className="mt-8 rounded-xl bg-white"
          style={{
            borderLeft: `4px solid ${segment.accent}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div className="p-6 sm:p-8">
            {/* Tier 1 — Qualifying question */}
            <Callout accent={segment.accent}>
              <MicroLabel>Qualifying Question</MicroLabel>
              <p className="mt-2 text-base font-semibold leading-snug text-[#111827]">
                {segment.qualifyingQuestion}
              </p>
            </Callout>

            {/* Tier 2 — 2-col profile grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <MicroLabel>Firmographics</MicroLabel>
                <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">
                  {segment.firmographics}
                </p>
              </div>
              <div>
                <MicroLabel>Economic Buyer</MicroLabel>
                <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">
                  {segment.economicBuyer}
                </p>
              </div>
              <div>
                <MicroLabel>Daily User / Champion</MicroLabel>
                <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">
                  {segment.dailyUser}
                </p>
              </div>
              <div>
                <MicroLabel>Incumbent + Our Wedge</MicroLabel>
                <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">
                  <span className="font-semibold text-[#111827]">{segment.incumbent}</span>
                  {' — '}
                  {segment.wedge}
                </p>
              </div>
            </div>

            {/* Channel conflict callout (MC-2 only) */}
            {segment.channelConflictNote && (
              <div className="mt-6 rounded-lg border border-[#FCD34D] bg-[#FFFBEB] p-4">
                <p className="text-sm leading-relaxed text-[#92400E]">
                  {segment.channelConflictNote}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="my-6 border-t border-[#F3F4F6]" />

            {/* Tier 3 — Disqualifiers */}
            <div>
              <MicroLabel><span aria-hidden="true">⊘</span> Disqualifiers</MicroLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {segment.disqualifiers.map((d, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs text-[#6B7280]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Tier 1 — Messaging hook */}
            <div className="mt-6">
              <Callout accent={segment.accent}>
                <MicroLabel>Messaging Hook</MicroLabel>
                <p className="mt-2 text-base font-semibold italic leading-snug text-[#111827]">
                  {segment.messagingHook}
                </p>
              </Callout>
            </div>

            {/* Tier 3 — Account examples */}
            <div className="mt-6">
              <MicroLabel>Named Account Examples</MicroLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {segment.accountExamples.map((ex, i) => (
                  <span
                    key={i}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={
                      ex.status === 'in'
                        ? { backgroundColor: '#F0FDF4', color: '#15803D' }
                        : { backgroundColor: '#F9FAFB', color: '#6B7280' }
                    }
                    title={ex.reason}
                  >
                    <span aria-hidden="true">{ex.status === 'in' ? '● ' : '○ '}</span>
                    {ex.name}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-[#9CA3AF]">
                Hover each account for the reason. ● In-ICP · ○ Out-of-ICP
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
