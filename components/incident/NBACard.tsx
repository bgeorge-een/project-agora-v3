'use client'

import type { Alert } from '@/lib/types'

interface ConfidenceRingProps {
  value: number // 0..1
}

function ConfidenceRing({ value }: ConfidenceRingProps) {
  const pct = Math.round(value * 100)
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value)
  const color = value >= 0.8 ? '#22C55E' : value >= 0.6 ? '#FBBF24' : '#EF4444'

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#1A1F2E"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold leading-none text-white">
          {pct}%
        </span>
        <span className="text-[8px] font-medium uppercase tracking-wide text-[#6B7280]">
          conf
        </span>
      </div>
    </div>
  )
}

interface NBACardProps {
  alert: Alert | null
  onAccept: (alert: Alert) => void
  onOverride: (alert: Alert) => void
}

export default function NBACard({ alert, onAccept, onOverride }: NBACardProps) {
  if (!alert || !alert.nba) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-8 text-center">
        <span
          className="material-symbols-outlined mb-3 text-[#6B7280]"
          style={{ fontSize: '40px', lineHeight: 1 }}
        >
          touch_app
        </span>
        <p className="text-sm font-semibold text-[#9CA3AF]">
          No alert selected
        </p>
        <p className="mt-1 max-w-[220px] text-xs text-[#6B7280]">
          Select &ldquo;Review Detail&rdquo; on an alert to see the recommended
          next best action and standard operating procedure.
        </p>
      </div>
    )
  }

  const { nba, sop } = alert

  return (
    <div className="rounded-xl border border-[#2D3748] bg-[#1A1F2E]">
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-[#2D3748] p-5">
        <ConfidenceRing value={nba.confidence} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[#38BDF8]"
              style={{ fontSize: '18px', lineHeight: 1 }}
            >
              smart_toy
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#A78BFA]">
              Next Best Action
            </h3>
          </div>
          <p className="mt-1 text-sm font-semibold leading-snug text-white">
            {alert.title}
          </p>
          <p className="mt-0.5 text-xs text-[#9CA3AF]">{alert.location}</p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Recommended action */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Recommended Action
          </p>
          <button
            onClick={() => onAccept(alert)}
            className="w-full rounded-lg bg-[#1D4ED8] px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
          >
            {nba.recommendedAction}
          </button>
          <p className="mt-2 text-xs italic leading-relaxed text-[#9CA3AF]">
            {nba.rationale}
          </p>
        </div>

        {/* Alternatives */}
        {nba.alternatives.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
              Alternatives
            </p>
            <div className="flex flex-wrap gap-2">
              {nba.alternatives.map((alt) => (
                <button
                  key={alt}
                  className="rounded-lg border border-[#374151] bg-[#1F2937] px-3 py-1.5 text-xs font-medium text-[#CBD5E0] transition-colors hover:bg-[#2D3748]"
                >
                  {alt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SOP */}
        {sop && (
          <div className="rounded-lg border border-[#2D3748] bg-[#0F1117] p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#FCD34D]">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', lineHeight: 1 }}
              >
                checklist
              </span>
              Per {sop.title}:
            </p>
            <ol className="space-y-1.5">
              {sop.steps.map((s) => (
                <li
                  key={s.step}
                  className="flex gap-2.5 rounded-md bg-[#1A1F2E] px-3 py-2 text-xs leading-relaxed text-[#CBD5E0]"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#78350F] text-[10px] font-bold text-[#FDE68A]">
                    {s.step}
                  </span>
                  <span>{s.instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Two-tier execution */}
        <div className="grid grid-cols-1 gap-3">
          {nba.autoExecuteActions.length > 0 && (
            <div className="rounded-lg border border-[#166534] bg-[#0C2714] p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#34D399]">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', lineHeight: 1 }}
                >
                  check_circle
                </span>
                Auto-executes on accept:
              </p>
              <ul className="space-y-1">
                {nba.autoExecuteActions.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 text-xs text-[#86EFAC]"
                  >
                    <span
                      className="material-symbols-outlined text-[#22C55E]"
                      style={{ fontSize: '16px', lineHeight: 1 }}
                    >
                      check_circle
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nba.gatedActions.length > 0 && (
            <div className="rounded-lg border border-[#7F1D1D] bg-[#2D1515] p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#FCA5A5]">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '16px', lineHeight: 1 }}
                >
                  lock
                </span>
                Requires your approval:
              </p>
              <ul className="space-y-1">
                {nba.gatedActions.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 text-xs text-[#FCA5A5]"
                  >
                    <span
                      className="material-symbols-outlined text-[#EF4444]"
                      style={{ fontSize: '16px', lineHeight: 1 }}
                    >
                      lock
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-[#2D3748] pt-5">
          <button
            onClick={() => onAccept(alert)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px', lineHeight: 1 }}
            >
              check_circle
            </span>
            Accept
          </button>
          <button
            onClick={() => onOverride(alert)}
            className="flex items-center gap-1.5 rounded-lg border border-[#374151] px-4 py-2.5 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-[#1F2937] hover:text-white"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px', lineHeight: 1 }}
            >
              edit_note
            </span>
            Override
          </button>
        </div>
      </div>
    </div>
  )
}
