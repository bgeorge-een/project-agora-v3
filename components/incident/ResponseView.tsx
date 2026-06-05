'use client'

import { useMemo, useState } from 'react'
import type { Alert, Severity } from '@/lib/types'
import { useSimulation } from './useSimulation'
import { ALERT_DETAILS } from '@/lib/mock-data/scenarios'
import NBACard from './NBACard'
import OverrideModal, { type OverrideReason } from './OverrideModal'
import { IncidentDetailDrawer } from './IncidentDetailDrawer'

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
      className={`rounded-lg border p-4 transition-colors ${
        selected
          ? 'border-[#2D3748] border-l-4 border-l-[#2563EB] bg-[#243048]'
          : 'border-[#2D3748] bg-[#1A1F2E] hover:bg-[#243048]'
      }`}
      style={selected ? undefined : { borderLeft: `4px solid ${borderColor}` }}
    >
      {/* Row 1 */}
      <div className="flex items-start gap-2">
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span
          className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: isDeterrent ? '#78350F' : '#7F1D1D',
            color: isDeterrent ? '#FDE68A' : '#FCA5A5',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '14px', lineHeight: 1 }}
          >
            {isDeterrent ? 'shield' : 'bolt'}
          </span>
          {isDeterrent ? 'Deterrent' : 'Reactive'}
        </span>
        <h4 className="min-w-0 flex-1 text-sm font-medium leading-snug text-white">
          {alert.title}
        </h4>
      </div>

      {/* Row 2 */}
      <p className="mt-1.5 pl-4 text-xs text-[#9CA3AF]">
        {alert.location} · {formatAge(alert.ageSeconds)}
      </p>

      {/* Row 3 — sources */}
      <div className="mt-2 flex flex-wrap gap-1.5 pl-4">
        {alert.sources.map((s) => (
          <span
            key={s}
            className="rounded bg-[#2D3748] px-2 py-0.5 text-xs font-medium text-[#CBD5E0]"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Row 4 — status / NBA */}
      <div className="mt-2.5 pl-4">
        {alert.status === 'enriching' ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#9CA3AF]">
            <span
              className="material-symbols-outlined animate-spin"
              style={{ fontSize: '16px', lineHeight: 1 }}
            >
              sync
            </span>
            Enriching…
          </div>
        ) : alert.nba ? (
          <div className="flex items-start gap-1.5 text-xs font-medium text-[#38BDF8]">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '16px', lineHeight: 1 }}
            >
              smart_toy
            </span>
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
        <div className="mt-2.5 ml-4 flex items-center gap-1.5 rounded-md bg-[#0C2714] px-2.5 py-1.5 text-xs font-medium text-[#34D399]">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '16px', lineHeight: 1 }}
          >
            check_circle
          </span>
          {resolution}
        </div>
      )}

      {/* Row 5 — buttons */}
      <div className="mt-3 flex flex-wrap items-center gap-2 pl-4">
        {!resolution && (
          <>
            <button
              onClick={() => onAccept(alert)}
              disabled={alert.status === 'enriching' || !alert.nba}
              className="flex items-center gap-1.5 rounded-md bg-[#1D4ED8] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '16px', lineHeight: 1 }}
              >
                check_circle
              </span>
              Accept AI Recommendation
            </button>
            <button
              onClick={() => onOverride(alert)}
              disabled={!alert.nba}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-[#9CA3AF] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '16px', lineHeight: 1 }}
              >
                edit_note
              </span>
              Override
            </button>
          </>
        )}
        <button
          onClick={() => onReview(alert)}
          className="flex items-center gap-1.5 rounded-md border border-[#374151] bg-[#1F2937] px-3 py-1.5 text-xs font-medium text-[#CBD5E0] transition-colors hover:bg-[#2D3748]"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '16px', lineHeight: 1 }}
          >
            folder_open
          </span>
          {resolution ? 'View Incident' : 'Review Detail'}
        </button>
      </div>
    </div>
  )
}

// ---- Severity group ----
const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low']
const GROUP_META: Record<
  Severity,
  { label: string; headerText: string }
> = {
  critical: { label: 'CRITICAL', headerText: '#FCA5A5' },
  high: { label: 'HIGH', headerText: '#FDBA74' },
  medium: { label: 'MEDIUM', headerText: '#FCD34D' },
  low: { label: 'LOW', headerText: '#9CA3AF' },
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

  const drawerDetail =
    selectedAlert && ALERT_DETAILS[selectedAlert.id]
      ? ALERT_DETAILS[selectedAlert.id]
      : null

  // The right-column NBACard only reflects a selection that has NO rich detail
  // (alerts without ALERT_DETAILS). Detailed alerts open in the overlay drawer.
  const nbaCardAlert = drawerDetail ? null : selectedAlert

  function handleAccept(a: Alert) {
    setResolutions((prev) => ({
      ...prev,
      [a.id]: `Accepted — ${a.nba?.recommendedAction ?? 'recommendation applied'}`,
    }))
    // Do NOT clear selectedId — keep drawer open so operator sees the disposition in timeline
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
      [overrideTarget.id]: `Overridden — ${REASON_LABELS[reason]}${note}`,
    }))
    if (selectedId === overrideTarget.id) setSelectedId(null)
    setOverrideTarget(null)
  }

  return (
    <div className="grid grid-cols-1 gap-5 bg-[#0F1117] lg:grid-cols-[60%_40%]">
      {/* LEFT — Alert Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">
            Alert Queue
          </h2>
          <span className="text-xs font-medium text-[#9CA3AF]">
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
                className="flex w-full items-center justify-between rounded-lg border-b border-[#2D3748] bg-[#1A1F2E] px-3 py-2 text-left transition-colors"
              >
                <span
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
                  style={{ color: meta.headerText }}
                >
                  {!isCritical && (
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px', lineHeight: 1 }}
                    >
                      {isOpen ? 'expand_more' : 'chevron_right'}
                    </span>
                  )}
                  {meta.label} ({list.length})
                </span>
                {list.length > 0 && (
                  <span
                    className="rounded-full bg-[#2D3748] px-2 py-0.5 text-[10px] font-bold"
                    style={{ color: meta.headerText }}
                  >
                    {list.length}
                  </span>
                )}
              </button>

              {(isCritical || isOpen) && (
                <div className="mt-2 space-y-2.5">
                  {list.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-[#6B7280]">
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
      <div className="bg-[#0F1117] lg:sticky lg:top-4 lg:self-start">
        <NBACard
          alert={nbaCardAlert}
          onAccept={handleAccept}
          onOverride={handleOverride}
        />
      </div>

      {/* Detail drawer overlay — shown for alerts with correlated evidence */}
      {selectedAlert && drawerDetail && (
        <IncidentDetailDrawer
          alert={selectedAlert}
          detail={drawerDetail}
          onClose={() => setSelectedId(null)}
          onAccept={() => handleAccept(selectedAlert)}
          onOverride={() => handleOverride(selectedAlert)}
        />
      )}

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
