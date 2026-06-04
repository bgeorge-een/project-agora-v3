import type { ReactNode } from 'react'

type StatusVariant =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'success'
  | 'info'
  | 'warning'

interface StatusPillProps {
  variant: StatusVariant
  children: ReactNode
  className?: string
}

const VARIANT_STYLES: Record<StatusVariant, { bg: string; text: string }> = {
  critical: { bg: '#FEF2F2', text: '#DC2626' },
  high: { bg: '#FFF7ED', text: '#EA580C' },
  medium: { bg: '#FFFBEB', text: '#D97706' },
  low: { bg: '#F1F5F9', text: '#64748B' },
  success: { bg: '#F0FDF4', text: '#16A34A' },
  info: { bg: '#EFF6FF', text: '#2563EB' },
  warning: { bg: '#FFFBEB', text: '#D97706' },
}

export default function StatusPill({
  variant,
  children,
  className = '',
}: StatusPillProps) {
  const style = VARIANT_STYLES[variant]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {children}
    </span>
  )
}
