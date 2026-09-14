
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'engrsaju289@gmail.com' AND email_confirmed_at IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'engrsaju289@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
