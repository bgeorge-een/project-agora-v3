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

const SEVERITY_META: Record<
  Severity,
  { label: string; rail: string; text: string; quietText: string }
> = {
  critical: {
    label: 'Critical',
    rail: '#EF4444',
    text: '#FCA5A5',
    quietText: '#FCA5A5',
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
    quietText: '#6B7280',
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
}

function AlertCard({
  alert,
  selected,
  resolution,
  onReview,
}: AlertCardProps) {
  const isDeterrent = alert.type === 'deterrent'
  const meta = SEVERITY_META[alert.severity]
  const confidence = alert.nba ? Math.round(alert.nba.confidence * 100) : null

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        selected
          ? 'border-[#475569] bg-[#202838]'
          : 'border-[#273142] bg-[#171D29] hover:bg-[#1D2533]'
      }`}
      style={{ borderLeft: `4px solid ${selected ? '#60A5FA' : meta.rail}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2 text-xs">
            <span className="font-semibold" style={{ color: meta.text }}>
              {meta.label}
            </span>
            <span className="text-[#4B5563]">/</span>
            <span className="text-[#9CA3AF]">
              {isDeterrent ? 'Deterrent' : 'Reactive'}
            </span>
          </div>
          <h4 className="text-[15px] font-semibold leading-snug text-[#F8FAFC]">
            {alert.title}
          </h4>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">
            {alert.location} · {formatAge(alert.ageSeconds)}
          </p>
        </div>
        <button
          onClick={() => onReview(alert)}
          className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            selected
              ? 'bg-[#243B55] text-[#BFDBFE]'
              : 'border border-[#374151] text-[#CBD5E0] hover:border-[#4B5563] hover:bg-[#1F2937]'
          }`}
        >
          {selected ? 'Selected' : 'Open'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#273142] pt-2.5 text-xs text-[#9CA3AF]">
        <span>{alert.sources.length} sources</span>
        <span className="text-[#4B5563]">·</span>
        {alert.status === 'enriching' ? (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="material-symbols-outlined animate-spin"
              style={{ fontSize: '14px', lineHeight: 1 }}
            >
              sync
            </span>
            Enriching
          </span>
        ) : alert.nba ? (
          <span className="text-[#CBD5E0]">
            Recommendation ready{confidence != null ? ` · ${confidence}%` : ''}
          </span>
        ) : (
          <span>Awaiting enrichment</span>
        )}
      </div>

      {resolution && (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-md border border-[#274235] bg-[#12221B] px-2.5 py-1.5 text-xs font-medium text-[#86EFAC]">
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
  critical: { label: 'Critical', headerText: '#FCA5A5' },
  high: { label: 'High', headerText: '#FBBF24' },
  medium: { label: 'Medium', headerText: '#9CA3AF' },
  low: { label: 'Low', headerText: '#6B7280' },
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
    <div className="grid grid-cols-1 gap-5 bg-[#0F1117] lg:grid-cols-[58%_42%]">
      {/* LEFT — Alert Queue */}
      <div className="space-y-3">
        <div className="rounded-xl border border-[#273142] bg-[#171D29] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">Alert Queue</h2>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                {alerts.length} active · {criticalCount} critical · {highCount} high
              </p>
            </div>
            {criticalCount > 0 && (
              <span className="rounded-md border border-[#7F1D1D] bg-[#1C0A0A] px-2.5 py-1 text-xs font-semibold text-[#FCA5A5]">
                Critical focus
              </span>
            )}
          </div>
          {criticalCount > 0 && (
            <div className="mt-3 rounded-lg border border-[#7F1D1D]/70 bg-[#180D0D] px-3 py-2 text-sm text-[#FECACA]">
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
                className="flex w-full items-center justify-between rounded-lg border border-[#273142] bg-[#151B26] px-3 py-2 text-left transition-colors hover:bg-[#1A2230]"
              >
                <span
                  className="flex items-center gap-1.5 text-sm font-semibold"
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
                  {meta.label}
                </span>
                {list.length > 0 && (
                  <span
                    className="rounded-full bg-[#273142] px-2 py-0.5 text-xs font-semibold"
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
