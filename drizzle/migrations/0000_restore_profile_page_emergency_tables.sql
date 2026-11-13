CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  email TEXT,
  twitter TEXT,
  linkedin TEXT,
  github TEXT,
  avatar TEXT,
  preferred_theme TEXT NOT NULL DEFAULT 'dark',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pages are publicly viewable" ON public.pages FOR SELECT USING (true);
CREATE POLICY "Users can create their own page" ON public.pages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own page" ON public.pages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own page" ON public.pages FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.emergency_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  id_code TEXT NOT NULL,
  validity_status TEXT NOT NULL CHECK (validity_status IN ('Valid', 'Expired')),
  preferred_hospitals TEXT NOT NULL,
  allergies TEXT NOT NULL,
  insurance_status TEXT NOT NULL CHECK (insurance_status IN ('Valid', 'Not Available')),
  family_doctor TEXT NOT NULL,
  blood_type TEXT NOT NULL,
  current_medication TEXT NOT NULL,
  emergency_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.emergency_cards TO anon;
GRANT SELECT, INSERT ON public.emergency_cards TO authenticated;
GRANT ALL ON public.emergency_cards TO service_role;
ALTER TABLE public.emergency_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Emergency cards are viewable by everyone" ON public.emergency_cards FOR SELECT USING (true);
CREATE POLICY "Anyone can create emergency cards" ON public.emergency_cards FOR INSERT TO anon, authenticated WITH CHECK (true);