-- Supabase Auth bootstrap and role administration for Open Shop.
-- Run or re-run in Supabase Dashboard > SQL Editor before opening public sign-up.
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

CREATE TABLE IF NOT EXISTS public.seller_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
    slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    category TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    tone TEXT NOT NULL DEFAULT 'seller-blue'
        CHECK (tone IN ('seller-blue', 'seller-sand', 'seller-coral', 'seller-lilac', 'seller-mint')),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION private.touch_seller_store_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.touch_seller_store_updated_at() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS seller_stores_set_updated_at ON public.seller_stores;
CREATE TRIGGER seller_stores_set_updated_at
    BEFORE UPDATE ON public.seller_stores
    FOR EACH ROW EXECUTE FUNCTION private.touch_seller_store_updated_at();

ALTER TABLE public.seller_stores ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.seller_stores FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, name, slug, category, location, description, tone, status)
    ON TABLE public.seller_stores TO anon;
GRANT SELECT ON TABLE public.seller_stores TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.seller_stores TO authenticated;

-- Import the storefront's existing demo stores once so they can be managed here.
INSERT INTO public.seller_stores (name, slug, category, location, description, tone, status)
VALUES
    ('Northstar Goods', 'northstar-goods', 'Style for the everyday', 'Gasabo District, City of Kigali', 'Thoughtful everyday accessories and footwear, selected for quality, comfort, and lasting value.', 'seller-blue', 'active'),
    ('Wander & Co', 'wander-and-co', 'Bags for going places', 'Musanze District, Northern Province', 'Practical bags and travel pieces for the trips you plan and the errands you do every day.', 'seller-sand', 'active'),
    ('Thread Theory', 'thread-theory', 'Easy-to-wear clothing', 'Nyarugenge District, City of Kigali', 'Comfortable wardrobe staples in breathable fabrics and relaxed, wearable cuts.', 'seller-coral', 'active'),
    ('Clay House Studio', 'clay-house-studio', 'Hand-finished homewares', 'Huye District, Southern Province', 'Small-batch ceramics and home accents made to bring a little warmth to your space.', 'seller-lilac', 'active'),
    ('Bright Audio', 'bright-audio', 'Sound for every day', 'Rubavu District, Western Province', 'Useful audio gear with dependable sound for work, play, and everything between.', 'seller-mint', 'active'),
    ('Kigali Property Hub', 'kigali-property-hub', 'Homes, land, and commercial listings', 'Gasabo District, City of Kigali', 'A Kigali based property marketplace for homes, plots, rentals, and commercial listings across Rwanda.', 'seller-blue', 'active'),
    ('Imbuto Hardware & Building', 'imbuto-hardware-and-building', 'Quincaillerie and building materials', 'Nyarugenge District, City of Kigali', 'Construction supplies, tools, plumbing, and finishing materials for home projects and building sites.', 'seller-sand', 'active'),
    ('Isoko Fresh Foods', 'isoko-fresh-foods', 'Local groceries and pantry goods', 'Kicukiro District, City of Kigali', 'Fresh produce and pantry staples sourced from Rwanda growers and local food makers.', 'seller-mint', 'active'),
    ('Mera Home & Living', 'mera-home-and-living', 'Furniture and home appliances', 'Gasabo District, City of Kigali', 'Useful home furnishings and appliances, with delivery arrangements available across Rwanda.', 'seller-lilac', 'active'),
    ('Afya & Beauty', 'afya-and-beauty', 'Personal care and beauty', 'Nyarugenge District, City of Kigali', 'Everyday personal care, locally made body products, and selected beauty essentials.', 'seller-coral', 'active'),
    ('Little Steps Rwanda', 'little-steps-rwanda', 'Baby, children, and learning', 'Gasabo District, City of Kigali', 'Comfortable children''s clothing, toys, and practical essentials for growing families.', 'seller-sand', 'active'),
    ('OfficePlus Kigali', 'officeplus-kigali', 'Books, stationery, and office', 'Gasabo District, City of Kigali', 'Stationery, study essentials, and practical equipment for home and office.', 'seller-blue', 'active'),
    ('Rwanda Auto Parts', 'rwanda-auto-parts', 'Vehicle parts and accessories', 'Kicukiro District, City of Kigali', 'Vehicle maintenance products and parts. Confirm fitment and specifications before purchase.', 'seller-coral', 'active'),
    ('Kivu Outdoor', 'kivu-outdoor', 'Sport and outdoor gear', 'Rubavu District, Western Province', 'Practical gear for exercise, cycling, hiking, and exploring Rwanda outdoors.', 'seller-mint', 'active'),
    ('Umurava Farm Supply', 'umurava-farm-supply', 'Agricultural tools and inputs', 'Rwamagana District, Eastern Province', 'Seeds, irrigation supplies, and farm essentials for growers and small agricultural businesses.', 'seller-sand', 'active'),
    ('Akazi Crafts Collective', 'akazi-crafts', 'Handmade crafts and gifts', 'Nyarugenge District, City of Kigali', 'Handmade woven baskets, locally crafted gifts, and decorative pieces from Rwanda artisans.', 'seller-lilac', 'active'),
    ('Green Hills Organics', 'green-hills-organics', 'Fresh produce and pantry goods', 'Musanze District, Northern Province', 'Seasonal produce, herbs, and pantry goods sourced from smallholder farms.', 'seller-mint', 'active'),
    ('Ubumwe Cycle Works', 'ubumwe-cycle-works', 'Bicycles and cycle repairs', 'Gasabo District, City of Kigali', 'Bicycles, repair parts, and practical accessories for commuting and weekend rides.', 'seller-blue', 'active'),
    ('Umucyo Stationery', 'umucyo-stationery', 'School and office supplies', 'Huye District, Southern Province', 'School supplies, paper goods, art materials, and practical office essentials.', 'seller-sand', 'active'),
    ('Lakeview Kitchen & Table', 'lakeview-kitchen-table', 'Kitchen and tableware', 'Rubavu District, Western Province', 'Kitchen tools, tableware, and thoughtful essentials for everyday cooking and hosting.', 'seller-coral', 'active')
ON CONFLICT (slug) DO NOTHING;

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

DROP POLICY IF EXISTS "Public read active seller stores" ON public.seller_stores;
CREATE POLICY "Public read active seller stores"
    ON public.seller_stores FOR SELECT TO anon, authenticated
    USING (status = 'active');

DROP POLICY IF EXISTS "Super admins read all seller stores" ON public.seller_stores;
CREATE POLICY "Super admins read all seller stores"
    ON public.seller_stores FOR SELECT TO authenticated
    USING ((SELECT private.current_user_is_super_admin()));

DROP POLICY IF EXISTS "Super admins create seller stores" ON public.seller_stores;
CREATE POLICY "Super admins create seller stores"
    ON public.seller_stores FOR INSERT TO authenticated
    WITH CHECK ((SELECT private.current_user_is_super_admin()));

DROP POLICY IF EXISTS "Super admins update seller stores" ON public.seller_stores;
CREATE POLICY "Super admins update seller stores"
    ON public.seller_stores FOR UPDATE TO authenticated
    USING ((SELECT private.current_user_is_super_admin()))
    WITH CHECK ((SELECT private.current_user_is_super_admin()));

DROP POLICY IF EXISTS "Super admins delete seller stores" ON public.seller_stores;
CREATE POLICY "Super admins delete seller stores"
    ON public.seller_stores FOR DELETE TO authenticated
    USING ((SELECT private.current_user_is_super_admin()));

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
