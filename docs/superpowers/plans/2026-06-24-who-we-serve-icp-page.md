# Who We Serve — ICP Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/who-we-serve` page to the project-agora-v3 Next.js app that presents the full ICP strategy (three customer segments, product hypotheses, market size, open questions) as a single light-themed scroll — readable by C-suite, Product, Engineering, Sales, and CS.

**Architecture:** Fully static page (no `'use client'` except `StickySubNav`) following the existing overview page pattern. All content lives in `lib/icp/data.ts` as typed constants. Eight components in `components/icp/` are composed directly in `app/who-we-serve/page.tsx`. No API calls, no state beyond the scroll-spy.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Material Symbols Outlined icons (already loaded globally), Inter font (already loaded globally).

## Global Constraints

- Light theme only — background `#F8FAFC`, no dark SOC styling on this page
- Follow HeroSection.tsx padding: `px-4 sm:px-6 lg:px-12`, content max-width `max-w-6xl mx-auto`
- Card pattern: white bg, `4px` colored left border, `boxShadow: '0 1px 3px rgba(0,0,0,0.1)'`
- Micro-labels: `text-xs font-semibold uppercase tracking-[0.15em] text-[#6B7280]`
- Icons: `<span className="material-symbols-outlined">` — use existing icon system, no new dependencies
- Teal token for MC-2: `#0D9488` — not in globals.css, use inline style
- No accordions, no audience toggles, no dark theme
- TypeScript strict — no `any`, all props typed
- Verification gate: `npm run build` must pass with zero TypeScript errors after every task

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `components/Sidebar.tsx` | Modify line 13–17 | Add "Who We Serve" nav item |
| `lib/icp/data.ts` | Create | All ICP content as typed constants |
| `app/who-we-serve/page.tsx` | Create | Page composition, Hero section inline |
| `components/icp/QualifyingFilter.tsx` | Create | 3-branch decision tree visual |
| `components/icp/TargetingMatrix.tsx` | Create | 9×4 matrix table + mobile stacked cards |
| `components/icp/StickySubNav.tsx` | Create | `'use client'` scroll-spy anchor nav |
| `components/icp/SegmentCard.tsx` | Create | Reusable card for MC-1, MC-2, Case Mgmt |
| `components/icp/HypothesisCard.tsx` | Create | Reusable card for all 11 hypotheses |
| `components/icp/TamCards.tsx` | Create | 4-card market opportunity row |
| `components/icp/OpenQuestions.tsx` | Create | Open questions with audience pills |

---

## Task 1: Nav item + data file

**Files:**
- Modify: `components/Sidebar.tsx` (lines 13–17)
- Create: `lib/icp/data.ts`

**Interfaces:**
- Produces: all typed constants consumed by every subsequent component

- [ ] **Step 1: Add nav item to Sidebar**

Open `components/Sidebar.tsx`. The `NAV_ITEMS` array is at lines 13–17. Add the new item:

```typescript
const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: 'home_app_logo', label: 'Overview', shortLabel: 'Overview' },
  { href: '/incident-management', icon: 'bolt', label: 'Real-time Incident Mgmt', shortLabel: 'Incident' },
  { href: '/case-management', icon: 'manage_search', label: 'Case Management', shortLabel: 'Cases' },
  { href: '/who-we-serve', icon: 'groups', label: 'Who We Serve', shortLabel: 'ICP' },
]
```

- [ ] **Step 2: Create the data file**

Create `lib/icp/data.ts` with this exact content:

```typescript
// ─── Types ──────────────────────────────────────────────────────────────────

export type SegmentStatus = 'in' | 'out' | 'conditional'
export type HypothesisStatus = 'testing' | 'validated' | 'invalidated'
export type QuestionStatus = 'open' | 'decided'
export type AudienceTag = 'ENG' | 'SALES' | 'PRODUCT' | 'GTM'
export type HypothesisCategory = 'customer' | 'product' | 'market'

export interface AccountExample {
  name: string
  status: 'in' | 'out'
  reason: string
}

export interface SegmentData {
  id: string
  label: string
  shortLabel: string
  accent: string
  qualifyingQuestion: string
  messagingHook: string
  firmographics: string
  economicBuyer: string
  dailyUser: string
  incumbent: string
  wedge: string
  disqualifiers: string[]
  accountExamples: AccountExample[]
  channelConflictNote?: string
}

export interface MatrixRow {
  segment: string
  mc1: SegmentStatus
  mc2: SegmentStatus
  caseManagement: SegmentStatus
  leadMotion: string
  segmentHref?: string
}

export interface Hypothesis {
  id: string
  category: HypothesisCategory
  statement: string
  quantSignal: string
  qualSignal: string
  howToTest: string
  riskIfWrong: string
  status: HypothesisStatus
}

export interface TamCard {
  label: string
  segment: string
  current: string
  projected: string
  projectedYear: string
  cagr: string
  source: string
  sourceYear: string
  accent: string
}

export interface OpenQuestion {
  id: string
  question: string
  audience: AudienceTag
  status: QuestionStatus
  decision?: string
}

// ─── Segments ────────────────────────────────────────────────────────────────

export const SEGMENTS: SegmentData[] = [
  {
    id: 'mc1',
    label: 'MC-1 — Direct Enterprise SOC',
    shortLabel: 'MC-1',
    accent: '#2563EB',
    qualifyingQuestion: '"Is your security operations center staffed by your own employees — or by a contracted monitoring service?"',
    messagingHook: '"Give your security operations center one view of every site — only the signals that matter, ready to act on in seconds."',
    firmographics: 'Large enterprise, 5,000+ employees, multi-site. Verticals: casinos (in-house surveillance mandated by gaming regulators), corporate campuses with a GSOC, hospital systems with a 24/7 security command center, universities with sworn campus police, critical infrastructure.',
    economicBuyer: 'VP/Director of Corporate Security · Chief Security Officer · Director of Global Security Operations · Casino: VP of Surveillance · Hospital: Director of Public Safety. Budget line: security operations / operational risk opex — not IT.',
    dailyUser: 'SOC operator, surveillance analyst, dispatcher, shift supervisor. Monitors a live console for a full shift; triages alarms; coordinates field response. The buyer and user are different people — sell ROI up, sell usability down. Win the operator pilot or the renewal dies.',
    incumbent: 'Genetec Mission Control / Security Center, Milestone XProtect',
    wedge: 'Genetec and Milestone are video-only. EEN/Brivo natively correlates video + access control + AI events — an incident assembles itself from multiple signal types instead of being manually stitched across three systems. For customers already on EEN + Brivo access, there is no integration project.',
    disqualifiers: [
      'Console operated by a contracted service (they are MC-2)',
      'Single-site or small multi-site',
      'Primary need is post-incident footage review',
      'Alarm fatigue already solved by Genetec/Milestone',
    ],
    accountExamples: [
      { name: 'Audemars Piguet (EMEA)', status: 'out', reason: 'IONODES operates their console — IONODES is MC-2' },
      { name: 'Waterton', status: 'out', reason: 'Multifamily/CRE, no live console — Case Management only' },
      { name: 'Exclusive Wireless', status: 'out', reason: 'Chain of custody need, not live response — Case Management only' },
      { name: 'Hypothetical: MGM Resorts', status: 'in', reason: 'Casinos employ in-house surveillance by regulatory requirement' },
      { name: 'Hypothetical: Regional hospital network', status: 'in', reason: '24/7 staffed security command center, high-consequence incidents' },
      { name: 'Hypothetical: University campus police', status: 'in', reason: 'Sworn officers, own dispatch, own command infrastructure' },
    ],
  },
  {
    id: 'mc2',
    label: 'MC-2 — Monitoring Service Provider',
    shortLabel: 'MC-2',
    accent: '#0D9488',
    qualifyingQuestion: '"Do your operators monitor multiple client accounts simultaneously from a single console — and sell that monitoring as a recurring managed service?"',
    messagingHook: '"The operating platform for modern remote monitoring — one console, every client, only what needs action."',
    firmographics: 'Central stations, remote video monitoring companies, virtual guard services, private security firms with a monitoring division. Any size — regional (300 sites) to national (thousands of operator seats). Examples: IONODES, Stealth Monitoring, Pro-Vigil, Netwatch, COPS Monitoring, Securitas Technology, Allied Universal Virtual Security.',
    economicBuyer: 'VP of Operations · Director of Monitoring Services · Owner (smaller providers). Budget line: platform / operations infrastructure — they build their business revenue on top of this software. Cares about: operator throughput (accounts per operator), SLA compliance, alarm fatigue reduction, multi-tenant account management, white-label options.',
    dailyUser: 'Monitoring operator / central station agent. Watches a queue of events across dozens of client accounts simultaneously; triages, escalates, dispatches. Rejects if: designed for single-tenant and awkwardly adapted, multi-account switching is slow, no SLA tooling.',
    incumbent: 'Immix (Motorola Solutions), SureView Ops, Bold Manitou, Sentinel',
    wedge: 'Existing platforms manage video alarms in isolation. EEN/Brivo natively adds access control events and AI-correlated signals — a door forced open + motion on camera + badge tailgate becomes one correlated event, not three separate alarms. Fewer false dispatches, faster containment, better SLAs. No incumbent does this natively.',
    disqualifiers: [
      'Already invested heavily in Immix/Bold with deep workflow integration',
      'Too small for a platform migration project',
      'Fixed-fee-per-site economics where operator efficiency does not hit margin',
    ],
    accountExamples: [
      { name: 'IONODES (EMEA)', status: 'in', reason: 'Monitoring provider for Audemars Piguet — they are the operator, AP is their client' },
      { name: 'Hypothetical: Regional central station, 300 accounts', status: 'in', reason: 'Classic archetype — operators are the daily user, clients never touch the platform' },
      { name: 'Hypothetical: National virtual guard service', status: 'in', reason: 'Per-seat licensing across hundreds of operator seats — highest-leverage channel motion' },
    ],
    channelConflictNote: '⚠ Channel conflict risk: MC-2 providers build their business on the same enterprise accounts MC-1 targets directly. A deal-registration-style policy is required — do not sell MC-1 direct into accounts actively monitored by an MC-2 partner.',
  },
  {
    id: 'case-management',
    label: 'Case Management',
    shortLabel: 'Cases',
    accent: '#7C3AED',
    qualifyingQuestion: '"Does your organization run investigations as a recurring, owned function — multiple cases per month with a named investigator or LP/risk team?"',
    messagingHook: '"Turn an incident into a defensible case in days, not weeks — evidence, timeline, and chain of custody assembled automatically from your cameras and access control, ready for whoever asks."',
    firmographics: 'SMB through enterprise. No SOC required. Verticals: retail LP (any size — high investigation volume), multifamily/CRE (the core Brivo base), healthcare (regulatory reporting), education (Title IX, student conduct), logistics, cannabis, financial services. Qualifying characteristic: recurring, owned investigation function with a named owner — not ad hoc a few times per year.',
    economicBuyer: 'VP/Director of Loss Prevention · General Counsel / Legal Operations · Director of Corporate Investigations · HR / Employee Relations · Risk Management / Compliance · CRE: Property Operations / Risk Management. Budget line: legal / risk / compliance — a different wallet than security operations.',
    dailyUser: 'Investigator, LP analyst, case manager. Works cases episodically and deeply — bursty, not continuous. Loves it if: evidence assembles with chain of custody intact, exports are defensible, replaces the Exclusive Wireless pattern (6-week manual process → days). Rejects if: timestamps untrustworthy or workflow is more effort than spreadsheet-and-folders.',
    incumbent: 'Resolver, Case IQ (formerly i-Sight), Omnigo, Ontic, Axon Evidence, ServiceNow SecOps',
    wedge: 'Every incumbent requires the investigator to manually pull video, export clips, log timestamps, and stitch evidence from multiple systems. EEN/Brivo natively holds video, access events, and AI-correlated signals — the case assembles itself. Chain of custody is unbroken from event to export. Cryptographic file signatures provide stronger admissibility than burned-in timestamps (Federal Rule 901).',
    disqualifiers: [
      'Handles incidents ad hoc — a few times per year with no named owner (use the VMS export feature, not the app)',
      'Single-site SMB with no compliance, HR, or insurance exposure',
      'Primary need is live alerting (that is Mission Control)',
    ],
    accountExamples: [
      { name: 'Exclusive Wireless', status: 'in', reason: 'Archetypal: legal needs 6 months of admissible video, current export takes 6–7 weeks' },
      { name: 'Waterton', status: 'in', reason: 'Multifamily/CRE disputes, liability claims, ownership documentation — reactive but recurring' },
      { name: 'Audemars Piguet', status: 'in', reason: 'When a monitored incident needs a formal case for insurance or legal — CM attach to MC-2' },
      { name: 'Hypothetical: Mid-market retailer with LP team', status: 'in', reason: 'Weekly shrink and ORC case-building, slip-and-fall defense' },
      { name: 'Hypothetical: University Title IX office', status: 'in', reason: 'Recurring regulatory documentation with a named investigator function' },
      { name: 'Hypothetical: Single-location boutique', status: 'out', reason: 'No named consumer of the record, no recurring investigation function' },
    ],
  },
]

// ─── Targeting Matrix ────────────────────────────────────────────────────────

export const MATRIX_ROWS: MatrixRow[] = [
  { segment: 'Enterprise w/ in-house SOC (casino, GSOC, campus PD)', mc1: 'in', mc2: 'out', caseManagement: 'conditional', leadMotion: 'MC-1 direct → CM attach', segmentHref: '#mc1' },
  { segment: 'Monitoring service provider (central station, virtual guard)', mc1: 'out', mc2: 'in', caseManagement: 'conditional', leadMotion: 'MC-2 platform play', segmentHref: '#mc2' },
  { segment: 'Retail / QSR with live, staffed LP monitoring center', mc1: 'in', mc2: 'out', caseManagement: 'in', leadMotion: 'MC-1 first → CM attach' },
  { segment: 'Healthcare system (own security command center)', mc1: 'in', mc2: 'out', caseManagement: 'in', leadMotion: 'MC-1 first → CM for compliance' },
  { segment: 'Retail / QSR LP team, no live monitoring center', mc1: 'out', mc2: 'out', caseManagement: 'in', leadMotion: 'CM only', segmentHref: '#case-management' },
  { segment: 'Multifamily / CRE (Waterton profile)', mc1: 'out', mc2: 'out', caseManagement: 'in', leadMotion: 'CM only', segmentHref: '#case-management' },
  { segment: 'SMB / multi-site, recurring investigation function', mc1: 'out', mc2: 'out', caseManagement: 'in', leadMotion: 'CM only', segmentHref: '#case-management' },
  { segment: 'SMB / single-site, no investigation function', mc1: 'out', mc2: 'out', caseManagement: 'out', leadMotion: 'VMS export feature only' },
  { segment: 'Shopping mall / contracted guard services', mc1: 'out', mc2: 'out', caseManagement: 'in', leadMotion: 'CM only', segmentHref: '#case-management' },
]

// ─── Hypotheses ──────────────────────────────────────────────────────────────

export const HYPOTHESES: Hypothesis[] = [
  // Customer hypotheses
  {
    id: 'c1',
    category: 'customer',
    statement: 'Enterprise GSOC operators spend ≥90 seconds manually correlating across separate video, access control, and analytics consoles per incident — and name it their #1 operational friction.',
    quantSignal: 'In observed incident handling, operators touch ≥3 separate systems per incident and spend ≥90s reconstructing "what happened where, in what order" before acting. Confirmed at ≥60% of GSOCs observed. Refuted if median <45s or <30% touch 3+ systems.',
    qualSignal: 'Operators describe a named workaround unprompted — a second monitor permanently on the access log, a habit of calling the access admin during an event. We hear "I have to alt-tab to the door system." Refuted if: "Genetec already shows me that."',
    howToTest: 'Five contextual-inquiry sessions in live or recorded SOC environments (start with a friendly casino or university PD in the EEN base). Stopwatch the swivel-chair time. Show a unified incident timeline wireframe after observation. Cost: ~2 weeks + travel.',
    riskIfWrong: 'If correlation is already adequately solved by Genetec/Milestone, MC-1 is a feature war against entrenched incumbents. The "incidents assemble themselves" pitch lands as "nice but I already have this" and the differentiator collapses.',
    status: 'testing',
  },
  {
    id: 'c2',
    category: 'customer',
    statement: 'Central station operators report ≥60% of presented alarms are non-actionable, and median triage time is >45 seconds per alarm — making false-positive reduction the primary cost lever for MC-2 gross margin.',
    quantSignal: '≥60% of alarms marked non-actionable in disposition logs. Median triage time >45s per alarm. A correlation layer suppressing ≥40% of nuisance alarms is worth a named dollar figure per seat. Refuted if false-positive rate already <25% or if economics are flat-fee-per-site.',
    qualSignal: 'Station managers talk about "alarm flooding," operators muting cameras during storms, the night-shift queue backing up, SLA penalties for slow verification. They can name their cost-per-monitored-site. Refuted if: "alarm volume is fine, analytics filter it upstream."',
    howToTest: 'Interview 4–6 central station operations managers (IONODES warm intro first). Ask for one week of anonymized alarm-disposition logs from one station. Compute real false-positive rate and minutes burned. This is a data pull, not an opinion — the highest-leverage test in the document.',
    riskIfWrong: 'MC-2 is the segment with clearest per-seat monetization and the cleanest channel. If false-positive reduction is not the value, or if station economics do not reward it, the entire MC-2 ROI story collapses and we are left selling "better UI" into a margin-thin business.',
    status: 'testing',
  },
  {
    id: 'c3',
    category: 'customer',
    statement: 'Retail LP, multifamily/CRE, and healthcare-compliance teams already run a repeatable investigation workflow today — using spreadsheets and shared drives — without calling it "case management."',
    quantSignal: '≥70% of interviewed LP/CRE/compliance teams maintain a structured incident log outside their VMS. Assembling one evidence package takes >2 hours of analyst time today. Refuted if teams are fully ad hoc with no recurring log, or if assembly already takes <30 min via existing VMS export.',
    qualSignal: 'They show you the spreadsheet. There is a column for case number, date, site, "video pulled Y/N." They describe the panic of a subpoena arriving 4 months after an incident. The Exclusive Wireless pattern recurs in a different costume. Refuted: "we just pull the clip when someone asks."',
    howToTest: '5–6 interviews across LP, multifamily, and healthcare compliance in the EEN base. Ask them to walk through their last three investigations and screen-share the actual artifacts. No build required. ~2 weeks.',
    riskIfWrong: 'If investigations are genuinely ad hoc and infrequent, Case Management has no recurring-use anchor and degrades into "fancy clip export" — a feature, not a licensable app. The recurring-owned-function premise is what justifies a per-seat subscription over a one-time export utility.',
    status: 'testing',
  },
  {
    id: 'c4',
    category: 'customer',
    statement: 'Case Management\'s core buyer has no real-time monitoring function and no desire to build one — meaning Case Management must stand alone, not be positioned as "Mission Control\'s quieter sibling."',
    quantSignal: '≥75% of Case Management prospects have no 24/7 monitoring seat and no plan to add one in 12 months. When shown a real-time incident dashboard, <20% rate it "valuable to me." Refuted if a majority express interest in real-time, which would argue for bundling rather than separate licensing.',
    qualSignal: '"I find out about incidents the next morning / when a tenant complains." They flinch at anything that looks like it requires staffing. They value retention, search, redaction, and export — not live wall-boards. Refuted: they keep asking about live alerting.',
    howToTest: 'Bolt this onto the C3 interviews — one extra question block showing an MC concept and gauging pull. Near-zero marginal cost.',
    riskIfWrong: 'If they DO want real-time, we have mis-segmented and should design a converging product — separate licensing creates artificial walls and buyer confusion. If the standalone investigation need is not strong enough, Case Management cannot survive without an MC attach, killing it as an independent revenue line.',
    status: 'testing',
  },
  // Product hypotheses
  {
    id: 'p1',
    category: 'product',
    statement: 'An incident or case that pre-assembles itself — pulling correlated video + badge event + AI detection onto one timeline automatically — produces a ≥5x improvement in time-to-context over manual stitching, and users perceive the difference in the first session.',
    quantSignal: 'Time from trigger to "operator understands what happened" drops from ≥90s (manual baseline) to <15s auto-assembled. In a head-to-head task test, ≥80% of users complete the "reconstruct this incident" task faster with auto-assembly. Refuted if improvement is <2x or if users re-verify everything manually anyway.',
    qualSignal: 'First-session "oh, it already pulled the door badge and the camera together" reaction. Users stop building their own timeline. Refuted: "I still need to check the access log myself to be sure it got the right person."',
    howToTest: 'Wizard-of-Oz prototype. Hand-correlate 10 real multi-signal incidents from a willing customer\'s data, present them as "auto-assembled" in a clickable timeline, and run a timed task test against their current tool. Fakes the correlation engine entirely — tests value before building the hard part. ~3–4 weeks.',
    riskIfWrong: 'Auto-assembly IS the differentiator — it is the reason this is a platform play and not a VMS skin. If it does not produce a felt step-change, both apps revert to competing on UI polish and price against Genetec/Immix/Verkada where we have no durable moat.',
    status: 'testing',
  },
  {
    id: 'p2',
    category: 'product',
    statement: 'Users will tolerate missed correlations (lower recall) far more than confidently wrong correlations (lower precision) — and a single wrong link drops willingness-to-rely by >50%.',
    quantSignal: 'Correlation precision must exceed ~95% on signals surfaced as high-confidence; recall can be lower. A deliberately-wrong correlation in testing drops "would you act on this without re-verifying?" by >50% vs. a clean session. Refuted if users are unbothered by occasional wrong links.',
    qualSignal: '"If it gets the wrong person once, I\'ll never trust the timeline again." Legal/compliance buyers especially fixate on defensibility. Refuted: "just show me everything that might be related, I\'ll sort it out."',
    howToTest: 'Within the P1 Wizard-of-Oz, deliberately seed 1–2 wrong correlations in some sessions and measure trust delta vs. clean sessions. Also test the confidence-flagging UI pattern. Cheap to add to the P1 test.',
    riskIfWrong: 'This shapes the entire engineering approach to the correlation engine. A wrong link in a Case Management evidence package is a legal liability — a defense attorney\'s gift. Getting precision/recall and the confidence-UI wrong does not just hurt UX; it can make the product inadmissible for its highest-value use case.',
    status: 'testing',
  },
  {
    id: 'p3',
    category: 'product',
    statement: 'Chain of custody is a hard purchase gate for Case Management\'s legal/compliance buyers, and our cryptographic file signatures are a genuine differentiator over "export an MP4 from the VMS."',
    quantSignal: '≥70% of legal/compliance/LP buyers rate "defensible chain of custody" as must-have (not nice-to-have). When shown the cryptographic-signature + full audit-trail export, ≥50% say it changes their evaluation vs. a plain export. Refuted if buyers treat a basic timestamped MP4 as sufficient.',
    qualSignal: 'They ask about admissibility, redaction, who-accessed-what logs, and retention-vs-litigation-hold conflicts unprompted. The Exclusive Wireless legal-team posture repeats. Refuted: chain of custody never comes up unless we raise it.',
    howToTest: '3–4 interviews with legal/risk/compliance buyers + one external review by a prosecutor or forensic-video expert on whether our signature approach clears their admissibility bar. Validate the legal claim before marketing it. ~3 weeks.',
    riskIfWrong: 'If chain of custody is not a real purchase gate, we have over-invested in a compliance moat. Worse: if our cryptographic claim is overstated and does not hold up in court, marketing it is a reputational and legal exposure.',
    status: 'testing',
  },
  {
    id: 'p4',
    category: 'product',
    statement: 'Camera-agnostic, access-agnostic correlation wins in brownfield accounts where ≥50% have ≥2 camera brands and a separately-vendored access control system.',
    quantSignal: '≥50% of target accounts in EEN telemetry have ≥2 camera brands and a separately-vendored access panel. Among those, openness ranks in the top-2 purchase criteria. Refuted if most accounts are single-vendor/greenfield, or if openness ranks below price/UI.',
    qualSignal: '"We have 6 camera brands across 40 sites and we\'re not replacing them." / "Our access control is Lenel, video is mixed, nothing talks to each other." The Exclusive Wireless mixed-fleet pattern. Refuted: "we standardized on one vendor years ago."',
    howToTest: 'Pull hardware-heterogeneity stats from the existing EEN install base (telemetry query — camera brand distribution per account). Then 3–4 interviews confirming openness is decisive vs. nice. The quantitative half is nearly free.',
    riskIfWrong: 'Camera-agnostic openness is the core EEN/Brivo platform thesis. If it is not a decisive buying factor, closed-stack competitors\' tighter integration wins, and our openness becomes a cost (integration burden, support surface) without a commensurate revenue advantage.',
    status: 'testing',
  },
  // Market hypotheses
  {
    id: 'm1',
    category: 'market',
    statement: 'Selling Mission Control to monitoring service providers (MC-2) reaches more end-sites faster than direct MC-1 enterprise sales — each station multiplies reach by 100x+ — making MC-2 the efficient land motion.',
    quantSignal: 'Average central station monitors ≥500 sites; one MC-2 logo = 100x+ the site reach of one MC-1 logo. MC-2 sales cycle to first revenue <6 months vs. MC-1\'s 9–18 month enterprise cycle. Refuted if switching cost from Immix exceeds value for most stations.',
    qualSignal: 'Stations express willingness to run a new platform on a subset of sites as a trial. They see operator-efficiency gains as competitively necessary. Refuted: "we\'d never change platforms mid-contract, Immix is sticky and our operators are trained on it."',
    howToTest: 'Commercial conversations with 3–4 central stations (IONODES warm intro first) on willingness-to-pilot and switching friction. Map one station\'s site count and contract structure. Validate channel math before committing GTM resources. ~4 weeks.',
    riskIfWrong: 'If central stations won\'t switch, MC-2 is not the scale engine — and GTM must lead with slower, capital-intensive MC-1 enterprise direct. That changes hiring (enterprise AEs vs. channel managers), burn rate, and time-to-traction by at least 12 months.',
    status: 'testing',
  },
  {
    id: 'm2',
    category: 'market',
    statement: 'The market is at a timing inflection: buyers are crossing from accepting bespoke PSIM integration projects (six-figure custom work) to expecting native correlation as a platform feature — and Verkada/Rhombus have primed demand.',
    quantSignal: '≥40% of target buyers have scoped a video+access integration project in the last 24 months (active demand), AND express frustration with PSIM cost/complexity (old model failing). Refuted if <15% have scoped anything (too early) or if most already have a working solution (too late).',
    qualSignal: '"We looked at a PSIM but it was $200K and 9 months." Active, frustrated, unmet demand. Refuted: blank stares ("why would I want those connected?") or "we already did this two years ago."',
    howToTest: 'Win/loss-style and discovery interviews probing past integration attempts. Scan Genetec/Verkada competitive positioning and recent PSIM-replacement RFPs. Light desk research + interview coding. ~2–3 weeks.',
    riskIfWrong: 'Timing kills more products than quality. Too early: we evangelize a category that won\'t pay yet. Too late: we are a me-too entrant fighting on price. Mis-reading timing means the investment thesis is either premature or stale — neither recoverable by execution.',
    status: 'testing',
  },
  {
    id: 'm3',
    category: 'market',
    statement: 'Two separately-licensable apps on one platform lets us sell to different buyers and land-and-expand within one account — without confusing customers or creating reseller channel conflict.',
    quantSignal: '≥30% of accounts buying one app evaluate the second within 12 months. <10% of sales conversations stall on "why are these separate?" confusion. Resellers can articulate the two-app split correctly ≥80% of the time in a positioning test. Refuted if buyers expect both for one price, or resellers muddle the pitch.',
    qualSignal: 'Buyers self-select cleanly ("I\'m the LP guy, I want Case Management"). Resellers welcome two SKUs as two revenue events. Refuted: "this is confusing, just sell me the security thing."',
    howToTest: 'Positioning/pricing test — present the two-app structure to 6–8 prospects and 3–4 resellers, measure comprehension and self-selection. Test packaging before it enters contracts and reseller agreements. ~2–3 weeks.',
    riskIfWrong: 'Wrong packaging is hard to unwind once it is in contracts, quotes, and reseller agreements. A wrong call creates years of pricing debt and channel friction — the exact problem seen in the Waterton reseller-visibility mess.',
    status: 'testing',
  },
]

// ─── TAM Cards ───────────────────────────────────────────────────────────────

export const TAM_CARDS: TamCard[] = [
  {
    label: 'VSaaS Platform',
    segment: 'Cloud video surveillance-as-a-service',
    current: '$5.1B',
    projected: '$10.7B',
    projectedYear: '2029',
    cagr: '16.1%',
    source: 'MarketsandMarkets',
    sourceYear: '2025',
    accent: '#172130',
  },
  {
    label: 'Remote Video Monitoring',
    segment: 'MC-2 market — managed monitoring services',
    current: '$3.2B',
    projected: '$11.9B',
    projectedYear: '2034',
    cagr: '15.8%',
    source: 'MarketIntelo',
    sourceYear: '2026',
    accent: '#0D9488',
  },
  {
    label: 'PSIM / Security Ops Software',
    segment: 'MC-1 market — enterprise SOC platforms',
    current: '$3.5B',
    projected: '$4.3B',
    projectedYear: '2029',
    cagr: '4.6%',
    source: 'MarketsandMarkets',
    sourceYear: '2024',
    accent: '#2563EB',
  },
  {
    label: 'Case Management Software',
    segment: 'Investigations, LP, risk, compliance',
    current: '$7.3B',
    projected: '$15.0B',
    projectedYear: '2030',
    cagr: '11.2%',
    source: 'Grand View Research',
    sourceYear: '2024',
    accent: '#7C3AED',
  },
]

// ─── Open Questions ───────────────────────────────────────────────────────────

export const OPEN_QUESTIONS: OpenQuestion[] = [
  {
    id: 'q1',
    question: 'What percentage of the EEN/Brivo base directly employs security staff vs. contracts out to a monitoring service? This is the TAM ceiling for MC-1 and determines whether MC-2 is the primary growth engine.',
    audience: 'PRODUCT',
    status: 'open',
  },
  {
    id: 'q2',
    question: 'Is Mission Control built as one multi-tenant-capable product from v1 (MC-1 = single-tenant config), or single-tenant first with multi-tenancy retrofitted later? Retrofitting requires rebuilding the data model. This must be decided before scoping begins.',
    audience: 'ENG',
    status: 'open',
  },
  {
    id: 'q3',
    question: 'What is the channel conflict policy for MC-1 vs. MC-2 accounts? Without a deal-registration-style rule ("we do not sell MC-1 direct into accounts actively monitored by an MC-2 partner"), the monitoring-provider channel will not trust EEN as a platform vendor.',
    audience: 'GTM',
    status: 'open',
  },
  {
    id: 'q4',
    question: 'What does the Incident → Case handoff look like commercially? When an MC-1 customer promotes an incident to a case but does not license Case Management — what do they see? A read-only stub? An upsell prompt? This is a product + pricing decision, not just a UI decision.',
    audience: 'PRODUCT',
    status: 'open',
  },
]
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "C:\Program Files\Claude\project-agora-v3"
npm run build
```

Expected: Build succeeds. If TypeScript errors appear in `lib/icp/data.ts`, fix them before proceeding.

- [ ] **Step 4: Commit**

```bash
git add components/Sidebar.tsx lib/icp/data.ts
git commit -m "feat(icp): add nav item and typed ICP data constants"
```

---

## Task 2: Page scaffold + Hero section

**Files:**
- Create: `app/who-we-serve/page.tsx`

**Interfaces:**
- Consumes: nothing yet (Hero is inline JSX)
- Produces: `/who-we-serve` route renders a light-themed page with the Hero section

- [ ] **Step 1: Create the page file**

Create `app/who-we-serve/page.tsx`:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Who We Serve — Project Agora V3',
  description: 'ICP definitions for Mission Control and Case Management',
}

export default function WhoWeServePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <WhoWeServeHero />
    </div>
  )
}

function WhoWeServeHero() {
  return (
    <section
      className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-12"
      style={{
        background: 'linear-gradient(160deg, #FFFFFF 0%, #F8FAFC 45%, #EFF6FF 100%)',
      }}
    >
      <div className="relative mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
          Project Agora V3 · ICP Definitions
        </p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.5rem,6vw,3.75rem)] font-extrabold leading-[1.05] tracking-tight text-[#111827]">
          Who We Serve
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#6B7280]">
          The shared definition of our customer — who Mission Control and Case
          Management are built for, who buys them, and who uses them daily. One
          document for Engineering, Sales, Product, and Customer Success.
        </p>

        {/* Three audience-tagged product cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:mt-12">
          {[
            {
              accent: '#2563EB',
              iconBg: '#EFF6FF',
              icon: 'corporate_fare',
              label: 'MC-1',
              title: 'Direct Enterprise SOC',
              subtitle: 'In-house operators · Own console · Direct sale',
            },
            {
              accent: '#0D9488',
              iconBg: '#F0FDFA',
              icon: 'monitor_heart',
              label: 'MC-2',
              title: 'Monitoring Service Provider',
              subtitle: 'Central stations · Multi-tenant · Channel sale',
            },
            {
              accent: '#7C3AED',
              iconBg: '#F5F3FF',
              icon: 'manage_search',
              label: 'Case Management',
              title: 'Post-incident Investigation',
              subtitle: 'LP · Legal · Compliance · No SOC required',
            },
          ].map((card) => (
            <div
              key={card.label}
              className="flex flex-col rounded-lg bg-white p-5"
              style={{
                borderLeft: `4px solid ${card.accent}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: card.iconBg, color: card.accent }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  {card.icon}
                </span>
              </div>
              <p
                className="mt-3 text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{ color: card.accent }}
              >
                {card.label}
              </p>
              <h3 className="mt-1 text-base font-bold text-[#111827]">{card.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#6B7280]">{card.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Last reviewed stamp */}
        <p className="mt-8 text-xs text-[#9CA3AF]">
          Last reviewed: June 24, 2026 · Next review: Q3 2026
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify build and visual check**

```bash
npm run build
npm run dev
```

Open `http://localhost:3000/who-we-serve`. Verify:
- Page loads with the light gradient hero
- Nav bar shows "Who We Serve" with the `groups` icon
- Three product cards render with correct accent colors (blue / teal / purple)
- "Last reviewed" stamp is visible at the bottom of the hero

- [ ] **Step 3: Commit**

```bash
git add app/who-we-serve/page.tsx
git commit -m "feat(icp): scaffold who-we-serve page with hero section"
```

---

## Task 3: QualifyingFilter component

**Files:**
- Create: `components/icp/QualifyingFilter.tsx`
- Modify: `app/who-we-serve/page.tsx` (add import + render below Hero)

**Interfaces:**
- Consumes: nothing (self-contained static)
- Produces: `<QualifyingFilter />` — 3-branch decision tree, anchor id `#filter`

- [ ] **Step 1: Create QualifyingFilter.tsx**

Create `components/icp/QualifyingFilter.tsx`:

```typescript
export default function QualifyingFilter() {
  const branches = [
    {
      answer: 'Your own employees operate the console',
      result: 'MC-1 Direct Enterprise',
      accent: '#2563EB',
      iconBg: '#EFF6FF',
      icon: 'corporate_fare',
      href: '#mc1',
    },
    {
      answer: 'A monitoring service you contract operates it',
      result: 'MC-2 Service Provider',
      accent: '#0D9488',
      iconBg: '#F0FDFA',
      icon: 'monitor_heart',
      href: '#mc2',
    },
    {
      answer: 'Nobody watches live — review happens after the fact',
      result: 'Case Management',
      accent: '#7C3AED',
      iconBg: '#F5F3FF',
      icon: 'manage_search',
      href: '#case-management',
    },
  ]

  return (
    <section id="filter" className="bg-[#EFF6FF] px-4 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
          The Master Filter
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          Who operates the live monitoring console?
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          This single question segments every account. Answer it before anything else.
        </p>

        {/* Decision tree */}
        <div className="mt-10 flex flex-col items-center gap-0">
          {/* Root node */}
          <div className="rounded-xl border border-[#BFDBFE] bg-white px-6 py-4 text-center shadow-sm">
            <span className="material-symbols-outlined text-[#2563EB]" style={{ fontSize: 28 }}>
              help
            </span>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              Who staffs and operates the live monitoring console?
            </p>
          </div>

          {/* Connector line */}
          <div className="h-6 w-0.5 bg-[#BFDBFE]" />

          {/* Branch row */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            {branches.map((branch, i) => (
              <div key={i} className="flex flex-col items-center gap-0">
                {/* Answer label */}
                <div
                  className="w-full rounded-t-lg px-4 py-2 text-center text-xs font-medium text-white"
                  style={{ backgroundColor: branch.accent }}
                >
                  {branch.answer}
                </div>
                {/* Connector */}
                <div className="h-4 w-0.5" style={{ backgroundColor: branch.accent }} />
                {/* Result card */}
                <a
                  href={branch.href}
                  className="group flex w-full flex-col items-center gap-2 rounded-b-lg rounded-t-none border-2 bg-white px-4 py-4 text-center transition-shadow hover:shadow-md"
                  style={{ borderColor: branch.accent }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: branch.iconBg, color: branch.accent }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                      {branch.icon}
                    </span>
                  </div>
                  <p className="text-sm font-bold" style={{ color: branch.accent }}>
                    {branch.result}
                  </p>
                  <p className="text-xs text-[#6B7280] underline-offset-2 group-hover:underline">
                    See full ICP →
                  </p>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to page.tsx**

In `app/who-we-serve/page.tsx`, add the import and render it after `<WhoWeServeHero />`:

```typescript
import QualifyingFilter from '@/components/icp/QualifyingFilter'

// Inside WhoWeServePage():
<div className="min-h-screen bg-[#F8FAFC]">
  <WhoWeServeHero />
  <QualifyingFilter />
</div>
```

- [ ] **Step 3: Build and visual check**

```bash
npm run build && npm run dev
```

Verify at `http://localhost:3000/who-we-serve`:
- Blue tinted section appears below hero
- Three branch cards render with correct colors
- Each card links to the correct anchor (`#mc1`, `#mc2`, `#case-management`)
- On mobile (375px), cards stack vertically

- [ ] **Step 4: Commit**

```bash
git add components/icp/QualifyingFilter.tsx app/who-we-serve/page.tsx
git commit -m "feat(icp): add qualifying filter decision tree"
```

---

## Task 4: TargetingMatrix component

**Files:**
- Create: `components/icp/TargetingMatrix.tsx`
- Modify: `app/who-we-serve/page.tsx`

**Interfaces:**
- Consumes: `MATRIX_ROWS` from `@/lib/icp/data`
- Produces: `<TargetingMatrix />` — table on desktop, stacked cards on mobile, anchor id `#matrix`

- [ ] **Step 1: Create TargetingMatrix.tsx**

Create `components/icp/TargetingMatrix.tsx`:

```typescript
import { MATRIX_ROWS, type SegmentStatus } from '@/lib/icp/data'

const STATUS_CONFIG: Record<SegmentStatus, { label: string; color: string; bg: string; symbol: string }> = {
  in:          { label: 'In',          color: '#15803D', bg: '#F0FDF4', symbol: '●' },
  out:         { label: 'Out',         color: '#6B7280', bg: '#F9FAFB', symbol: '○' },
  conditional: { label: 'Conditional', color: '#92400E', bg: '#FFFBEB', symbol: '◐' },
}

function StatusCell({ status }: { status: SegmentStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span aria-hidden>{cfg.symbol}</span>
      {cfg.label}
    </span>
  )
}

export default function TargetingMatrix() {
  return (
    <section id="matrix" className="px-4 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
          Targeting Matrix
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          Account fit at a glance
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Use this to qualify accounts in under 10 seconds. Click any row to jump to the full ICP definition.
        </p>

        {/* Desktop table */}
        <div className="mt-8 hidden overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white shadow-sm sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                  Segment
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#2563EB]">
                  MC-1 Direct
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#0D9488' }}>
                  MC-2 Channel
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#7C3AED]">
                  Case Mgmt
                </th>
                <th className="border-l border-[#E5E7EB] px-4 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                  Lead Motion
                </th>
              </tr>
            </thead>
            <tbody>
              {MATRIX_ROWS.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[#F3F4F6] last:border-0 hover:bg-[#F8FAFC]"
                >
                  <td className="px-4 py-3 font-medium text-[#111827]">
                    {row.segmentHref ? (
                      <a href={row.segmentHref} className="hover:text-[#2563EB] hover:underline">
                        {row.segment}
                      </a>
                    ) : (
                      row.segment
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusCell status={row.mc1} /></td>
                  <td className="px-4 py-3"><StatusCell status={row.mc2} /></td>
                  <td className="px-4 py-3"><StatusCell status={row.caseManagement} /></td>
                  <td className="border-l border-[#F3F4F6] px-4 py-3 text-[#6B7280]">{row.leadMotion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div className="mt-6 flex flex-col gap-3 sm:hidden">
          {MATRIX_ROWS.map((row, i) => (
            <div key={i} className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-[#111827]">{row.segment}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#2563EB]">MC-1</p>
                  <StatusCell status={row.mc1} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#0D9488' }}>MC-2</p>
                  <StatusCell status={row.mc2} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">Cases</p>
                  <StatusCell status={row.caseManagement} />
                </div>
              </div>
              <p className="mt-3 text-xs text-[#6B7280]">{row.leadMotion}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {(Object.entries(STATUS_CONFIG) as [SegmentStatus, typeof STATUS_CONFIG[SegmentStatus]][]).map(([, cfg]) => (
            <span key={cfg.label} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <span className="font-bold" style={{ color: cfg.color }}>{cfg.symbol}</span>
              {cfg.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to page.tsx**

```typescript
import TargetingMatrix from '@/components/icp/TargetingMatrix'

// In WhoWeServePage render order:
<WhoWeServeHero />
<QualifyingFilter />
<TargetingMatrix />
```

- [ ] **Step 3: Build and visual check**

```bash
npm run build && npm run dev
```

Verify:
- Table renders with all 9 rows
- Status cells show shape + color + label (not color alone)
- "Lead Motion" column has a left divider
- On mobile (375px DevTools), stacked cards appear and the table is hidden
- Row with `segmentHref` links to the correct anchor on click

- [ ] **Step 4: Commit**

```bash
git add components/icp/TargetingMatrix.tsx app/who-we-serve/page.tsx
git commit -m "feat(icp): add targeting matrix with mobile stacked cards"
```

---

## Task 5: StickySubNav component

**Files:**
- Create: `components/icp/StickySubNav.tsx`
- Modify: `app/who-we-serve/page.tsx`

**Interfaces:**
- Consumes: nothing (hardcoded anchor list)
- Produces: `<StickySubNav />` — sticky bar with 8 anchor links, scroll-spy highlights active section

- [ ] **Step 1: Create StickySubNav.tsx**

Create `components/icp/StickySubNav.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'

const NAV_LINKS = [
  { label: 'Filter', href: '#filter' },
  { label: 'Matrix', href: '#matrix' },
  { label: 'MC-1', href: '#mc1' },
  { label: 'MC-2', href: '#mc2' },
  { label: 'Cases', href: '#case-management' },
  { label: 'Hypotheses', href: '#hypotheses' },
  { label: 'Market', href: '#market' },
  { label: 'Questions', href: '#questions' },
]

const SECTION_IDS = NAV_LINKS.map((l) => l.href.replace('#', ''))

export default function StickySubNav() {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <nav
      className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm"
      aria-label="Page sections"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-12">
        {NAV_LINKS.map((link) => {
          const isActive = activeId === link.href.replace('#', '')
          return (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
              style={
                isActive
                  ? { backgroundColor: '#EFF6FF', color: '#2563EB' }
                  : { color: '#6B7280' }
              }
            >
              {link.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Add to page.tsx — place it after the Hero, before QualifyingFilter**

```typescript
import StickySubNav from '@/components/icp/StickySubNav'

// In WhoWeServePage render order:
<WhoWeServeHero />
<StickySubNav />
<QualifyingFilter />
<TargetingMatrix />
```

- [ ] **Step 3: Build and visual check**

```bash
npm run build && npm run dev
```

Verify:
- Sticky nav bar appears when you scroll past the hero
- Active link highlights in blue as you scroll through sections
- On mobile, the nav scrolls horizontally when links overflow
- `npm run build` passes with zero TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add components/icp/StickySubNav.tsx app/who-we-serve/page.tsx
git commit -m "feat(icp): add sticky sub-nav with scroll-spy"
```

---

## Task 6: SegmentCard component

**Files:**
- Create: `components/icp/SegmentCard.tsx`
- Modify: `app/who-we-serve/page.tsx`

**Interfaces:**
- Consumes: `SegmentData` from `@/lib/icp/data`, `SEGMENTS` array
- Produces: `<SegmentCard segment={...} />` — three instances for MC-1, MC-2, Case Mgmt

- [ ] **Step 1: Create SegmentCard.tsx**

Create `components/icp/SegmentCard.tsx`:

```typescript
import type { SegmentData } from '@/lib/icp/data'

interface Props {
  segment: SegmentData
  sectionBg?: string
}

function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
      {children}
    </p>
  )
}

function Callout({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: `${accent}12`, borderLeft: `3px solid ${accent}` }}
    >
      {children}
    </div>
  )
}

export default function SegmentCard({ segment, sectionBg = '#FFFFFF' }: Props) {
  const accentStyle = { color: segment.accent }

  return (
    <section
      id={segment.id}
      className="px-4 py-14 sm:px-6 lg:px-12"
      style={{ backgroundColor: sectionBg }}
    >
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <p className="text-[11px] font-bold uppercase tracking-[0.22em]" style={accentStyle}>
          {segment.shortLabel}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          {segment.label}
        </h2>

        {/* Card */}
        <div
          className="mt-8 rounded-xl bg-white"
          style={{
            borderLeft: `4px solid ${segment.accent}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div className="p-6 sm:p-8">
            {/* Tier 1 — Qualifying question */}
            <Callout accent={segment.accent}>
              <MicroLabel>Qualifying Question</MicroLabel>
              <p className="mt-2 text-base font-semibold leading-snug text-[#111827]">
                {segment.qualifyingQuestion}
              </p>
            </Callout>

            {/* Tier 2 — 2-col profile grid */}
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <MicroLabel>Firmographics</MicroLabel>
                <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">
                  {segment.firmographics}
                </p>
              </div>
              <div>
                <MicroLabel>Economic Buyer</MicroLabel>
                <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">
                  {segment.economicBuyer}
                </p>
              </div>
              <div>
                <MicroLabel>Daily User / Champion</MicroLabel>
                <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">
                  {segment.dailyUser}
                </p>
              </div>
              <div>
                <MicroLabel>Incumbent + Our Wedge</MicroLabel>
                <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">
                  <span className="font-semibold text-[#111827]">{segment.incumbent}</span>
                  {' — '}
                  {segment.wedge}
                </p>
              </div>
            </div>

            {/* Channel conflict callout (MC-2 only) */}
            {segment.channelConflictNote && (
              <div className="mt-6 rounded-lg border border-[#FCD34D] bg-[#FFFBEB] p-4">
                <p className="text-sm leading-relaxed text-[#92400E]">
                  {segment.channelConflictNote}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="my-6 border-t border-[#F3F4F6]" />

            {/* Tier 3 — Disqualifiers */}
            <div>
              <MicroLabel>⊘ Disqualifiers</MicroLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {segment.disqualifiers.map((d, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1 text-xs text-[#6B7280]"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Tier 1 — Messaging hook */}
            <div className="mt-6">
              <Callout accent={segment.accent}>
                <MicroLabel>Messaging Hook</MicroLabel>
                <p className="mt-2 text-base font-semibold italic leading-snug text-[#111827]">
                  {segment.messagingHook}
                </p>
              </Callout>
            </div>

            {/* Tier 3 — Account examples */}
            <div className="mt-6">
              <MicroLabel>Named Account Examples</MicroLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {segment.accountExamples.map((ex, i) => (
                  <span
                    key={i}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={
                      ex.status === 'in'
                        ? { backgroundColor: '#F0FDF4', color: '#15803D' }
                        : { backgroundColor: '#F9FAFB', color: '#6B7280' }
                    }
                    title={ex.reason}
                  >
                    {ex.status === 'in' ? '● ' : '○ '}
                    {ex.name}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-[#9CA3AF]">
                Hover each account for the reason. ● In-ICP · ○ Out-of-ICP
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add three segment instances to page.tsx**

```typescript
import SegmentCard from '@/components/icp/SegmentCard'
import { SEGMENTS } from '@/lib/icp/data'

// In WhoWeServePage render order, after TargetingMatrix:
<SegmentCard segment={SEGMENTS[0]} />                          {/* MC-1, white bg */}
<SegmentCard segment={SEGMENTS[1]} sectionBg="#F8FAFC" />     {/* MC-2, light gray */}
<SegmentCard segment={SEGMENTS[2]} />                          {/* Case Mgmt, white */}
```

- [ ] **Step 3: Build and visual check**

```bash
npm run build && npm run dev
```

Verify for each of the three segment cards:
- Anchor id works (`#mc1`, `#mc2`, `#case-management`) — clicking the filter decision tree links scrolls to the correct card
- Qualifying question and messaging hook appear in the tinted callout (accent color at low opacity)
- 2-col grid renders the four profile fields
- MC-2 card shows the amber channel-conflict callout
- Disqualifiers render as inline chips
- Account examples show `●` green for in-ICP, `○` gray for out-of-ICP
- On mobile the 2-col grid stacks to single column

- [ ] **Step 4: Commit**

```bash
git add components/icp/SegmentCard.tsx app/who-we-serve/page.tsx
git commit -m "feat(icp): add segment cards for MC-1, MC-2, and Case Management"
```

---

## Task 7: HypothesisCard component + Hypotheses section

**Files:**
- Create: `components/icp/HypothesisCard.tsx`
- Modify: `app/who-we-serve/page.tsx`

**Interfaces:**
- Consumes: `Hypothesis`, `HypothesisCategory`, `HYPOTHESES` from `@/lib/icp/data`
- Produces: `<HypothesisCard hypothesis={...} />` — 11 instances grouped by category, section anchor `#hypotheses`

- [ ] **Step 1: Create HypothesisCard.tsx**

Create `components/icp/HypothesisCard.tsx`:

```typescript
import type { Hypothesis, HypothesisStatus } from '@/lib/icp/data'

const STATUS_STYLE: Record<HypothesisStatus, { label: string; bg: string; color: string }> = {
  testing:     { label: 'Testing',     bg: '#FFFBEB', color: '#92400E' },
  validated:   { label: 'Validated',   bg: '#F0FDF4', color: '#15803D' },
  invalidated: { label: 'Invalidated', bg: '#F9FAFB', color: '#6B7280' },
}

export default function HypothesisCard({ hypothesis }: { hypothesis: Hypothesis }) {
  const statusCfg = STATUS_STYLE[hypothesis.status]

  return (
    <div
      className="rounded-xl bg-white"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
    >
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
            Hypothesis {hypothesis.id.toUpperCase()}
          </p>
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Statement */}
        <p className="mt-3 text-base font-bold leading-snug text-[#111827] sm:text-lg">
          {hypothesis.statement}
        </p>

        {/* 2×2 evidence grid */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-[#F8FAFC] p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
              <span className="material-symbols-outlined text-[#2563EB]" style={{ fontSize: 14 }}>bar_chart</span>
              Quantitative Signal
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">{hypothesis.quantSignal}</p>
          </div>
          <div className="rounded-lg bg-[#F8FAFC] p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
              <span className="material-symbols-outlined text-[#7C3AED]" style={{ fontSize: 14 }}>chat</span>
              Qualitative Signal
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">{hypothesis.qualSignal}</p>
          </div>
          <div className="rounded-lg bg-[#F8FAFC] p-3 sm:col-span-2">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280]">
              <span className="material-symbols-outlined text-[#0D9488]" style={{ fontSize: 14 }}>science</span>
              How to Test
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#374151]">{hypothesis.howToTest}</p>
          </div>
        </div>

        {/* Risk if wrong — amber callout */}
        <div className="mt-4 rounded-lg border-l-4 border-[#F59E0B] bg-[#FFFBEB] p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#92400E]">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>
            Risk if Wrong
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#92400E]">{hypothesis.riskIfWrong}</p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add Hypotheses section to page.tsx**

```typescript
import HypothesisCard from '@/components/icp/HypothesisCard'
import { HYPOTHESES } from '@/lib/icp/data'

// Add after the three SegmentCards. Inline section in page.tsx:
```

Add this function to `app/who-we-serve/page.tsx` (above the default export):

```typescript
function HypothesesSection() {
  const categories: { key: 'customer' | 'product' | 'market'; label: string; description: string }[] = [
    { key: 'customer', label: 'Customer Hypotheses', description: 'Who they are, what they need, what their current process looks like' },
    { key: 'product',  label: 'Product Hypotheses',  description: 'What the product must do to win, what differentiates it, what "good" looks like' },
    { key: 'market',   label: 'Market Hypotheses',   description: 'Size, growth, timing, and channel' },
  ]

  return (
    <section id="hypotheses" className="bg-[#F8FAFC] px-4 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
          Product Bets
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          Hypotheses
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Falsifiable bets that must hold for this strategy to work. Each shows the quantitative and qualitative
          signals that would confirm or refute it, and what breaks if we are wrong.
        </p>

        <div className="mt-10 space-y-12">
          {categories.map((cat) => (
            <div key={cat.key}>
              <h3 className="text-lg font-bold text-[#111827]">{cat.label}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">{cat.description}</p>
              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {HYPOTHESES.filter((h) => h.category === cat.key).map((h) => (
                  <HypothesisCard key={h.id} hypothesis={h} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

Then add `<HypothesesSection />` to the `WhoWeServePage` render after the three segment cards.

- [ ] **Step 3: Build and visual check**

```bash
npm run build && npm run dev
```

Verify:
- Three category groups appear (Customer × 4, Product × 4, Market × 3) — 11 cards total
- Each card shows the statement as a large bold headline
- Quant/qual/how-to-test grid renders
- "Risk if Wrong" amber callout renders and is visually distinct
- Status pill shows "Testing" in amber for all 11 cards
- 2-col grid on desktop, single col on mobile

- [ ] **Step 4: Commit**

```bash
git add components/icp/HypothesisCard.tsx app/who-we-serve/page.tsx
git commit -m "feat(icp): add hypothesis cards with quant/qual/risk layout"
```

---

## Task 8: TamCards + OpenQuestions components

**Files:**
- Create: `components/icp/TamCards.tsx`
- Create: `components/icp/OpenQuestions.tsx`
- Modify: `app/who-we-serve/page.tsx`

**Interfaces:**
- Consumes: `TAM_CARDS`, `OPEN_QUESTIONS` from `@/lib/icp/data`
- Produces: `<TamCards />` (anchor `#market`) and `<OpenQuestions />` (anchor `#questions`)

- [ ] **Step 1: Create TamCards.tsx**

Create `components/icp/TamCards.tsx`:

```typescript
import { TAM_CARDS } from '@/lib/icp/data'

export default function TamCards() {
  return (
    <section id="market" className="px-4 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
          Market Opportunity
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          Total Addressable Market
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Market size context for each segment. All figures from third-party analyst research.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TAM_CARDS.map((card) => (
            <div
              key={card.label}
              className="rounded-xl bg-white p-6"
              style={{
                borderTop: `4px solid ${card.accent}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: card.accent }}
              >
                {card.label}
              </p>
              <p className="mt-1 text-xs text-[#6B7280]">{card.segment}</p>

              <p className="mt-4 text-3xl font-extrabold text-[#111827]">{card.current}</p>
              <p className="text-xs text-[#6B7280]">today</p>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: `${card.accent}15`, color: card.accent }}
                >
                  {card.cagr} CAGR
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-[#111827]">
                {card.projected}{' '}
                <span className="text-xs font-normal text-[#6B7280]">by {card.projectedYear}</span>
              </p>

              <p className="mt-4 text-[10px] text-[#9CA3AF]">
                {card.source} · {card.sourceYear}
              </p>
            </div>
          ))}
        </div>

        {/* EEN/Brivo context */}
        <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4">
          <p className="text-xs text-[#6B7280]">
            <span className="font-semibold text-[#111827]">EEN/Brivo context:</span> ~$179M estimated ARR (2024 est., Latka/CBInsights).
            Verkada (primary competitor) at $357M ARR and $5.8B valuation (Dec 2025). Full video surveillance market (hardware + software + services): $33.8B (Memoori, Q3 2025).
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create OpenQuestions.tsx**

Create `components/icp/OpenQuestions.tsx`:

```typescript
import { OPEN_QUESTIONS, type AudienceTag, type QuestionStatus } from '@/lib/icp/data'

const AUDIENCE_STYLE: Record<AudienceTag, { bg: string; color: string }> = {
  ENG:     { bg: '#EFF6FF', color: '#1D4ED8' },
  SALES:   { bg: '#F0FDF4', color: '#15803D' },
  PRODUCT: { bg: '#F5F3FF', color: '#6D28D9' },
  GTM:     { bg: '#FFF7ED', color: '#C2410C' },
}

const STATUS_STYLE: Record<QuestionStatus, { label: string; bg: string; color: string }> = {
  open:    { label: 'Open',    bg: '#FFFBEB', color: '#92400E' },
  decided: { label: 'Decided', bg: '#F0FDF4', color: '#15803D' },
}

export default function OpenQuestions() {
  return (
    <section id="questions" className="bg-[#F8FAFC] px-4 py-14 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563EB]">
          Before We Build
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#111827] sm:text-3xl">
          Open Strategic Questions
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          These must be resolved before locking ICP sizing or product scope.
          Each is tagged to the team who owns the answer.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {OPEN_QUESTIONS.map((q) => {
            const audStyle = AUDIENCE_STYLE[q.audience]
            const statStyle = STATUS_STYLE[q.status]
            return (
              <div
                key={q.id}
                className="flex gap-4 rounded-xl bg-white p-5"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              >
                <div className="flex flex-col items-center gap-2 pt-0.5">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: audStyle.bg, color: audStyle.color }}
                  >
                    {q.audience}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: statStyle.bg, color: statStyle.color }}
                  >
                    {statStyle.label}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-[#111827]">{q.question}</p>
                  {q.decision && (
                    <p className="mt-2 text-xs text-[#22C55E]">
                      ✓ {q.decision}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add both to page.tsx**

```typescript
import TamCards from '@/components/icp/TamCards'
import OpenQuestions from '@/components/icp/OpenQuestions'

// Final render order in WhoWeServePage:
<WhoWeServeHero />
<StickySubNav />
<QualifyingFilter />
<TargetingMatrix />
<SegmentCard segment={SEGMENTS[0]} />
<SegmentCard segment={SEGMENTS[1]} sectionBg="#F8FAFC" />
<SegmentCard segment={SEGMENTS[2]} />
<HypothesesSection />
<TamCards />
<OpenQuestions />
```

- [ ] **Step 4: Final build and full visual walkthrough**

```bash
npm run build && npm run dev
```

Walk through the full page at `http://localhost:3000/who-we-serve`:

1. **Hero** — light gradient, three product cards, "Last reviewed" stamp visible
2. **Sticky sub-nav** — appears on scroll, all 8 links visible, active link highlights as you scroll
3. **Qualifying filter** — three branch cards link to correct segment anchors
4. **Targeting matrix** — all 9 rows, In/Out/Conditional cells use shape+color+label, mobile stacks to cards
5. **MC-1 card** — qualifying question and messaging hook in tinted blue callout, 2-col grid, disqualifier chips, account examples
6. **MC-2 card** — same structure, amber channel-conflict callout present
7. **Case Management card** — purple accent throughout
8. **Hypotheses** — 11 cards in three groups, amber "Risk if Wrong" callouts on every card
9. **TAM cards** — four stat cards with CAGR badges and source attribution
10. **Open questions** — four questions with audience pills and "Open" status badges
11. **"Who We Serve" nav item** in sidebar highlights when on this route

- [ ] **Step 5: Final commit**

```bash
git add components/icp/TamCards.tsx components/icp/OpenQuestions.tsx app/who-we-serve/page.tsx
git commit -m "feat(icp): add TAM cards and open questions; complete who-we-serve page"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Nav item added to Sidebar
- ✅ Hero with last-reviewed stamp
- ✅ Qualifying filter decision tree (3 branches, correct colors)
- ✅ Targeting matrix (9 rows, In/Out/Conditional encoded 3 ways, mobile stacked cards)
- ✅ Sticky sub-nav with scroll-spy (8 anchor links)
- ✅ SegmentCard for MC-1, MC-2, Case Mgmt (all 8 fields, 3 tiers, MC-2 channel conflict callout)
- ✅ HypothesisCard (all 11 hypotheses, quant/qual/test/risk layout, status pill)
- ✅ TamCards (4 cards with CAGR, source, EEN/Brivo context bar)
- ✅ OpenQuestions (4 questions, audience pills, status)
- ✅ Light theme throughout, no dark mode, no accordions, no audience toggles

**Placeholder scan:** No TBDs, no TODOs. All data content is written out in full in `lib/icp/data.ts`.

**Type consistency:**
- `SegmentData.id` used as HTML anchor id (Task 6) and linked from `MATRIX_ROWS.segmentHref` (Task 4) — values match: `mc1`, `mc2`, `case-management`
- `HypothesisCategory` values `'customer' | 'product' | 'market'` match the filter in `HypothesesSection`
- `AudienceTag`, `QuestionStatus`, `HypothesisStatus` are all referenced from `lib/icp/data` — no re-declaration
