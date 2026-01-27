import { supabase } from './supabaseClient';
import { TableMaterial, TableCoating, TableCutout } from './pageData';

// ============================================
// FETCH MATERIALS FROM DATABASE
// ============================================
export async function fetchMaterials(): Promise<TableMaterial[]> {
    const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

    if (error || !data) {
        console.error('Error fetching materials:', error);
        return [];
    }

    return data.map(mat => ({
        id: mat.slug,
        name: mat.name,
        color: mat.color,
        roughness: mat.roughness,
        metalness: mat.metalness,
        pricePerM2: mat.price_per_m2,
        textures: mat.texture_color_url ? {
            color: mat.texture_color_url,
            normal: mat.texture_normal_url || '',
            roughness: mat.texture_roughness_url || ''
        } : undefined
    }));
}

// ============================================
// FETCH COATINGS FROM DATABASE
// ============================================
export async function fetchCoatings(): Promise<TableCoating[]> {
    const { data, error } = await supabase
        .from('coatings')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

    if (error || !data) {
        console.error('Error fetching coatings:', error);
        return [];
    }

    return data.map(coat => ({
        id: coat.code || coat.id,
        name: coat.name,
        color: coat.color,
        clearcoat: coat.clearcoat,
        clearcoatRoughness: coat.clearcoat_roughness,
        pricePerM2: coat.price_per_m2
    }));
}

// ============================================
// FETCH 3D MODELS FROM DATABASE
// ============================================
export interface Model3DData {
    id: string;
    type: string;
    name: string;
    modelUrl: string;
    thumbnailUrl?: string;
    defaultWidth: number;
    defaultHeight: number;
    priceAddon: number;
}

export async function fetchModels(type?: string): Promise<Model3DData[]> {
    let query = supabase
        .from('models_3d')
        .select('*')
        .eq('is_active', true);

    if (type) {
        query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error || !data) {
        console.error('Error fetching models:', error);
        return [];
    }

    return data.map(model => ({
        id: model.id,
        type: model.type,
        name: model.name,
        modelUrl: model.model_url,
        thumbnailUrl: model.thumbnail_url,
        defaultWidth: model.default_width,
        defaultHeight: model.default_height,
        priceAddon: model.price_addon || 0
    }));
}

// ============================================
// FETCH PRICING RULES FROM DATABASE
// ============================================
export interface PricingRule {
    ruleType: string;
    ruleKey: string;
    multiplier: number;
    fixedAddon: number;
}

export async function fetchPricingRules(): Promise<PricingRule[]> {
    const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .eq('is_active', true);

    if (error || !data) {
        console.error('Error fetching pricing rules:', error);
        return [];
    }

    return data.map(rule => ({
        ruleType: rule.rule_type,
        ruleKey: rule.rule_key,
        multiplier: rule.multiplier,
        fixedAddon: rule.fixed_addon
    }));
}

// ============================================
// FETCH DELIVERY OPTIONS FROM DATABASE
// ============================================
export interface DeliveryOption {
    id: string;
    slug: string;
    name: string;
    description?: string;
    price: number;
    estimatedDays: string;
}

export async function fetchDeliveryOptions(): Promise<DeliveryOption[]> {
    const { data, error } = await supabase
        .from('delivery_options')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

    if (error || !data) {
        console.error('Error fetching delivery options:', error);
        return [];
    }

    return data.map(opt => ({
        id: opt.id,
        slug: opt.slug,
        name: opt.name,
        description: opt.description,
        price: opt.price,
        estimatedDays: opt.estimated_days
    }));
}

// ============================================
// FETCH PAYMENT METHODS FROM DATABASE
// ============================================
export interface PaymentMethod {
    id: string;
    slug: string;
    name: string;
    description?: string;
    provider: string;
}

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

    if (error || !data) {
        console.error('Error fetching payment methods:', error);
        return [];
    }

    return data.map(method => ({
        id: method.id,
        slug: method.slug,
        name: method.name,
        description: method.description,
        provider: method.provider
    }));
}

// ============================================
// FETCH SETTINGS FROM DATABASE
// ============================================
export async function fetchSettings(): Promise<Record<string, any>> {
    const { data, error } = await supabase
        .from('settings')
        .select('*');

    if (error || !data) {
        console.error('Error fetching settings:', error);
        return {};
    }

    const settings: Record<string, any> = {};
    data.forEach(s => {
        settings[s.key] = s.value;
    });
    return settings;
}

// ============================================
// CALCULATE PRICE USING DB RULES
// ============================================
export async function calculatePriceFromDB(
    material: TableMaterial,
    coating: TableCoating | null,
    width: number,
    length: number,
    thickness: number,
    shape: string,
    cutouts: TableCutout[]
): Promise<number> {
    const rules = await fetchPricingRules();

    // Base area price
    const areaM2 = (width / 100) * (length / 100);
    let price = areaM2 * material.pricePerM2;

    // Add coating price
    if (coating && coating.pricePerM2) {
        price += areaM2 * coating.pricePerM2;
    }

    // Apply thickness modifier (base is 4cm)
    const thicknessRule = rules.find(r => r.ruleType === 'thickness' && r.ruleKey === 'per_cm');
    if (thicknessRule && thickness > 4) {
        const extraCm = thickness - 4;
        price *= Math.pow(thicknessRule.multiplier, extraCm);
    }

    // Apply shape modifier
    const shapeRule = rules.find(r => r.ruleType === 'shape' && r.ruleKey === shape);
    if (shapeRule) {
        price *= shapeRule.multiplier;
        price += shapeRule.fixedAddon;
    }

    // Apply cutout prices
    for (const cutout of cutouts) {
        const cutoutRule = rules.find(r => r.ruleType === 'cutout' && r.ruleKey === cutout.type);
        if (cutoutRule) {
            price *= cutoutRule.multiplier;
            price += cutoutRule.fixedAddon;
        }
    }

    return Math.round(price);
}
