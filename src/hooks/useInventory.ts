import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItem, Category } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItemWithRelations extends InventoryItem {
    category?: { name: string; color: string | null };
    area?: { name: string };
}

export interface InventoryFilters {
    search?: string;
    categoryId?: string;
    areaId?: string;
    status?: string;
    condition?: string;
    lowStockOnly?: boolean;
}

export function useInventory() {
    const [items, setItems] = useState<InventoryItemWithRelations[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const { toast } = useToast();

    const fetchItems = useCallback(async (filters?: InventoryFilters, page = 1, pageSize = 50) => {
        setLoading(true);
        try {
            let query = supabase
                .from('inventory_items')
                .select(`
          *,
          category:categories(name, color),
          area:areas(name)
        `, { count: 'exact' });

            // Apply filters
            if (filters?.search) {
                query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`);
            }
            if (filters?.categoryId && filters.categoryId !== 'all') {
                query = query.eq('category_id', filters.categoryId);
            }
            if (filters?.areaId && filters.areaId !== 'all') {
                query = query.eq('area_id', filters.areaId);
            }
            if (filters?.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }
            if (filters?.condition && filters.condition !== 'all') {
                query = query.eq('condition', filters.condition);
            }
            if (filters?.lowStockOnly) {
                query = query.eq('is_low_stock', true);
            }

            // Pagination
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            query = query.range(from, to).order('created_at', { ascending: false });

            const { data, error, count } = await query;

            if (error) throw error;
            setItems(data as InventoryItemWithRelations[] || []);
            setTotalCount(count || 0);
            return { items: data || [], count: count || 0 };
        } catch (error: any) {
            console.error('Error fetching inventory:', error);
            toast({
                title: 'Error',
                description: 'Failed to load inventory items',
                variant: 'destructive',
            });
            return { items: [], count: 0 };
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const fetchCategories = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setCategories(data || []);
            return data || [];
        } catch (error: any) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }, []);

    const fetchAreas = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('areas')
                .select('id, name')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setAreas(data || []);
            return data || [];
        } catch (error: any) {
            console.error('Error fetching areas:', error);
            return [];
        }
    }, []);

    const getItemById = async (itemId: string) => {
        try {
            const { data, error } = await supabase
                .from('inventory_items')
                .select(`
          *,
          category:categories(id, name, color),
          area:areas(id, name)
        `)
                .eq('id', itemId)
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error fetching item:', error);
            return null;
        }
    };

    const addItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'is_low_stock'>) => {
        setLoading(true);
        try {
            const { data: userData } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('inventory_items')
                .insert([{ ...item, created_by: userData.user?.id }] as any)
                .select(`
          *,
          category:categories(name, color),
          area:areas(name)
        `)
                .single();

            if (error) throw error;

            setItems((prev) => [data as InventoryItemWithRelations, ...prev]);
            toast({ title: 'Success', description: 'Item added to inventory' });
            return data;
        } catch (error: any) {
            console.error('Error adding item:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to add item',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (itemId: string, updates: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'is_low_stock'>>) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('inventory_items')
                .update(updates)
                .eq('id', itemId)
                .select(`
          *,
          category:categories(name, color),
          area:areas(name)
        `)
                .single();

            if (error) throw error;

            setItems((prev) =>
                prev.map((i) => (i.id === itemId ? (data as InventoryItemWithRelations) : i))
            );
            toast({ title: 'Success', description: 'Item updated successfully' });
            return data;
        } catch (error: any) {
            console.error('Error updating item:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to update item',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteItem = async (itemId: string, hardDelete = false) => {
        setLoading(true);
        try {
            if (hardDelete) {
                const { error } = await supabase
                    .from('inventory_items')
                    .delete()
                    .eq('id', itemId);
                if (error) throw error;
            } else {
                // Soft delete by setting status to retired
                const { error } = await supabase
                    .from('inventory_items')
                    .update({ status: 'retired' })
                    .eq('id', itemId);
                if (error) throw error;
            }

            setItems((prev) => prev.filter((i) => i.id !== itemId));
            toast({ title: 'Success', description: 'Item deleted successfully' });
            return true;
        } catch (error: any) {
            console.error('Error deleting item:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete item',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateItemQuantity = async (itemId: string, quantityChange: number, notes?: string) => {
        setLoading(true);
        try {
            // Get current quantity
            const { data: currentItem, error: fetchError } = await supabase
                .from('inventory_items')
                .select('quantity')
                .eq('id', itemId)
                .single();

            if (fetchError) throw fetchError;

            const newQuantity = currentItem.quantity + quantityChange;
            if (newQuantity < 0) {
                toast({
                    title: 'Error',
                    description: 'Quantity cannot be negative',
                    variant: 'destructive',
                });
                return null;
            }

            // Update quantity
            const { data, error } = await supabase
                .from('inventory_items')
                .update({ quantity: newQuantity })
                .eq('id', itemId)
                .select()
                .single();

            if (error) throw error;

            // Create transaction record
            const { data: userData } = await supabase.auth.getUser();
            await supabase.from('inventory_transactions').insert([{
                item_id: itemId,
                transaction_type: quantityChange > 0 ? 'add' : 'remove',
                quantity: Math.abs(quantityChange),
                user_id: userData.user?.id,
                issued_by: userData.user?.id,
                notes: notes,
                status: 'returned',
            }]);

            // Update local state
            setItems((prev) =>
                prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
            );

            toast({ title: 'Success', description: 'Quantity updated' });
            return data;
        } catch (error: any) {
            console.error('Error updating quantity:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to update quantity',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = fileName;

            const { error: uploadError } = await supabase.storage
                .from('inventory-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('inventory-images')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast({
                title: 'Upload Failed',
                description: error.message,
                variant: 'destructive',
            });
            return null;
        }
    };

    const deleteImage = async (imageUrl: string): Promise<boolean> => {
        try {
            // Extract file path from URL
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];

            const { error } = await supabase.storage
                .from('inventory-images')
                .remove([fileName]);

            if (error) throw error;
            return true;
        } catch (error: any) {
            console.error('Error deleting image:', error);
            return false;
        }
    };

    // Set up real-time subscription
    const setupRealtimeSubscription = useCallback(() => {
        const channel = supabase
            .channel('inventory-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'inventory_items' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // Fetch the full item with relations
                        getItemById(payload.new.id).then((item) => {
                            if (item) {
                                setItems((prev) => [item as InventoryItemWithRelations, ...prev]);
                            }
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        getItemById(payload.new.id).then((item) => {
                            if (item) {
                                setItems((prev) =>
                                    prev.map((i) => (i.id === payload.new.id ? (item as InventoryItemWithRelations) : i))
                                );
                            }
                        });
                    } else if (payload.eventType === 'DELETE') {
                        setItems((prev) => prev.filter((i) => i.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return {
        items,
        categories,
        areas,
        loading,
        totalCount,
        fetchItems,
        fetchCategories,
        fetchAreas,
        getItemById,
        addItem,
        updateItem,
        deleteItem,
        updateItemQuantity,
        uploadImage,
        deleteImage,
        setupRealtimeSubscription,
    };
}
