export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    role: UserRole;
                    department: string | null;
                    phone: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    name: string;
                    role?: UserRole;
                    department?: string | null;
                    phone?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    role?: UserRole;
                    department?: string | null;
                    phone?: string | null;
                    is_active?: boolean;
                    updated_at?: string;
                };
            };
            areas: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    created_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                };
            };
            user_areas: {
                Row: {
                    user_id: string;
                    area_id: string;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    area_id: string;
                    created_at?: string;
                };
                Update: {
                    user_id?: string;
                    area_id?: string;
                };
            };
            categories: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    color: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    color?: string | null;
                    created_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    color?: string | null;
                };
            };
            inventory_items: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    category_id: string | null;
                    area_id: string | null;
                    serial_number: string | null;
                    purchase_date: string | null;
                    unit_price: number | null;
                    quantity: number;
                    min_stock_level: number;
                    image_url: string | null;
                    status: 'available' | 'maintenance' | 'retired' | 'checked_out';
                    location: string | null;
                    condition: string | null;
                    manufacturer: string | null;
                    warranty_expiry: string | null;
                    is_low_stock: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    category_id?: string | null;
                    area_id?: string | null;
                    serial_number?: string | null;
                    purchase_date?: string | null;
                    unit_price?: number | null;
                    quantity?: number;
                    min_stock_level?: number;
                    image_url?: string | null;
                    status?: 'available' | 'maintenance' | 'retired' | 'checked_out';
                    location?: string | null;
                    condition?: string | null;
                    manufacturer?: string | null;
                    warranty_expiry?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    category_id?: string | null;
                    area_id?: string | null;
                    serial_number?: string | null;
                    purchase_date?: string | null;
                    unit_price?: number | null;
                    quantity?: number;
                    min_stock_level?: number;
                    image_url?: string | null;
                    status?: 'available' | 'maintenance' | 'retired' | 'checked_out';
                    updated_at?: string;
                };
            };
            inventory_transactions: {
                Row: {
                    id: string;
                    item_id: string | null;
                    user_id: string | null;
                    type: 'check_in' | 'check_out' | 'maintenance' | 'audit' | 'add' | 'remove';
                    quantity_change: number;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    item_id?: string | null;
                    user_id?: string | null;
                    type: 'check_in' | 'check_out' | 'maintenance' | 'audit' | 'add' | 'remove';
                    quantity_change: number;
                    notes?: string | null;
                    created_at?: string;
                };
                Update: {
                    notes?: string | null;
                };
            };
        };
    };
}

// Re-export types for convenience
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Area = Database['public']['Tables']['areas']['Row'];
export type UserArea = Database['public']['Tables']['user_areas']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
export type InventoryTransaction = Database['public']['Tables']['inventory_transactions']['Row'];
