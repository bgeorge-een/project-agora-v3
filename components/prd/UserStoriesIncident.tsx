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
        story: 'Supervise the live incident intake queue across the GSOC',
        criteria:
          'GSOC supervisor view shows open incident count, unassigned critical incidents, SLA-at-risk incidents, breached SLAs, average claim time, available operators, oldest unclaimed incident, and a prioritized queue sorted by unassigned critical, SLA risk, missing first action, severity, and age.',
      },
      {
        story: 'Assign or claim unowned incidents before SLA risk escalates',
        criteria:
          'Supervisor can filter by severity and ownership state, review unassigned critical incidents, claim an incident, assign it to an available operator, see owner/lifecycle/SLA/first-action status, and open the incident directly into the response workspace.',
      },
      {
        story: 'Monitor operator workload before assigning more incidents',
        criteria:
          'Supervisor workload panel shows operator availability, assigned count, critical count, average first-action time, and last activity so critical incidents are assigned to operators with capacity.',
      },
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
        story: 'Track incident lifecycle during live response',
        criteria:
          'Incident response workspace shows the current lifecycle stage; supported stages include detected, triaged, accepted, command assigned, containment, response, stabilized, monitoring, resolved, closed, and promoted to case; each stage transition requires a reason and captures actor, timestamp, previous stage, and next stage.',
      },
      {
        story: 'Assign an incident commander and active response team',
        criteria:
          'Incident header shows the incident commander; response team panel lets the operator add responders by name or group, role, status, team, contact method, responsibility, and notes; supported roles include SOC operator, site supervisor, guard, facilities, access admin, HR, Legal, law enforcement liaison, vendor, executive stakeholder, and observer.',
      },
      {
        story: 'Update responder status as the response unfolds',
        criteria:
          'Each responder can be moved through assigned, notified, acknowledged, en route, on scene, completed, or unavailable; status changes update the response team card and append an operator-visible audit receipt.',
      },
      {
        story: 'Reassign command without losing accountability',
        criteria:
          'Adding a new incident commander replaces the prior commander in the active command slot, updates the header, moves the lifecycle to command assigned when appropriate, and logs who made the assignment and why.',
      },
      {
        story: 'Accept a recommended action and see implementation progress',
        criteria:
          'Recommended action opens an action execution view and advances the incident toward containment; each action, such as restricting a badge or dispatching a guard, shows queued/running/needs confirmation/manual required/complete state, owner, target system, and timestamp.',
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
        story: 'Evaluate camera-captured patterns without opening live view first',
        criteria:
          'Camera timeline events show a responsive three-frame key evidence strip with before/key/after context, AI key-frame label, timestamp, source, preview-vs-preserved status, open clip, open live, and preserve actions.',
      },
      {
        story: 'Fetch additional camera context around a key frame',
        criteria:
          'Operator can expand a camera event to fetch archive context frames from roughly 5-10 seconds before and after the selected key frame; degraded or unavailable preview states remain visible instead of silently disappearing.',
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
          'Incident record carries evidence, timeline, lifecycle history, response team roster, action execution history, entities, notes, operator decisions, and map/video context into Case Management.',
      },
    ],
  },
]

const ACCENT = '#2563EB'
const TINT = '#EFF6FF'

export default function UserStoriesIncident() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          label="What operators need to do"
          title="User Stories — Real-time Incident Management"
          subtitle="Grouped by theme. Each story is paired with its key acceptance criteria."
        />

        <div className="mt-10 space-y-8 lg:mt-12">
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

              <div className="space-y-3 lg:hidden">
                {theme.stories.map((s) => (
                  <article
                    key={s.story}
                    className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
                      Story
                    </p>
                    <h3 className="mt-1 text-base font-bold leading-snug text-[#111827]">
                      {s.story}
                    </h3>
                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
                      Key Acceptance Criteria
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#4B5563]">
                      {s.criteria}
                    </p>
                  </article>
                ))}
              </div>

              <div
                className="hidden overflow-hidden rounded-lg border border-[#E5E7EB] bg-white lg:block"
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
