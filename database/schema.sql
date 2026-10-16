    -- Open Shop database schema
    -- PostgreSQL 15+
    -- Run with: psql "$DATABASE_URL" -f database/schema.sql
    -- Product and campaign images should be stored in object storage; save their URLs here.

    BEGIN;

    CREATE TABLE IF NOT EXISTS users (
        id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        email               TEXT NOT NULL UNIQUE,
        password_hash       TEXT NOT NULL,
        full_name           TEXT NOT NULL,
        phone               TEXT,
        role                TEXT NOT NULL DEFAULT 'customer'
                                CHECK (role IN ('customer', 'seller', 'admin')),
        email_verified_at   TIMESTAMPTZ,
        is_active           BOOLEAN NOT NULL DEFAULT TRUE,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS districts (
        id          SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name        TEXT NOT NULL UNIQUE,
        province    TEXT NOT NULL
    );

    INSERT INTO districts (name, province) VALUES
        ('Gasabo', 'City of Kigali'), ('Kicukiro', 'City of Kigali'), ('Nyarugenge', 'City of Kigali'),
        ('Bugesera', 'Eastern Province'), ('Gatsibo', 'Eastern Province'), ('Kayonza', 'Eastern Province'),
        ('Kirehe', 'Eastern Province'), ('Ngoma', 'Eastern Province'), ('Nyagatare', 'Eastern Province'), ('Rwamagana', 'Eastern Province'),
        ('Burera', 'Northern Province'), ('Gakenke', 'Northern Province'), ('Gicumbi', 'Northern Province'), ('Musanze', 'Northern Province'), ('Rulindo', 'Northern Province'),
        ('Gisagara', 'Southern Province'), ('Huye', 'Southern Province'), ('Kamonyi', 'Southern Province'), ('Muhanga', 'Southern Province'),
        ('Nyamagabe', 'Southern Province'), ('Nyanza', 'Southern Province'), ('Nyaruguru', 'Southern Province'), ('Ruhango', 'Southern Province'),
        ('Karongi', 'Western Province'), ('Ngororero', 'Western Province'), ('Nyabihu', 'Western Province'), ('Nyamasheke', 'Western Province'),
        ('Rubavu', 'Western Province'), ('Rusizi', 'Western Province'), ('Rutsiro', 'Western Province')
    ON CONFLICT (name) DO NOTHING;

    CREATE TABLE IF NOT EXISTS categories (
        id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name        TEXT NOT NULL UNIQUE,
        slug        TEXT NOT NULL UNIQUE,
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        sort_order  INTEGER NOT NULL DEFAULT 0
    );

    INSERT INTO categories (name, slug, sort_order) VALUES
        ('Real Estate', 'real-estate', 1),
        ('Quincaillerie & Construction', 'quincaillerie-construction', 2),
        ('Accessories', 'accessories', 3), ('Agriculture', 'agriculture', 4), ('Automotive', 'automotive', 5),
        ('Baby & Kids', 'baby-kids', 6), ('Books & Office', 'books-office', 7), ('Clothing', 'clothing', 8),
        ('Fashion', 'fashion', 9), ('Food & Groceries', 'food-groceries', 10), ('Furniture', 'furniture', 11),
        ('Health & Beauty', 'health-beauty', 12), ('Home & Decor', 'home-decor', 13), ('Home Appliances', 'home-appliances', 14),
        ('Music', 'music', 15), ('Phones & Electronics', 'phones-electronics', 16), ('Services', 'services', 17),
        ('Shoes', 'shoes', 18), ('Sports & Outdoors', 'sports-outdoors', 19)
    ON CONFLICT (slug) DO NOTHING;

    CREATE TABLE IF NOT EXISTS stores (
        id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        owner_user_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
        name            TEXT NOT NULL,
        slug            TEXT NOT NULL UNIQUE,
        description     TEXT NOT NULL DEFAULT '',
        category_label  TEXT,
        district_id     SMALLINT REFERENCES districts(id) ON DELETE SET NULL,
        address         TEXT,
        logo_url        TEXT,
        cover_image_url TEXT,
        contact_email   TEXT,
        contact_phone   TEXT,
        status          TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
        approved_at     TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS store_categories (
        store_id    BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
        category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (store_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS products (
        id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        store_id            BIGINT REFERENCES stores(id) ON DELETE SET NULL,
        category_id         BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        slug                TEXT NOT NULL UNIQUE,
        name                TEXT NOT NULL,
        description         TEXT NOT NULL DEFAULT '',
        price_rwf           BIGINT NOT NULL CHECK (price_rwf >= 0),
        old_price_rwf       BIGINT CHECK (old_price_rwf IS NULL OR old_price_rwf >= 0),
        price_unit          TEXT CHECK (price_unit IS NULL OR price_unit IN ('sale', 'month')),
        stock_quantity      INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
        listing_type        TEXT,
        property_type       TEXT,
        district_id         SMALLINT REFERENCES districts(id) ON DELETE SET NULL,
        bedrooms            SMALLINT CHECK (bedrooms IS NULL OR bedrooms >= 0),
        bathrooms           SMALLINT CHECK (bathrooms IS NULL OR bathrooms >= 0),
        area_sqm            NUMERIC(12,2) CHECK (area_sqm IS NULL OR area_sqm >= 0),
        attributes          JSONB NOT NULL DEFAULT '{}'::JSONB,
        badge               TEXT,
        status              TEXT NOT NULL DEFAULT 'active'
                                CHECK (status IN ('draft', 'active', 'out_of_stock', 'archived')),
        average_rating      NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (average_rating BETWEEN 0 AND 5),
        review_count        INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS product_images (
        id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url   TEXT NOT NULL,
        alt_text    TEXT NOT NULL DEFAULT '',
        sort_order  SMALLINT NOT NULL DEFAULT 0,
        is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (product_id, sort_order)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS product_images_one_primary_idx
        ON product_images(product_id) WHERE is_primary;

    CREATE TABLE IF NOT EXISTS inventory_movements (
        id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        changed_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
        quantity_delta  INTEGER NOT NULL CHECK (quantity_delta <> 0),
        reason          TEXT NOT NULL,
        reference        TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS product_reviews (
        id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
        author_name TEXT NOT NULL,
        rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        title       TEXT,
        body        TEXT NOT NULL DEFAULT '',
        status      TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden')),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS customer_addresses (
        id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_name  TEXT NOT NULL,
        phone           TEXT NOT NULL,
        address_line    TEXT NOT NULL,
        sector          TEXT,
        district_id     SMALLINT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
        country         TEXT NOT NULL DEFAULT 'Rwanda',
        delivery_notes  TEXT,
        is_default      BOOLEAN NOT NULL DEFAULT FALSE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS customer_addresses_one_default_idx
        ON customer_addresses(user_id) WHERE is_default;

    CREATE TABLE IF NOT EXISTS shopping_carts (
        id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
        session_key     TEXT UNIQUE,
        coupon_code     TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (user_id IS NOT NULL OR session_key IS NOT NULL)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
        id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        cart_id         BIGINT NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
        product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity        INTEGER NOT NULL CHECK (quantity > 0),
        selected_color  TEXT NOT NULL DEFAULT '',
        selected_size   TEXT NOT NULL DEFAULT '',
        added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (cart_id, product_id, selected_color, selected_size)
    );

    CREATE TABLE IF NOT EXISTS wishlists (
        user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS coupons (
        id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        code                TEXT NOT NULL UNIQUE,
        description         TEXT NOT NULL,
        discount_type       TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'free-shipping')),
        discount_value      BIGINT NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
        minimum_spend_rwf   BIGINT NOT NULL DEFAULT 0 CHECK (minimum_spend_rwf >= 0),
        maximum_discount_rwf BIGINT CHECK (maximum_discount_rwf IS NULL OR maximum_discount_rwf >= 0),
        starts_at           TIMESTAMPTZ,
        expires_at          TIMESTAMPTZ,
        usage_limit         INTEGER CHECK (usage_limit IS NULL OR usage_limit >= 0),
        usage_count         INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
        active              BOOLEAN NOT NULL DEFAULT TRUE,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (expires_at IS NULL OR starts_at IS NULL OR expires_at >= starts_at),
        CHECK (discount_type <> 'percent' OR discount_value <= 100),
        CHECK (discount_type <> 'free-shipping' OR discount_value = 0)
    );

    CREATE TABLE IF NOT EXISTS coupon_categories (
        coupon_id   BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (coupon_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS orders (
        id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        reference           TEXT NOT NULL UNIQUE,
        customer_user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
        coupon_id           BIGINT REFERENCES coupons(id) ON DELETE SET NULL,
        coupon_code         TEXT,
        customer_name       TEXT NOT NULL,
        customer_email      TEXT NOT NULL,
        customer_phone      TEXT NOT NULL,
        delivery_address    TEXT NOT NULL,
        sector              TEXT NOT NULL,
        district_id         SMALLINT REFERENCES districts(id) ON DELETE SET NULL,
        country             TEXT NOT NULL DEFAULT 'Rwanda',
        delivery_notes      TEXT,
        currency            CHAR(3) NOT NULL DEFAULT 'RWF' CHECK (currency = 'RWF'),
        subtotal_rwf        BIGINT NOT NULL CHECK (subtotal_rwf >= 0),
        shipping_rwf        BIGINT NOT NULL DEFAULT 0 CHECK (shipping_rwf >= 0),
        discount_rwf        BIGINT NOT NULL DEFAULT 0 CHECK (discount_rwf >= 0),
        shipping_discount_rwf BIGINT NOT NULL DEFAULT 0 CHECK (shipping_discount_rwf >= 0),
        total_rwf           BIGINT NOT NULL CHECK (total_rwf >= 0),
        payment_method      TEXT NOT NULL DEFAULT 'pay-on-delivery',
        payment_status      TEXT NOT NULL DEFAULT 'pending'
                                CHECK (payment_status IN ('pending', 'authorized', 'paid', 'failed', 'refunded')),
        status              TEXT NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
        placed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (total_rwf = subtotal_rwf - discount_rwf + shipping_rwf - shipping_discount_rwf)
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        order_id            BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id          BIGINT REFERENCES products(id) ON DELETE SET NULL,
        store_id            BIGINT REFERENCES stores(id) ON DELETE SET NULL,
        product_name        TEXT NOT NULL,
        product_slug        TEXT,
        category_name       TEXT,
        selected_options    JSONB NOT NULL DEFAULT '{}'::JSONB,
        quantity            INTEGER NOT NULL CHECK (quantity > 0),
        unit_price_rwf      BIGINT NOT NULL CHECK (unit_price_rwf >= 0),
        line_total_rwf      BIGINT NOT NULL CHECK (line_total_rwf >= 0),
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_transactions (
        id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        order_id            BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        provider            TEXT NOT NULL,
        provider_reference  TEXT UNIQUE,
        amount_rwf          BIGINT NOT NULL CHECK (amount_rwf >= 0),
        status              TEXT NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'authorized', 'paid', 'failed', 'refunded')),
        metadata            JSONB NOT NULL DEFAULT '{}'::JSONB,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS coupon_redemptions (
        id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        coupon_id           BIGINT NOT NULL REFERENCES coupons(id) ON DELETE RESTRICT,
        order_id            BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
        customer_user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
        discount_rwf        BIGINT NOT NULL DEFAULT 0 CHECK (discount_rwf >= 0),
        redeemed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS seller_applications (
        id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        applicant_name      TEXT NOT NULL,
        store_name          TEXT NOT NULL,
        email               TEXT NOT NULL,
        district_id         SMALLINT REFERENCES districts(id) ON DELETE SET NULL,
        product_category    TEXT NOT NULL,
        about               TEXT NOT NULL DEFAULT '',
        status              TEXT NOT NULL DEFAULT 'new'
                                CHECK (status IN ('new', 'contacted', 'approved', 'declined')),
        reviewed_by         BIGINT REFERENCES users(id) ON DELETE SET NULL,
        submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewed_at         TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS ad_campaigns (
        id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name                TEXT NOT NULL,
        headline            TEXT NOT NULL,
        message             TEXT NOT NULL DEFAULT '',
        cta_text            TEXT NOT NULL DEFAULT 'Shop now',
        destination_url     TEXT NOT NULL DEFAULT '/shop',
        image_url           TEXT,
        youtube_url         TEXT,
        placement           TEXT NOT NULL CHECK (placement IN (
                                'global', 'side_left', 'side_right', 'after_departments', 'after_popular',
                                'product_grid', 'product_detail', 'video_home', 'video_product'
                            )),
        active              BOOLEAN NOT NULL DEFAULT TRUE,
        starts_at           TIMESTAMPTZ,
        ends_at             TIMESTAMPTZ,
        display_order       INTEGER NOT NULL DEFAULT 0,
        created_by          BIGINT REFERENCES users(id) ON DELETE SET NULL,
        created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (
            (placement NOT IN ('video_home', 'video_product') AND youtube_url IS NULL)
            OR
            (placement IN ('video_home', 'video_product') AND youtube_url IS NOT NULL AND youtube_url ~* '^(https://((www|m)\.)?youtube(-nocookie)?\.com/(watch\?v=|shorts/|live/|embed/)|https://(www\.)?youtu\.be/)')
        ),
        CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
    );

    CREATE TABLE IF NOT EXISTS site_settings (
        setting_key TEXT PRIMARY KEY,
        value       JSONB NOT NULL,
        updated_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS journal_articles (
        id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        author_user_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
        title           TEXT NOT NULL,
        slug            TEXT NOT NULL UNIQUE,
        excerpt         TEXT NOT NULL DEFAULT '',
        body            TEXT NOT NULL DEFAULT '',
        hero_image_url  TEXT,
        status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        published_at    TIMESTAMPTZ,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
        id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        sender_name     TEXT NOT NULL,
        sender_email    TEXT NOT NULL,
        district_id     SMALLINT REFERENCES districts(id) ON DELETE SET NULL,
        topic           TEXT NOT NULL,
        message         TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'spam')),
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at     TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        email           TEXT NOT NULL UNIQUE,
        status          TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
        subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        unsubscribed_at TIMESTAMPTZ
    );

    CREATE INDEX IF NOT EXISTS products_category_status_idx ON products(category_id, status);
    CREATE INDEX IF NOT EXISTS products_store_status_idx ON products(store_id, status);
    CREATE INDEX IF NOT EXISTS products_created_at_idx ON products(created_at DESC);
    CREATE INDEX IF NOT EXISTS product_reviews_product_status_idx ON product_reviews(product_id, status);
    CREATE INDEX IF NOT EXISTS inventory_movements_product_created_idx ON inventory_movements(product_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS orders_customer_placed_idx ON orders(customer_user_id, placed_at DESC);
    CREATE INDEX IF NOT EXISTS orders_status_placed_idx ON orders(status, placed_at DESC);
    CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS payment_transactions_order_created_idx ON payment_transactions(order_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS seller_applications_status_idx ON seller_applications(status, submitted_at DESC);
    CREATE INDEX IF NOT EXISTS ad_campaigns_placement_active_idx ON ad_campaigns(placement, active, display_order);
    CREATE INDEX IF NOT EXISTS journal_articles_status_published_idx ON journal_articles(status, published_at DESC);
    CREATE INDEX IF NOT EXISTS contact_messages_status_created_idx ON contact_messages(status, created_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS shopping_carts_one_per_user_idx
        ON shopping_carts(user_id) WHERE user_id IS NOT NULL;

    COMMIT;