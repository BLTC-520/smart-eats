import Link from 'next/link'
import { PreferencesForm } from '@/components/PreferencesForm'

export default function PreferencesPage() {
  return (
    <main className="safe-px safe-pt safe-pb mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden">
      <header className="flex items-center justify-between py-3">
        <span className="font-display text-xl italic text-cream">口味</span>
        <Link
          href="/"
          className="tracking-luxe text-[0.62rem] uppercase text-taupe transition-colors hover:text-gold"
        >
          ← 回去
        </Link>
      </header>
      <div className="rule-gold" />
      <div className="mt-8 flex-1 pb-4">
        <PreferencesForm />
      </div>
    </main>
  )
}
