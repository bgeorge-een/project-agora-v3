'use client'

import { useState } from 'react'
import type { SOP, PlaybookRule, Violation } from '@/lib/types'

function Icon({
  name,
  size = 18,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  return (
    <span
      className={`material-symbols-outlined ${className ?? ''}`}
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
    >
      {name}
    </span>
  )
}

// ---- SOP Library ----
interface SOPRow extends SOP {
  lastUpdated: string
  status: 'Active' | 'Draft' | 'Retired'
  versionHistory: number
}

const INITIAL_SOPS: SOPRow[] = [
  {
    id: 'sop-04',
    title: 'SOP-04: Unauthorized Access',
    incidentType: 'unauthorized_access',
    version: '2.1',
    effectiveDate: '2026-01-15',
    lastUpdated: '2026-01-15',
    status: 'Active',
    versionHistory: 3,
    steps: [],
  },
  {
    id: 'sop-07',
    title: 'SOP-07: Person of Interest',
    incidentType: 'person_of_interest',
    version: '1.4',
    effectiveDate: '2026-02-01',
    lastUpdated: '2026-02-01',
    status: 'Active',
    versionHistory: 2,
    steps: [],
  },
  {
    id: 'sop-02',
    title: 'SOP-02: Tailgating',
    incidentType: 'tailgating',
    version: '1.2',
    effectiveDate: '2026-01-15',
    lastUpdated: '2026-01-15',
    status: 'Active',
    versionHistory: 1,
    steps: [],
  },
]

// ---- Playbooks ----
interface PlaybookRow extends PlaybookRule {
  status: 'Approved' | 'Draft' | 'Pending'
}

const PLAYBOOKS: PlaybookRow[] = [
  {
    id: 'RP-01',
    name: 'Response Playbook: RP-01 Unauthorized Access',
    type: 'response',
    incidentType: 'unauthorized_access',
    description:
      'Coordinated response for restricted-zone access denials: evidence lock, zone-owner notify, escalation timer.',
    triggers: ['2+ denials in 5 min', 'Restricted zone', 'No work order'],
    autoActions: ['Lock evidence', 'Notify zone owner'],
    gatedActions: ['Suspend badge'],
    enabled: true,
    version: '2.1',
    approvedAt: '2026-01-15',
    status: 'Approved',
  },
  {
    id: 'DP-03',
    name: 'Deterrence: DP-03 Person of Interest',
    type: 'deterrence',
    incidentType: 'person_of_interest',
    description:
      'Perimeter deterrence sequence for watchlisted individuals: confirm match, notify manager, activate visible deterrents.',
    triggers: ['Watchlist face match', 'Perimeter approach'],
    autoActions: ['Notify site manager', 'Log deterrence event'],
    gatedActions: ['Restrict entry', 'Contact LEA'],
    enabled: false,
    version: '1.4',
    status: 'Pending',
  },
]

// ---- Violations ----
const INITIAL_VIOLATIONS: Violation[] = [
  {
    id: 'vio-001',
    caseId: 'case-001',
    ruleId: 'Policy-12',
    ruleTitle: 'Policy-12',
    description: 'Contractor accessed restricted zone',
    severity: 'critical',
    status: 'open',
    personName: 'Marcus Webb',
    zone: 'Server Rm',
    siteId: 'site-austin',
    timestamp: '2026-06-04T14:34:00Z',
    evidenceRefs: ['ev-002', 'ev-003'],
  },
  {
    id: 'vio-002',
    ruleId: 'SLA-03',
    ruleTitle: 'SLA-03',
    description: 'After-hours motion unresolved >4h',
    severity: 'high',
    status: 'open',
    zone: 'Exec Suite',
    siteId: 'site-austin',
    timestamp: '2026-06-04T02:14:00Z',
    evidenceRefs: [],
  },
]

const SEVERITY_STYLE: Record<string, { bg: string; text: string }> = {
  critical: { bg: '#181010', text: '#FCA5A5' },
  high: { bg: '#171D29', text: '#FBBF24' },
  medium: { bg: '#171D29', text: '#CBD5E0' },
  low: { bg: '#1F2937', text: '#9CA3AF' },
}

const INCIDENT_TYPES = [
  'unauthorized_access',
  'person_of_interest',
  'tailgating',
  'after_hours',
  'device_health',
]

export default function ComplianceDashboard() {
  return (
    <div className="space-y-6 px-8 py-6">
      <SOPLibrary />
      <PlaybookLibrary />
      <ViolationsQueue />
    </div>
  )
}

// ============================================================
// SOP LIBRARY
// ============================================================
function SOPLibrary() {
  const [sops, setSops] = useState<SOPRow[]>(INITIAL_SOPS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    incidentType: INCIDENT_TYPES[0],
    steps: '',
    effectiveDate: '',
  })

  const STATUS_STYLE: Record<SOPRow['status'], { bg: string; text: string }> = {
    Active: { bg: 'transparent', text: '#9CA3AF' },
    Draft: { bg: 'transparent', text: '#FBBF24' },
    Retired: { bg: '#1F2937', text: '#9CA3AF' },
  }

  const inputCls =
    'rounded-md border border-[#374151] bg-[#111827] px-2.5 py-1.5 text-xs text-[#E5E7EB] outline-none placeholder:text-[#6B7280] focus:border-[#7C3AED]'

  function add() {
    if (!form.title.trim()) return
    setSops((prev) => [
      {
        id: `sop-${Date.now()}`,
        title: form.title.trim(),
        incidentType: form.incidentType,
        version: '1.0',
        effectiveDate:
          form.effectiveDate || new Date().toISOString().slice(0, 10),
        lastUpdated: new Date().toISOString().slice(0, 10),
        status: 'Draft',
        versionHistory: 1,
        steps: [],
      },
      ...prev,
    ])
    setForm({
      title: '',
      incidentType: INCIDENT_TYPES[0],
      steps: '',
      effectiveDate: '',
    })
    setShowForm(false)
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#273142] bg-[#171D29]">
      <div className="flex items-center justify-between border-b border-[#273142] px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Icon name="checklist" size={18} className="text-[#9CA3AF]" /> SOP
          Library
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#374151] px-3 py-1.5 text-xs font-semibold text-[#CBD5E0] transition-colors hover:bg-[#1F2937] hover:text-white"
        >
          <Icon name="add" size={16} /> Author New SOP
        </button>
      </div>

      {showForm && (
        <div className="border-b border-[#273142] bg-[#111827] p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={form.title}
              placeholder="SOP title"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
            />
            <select
              value={form.incidentType}
              onChange={(e) =>
                setForm({ ...form, incidentType: e.target.value })
              }
              className={inputCls}
            >
              {INCIDENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={form.steps}
            rows={3}
            placeholder="Steps (one per line)"
            onChange={(e) => setForm({ ...form, steps: e.target.value })}
            className={`mt-3 w-full resize-none ${inputCls}`}
          />
          <div className="mt-3 flex items-center gap-3">
            <label className="text-[11px] font-semibold text-[#9CA3AF]">
              Effective Date
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) =>
                  setForm({ ...form, effectiveDate: e.target.value })
                }
                className={`ml-2 font-normal ${inputCls} py-1`}
              />
            </label>
            <div className="ml-auto flex gap-2">
              <button
                onClick={add}
                className="rounded-md bg-[#7C3AED] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#6D28D9]"
              >
                Save SOP
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-md border border-[#374151] px-3 py-1.5 text-xs font-medium text-[#CBD5E0] hover:bg-[#243048]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-left text-xs">
        <thead className="bg-[#111827] text-[10px] uppercase tracking-wide text-[#9CA3AF]">
          <tr>
            <th className="px-5 py-2.5 font-semibold">ID</th>
            <th className="px-3 py-2.5 font-semibold">Title</th>
            <th className="px-3 py-2.5 font-semibold">Incident Type</th>
            <th className="px-3 py-2.5 font-semibold">Version</th>
            <th className="px-3 py-2.5 font-semibold">Last Updated</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2D3748]">
          {sops.map((s) => {
            const st = STATUS_STYLE[s.status]
            return (
              <tr
                key={s.id}
                className="bg-[#171D29] transition-colors hover:bg-[#1D2533]"
              >
                <td className="px-5 py-3 font-mono font-semibold text-[#A78BFA]">
                  {s.id.toUpperCase().startsWith('SOP')
                    ? s.id.toUpperCase()
                    : s.id}
                </td>
                <td className="px-3 py-3 font-medium text-white">{s.title}</td>
                <td className="px-3 py-3 text-[#9CA3AF]">{s.incidentType}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#CBD5E0]">
                    v{s.version}
                    <span
                      className="text-[10px] text-[#6B7280]"
                      title={`${s.versionHistory} prior versions`}
                    >
                      ({s.versionHistory} rev)
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3 text-[#9CA3AF]">{s.lastUpdated}</td>
                <td className="px-3 py-3">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    style={{ backgroundColor: st.bg, color: st.text }}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

// ============================================================
// PLAYBOOK LIBRARY
// ============================================================
function PlaybookLibrary() {
  const [simResult, setSimResult] = useState<Record<string, string | null>>({})
  const [deployed, setDeployed] = useState<string[]>([])

  const STATUS_STYLE: Record<
    PlaybookRow['status'],
    { bg: string; text: string }
  > = {
    Approved: { bg: '#0C2714', text: '#22C55E' },
    Draft: { bg: '#1F2937', text: '#9CA3AF' },
    Pending: { bg: '#2A2310', text: '#FBBF24' },
  }

  function simulate(id: string) {
    setSimResult((prev) => ({
      ...prev,
      [id]: 'Simulation: 4 matched events, 1 expected alert',
    }))
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#273142] bg-[#171D29]">
      <div className="border-b border-[#273142] px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Icon name="policy" size={18} className="text-[#FBBF24]" /> Playbook
          Library
        </h3>
      </div>
      <div className="divide-y divide-[#2D3748]">
        {PLAYBOOKS.map((p) => {
          const st = STATUS_STYLE[p.status]
          const isDeployed = deployed.includes(p.id)
          const leftBorder =
            p.type === 'response'
              ? 'border-l-2 border-l-[#2563EB]'
              : 'border-l-2 border-l-[#F59E0B]'
          return (
            <div key={p.id} className={`p-5 ${leftBorder}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        p.type === 'response'
                          ? 'border border-[#374151] text-[#9CA3AF]'
                          : 'border border-[#4A3520] text-[#FBBF24]'
                      }`}
                    >
                      {p.type}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {p.name}
                    </h4>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
                    {p.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.triggers.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[#111827] px-2 py-0.5 text-[10px] font-medium text-[#9CA3AF] ring-1 ring-[#2D3748]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{ backgroundColor: st.bg, color: st.text }}
                >
                  {p.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => simulate(p.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#374151] bg-[#1F2937] px-3 py-1.5 text-xs font-semibold text-[#CBD5E0] transition-colors hover:border-[#7C3AED] hover:text-white"
                >
                  <Icon name="play_arrow" size={16} /> Simulate
                </button>
                <button
                  onClick={() =>
                    p.status === 'Approved' &&
                    setDeployed((prev) =>
                      prev.includes(p.id) ? prev : [...prev, p.id]
                    )
                  }
                  disabled={p.status !== 'Approved' || isDeployed}
                  title={
                    p.status !== 'Approved'
                      ? 'Requires Approved status'
                      : undefined
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#7C3AED] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:bg-[#1F2937] disabled:text-[#6B7280]"
                >
                  {isDeployed ? (
                    <>
                      <Icon name="check" size={16} /> Deployed
                    </>
                  ) : (
                    'Deploy'
                  )}
                </button>
                {p.status !== 'Approved' && (
                  <span className="text-[11px] text-[#6B7280]">
                    Deploy requires Approved status
                  </span>
                )}
              </div>

              {simResult[p.id] && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#274235] bg-[#12221B] px-3 py-2 text-xs font-medium text-[#86EFAC]">
                  <Icon name="check_circle" size={15} />
                  {simResult[p.id]}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ============================================================
// VIOLATIONS QUEUE
// ============================================================
function ViolationsQueue() {
  const [violations, setViolations] = useState<Violation[]>(INITIAL_VIOLATIONS)
  const [caModal, setCaModal] = useState<Violation | null>(null)
  const [caForm, setCaForm] = useState({ owner: '', due: '' })
  const [assigned, setAssigned] = useState<Record<string, string>>({})

  function setStatus(id: string, status: Violation['status']) {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    )
  }

  const STATUS_STYLE: Record<
    Violation['status'],
    { bg: string; text: string }
  > = {
    open: { bg: '#0C1A2A', text: '#38BDF8' },
    accepted: { bg: '#0C2714', text: '#22C55E' },
    rejected: { bg: '#1F2937', text: '#9CA3AF' },
    closed: { bg: '#1F2937', text: '#9CA3AF' },
  }

  const inputCls =
    'mt-1 w-full rounded-md border border-[#374151] bg-[#111827] px-2.5 py-2 text-sm font-normal text-[#E5E7EB] outline-none placeholder:text-[#6B7280] focus:border-[#7C3AED]'

  function saveCA() {
    if (!caModal) return
    setAssigned((prev) => ({
      ...prev,
      [caModal.id]: `${caForm.owner || 'Unassigned'} · due ${
        caForm.due || 'TBD'
      }`,
    }))
    setStatus(caModal.id, 'accepted')
    setCaModal(null)
    setCaForm({ owner: '', due: '' })
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#273142] bg-[#171D29]">
      <div className="border-b border-[#273142] px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Icon name="gavel" size={18} className="text-[#EF4444]" /> Violations
          Queue
        </h3>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="bg-[#111827] text-[10px] uppercase tracking-wide text-[#9CA3AF]">
          <tr>
            <th className="px-5 py-2.5 font-semibold">Violation</th>
            <th className="px-3 py-2.5 font-semibold">Rule</th>
            <th className="px-3 py-2.5 font-semibold">Severity</th>
            <th className="px-3 py-2.5 font-semibold">Person</th>
            <th className="px-3 py-2.5 font-semibold">Zone</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
            <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2D3748]">
          {violations.map((v) => {
            const sev = SEVERITY_STYLE[v.severity]
            const st = STATUS_STYLE[v.status]
            const rowBg =
              v.severity === 'critical' ? 'bg-[#181010]' : 'bg-[#171D29]'
            return (
              <tr
                key={v.id}
                className={`align-top transition-colors hover:bg-[#243048] ${rowBg}`}
              >
                <td className="px-5 py-3 font-medium text-white">
                  {v.description}
                  {assigned[v.id] && (
                    <span className="mt-1 block text-[10px] font-normal text-[#A78BFA]">
                      CA: {assigned[v.id]}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 font-mono text-[#9CA3AF]">
                  {v.ruleTitle}
                </td>
                <td className="px-3 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold uppercase"
                    style={{ backgroundColor: sev.bg, color: sev.text }}
                  >
                    {v.severity}
                  </span>
                </td>
                <td className="px-3 py-3 text-[#CBD5E0]">
                  {v.personName ?? '—'}
                </td>
                <td className="px-3 py-3 text-[#CBD5E0]">{v.zone}</td>
                <td className="px-3 py-3">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize"
                    style={{ backgroundColor: st.bg, color: st.text }}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  {v.status === 'open' ? (
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setStatus(v.id, 'accepted')}
                        className="rounded-md bg-[#166534] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#15803D]"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setStatus(v.id, 'rejected')}
                        className="rounded-md bg-[#7F1D1D] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#991B1B]"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setCaModal(v)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#7C3AED] px-2.5 py-1 text-[11px] font-semibold text-[#A78BFA] transition-colors hover:bg-[#2D1F47]"
                      >
                        <Icon name="assignment_turned_in" size={13} /> Assign CA
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#6B7280]">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Assign CA modal */}
      {caModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#273142] bg-[#171D29] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 border-b border-[#273142] px-5 py-4">
              <Icon
                name="assignment_turned_in"
                size={18}
                className="text-[#7C3AED]"
              />
              <div>
                <h4 className="text-base font-bold text-white">
                  Assign Corrective Action
                </h4>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  {caModal.description} · {caModal.ruleTitle}
                </p>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <label className="block text-xs font-semibold text-[#9CA3AF]">
                Owner
                <input
                  type="text"
                  value={caForm.owner}
                  placeholder="e.g. J. Torres"
                  onChange={(e) =>
                    setCaForm({ ...caForm, owner: e.target.value })
                  }
                  className={inputCls}
                />
              </label>
              <label className="block text-xs font-semibold text-[#9CA3AF]">
                Due Date
                <input
                  type="date"
                  value={caForm.due}
                  onChange={(e) => setCaForm({ ...caForm, due: e.target.value })}
                  className={inputCls}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#273142] px-5 py-3">
              <button
                onClick={() => setCaModal(null)}
                className="rounded-lg border border-[#374151] px-4 py-2 text-sm font-medium text-[#CBD5E0] hover:bg-[#243048]"
              >
                Cancel
              </button>
              <button
                onClick={saveCA}
                className="rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6D28D9]"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
