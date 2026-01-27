-- =============================================
-- ЕДИНЫЙ ФАЙЛ МИГРАЦИИ - ВЫПОЛНИ ТОЛЬКО ЭТОТ!
-- =============================================

-- 1. Удаляем старые таблицы если есть
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS coatings CASCADE;
DROP TABLE IF EXISTS models_3d CASCADE;
DROP TABLE IF EXISTS pricing_rules CASCADE;
DROP TABLE IF EXISTS delivery_options CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 2. Включаем UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Таблица заказов
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    total_price INTEGER NOT NULL,
    configuration JSONB NOT NULL
);

-- 4. Таблица материалов
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#8B7355',
    roughness DECIMAL DEFAULT 0.70,
    metalness DECIMAL DEFAULT 0.00,
    texture_color_url TEXT,
    texture_normal_url TEXT,
    texture_roughness_url TEXT,
    price_per_m2 INTEGER DEFAULT 15000,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Таблица покрытий
CREATE TABLE coatings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT,
    color TEXT DEFAULT '#F5E6D3',
    clearcoat DECIMAL DEFAULT 0.40,
    clearcoat_roughness DECIMAL DEFAULT 0.50,
    price_per_m2 INTEGER DEFAULT 2500,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Таблица 3D моделей
CREATE TABLE models_3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    model_url TEXT NOT NULL,
    thumbnail_url TEXT,
    default_width DECIMAL DEFAULT 0.60,
    default_height DECIMAL DEFAULT 0.80,
    price_addon INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Таблица правил расчета цен
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_type TEXT NOT NULL,
    rule_key TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    multiplier DECIMAL DEFAULT 1.00,
    fixed_addon INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(rule_type, rule_key)
);

-- 8. Таблица доставки
CREATE TABLE delivery_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER DEFAULT 0,
    estimated_days TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- 9. Таблица оплаты
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    provider TEXT DEFAULT 'manual',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- 10. Таблица настроек
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT
);

-- =============================================
-- ВСТАВКА НАЧАЛЬНЫХ ДАННЫХ
-- =============================================

-- Материалы (текстуры лежат локально в /public/textures/)
INSERT INTO materials (slug, name, color, roughness, texture_color_url, texture_normal_url, texture_roughness_url, price_per_m2, sort_order) VALUES
('wood051', 'Дуб Светлый', '#C4A77D', 0.80, '/textures/Wood051_1K-JPG/Wood051_1K-JPG_Color.jpg', '/textures/Wood051_1K-JPG/Wood051_1K-JPG_NormalGL.jpg', '/textures/Wood051_1K-JPG/Wood051_1K-JPG_Roughness.jpg', 12000, 1),
('wood084', 'Орех Тёмный', '#5C4033', 0.70, '/textures/Wood084B_1K-JPG/Wood084B_1K-JPG_Color.jpg', '/textures/Wood084B_1K-JPG/Wood084B_1K-JPG_NormalGL.jpg', '/textures/Wood084B_1K-JPG/Wood084B_1K-JPG_Roughness.jpg', 15000, 2),
('woodfloor048', 'Ясень Натуральный', '#A0826D', 0.60, '/textures/WoodFloor048_1K-JPG/WoodFloor048_1K-JPG_Color.jpg', '/textures/WoodFloor048_1K-JPG/WoodFloor048_1K-JPG_NormalGL.jpg', '/textures/WoodFloor048_1K-JPG/WoodFloor048_1K-JPG_Roughness.jpg', 13000, 3),
('wood069', 'Бук Классический', '#B8956E', 0.75, '/textures/Wood069_2K-JPG/Wood069_2K-JPG_Color.jpg', '/textures/Wood069_2K-JPG/Wood069_2K-JPG_NormalGL.jpg', '/textures/Wood069_2K-JPG/Wood069_2K-JPG_Roughness.jpg', 18000, 4);

-- Покрытия OSMO
INSERT INTO coatings (code, name, color, clearcoat, clearcoat_roughness, price_per_m2, sort_order) VALUES
('none', 'Без покрытия', 'transparent', 0.00, 1.00, 0, 0),
('3032', 'OSMO 3032', '#F5E6D3', 0.40, 0.50, 2500, 1),
('3062', 'OSMO 3062', '#EDE0CC', 0.25, 0.70, 2200, 2),
('3040', 'OSMO 3040', '#F8F4ED', 0.35, 0.50, 2800, 3),
('3067', 'OSMO 3067', '#B8B5AD', 0.40, 0.45, 2800, 4),
('3074', 'OSMO 3074', '#4A4A48', 0.50, 0.35, 3000, 5),
('3044', 'OSMO 3044', '#C9A869', 0.40, 0.45, 2500, 6),
('3073', 'OSMO 3073', '#8B6914', 0.45, 0.40, 2800, 7),
('3075', 'OSMO 3075', '#1C1C1C', 0.55, 0.30, 3200, 8),
('3028', 'OSMO 3028', '#D4A34C', 0.40, 0.45, 2500, 9);

-- 3D Модель мойки (лежит локально в /public/)
INSERT INTO models_3d (type, name, model_url, default_width, default_height, price_addon) VALUES
('sink', 'Кухонная мойка', '/kitchen_sink.glb', 0.60, 0.80, 1500);

-- Правила расчёта цен
INSERT INTO pricing_rules (rule_type, rule_key, rule_name, multiplier, fixed_addon) VALUES
('shape', 'rectangle', 'Прямоугольная форма', 1.00, 0),
('shape', 'round', 'Круглая форма', 1.15, 0),
('shape', 'trapezoid', 'Трапеция', 1.15, 0),
('cutout', 'sink', 'Вырез под мойку', 1.00, 1500),
('cutout', 'cooktop', 'Вырез под варочную панель', 1.00, 2000);

-- Доставка
INSERT INTO delivery_options (slug, name, description, price, estimated_days, sort_order) VALUES
('pickup', 'Самовывоз', 'Бесплатно с нашего склада', 0, '1-2 дня', 1),
('courier', 'Курьер по Москве', 'Доставка курьером', 2500, '2-3 дня', 2),
('transport', 'Транспортная компания', 'По всей России', 0, '5-10 дней', 3);

-- Оплата
INSERT INTO payment_methods (slug, name, description, provider, is_active, sort_order) VALUES
('cash', 'Наличными', 'Оплата при получении', 'manual', true, 1),
('invoice', 'Счёт для юрлиц', 'Безналичный расчёт', 'manual', true, 2),
('card', 'Банковская карта', 'Оплата онлайн', 'yookassa', false, 3);

-- Настройки
INSERT INTO settings (key, value, description) VALUES
('company', '{"name": "TABLECRAFT", "phone": "+7 (495) 123-45-67"}', 'Информация о компании'),
('dimensions', '{"min_width": 60, "max_width": 300, "min_length": 40, "max_length": 200}', 'Ограничения размеров');

-- ГОТОВО!
