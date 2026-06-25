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
