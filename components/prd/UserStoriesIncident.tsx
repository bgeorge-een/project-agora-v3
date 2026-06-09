import SectionHeader from '@/components/ui/SectionHeader'

interface Story {
  story: string
  criteria: string
}

interface Theme {
  name: string
  stories: Story[]
}

const THEMES: Theme[] = [
  {
    name: 'SOC Load Reduction',
    stories: [
      {
        story: 'Triage a role-filtered live queue without missing critical work',
        criteria:
          'Critical always expanded; High/Med/Low collapsible; new alerts enter correct group live; each card shows severity, type (⚡/🛡), location, age, sources, confidence, AI badge, and assigned role lane.',
      },
      {
        story: 'Suppress cognitive noise without losing accountability',
        criteria:
          'Duplicate and low-signal events cluster under the primary incident; operator sees one recommended next best action, why it matters, and what evidence supports it.',
      },
      {
        story: 'Override with reason',
        criteria:
          'Reason picker (wrong severity / false positive / escalating / handling differently); FeedbackRecord written; override visible in activity log.',
      },
    ],
  },
  {
    name: 'Action Assurance',
    stories: [
      {
        story: 'See NBA recommendation and SOP steps side-by-side',
        criteria:
          'NBA card shows action + confidence + 2 alternatives; SOP steps from SOP Library retrieved by incident type; two-tier human/system execution clear.',
      },
      {
        story: 'Gate high-risk actions behind approval',
        criteria:
          'Lock/restrict door, notify HR/Legal, lockdown, law-enforcement escalation require explicit operator approval; auto-execute items listed separately.',
      },
      {
        story: 'Confirm every response action reached its target system',
        criteria:
          'Each Playbook action shows requested / sent / acknowledged / failed / retried state, target system, timestamp, owner, and exception path.',
      },
    ],
  },
  {
    name: 'Visual Verification',
    stories: [
      {
        story: 'Verify an alert in one screen without pivoting',
        criteria:
          'Person identity card; correlated event timeline with camera stills; access event log with badge, door, denial reason; agent observations inline.',
      },
      {
        story: 'View camera evidence at the moment of incident',
        criteria:
          'Camera stills for before/during/after; click still to play mock clip; clip shows location, timestamp, playback controls.',
      },
      {
        story: 'Operate a camera wall during active response',
        criteria:
          'World Monitor-style wall supports pinning incident, adjacent zone, and officer body/device feeds; switch from wall to live view; preserve clips from the same surface.',
      },
      {
        story: 'Open live camera view with recent context',
        criteria:
          'Clicking an indoor floor camera opens live view; recent camera events and detections visible beside the stream; current incident camera remains highlighted.',
      },
    ],
  },
  {
    name: 'Map Workflows',
    stories: [
      {
        story: 'Operate incidents across global, regional, site, and floor maps',
        criteria:
          'Role hierarchy scopes global, regional, site, and floor views; supervisors see the right rollups, queues, escalation paths, and actions for their level.',
      },
      {
        story: 'Open site operations from the map',
        criteria:
          'Site click opens cameras, devices, incidents, responders, and active workflows; site supervisor can filter by building, floor, severity, and owner.',
      },
      {
        story: 'Drill into devices with operational context',
        criteria:
          'Device click opens health, details, controls, and live view when applicable; offline/failed states, owner, and recent events visible.',
      },
      {
        story: 'Switch from street map to indoor floor plan',
        criteria:
          'Floor altitude renders indoor floor plan instead of street tiles; floor selector switches levels; active incidents, cameras, doors, sensors, and responders stay floor-scoped.',
      },
      {
        story: 'Operate floor devices directly from the map',
        criteria:
          'Floor cameras and devices are clickable; camera opens live view; door, sensor, and responder selections open relevant detail or action controls.',
      },
      {
        story: 'Review incident evidence from map context',
        criteria:
          'Incident click opens timeline, evidence, and action review; operator can jump from floor marker to detections, clips, access logs, and response history.',
      },
    ],
  },
  {
    name: 'Role-aware Operations',
    stories: [
      {
        story: 'Show each role the operational level it can act on',
        criteria:
          'L1 sees assigned floor/site context; site supervisor manages site workload; regional/global supervisors see portfolio rollups with scoped actions.',
      },
      {
        story: 'Monitor site health and SLA',
        criteria:
          'MTTA, MTTR, false-positive rate, offline devices, SLA compliance by site; filterable.',
      },
      {
        story: 'Review AI quality and deterrence outcomes',
        criteria:
          'Recommendation acceptance rate, top override reasons, confidence distribution by detector, deterrence effectiveness, and action failure trends filterable.',
      },
    ],
  },
]

const ACCENT = '#2563EB'
const TINT = '#EFF6FF'

export default function UserStoriesIncident() {
  return (
    <section className="bg-white px-12 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="What operators need to do"
          title="User Stories — Real-time Incident Management"
          subtitle="Grouped by theme. Each story is paired with its key acceptance criteria."
        />

        <div className="mt-12 space-y-8">
          {THEMES.map((theme) => (
            <div key={theme.name}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  {theme.name}
                </span>
              </div>
              <div
                className="overflow-hidden rounded-lg border border-[#E5E7EB] bg-white"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              >
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr
                      className="border-b border-[#E5E7EB]"
                      style={{ backgroundColor: TINT }}
                    >
                      <th className="w-2/5 px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
                        Story
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
                        Key Acceptance Criteria
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {theme.stories.map((s, i) => (
                      <tr
                        key={s.story}
                        className={`border-b border-[#F3F4F6] ${
                          i % 2 === 1 ? 'bg-[#FAFBFC]' : 'bg-white'
                        }`}
                      >
                        <td className="px-5 py-4 align-top font-semibold text-[#111827]">
                          {s.story}
                        </td>
                        <td className="px-5 py-4 align-top leading-relaxed text-[#6B7280]">
                          {s.criteria}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
