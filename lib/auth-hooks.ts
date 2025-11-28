"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
// 🚨 CHANGE 1: Use the new singleton client from 'supabase'
import { supabase } from "./supabase" 
import type { User } from "@supabase/supabase-js"

// Extend Supabase User type to include optional admin/user role
export type AuthUser = User & {
  user_metadata: User["user_metadata"] & {
    role?: "admin" | "user"
  }
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 🚨 CHANGE 2: Use a local variable 'client' for the imported 'supabase' singleton
  const client = supabase

  useEffect(() => {
    const getUser = async () => {
      // Use 'client' to call the Supabase API
      const {
        data: { session },
        error,
      } = await client.auth.getSession()
      if (error) {
        console.error("Error fetching session:", error.message)
      }
      if (session?.user) {
        setCurrentUser(session.user as AuthUser)
      }
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setCurrentUser(session.user as AuthUser)
      } else {
        setCurrentUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [client]) // Depend on the singleton client

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      if (data.session?.user) {
        setCurrentUser(data.session.user as AuthUser)
      }
      router.push("/students")
    },
    [client, router],
  )

  const register = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            (typeof window !== "undefined" ? window.location.origin : ""),
        },
      })
      if (error) throw error
      // user_metadata is not set here; can be updated after confirmation
      return { message: "Check your email to confirm registration" }
    },
    [client],
  )

  const logout = useCallback(async () => {
    const { error } = await client.auth.signOut()
    if (error) throw error
    setCurrentUser(null)
    router.push("/")
  }, [client, router])

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
      })
      if (error) throw error
      return { message: "Check your email for password reset instructions" }
    },
    [client],
  )

  return { currentUser, loading, login, logout, register, resetPassword }
}