/*
# Add commander_id column and public commander lookup

1. Changes
- Add `commander_id` text column to profiles (nullable, unique per commander)
- Add public read policy for commander profiles so the login page can look up
  an email from a Commander ID before the user is authenticated.

2. Security
- New SELECT policy allows anon + authenticated to read profiles WHERE
  role = 'commander'. This is needed so the Commander ID -> email lookup
  works on the login screen. Client profiles remain owner-only.
*/

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commander_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_commander_id ON public.profiles(commander_id) WHERE commander_id IS NOT NULL;

-- Allow anyone to read commander profiles (needed for commander_id -> email lookup at login)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_commanders_public" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_select_commanders_public" ON public.profiles
  FOR SELECT TO anon, authenticated USING (role = 'commander');

-- Set the predefined commander's commander_id
UPDATE public.profiles SET commander_id = 'CMD001' WHERE email = 'commander@roboweb.ai' AND role = 'commander';
