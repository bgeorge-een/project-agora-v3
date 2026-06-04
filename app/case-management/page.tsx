'use client'

import { useState } from 'react'
import CaseWorkspace from '@/components/case/CaseWorkspace'
import ComplianceDashboard from '@/components/case/ComplianceDashboard'
import ExecutiveReporting from '@/components/case/ExecutiveReporting'

type TabKey = 'workspace' | 'compliance' | 'executive'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'workspace', label: 'Case Workspace' },
  { key: 'compliance', label: 'Compliance Dashboard' },
  { key: 'executive', label: 'Executive Reporting' },
]

export default function CaseManagementPage() {
  const [tab, setTab] = useState<TabKey>('workspace')

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-8 pt-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F3FF] text-lg">
              🔍
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#111827]">
                  Case Management
                </h1>
                <span className="rounded-full bg-[#F5F3FF] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
                  Forensics
                </span>
              </div>
              <nav className="mt-0.5 flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span>Cases</span>
                <span className="text-[#D1D5DB]">/</span>
                <span className="font-medium text-[#374151]">
                  Case-001: Unauthorized Server Room Access
                </span>
              </nav>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-[#6B7280] md:flex">
            <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
            Post-incident forensics &amp; investigation
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 px-8 pt-4">
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'text-[#7C3AED]'
                    : 'text-[#6B7280] hover:text-[#374151]'
                }`}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#7C3AED]" />
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1">
        {tab === 'workspace' && <CaseWorkspace />}
        {tab === 'compliance' && <ComplianceDashboard />}
        {tab === 'executive' && <ExecutiveReporting />}
      </div>
    </div>
  )
}
