import { supabase, type Student, type Batch, type AttendanceRecord, type BatchWithStudentCount } from './supabase'

export const database = {
  // Students
  async getStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching students:', error)
      throw error
    }
    
    return data || []
  },

  async addStudent(student: Omit<Student, 'id' | 'fees_due' | 'created_at' | 'updated_at'>): Promise<Student> { // Modified Omit
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding student:', error)
      throw error
    }
    
    return data
  },

  async updateStudent(id: string, updates: Partial<Omit<Student, 'fees_due'>>): Promise<Student> { // Modified Partial Omit
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating student:', error)
      throw error
    }
    
    return data
  },

  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  },

  // Batches
  async getBatches(): Promise<Batch[]> {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching batches:', error)
      throw error
    }
    
    return data || []
  },

  async getBatchesWithStudentCount(): Promise<BatchWithStudentCount[]> {
    const { data, error } = await supabase
      .from('batches')
      .select(`
        *,
        students(count)
      `)
      .order('name')
    
    if (error) {
      console.error('Error fetching batches with student count:', error)
      throw error
    }
    
    return (data || []).map(batch => ({
      ...batch,
      currentStudents: batch.students?.[0]?.count || 0
    }))
  },

  async addBatch(batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>): Promise<Batch> {
    const { data, error } = await supabase
      .from('batches')
      .insert([batch])
      .select()
      .single()
    
    if (error) {
      console.error('Error adding batch:', error)
      throw error
    }
    
    return data
  },

  async updateBatch(id: string, updates: Partial<Batch>): Promise<Batch> {
    const { data, error } = await supabase
      .from('batches')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating batch:', error)
      throw error
    }
    
    return data
  },

  async deleteBatch(id: string): Promise<void> {
    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting batch:', error)
      throw error
    }
  },

  // Attendance
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      console.error('Error fetching attendance records:', error)
      throw error
    }
    
    return data || []
  },

  async getAttendanceByDateAndBatch(date: string, batchId: string): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        students!inner(batch_id)
      `)
      .eq('date', date)
      .eq('students.batch_id', batchId)
    
    if (error) {
      console.error('Error fetching attendance by date and batch:', error)
      throw error
    }
    
    return data || []
  },

  async saveAttendance(records: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    const { error } = await supabase
      .from('attendance_records')
      .upsert(records, { 
        onConflict: 'student_id,date',
        ignoreDuplicates: false 
      })
    
    if (error) {
      console.error('Error saving attendance:', error)
      throw error
    }
  },

  // Dashboard stats
  async getDashboardStats() {
    try {
      // Get total students
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })

      // Get total batches
      const { count: totalBatches } = await supabase
        .from('batches')
        .select('*', { count: 'exact', head: true })

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0]
      const { count: todayAttendance } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('present', true)

      // Calculate attendance rate for current month
      const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
      const { data: monthlyRecords } = await supabase
        .from('attendance_records')
        .select('present')
        .gte('date', currentMonth + '-01')
        .lt('date', currentMonth + '-32')

      const attendanceRate = monthlyRecords && monthlyRecords.length > 0
        ? Math.round((monthlyRecords.filter(r => r.present).length / monthlyRecords.length) * 100)
        : 0

      // Get total fees, fees paid, and fees due
      const { data: feeData, error: feeError } = await supabase
        .from('students')
        .select('total_fees, fees_paid, fees_due')

      let totalFees = 0
      let totalFeesPaid = 0
      let totalFeesDue = 0

      if (feeData && !feeError) {
        totalFees = feeData.reduce((sum, student) => sum + (student.total_fees || 0), 0)
        totalFeesPaid = feeData.reduce((sum, student) => sum + (student.fees_paid || 0), 0)
        totalFeesDue = feeData.reduce((sum, student) => sum + (student.fees_due || 0), 0)
      } else if (feeError) {
        console.error('Error fetching fee data:', feeError)
      }

      return {
        totalStudents: totalStudents || 0,
        totalBatches: totalBatches || 0,
        todayAttendance: todayAttendance || 0,
        attendanceRate,
        totalFees, // Added
        totalFeesPaid, // Added
        totalFeesDue // Added
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalStudents: 0,
        totalBatches: 0,
        todayAttendance: 0,
        attendanceRate: 0,
        totalFees: 0, // Added
        totalFeesPaid: 0, // Added
        totalFeesDue: 0 // Added
      }
    }
  }
}
