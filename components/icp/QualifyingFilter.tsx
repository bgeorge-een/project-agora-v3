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
