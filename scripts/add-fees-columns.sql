ALTER TABLE students
ADD COLUMN total_fees NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN fees_paid NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN fees_due NUMERIC(10, 2) DEFAULT 0.00;

-- Function to update fees_due
CREATE OR REPLACE FUNCTION calculate_fees_due()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fees_due = NEW.total_fees - NEW.fees_paid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call calculate_fees_due before insert or update on students
CREATE TRIGGER update_fees_due_trigger
BEFORE INSERT OR UPDATE OF total_fees, fees_paid ON students
FOR EACH ROW
EXECUTE FUNCTION calculate_fees_due();

-- Optional: Update existing students to set initial fees_due
UPDATE students
SET fees_due = total_fees - fees_paid
WHERE fees_due IS NULL;
