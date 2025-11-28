"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export type AuthUser = User & {
  user_metadata: User["user_metadata"] & {
    role?: "admin" | "user"
  }
}

// Cache session globally to avoid multiple requests
let cachedSession: AuthUser | null = null
let sessionPromise: Promise<void> | null = null

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(cachedSession)
  const [loading, setLoading] = useState(!cachedSession)
  const router = useRouter()
  const client = supabase

  useEffect(() => {
    let isMounted = true

    if (!sessionPromise) {
      // Only create promise once
      sessionPromise = (async () => {
        const { data: { session }, error } = await client.auth.getSession()
        if (error) console.error("Error fetching session:", error.message)
        if (isMounted && session?.user) {
          cachedSession = session.user as AuthUser
          setCurrentUser(session.user as AuthUser)
        }
        if (isMounted) setLoading(false)
      })()
    } else {
      // If promise exists, wait for it
      sessionPromise.then(() => {
        if (isMounted) {
          setCurrentUser(cachedSession)
          setLoading(false)
        }
      })
    }

    // Subscribe to auth changes
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      cachedSession = session?.user as AuthUser || null
      if (isMounted) setCurrentUser(cachedSession)
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [client])

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await client.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.session?.user) {
        cachedSession = data.session.user as AuthUser
        setCurrentUser(cachedSession)
      }
      router.push("/students")
    },
    [client, router]
  )

  const register = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
            || (typeof window !== "undefined" ? window.location.origin : "")
        },
      })
      if (error) throw error
      return { message: "Check your email to confirm registration" }
    },
    [client]
  )

  const logout = useCallback(async () => {
    const { error } = await client.auth.signOut()
    if (error) throw error
    cachedSession = null
    setCurrentUser(null)
    router.push("/")
  }, [client, router])

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
          || `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
      })
      if (error) throw error
      return { message: "Check your email for password reset instructions" }
    },
    [client]
  )

  return { currentUser, loading, login, logout, register, resetPassword }
}
