"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft, Users } from 'lucide-react'
import Link from "next/link"

interface Batch {
  id: string
  name: string
  capacity: number
  currentStudents: number
  schedule: string
  instructor: string
  createdDate: string
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([
    {
      id: "batch1",
      name: "Morning Batch A",
      capacity: 35,
      currentStudents: 32,
      schedule: "9:00 AM - 12:00 PM",
      instructor: "Prof. Smith",
      createdDate: "2024-01-01"
    },
    {
      id: "batch2",
      name: "Evening Batch B",
      capacity: 40,
      currentStudents: 38,
      schedule: "2:00 PM - 5:00 PM",
      instructor: "Prof. Johnson",
      createdDate: "2024-01-01"
    },
    {
      id: "batch3",
      name: "Weekend Batch C",
      capacity: 30,
      currentStudents: 25,
      schedule: "10:00 AM - 1:00 PM (Sat-Sun)",
      instructor: "Prof. Williams",
      createdDate: "2024-01-15"
    }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    schedule: "",
    instructor: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingBatch) {
      setBatches(batches.map(batch => 
        batch.id === editingBatch.id 
          ? { 
              ...batch, 
              name: formData.name,
              capacity: parseInt(formData.capacity),
              schedule: formData.schedule,
              instructor: formData.instructor
            }
          : batch
      ))
    } else {
      const newBatch: Batch = {
        id: Date.now().toString(),
        name: formData.name,
        capacity: parseInt(formData.capacity),
        currentStudents: 0,
        schedule: formData.schedule,
        instructor: formData.instructor,
        createdDate: new Date().toISOString().split('T')[0]
      }
      setBatches([...batches, newBatch])
    }
    
    resetForm()
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

  const handleDelete = (id: string) => {
    setBatches(batches.filter(batch => batch.id !== id))
  }

  const getCapacityStatus = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100
    if (percentage >= 90) return "destructive"
    if (percentage >= 75) return "secondary"
    return "default"
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
                        Created: {batch.createdDate}
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
