-- Supabase Auth bootstrap and role administration for Open Shop.
-- Run this once in Supabase Dashboard > SQL Editor before opening public sign-up.
-- Roles are stored in public.profiles, never in user-editable Auth user metadata.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'client'
        CHECK (role IN ('super_admin', 'seller', 'client')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON TABLE public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users read their own profile" ON public.profiles;
CREATE POLICY "Users read their own profile"
    ON public.profiles FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users update their own contact details" ON public.profiles;
CREATE POLICY "Users update their own contact details"
    ON public.profiles FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

CREATE TABLE IF NOT EXISTS private.signup_role_counter (
    singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
    registration_count BIGINT NOT NULL CHECK (registration_count >= 0)
);

CREATE TABLE IF NOT EXISTS private.role_change_guard (
    singleton BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton)
);

INSERT INTO private.role_change_guard(singleton)
VALUES (TRUE)
ON CONFLICT (singleton) DO NOTHING;

-- Backfill existing Auth accounts deterministically before accepting new signups.
WITH ranked_auth_users AS (
    SELECT
        id,
        COALESCE(raw_user_meta_data ->> 'full_name', '') AS full_name,
        ROW_NUMBER() OVER (ORDER BY created_at, id) AS signup_number
    FROM auth.users
)
INSERT INTO public.profiles (id, full_name, role)
SELECT
    id,
    full_name,
    CASE signup_number
        WHEN 1 THEN 'super_admin'
        WHEN 2 THEN 'seller'
        ELSE 'client'
    END
FROM ranked_auth_users
ON CONFLICT (id) DO NOTHING;

INSERT INTO private.signup_role_counter (singleton, registration_count)
SELECT TRUE, COUNT(*) FROM auth.users
ON CONFLICT (singleton) DO NOTHING;

CREATE OR REPLACE FUNCTION private.handle_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    signup_number BIGINT;
    assigned_role TEXT;
BEGIN
    UPDATE private.signup_role_counter
       SET registration_count = registration_count + 1
     WHERE singleton = TRUE
     RETURNING registration_count INTO signup_number;

    IF signup_number IS NULL THEN
        RAISE EXCEPTION 'Open Shop signup role counter is not initialized';
    END IF;

    assigned_role := CASE signup_number
        WHEN 1 THEN 'super_admin'
        WHEN 2 THEN 'seller'
        ELSE 'client'
    END;

    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        assigned_role
    );

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.handle_auth_user_created() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_open_shop ON auth.users;
CREATE TRIGGER on_auth_user_created_open_shop
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION private.handle_auth_user_created();

CREATE OR REPLACE FUNCTION private.current_user_is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = (SELECT auth.uid())
          AND role = 'super_admin'
    );
$$;

REVOKE ALL ON FUNCTION private.current_user_is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_user_is_super_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT private.current_user_is_super_admin() THEN
        RAISE EXCEPTION 'Only a super admin can list user accounts'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT
        auth_user.id,
        auth_user.email::TEXT,
        profile.full_name,
        profile.role,
        auth_user.created_at
    FROM auth.users AS auth_user
    JOIN public.profiles AS profile ON profile.id = auth_user.id
    ORDER BY auth_user.created_at, auth_user.id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    current_target_role TEXT;
    super_admin_count BIGINT;
BEGIN
    IF new_role NOT IN ('super_admin', 'seller', 'client') THEN
        RAISE EXCEPTION 'Unsupported account role';
    END IF;

    -- Serialize role changes so concurrent requests cannot remove the final super admin.
    PERFORM singleton
    FROM private.role_change_guard
    WHERE singleton = TRUE
    FOR UPDATE;

    IF NOT private.current_user_is_super_admin() THEN
        RAISE EXCEPTION 'Only a super admin can manage account roles'
            USING ERRCODE = '42501';
    END IF;

    SELECT profile.role INTO current_target_role
    FROM public.profiles AS profile
    WHERE profile.id = target_user_id
    FOR UPDATE;

    IF current_target_role IS NULL THEN
        RAISE EXCEPTION 'User account was not found';
    END IF;

    IF current_target_role = 'super_admin' AND new_role <> 'super_admin' THEN
        SELECT COUNT(*) INTO super_admin_count
        FROM public.profiles
        WHERE role = 'super_admin';

        IF super_admin_count <= 1 THEN
            RAISE EXCEPTION 'The last super admin cannot be demoted';
        END IF;
    END IF;

    UPDATE public.profiles
       SET role = new_role,
           updated_at = NOW()
     WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_user_role(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) TO authenticated;

COMMIT;
