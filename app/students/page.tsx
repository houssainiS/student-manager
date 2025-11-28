"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-hooks"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getStudents, getClasses, deleteStudent } from "./actions"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Empty } from "@/components/ui/empty"

interface Student {
  id: string
  full_name: string
  email: string
  class: string
  phone: string
  created_at: string
}

export default function StudentsPage() {
  const { currentUser } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [classes, setClasses] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const data = await getStudents(search || undefined, classFilter || undefined, sortBy)
        setStudents(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load students",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search, classFilter, sortBy, toast])

  // Load classes
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const classList = await getClasses()
        setClasses(classList)
      } catch (error) {
        console.error("Failed to load classes")
      }
    }
    loadClasses()
  }, [])

  // const isAdmin = currentUser?.user_metadata?.role === "admin"
    const isAdmin = true;

  const handleDelete = async (id: string) => {
    setDeleteLoading(true)
    try {
      await deleteStudent(id)
      setStudents(students.filter((s) => s.id !== id))
      toast({
        title: "Success",
        description: "Student deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setDeleteId(null)
    }
  }

  return (
    <AuthGuard>
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-foreground">Students</h1>
              {isAdmin && (
                <Link href="/students/new">
                  <Button>Add Student</Button>
                </Link>
              )}
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search & Filter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search">Search by name</Label>
                    <Input
                      id="search"
                      placeholder="Enter student name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="class">Filter by class</Label>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger id="class">
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls} value={cls}>
                            {cls}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sort">Sort by</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="name-asc">Name A-Z</SelectItem>
                        <SelectItem value="name-desc">Name Z-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : students.length === 0 ? (
              <Empty
                icon="Users"
                title="No students found"
                description={
                  search || classFilter ? "Try adjusting your search or filter" : "No students have been added yet"
                }
              />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.full_name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.class}</TableCell>
                            <TableCell>{student.phone}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Link href={`/students/${student.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                              {isAdmin && (
                                <>
                                  <Link href={`/students/${student.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                      Edit
                                    </Button>
                                  </Link>
                                  <Button variant="destructive" size="sm" onClick={() => setDeleteId(student.id)}>
                                    Delete
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Student</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this student? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && handleDelete(deleteId)}
                disabled={deleteLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  )
}
