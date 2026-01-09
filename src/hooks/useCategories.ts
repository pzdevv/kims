import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/types/database';

export interface CategoryWithStats extends Category {
    item_count?: number;
    total_value?: number;
}

export function useCategories() {
    const [categories, setCategories] = useState<CategoryWithStats[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchCategories = useCallback(async (includeStats = false) => {
        setLoading(true);
        try {
            if (includeStats) {
                // Fetch categories with item statistics
                const { data, error } = await supabase
                    .from('categories')
                    .select(`
            *,
            inventory_items(id, quantity, unit_price)
          `)
                    .eq('is_active', true)
                    .order('name');

                if (error) throw error;

                const categoriesWithStats: CategoryWithStats[] = (data || []).map((cat: any) => {
                    const items = cat.inventory_items || [];
                    return {
                        id: cat.id,
                        name: cat.name,
                        description: cat.description,
                        color: cat.color,
                        icon: cat.icon,
                        parent_id: cat.parent_id,
                        is_active: cat.is_active,
                        created_at: cat.created_at,
                        updated_at: cat.updated_at,
                        item_count: items.length,
                        total_value: items.reduce(
                            (sum: number, item: any) => sum + (item.quantity * (item.unit_price || 0)),
                            0
                        ),
                    };
                });

                setCategories(categoriesWithStats);
                return categoriesWithStats;
            } else {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_active', true)
                    .order('name');

                if (error) throw error;
                setCategories(data || []);
                return data || [];
            }
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            toast({
                title: 'Error',
                description: 'Failed to load categories',
                variant: 'destructive',
            });
            return [];
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const createCategory = async (category: {
        name: string;
        description?: string;
        color?: string;
        icon?: string;
        parent_id?: string;
    }) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([category])
                .select()
                .single();

            if (error) throw error;

            setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            toast({ title: 'Success', description: 'Category created successfully' });
            return data;
        } catch (error: any) {
            console.error('Error creating category:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to create category',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateCategory = async (
        categoryId: string,
        updates: Partial<Omit<Category, 'id' | 'created_at'>>
    ) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('categories')
                .update(updates)
                .eq('id', categoryId)
                .select()
                .single();

            if (error) throw error;

            setCategories((prev) =>
                prev.map((c) => (c.id === categoryId ? { ...c, ...data } : c))
            );

            toast({ title: 'Success', description: 'Category updated successfully' });
            return data;
        } catch (error: any) {
            console.error('Error updating category:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to update category',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (categoryId: string) => {
        setLoading(true);
        try {
            // Soft delete
            const { error } = await supabase
                .from('categories')
                .update({ is_active: false })
                .eq('id', categoryId);

            if (error) throw error;

            setCategories((prev) => prev.filter((c) => c.id !== categoryId));
            toast({ title: 'Success', description: 'Category deleted successfully' });
            return true;
        } catch (error: any) {
            console.error('Error deleting category:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete category',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getCategoryById = async (categoryId: string) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('id', categoryId)
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error fetching category:', error);
            return null;
        }
    };

    return {
        categories,
        loading,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
    };
}
