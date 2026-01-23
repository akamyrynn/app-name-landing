
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Order {
    id: number;
    created_at: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    status: 'new' | 'processing' | 'completed' | 'cancelled';
    total_price: number;
    configuration: any;
    delivery_type: string;
    payment_method: string;
}
