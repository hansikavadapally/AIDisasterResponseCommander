import type { Role } from '@/lib/supabase';

export type Profile = {
  id: string;
  role: Role;
  display_name: string;
  email: string;
  phone: string | null;
  commander_id: string | null;
  created_at: string;
};
