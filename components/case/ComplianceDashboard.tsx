'use client'

import { useState } from 'react'
import type { SOP, PlaybookRule, Violation } from '@/lib/types'

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
  critical: { bg: '#FEF2F2', text: '#DC2626' },
  high: { bg: '#FFF7ED', text: '#EA580C' },
  medium: { bg: '#FFFBEB', text: '#D97706' },
  low: { bg: '#F1F5F9', text: '#64748B' },
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
    Active: { bg: '#F0FDF4', text: '#16A34A' },
    Draft: { bg: '#FFFBEB', text: '#D97706' },
    Retired: { bg: '#F1F5F9', text: '#64748B' },
  }

  function add() {
    if (!form.title.trim()) return
    setSops((prev) => [
      {
        id: `sop-${Date.now()}`,
        title: form.title.trim(),
        incidentType: form.incidentType,
        version: '1.0',
        effectiveDate: form.effectiveDate || new Date().toISOString().slice(0, 10),
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
    <section className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
          <span>📚</span> SOP Library
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#7C3AED] px-3 py-1.5 text-xs font-semibold text-[#7C3AED] transition-colors hover:bg-[#F5F3FF]"
        >
          <span>＋</span> Author New SOP
        </button>
      </div>

      {showForm && (
        <div className="border-b border-[#E5E7EB] bg-[#F5F3FF] p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={form.title}
              placeholder="SOP title"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#7C3AED]"
            />
            <select
              value={form.incidentType}
              onChange={(e) =>
                setForm({ ...form, incidentType: e.target.value })
              }
              className="rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#7C3AED]"
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
            className="mt-3 w-full resize-none rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1.5 text-xs outline-none focus:border-[#7C3AED]"
          />
          <div className="mt-3 flex items-center gap-3">
            <label className="text-[11px] font-semibold text-[#6B7280]">
              Effective Date
              <input
                type="date"
                value={form.effectiveDate}
                onChange={(e) =>
                  setForm({ ...form, effectiveDate: e.target.value })
                }
                className="ml-2 rounded-md border border-[#D1D5DB] bg-white px-2.5 py-1 text-xs font-normal outline-none focus:border-[#7C3AED]"
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
                className="rounded-md border border-[#D1D5DB] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-left text-xs">
        <thead className="bg-[#F9FAFB] text-[10px] uppercase tracking-wide text-[#9CA3AF]">
          <tr>
            <th className="px-5 py-2.5 font-semibold">ID</th>
            <th className="px-3 py-2.5 font-semibold">Title</th>
            <th className="px-3 py-2.5 font-semibold">Incident Type</th>
            <th className="px-3 py-2.5 font-semibold">Version</th>
            <th className="px-3 py-2.5 font-semibold">Last Updated</th>
            <th className="px-3 py-2.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {sops.map((s) => {
            const st = STATUS_STYLE[s.status]
            return (
              <tr key={s.id} className="hover:bg-[#F9FAFB]">
                <td className="px-5 py-3 font-mono font-semibold text-[#7C3AED]">
                  {s.id.toUpperCase().startsWith('SOP') ? s.id.toUpperCase() : s.id}
                </td>
                <td className="px-3 py-3 font-medium text-[#111827]">
                  {s.title}
                </td>
                <td className="px-3 py-3 text-[#6B7280]">{s.incidentType}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#374151]">
                    v{s.version}
                    <span
                      className="text-[10px] text-[#9CA3AF]"
                      title={`${s.versionHistory} prior versions`}
                    >
                      ({s.versionHistory} rev)
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3 text-[#6B7280]">{s.lastUpdated}</td>
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

  const STATUS_STYLE: Record<PlaybookRow['status'], { bg: string; text: string }> =
    {
      Approved: { bg: '#F0FDF4', text: '#16A34A' },
      Draft: { bg: '#F1F5F9', text: '#64748B' },
      Pending: { bg: '#FFFBEB', text: '#D97706' },
    }

  function simulate(id: string) {
    setSimResult((prev) => ({
      ...prev,
      [id]: 'Simulation: 4 matched events, 1 expected alert',
    }))
  }

  return (
    <section className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#E5E7EB] px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
          <span>📖</span> Playbook Library
        </h3>
      </div>
      <div className="divide-y divide-[#F1F5F9]">
        {PLAYBOOKS.map((p) => {
          const st = STATUS_STYLE[p.status]
          const isDeployed = deployed.includes(p.id)
          return (
            <div key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        p.type === 'response'
                          ? 'bg-[#EFF6FF] text-[#2563EB]'
                          : 'bg-[#FFFBEB] text-[#D97706]'
                      }`}
                    >
                      {p.type}
                    </span>
                    <h4 className="text-sm font-semibold text-[#111827]">
                      {p.name}
                    </h4>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
                    {p.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.triggers.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#64748B]"
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
                  className="rounded-lg border border-[#D1D5DB] px-3 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:border-[#7C3AED] hover:text-[#7C3AED]"
                >
                  Simulate
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
                  className="rounded-lg bg-[#7C3AED] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]"
                >
                  {isDeployed ? 'Deployed ✓' : 'Deploy'}
                </button>
                {p.status !== 'Approved' && (
                  <span className="text-[11px] text-[#9CA3AF]">
                    Deploy requires Approved status
                  </span>
                )}
              </div>

              {simResult[p.id] && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-xs font-medium text-[#15803D]">
                  <span>✓</span>
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

  const STATUS_STYLE: Record<Violation['status'], { bg: string; text: string }> =
    {
      open: { bg: '#EFF6FF', text: '#2563EB' },
      accepted: { bg: '#F0FDF4', text: '#16A34A' },
      rejected: { bg: '#F1F5F9', text: '#64748B' },
      closed: { bg: '#F1F5F9', text: '#64748B' },
    }

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
    <section className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#E5E7EB] px-5 py-3.5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#111827]">
          <span>🚨</span> Violations Queue
        </h3>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="bg-[#F9FAFB] text-[10px] uppercase tracking-wide text-[#9CA3AF]">
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
        <tbody className="divide-y divide-[#F1F5F9]">
          {violations.map((v) => {
            const sev = SEVERITY_STYLE[v.severity]
            const st = STATUS_STYLE[v.status]
            return (
              <tr key={v.id} className="align-top hover:bg-[#F9FAFB]">
                <td className="px-5 py-3 font-medium text-[#111827]">
                  {v.description}
                  {assigned[v.id] && (
                    <span className="mt-1 block text-[10px] font-normal text-[#7C3AED]">
                      CA: {assigned[v.id]}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 font-mono text-[#6B7280]">
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
                <td className="px-3 py-3 text-[#374151]">
                  {v.personName ?? '—'}
                </td>
                <td className="px-3 py-3 text-[#374151]">{v.zone}</td>
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
                        className="rounded-md bg-[#22C55E] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-[#16A34A]"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setStatus(v.id, 'rejected')}
                        className="rounded-md border border-[#D1D5DB] px-2.5 py-1 text-[11px] font-semibold text-[#374151] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setCaModal(v)}
                        className="rounded-md border border-[#7C3AED] px-2.5 py-1 text-[11px] font-semibold text-[#7C3AED] transition-colors hover:bg-[#F5F3FF]"
                      >
                        Assign CA
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#9CA3AF]">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Assign CA modal */}
      {caModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="border-b border-[#E5E7EB] px-5 py-4">
              <h4 className="text-base font-bold text-[#111827]">
                Assign Corrective Action
              </h4>
              <p className="mt-0.5 text-xs text-[#6B7280]">
                {caModal.description} · {caModal.ruleTitle}
              </p>
            </div>
            <div className="space-y-3 p-5">
              <label className="block text-xs font-semibold text-[#6B7280]">
                Owner
                <input
                  type="text"
                  value={caForm.owner}
                  placeholder="e.g. J. Torres"
                  onChange={(e) =>
                    setCaForm({ ...caForm, owner: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-[#D1D5DB] px-2.5 py-2 text-sm font-normal outline-none focus:border-[#7C3AED]"
                />
              </label>
              <label className="block text-xs font-semibold text-[#6B7280]">
                Due Date
                <input
                  type="date"
                  value={caForm.due}
                  onChange={(e) =>
                    setCaForm({ ...caForm, due: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-[#D1D5DB] px-2.5 py-2 text-sm font-normal outline-none focus:border-[#7C3AED]"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#E5E7EB] px-5 py-3">
              <button
                onClick={() => setCaModal(null)}
                className="rounded-lg border border-[#D1D5DB] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB]"
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
