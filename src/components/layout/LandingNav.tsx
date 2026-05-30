'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'

export function LandingNav() {
  const { isSignedIn, isLoaded, user } = useUser()

  return (
    <nav className="border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-900">
          <Image src="/logo.png" alt="Wshort" width={24} height={24} className="rounded" />
          Wshort
        </div>
        <div className="flex items-center gap-3">
          {isLoaded && isSignedIn ? (
            <>
              <span className="text-sm text-gray-500">
                Welcome, {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ?? 'there'}
              </span>
              <Link
                href="/dashboard"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
