"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-hooks"

export default function Home() {
  const { currentUser, loading } = useAuth()

  return (
    <main className="flex-1 w-full">
      <section className="bg-gradient-to-b from-primary/5 to-transparent py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">Student Management System</h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance">
            Efficiently manage student records, profiles, and information in one centralized platform.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            {!loading && currentUser ? (
              <Link href="/students">
                <Button size="lg">Go to Students</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
