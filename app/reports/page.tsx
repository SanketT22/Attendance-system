"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, FileSpreadsheet, Calendar } from 'lucide-react'
import Link from "next/link"
import { database } from "@/lib/database" // Import the database utility
import { type Student, type Batch, type AttendanceRecord } from "@/lib/supabase" // Import Supabase types

interface MonthlyReport {
  studentId: string
  studentName: string
  totalDays: number
  presentDays: number
  absentDays: number
  attendancePercentage: number
}

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)) // Default to current month YYYY-MM

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [studentsData, batchesData, attendanceData] = await Promise.all([
        database.getStudents(),
        database.getBatches(),
        database.getAttendanceRecords()
      ])
      setStudents(studentsData)
      setBatches(batchesData)
      setAttendanceRecords(attendanceData)
    } catch (error) {
      console.error('Error loading report data:', error)
      alert('Error loading report data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyReport = (): MonthlyReport[] => {
    if (!selectedBatch) return []

    const batchStudents = students.filter(student => student.batch_id === selectedBatch)
    const monthRecords = attendanceRecords.filter(record => 
      record.date.startsWith(selectedMonth)
    )

    return batchStudents.map(student => {
      const studentRecords = monthRecords.filter(record => record.student_id === student.id)
      const presentDays = studentRecords.filter(record => record.present).length
      const totalDays = studentRecords.length
      const absentDays = totalDays - presentDays
      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

      return {
        studentId: student.id,
        studentName: student.name,
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
      }
    })
  }

  const monthlyReport = generateMonthlyReport()

  const exportToExcel = async () => {
    if (!selectedBatch || monthlyReport.length === 0) {
      alert("Please select a batch and ensure there is data to export")
      return
    }

    try {
      const XLSX = await import('xlsx')
      
      const batchName = batches.find(b => b.id === selectedBatch)?.name || "Unknown Batch"
      const monthYear = new Date(selectedMonth + "-01").toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })

      const headerData = [
        ['LINKCODE ATTENDANCE MANAGEMENT SYSTEM'],
        [`Attendance Report - ${batchName}`],
        [`Month: ${monthYear}`],
        [`Generated on: ${new Date().toLocaleDateString()}`],
        [''],
        ['Student Name', 'Total Days', 'Present Days', 'Absent Days', 'Attendance %']
      ]

      const studentData = monthlyReport.map(report => [
        report.studentName,
        report.totalDays,
        report.presentDays,
        report.absentDays,
        report.attendancePercentage + '%'
      ])

      const totalStudents = monthlyReport.length
      const avgAttendance = monthlyReport.length > 0 
        ? Math.round(monthlyReport.reduce((sum, report) => sum + report.attendancePercentage, 0) / monthlyReport.length)
        : 0

      const summaryData = [
        [''],
        ['SUMMARY'],
        ['Total Students', totalStudents, '', '', ''],
        ['Average Attendance', '', '', '', avgAttendance + '%'],
        ['Excellent (≥90%)', monthlyReport.filter(r => r.attendancePercentage >= 90).length, '', '', ''],
        ['Good (75-89%)', monthlyReport.filter(r => r.attendancePercentage >= 75 && r.attendancePercentage < 90).length, '', '', ''],
        ['Average (60-74%)', monthlyReport.filter(r => r.attendancePercentage >= 60 && r.attendancePercentage < 75).length, '', '', ''],
        ['Poor (<60%)', monthlyReport.filter(r => r.attendancePercentage < 60).length, '', '', '']
      ]

      const allData = [...headerData, ...studentData, ...summaryData]

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(allData)

      const colWidths = [
        { wch: 25 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 }
      ]
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report')

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `LINKCODE_attendance_${batchName.replace(/\s+/g, '_')}_${selectedMonth}_${timestamp}.xlsx`

      XLSX.writeFile(wb, filename)
      
      alert(`Excel file "${filename}" downloaded successfully!\n\nReport includes:\n- ${totalStudents} students\n- ${avgAttendance}% average attendance\n- Summary statistics`)
    } catch (error: any) {
      console.error("Error exporting to Excel:", error)
      alert(`Error exporting to Excel: ${error.message}`)
    }
  }

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return "default"
    if (percentage >= 75) return "secondary"
    if (percentage >= 60) return "destructive"
    return "destructive"
  }

  const getAttendanceLabel = (percentage: number) => {
    if (percentage >= 90) return "Excellent"
    if (percentage >= 75) return "Good"
    if (percentage >= 60) return "Average"
    return "Poor"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports data...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
                <p className="text-gray-600">LINKCODE - Generate and export monthly attendance reports</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Report Filters</CardTitle>
              <CardDescription>Select batch and month to generate attendance report</CardDescription>
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
                  <label className="text-sm font-medium">Select Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* You might want to dynamically generate months based on available data */}
                      <SelectItem value="2024-01">January 2024</SelectItem>
                      <SelectItem value="2024-02">February 2024</SelectItem>
                      <SelectItem value="2024-03">March 2024</SelectItem>
                      <SelectItem value="2024-04">April 2024</SelectItem>
                      <SelectItem value="2024-05">May 2024</SelectItem>
                      <SelectItem value="2024-06">June 2024</SelectItem>
                      <SelectItem value="2024-07">July 2024</SelectItem>
                      <SelectItem value="2024-08">August 2024</SelectItem>
                      <SelectItem value="2024-09">September 2024</SelectItem>
                      <SelectItem value="2024-10">October 2024</SelectItem>
                      <SelectItem value="2024-11">November 2024</SelectItem>
                      <SelectItem value="2024-12">December 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedBatch && monthlyReport.length > 0 && (
                  <Button onClick={exportToExcel}>
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedBatch && monthlyReport.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyReport.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {monthlyReport.length > 0 
                      ? Math.round(monthlyReport.reduce((sum, report) => sum + report.attendancePercentage, 0) / monthlyReport.length)
                      : 0}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Excellent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {monthlyReport.filter(report => report.attendancePercentage >= 90).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Poor Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {monthlyReport.filter(report => report.attendancePercentage < 60).length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedBatch && monthlyReport.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      Monthly Attendance Report
                    </CardTitle>
                    <CardDescription>
                      {batches.find(b => b.id === selectedBatch)?.name} - {
                        new Date(selectedMonth + "-01").toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })
                      }
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Total Days</TableHead>
                      <TableHead>Present Days</TableHead>
                      <TableHead>Absent Days</TableHead>
                      <TableHead>Attendance %</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyReport.map((report) => (
                      <TableRow key={report.studentId}>
                        <TableCell className="font-medium">{report.studentName}</TableCell>
                        <TableCell>{report.totalDays}</TableCell>
                        <TableCell className="text-green-600">{report.presentDays}</TableCell>
                        <TableCell className="text-red-600">{report.absentDays}</TableCell>
                        <TableCell className="font-medium">{report.attendancePercentage}%</TableCell>
                        <TableCell>
                          <Badge variant={getAttendanceStatus(report.attendancePercentage)}>
                            {getAttendanceLabel(report.attendancePercentage)}
                          </Badge>
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
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    {selectedBatch ? "No attendance data found" : "Select a batch to generate report"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedBatch 
                      ? "Mark attendance for students in this batch to generate reports."
                      : "Choose a batch and month from the filters above to view the attendance report."
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
