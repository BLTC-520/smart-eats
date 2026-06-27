'use client'

import { useState } from 'react'

interface TagInputProps {
  label: string
  hint?: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

export function TagInput({ label, hint, values, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function add(): void {
    const tag = draft.trim()
    if (tag.length === 0 || values.includes(tag)) {
      setDraft('')
      return
    }
    onChange([...values, tag])
    setDraft('')
  }

  function remove(tag: string): void {
    onChange(values.filter((value) => value !== tag))
  }

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-200">{label}</span>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className="min-h-11 flex-1 rounded-xl bg-white/10 px-3 text-base text-white placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={add}
          className="min-h-11 rounded-xl bg-white/15 px-4 text-sm font-medium text-white"
        >
          加入
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {values.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => remove(tag)}
              className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200"
            >
              {tag} ✕
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
