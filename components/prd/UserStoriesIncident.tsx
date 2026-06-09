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
    name: 'SOC Triage & Focus',
    stories: [
      {
        story: 'Triage a live alert queue without losing critical focus',
        criteria:
          'Critical alerts remain expanded; lower-severity groups are collapsible; each incident card shows severity, incident type, location, local time, elapsed time, sources, confidence, and a solid Respond/Open action.',
      },
      {
        story: 'Reduce cognitive load during long SOC shifts',
        criteria:
          'Legible dark theme; high-contrast secondary text; 48px+ primary targets; inactive tabs remain readable; critical labels are saturated and glanceable; low-priority content is visually quieter.',
      },
      {
        story: 'Override or dismiss with a reason',
        criteria:
          'Operator can override a recommendation with structured reason and notes; override creates a FeedbackRecord and remains visible in the incident/case history.',
      },
    ],
  },
  {
    name: 'Response Execution',
    stories: [
      {
        story: 'Accept a recommended action and see implementation progress',
        criteria:
          'Recommended action opens an action execution view; each action, such as restricting a badge or dispatching a guard, shows queued/running/needs confirmation/manual required/complete state, owner, target system, and timestamp.',
      },
      {
        story: 'Understand why the recommendation was made before acting',
        criteria:
          'Next-best-action panel shows the recommendation, rationale, confidence, response phase, supporting/conflicting evidence, alternatives, and SOP checklist in one view.',
      },
      {
        story: 'Gate high-risk physical actions behind confirmation',
        criteria:
          'Restrict badge, lock door, notify HR/Legal, dispatch guard, lockdown, and law-enforcement escalation remain explicit human-confirmation actions; auto-execute and manual-required actions are visually distinct.',
      },
      {
        story: 'Recover when an action fails or needs manual follow-up',
        criteria:
          'Failed or manual-required actions expose the exception, next owner, retry path, and whether the incident can proceed or must be escalated.',
      },
    ],
  },
  {
    name: 'Evidence & Video Verification',
    stories: [
      {
        story: 'Verify an incident without pivoting to another tool',
        criteria:
          'Incident side panel shows person identity, location, risk, correlated evidence, access events, camera evidence, agent analysis, action rationale, and operator notes.',
      },
      {
        story: 'Review the incident timeline and supporting evidence',
        criteria:
          'Timeline presents access, camera, agent, manual, and action events; camera stills/clips, badge denial reason, source count, and evidence provenance are visible.',
      },
      {
        story: 'Open live camera view with recent context',
        criteria:
          'Clicking a camera opens live view when online; recent detections/events, stream health, recording status, coverage area, and linked incident context remain visible.',
      },
      {
        story: 'Preserve useful clips and stills from the response surface',
        criteria:
          'Operator can review before/during/after evidence and preserve relevant clips/stills into the incident record for case handoff.',
      },
    ],
  },
  {
    name: 'Map & Indoor Operations',
    stories: [
      {
        story: 'Operate across global, regional, site, and floor altitude',
        criteria:
          'Role hierarchy scopes map altitude; operator/site/regional/global supervisors see rollups, sites, incidents, device health, external risk, and actions appropriate to their level.',
      },
      {
        story: 'Open site operations from the map',
        criteria:
          'Site click opens selected-site details, active incidents, camera list, device health, related devices, responders, and workflow actions.',
      },
      {
        story: 'Drill into devices with operational context',
        criteria:
          'Device click opens health, details, owner/location, recent events, linked incidents, and live view when the device is an online camera.',
      },
      {
        story: 'Switch between building floors without losing context',
        criteria:
          'Floor altitude renders a CAD-style image floor plan with Leaflet pan/zoom; top selector swaps floors; markers, incidents, devices, health events, and camera coverage remain floor-scoped.',
      },
      {
        story: 'Operate cameras, doors, and sensors from the floor plan',
        criteria:
          'Floor markers are clickable; camera opens live view; door/sensor selections open details; incident marker opens incident review; selected marker remains visually highlighted.',
      },
      {
        story: 'See device-health anomalies even when devices are online',
        criteria:
          'Devices needing attention can show online status plus health events such as low bandwidth, missed preview frames, preview latency, packet loss, noisy sensors, or recording gaps.',
      },
    ],
  },
  {
    name: 'Operational Intelligence',
    stories: [
      {
        story: 'Monitor site and portfolio health',
        criteria:
          'Map and insights views expose open incidents, oldest active incident, offline/degraded devices, risk level, site counts, external risk, SLA/response posture, and workload context.',
      },
      {
        story: 'Review AI quality and deterrence outcomes',
        criteria:
          'Insights summarize recommendation acceptance, override reasons, confidence, false-positive/quality trends, deterrence effectiveness, and failed-action trends.',
      },
      {
        story: 'Promote a resolved incident into a case',
        criteria:
          'Incident record carries evidence, timeline, action execution history, entities, notes, operator decisions, and map/video context into Case Management.',
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
