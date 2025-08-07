"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import Link from "next/link"
import { database } from "@/lib/database"
import { type Student, type Batch } from "@/lib/supabase"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    parent_mobile: "",
    address: "",
    batch_id: "",
    total_fees: "0",
    fees_paid: "0"
  })

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [studentsData, batchesData] = await Promise.all([
        database.getStudents(),
        database.getBatches()
      ])
      setStudents(studentsData)
      setBatches(batchesData)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const studentData = {
        ...formData,
        total_fees: parseFloat(formData.total_fees),
        fees_paid: parseFloat(formData.fees_paid),
      }

      if (editingStudent) {
        await database.updateStudent(editingStudent.id, studentData)
      } else {
        await database.addStudent({
          ...studentData,
          enrollment_date: new Date().toISOString().split('T')[0]
        })
      }
      
      // Refresh data
      await loadData()
      resetForm()
      alert(editingStudent ? 'Student updated successfully!' : 'Student added successfully!')
    } catch (error) {
      console.error('Error saving student:', error)
      alert('Error saving student. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      mobile: "",
      parent_mobile: "",
      address: "",
      batch_id: "",
      total_fees: "0",
      fees_paid: "0"
    })
    setEditingStudent(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      parent_mobile: student.parent_mobile,
      address: student.address,
      batch_id: student.batch_id || "",
      total_fees: student.total_fees.toString(),
      fees_paid: student.fees_paid.toString()
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await database.deleteStudent(id)
        await loadData()
        alert('Student deleted successfully!')
      } catch (error) {
        console.error('Error deleting student:', error)
        alert('Error deleting student. Please try again.')
      }
    }
  }

  const getBatchName = (batchId: string | null) => {
    if (!batchId) return "No Batch"
    return batches.find(batch => batch.id === batchId)?.name || "Unknown Batch"
  }

  const getFeeStatusBadge = (feesDue: number) => {
    if (feesDue <= 0) {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-500">Paid</Badge>
    } else {
      return <Badge variant="destructive">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
                <p className="text-gray-600">LINKCODE - Add and manage student information</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingStudent(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
                  <DialogDescription>
                    {editingStudent ? "Update student information" : "Enter student details to add them to a batch"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="parent_mobile">Parent's Mobile</Label>
                      <Input
                        id="parent_mobile"
                        value={formData.parent_mobile}
                        onChange={(e) => setFormData({...formData, parent_mobile: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="batch">Batch</Label>
                      <Select value={formData.batch_id} onValueChange={(value) => setFormData({...formData, batch_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {batches.map((batch) => (
                            <SelectItem key={batch.id} value={batch.id}>
                              {batch.name} (Capacity: {batch.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* New Fee Fields */}
                    <div className="grid gap-2">
                      <Label htmlFor="total_fees">Total Fees</Label>
                      <Input
                        id="total_fees"
                        type="number"
                        step="0.01"
                        value={formData.total_fees}
                        onChange={(e) => setFormData({...formData, total_fees: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fees_paid">Fees Paid</Label>
                      <Input
                        id="fees_paid"
                        type="number"
                        step="0.01"
                        value={formData.fees_paid}
                        onChange={(e) => setFormData({...formData, fees_paid: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingStudent ? "Update Student" : "Add Student"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Students List</CardTitle>
              <CardDescription>
                Total Students: {students.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Parent's Mobile</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Total Fees</TableHead>
                    <TableHead>Fees Paid</TableHead>
                    <TableHead>Fees Due</TableHead>
                    <TableHead>Fee Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.mobile}</TableCell>
                      <TableCell>{student.parent_mobile}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getBatchName(student.batch_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.enrollment_date}</TableCell>
                      <TableCell>₹{student.total_fees.toFixed(2)}</TableCell> {/* Updated */}
                      <TableCell>₹{student.fees_paid.toFixed(2)}</TableCell> {/* Updated */}
                      <TableCell>₹{student.fees_due.toFixed(2)}</TableCell> {/* Updated */}
                      <TableCell>{getFeeStatusBadge(student.fees_due)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
