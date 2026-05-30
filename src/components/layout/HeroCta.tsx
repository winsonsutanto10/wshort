'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

export function HeroCta() {
  const { isSignedIn, isLoaded, user } = useUser()

  if (!isLoaded) return <div className="h-12" />

  if (isSignedIn) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="text-sm text-gray-500">
          Welcome back, {user?.firstName ?? 'there'}!
        </p>
        <Link
          href="/dashboard"
          className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-8 flex justify-center gap-3">
      <Link
        href="/sign-up"
        className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Start for free
      </Link>
      <Link
        href="/sign-in"
        className="rounded-md border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        Sign in
      </Link>
    </div>
  )
}
