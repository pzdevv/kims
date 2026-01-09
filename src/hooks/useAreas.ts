import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { Area } from '@/types/database';

export interface AreaWithStats extends Area {
    item_count?: number;
    user_count?: number;
    total_value?: number;
}

export function useAreas() {
    const [areas, setAreas] = useState<AreaWithStats[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchAreas = useCallback(async (includeStats = false) => {
        setLoading(true);
        try {
            if (includeStats) {
                // Fetch areas with item and user statistics
                const { data, error } = await supabase
                    .from('areas')
                    .select(`
            *,
            inventory_items(id, quantity, unit_price),
            user_areas(user_id)
          `)
                    .eq('is_active', true)
                    .order('name');

                if (error) throw error;

                const areasWithStats: AreaWithStats[] = (data || []).map((area: any) => {
                    const items = area.inventory_items || [];
                    const userAreas = area.user_areas || [];
                    return {
                        id: area.id,
                        name: area.name,
                        description: area.description,
                        location: area.location,
                        manager_id: area.manager_id,
                        is_active: area.is_active,
                        created_at: area.created_at,
                        updated_at: area.updated_at,
                        item_count: items.length,
                        user_count: userAreas.length,
                        total_value: items.reduce(
                            (sum: number, item: any) => sum + (item.quantity * (item.unit_price || 0)),
                            0
                        ),
                    };
                });

                setAreas(areasWithStats);
                return areasWithStats;
            } else {
                const { data, error } = await supabase
                    .from('areas')
                    .select('*')
                    .eq('is_active', true)
                    .order('name');

                if (error) throw error;
                setAreas(data || []);
                return data || [];
            }
        } catch (error: any) {
            console.error('Error fetching areas:', error);
            toast({
                title: 'Error',
                description: 'Failed to load areas',
                variant: 'destructive',
            });
            return [];
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const createArea = async (area: {
        name: string;
        description?: string;
        location?: string;
        manager_id?: string;
    }) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('areas')
                .insert([area])
                .select()
                .single();

            if (error) throw error;

            setAreas((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            toast({ title: 'Success', description: 'Area created successfully' });
            return data;
        } catch (error: any) {
            console.error('Error creating area:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to create area',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateArea = async (
        areaId: string,
        updates: Partial<Omit<Area, 'id' | 'created_at'>>
    ) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('areas')
                .update(updates)
                .eq('id', areaId)
                .select()
                .single();

            if (error) throw error;

            setAreas((prev) =>
                prev.map((a) => (a.id === areaId ? { ...a, ...data } : a))
            );

            toast({ title: 'Success', description: 'Area updated successfully' });
            return data;
        } catch (error: any) {
            console.error('Error updating area:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to update area',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteArea = async (areaId: string) => {
        setLoading(true);
        try {
            // Soft delete
            const { error } = await supabase
                .from('areas')
                .update({ is_active: false })
                .eq('id', areaId);

            if (error) throw error;

            setAreas((prev) => prev.filter((a) => a.id !== areaId));
            toast({ title: 'Success', description: 'Area deleted successfully' });
            return true;
        } catch (error: any) {
            console.error('Error deleting area:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete area',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getAreaById = async (areaId: string) => {
        try {
            const { data, error } = await supabase
                .from('areas')
                .select('*')
                .eq('id', areaId)
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error fetching area:', error);
            return null;
        }
    };

    return {
        areas,
        loading,
        fetchAreas,
        createArea,
        updateArea,
        deleteArea,
        getAreaById,
    };
}
