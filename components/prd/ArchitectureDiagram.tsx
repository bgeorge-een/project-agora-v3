import SectionHeader from '@/components/ui/SectionHeader'

const PLATFORM_CAPABILITIES = [
  'Signal Intel',
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
          subtitle="Two licensable applications sit on top of one shared intelligence platform, consuming its capabilities through a common set of Platform APIs."
        />

        <div className="mt-14">
          {/* App tier */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-[#2563EB]/30 bg-[#EFF6FF] p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB] text-lg">
                  ⚡
                </span>
                <div>
                  <p className="text-sm font-bold text-[#1E3A8A]">
                    Real-time Incident Mgmt
                  </p>
                  <p className="text-xs text-[#2563EB]">Live operations app</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-[#7C3AED]/30 bg-[#F5F3FF] p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7C3AED] text-lg">
                  🔍
                </span>
                <div>
                  <p className="text-sm font-bold text-[#5B21B6]">
                    Case Management
                  </p>
                  <p className="text-xs text-[#7C3AED]">Forensics app</p>
                </div>
              </div>
            </div>
          </div>

          {/* Connectors */}
          <div className="relative flex items-stretch justify-center gap-40 px-[12%]">
            <div className="flex w-px flex-col items-center">
              <div className="h-10 w-px bg-[#CBD5E1]" />
            </div>
            <div className="flex w-px flex-col items-center">
              <div className="h-10 w-px bg-[#CBD5E1]" />
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                consume via Platform APIs
              </span>
            </div>
          </div>

          {/* Platform tier */}
          <div
            className="rounded-2xl px-8 py-7"
            style={{
              background:
                'linear-gradient(135deg, #172130 0%, #1c2c44 100%)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#38BDF8]/15 text-lg">
                  ⚙️
                </span>
                <h3 className="text-xl font-bold text-white">Agora Platform</h3>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                Shared · Not user-facing
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {PLATFORM_CAPABILITIES.map((cap) => (
                <span
                  key={cap}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-[#CBD5E0]"
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
