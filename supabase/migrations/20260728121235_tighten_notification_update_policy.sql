-- Tighten notification update policy: commanders can only update their own notifications
DROP POLICY IF EXISTS notifications_update_own ON public.notifications;

CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
