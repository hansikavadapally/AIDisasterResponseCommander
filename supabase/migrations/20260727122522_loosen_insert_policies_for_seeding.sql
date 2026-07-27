/*
# Loosen INSERT policies for operational data seeding

Allows any authenticated user (commander or client) to INSERT into robots,
drones, alerts, resources, and activity_logs. This is required because the
client-side seed runs after the first user (commander) logs in, and the
seeding user may not yet have a profile row when the seed executes.

SELECT remains open to all authenticated (already the case). UPDATE/DELETE
stay commander-only (already the case). Only INSERT is loosened.
*/

DROP POLICY IF EXISTS "robots_modify_commander" ON public.robots;
CREATE POLICY "robots_modify_commander" ON public.robots
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "robots_delete_commander" ON public.robots;
CREATE POLICY "robots_delete_commander" ON public.robots
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "robots_insert_authenticated" ON public.robots;
CREATE POLICY "robots_insert_authenticated" ON public.robots
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "drones_modify_commander" ON public.drones;
CREATE POLICY "drones_modify_commander" ON public.drones
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "drones_delete_commander" ON public.drones;
CREATE POLICY "drones_delete_commander" ON public.drones
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "drones_insert_authenticated" ON public.drones;
CREATE POLICY "drones_insert_authenticated" ON public.drones
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "alerts_modify_commander" ON public.alerts;
CREATE POLICY "alerts_modify_commander" ON public.alerts
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "alerts_delete_commander" ON public.alerts;
CREATE POLICY "alerts_delete_commander" ON public.alerts
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "alerts_insert_authenticated" ON public.alerts;
CREATE POLICY "alerts_insert_authenticated" ON public.alerts
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "activity_logs_insert_commander" ON public.activity_logs;
CREATE POLICY "activity_logs_insert_authenticated" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "resources_modify_commander" ON public.resources;
CREATE POLICY "resources_modify_commander" ON public.resources
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "resources_delete_commander" ON public.resources;
CREATE POLICY "resources_delete_commander" ON public.resources
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "resources_insert_authenticated" ON public.resources;
CREATE POLICY "resources_insert_authenticated" ON public.resources
  FOR INSERT TO authenticated WITH CHECK (true);

-- Missions: allow authenticated insert (commander creates missions during assignment)
DROP POLICY IF EXISTS "missions_modify_commander" ON public.missions;
CREATE POLICY "missions_modify_commander" ON public.missions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "missions_delete_commander" ON public.missions;
CREATE POLICY "missions_delete_commander" ON public.missions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'commander'));

DROP POLICY IF EXISTS "missions_insert_authenticated" ON public.missions;
CREATE POLICY "missions_insert_authenticated" ON public.missions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Notifications: allow any authenticated to insert (commander notifies clients)
-- Already has insert_own policy that covers this, keep it.
