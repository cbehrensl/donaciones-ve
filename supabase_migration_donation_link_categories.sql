-- Add category support to public donation/help links.
-- Existing rows are kept as money links so current public views do not change.

ALTER TABLE public.donation_links
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'money';

UPDATE public.donation_links
SET category = 'money'
WHERE category IS NULL;

ALTER TABLE public.donation_links
DROP CONSTRAINT IF EXISTS donation_links_category_check;

ALTER TABLE public.donation_links
ADD CONSTRAINT donation_links_category_check
CHECK (category IN ('money', 'psychological'));

CREATE INDEX IF NOT EXISTS donation_links_active_category_idx
ON public.donation_links (is_active, category, created_at DESC);
