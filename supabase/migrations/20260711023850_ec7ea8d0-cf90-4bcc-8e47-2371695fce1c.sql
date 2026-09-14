REVOKE SELECT ON public.orders FROM anon;
REVOKE SELECT ON public.preorders FROM anon;

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create valid pending orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(customer_name)) >= 2
  AND length(trim(customer_mobile)) >= 6
  AND length(trim(customer_address)) >= 10
  AND delivery_option IN ('inside', 'outside')
  AND delivery_fee >= 0
  AND subtotal >= 0
  AND total >= subtotal
  AND payment_method IN ('cod')
  AND status = 'pending'
  AND jsonb_typeof(items) = 'array'
  AND jsonb_array_length(items) > 0
);

DROP POLICY IF EXISTS "Anyone can create preorders" ON public.preorders;
CREATE POLICY "Anyone can create valid pending preorders"
ON public.preorders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(customer_name)) >= 2
  AND length(trim(customer_mobile)) >= 6
  AND length(trim(product_name)) >= 2
  AND quantity > 0
  AND coalesce(budget, 0) >= 0
  AND advance_paid >= 0
  AND status = 'pending'
  AND admin_note IS NULL
);

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT auth.uid() = _user_id
    AND EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = _user_id
        AND role = _role
    )
$$;