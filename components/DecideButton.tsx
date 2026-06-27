'use client'

interface DecideButtonProps {
  loading: boolean
  disabled?: boolean
  onClick: () => void
  label?: string
}

export function DecideButton({ loading, disabled = false, onClick, label = '吃这个！' }: DecideButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className="flex aspect-square w-56 max-w-[70vw] items-center justify-center rounded-full
        bg-gradient-to-b from-orange-400 to-orange-600 text-2xl font-bold text-white
        shadow-[0_20px_60px_-15px_rgba(249,115,22,0.7)] ring-8 ring-orange-500/15
        transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
    >
      {loading ? '帮你想…' : label}
    </button>
  )
}
