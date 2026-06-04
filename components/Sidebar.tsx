'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  icon: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: '📋', label: 'Overview' },
  { href: '/incident-management', icon: '⚡', label: 'Real-time Incident Mgmt' },
  { href: '/case-management', icon: '🔍', label: 'Case Management' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-[#172130]">
      <div className="px-6 pb-8 pt-7">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-[#38BDF8]">
            AGORA
          </span>
          <span className="mt-1 rounded bg-[#1E2D42] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            V3
          </span>
        </Link>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#4B5A70]">
          Physical Intelligence
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#1E2D42] text-[#38BDF8]'
                  : 'text-[#CBD5E0] hover:bg-[#1E2D42]/60 hover:text-white'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[#243349] px-6 py-4">
        <p className="text-xs font-medium text-[#4B5A70]">V3 · Agora Platform</p>
      </div>
    </aside>
  )
}
