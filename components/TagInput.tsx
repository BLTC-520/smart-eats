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
        <span className="text-2xl text-ink">{label}</span>
        {hint && <span className="text-base text-ink-soft/70">{hint}</span>}
      </div>
      <div className="flex items-stretch gap-2.5">
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
          className="sticker min-h-12 flex-1 px-4 text-lg text-ink placeholder:text-ink-soft/45 focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="btn-pop min-h-12 px-4 text-lg text-ink"
          style={{ background: 'var(--color-sky)' }}
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
              className="btn-pop px-3 py-1 text-base text-ink"
              style={{ background: 'var(--color-paper-2)' }}
            >
              {tag} <span className="text-tomato">✕</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
