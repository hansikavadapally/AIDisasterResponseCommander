/*
# Robo Web Sprint - Initial Schema
Creates all tables for the AI Disaster Response Command Center.
RLS enabled on all tables with role-based access.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('commander', 'client')),
  display_name text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.robots (
  robot_id text PRIMARY KEY,
  robot_name text NOT NULL,
  robot_type text NOT NULL,
  battery_percentage integer NOT NULL DEFAULT 100,
  assigned boolean NOT NULL DEFAULT false,
  assigned_client_id uuid,
  current_mission text,
  status text NOT NULL DEFAULT 'Available' CHECK (status IN ('Available','Assigned','Travelling','Rescue Started','Returning','Charging','Offline')),
  signal_strength integer NOT NULL DEFAULT 100,
  temperature numeric DEFAULT 22.0,
  speed numeric DEFAULT 0,
  current_location text,
  latitude numeric,
  longitude numeric,
  total_rescue_missions integer DEFAULT 0,
  rescue_success_rate numeric DEFAULT 100,
  avg_mission_time_min integer DEFAULT 0,
  performance_rating numeric DEFAULT 5,
  last_maintenance_date date,
  last_assigned_client text,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE public.robots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "robots_select_all" ON public.robots;
CREATE POLICY "robots_select_all" ON public.robots
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "robots_modify_commander" ON public.robots;
CREATE POLICY "robots_modify_commander" ON public.robots
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

CREATE TABLE IF NOT EXISTS public.drones (
  drone_id text PRIMARY KEY,
  drone_name text NOT NULL,
  battery integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'Available' CHECK (status IN ('Available','Monitoring','Returning','Charging','Maintenance')),
  mission text,
  location text,
  latitude numeric,
  longitude numeric,
  altitude numeric DEFAULT 0,
  speed numeric DEFAULT 0,
  camera_status text DEFAULT 'Active',
  flight_hours numeric DEFAULT 0,
  surveillance_missions integer DEFAULT 0,
  victims_detected integer DEFAULT 0,
  detection_accuracy numeric DEFAULT 95,
  performance_rating numeric DEFAULT 5,
  last_maintenance_date date,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE public.drones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "drones_select_all" ON public.drones;
CREATE POLICY "drones_select_all" ON public.drones
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "drones_modify_commander" ON public.drones;
CREATE POLICY "drones_modify_commander" ON public.drones
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

CREATE TABLE IF NOT EXISTS public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  emergency_type text NOT NULL CHECK (emergency_type IN ('Earthquake','Flood','Fire','Cyclone','Landslide','Building Collapse','Gas Leakage','Tsunami','Medical Emergency','Other')),
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High','Critical')),
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Robot Assigned','Robot En Route','Rescue Started','Mission Completed','Cancelled')),
  location text,
  latitude numeric,
  longitude numeric,
  assigned_robot_id text,
  assigned_drone_id text,
  image_url text,
  commander_notes text,
  eta_min integer,
  distance_km numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "complaints_select" ON public.complaints;
CREATE POLICY "complaints_select" ON public.complaints
  FOR SELECT TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander')
  );

DROP POLICY IF EXISTS "complaints_insert_own" ON public.complaints;
CREATE POLICY "complaints_insert_own" ON public.complaints
  FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "complaints_update_commander" ON public.complaints;
CREATE POLICY "complaints_update_commander" ON public.complaints
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "complaints_update_own" ON public.complaints;
CREATE POLICY "complaints_update_own" ON public.complaints
  FOR UPDATE TO authenticated
  USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid REFERENCES public.complaints(id) ON DELETE CASCADE,
  robot_id text REFERENCES public.robots(robot_id),
  drone_id text REFERENCES public.drones(drone_id),
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_name text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Assigned','Travelling','Rescue Started','Returning','Completed','Failed')),
  priority text NOT NULL DEFAULT 'Medium',
  progress integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "missions_select" ON public.missions;
CREATE POLICY "missions_select" ON public.missions
  FOR SELECT TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander')
  );

DROP POLICY IF EXISTS "missions_modify_commander" ON public.missions;
CREATE POLICY "missions_modify_commander" ON public.missions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (role = 'commander' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  );

DROP POLICY IF EXISTS "notifications_insert_own" ON public.notifications;
CREATE POLICY "notifications_insert_own" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander')
  );

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type text NOT NULL CHECK (alert_type IN ('Earthquake','Flood','Fire','Cyclone','Landslide','Building Collapse','Gas Leakage','Tsunami','Communication Failure')),
  severity text NOT NULL CHECK (severity IN ('Low','Medium','High','Critical')),
  location text NOT NULL,
  latitude numeric,
  longitude numeric,
  description text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "alerts_select_all" ON public.alerts;
CREATE POLICY "alerts_select_all" ON public.alerts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "alerts_modify_commander" ON public.alerts;
CREATE POLICY "alerts_modify_commander" ON public.alerts
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_logs_select_all" ON public.activity_logs;
CREATE POLICY "activity_logs_select_all" ON public.activity_logs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "activity_logs_insert_commander" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_commander" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.resources (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  unit text,
  location text,
  status text NOT NULL DEFAULT 'Available'
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resources_select_all" ON public.resources;
CREATE POLICY "resources_select_all" ON public.resources
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "resources_modify_commander" ON public.resources;
CREATE POLICY "resources_modify_commander" ON public.resources
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'robots') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.robots;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'drones') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.drones;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'complaints') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'missions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'alerts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'activity_logs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'resources') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_complaints_client_id ON public.complaints(client_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_missions_client_id ON public.missions(client_id);
CREATE INDEX IF NOT EXISTS idx_missions_robot_id ON public.missions(robot_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON public.alerts(active);
