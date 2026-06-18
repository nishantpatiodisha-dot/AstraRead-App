'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/auth/actions'
import { Brain, ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleUpdate(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await updatePassword(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl bg-emerald-500/10">
              <Brain size={28} className="text-emerald-500" />
            </div>
            <span className="text-3xl font-serif text-[var(--color-text)] tracking-tight">
              AstraRead
            </span>
          </div>
        </div>

        <div className="bg-[var(--color-bg-sidebar)] border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Create new password</h1>
          <p className="text-[var(--color-text-subtle)] text-sm mb-8">
            Please enter your new password below.
          </p>

          <form action={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                New Password
              </label>
              <input 
                name="password"
                type="password" 
                required 
                minLength={6}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[var(--color-text)] text-[var(--color-bg)] font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update password"}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
