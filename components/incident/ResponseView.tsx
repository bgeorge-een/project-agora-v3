'use client'

import { useMemo, useState } from 'react'
import type { Alert, Severity } from '@/lib/types'
import { useSimulation } from './useSimulation'
import NBACard from './NBACard'
import OverrideModal, { type OverrideReason } from './OverrideModal'

// ---- helpers ----
function formatAge(seconds: number): string {
  if (seconds < 60) return `0:${String(seconds).padStart(2, '0')} ago`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m < 60) return `${m}:${String(s).padStart(2, '0')} ago`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return `${h}h ${rm}m ago`
}

const SEVERITY_DOT: Record<Severity, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#9CA3AF',
}

// ---- AlertCard ----
interface AlertCardProps {
  alert: Alert
  selected: boolean
  resolution?: string
  onAccept: (a: Alert) => void
  onReview: (a: Alert) => void
  onOverride: (a: Alert) => void
}

function AlertCard({
  alert,
  selected,
  resolution,
  onAccept,
  onReview,
  onOverride,
}: AlertCardProps) {
  const isDeterrent = alert.type === 'deterrent'
  const borderColor = isDeterrent ? '#D97706' : '#EF4444'
  const dotColor = SEVERITY_DOT[alert.severity]

  return (
    <div
      className={`rounded-lg bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)] transition-all ${
        selected ? 'ring-2 ring-[#2563EB]/40' : ''
      }`}
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      {/* Row 1 */}
      <div className="flex items-start gap-2">
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: isDeterrent ? '#FFFBEB' : '#FEF2F2',
            color: isDeterrent ? '#D97706' : '#DC2626',
          }}
        >
          {isDeterrent ? '🛡 Deterrent' : '⚡ Reactive'}
        </span>
        <h4 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-[#111827]">
          {alert.title}
        </h4>
      </div>

      {/* Row 2 */}
      <p className="mt-1.5 pl-4 text-xs text-[#6B7280]">
        {alert.location} · {formatAge(alert.ageSeconds)}
      </p>

      {/* Row 3 — sources */}
      <div className="mt-2 flex flex-wrap gap-1.5 pl-4">
        {alert.sources.map((s) => (
          <span
            key={s}
            className="rounded border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Row 4 — status / NBA */}
      <div className="mt-2.5 pl-4">
        {alert.status === 'enriching' ? (
          <div className="flex items-center gap-2 text-xs font-medium text-[#6B7280]">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#D1D5DB] border-t-[#2563EB]" />
            Enriching…
          </div>
        ) : alert.nba ? (
          <div className="flex items-start gap-1.5 rounded-md bg-[#F0FDFA] px-2.5 py-1.5 text-xs font-medium text-[#0F766E]">
            <span>🤖</span>
            <span className="min-w-0 flex-1">
              {alert.nba.recommendedAction.length > 48
                ? `${alert.nba.recommendedAction.slice(0, 48)}…`
                : alert.nba.recommendedAction}{' '}
              · {Math.round(alert.nba.confidence * 100)}%
            </span>
          </div>
        ) : null}
      </div>

      {/* Resolution banner */}
      {resolution && (
        <div className="mt-2.5 ml-4 rounded-md bg-[#EFF6FF] px-2.5 py-1.5 text-xs font-medium text-[#2563EB]">
          {resolution}
        </div>
      )}

      {/* Row 5 — buttons */}
      {!resolution && (
        <div className="mt-3 flex flex-wrap gap-2 pl-4">
          <button
            onClick={() => onAccept(alert)}
            disabled={alert.status === 'enriching' || !alert.nba}
            className="rounded-md bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Accept AI Recommendation
          </button>
          <button
            onClick={() => onReview(alert)}
            className="rounded-md border border-[#D1D5DB] px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]"
          >
            Review Detail
          </button>
          <button
            onClick={() => onOverride(alert)}
            disabled={!alert.nba}
            className="rounded-md px-3 py-1.5 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#F3F4F6] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Override
          </button>
        </div>
      )}
    </div>
  )
}

// ---- Severity group ----
const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low']
const GROUP_META: Record<
  Severity,
  { label: string; headerBg: string; headerText: string }
> = {
  critical: { label: 'CRITICAL', headerBg: '#FEF2F2', headerText: '#DC2626' },
  high: { label: 'HIGH', headerBg: '#FFF7ED', headerText: '#EA580C' },
  medium: { label: 'MEDIUM', headerBg: '#FFFBEB', headerText: '#D97706' },
  low: { label: 'LOW', headerBg: '#F1F5F9', headerText: '#64748B' },
}

const REASON_LABELS: Record<OverrideReason, string> = {
  wrong_severity: 'Wrong severity',
  false_positive: 'False positive',
  escalating_further: 'Escalating further',
  handling_differently: 'Handling differently',
  other: 'Other',
}

export default function ResponseView() {
  const { alerts } = useSimulation()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<Severity, boolean>>({
    critical: true,
    high: false,
    medium: false,
    low: false,
  })
  const [resolutions, setResolutions] = useState<Record<string, string>>({})
  const [overrideTarget, setOverrideTarget] = useState<Alert | null>(null)

  const grouped = useMemo(() => {
    const g: Record<Severity, Alert[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    }
    for (const a of alerts) g[a.severity].push(a)
    return g
  }, [alerts])

  const selectedAlert =
    alerts.find((a) => a.id === selectedId) ?? null

  function handleAccept(a: Alert) {
    setResolutions((prev) => ({
      ...prev,
      [a.id]: `✓ Accepted — ${a.nba?.recommendedAction ?? 'recommendation applied'}`,
    }))
    if (selectedId === a.id) setSelectedId(null)
  }

  function handleReview(a: Alert) {
    setSelectedId(a.id)
  }

  function handleOverride(a: Alert) {
    setOverrideTarget(a)
  }

  function submitOverride(reason: OverrideReason, notes: string) {
    if (!overrideTarget) return
    const note = notes.trim() ? ` (${notes.trim()})` : ''
    setResolutions((prev) => ({
      ...prev,
      [overrideTarget.id]: `⤺ Overridden — ${REASON_LABELS[reason]}${note}`,
    }))
    if (selectedId === overrideTarget.id) setSelectedId(null)
    setOverrideTarget(null)
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[60%_40%]">
      {/* LEFT — Alert Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[#374151]">
            Alert Queue
          </h2>
          <span className="text-xs font-medium text-[#6B7280]">
            {alerts.length} active
          </span>
        </div>

        {SEVERITY_ORDER.map((sev) => {
          const list = grouped[sev]
          const meta = GROUP_META[sev]
          const isOpen = expanded[sev]
          const isCritical = sev === 'critical'

          return (
            <div key={sev}>
              <button
                onClick={() =>
                  !isCritical &&
                  setExpanded((prev) => ({ ...prev, [sev]: !prev[sev] }))
                }
                disabled={isCritical}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors"
                style={{ backgroundColor: meta.headerBg }}
              >
                <span
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
                  style={{ color: meta.headerText }}
                >
                  {!isCritical && (
                    <span
                      className={`inline-block transition-transform ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    >
                      ▶
                    </span>
                  )}
                  {meta.label} ({list.length})
                </span>
                {list.length > 0 && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      color: meta.headerText,
                    }}
                  >
                    {list.length}
                  </span>
                )}
              </button>

              {(isCritical || isOpen) && (
                <div className="mt-2 space-y-2.5">
                  {list.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-[#9CA3AF]">
                      No {meta.label.toLowerCase()} alerts.
                    </p>
                  ) : (
                    list.map((a) => (
                      <AlertCard
                        key={a.id}
                        alert={a}
                        selected={selectedId === a.id}
                        resolution={resolutions[a.id]}
                        onAccept={handleAccept}
                        onReview={handleReview}
                        onOverride={handleOverride}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* RIGHT — NBA + SOP */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <NBACard
          alert={selectedAlert}
          onAccept={handleAccept}
          onOverride={handleOverride}
        />
      </div>

      {overrideTarget && (
        <OverrideModal
          alertTitle={overrideTarget.title}
          onCancel={() => setOverrideTarget(null)}
          onSubmit={submitOverride}
        />
      )}
    </div>
  )
}
