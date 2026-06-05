import SectionHeader from '@/components/ui/SectionHeader'

/* ── Particle shapes ──────────────────────────────────────── */

function Dots({ count, color }: { count: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, padding: '10px 12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }}
        />
      ))}
    </div>
  )
}

function Squares({ count, color }: { count: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '10px 12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ width: 9, height: 9, background: color, flexShrink: 0 }} />
      ))}
    </div>
  )
}

function Triangles({ count, color }: { count: number; color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 7,
        padding: '12px 10px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ fontSize: 17, color, lineHeight: 1 }}>
          ▲
        </span>
      ))}
    </div>
  )
}

function Stars({ count, color }: { count: number; color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: '14px 8px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ fontSize: 26, color, lineHeight: 1 }}>
          ★
        </span>
      ))}
    </div>
  )
}

/* ── Funnel graphic ───────────────────────────────────────── */

function FunnelGraphic() {
  const TUBE_W = '32%'

  return (
    <div style={{ position: 'relative', width: 300, userSelect: 'none' }}>
      {/* ── Main funnel: Signal + Event + Alert ── */}
      <div
        style={{
          clipPath: 'polygon(4% 0%, 96% 0%, 66% 100%, 34% 100%)',
          filter: 'drop-shadow(0 3px 10px rgba(37,99,235,0.18))',
        }}
      >
        {/* Signal */}
        <div style={{ background: '#DBEAFE', height: 130, overflow: 'hidden' }}>
          <Dots count={52} color="#93C5FD" />
        </div>
        {/* Event */}
        <div style={{ background: '#93C5FD', height: 105, overflow: 'hidden' }}>
          <Squares count={24} color="#2563EB" />
        </div>
        {/* Alert */}
        <div style={{ background: '#3B82F6', height: 90, overflow: 'hidden' }}>
          <Triangles count={10} color="#BFDBFE" />
        </div>
      </div>

      {/* ── Neck connector ── */}
      <div
        style={{
          width: TUBE_W,
          margin: '0 auto',
          height: 3,
          background: '#2563EB',
          borderLeft: '2px solid #1D4ED8',
          borderRight: '2px solid #1D4ED8',
        }}
      />

      {/* ── Tube: Incident ── */}
      <div
        style={{
          width: TUBE_W,
          margin: '0 auto',
          background: '#1E3A5F',
          borderLeft: '2px solid #172130',
          borderRight: '2px solid #172130',
        }}
      >
        <Stars count={2} color="#93C5FD" />
      </div>

      {/* ── Tube bottom cap ── */}
      <div
        style={{
          width: TUBE_W,
          margin: '0 auto',
          height: 3,
          background: '#172130',
        }}
      />

      {/* ── Below: Incident resolved branch ── */}
      <div
        style={{
          width: TUBE_W,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 8,
          gap: 4,
        }}
      >
        <span style={{ color: '#6B7280', fontSize: 18, lineHeight: 1 }}>↓</span>
        <div
          style={{
            background: '#EFF6FF',
            border: '1.5px solid #2563EB',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: '#1E40AF',
            whiteSpace: 'nowrap',
          }}
        >
          Resolved
        </div>
      </div>

      {/* ── Case offshoot ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          marginTop: 8,
        }}
      >
        <span style={{ color: '#9CA3AF', fontSize: 12 }}>↓ continue</span>
        <span style={{ color: '#D1D5DB', fontSize: 12 }}>or</span>
        <span style={{ color: '#7C3AED', fontSize: 12 }}>→ promote</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginTop: 6,
        }}
      >
        <div
          style={{
            background: '#EFF6FF',
            border: '1.5px solid #93C5FD',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 11,
            fontWeight: 600,
            color: '#1D4ED8',
            whiteSpace: 'nowrap',
          }}
        >
          Closed
        </div>
        <span style={{ color: '#7C3AED', fontSize: 14 }}>→</span>
        <div
          style={{
            background: '#F5F3FF',
            border: '1.5px solid #7C3AED',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: '#5B21B6',
            whiteSpace: 'nowrap',
          }}
        >
          Case (forensic)
        </div>
      </div>

      {/* ── Notification offshoot label ── */}
      {/* Positioned at the right of the Alert layer: top of funnel body = 0, Alert starts at 130+105=235px */}
      <div
        style={{
          position: 'absolute',
          top: 235 + 45, // midpoint of Alert section (90px tall)
          right: -12,
          transform: 'translate(100%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span style={{ color: '#EA580C', fontSize: 13 }}>→</span>
        <div
          style={{
            background: '#FFF7ED',
            border: '1.5px solid #EA580C',
            borderRadius: 6,
            padding: '4px 9px',
            fontSize: 11,
            fontWeight: 700,
            color: '#C2410C',
            whiteSpace: 'nowrap',
          }}
        >
          Notification
        </div>
      </div>
    </div>
  )
}

/* ── Layer icons ──────────────────────────────────────────── */

interface Layer {
  num: number
  icon: string
  label: string
  sub: string
  description: string
  accentBg: string
  accentColor: string
  sideNote?: { label: string; color: string; bg: string; border: string }
}

const LAYERS: Layer[] = [
  {
    num: 1,
    icon: 'sensors',
    label: 'Signal',
    sub: 'Ingest & Log',
    description:
      'Raw device telemetry. One data point from one device — a motion pixel change, door contact, badge scan. Millions per day. Invisible to users; processed by the platform only.',
    accentBg: '#DBEAFE',
    accentColor: '#1E40AF',
  },
  {
    num: 2,
    icon: 'event_note',
    label: 'Event',
    sub: 'Process & Audit',
    description:
      'A normalized, meaningful state change produced from one or more signals. "Door opened," "Person entered Zone B." Logged and queryable. Visible in audit logs — not necessarily actionable.',
    accentBg: '#BFDBFE',
    accentColor: '#1D4ED8',
  },
  {
    num: 3,
    icon: 'warning',
    label: 'Alert',
    sub: 'Triage & Acknowledge',
    description:
      'An event that matched a security policy — surfaced to the operator queue. Requires a triage decision: accept (→ Incident) or dismiss (→ FeedbackRecord). Also fires Notifications to configured recipients.',
    accentBg: '#93C5FD',
    accentColor: '#1E40AF',
    sideNote: {
      label: '→ Notification (push / SMS / email)',
      color: '#C2410C',
      bg: '#FFF7ED',
      border: '#FED7AA',
    },
  },
  {
    num: 4,
    icon: 'emergency',
    label: 'Incident',
    sub: 'Contain & Resolve',
    description:
      'A confirmed, active threat that an operator has accepted and is managing in real time. Open while the threat is active. Closes when neutralized. Can be promoted to a Case for deep forensic investigation.',
    accentBg: '#1E3A5F',
    accentColor: '#BFDBFE',
    sideNote: {
      label: '→ Case (on promotion — forensic path)',
      color: '#5B21B6',
      bg: '#F5F3FF',
      border: '#C4B5FD',
    },
  },
]

/* ── Main export ──────────────────────────────────────────── */

export default function SignalFunnelDiagram() {
  return (
    <section className="px-12 py-20" style={{ background: '#EFF6FF' }}>
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="Signal hierarchy"
          title="From Raw Signal to Actionable Incident"
          subtitle="Every alert an operator sees has passed through four layers of reduction. Case branches off after Incident — it is investigation, not further narrowing."
        />

        <div className="mt-12 grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
          {/* ── Left: definitions ── */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {LAYERS.map((layer, i) => (
              <div
                key={layer.label}
                style={{
                  background: 'white',
                  borderBottom: i < LAYERS.length - 1 ? '1px solid #E5E7EB' : 'none',
                  padding: '20px 22px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Number badge */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: layer.accentBg,
                      color: layer.accentColor === '#BFDBFE' ? '#1E3A5F' : layer.accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {layer.num}
                  </div>
                  {/* Icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: layer.accentBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 20,
                        color: layer.accentColor === '#BFDBFE' ? '#1E3A5F' : layer.accentColor,
                      }}
                    >
                      {layer.icon}
                    </span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                        {layer.label}
                      </span>
                      <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
                        {layer.sub}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, marginTop: 10 }}>
                  {layer.description}
                </p>

                {layer.sideNote && (
                  <div
                    style={{
                      marginTop: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: layer.sideNote.bg,
                      border: `1px solid ${layer.sideNote.border}`,
                      borderRadius: 6,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: layer.sideNote.color,
                    }}
                  >
                    {layer.sideNote.label}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Right: funnel ── */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20, paddingRight: 80 }}>
            <FunnelGraphic />
          </div>
        </div>

        {/* ── Case callout ── */}
        <div
          style={{
            marginTop: 32,
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            padding: '18px 24px',
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 22, color: '#7C3AED', flexShrink: 0, marginTop: 2 }}
          >
            info
          </span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
              Why Case is an offshoot, not a funnel layer
            </span>
            <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginTop: 4 }}>
              The funnel represents volume reduction — millions of signals narrowing down to a handful of
              confirmed incidents. Case breaks that pattern: not every Incident becomes a Case, a single
              Case can span multiple Incidents (a Campaign), and Cases can be opened manually. Case is a
              deliberate forensic investigation triggered by a human decision — not a further filter.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
