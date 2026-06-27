'use client'

interface DecideButtonProps {
  loading: boolean
  disabled?: boolean
  onClick: () => void
  eyebrow?: string
  label?: string
}

export function DecideButton({
  loading,
  disabled = false,
  onClick,
  eyebrow = '夜 · KL',
  label = '决定',
}: DecideButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className="group relative grid aspect-square w-60 max-w-[72vw] place-items-center rounded-full
        bg-[radial-gradient(120%_120%_at_50%_30%,var(--color-ink-2),var(--color-ink))]
        transition-transform duration-300 active:scale-[0.97] disabled:active:scale-100"
    >
      {/* concentric candle-gold rings */}
      <span className="absolute inset-0 rounded-full border border-gold/40" />
      <span className="absolute inset-[10px] rounded-full border border-gold/15" />
      <span
        className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500
          [box-shadow:0_0_60px_-12px_var(--color-gold)] group-hover:opacity-60 group-active:opacity-80"
      />
      <span className={`flex flex-col items-center ${loading ? 'shimmer' : ''}`}>
        <span className="tracking-luxe text-[0.65rem] uppercase text-gold-soft">
          {loading ? '斟酌中' : eyebrow}
        </span>
        <span className="mt-1 font-serif text-5xl font-[900] text-cream">
          {loading ? '…' : label}
        </span>
      </span>
    </button>
  )
}
