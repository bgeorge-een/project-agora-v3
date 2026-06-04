import SectionHeader from '@/components/ui/SectionHeader'

const PLATFORM_CAPABILITIES = [
  'Signal Intelligence',
  'World Model',
  'Agents',
  'SOP + Playbook Engine',
  'Closed-Loop Learning',
]

export default function ArchitectureDiagram() {
  return (
    <section id="architecture" className="bg-white px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="How it fits together"
          title="Platform + App Architecture"
          subtitle="Two licensable apps share one intelligence fabric. The platform handles all signal ingest, normalization, AI enrichment, and learning — apps consume it via APIs."
        />

        <div
          className="mt-14 rounded-2xl p-6 sm:p-10"
          style={{ backgroundColor: '#EFF6FF' }}
        >
          {/* App tier */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div
              className="rounded-lg bg-white p-6"
              style={{
                borderLeft: '4px solid #2563EB',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-lg text-[#2563EB]">
                  ⚡
                </span>
                <div>
                  <p className="text-sm font-bold text-[#111827]">
                    Real-time Incident Management
                  </p>
                  <p className="text-xs text-[#2563EB]">Live operations app</p>
                </div>
              </div>
            </div>
            <div
              className="rounded-lg bg-white p-6"
              style={{
                borderLeft: '4px solid #7C3AED',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F3FF] text-lg text-[#7C3AED]">
                  🔍
                </span>
                <div>
                  <p className="text-sm font-bold text-[#111827]">
                    Case Management
                  </p>
                  <p className="text-xs text-[#7C3AED]">Forensics app</p>
                </div>
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="relative flex items-center justify-center py-6">
            <div className="absolute inset-x-[12%] top-1/2 h-px -translate-y-1/2 bg-[#BFDBFE]" />
            <span className="relative rounded-full border border-[#BFDBFE] bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#2563EB]">
              ↓ consume via Platform APIs ↓
            </span>
          </div>

          {/* Platform tier */}
          <div
            className="rounded-lg bg-white px-6 py-7 sm:px-8"
            style={{
              border: '2px solid #172130',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4F6] text-lg text-[#172130]">
                  ⚙️
                </span>
                <h3 className="text-xl font-bold text-[#172130]">
                  Agora Platform
                </h3>
              </div>
              <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                Shared intelligence fabric
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {PLATFORM_CAPABILITIES.map((cap) => (
                <span
                  key={cap}
                  className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2 text-sm font-medium text-[#374151]"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[#6B7280]">
          The platform owns the hard problems — normalizing signals from any
          vendor, maintaining a live world model, running the agentic enrichment
          pipeline, and learning from every operator decision. Apps stay thin:
          they orchestrate workflows and present intelligence the platform
          produces.
        </p>
      </div>
    </section>
  )
}
