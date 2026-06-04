interface ProductCard {
  icon: string
  title: string
  subtitle: string
  variant: 'platform' | 'incident' | 'case'
}

const PRODUCTS: ProductCard[] = [
  {
    icon: '⚙️',
    title: 'Agora Platform',
    subtitle: 'Shared intelligence fabric · Not user-facing',
    variant: 'platform',
  },
  {
    icon: '⚡',
    title: 'Real-time Incident Mgmt',
    subtitle: 'L1–L5 · Site to enterprise',
    variant: 'incident',
  },
  {
    icon: '🔍',
    title: 'Case Management',
    subtitle: 'L1–L5 · Post-incident forensics',
    variant: 'case',
  },
]

const CARD_STYLE: Record<
  ProductCard['variant'],
  { bg: string; ring: string; accent: string }
> = {
  platform: { bg: '#1E2D42', ring: '#2A3B54', accent: '#94A3B8' },
  incident: { bg: '#13294D', ring: '#2563EB', accent: '#60A5FA' },
  case: { bg: '#231640', ring: '#7C3AED', accent: '#A78BFA' },
}

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden px-12 pb-20 pt-20"
      style={{
        background:
          'linear-gradient(135deg, #172130 0%, #15263e 55%, #1a3a5c 100%)',
      }}
    >
      {/* subtle grid glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 10%, rgba(56,189,248,0.18), transparent 45%), radial-gradient(circle at 15% 90%, rgba(124,58,237,0.14), transparent 45%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#38BDF8]">
          Project Agora V3
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-white">
          Physical Intelligence Platform
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#94A3B8]">
          The vendor-agnostic intelligence fabric for enterprise security. Two
          licensable apps. One shared platform.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PRODUCTS.map((p) => {
            const s = CARD_STYLE[p.variant]
            return (
              <div
                key={p.title}
                className="group relative rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
                style={{
                  backgroundColor: s.bg,
                  boxShadow: `inset 0 0 0 1px ${s.ring}`,
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  {p.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{p.title}</h3>
                <p
                  className="mt-1.5 text-sm leading-snug"
                  style={{ color: s.accent }}
                >
                  {p.subtitle}
                </p>
                <div
                  className="mt-5 h-1 w-10 rounded-full transition-all duration-200 group-hover:w-16"
                  style={{ backgroundColor: s.ring }}
                />
              </div>
            )
          })}
        </div>

        <div className="mt-12">
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#1D4ED8]"
          >
            Explore the apps
            <span aria-hidden>↓</span>
          </a>
        </div>
      </div>
    </section>
  )
}
