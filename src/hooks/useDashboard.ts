import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface DashboardStats {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    checkedOutCount: number;
    availableCount: number;
    maintenanceCount: number;
    retiredCount: number;
    uniqueItemCount: number;
}

export interface CategoryDistribution {
    name: string;
    color: string;
    count: number;
    value: number;
}

export interface AreaDistribution {
    id: string;
    name: string;
    count: number;
    value: number;
}

export interface LowStockItem {
    id: string;
    name: string;
    current: number;
    minimum: number;
    category_name: string;
    area_name: string;
}

export interface RecentActivity {
    id: string;
    action: string;
    item_name: string;
    user_name: string;
    created_at: string;
    quantity: number;
}

export function useDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);
    const [areaDistribution, setAreaDistribution] = useState<AreaDistribution[]>([]);
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchDashboardStats = useCallback(async () => {
        try {
            const { data, error } = await supabase.rpc('get_dashboard_stats');

            if (error) throw error;

            setStats(data);
            return data;
        } catch (error: any) {
            console.error('Error fetching dashboard stats:', error);
            // Return default stats if function doesn't exist
            return {
                totalItems: 0,
                totalValue: 0,
                lowStockCount: 0,
                checkedOutCount: 0,
                availableCount: 0,
                maintenanceCount: 0,
                retiredCount: 0,
                uniqueItemCount: 0,
            };
        }
    }, []);

    const fetchCategoryDistribution = useCallback(async () => {
        try {
            const { data, error } = await supabase.rpc('get_category_distribution');

            if (error) throw error;

            setCategoryDistribution(data || []);
            return data || [];
        } catch (error: any) {
            console.error('Error fetching category distribution:', error);
            // Fallback: fetch manually
            try {
                const { data: categories } = await supabase
                    .from('categories')
                    .select(`
            id, name, color,
            inventory_items(quantity, unit_price)
          `)
                    .eq('is_active', true);

                const distribution = (categories || []).map((cat: any) => ({
                    name: cat.name,
                    color: cat.color || '#0D68B1',
                    count: (cat.inventory_items || []).length,
                    value: (cat.inventory_items || []).reduce(
                        (sum: number, item: any) => sum + (item.quantity * (item.unit_price || 0)),
                        0
                    ),
                }));

                setCategoryDistribution(distribution);
                return distribution;
            } catch {
                return [];
            }
        }
    }, []);

    const fetchAreaDistribution = useCallback(async () => {
        try {
            const { data: areas } = await supabase
                .from('areas')
                .select(`
                    id, name,
                    inventory_items(quantity, unit_price)
                `)
                .eq('is_active', true);

            const distribution = (areas || [])
                .map((area: any) => ({
                    id: area.id,
                    name: area.name,
                    count: (area.inventory_items || []).length,
                    value: (area.inventory_items || []).reduce(
                        (sum: number, item: any) => sum + (item.quantity * (item.unit_price || 0)),
                        0
                    ),
                }))
                .filter((a: AreaDistribution) => a.count > 0)
                .sort((a: AreaDistribution, b: AreaDistribution) => b.count - a.count)
                .slice(0, 6);

            setAreaDistribution(distribution);
            return distribution;
        } catch (error: any) {
            console.error('Error fetching area distribution:', error);
            return [];
        }
    }, []);

    const fetchLowStockItems = useCallback(async (limit = 10) => {
        try {
            const { data, error } = await supabase.rpc('get_low_stock_items', { limit_count: limit });

            if (error) throw error;

            setLowStockItems(data || []);
            return data || [];
        } catch (error: any) {
            console.error('Error fetching low stock items:', error);
            // Fallback: fetch manually
            try {
                const { data: items } = await supabase
                    .from('inventory_items')
                    .select(`
            id, name, quantity, min_stock_level,
            category:categories(name),
            area:areas(name)
          `)
                    .eq('is_low_stock', true)
                    .neq('status', 'retired')
                    .order('quantity', { ascending: true })
                    .limit(limit);

                const lowStock = (items || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    current: item.quantity,
                    minimum: item.min_stock_level,
                    category_name: item.category?.name || 'Uncategorized',
                    area_name: item.area?.name || 'Unknown',
                }));

                setLowStockItems(lowStock);
                return lowStock;
            } catch {
                return [];
            }
        }
    }, []);

    const fetchRecentActivity = useCallback(async (limit = 10) => {
        try {
            const { data, error } = await supabase.rpc('get_recent_activity', { limit_count: limit });

            if (error) throw error;

            setRecentActivity(data || []);
            return data || [];
        } catch (error: any) {
            console.error('Error fetching recent activity:', error);
            // Fallback: fetch manually
            try {
                const { data: transactions } = await supabase
                    .from('inventory_transactions')
                    .select(`
            id, transaction_type, quantity, created_at,
            item:inventory_items(name),
            user:profiles(name)
          `)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                const activity = (transactions || []).map((t: any) => ({
                    id: t.id,
                    action: t.transaction_type,
                    item_name: t.item?.name || 'Unknown Item',
                    user_name: t.user?.name || 'Unknown User',
                    created_at: t.created_at,
                    quantity: t.quantity,
                }));

                setRecentActivity(activity);
                return activity;
            } catch {
                return [];
            }
        }
    }, []);

    const fetchAllDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchDashboardStats(),
                fetchCategoryDistribution(),
                fetchAreaDistribution(),
                fetchLowStockItems(),
                fetchRecentActivity(),
            ]);
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load dashboard data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [fetchDashboardStats, fetchCategoryDistribution, fetchAreaDistribution, fetchLowStockItems, fetchRecentActivity, toast]);

    // Set up real-time subscriptions
    const setupRealtimeSubscriptions = useCallback(() => {
        const channel = supabase
            .channel('dashboard-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'inventory_items' },
                () => {
                    // Refresh stats when inventory changes
                    fetchDashboardStats();
                    fetchLowStockItems();
                    fetchCategoryDistribution();
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'inventory_transactions' },
                () => {
                    // Refresh activity when new transactions are created
                    fetchRecentActivity();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchDashboardStats, fetchLowStockItems, fetchCategoryDistribution, fetchRecentActivity]);

    // Get stock status breakdown for charts
    const getStockStatusData = useCallback(() => {
        if (!stats) return [];
        return [
            { status: 'Available', count: stats.availableCount || 0 },
            { status: 'Checked Out', count: stats.checkedOutCount || 0 },
            { status: 'Maintenance', count: stats.maintenanceCount || 0 },
            { status: 'Retired', count: stats.retiredCount || 0 },
        ];
    }, [stats]);

    return {
        stats,
        categoryDistribution,
        areaDistribution,
        lowStockItems,
        recentActivity,
        loading,
        fetchAllDashboardData,
        fetchDashboardStats,
        fetchCategoryDistribution,
        fetchAreaDistribution,
        fetchLowStockItems,
        fetchRecentActivity,
        setupRealtimeSubscriptions,
        getStockStatusData,
    };
}
