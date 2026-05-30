import { redirect } from 'next/navigation'
import { isAdminAuth } from '@/lib/admin/auth'
import { AdminPanel } from '@/components/admin/AdminPanel'

export default async function AdminPanelPage() {
  if (!(await isAdminAuth())) redirect('/admin')

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel />
    </div>
  )
}
