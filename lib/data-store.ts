interface Student {
  id: string
  name: string
  email: string
  mobile: string
  parentMobile: string
  address: string
  batchId: string
  enrollmentDate: string
}

interface Batch {
  id: string
  name: string
  capacity: number
  currentStudents: number
  schedule: string
  instructor: string
  createdDate: string
}

interface AttendanceRecord {
  studentId: string
  date: string
  present: boolean
}

// Default data
const defaultStudents: Student[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    mobile: "9876543210",
    parentMobile: "9876543211",
    address: "123 Main St",
    batchId: "batch1",
    enrollmentDate: "2024-01-15"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    mobile: "9876543212",
    parentMobile: "9876543213",
    address: "456 Oak Ave",
    batchId: "batch1",
    enrollmentDate: "2024-01-20"
  }
]

const defaultBatches: Batch[] = [
  {
    id: "batch1",
    name: "Morning Batch A",
    capacity: 35,
    currentStudents: 2,
    schedule: "9:00 AM - 12:00 PM",
    instructor: "Prof. Smith",
    createdDate: "2024-01-01"
  },
  {
    id: "batch2",
    name: "Evening Batch B",
    capacity: 40,
    currentStudents: 0,
    schedule: "2:00 PM - 5:00 PM",
    instructor: "Prof. Johnson",
    createdDate: "2024-01-01"
  },
  {
    id: "batch3",
    name: "Weekend Batch C",
    capacity: 30,
    currentStudents: 0,
    schedule: "10:00 AM - 1:00 PM (Sat-Sun)",
    instructor: "Prof. Williams",
    createdDate: "2024-01-15"
  }
]

const defaultAttendanceRecords: AttendanceRecord[] = [
  { studentId: "1", date: "2024-01-01", present: true },
  { studentId: "1", date: "2024-01-02", present: true },
  { studentId: "1", date: "2024-01-03", present: false },
  { studentId: "2", date: "2024-01-01", present: true },
  { studentId: "2", date: "2024-01-02", present: false },
  { studentId: "2", date: "2024-01-03", present: true },
]

// Data store functions
export const dataStore = {
  // Students
  getStudents: (): Student[] => {
    if (typeof window === 'undefined') return defaultStudents
    const stored = localStorage.getItem('linkcode_students')
    return stored ? JSON.parse(stored) : defaultStudents
  },

  setStudents: (students: Student[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('linkcode_students', JSON.stringify(students))
    // Update batch current students count
    const batches = dataStore.getBatches()
    const updatedBatches = batches.map(batch => ({
      ...batch,
      currentStudents: students.filter(student => student.batchId === batch.id).length
    }))
    dataStore.setBatches(updatedBatches)
  },

  addStudent: (student: Omit<Student, 'id' | 'enrollmentDate'>) => {
    const students = dataStore.getStudents()
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
      enrollmentDate: new Date().toISOString().split('T')[0]
    }
    const updatedStudents = [...students, newStudent]
    dataStore.setStudents(updatedStudents)
    return newStudent
  },

  updateStudent: (id: string, updates: Partial<Student>) => {
    const students = dataStore.getStudents()
    const updatedStudents = students.map(student => 
      student.id === id ? { ...student, ...updates } : student
    )
    dataStore.setStudents(updatedStudents)
  },

  deleteStudent: (id: string) => {
    const students = dataStore.getStudents()
    const updatedStudents = students.filter(student => student.id !== id)
    dataStore.setStudents(updatedStudents)
  },

  // Batches
  getBatches: (): Batch[] => {
    if (typeof window === 'undefined') return defaultBatches
    const stored = localStorage.getItem('linkcode_batches')
    return stored ? JSON.parse(stored) : defaultBatches
  },

  setBatches: (batches: Batch[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('linkcode_batches', JSON.stringify(batches))
  },

  addBatch: (batch: Omit<Batch, 'id' | 'currentStudents' | 'createdDate'>) => {
    const batches = dataStore.getBatches()
    const newBatch: Batch = {
      ...batch,
      id: Date.now().toString(),
      currentStudents: 0,
      createdDate: new Date().toISOString().split('T')[0]
    }
    const updatedBatches = [...batches, newBatch]
    dataStore.setBatches(updatedBatches)
    return newBatch
  },

  updateBatch: (id: string, updates: Partial<Batch>) => {
    const batches = dataStore.getBatches()
    const updatedBatches = batches.map(batch => 
      batch.id === id ? { ...batch, ...updates } : batch
    )
    dataStore.setBatches(updatedBatches)
  },

  deleteBatch: (id: string) => {
    const batches = dataStore.getBatches()
    const updatedBatches = batches.filter(batch => batch.id !== id)
    dataStore.setBatches(updatedBatches)
  },

  // Attendance
  getAttendanceRecords: (): AttendanceRecord[] => {
    if (typeof window === 'undefined') return defaultAttendanceRecords
    const stored = localStorage.getItem('linkcode_attendance')
    return stored ? JSON.parse(stored) : defaultAttendanceRecords
  },

  setAttendanceRecords: (records: AttendanceRecord[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('linkcode_attendance', JSON.stringify(records))
  },

  saveAttendance: (records: AttendanceRecord[]) => {
    const existingRecords = dataStore.getAttendanceRecords()
    
    // Remove existing records for the same date and students
    const dateStr = records[0]?.date
    const studentIds = records.map(r => r.studentId)
    
    const filteredExisting = existingRecords.filter(record => 
      record.date !== dateStr || !studentIds.includes(record.studentId)
    )
    
    const updatedRecords = [...filteredExisting, ...records]
    dataStore.setAttendanceRecords(updatedRecords)
  }
}

export type { Student, Batch, AttendanceRecord }
