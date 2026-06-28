import Link from 'next/link'
import { PreferencesForm } from '@/components/PreferencesForm'

export default function PreferencesPage() {
  return (
    <main className="safe-px safe-pt safe-pb mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden">
      <header className="flex items-center justify-between py-3">
        <span className="wiggle inline-block text-3xl text-ink">口味设定 ⚙️</span>
        <Link href="/" className="text-xl text-ink-soft transition-colors hover:text-ink">
          ← 回去
        </Link>
      </header>
      <div className="mt-7 flex-1 pb-4">
        <PreferencesForm />
      </div>
    </main>
  )
}
