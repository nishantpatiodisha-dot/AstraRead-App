'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup, signInWithGoogle } from '@/app/auth/actions'
import { Brain, ArrowRight, Chrome } from 'lucide-react'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      {/* Background ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
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
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Create an account</h1>
          <p className="text-[var(--color-text-subtle)] text-sm mb-8">
            Start your journey to CAT VARC mastery.
          </p>

          <form action={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Name
              </label>
              <input 
                name="name"
                type="text" 
                required 
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="Nishant"
              />
            </div>
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
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                Password
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
              {loading ? "Creating account..." : "Sign up"}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-subtle)] uppercase tracking-wider font-medium">Or</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <form action={signInWithGoogle} className="mt-6">
            <button 
              type="submit"
              className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] font-medium rounded-xl px-4 py-3 flex items-center justify-center gap-3 hover:bg-[var(--color-bg-subtle)] transition-colors"
            >
              <Chrome size={18} />
              Continue with Google
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--color-text-subtle)]">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-500 hover:text-emerald-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
