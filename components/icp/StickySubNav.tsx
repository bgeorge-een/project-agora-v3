'use client'

import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Filter', href: '#filter' },
  { label: 'Matrix', href: '#matrix' },
  { label: 'MC-1', href: '#mc1' },
  { label: 'MC-2', href: '#mc2' },
  { label: 'Cases', href: '#case-management' },
  { label: 'Hypotheses', href: '#hypotheses' },
  { label: 'Market', href: '#market' },
  { label: 'Questions', href: '#questions' },
]

const SECTION_IDS = NAV_LINKS.map((l) => l.href.replace('#', ''))

export default function StickySubNav() {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <nav
      className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm"
      aria-label="Page sections"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-12">
        {NAV_LINKS.map((link) => {
          const isActive = activeId === link.href.replace('#', '')
          return (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
              style={
                isActive
                  ? { backgroundColor: '#EFF6FF', color: '#2563EB' }
                  : { color: '#6B7280' }
              }
            >
              {link.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
