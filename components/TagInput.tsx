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
      <div className="mb-2 flex items-baseline justify-between">
        <span className="tracking-luxe text-[0.62rem] uppercase text-taupe">{label}</span>
        {hint && <span className="text-xs text-taupe/70">{hint}</span>}
      </div>
      <div className="flex items-end gap-3 border-b border-cream/15 pb-1 focus-within:border-gold">
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
          className="min-h-10 flex-1 bg-transparent text-base text-cream placeholder:text-taupe/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="min-h-10 text-sm text-gold underline decoration-gold/40 underline-offset-4"
        >
          加入
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => remove(tag)}
              className="rounded-full border border-gold/30 px-3 py-1 text-xs text-cream/90 hover:border-gold"
            >
              {tag} <span className="text-taupe">✕</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
