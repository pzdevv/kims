import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface CSVImportResult {
    success: number;
    failed: number;
    errors: string[];
}

export function useCSVImport() {
    const [importing, setImporting] = useState(false);
    const { toast } = useToast();

    // Parse CSV string to array of objects - handles quoted values, different line endings
    const parseCSV = (csvText: string): Record<string, string>[] => {
        // Remove BOM if present and normalize line endings
        const cleanText = csvText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = cleanText.trim().split('\n').filter(line => line.trim() !== '');

        if (lines.length < 2) return [];

        // Parse a CSV line handling quoted values
        const parseLine = (line: string): string[] => {
            const values: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim().replace(/^["']|["']$/g, ''));
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim().replace(/^["']|["']$/g, ''));

            return values;
        };

        const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
        const rows: Record<string, string>[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = parseLine(line);
            const row: Record<string, string> = {};

            // Map values to headers, allowing for missing columns
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });

            // Only skip completely empty rows
            if (Object.values(row).some(v => v !== '')) {
                rows.push(row);
            }
        }

        return rows;
    };

    // Import Areas
    const importAreas = async (file: File): Promise<CSVImportResult> => {
        setImporting(true);
        const result: CSVImportResult = { success: 0, failed: 0, errors: [] };

        try {
            const text = await file.text();
            const rows = parseCSV(text);

            for (const row of rows) {
                try {
                    const areaData = {
                        name: row.name || row.area_name,
                        description: row.description || null,
                        location: row.location || null,
                        is_active: row.is_active !== 'false',
                    };

                    if (!areaData.name) {
                        result.errors.push(`Row missing name field`);
                        result.failed++;
                        continue;
                    }

                    const { error } = await supabase
                        .from('areas')
                        .insert([areaData] as any);

                    if (error) {
                        result.errors.push(`${areaData.name}: ${error.message}`);
                        result.failed++;
                    } else {
                        result.success++;
                    }
                } catch (e: any) {
                    result.errors.push(`Row error: ${e.message}`);
                    result.failed++;
                }
            }

            toast({
                title: 'Import Complete',
                description: `${result.success} areas imported, ${result.failed} failed`,
            });
        } catch (error: any) {
            toast({
                title: 'Import Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setImporting(false);
        }

        return result;
    };

    // Import Categories
    const importCategories = async (file: File): Promise<CSVImportResult> => {
        setImporting(true);
        const result: CSVImportResult = { success: 0, failed: 0, errors: [] };

        try {
            const text = await file.text();
            const rows = parseCSV(text);

            for (const row of rows) {
                try {
                    const categoryData = {
                        name: row.name || row.category_name,
                        description: row.description || null,
                        color: row.color || '#76C044',
                        icon: row.icon || 'package',
                        is_active: row.is_active !== 'false',
                    };

                    if (!categoryData.name) {
                        result.errors.push(`Row missing name field`);
                        result.failed++;
                        continue;
                    }

                    const { error } = await supabase
                        .from('categories')
                        .insert([categoryData] as any);

                    if (error) {
                        result.errors.push(`${categoryData.name}: ${error.message}`);
                        result.failed++;
                    } else {
                        result.success++;
                    }
                } catch (e: any) {
                    result.errors.push(`Row error: ${e.message}`);
                    result.failed++;
                }
            }

            toast({
                title: 'Import Complete',
                description: `${result.success} categories imported, ${result.failed} failed`,
            });
        } catch (error: any) {
            toast({
                title: 'Import Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setImporting(false);
        }

        return result;
    };

    // Import Inventory Items
    const importInventory = async (file: File): Promise<CSVImportResult> => {
        setImporting(true);
        const result: CSVImportResult = { success: 0, failed: 0, errors: [] };

        try {
            const text = await file.text();
            const rows = parseCSV(text);

            // Get categories and areas for mapping
            const { data: categories } = await supabase.from('categories').select('id, name') as { data: { id: string; name: string }[] | null };
            const { data: areas } = await supabase.from('areas').select('id, name') as { data: { id: string; name: string }[] | null };

            const categoryMap = new Map((categories || []).map(c => [c.name.toLowerCase(), c.id]));
            const areaMap = new Map((areas || []).map(a => [a.name.toLowerCase(), a.id]));

            for (const row of rows) {
                try {
                    // Find category and area IDs by name
                    const categoryId = categoryMap.get((row.category || row.category_name || '').toLowerCase());
                    const areaId = areaMap.get((row.area || row.area_name || '').toLowerCase());

                    const itemData = {
                        name: row.name || row.item_name,
                        description: row.description || null,
                        category_id: categoryId || null,
                        area_id: areaId || null,
                        quantity: parseInt(row.quantity) || 1,
                        unit_price: parseFloat(row.unit_price || row.price) || 0,
                        min_stock_level: parseInt(row.min_stock_level || row.min_stock) || 5,
                        location: row.location || null,
                        condition: row.condition || 'good',
                        status: row.status || 'available',
                        manufacturer: row.manufacturer || null,
                        model: row.model || null,
                        notes: row.notes || null,
                    };

                    if (!itemData.name) {
                        result.errors.push(`Row missing name field`);
                        result.failed++;
                        continue;
                    }

                    const { error } = await supabase
                        .from('inventory_items')
                        .insert([itemData] as any);

                    if (error) {
                        result.errors.push(`${itemData.name}: ${error.message}`);
                        result.failed++;
                    } else {
                        result.success++;
                    }
                } catch (e: any) {
                    result.errors.push(`Row error: ${e.message}`);
                    result.failed++;
                }
            }

            toast({
                title: 'Import Complete',
                description: `${result.success} items imported, ${result.failed} failed`,
            });
        } catch (error: any) {
            toast({
                title: 'Import Failed',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setImporting(false);
        }

        return result;
    };

    // Generate sample CSV templates
    const getTemplates = () => ({
        areas: 'name,description,location\nMain Building,Primary building,Floor 1\nScience Block,Science labs,Floor 2',
        categories: 'name,description,color,icon\nElectronics,Electronic devices,#3B82F6,laptop\nFurniture,Tables and chairs,#F59E0B,armchair\nLab Equipment,Laboratory tools,#8B5CF6,flask',
        inventory: 'name,description,category,area,quantity,unit_price,min_stock_level,location,condition\nLaptop Dell XPS,Dell XPS 15 inch,Electronics,Main Building,10,150000,2,Room 101,good\nMicroscope,Olympus CX23,Lab Equipment,Science Block,5,85000,1,Lab 1,good',
    });

    const downloadTemplate = (type: 'areas' | 'categories' | 'inventory') => {
        const templates = getTemplates();
        const content = templates[type];
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}_template.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return {
        importing,
        importAreas,
        importCategories,
        importInventory,
        downloadTemplate,
    };
}
