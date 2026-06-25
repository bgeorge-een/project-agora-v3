import type { Metadata } from 'next'
import QualifyingFilter from '@/components/icp/QualifyingFilter'
import TargetingMatrix from '@/components/icp/TargetingMatrix'
import StickySubNav from '@/components/icp/StickySubNav'
import SegmentCard from '@/components/icp/SegmentCard'
import { SEGMENTS } from '@/lib/icp/data'

export const metadata: Metadata = {
  title: 'Who We Serve — Project Agora V3',
  description: 'ICP definitions for Mission Control and Case Management',
}

export default function WhoWeServePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <WhoWeServeHero />
      <StickySubNav />
      <QualifyingFilter />
      <TargetingMatrix />
      <SegmentCard segment={SEGMENTS[0]} />
      <SegmentCard segment={SEGMENTS[1]} sectionBg="#F8FAFC" />
      <SegmentCard segment={SEGMENTS[2]} />
    </div>
  )
}

function WhoWeServeHero() {
  return (
    <section
      className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-12"
      style={{
        background: 'linear-gradient(160deg, #FFFFFF 0%, #F8FAFC 45%, #EFF6FF 100%)',
      }}
    >
      <div className="relative mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
          Project Agora V3 · ICP Definitions
        </p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.5rem,6vw,3.75rem)] font-extrabold leading-[1.05] tracking-tight text-[#111827]">
          Who We Serve
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#6B7280]">
          The shared definition of our customer — who Mission Control and Case
          Management are built for, who buys them, and who uses them daily. One
          document for Engineering, Sales, Product, and Customer Success.
        </p>

        {/* Three audience-tagged product cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:mt-12">
          {[
            {
              accent: '#2563EB',
              iconBg: '#EFF6FF',
              icon: 'corporate_fare',
              label: 'MC-1',
              title: 'Direct Enterprise SOC',
              subtitle: 'In-house operators · Own console · Direct sale',
            },
            {
              accent: '#0D9488',
              iconBg: '#F0FDFA',
              icon: 'monitor_heart',
              label: 'MC-2',
              title: 'Monitoring Service Provider',
              subtitle: 'Central stations · Multi-tenant · Channel sale',
            },
            {
              accent: '#7C3AED',
              iconBg: '#F5F3FF',
              icon: 'manage_search',
              label: 'Case Management',
              title: 'Post-incident Investigation',
              subtitle: 'LP · Legal · Compliance · No SOC required',
            },
          ].map((card) => (
            <div
              key={card.label}
              className="flex flex-col rounded-lg bg-white p-5"
              style={{
                borderLeft: `4px solid ${card.accent}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: card.iconBg, color: card.accent }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  {card.icon}
                </span>
              </div>
              <p
                className="mt-3 text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ color: card.accent }}
              >
                {card.label}
              </p>
              <h3 className="mt-1 text-base font-bold text-[#111827]">{card.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">{card.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Last reviewed stamp */}
        <p className="mt-8 text-xs text-[#9CA3AF]">
          Last reviewed: June 24, 2026 · Next review: Q3 2026
        </p>
      </div>
    </section>
  )
}
