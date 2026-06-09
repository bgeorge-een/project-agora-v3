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
    <div className="flex min-h-screen flex-col bg-[#0F1117]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[#273142] bg-[#171D29]/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 pt-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#273142] bg-[#111827] text-[#9CA3AF]">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', lineHeight: 1 }}
              >
                folder_open
              </span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Case Management
                </h1>
                <span className="rounded-full border border-[#374151] px-2 py-0.5 text-xs font-medium text-[#9CA3AF]">
                  Forensics
                </span>
              </div>
              <nav className="mt-0.5 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                <span>Cases</span>
                <span className="text-[#4B5563]">/</span>
                <span className="font-medium text-[#CBD5E0]">
                  Case-001: Unauthorized Server Room Access
                </span>
              </nav>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-[#9CA3AF] md:flex">
            <span className="h-2 w-2 rounded-full bg-[#64748B]" />
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
                className={`relative rounded-t-md px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active ? 'text-white' : 'text-[#A1A1AA] hover:bg-[#1F2937] hover:text-white'
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
