export type UserRole = 'admin' | 'general_manager' | 'manager';
export type ItemStatus = 'available' | 'checked_out' | 'maintenance' | 'retired';
export type ItemCondition = 'new' | 'good' | 'fair' | 'poor';
export type TransactionType = 'issue' | 'return' | 'add' | 'remove' | 'adjust' | 'maintenance' | 'audit';
export type TransactionStatus = 'pending' | 'returned' | 'overdue' | 'cancelled';

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
                    avatar_url: string | null;
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
                    avatar_url?: string | null;
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
                    avatar_url?: string | null;
                    is_active?: boolean;
                    updated_at?: string;
                };
            };
            areas: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    location: string | null;
                    manager_id: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    location?: string | null;
                    manager_id?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    location?: string | null;
                    manager_id?: string | null;
                    is_active?: boolean;
                    updated_at?: string;
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
                    icon: string | null;
                    parent_id: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    color?: string | null;
                    icon?: string | null;
                    parent_id?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    color?: string | null;
                    icon?: string | null;
                    parent_id?: string | null;
                    is_active?: boolean;
                    updated_at?: string;
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
                    barcode: string | null;
                    purchase_date: string | null;
                    unit_price: number | null;
                    quantity: number;
                    min_stock_level: number;
                    max_stock_level: number | null;
                    image_url: string | null;
                    status: ItemStatus;
                    location: string | null;
                    condition: ItemCondition | null;
                    manufacturer: string | null;
                    model: string | null;
                    warranty_expiry: string | null;
                    notes: string | null;
                    is_low_stock: boolean;
                    created_by: string | null;
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
                    barcode?: string | null;
                    purchase_date?: string | null;
                    unit_price?: number | null;
                    quantity?: number;
                    min_stock_level?: number;
                    max_stock_level?: number | null;
                    image_url?: string | null;
                    status?: ItemStatus;
                    location?: string | null;
                    condition?: ItemCondition | null;
                    manufacturer?: string | null;
                    model?: string | null;
                    warranty_expiry?: string | null;
                    notes?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    category_id?: string | null;
                    area_id?: string | null;
                    serial_number?: string | null;
                    barcode?: string | null;
                    purchase_date?: string | null;
                    unit_price?: number | null;
                    quantity?: number;
                    min_stock_level?: number;
                    max_stock_level?: number | null;
                    image_url?: string | null;
                    status?: ItemStatus;
                    location?: string | null;
                    condition?: ItemCondition | null;
                    manufacturer?: string | null;
                    model?: string | null;
                    warranty_expiry?: string | null;
                    notes?: string | null;
                    updated_at?: string;
                };
            };
            inventory_transactions: {
                Row: {
                    id: string;
                    item_id: string;
                    transaction_type: TransactionType;
                    quantity: number;
                    user_id: string | null;
                    issued_by: string | null;
                    issue_date: string;
                    expected_return_date: string | null;
                    actual_return_date: string | null;
                    status: TransactionStatus;
                    purpose: string | null;
                    notes: string | null;
                    recipient_name: string | null;
                    recipient_email: string | null;
                    recipient_department: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    item_id: string;
                    transaction_type: TransactionType;
                    quantity: number;
                    user_id?: string | null;
                    issued_by?: string | null;
                    issue_date?: string;
                    expected_return_date?: string | null;
                    actual_return_date?: string | null;
                    status?: TransactionStatus;
                    purpose?: string | null;
                    notes?: string | null;
                    recipient_name?: string | null;
                    recipient_email?: string | null;
                    recipient_department?: string | null;
                    created_at?: string;
                };
                Update: {
                    transaction_type?: TransactionType;
                    quantity?: number;
                    expected_return_date?: string | null;
                    actual_return_date?: string | null;
                    status?: TransactionStatus;
                    purpose?: string | null;
                    notes?: string | null;
                    recipient_name?: string | null;
                    recipient_email?: string | null;
                    recipient_department?: string | null;
                };
            };
        };
        Functions: {
            is_admin: {
                Args: Record<string, never>;
                Returns: boolean;
            };
            is_manager_or_admin: {
                Args: Record<string, never>;
                Returns: boolean;
            };
            has_area_access: {
                Args: { area_uuid: string };
                Returns: boolean;
            };
            get_dashboard_stats: {
                Args: Record<string, never>;
                Returns: {
                    totalItems: number;
                    totalValue: number;
                    lowStockCount: number;
                    checkedOutCount: number;
                    availableCount: number;
                    maintenanceCount: number;
                    retiredCount: number;
                    uniqueItemCount: number;
                };
            };
            get_category_distribution: {
                Args: Record<string, never>;
                Returns: Array<{
                    name: string;
                    color: string;
                    count: number;
                    value: number;
                }>;
            };
            get_low_stock_items: {
                Args: { limit_count?: number };
                Returns: Array<{
                    id: string;
                    name: string;
                    current: number;
                    minimum: number;
                    category_name: string;
                    area_name: string;
                }>;
            };
            get_recent_activity: {
                Args: { limit_count?: number };
                Returns: Array<{
                    id: string;
                    action: string;
                    item_name: string;
                    user_name: string;
                    created_at: string;
                    quantity: number;
                }>;
            };
            issue_item: {
                Args: {
                    p_item_id: string;
                    p_user_id: string;
                    p_quantity: number;
                    p_expected_return_date?: string;
                    p_purpose?: string;
                    p_notes?: string;
                };
                Returns: {
                    success: boolean;
                    transaction_id?: string;
                    message?: string;
                    error?: string;
                };
            };
            return_item: {
                Args: {
                    p_transaction_id: string;
                    p_quantity?: number;
                    p_notes?: string;
                };
                Returns: {
                    success: boolean;
                    message?: string;
                    error?: string;
                };
            };
        };
    };
}

// Re-export types for convenience
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Area = Database['public']['Tables']['areas']['Row'];
export type AreaInsert = Database['public']['Tables']['areas']['Insert'];
export type AreaUpdate = Database['public']['Tables']['areas']['Update'];

export type UserArea = Database['public']['Tables']['user_areas']['Row'];

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
export type InventoryItemInsert = Database['public']['Tables']['inventory_items']['Insert'];
export type InventoryItemUpdate = Database['public']['Tables']['inventory_items']['Update'];

export type InventoryTransaction = Database['public']['Tables']['inventory_transactions']['Row'];
export type InventoryTransactionInsert = Database['public']['Tables']['inventory_transactions']['Insert'];
export type InventoryTransactionUpdate = Database['public']['Tables']['inventory_transactions']['Update'];

// Helper type for API responses
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
}
