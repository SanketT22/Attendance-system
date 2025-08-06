-- Insert default batches
INSERT INTO batches (id, name, capacity, schedule, instructor, created_date) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Morning Batch A', 35, '9:00 AM - 12:00 PM', 'Prof. Smith', '2024-01-01'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Evening Batch B', 40, '2:00 PM - 5:00 PM', 'Prof. Johnson', '2024-01-01'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Weekend Batch C', 30, '10:00 AM - 1:00 PM (Sat-Sun)', 'Prof. Williams', '2024-01-15')
ON CONFLICT (name) DO NOTHING;

-- Insert sample students
INSERT INTO students (id, name, email, mobile, parent_mobile, address, batch_id, enrollment_date) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'John Doe', 'john@example.com', '9876543210', '9876543211', '123 Main St', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Jane Smith', 'jane@example.com', '9876543212', '9876543213', '456 Oak Ave', '550e8400-e29b-41d4-a716-446655440001', '2024-01-20')
ON CONFLICT (email) DO NOTHING;

-- Insert sample attendance records
INSERT INTO attendance_records (student_id, date, present) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', '2024-01-01', true),
  ('550e8400-e29b-41d4-a716-446655440011', '2024-01-02', true),
  ('550e8400-e29b-41d4-a716-446655440011', '2024-01-03', false),
  ('550e8400-e29b-41d4-a716-446655440012', '2024-01-01', true),
  ('550e8400-e29b-41d4-a716-446655440012', '2024-01-02', false),
  ('550e8400-e29b-41d4-a716-446655440012', '2024-01-03', true)
ON CONFLICT (student_id, date) DO NOTHING;
