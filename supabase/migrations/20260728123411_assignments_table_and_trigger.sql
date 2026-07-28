/*
# Assignments table + atomic assignment with duplicate prevention

1. New Tables
- `assignments`
  - `id` (uuid, primary key)
  - `complaint_id` (uuid, foreign key to complaints.id, UNIQUE — one assignment per complaint)
  - `commander_id` (uuid, foreign key to profiles.id)
  - `commander_name` (text — denormalized for display)
  - `commander_display_id` (text — e.g. CMD-1005, denormalized)
  - `robot_id` (text, nullable)
  - `drone_id` (text, nullable)
  - `assigned_at` (timestamptz, default now())

2. Constraints
- UNIQUE constraint on `complaint_id` so only one assignment can exist per complaint.
  This is the atomic duplicate-prevention mechanism: if two commanders try to assign
  simultaneously, the second insert fails on the unique constraint.

3. Trigger
- `notify_commanders_on_assignment`: AFTER INSERT on assignments.
  Creates a notification for EVERY commander (same pattern as complaint trigger),
  an activity log entry, and notifies the client.

4. Security
- RLS enabled on `assignments`.
- SELECT: authenticated can read (all commanders need to see all assignments).
- INSERT: authenticated commanders only (check profile role = commander).
- No UPDATE or DELETE policies (assignments are immutable once created).
*/

CREATE TABLE IF NOT EXISTS public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL UNIQUE REFERENCES public.complaints(id) ON DELETE CASCADE,
  commander_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  commander_name text NOT NULL,
  commander_display_id text NOT NULL,
  robot_id text,
  drone_id text,
  assigned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignments_select_all" ON public.assignments;
CREATE POLICY "assignments_select_all" ON public.assignments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "assignments_insert_commander" ON public.assignments;
CREATE POLICY "assignments_insert_commander" ON public.assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'commander'
    )
  );

-- Trigger: when an assignment is created, notify every commander + the client
CREATE OR REPLACE FUNCTION public.notify_on_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  commander_rec RECORD;
  v_complaint RECORD;
  v_assigned_text text;
BEGIN
  SELECT * INTO v_complaint FROM public.complaints WHERE id = NEW.complaint_id;

  v_assigned_text := CONCAT_WS(' + ',
    CASE WHEN NEW.robot_id IS NOT NULL THEN NEW.robot_id END,
    CASE WHEN NEW.drone_id IS NOT NULL THEN NEW.drone_id END
  );

  -- Notify every commander
  FOR commander_rec IN
    SELECT id FROM public.profiles WHERE role = 'commander'
  LOOP
    INSERT INTO public.notifications (user_id, role, type, title, message)
    VALUES (
      commander_rec.id,
      'commander',
      'assignment',
      'Resource Assigned',
      'Complaint #' || v_complaint.title || ' has been assigned by Commander ' || NEW.commander_display_id || '. Resources: ' || v_assigned_text
    );
  END LOOP;

  -- Notify the client
  INSERT INTO public.notifications (user_id, role, type, title, message)
  VALUES (
    v_complaint.client_id,
    'client',
    'assignment',
    'Rescue Resource Assigned',
    v_assigned_text || ' has been assigned to your request by Commander ' || NEW.commander_display_id || '. ETA en route.'
  );

  -- Activity log
  INSERT INTO public.activity_logs (type, message, severity)
  VALUES (
    'assignment',
    'Complaint #' || v_complaint.title || ' assigned by Commander ' || NEW.commander_display_id || ' — ' || v_assigned_text,
    'success'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_assignment_inserted ON public.assignments;
CREATE TRIGGER on_assignment_inserted
  AFTER INSERT ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_assignment();
