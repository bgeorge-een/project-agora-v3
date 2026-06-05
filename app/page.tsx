import Link from 'next/link'
import HeroSection from '@/components/prd/HeroSection'
import ArchitectureDiagram from '@/components/prd/ArchitectureDiagram'
import PlatformPillars from '@/components/prd/PlatformPillars'
import AgentPipelineDiagram from '@/components/prd/AgentPipelineDiagram'
import DataModelTable from '@/components/prd/DataModelTable'
import AlertLifecycleFlow from '@/components/prd/AlertLifecycleFlow'
import PersonaHierarchy from '@/components/prd/PersonaHierarchy'
import UserStoriesIncident from '@/components/prd/UserStoriesIncident'
import UserStoriesCaseManagement from '@/components/prd/UserStoriesCaseManagement'
import CompetitiveTable from '@/components/prd/CompetitiveTable'
import BuildRoadmap from '@/components/prd/BuildRoadmap'

function BottomCTA() {
  return (
    <section className="bg-[#EFF6FF] px-12 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#111827]">
          Ready to see it in action?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#6B7280]">
          Two licensable apps, one shared intelligence fabric. Step into each to
          see how Agora turns raw signals into decisive action.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/incident-management"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-7 py-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#1D4ED8] sm:w-auto"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>bolt</span>
            Real-time Incident Management <span aria-hidden>→</span>
          </Link>
          <Link
            href="/case-management"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-7 py-4 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#6D28D9] sm:w-auto"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>manage_search</span>
            Case Management <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function OverviewPage() {
  return (
    <div>
      <HeroSection />
      <ArchitectureDiagram />
      <PlatformPillars />
      <AgentPipelineDiagram />
      <DataModelTable />
      <AlertLifecycleFlow />
      <PersonaHierarchy />
      <UserStoriesIncident />
      <UserStoriesCaseManagement />
      <CompetitiveTable />
      <BuildRoadmap />
      <BottomCTA />
    </div>
  )
}
