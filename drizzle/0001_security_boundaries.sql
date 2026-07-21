-- Supabase owns auth.users, so Drizzle intentionally does not declare it.
-- Linking the profile here prevents Drizzle from attempting to manage auth.
ALTER TABLE public.admin_profiles
  ADD CONSTRAINT admin_profiles_id_auth_users_id_fk
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
--> statement-breakpoint

ALTER TABLE public.option_choices
  ADD CONSTRAINT option_choices_accessory_id_accessories_id_fk
  FOREIGN KEY (accessory_id) REFERENCES public.accessories(id)
  ON DELETE RESTRICT;
--> statement-breakpoint

ALTER TABLE public.model_media
  ADD CONSTRAINT model_media_option_choice_id_option_choices_id_fk
  FOREIGN KEY (option_choice_id) REFERENCES public.option_choices(id)
  ON DELETE RESTRICT;
--> statement-breakpoint

-- This helper is the single database-level authorization predicate. It is
-- SECURITY DEFINER so its lookup does not recurse through admin_profiles RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
      AND is_active = true
  );
$$;
--> statement-breakpoint

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
--> statement-breakpoint

-- A signed-in user can inspect only their own profile. The admin policy below
-- additionally permits the active administrator to manage every table.
CREATE POLICY "admin_profiles_read_self"
ON public.admin_profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));
--> statement-breakpoint

DO $$
DECLARE
  managed_table text;
BEGIN
  FOREACH managed_table IN ARRAY ARRAY[
    'accessories',
    'accessory_categories',
    'accessory_compatibility',
    'accessory_media',
    'admin_profiles',
    'categories',
    'configuration_snapshots',
    'discover_categories',
    'discover_posts',
    'inquiries',
    'inventory_media',
    'inventory_units',
    'media_assets',
    'model_features',
    'model_media',
    'motorcycle_models',
    'option_choices',
    'option_groups',
    'option_rules',
    'site_settings'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY "admin_full_access" ON public.%I FOR ALL TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()))',
      managed_table
    );
  END LOOP;
END
$$;
--> statement-breakpoint

-- There are deliberately no anon policies. Public catalogue reads go through
-- the server-only DAL, which projects safe DTOs and enforces publication state.
-- This prevents private columns (VINs, quantities, notes, enquiry PII) from
-- becoming reachable through the generated Data API.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint

DO $$
DECLARE
  timestamped_table text;
BEGIN
  FOREACH timestamped_table IN ARRAY ARRAY[
    'accessories',
    'accessory_categories',
    'admin_profiles',
    'categories',
    'configuration_snapshots',
    'discover_posts',
    'inquiries',
    'inventory_units',
    'media_assets',
    'motorcycle_models',
    'option_choices',
    'option_groups',
    'site_settings'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      timestamped_table,
      timestamped_table
    );
  END LOOP;
END
$$;
