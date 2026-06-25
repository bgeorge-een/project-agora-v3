'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  icon: string
  label: string
  shortLabel: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: 'home_app_logo', label: 'Overview', shortLabel: 'Overview' },
  { href: '/incident-management', icon: 'bolt', label: 'Real-time Incident Mgmt', shortLabel: 'Incident' },
  { href: '/case-management', icon: 'manage_search', label: 'Case Management', shortLabel: 'Cases' },
  { href: '/who-we-serve', icon: 'groups', label: 'Who We Serve', shortLabel: 'ICP' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[4.5rem] flex-col bg-[#172130] transition-[width] duration-200 lg:flex 2xl:w-60">
        <div className="px-3 pb-6 pt-6 2xl:px-6 2xl:pb-8 2xl:pt-7">
          <Link
            href="/"
            aria-label="Agora overview"
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg 2xl:justify-start"
            title="Agora"
          >
            <span className="hidden text-2xl font-black tracking-tight text-[#38BDF8] 2xl:inline">
              AGORA
            </span>
            <span className="text-2xl font-black tracking-tight text-[#38BDF8] 2xl:hidden">
              A
            </span>
            <span className="mt-1 hidden rounded bg-[#1E2D42] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8] 2xl:inline">
              V3
            </span>
          </Link>
          <p className="mt-1 hidden text-xs font-medium uppercase tracking-[0.18em] text-[#94A3B8] 2xl:block">
            Physical Intelligence
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-2 2xl:px-3" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className={`flex min-h-12 items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors 2xl:justify-start ${
                  active
                    ? 'bg-[#1E2D42] text-[#38BDF8]'
                    : 'text-[#CBD5E0] hover:bg-[#1E2D42]/60 hover:text-white'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: 20, lineHeight: 1 }}
                >
                  {item.icon}
                </span>
                <span className="hidden 2xl:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="hidden border-t border-[#243349] px-6 py-4 2xl:block">
          <p className="text-xs font-medium text-[#94A3B8]">V3 · Agora Platform</p>
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#243349] bg-[#172130]/98 px-2 py-2 shadow-[0_-8px_24px_rgba(0,0,0,0.28)] backdrop-blur lg:hidden"
        aria-label="Primary navigation"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[#1E2D42] text-[#38BDF8]'
                  : 'text-[#CBD5E0] hover:bg-[#1E2D42]/60 hover:text-white'
              }`}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: 20, lineHeight: 1 }}
              >
                {item.icon}
              </span>
              <span>{item.shortLabel}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
