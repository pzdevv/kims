import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface CategoryStats {
    name: string;
    value: number;
    count: number;
    color: string;
}

export interface MonthlyTransactionStats {
    month: string;
    issues: number;
    returns: number;
    uses: number;
}

export interface TopItem {
    name: string;
    count: number;
}

export interface ReportSummary {
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    currentlyIssued: number;
    overdueCount: number;
    returnRate: number;
}

export interface ReportFilters {
    dateFrom?: string;
    dateTo?: string;
    categoryId?: string;
    areaId?: string;
}

export function useReports() {
    const [loading, setLoading] = useState(false);
    const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyTransactionStats[]>([]);
    const [topItems, setTopItems] = useState<TopItem[]>([]);
    const [summary, setSummary] = useState<ReportSummary>({
        totalItems: 0,
        totalValue: 0,
        lowStockCount: 0,
        currentlyIssued: 0,
        overdueCount: 0,
        returnRate: 0,
    });
    const { toast } = useToast();

    // Fetch category statistics
    const fetchCategoryStats = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('inventory_items')
                .select(`
          category_id,
          quantity,
          unit_price,
          categories(name, color)
        `);

            if (error) throw error;

            // Group by category
            const categoryMap = new Map<string, { name: string; value: number; count: number; color: string }>();

            (data || []).forEach((item: any) => {
                const catName = item.categories?.name || 'Uncategorized';
                const catColor = item.categories?.color || '#64748B';
                const existing = categoryMap.get(catName);
                const itemValue = (item.quantity || 0) * (item.unit_price || 0);

                if (existing) {
                    existing.value += itemValue;
                    existing.count += item.quantity || 0;
                } else {
                    categoryMap.set(catName, {
                        name: catName,
                        value: itemValue,
                        count: item.quantity || 0,
                        color: catColor,
                    });
                }
            });

            setCategoryStats(Array.from(categoryMap.values()));
        } catch (error: any) {
            console.error('Error fetching category stats:', error);
        }
    }, []);

    // Fetch monthly transaction statistics
    const fetchMonthlyStats = useCallback(async () => {
        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const { data, error } = await supabase
                .from('inventory_transactions')
                .select('transaction_type, created_at, status')
                .gte('created_at', sixMonthsAgo.toISOString());

            if (error) throw error;

            // Group by month
            const monthMap = new Map<string, { issues: number; returns: number; uses: number }>();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            // Initialize last 6 months
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthKey = months[d.getMonth()];
                monthMap.set(monthKey, { issues: 0, returns: 0, uses: 0 });
            }

            (data || []).forEach((trans: any) => {
                const date = new Date(trans.created_at);
                const monthKey = months[date.getMonth()];
                const existing = monthMap.get(monthKey);

                if (existing) {
                    if (trans.transaction_type === 'issue') {
                        existing.issues++;
                    } else if (trans.transaction_type === 'use') {
                        existing.uses++;
                    }
                    if (trans.status === 'returned') {
                        existing.returns++;
                    }
                }
            });

            setMonthlyStats(Array.from(monthMap.entries()).map(([month, stats]) => ({
                month,
                ...stats,
            })));
        } catch (error: any) {
            console.error('Error fetching monthly stats:', error);
        }
    }, []);

    // Fetch top borrowed items
    const fetchTopItems = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('inventory_transactions')
                .select(`
          item_id,
          quantity,
          inventory_items(name)
        `)
                .in('transaction_type', ['issue', 'use']);

            if (error) throw error;

            // Group by item
            const itemMap = new Map<string, { name: string; count: number }>();

            (data || []).forEach((trans: any) => {
                const itemName = trans.inventory_items?.name || 'Unknown';
                const existing = itemMap.get(itemName);

                if (existing) {
                    existing.count += trans.quantity || 1;
                } else {
                    itemMap.set(itemName, { name: itemName, count: trans.quantity || 1 });
                }
            });

            // Sort by count and get top 5
            const sorted = Array.from(itemMap.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            setTopItems(sorted);
        } catch (error: any) {
            console.error('Error fetching top items:', error);
        }
    }, []);

    // Fetch summary statistics
    const fetchSummary = useCallback(async () => {
        try {
            // Total items and value
            const { data: items, error: itemsError } = await supabase
                .from('inventory_items')
                .select('quantity, unit_price, min_stock_level');

            if (itemsError) throw itemsError;

            const totalItems = (items || []).reduce((sum, item: any) => sum + (item.quantity || 0), 0);
            const totalValue = (items || []).reduce((sum, item: any) =>
                sum + ((item.quantity || 0) * (item.unit_price || 0)), 0);
            const lowStockCount = (items || []).filter((item: any) =>
                (item.quantity || 0) <= (item.min_stock_level || 5)).length;

            // Currently issued (pending transactions)
            const { count: issuedCount, error: issuedError } = await supabase
                .from('inventory_transactions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')
                .eq('transaction_type', 'issue');

            if (issuedError) throw issuedError;

            // Overdue items
            const { count: overdueCount, error: overdueError } = await supabase
                .from('inventory_transactions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')
                .eq('transaction_type', 'issue')
                .lt('expected_return_date', new Date().toISOString());

            if (overdueError) throw overdueError;

            // Return rate
            const { data: allTransactions, error: transError } = await supabase
                .from('inventory_transactions')
                .select('status, transaction_type')
                .eq('transaction_type', 'issue');

            if (transError) throw transError;

            const total = (allTransactions || []).length;
            const returned = (allTransactions || []).filter((t: any) => t.status === 'returned').length;
            const returnRate = total > 0 ? Math.round((returned / total) * 100) : 100;

            setSummary({
                totalItems,
                totalValue,
                lowStockCount,
                currentlyIssued: issuedCount || 0,
                overdueCount: overdueCount || 0,
                returnRate,
            });
        } catch (error: any) {
            console.error('Error fetching summary:', error);
        }
    }, []);

    // Fetch all report data
    const fetchReportData = useCallback(async (filters?: ReportFilters) => {
        setLoading(true);
        try {
            await Promise.all([
                fetchCategoryStats(),
                fetchMonthlyStats(),
                fetchTopItems(),
                fetchSummary(),
            ]);
        } catch (error: any) {
            console.error('Error fetching report data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load report data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [fetchCategoryStats, fetchMonthlyStats, fetchTopItems, fetchSummary, toast]);

    // Export to CSV
    const exportToCSV = async (reportType: string) => {
        try {
            let data: any[] = [];
            let filename = 'report.csv';
            let headers: string[] = [];

            switch (reportType) {
                case 'inventory':
                    const { data: items } = await supabase
                        .from('inventory_items')
                        .select(`*, categories(name), areas(name)`);
                    data = (items || []).map((item: any) => ({
                        Name: item.name,
                        Category: item.categories?.name || '',
                        Area: item.areas?.name || '',
                        Quantity: item.quantity,
                        'Unit Price': item.unit_price || 0,
                        Status: item.status,
                        Location: item.location || '',
                    }));
                    headers = ['Name', 'Category', 'Area', 'Quantity', 'Unit Price', 'Status', 'Location'];
                    filename = 'inventory_report.csv';
                    break;

                case 'transactions':
                    const { data: trans } = await supabase
                        .from('inventory_transactions')
                        .select(`*, inventory_items(name)`)
                        .order('created_at', { ascending: false });
                    data = (trans || []).map((t: any) => ({
                        Date: new Date(t.created_at).toLocaleDateString(),
                        Item: t.inventory_items?.name || '',
                        Type: t.transaction_type,
                        Quantity: t.quantity,
                        Recipient: t.recipient_name || '',
                        Status: t.status,
                        Purpose: t.purpose || '',
                    }));
                    headers = ['Date', 'Item', 'Type', 'Quantity', 'Recipient', 'Status', 'Purpose'];
                    filename = 'transactions_report.csv';
                    break;

                case 'low-stock':
                    const { data: lowStock } = await supabase
                        .from('inventory_items')
                        .select(`*, categories(name), areas(name)`);
                    data = (lowStock || [])
                        .filter((item: any) => (item.quantity || 0) <= (item.min_stock_level || 5))
                        .map((item: any) => ({
                            Name: item.name,
                            Category: item.categories?.name || '',
                            Area: item.areas?.name || '',
                            Quantity: item.quantity,
                            'Min Level': item.min_stock_level || 5,
                        }));
                    headers = ['Name', 'Category', 'Area', 'Quantity', 'Min Level'];
                    filename = 'low_stock_report.csv';
                    break;

                default:
                    data = categoryStats.map(cat => ({
                        Category: cat.name,
                        'Item Count': cat.count,
                        'Total Value (NPR)': cat.value,
                    }));
                    headers = ['Category', 'Item Count', 'Total Value (NPR)'];
                    filename = 'asset_value_report.csv';
            }

            // Generate CSV
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();

            toast({ title: 'Success', description: 'Report exported successfully' });
        } catch (error: any) {
            console.error('Error exporting:', error);
            toast({
                title: 'Error',
                description: 'Failed to export report',
                variant: 'destructive',
            });
        }
    };

    return {
        loading,
        categoryStats,
        monthlyStats,
        topItems,
        summary,
        fetchReportData,
        exportToCSV,
    };
}
