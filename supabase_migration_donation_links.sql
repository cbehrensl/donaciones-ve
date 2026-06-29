-- Migration to add donation_links table

CREATE TABLE IF NOT EXISTS public.donation_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.donation_links ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "Public profiles are viewable by everyone."
ON public.donation_links
FOR SELECT
USING (true);

-- Policy: Only authenticated admins can insert/update/delete
-- Assuming there is a way to identify admins, or using simple authenticated user check for now
CREATE POLICY "Authenticated users can create donation links"
ON public.donation_links
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update donation links"
ON public.donation_links
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete donation links"
ON public.donation_links
FOR DELETE
TO authenticated
USING (true);

-- Trigger to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_donation_links_updated_at
    BEFORE UPDATE ON public.donation_links
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
