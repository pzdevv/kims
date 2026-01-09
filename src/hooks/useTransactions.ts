import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { TransactionStatus, TransactionType } from '@/types/database';

export interface TransactionWithDetails {
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
    item?: { id: string; name: string; image_url?: string };
    user?: { id: string; name: string; email: string };
    issued_by_user?: { id: string; name: string };
}

export interface IssueItemParams {
    itemId: string;
    quantity: number;
    recipientName: string;
    recipientEmail?: string;
    recipientDepartment?: string;
    expectedReturnDate?: string;
    purpose?: string;
    notes?: string;
    transactionType?: 'issue' | 'use'; // 'use' for consumables (no return expected)
}

export function useTransactions() {
    const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchTransactions = useCallback(async (filters?: {
        status?: string;
        transactionType?: string;
        limit?: number;
    }) => {
        setLoading(true);
        try {
            let query = supabase
                .from('inventory_transactions')
                .select(`
                    *,
                    item:inventory_items(id, name, image_url),
                    issued_by_user:profiles!inventory_transactions_issued_by_fkey(id, name)
                `)
                .order('created_at', { ascending: false });

            if (filters?.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }
            if (filters?.transactionType && filters.transactionType !== 'all') {
                query = query.eq('transaction_type', filters.transactionType);
            }
            if (filters?.limit) {
                query = query.limit(filters.limit);
            }

            const { data, error } = await query;

            if (error) throw error;
            setTransactions((data as TransactionWithDetails[]) || []);
            return (data as TransactionWithDetails[]) || [];
        } catch (error: any) {
            console.error('Error fetching transactions:', error);
            toast({
                title: 'Error',
                description: 'Failed to load transactions',
                variant: 'destructive',
            });
            return [];
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const issueItem = async (params: IssueItemParams) => {
        setLoading(true);
        try {
            const { data: userData } = await supabase.auth.getUser();

            // First, check if item has enough quantity
            const { data: item, error: itemError } = await supabase
                .from('inventory_items')
                .select('quantity, status')
                .eq('id', params.itemId)
                .single();

            if (itemError) throw itemError;

            if (!item || (item as any).quantity < params.quantity) {
                toast({
                    title: 'Error',
                    description: `Not enough items available. Available: ${(item as any)?.quantity || 0}`,
                    variant: 'destructive',
                });
                return null;
            }

            // Create transaction record  
            const isUse = params.transactionType === 'use';
            const transactionData = {
                item_id: params.itemId,
                transaction_type: isUse ? 'use' : 'issue',
                quantity: params.quantity,
                issued_by: userData.user?.id || null,
                issue_date: new Date().toISOString(),
                expected_return_date: isUse ? null : (params.expectedReturnDate || null),
                status: isUse ? 'returned' : 'pending', // 'use' transactions are immediately completed
                purpose: params.purpose || null,
                notes: params.notes || null,
                recipient_name: params.recipientName,
                recipient_email: params.recipientEmail || null,
                recipient_department: params.recipientDepartment || null,
            };

            const { data: transaction, error: transError } = await supabase
                .from('inventory_transactions')
                .insert([transactionData] as any)
                .select()
                .single();

            if (transError) throw transError;

            // Update item quantity
            const newQuantity = (item as any).quantity - params.quantity;
            const { error: updateError } = await supabase
                .from('inventory_items')
                .update({
                    quantity: newQuantity,
                    status: newQuantity === 0 ? 'checked_out' : 'available'
                } as any)
                .eq('id', params.itemId);

            if (updateError) throw updateError;

            toast({ title: 'Success', description: 'Item issued successfully' });
            await fetchTransactions({ limit: 20 });
            return { success: true, transaction };
        } catch (error: any) {
            console.error('Error issuing item:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to issue item',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const returnItem = async (transactionId: string, notes?: string) => {
        setLoading(true);
        try {
            // Get transaction details
            const { data: trans, error: transError } = await supabase
                .from('inventory_transactions')
                .select('item_id, quantity')
                .eq('id', transactionId)
                .single();

            if (transError || !trans) throw transError || new Error('Transaction not found');

            // Update transaction status
            const { error: updateTransError } = await supabase
                .from('inventory_transactions')
                .update({
                    status: 'returned',
                    actual_return_date: new Date().toISOString(),
                    notes: notes || null,
                } as any)
                .eq('id', transactionId);

            if (updateTransError) throw updateTransError;

            // Restore item quantity
            const { data: item } = await supabase
                .from('inventory_items')
                .select('quantity')
                .eq('id', (trans as any).item_id)
                .single();

            const { error: updateItemError } = await supabase
                .from('inventory_items')
                .update({
                    quantity: ((item as any)?.quantity || 0) + (trans as any).quantity,
                    status: 'available'
                } as any)
                .eq('id', (trans as any).item_id);

            if (updateItemError) throw updateItemError;

            toast({ title: 'Success', description: 'Item returned successfully' });

            setTransactions((prev) =>
                prev.map((t) =>
                    t.id === transactionId
                        ? { ...t, status: 'returned' as TransactionStatus, actual_return_date: new Date().toISOString() }
                        : t
                )
            );

            return { success: true };
        } catch (error: any) {
            console.error('Error returning item:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to return item',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getOverdueTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from('inventory_transactions')
                .select(`
                    *,
                    item:inventory_items(id, name, image_url)
                `)
                .eq('status', 'pending')
                .lt('expected_return_date', new Date().toISOString())
                .order('expected_return_date', { ascending: true });

            if (error) throw error;
            return (data as TransactionWithDetails[]) || [];
        } catch (error: any) {
            console.error('Error fetching overdue transactions:', error);
            return [];
        }
    };

    return {
        transactions,
        loading,
        fetchTransactions,
        issueItem,
        returnItem,
        getOverdueTransactions,
    };
}
