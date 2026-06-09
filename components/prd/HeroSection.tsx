interface ProductCard {
  icon: string
  title: string
  subtitle: string
  variant: 'platform' | 'incident' | 'case'
}

const PRODUCTS: ProductCard[] = [
  {
    icon: 'hub',
    title: 'Agora Platform',
    subtitle: 'Shared intelligence fabric · APIs consumed by both apps',
    variant: 'platform',
  },
  {
    icon: 'bolt',
    title: 'Real-time Incident Management',
    subtitle:
      'Role-aware SOC operations · Map workflows · Live video · Assured actions',
    variant: 'incident',
  },
  {
    icon: 'manage_search',
    title: 'Case Management',
    subtitle:
      'Investigation continuity · Evidence timelines · Narrative and governance',
    variant: 'case',
  },
]

const CARD_STYLE: Record<
  ProductCard['variant'],
  { border: string; iconBg: string; iconColor: string; badge: string }
> = {
  platform: {
    border: '#172130',
    iconBg: '#F3F4F6',
    iconColor: '#172130',
    badge: '#172130',
  },
  incident: {
    border: '#2563EB',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    badge: '#2563EB',
  },
  case: {
    border: '#7C3AED',
    iconBg: '#F5F3FF',
    iconColor: '#7C3AED',
    badge: '#7C3AED',
  },
}

export default function HeroSection() {
  return (
    <section
      className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-12"
      style={{
        background:
          'linear-gradient(160deg, #FFFFFF 0%, #F8FAFC 45%, #EFF6FF 100%)',
      }}
    >
      <div className="relative mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
          Project Agora V3
        </p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.5rem,6vw,3.75rem)] font-extrabold leading-[1.05] tracking-tight text-[#111827]">
          Physical Intelligence Platform
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#6B7280]">
          The vendor-agnostic intelligence fabric for enterprise security —
          reducing SOC cognitive load in the moment, then preserving the full
          case record for investigation and improvement.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 lg:mt-12">
          {PRODUCTS.map((p) => {
            const s = CARD_STYLE[p.variant]
            return (
              <div
                key={p.title}
                className="group flex flex-col rounded-lg bg-white p-6 transition-transform duration-200 hover:-translate-y-1"
                style={{
                  borderLeft: `4px solid ${s.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: s.iconBg, color: s.iconColor }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 26 }}>{p.icon}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold leading-snug text-[#111827]">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  {p.subtitle}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-12">
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
          >
            Explore the apps
            <span aria-hidden>↓</span>
          </a>
        </div>
      </div>
    </section>
  )
}
