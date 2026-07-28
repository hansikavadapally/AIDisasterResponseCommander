-- When a client submits a complaint, automatically create a notification
-- for every registered commander so each one sees it in their own bell dropdown.

CREATE OR REPLACE FUNCTION public.notify_commanders_on_complaint()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  commander RECORD;
BEGIN
  FOR commander IN
    SELECT id, display_name FROM public.profiles WHERE role = 'commander'
  LOOP
    INSERT INTO public.notifications (user_id, role, type, title, message)
    VALUES (
      commander.id,
      'commander',
      'complaint',
      'New Complaint Received',
      NEW.client_name || ' submitted a ' || NEW.emergency_type || ' emergency: ' || NEW.title
    );
  END LOOP;

  INSERT INTO public.activity_logs (type, message, severity)
  VALUES (
    'complaint',
    NEW.client_name || ' submitted a ' || NEW.emergency_type || ' emergency request: ' || NEW.title,
    CASE WHEN NEW.priority = 'Critical' THEN 'critical' ELSE 'info' END
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_complaint_inserted ON public.complaints;

CREATE TRIGGER on_complaint_inserted
  AFTER INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_commanders_on_complaint();
