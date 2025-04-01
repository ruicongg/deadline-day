import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  )
}

