-- Create emergency_cards table
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.emergency_cards ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to emergency cards (they need to be accessible without auth)
CREATE POLICY "Emergency cards are viewable by everyone" 
ON public.emergency_cards 
FOR SELECT 
USING (true);

-- Create policy for creating emergency cards (public creation)
CREATE POLICY "Anyone can create emergency cards" 
ON public.emergency_cards 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster path lookups
CREATE INDEX idx_emergency_cards_path ON public.emergency_cards(path);