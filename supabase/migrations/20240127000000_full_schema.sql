-- ============================================
-- FULL DATABASE SCHEMA FOR TABLE CONFIGURATOR
-- Version 2.0 - With Settings & Pricing
-- Created: 2024-01-27
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ORDERS TABLE (Customer Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    customer_comment TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'paid', 'shipped', 'completed', 'cancelled')),
    total_price INTEGER NOT NULL,
    delivery_price INTEGER DEFAULT 0,
    configuration JSONB NOT NULL,
    -- Delivery info
    delivery_type TEXT DEFAULT 'pickup', -- pickup, courier, transport
    delivery_date DATE,
    -- Payment info
    payment_method TEXT DEFAULT 'card', -- card, cash, invoice
    payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
    payment_id TEXT, -- External payment system ID
    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- ============================================
-- 2. MATERIALS TABLE (Wood Textures)
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#8B7355',
    roughness DECIMAL(3,2) DEFAULT 0.70 CHECK (roughness >= 0 AND roughness <= 1),
    metalness DECIMAL(3,2) DEFAULT 0.00 CHECK (metalness >= 0 AND metalness <= 1),
    texture_color_url TEXT,
    texture_normal_url TEXT,
    texture_roughness_url TEXT,
    price_per_m2 INTEGER DEFAULT 15000,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(is_active, sort_order);

-- ============================================
-- 3. COATINGS TABLE (OSMO Oils)
-- ============================================
CREATE TABLE IF NOT EXISTS coatings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#F5E6D3',
    clearcoat DECIMAL(3,2) DEFAULT 0.40 CHECK (clearcoat >= 0 AND clearcoat <= 1),
    clearcoat_roughness DECIMAL(3,2) DEFAULT 0.50 CHECK (clearcoat_roughness >= 0 AND clearcoat_roughness <= 1),
    price_per_m2 INTEGER DEFAULT 2500,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coatings_active ON coatings(is_active, sort_order);

-- ============================================
-- 4. MODELS_3D TABLE (GLB Models - Sinks, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS models_3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('sink', 'faucet', 'cooktop', 'grill', 'table', 'other')),
    name TEXT NOT NULL,
    description TEXT,
    model_url TEXT NOT NULL,
    thumbnail_url TEXT,
    default_width DECIMAL(4,2) DEFAULT 0.60,
    default_height DECIMAL(4,2) DEFAULT 0.80,
    price_addon INTEGER DEFAULT 0, -- Additional price for this accessory
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_models_3d_active ON models_3d(type, is_active);

-- ============================================
-- 5. PRICING RULES TABLE (Calculation Settings)
-- ============================================
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_type TEXT NOT NULL, -- 'thickness', 'shape', 'cutout', 'size'
    rule_key TEXT NOT NULL,  -- e.g., 'round', 'trapezoid', 'sink'
    rule_name TEXT NOT NULL, -- Display name
    multiplier DECIMAL(4,2) DEFAULT 1.00, -- Price multiplier (1.15 = +15%)
    fixed_addon INTEGER DEFAULT 0, -- Fixed price addition
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rule_type, rule_key)
);

-- ============================================
-- 6. DELIVERY OPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS delivery_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- 'pickup', 'courier', 'transport'
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER DEFAULT 0, -- Base price or 0 for free
    price_per_km INTEGER DEFAULT 0, -- Price per km for distance calculation
    min_distance INTEGER DEFAULT 0, -- Minimum distance in km
    max_distance INTEGER DEFAULT 0, -- Maximum distance in km (0 = unlimited)
    estimated_days TEXT, -- e.g., "3-5 дней"
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. PAYMENT METHODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- 'card', 'cash', 'invoice', 'installment'
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Icon name or URL
    provider TEXT, -- 'stripe', 'yookassa', 'tinkoff', 'manual'
    provider_config JSONB, -- API keys, settings (encrypted in production)
    commission_percent DECIMAL(4,2) DEFAULT 0, -- Commission percentage
    min_amount INTEGER DEFAULT 0,
    max_amount INTEGER DEFAULT 0, -- 0 = unlimited
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. GENERAL SETTINGS TABLE (Key-Value Store)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. SEED DATA - Default Materials
-- ============================================
INSERT INTO materials (slug, name, color, roughness, metalness, texture_color_url, texture_normal_url, texture_roughness_url, price_per_m2, sort_order) VALUES
('wood051', 'Дуб Светлый', '#C4A77D', 0.80, 0.00, '/textures/Wood051_1K-JPG/Wood051_1K-JPG_Color.jpg', '/textures/Wood051_1K-JPG/Wood051_1K-JPG_NormalGL.jpg', '/textures/Wood051_1K-JPG/Wood051_1K-JPG_Roughness.jpg', 12000, 1),
('wood084', 'Орех Тёмный', '#5C4033', 0.70, 0.00, '/textures/Wood084B_1K-JPG/Wood084B_1K-JPG_Color.jpg', '/textures/Wood084B_1K-JPG/Wood084B_1K-JPG_NormalGL.jpg', '/textures/Wood084B_1K-JPG/Wood084B_1K-JPG_Roughness.jpg', 15000, 2),
('woodfloor048', 'Ясень Натуральный', '#A0826D', 0.60, 0.00, '/textures/WoodFloor048_1K-JPG/WoodFloor048_1K-JPG_Color.jpg', '/textures/WoodFloor048_1K-JPG/WoodFloor048_1K-JPG_NormalGL.jpg', '/textures/WoodFloor048_1K-JPG/WoodFloor048_1K-JPG_Roughness.jpg', 13000, 3),
('wood069', 'Бук Классический', '#B8956E', 0.75, 0.00, '/textures/Wood069_2K-JPG/Wood069_2K-JPG_Color.jpg', '/textures/Wood069_2K-JPG/Wood069_2K-JPG_NormalGL.jpg', '/textures/Wood069_2K-JPG/Wood069_2K-JPG_Roughness.jpg', 18000, 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 10. SEED DATA - Default Coatings
-- ============================================
INSERT INTO coatings (code, name, color, clearcoat, clearcoat_roughness, price_per_m2, sort_order) VALUES
('none', 'Без покрытия', 'transparent', 0.00, 1.00, 0, 0),
('3032', 'OSMO 3032 Бесцветный шелковистый', '#F5E6D3', 0.40, 0.50, 2500, 1),
('3062', 'OSMO 3062 Бесцветный матовый', '#EDE0CC', 0.25, 0.70, 2200, 2),
('3040', 'OSMO 3040 Белый', '#F8F4ED', 0.35, 0.50, 2800, 3),
('3067', 'OSMO 3067 Серый', '#B8B5AD', 0.40, 0.45, 2800, 4),
('3074', 'OSMO 3074 Графит', '#4A4A48', 0.50, 0.35, 3000, 5),
('3044', 'OSMO 3044 Дуб', '#C9A869', 0.40, 0.45, 2500, 6),
('3073', 'OSMO 3073 Терра', '#8B6914', 0.45, 0.40, 2800, 7),
('3075', 'OSMO 3075 Чёрный', '#1C1C1C', 0.55, 0.30, 3200, 8),
('3028', 'OSMO 3028 Кедр', '#D4A34C', 0.40, 0.45, 2500, 9)
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. SEED DATA - Default 3D Model (Sink)
-- ============================================
INSERT INTO models_3d (type, name, model_url, default_width, default_height, price_addon) VALUES
('sink', 'Кухонная мойка врезная', '/kitchen_sink.glb', 0.60, 0.80, 1500)
ON CONFLICT DO NOTHING;

-- ============================================
-- 12. SEED DATA - Pricing Rules
-- ============================================
INSERT INTO pricing_rules (rule_type, rule_key, rule_name, multiplier, fixed_addon) VALUES
-- Thickness modifiers (base is 4cm)
('thickness', 'per_cm', 'За каждый см толщины свыше 4 см', 1.05, 0),
-- Shape modifiers
('shape', 'rectangle', 'Прямоугольная форма', 1.00, 0),
('shape', 'round', 'Круглая форма', 1.15, 0),
('shape', 'trapezoid', 'Трапеция', 1.15, 0),
('shape', 'custom', 'Нестандартная форма', 1.25, 0),
-- Cutout prices
('cutout', 'sink', 'Вырез под мойку', 1.00, 1500),
('cutout', 'cooktop', 'Вырез под варочную панель', 1.00, 2000),
('cutout', 'grill', 'Вырез под гриль', 1.00, 1500),
('cutout', 'technical', 'Техническое отверстие', 1.00, 500)
ON CONFLICT (rule_type, rule_key) DO NOTHING;

-- ============================================
-- 13. SEED DATA - Delivery Options
-- ============================================
INSERT INTO delivery_options (slug, name, description, price, estimated_days, sort_order) VALUES
('pickup', 'Самовывоз', 'Бесплатный самовывоз с нашего склада в Москве', 0, '1-2 дня', 1),
('courier', 'Курьерская доставка', 'Доставка курьером по Москве и области', 2500, '2-3 дня', 2),
('transport', 'Транспортная компания', 'Доставка по всей России', 0, '5-10 дней', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 14. SEED DATA - Payment Methods
-- ============================================
INSERT INTO payment_methods (slug, name, description, provider, is_active, sort_order) VALUES
('card', 'Банковская карта', 'Оплата картой Visa, MasterCard, МИР', 'yookassa', false, 1),
('sbp', 'СБП', 'Система быстрых платежей', 'yookassa', false, 2),
('cash', 'Наличными', 'Оплата при получении', 'manual', true, 3),
('invoice', 'Счёт для юрлиц', 'Безналичный расчёт по счёту', 'manual', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 15. SEED DATA - General Settings
-- ============================================
INSERT INTO settings (key, value, description) VALUES
('company', '{"name": "TABLECRAFT", "phone": "+7 (495) 123-45-67", "email": "info@tablecraft.ru", "address": "Москва, ул. Примерная, 1"}', 'Информация о компании'),
('pricing', '{"currency": "RUB", "vat_percent": 20, "min_order_amount": 10000}', 'Настройки цен'),
('dimensions', '{"min_width": 60, "max_width": 300, "min_length": 40, "max_length": 200, "min_thickness": 2, "max_thickness": 10}', 'Ограничения размеров в см'),
('calculation', '{"base_thickness_cm": 4, "thickness_modifier_per_cm": 0.05}', 'Параметры расчёта')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- End of migration
-- ============================================
