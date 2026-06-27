import Link from 'next/link'
import { PreferencesForm } from '@/components/PreferencesForm'

export default function PreferencesPage() {
  return (
    <main className="safe-px safe-pt safe-pb mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between py-2">
        <h1 className="text-lg font-bold text-white">口味偏好</h1>
        <Link
          href="/"
          className="flex min-h-9 items-center rounded-full bg-white/10 px-3 text-sm text-slate-200"
        >
          ← 返回
        </Link>
      </header>
      <div className="mt-4 flex-1">
        <PreferencesForm />
      </div>
    </main>
  )
}
