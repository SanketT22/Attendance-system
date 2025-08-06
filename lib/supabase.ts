import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types based on database schema
export interface Student {
  id: string
  name: string
  email: string
  mobile: string
  parent_mobile: string
  address: string
  batch_id: string | null
  enrollment_date: string
  created_at?: string
  updated_at?: string
}

export interface Batch {
  id: string
  name: string
  capacity: number
  schedule: string
  instructor: string
  created_date: string
  created_at?: string
  updated_at?: string
}

export interface AttendanceRecord {
  id?: string
  student_id: string
  date: string
  present: boolean
  created_at?: string
  updated_at?: string
}

// Extended types for UI
export interface BatchWithStudentCount extends Batch {
  currentStudents: number
}

export interface MonthlyReport {
  studentId: string
  studentName: string
  totalDays: number
  presentDays: number
  absentDays: number
  attendancePercentage: number
}
