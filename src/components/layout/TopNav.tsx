import { UserButton } from '@clerk/nextjs'

export function TopNav() {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-end px-6">
      <UserButton />
    </header>
  )
}
