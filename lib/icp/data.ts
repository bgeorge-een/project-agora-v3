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
