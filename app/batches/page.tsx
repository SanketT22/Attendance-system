"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, Users } from 'lucide-react'
import Link from "next/link"
import { database } from "@/lib/database"
import { type Batch, type BatchWithStudentCount } from "@/lib/supabase" // Import Supabase types

export default function BatchesPage() {
  const [batches, setBatches] = useState<BatchWithStudentCount[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    schedule: "",
    instructor: ""
  })

  // Load data on component mount
  useEffect(() => {
    loadBatches()
  }, [])

  const loadBatches = async () => {
    try {
      setLoading(true)
      const batchesData = await database.getBatchesWithStudentCount()
      setBatches(batchesData)
    } catch (error) {
      console.error('Error loading batches:', error)
      alert('Error loading batches. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const batchData = {
        name: formData.name,
        capacity: parseInt(formData.capacity),
        schedule: formData.schedule,
        instructor: formData.instructor
      }

      if (editingBatch) {
        await database.updateBatch(editingBatch.id, batchData)
      } else {
        await database.addBatch(batchData)
      }
      
      // Refresh data
      await loadBatches()
      resetForm()
      alert(editingBatch ? 'Batch updated successfully!' : 'Batch added successfully!')
    } catch (error) {
      console.error('Error saving batch:', error)
      alert('Error saving batch. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      capacity: "",
      schedule: "",
      instructor: ""
    })
    setEditingBatch(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch)
    setFormData({
      name: batch.name,
      capacity: batch.capacity.toString(),
      schedule: batch.schedule,
      instructor: batch.instructor
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this batch? This will also unassign students from this batch.")) {
      try {
        await database.deleteBatch(id)
        await loadBatches()
        alert('Batch deleted successfully!')
      } catch (error) {
        console.error('Error deleting batch:', error)
        alert('Error deleting batch. Please try again.')
      }
    }
  }

  const getCapacityStatus = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100
    if (percentage >= 90) return "destructive"
    if (percentage >= 75) return "secondary"
    return "default"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading batches...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
                <p className="text-gray-600">LINKCODE - Create and manage student batches</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingBatch(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Batch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingBatch ? "Edit Batch" : "Create New Batch"}</DialogTitle>
                  <DialogDescription>
                    {editingBatch ? "Update batch information" : "Enter batch details to create a new batch"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Batch Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Morning Batch A"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                        placeholder="30-45 students"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="schedule">Schedule</Label>
                      <Input
                        id="schedule"
                        value={formData.schedule}
                        onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                        placeholder="e.g., 9:00 AM - 12:00 PM"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="instructor">Instructor</Label>
                      <Input
                        id="instructor"
                        value={formData.instructor}
                        onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                        placeholder="Instructor name"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingBatch ? "Update Batch" : "Create Batch"}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {batches.map((batch) => (
              <Card key={batch.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {batch.name}
                    <Badge variant={getCapacityStatus(batch.currentStudents, batch.capacity)}>
                      {batch.currentStudents}/{batch.capacity}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{batch.schedule}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Instructor: {batch.instructor}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-sm text-muted-foreground">
                        Created: {batch.created_date}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(batch)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(batch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Batch Overview</CardTitle>
              <CardDescription>
                Total Batches: {batches.length} | Total Capacity: {batches.reduce((sum, batch) => sum + batch.capacity, 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.name}</TableCell>
                      <TableCell>{batch.schedule}</TableCell>
                      <TableCell>{batch.instructor}</TableCell>
                      <TableCell>{batch.currentStudents}</TableCell>
                      <TableCell>{batch.capacity}</TableCell>
                      <TableCell>
                        <Badge variant={getCapacityStatus(batch.currentStudents, batch.capacity)}>
                          {batch.currentStudents >= batch.capacity ? "Full" : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(batch)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(batch.id)}
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
