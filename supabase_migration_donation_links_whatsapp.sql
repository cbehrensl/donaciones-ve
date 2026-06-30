-- Allow moderated help links to use WhatsApp as an alternative to a URL.

ALTER TABLE public.donation_links
ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;

ALTER TABLE public.donation_links
ALTER COLUMN url DROP NOT NULL;

ALTER TABLE public.donation_links
DROP CONSTRAINT IF EXISTS donation_links_contact_check;

ALTER TABLE public.donation_links
ADD CONSTRAINT donation_links_contact_check
CHECK (
  NULLIF(url, '') IS NOT NULL
  OR NULLIF(whatsapp_phone, '') IS NOT NULL
);
