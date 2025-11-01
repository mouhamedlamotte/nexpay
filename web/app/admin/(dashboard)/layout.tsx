"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useProjectStore } from "@/stores/project.store"
import { useAppStore } from "@/stores/app.store"
import { useAuthStore } from "./stores/auth/auth-store"
import { ChangeDefaultPasswordDialog } from "@/features/users/components/change-default-password-dialog"

export default function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const currentProjectId = useProjectStore((state) => state.currentProject?.id)
  const { setLoadingPhase, setLoading } = useAppStore()
  const hasDefaultPassword = useAuthStore((state) => state.user?.hasDefaultPassword)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  useEffect(() => {
    if (isAuthenticated && currentProjectId) {
      setTimeout(() => {
        setLoadingPhase(null)
        setLoading(false)
      }, 1000)
    }
  }, [isAuthenticated, currentProjectId, setLoadingPhase, setLoading])

  useEffect(() => {
    if (isAuthenticated && currentProjectId && hasDefaultPassword) {
      setShowPasswordDialog(true)
    }
  }, [isAuthenticated, currentProjectId, hasDefaultPassword])

  const handlePasswordChangeSuccess = () => {
    setShowPasswordDialog(false)
    useAuthStore.getState().updateUser({ hasDefaultPassword: false })
  }

  if (!isAuthenticated || !currentProjectId) {
    return null
  }

  return (
    <>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AppHeader />
          {children}
        </div>
      </div>
      <ChangeDefaultPasswordDialog open={showPasswordDialog} onSuccess={handlePasswordChangeSuccess} />
    </>
  )
}
