'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/auth/actions'
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleReset(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await resetPassword(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
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
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Reset password</h1>
          <p className="text-[var(--color-text-subtle)] text-sm mb-8">
            Enter your email and we'll send you a secure link to reset your password.
          </p>

          {success ? (
            <div className="text-center">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-4 rounded-xl mb-6">
                Check your email for the reset link!
              </div>
              <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-medium inline-flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          ) : (
            <form action={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                  Email
                </label>
                <input 
                  name="email"
                  type="email" 
                  required 
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="you@example.com"
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
                {loading ? "Sending link..." : "Send reset link"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 text-center">
              <Link href="/login" className="text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-text)] font-medium inline-flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
