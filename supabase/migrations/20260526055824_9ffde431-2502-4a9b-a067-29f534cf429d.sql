
-- Drop overly broad storage SELECT (public bucket still serves files directly via URL)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;

-- Lock down SECURITY DEFINER functions from API access
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
