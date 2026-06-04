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
    name: 'Alert Queue & Triage',
    stories: [
      {
        story: 'Triage a severity-grouped live queue without missing critical work',
        criteria:
          'Critical always expanded; High/Med/Low collapsible; new alerts enter correct group live; each card shows severity, type (⚡/🛡), location, age, sources, AI badge.',
      },
      {
        story: 'Accept AI recommendation with one click',
        criteria:
          'Creates downstream action with agent attribution; auto-executes low-risk actions (lock evidence, notify on-call); FeedbackRecord written on accept.',
      },
      {
        story: 'Override with reason',
        criteria:
          'Reason picker (wrong severity / false positive / escalating / handling differently); FeedbackRecord written; override visible in activity log.',
      },
    ],
  },
  {
    name: 'NBA + SOP Response',
    stories: [
      {
        story: 'See NBA recommendation and SOP steps side-by-side',
        criteria:
          'NBA card shows action + confidence + 2 alternatives; SOP steps from SOP Library retrieved by incident type; two-tier execution clear.',
      },
      {
        story: 'Gate high-risk actions behind approval',
        criteria:
          'Lock/restrict door, notify HR/Legal, lockdown, law-enforcement escalation require explicit operator approval; auto-execute items listed separately.',
      },
      {
        story: 'Work a Playbook response checklist',
        criteria:
          'Checklist drawn from active Playbook; each step completable / skippable with reason / escalatable; all timestamped.',
      },
    ],
  },
  {
    name: 'Evidence & Verification',
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
        story: 'Annotate FP/FN outcome',
        criteria:
          'Mark true positive / false positive / duplicate / test / unresolved; FeedbackRecord written to platform.',
      },
    ],
  },
  {
    name: 'Deterrence',
    stories: [
      {
        story: 'Handle Deterrence Alerts distinctly',
        criteria:
          '🛡 DETERRENT label vs ⚡ REACTIVE; deterrence-specific NBA and SOP; affected-site radius visible; outcome annotation distinguishes deterrence effectiveness.',
      },
      {
        story: 'Configure deterrence playbook trigger',
        criteria:
          'Trigger conditions combine: signal type, severity threshold, proximity radius, internal corroborating signals; auto-execution configurable for pre-approved patterns.',
      },
    ],
  },
  {
    name: 'Multi-site & Leadership',
    stories: [
      {
        story: 'Operate across sites from a map view',
        criteria:
          'All sites plotted with severity; external signal overlays toggle; act on incident from map; resources reassignable.',
      },
      {
        story: 'Monitor site health and SLA',
        criteria:
          'MTTA, MTTR, false-positive rate, offline devices, SLA compliance by site; filterable.',
      },
      {
        story: 'Review AI quality',
        criteria:
          'Recommendation acceptance rate, top override reasons, confidence distribution by detector; trends filterable.',
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
