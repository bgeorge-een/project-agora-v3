'use client'

import { useState } from 'react'

export type OverrideReason =
  | 'wrong_severity'
  | 'false_positive'
  | 'escalating_further'
  | 'handling_differently'
  | 'other'

interface OverrideOption {
  value: OverrideReason
  label: string
}

const OPTIONS: OverrideOption[] = [
  { value: 'wrong_severity', label: 'Wrong severity' },
  { value: 'false_positive', label: 'False positive' },
  { value: 'escalating_further', label: 'Escalating further' },
  { value: 'handling_differently', label: 'Handling differently' },
  { value: 'other', label: 'Other' },
]

interface OverrideModalProps {
  alertTitle: string
  onCancel: () => void
  onSubmit: (reason: OverrideReason, notes: string) => void
}

export default function OverrideModal({
  alertTitle,
  onCancel,
  onSubmit,
}: OverrideModalProps) {
  const [reason, setReason] = useState<OverrideReason>('wrong_severity')
  const [notes, setNotes] = useState('')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(17, 24, 39, 0.55)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[#2D3748] bg-[#1A1F2E] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white">Override Reason</h3>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Overriding AI recommendation for{' '}
          <span className="font-semibold text-[#CBD5E0]">{alertTitle}</span>
        </p>

        <div className="mt-4 space-y-2">
          {OPTIONS.map((opt) => {
            const selected = reason === opt.value
            return (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  selected
                    ? 'border-[#2563EB] bg-[#243048]'
                    : 'border-[#374151] hover:border-[#4B5563]'
                }`}
              >
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor: selected ? '#2563EB' : '#4B5563',
                  }}
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
                  )}
                </span>
                <input
                  type="radio"
                  name="override-reason"
                  className="sr-only"
                  checked={selected}
                  onChange={() => setReason(opt.value)}
                />
                <span
                  className={
                    selected
                      ? 'font-medium text-white'
                      : 'text-[#CBD5E0]'
                  }
                >
                  {opt.label}
                </span>
              </label>
            )
          })}
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add context for this override (optional)…"
            className="w-full resize-none rounded-lg border border-[#374151] bg-[#0F1117] px-3 py-2 text-sm text-white outline-none placeholder:text-[#6B7280] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-[#374151] px-4 py-2 text-sm font-medium text-[#CBD5E0] transition-colors hover:bg-[#1F2937]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason, notes)}
            className="rounded-lg bg-[#D97706] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B45309]"
          >
            Submit Override
          </button>
        </div>
      </div>
    </div>
  )
}
