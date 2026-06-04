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
  const color = value >= 0.85 ? '#22C55E' : value >= 0.7 ? '#2563EB' : '#D97706'

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
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
        <span className="text-sm font-bold leading-none text-[#111827]">
          {pct}%
        </span>
        <span className="text-[8px] font-medium uppercase tracking-wide text-[#9CA3AF]">
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
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-[#D1D5DB] bg-white/60 p-8 text-center">
        <div className="mb-3 text-3xl">🤖</div>
        <p className="text-sm font-semibold text-[#374151]">
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
    <div className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-[#E5E7EB] p-5">
        <ConfidenceRing value={nba.confidence} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base">🤖</span>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#7C3AED]">
              Next Best Action
            </h3>
          </div>
          <p className="mt-1 text-sm font-semibold leading-snug text-[#111827]">
            {alert.title}
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">{alert.location}</p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Recommended action */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            Recommended Action
          </p>
          <button
            onClick={() => onAccept(alert)}
            className="w-full rounded-lg bg-[#2563EB] px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
          >
            {nba.recommendedAction}
          </button>
          <p className="mt-2 text-xs italic leading-relaxed text-[#6B7280]">
            {nba.rationale}
          </p>
        </div>

        {/* Alternatives */}
        {nba.alternatives.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Alternatives
            </p>
            <div className="flex flex-wrap gap-2">
              {nba.alternatives.map((alt) => (
                <button
                  key={alt}
                  className="rounded-lg border border-[#D1D5DB] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  {alt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SOP */}
        {sop && (
          <div className="border-t border-[#E5E7EB] pt-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#D97706]">
              <span>📋</span> Per {sop.title}:
            </p>
            <ol className="space-y-1.5">
              {sop.steps.map((s) => (
                <li
                  key={s.step}
                  className="flex gap-2.5 rounded-md bg-[#FFFBEB] px-3 py-2 text-xs leading-relaxed text-[#374151]"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#D97706] text-[10px] font-bold text-white">
                    {s.step}
                  </span>
                  <span>{s.instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Two-tier execution */}
        <div className="grid grid-cols-1 gap-3 border-t border-[#E5E7EB] pt-5">
          {nba.autoExecuteActions.length > 0 && (
            <div className="rounded-lg bg-[#F0FDF4] p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
                <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                Auto-executes on accept:
              </p>
              <ul className="space-y-1">
                {nba.autoExecuteActions.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 text-xs text-[#15803D]"
                  >
                    <span className="text-[#22C55E]">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nba.gatedActions.length > 0 && (
            <div className="rounded-lg bg-[#FFF7ED] p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#C2410C]">
                <span className="h-2 w-2 rounded-full bg-[#F97316]" />
                Requires your approval:
              </p>
              <ul className="space-y-1">
                {nba.gatedActions.map((a) => (
                  <li
                    key={a}
                    className="flex items-center gap-2 text-xs text-[#9A3412]"
                  >
                    <span className="text-[#F97316]">🔒</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-[#E5E7EB] pt-5">
          <button
            onClick={() => onAccept(alert)}
            className="flex-1 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
          >
            Accept
          </button>
          <button
            onClick={() => onOverride(alert)}
            className="rounded-lg border border-[#D1D5DB] px-4 py-2.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
          >
            Override
          </button>
        </div>
      </div>
    </div>
  )
}
