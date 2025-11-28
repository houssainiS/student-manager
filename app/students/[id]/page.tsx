"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getStudent } from "../actions"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-hooks"

interface Student {
  id: string
  full_name: string
  email: string
  class: string
  phone: string
  created_at: string
}

export default function StudentDetailsPage() {
  const params = useParams()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const data = await getStudent(params.id as string)
        setStudent(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load student",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadStudent()
  }, [params.id, toast])

  if (loading) {
    return (

        <div className="flex flex-col min-h-screen bg-background">
          <Navbar />
          <div className="flex items-center justify-center flex-1">
            <Spinner />
          </div>
        </div>

    )
  }

  if (!student) {
    return (

        <div className="flex flex-col min-h-screen bg-background">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
            <p className="text-red-500">Student not found</p>
          </main>
        </div>

    )
  }

  const isAdmin = true;

  return (
 
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{student.full_name}</h1>
                <p className="text-muted-foreground mt-2">Student Details</p>
              </div>
              {isAdmin && (
                <Link href={`/students/${student.id}/edit`}>
                  <Button>Edit</Button>
                </Link>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="text-lg font-medium">{student.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-lg font-medium">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class</p>
                    <p className="text-lg font-medium">{student.class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-lg font-medium">{student.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/students">
              <Button variant="outline">Back to Students</Button>
            </Link>
          </div>
        </main>
      </div>

  )
}
