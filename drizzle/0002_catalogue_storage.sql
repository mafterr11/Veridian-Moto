-- Public catalogue media is readable by URL, while every write remains gated
-- by Storage RLS and the same active-admin predicate as catalogue tables.
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'catalogue',
  'catalogue',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
--> statement-breakpoint

CREATE POLICY "catalogue_admin_read"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'catalogue'
  AND (SELECT public.is_admin())
);
--> statement-breakpoint

CREATE POLICY "catalogue_admin_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'catalogue'
  AND (SELECT public.is_admin())
);
--> statement-breakpoint

CREATE POLICY "catalogue_admin_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'catalogue'
  AND (SELECT public.is_admin())
)
WITH CHECK (
  bucket_id = 'catalogue'
  AND (SELECT public.is_admin())
);
--> statement-breakpoint

CREATE POLICY "catalogue_admin_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'catalogue'
  AND (SELECT public.is_admin())
);
