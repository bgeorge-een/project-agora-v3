'use client'

import type { Alert } from '@/lib/types'

interface NBACardProps {
  alert: Alert | null
  onAccept: (alert: Alert) => void
  onOverride: (alert: Alert) => void
  highContrast?: boolean
}

export default function NBACard({
  alert,
  onAccept,
  onOverride,
  highContrast = false,
}: NBACardProps) {
  if (!alert || !alert.nba) {
    return (
      <div
        className={`soc-surface flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border p-8 text-center ${
          highContrast ? 'border-[#64748B] bg-black' : 'border-[#273142] bg-[#171D29]'
        }`}
      >
        <span
          className="material-symbols-outlined mb-3 text-[#9CA3AF]"
          style={{ fontSize: '32px', lineHeight: 1 }}
        >
          touch_app
        </span>
        <p className="text-sm font-semibold text-[#CBD5E0]">
          No alert selected
        </p>
        <p className="mt-1 max-w-[240px] text-sm leading-relaxed text-[#D1D5DB]">
          Open an alert to review the recommended action, supporting rationale,
          and approval gates.
        </p>
      </div>
    )
  }

  const { nba, sop } = alert
  const confidencePct = Math.round(nba.confidence * 100)
  const confidenceLabel =
    nba.confidence >= 0.8 ? 'High confidence' : nba.confidence >= 0.6 ? 'Medium confidence' : 'Low confidence'
  const phaseLabel = nba.responsePhase
    ? nba.responsePhase.charAt(0).toUpperCase() + nba.responsePhase.slice(1)
    : 'Review'

  return (
    <div
      className={`soc-surface rounded-xl border ${
        highContrast ? 'border-[#64748B] bg-black' : 'border-[#273142] bg-[#171D29]'
      }`}
    >
      {/* Header */}
      <div className="border-b border-[#273142] p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="material-symbols-outlined text-[#9CA3AF]"
              style={{ fontSize: '17px', lineHeight: 1 }}
            >
              smart_toy
            </span>
            <h3 className="text-sm font-semibold text-[#CBD5E0]">
              Next Best Action
            </h3>
            <span className="ml-auto rounded-md border border-[#374151] px-2 py-0.5 text-xs font-medium text-[#9CA3AF]">
              {phaseLabel}
            </span>
          </div>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-white">
            {alert.title}
          </p>
          <p className="mt-1 text-sm text-[#9CA3AF]">{alert.location}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9CA3AF]">
            <span>{confidenceLabel} · {confidencePct}%</span>
            {alert.id.startsWith('alert-sim-') && (
              <>
                <span className="text-[#4B5563]">·</span>
                <span>Live enrichment</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Recommended action */}
        <div>
          <p className="mb-2 text-xs font-semibold text-[#9CA3AF]">
            Recommended Action
          </p>
          <button
            onClick={() => onAccept(alert)}
            className="min-h-[52px] w-full rounded-lg bg-[#2563EB] px-4 py-3 text-left text-[15px] font-semibold leading-snug text-white transition-colors hover:bg-[#1D4ED8]"
          >
            {nba.recommendedAction}
          </button>
          <p className="mt-3 text-sm leading-relaxed text-[#CBD5E0]">
            {nba.rationale}
          </p>
        </div>

        {/* Alternatives */}
        {nba.alternatives.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-[#9CA3AF]">
              Alternatives
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {nba.alternatives.map((alt) => (
                <button
                  key={alt}
                  className="min-h-11 rounded-md border border-[#374151] px-3 py-2 text-left text-xs font-medium leading-snug text-[#CBD5E0] transition-colors hover:bg-[#1F2937]"
                >
                  {alt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SOP */}
        {sop && (
          <div className="rounded-lg border border-[#273142] bg-[#111827] p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-[#CBD5E0]">
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
                  className="flex gap-2.5 rounded-md bg-[#171D29] px-3 py-2 text-sm leading-relaxed text-[#CBD5E0]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#4B5563] text-xs font-semibold text-[#9CA3AF]">
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
            <div className="rounded-lg border border-[#274235] bg-[#12221B] p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#86EFAC]">
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
                    className="flex items-center gap-2 text-sm text-[#CDEFD8]"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[#86EFAC]"
                      aria-hidden
                    >
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nba.gatedActions.length > 0 && (
            <div className="rounded-lg border border-[#7F1D1D] bg-[#1C0A0A] p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#FCA5A5]">
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
                    className="flex items-center gap-2 text-sm text-[#FECACA]"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[#EF4444]"
                      aria-hidden
                    >
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-[#273142] pt-5 sm:flex-row">
          <button
            onClick={() => onAccept(alert)}
            className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
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
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-[#374151] px-4 py-2.5 text-sm font-medium text-[#D1D5DB] transition-colors hover:bg-[#1F2937] hover:text-white"
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
