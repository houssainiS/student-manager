"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getStudent, updateStudent } from "../../actions"
import { Spinner } from "@/components/ui/spinner"

interface Student {
  id: string
  full_name: string
  email: string
  class: string
  phone: string
}

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Student | null>(null)

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const data = await getStudent(params.id as string)
        setFormData(data)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev!,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setSaving(true)

    try {
      await updateStudent(formData.id, formData)
      toast({
        title: "Success",
        description: "Student updated successfully",
      })
      router.push(`/students/${formData.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update student",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

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

  if (!formData) {
    return (

        <div className="flex flex-col min-h-screen bg-background">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
            <p className="text-red-500">Student not found</p>
          </main>
        </div>

    )
  }

  return (

      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Edit Student</h1>
              <p className="text-muted-foreground mt-2">Update student information</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Input id="class" name="class" value={formData.class} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Link href={`/students/${formData.id}`}>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

  )
}
