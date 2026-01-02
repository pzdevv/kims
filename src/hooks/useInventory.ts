import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItem, Category } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useInventory() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchItems = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('inventory_items')
                .select(`
          *,
          category:categories(name, color),
          area:areas(name)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data as any || []);
        } catch (error: any) {
            console.error('Error fetching inventory:', error);
            toast({
                title: 'Error',
                description: 'Failed to load inventory items',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (error: any) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchAreas = async () => {
        try {
            const { data, error } = await supabase
                .from('areas')
                .select('id, name')
                .order('name');

            if (error) throw error;
            setAreas(data || []);
        } catch (error: any) {
            console.error('Error fetching areas:', error);
        }
    };

    const addItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'is_low_stock'>) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('inventory_items')
                .insert([item] as any) // Type assertion due to optional fields mapping
                .select()
                .single();

            if (error) throw error;

            setItems([data as any, ...items]);
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

    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

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

    return {
        items,
        categories,
        areas,
        loading,
        fetchItems,
        fetchCategories,
        fetchAreas,
        addItem,
        uploadImage,
    };
}
