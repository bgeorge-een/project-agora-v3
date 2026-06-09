'use client'

import { useMemo, useState } from 'react'
import type { Alert, Severity } from '@/lib/types'
import { useSimulation } from './useSimulation'
import { ALERT_DETAILS } from '@/lib/mock-data/scenarios'
import NBACard from './NBACard'
import OverrideModal, { type OverrideReason } from './OverrideModal'
import { IncidentDetailDrawer } from './IncidentDetailDrawer'

// ---- helpers ----
function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s elapsed`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m < 60) return `${m}m ${String(s).padStart(2, '0')}s elapsed`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return `${h}h ${rm}m elapsed`
}

function formatLocalTime(ageSeconds: number): string {
  const eventTime = new Date(Date.now() - ageSeconds * 1000)
  const formatted = eventTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'America/Chicago',
    timeZoneName: 'short',
  })
  return formatted.replace(/\bCST\b|\bCDT\b/, 'CT')
}

const SEVERITY_META: Record<
  Severity,
  { label: string; rail: string; text: string; quietText: string }
> = {
  critical: {
    label: 'Critical',
    rail: '#FF453A',
    text: '#FF453A',
    quietText: '#FFB4AE',
  },
  high: {
    label: 'High',
    rail: '#D97706',
    text: '#FCD34D',
    quietText: '#FBBF24',
  },
  medium: {
    label: 'Medium',
    rail: '#6B7280',
    text: '#D1D5DB',
    quietText: '#9CA3AF',
  },
  low: {
    label: 'Low',
    rail: '#4B5563',
    text: '#9CA3AF',
    quietText: '#9CA3AF',
  },
}

// ---- AlertCard ----
interface AlertCardProps {
  alert: Alert
  selected: boolean
  resolution?: string
  onAccept: (a: Alert) => void
  onReview: (a: Alert) => void
  onOverride: (a: Alert) => void
  highContrast?: boolean
}

function AlertCard({
  alert,
  selected,
  resolution,
  onReview,
  highContrast = false,
}: AlertCardProps) {
  const isDeterrent = alert.type === 'deterrent'
  const meta = SEVERITY_META[alert.severity]
  const confidence = alert.nba ? Math.round(alert.nba.confidence * 100) : null
  const criticalUnacknowledged = alert.severity === 'critical' && !resolution
  const detailItems = [
    alert.location,
    `Local ${formatLocalTime(alert.ageSeconds)}`,
    formatElapsed(alert.ageSeconds),
    `${alert.sources.length} sources`,
    alert.nba && confidence != null ? `AI ${confidence}%` : alert.status === 'enriching' ? 'AI enriching' : 'AI pending',
  ]

  return (
    <div
      className={`soc-surface rounded-lg border p-5 transition-colors ${
        criticalUnacknowledged ? 'critical-unacknowledged' : ''
      } ${
        selected
          ? highContrast
            ? 'border-white bg-black'
            : 'border-[#475569] bg-[#202838]'
          : highContrast
            ? 'border-[#64748B] bg-black hover:bg-[#111827]'
            : 'border-[#273142] bg-[#171D29] hover:bg-[#1D2533]'
      }`}
      style={{ borderLeft: `5px solid ${selected ? '#60A5FA' : meta.rail}` }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-base leading-none">
            <span className="font-extrabold" style={{ color: meta.text }}>
              {meta.label}
            </span>
            <span className="soc-muted text-sm font-semibold text-[#9CA3AF]">
              {isDeterrent ? 'Deterrent' : 'Reactive'}
            </span>
          </div>
          <h3 className="text-base font-semibold leading-[1.5] text-[#F8FAFC]">
            {alert.title}
          </h3>
          <p className="soc-muted mt-2 text-sm leading-[1.5] text-[#D1D5DB]">
            Incident Detail: {detailItems.filter(Boolean).join(' · ')}
          </p>
        </div>
        <button
          onClick={() => onReview(alert)}
          className={`min-h-12 w-full shrink-0 rounded-md px-5 text-sm font-bold transition-colors sm:w-auto ${
            selected
              ? 'bg-[#243B55] text-[#BFDBFE]'
              : alert.severity === 'critical'
                ? 'bg-[#FF453A] text-black hover:bg-[#FF6B61]'
                : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
          }`}
        >
          {selected ? 'Selected' : alert.severity === 'critical' ? 'Respond' : 'Open'}
        </button>
      </div>

      {resolution && (
        <div className="mt-3 flex items-center gap-1.5 rounded-md border border-[#274235] bg-[#12221B] px-2.5 py-1.5 text-sm font-medium text-[#86EFAC]">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '16px', lineHeight: 1 }}
          >
            check_circle
          </span>
          {resolution}
        </div>
      )}
    </div>
  )
}

// ---- Severity group ----
const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low']
const GROUP_META: Record<
  Severity,
  { label: string; headerText: string }
> = {
  critical: { label: 'Critical', headerText: '#FF453A' },
  high: { label: 'High', headerText: '#FBBF24' },
  medium: { label: 'Medium', headerText: '#9CA3AF' },
  low: { label: 'Low', headerText: '#9CA3AF' },
}

const REASON_LABELS: Record<OverrideReason, string> = {
  wrong_severity: 'Wrong severity',
  false_positive: 'False positive',
  escalating_further: 'Escalating further',
  handling_differently: 'Handling differently',
  other: 'Other',
}

export default function ResponseView({
  highContrast = false,
}: {
  highContrast?: boolean
}) {
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
  const criticalCount = grouped.critical.length
  const highCount = grouped.high.length

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
    <div
      className={`grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,58%)_minmax(360px,42%)] ${
        highContrast ? 'bg-black' : 'bg-[#0F1117]'
      }`}
    >
      {/* LEFT — Alert Queue */}
      <div className="space-y-4">
        <div
          className={`soc-surface rounded-xl border p-5 ${
            highContrast ? 'border-[#64748B] bg-black' : 'border-[#273142] bg-[#171D29]'
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Alert Queue</h2>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                {alerts.length} active · {criticalCount} critical · {highCount} high
              </p>
            </div>
            {criticalCount > 0 && (
              <span className="w-fit rounded-md border border-[#FF453A] bg-[#210A08] px-3 py-1.5 text-base font-extrabold text-[#FF453A]">
                Critical focus
              </span>
            )}
          </div>
          {criticalCount > 0 && (
            <div className="mt-4 rounded-lg border border-[#7F1D1D]/70 bg-[#180D0D] px-4 py-3 text-sm leading-[1.5] text-[#FECACA]">
              Keep attention on critical alerts first. Lower severity groups stay collapsed until needed.
            </div>
          )}
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
                className={`flex min-h-[52px] w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                  highContrast
                    ? 'border-[#64748B] bg-black hover:bg-[#111827]'
                    : 'border-[#273142] bg-[#151B26] hover:bg-[#1A2230]'
                }`}
              >
                <span
                  className="flex items-center gap-2 text-base font-bold"
                  style={{ color: meta.headerText }}
                >
                  {!isCritical && (
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '24px', lineHeight: 1 }}
                    >
                      {isOpen ? 'expand_more' : 'chevron_right'}
                    </span>
                  )}
                  {meta.label}
                </span>
                {list.length > 0 && (
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-extrabold ${
                      sev === 'critical'
                        ? 'bg-[#210A08]'
                        : highContrast
                          ? 'bg-white text-black'
                          : 'bg-[#273142]'
                    }`}
                    style={{ color: meta.headerText }}
                  >
                    {list.length} {meta.label}
                  </span>
                )}
              </button>

              {(isCritical || isOpen) && (
                <div className="mt-4 space-y-5">
                  {list.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-[#9CA3AF]">
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
                        highContrast={highContrast}
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
      <div
        className={`${highContrast ? 'bg-black' : 'bg-[#0F1117]'} xl:sticky xl:top-4 xl:self-start`}
      >
        <NBACard
          alert={nbaCardAlert}
          onAccept={handleAccept}
          onOverride={handleOverride}
          highContrast={highContrast}
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
