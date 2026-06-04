interface SectionHeaderProps {
  label?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  dark?: boolean
}

export default function SectionHeader({
  label,
  title,
  subtitle,
  align = 'left',
  dark = false,
}: SectionHeaderProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <div className={`max-w-2xl ${alignment}`}>
      {label && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#2563EB]">
          {label}
        </p>
      )}
      <h2
        className={`text-3xl font-bold tracking-tight ${
          dark ? 'text-white' : 'text-[#111827]'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-base leading-relaxed ${
            dark ? 'text-[#94A3B8]' : 'text-[#6B7280]'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
