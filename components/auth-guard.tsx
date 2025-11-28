"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "user"
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { currentUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login")
    }
  }, [currentUser, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!currentUser) {
    return null
  }

  const userRole = currentUser.user_metadata?.role || "user"
  if (requiredRole && requiredRole !== userRole && userRole !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Access denied</p>
      </div>
    )
  }

  return <>{children}</>
}
