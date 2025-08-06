"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon, Save, UserCheck, UserX } from 'lucide-react'
import { format } from "date-fns"
import Link from "next/link"
import { database } from "@/lib/database"
import { type Student, type Batch, type AttendanceRecord } from "@/lib/supabase"

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({})

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Load existing attendance when batch or date changes
  useEffect(() => {
    if (selectedBatch && selectedDate) {
      loadExistingAttendance()
    }
  }, [selectedBatch, selectedDate])

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

  const loadExistingAttendance = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const existingRecords = await database.getAttendanceByDateAndBatch(dateStr, selectedBatch)
      
      const attendanceMap: { [key: string]: boolean } = {}
      existingRecords.forEach(record => {
        attendanceMap[record.student_id] = record.present
      })
      setAttendance(attendanceMap)
    } catch (error) {
      console.error('Error loading existing attendance:', error)
    }
  }

  const filteredStudents = students.filter(student => 
    selectedBatch ? student.batch_id === selectedBatch : false
  )

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: present
    }))
  }

  const handleSaveAttendance = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const newRecords: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[] = filteredStudents.map(student => ({
        student_id: student.id,
        date: dateStr,
        present: attendance[student.id] || false
      }))

      await database.saveAttendance(newRecords)
      alert("Attendance saved successfully!")
    } catch (error) {
      console.error('Error saving attendance:', error)
      alert('Error saving attendance. Please try again.')
    }
  }

  const markAllPresent = () => {
    const newAttendance: { [key: string]: boolean } = {}
    filteredStudents.forEach(student => {
      newAttendance[student.id] = true
    })
    setAttendance(newAttendance)
  }

  const markAllAbsent = () => {
    const newAttendance: { [key: string]: boolean } = {}
    filteredStudents.forEach(student => {
      newAttendance[student.id] = false
    })
    setAttendance(newAttendance)
  }

  const getPresentCount = () => {
    return Object.values(attendance).filter(present => present).length
  }

  const getAbsentCount = () => {
    return filteredStudents.length - getPresentCount()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
                <p className="text-gray-600">LINKCODE - Record daily student attendance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Controls */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Attendance Controls</CardTitle>
              <CardDescription>Select batch and date to mark attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Select Batch</label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Choose batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Select Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedBatch && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={markAllPresent}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Mark All Present
                    </Button>
                    <Button variant="outline" onClick={markAllAbsent}>
                      <UserX className="h-4 w-4 mr-2" />
                      Mark All Absent
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          {selectedBatch && filteredStudents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredStudents.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Present</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{getPresentCount()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Absent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{getAbsentCount()}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attendance Table */}
          {selectedBatch && filteredStudents.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      Attendance for {batches.find(b => b.id === selectedBatch)?.name}
                    </CardTitle>
                    <CardDescription>
                      Date: {format(selectedDate, "PPP")} | Students: {filteredStudents.length}
                    </CardDescription>
                  </div>
                  <Button onClick={handleSaveAttendance} disabled={filteredStudents.length === 0}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Attendance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Present</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.mobile}</TableCell>
                        <TableCell>
                          <Badge variant={attendance[student.id] ? "default" : "destructive"}>
                            {attendance[student.id] ? "Present" : "Absent"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={attendance[student.id] || false}
                            onCheckedChange={(checked) => 
                              handleAttendanceChange(student.id, checked as boolean)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    {selectedBatch ? "No students in this batch" : "Select a batch to mark attendance"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedBatch 
                      ? "Add students to this batch from the Student Management page."
                      : "Choose a batch from the dropdown above to view and mark student attendance."
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
