'use client'

import type { PersonDetails } from '@/lib/types'

// Small inline Material icon helper
function Icon({
  name,
  size = 12,
}: {
  name: string
  size?: number
}) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
    >
      {name}
    </span>
  )
}

function Field({
  label,
  value,
  mono,
  icon,
}: {
  label: string
  value?: string
  mono?: boolean
  icon?: string
}) {
  return (
    <div>
      <p className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
        {icon && <Icon name={icon} size={12} />}
        {label}
      </p>
      <p className={`text-xs text-[#CBD5E0] ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</p>
    </div>
  )
}

/**
 * Case-context person profile card. Mirrors the two-tier PersonCard pattern from
 * IncidentDetailDrawer, restyled with a purple (#7C3AED) accent for the case workspace.
 */
export function PersonCard({ person }: { person: PersonDetails }) {
  if (person.type === 'known') {
    const isHighRisk = person.avatarColor === '#DC2626'
    return (
      <div className="rounded-xl border border-[#273142] bg-[#171D29]">
        <div className="border-b border-[#273142] px-5 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="text-[#9CA3AF]">
              <Icon name="person" size={16} />
            </span>
            Subject of Investigation
          </h3>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#374151] text-lg font-bold text-white"
              style={{ backgroundColor: person.avatarColor }}
            >
              {person.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-bold text-white">{person.name}</h4>
                {isHighRisk && (
                  <span className="flex items-center gap-1 rounded-full bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-400">
                    <Icon name="warning" size={14} />
                    High Risk
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9CA3AF]">
                {person.role}
                {person.company ? ` · ${person.company}` : ''}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Field label="Badge ID" value={person.badgeId} mono icon="key" />
            <Field label="Access Level" value={person.accessLevel} icon="security" />
            <Field label="Department" value={person.department} />
          </div>
          {person.email && (
            <div className="mt-2">
              <Field label="Email" value={person.email} mono />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Unknown person — red-tinted card
  return (
    <div className="rounded-xl border border-[#7F1D1D] border-l-4 border-l-[#EF4444] bg-[#181010] p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: person.avatarColor }}
        >
          <Icon name="person_off" size={28} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="flex items-center gap-1.5 text-base font-bold text-red-300">
            <Icon name="person_off" size={18} />
            {person.label ?? 'Unknown Individual'}
          </h4>
          {person.watchlistCategory && (
            <span className="mt-1 inline-block rounded-full border border-[#7F1D1D] px-2 py-0.5 text-xs font-semibold text-red-300">
              {person.watchlistCategory}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {person.confidence != null && (
          <div>
            <p className="mb-1 text-xs font-semibold text-[#6B7280]">
              Face Match Confidence
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800">
                <div className="h-full bg-amber-500" style={{ width: `${person.confidence}%` }} />
              </div>
              <span className="font-mono text-xs font-bold text-amber-400">{person.confidence}%</span>
            </div>
          </div>
        )}

        {person.firstSeen && (
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-[#6B7280]">First seen</span>
            <span className="font-mono text-[#CBD5E0]">{person.firstSeen}</span>
          </div>
        )}

        {person.cameraSightings && person.cameraSightings.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold text-[#6B7280]">
              Camera Sightings
            </p>
            <div className="flex flex-wrap gap-1.5">
              {person.cameraSightings.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1 rounded border border-[#273142] bg-[#171D29] px-2 py-0.5 text-xs font-medium text-[#CBD5E0]"
                >
                  <Icon name="videocam" size={13} />
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {person.vehiclePlate && (
          <div>
            <p className="mb-1 text-xs font-semibold text-[#6B7280]">
              Vehicle Plate
            </p>
            <span className="inline-block rounded border border-gray-600 bg-gray-800 px-2 py-1 font-mono text-sm font-bold tracking-widest text-white">
              {person.vehiclePlate}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
