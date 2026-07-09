-- =============================================================================
-- BluuCRM — Supabase custom access token hook + seed
-- Install: Supabase dashboard → Auth → Hooks → Custom access token hook
--          point it at "public.custom_access_token_hook"
-- =============================================================================

-- =============================================================================
-- CUSTOM ACCESS TOKEN HOOK
-- Supabase calls this function every time it issues a JWT.
-- We inject tenant_id, user_type, and crm_role so RLS policies can read them
-- via get_my_tenant_id() / get_my_user_type() without extra round-trips.
-- =============================================================================
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer
stable
as $$
declare
  claims        jsonb;
  uid           uuid;
  v_tenant_id   uuid;
  v_user_type   text;
  v_crm_role    text;
  v_aff_code    text;
  v_aff_status  text;
begin
  uid    := (event ->> 'user_id')::uuid;
  claims := event -> 'claims';

  -- ── Team member? ─────────────────────────────────────────────────────────
  select tm.tenant_id, tm.crm_role
    into v_tenant_id, v_crm_role
    from team_members tm
   where tm.user_id = uid
     and tm.status  = 'active'
   limit 1;

  if found then
    v_user_type := 'team';
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(v_tenant_id::text));
    claims := jsonb_set(claims, '{user_type}', '"team"');
    claims := jsonb_set(claims, '{crm_role}',  to_jsonb(v_crm_role));
    return jsonb_set(event, '{claims}', claims);
  end if;

  -- ── Client portal user? ──────────────────────────────────────────────────
  select cu.tenant_id
    into v_tenant_id
    from client_users cu
   where cu.user_id = uid
   limit 1;

  if found then
    v_user_type := 'client';
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(v_tenant_id::text));
    claims := jsonb_set(claims, '{user_type}', '"client"');
    return jsonb_set(event, '{claims}', claims);
  end if;

  -- ── Affiliate? ───────────────────────────────────────────────────────────
  select a.affiliate_code, a.status
    into v_aff_code, v_aff_status
    from affiliates a
   where a.user_id = uid
   limit 1;

  if found then
    claims := jsonb_set(claims, '{user_type}',      '"affiliate"');
    claims := jsonb_set(claims, '{affiliate_code}', to_jsonb(v_aff_code));
    claims := jsonb_set(claims, '{aff_status}',     to_jsonb(v_aff_status));
    return jsonb_set(event, '{claims}', claims);
  end if;

  -- ── Unknown user — return claims unmodified ──────────────────────────────
  return event;
end;
$$;

-- Grant execute to the supabase_auth_admin role (required for the hook)
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

-- =============================================================================
-- SEED — Bluu Interactive as tenant #1
-- Run once after schema.sql; idempotent via ON CONFLICT DO NOTHING.
-- =============================================================================
insert into tenants (id, name, slug, plan, status, accent_colour)
values (
  '00000000-0000-0000-0000-000000000001',
  'Bluu Interactive',
  'bluu',
  'agency',
  'active',
  '#2F5FE0'
)
on conflict (slug) do nothing;
