"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, FileSpreadsheet, Calendar, DollarSign, Wallet, ReceiptText } from 'lucide-react'
import Link from "next/link"
import { database } from "@/lib/database"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBatches: 0,
    todayAttendance: 0,
    attendanceRate: 0,
    totalFees: 0,
    totalFeesPaid: 0,
    totalFeesDue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const dashboardStats = await database.getDashboardStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LINKCODE ATTENDANCE MANAGEMENT SYSTEM</h1>
              <p className="text-gray-600">Comprehensive student attendance management solution</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalStudents}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all batches</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
                <Calendar className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalBatches}</div>
                <p className="text-xs text-muted-foreground mt-1">Active batches</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                <UserCheck className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.todayAttendance}</div>
                <p className="text-xs text-muted-foreground mt-1">Students present</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.attendanceRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>

            {/* New Fee Stats Cards */}
            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                <DollarSign className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">₹{stats.totalFees.toFixed(2)}</div> {/* Updated */}
                <p className="text-xs text-muted-foreground mt-1">Total fees assigned</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fees Collected</CardTitle>
                <Wallet className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">₹{stats.totalFeesPaid.toFixed(2)}</div> {/* Updated */}
                <p className="text-xs text-muted-foreground mt-1">Amount received</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out border border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fees Pending</CardTitle>
                <ReceiptText className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">₹{stats.totalFeesDue.toFixed(2)}</div> {/* Updated */}
                <p className="text-xs text-muted-foreground mt-1">Outstanding amount</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/students" className="block">
              <Card className="h-full flex flex-col justify-between hover:shadow-lg hover:border-primary transition-all duration-300 ease-in-out cursor-pointer border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Users className="h-6 w-6 text-primary" />
                    Manage Students
                  </CardTitle>
                  <CardDescription className="mt-2">Add, edit, and manage student information</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/batches" className="block">
              <Card className="h-full flex flex-col justify-between hover:shadow-lg hover:border-primary transition-all duration-300 ease-in-out cursor-pointer border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Calendar className="h-6 w-6 text-primary" />
                    Manage Batches
                  </CardTitle>
                  <CardDescription className="mt-2">Create and organize student batches</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/attendance" className="block">
              <Card className="h-full flex flex-col justify-between hover:shadow-lg hover:border-primary transition-all duration-300 ease-in-out cursor-pointer border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <UserCheck className="h-6 w-6 text-primary" />
                    Mark Attendance
                  </CardTitle>
                  <CardDescription className="mt-2">Record daily student attendance</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/reports" className="block">
              <Card className="h-full flex flex-col justify-between hover:shadow-lg hover:border-primary transition-all duration-300 ease-in-out cursor-pointer border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                    Generate Reports
                  </CardTitle>
                  <CardDescription className="mt-2">Export monthly attendance reports</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
