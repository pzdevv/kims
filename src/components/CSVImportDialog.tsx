import { useState, useRef } from 'react';
import { Upload, Download, FileText, Loader2, CheckCircle, XCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCSVImport, CSVImportResult } from '@/hooks/useCSVImport';

interface CSVImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'areas' | 'categories' | 'inventory';
    onImportComplete?: () => void;
}

export function CSVImportDialog({
    open,
    onOpenChange,
    type,
    onImportComplete
}: CSVImportDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [result, setResult] = useState<CSVImportResult | null>(null);
    const { importing, importAreas, importCategories, importInventory, downloadTemplate } = useCSVImport();

    const titles = {
        areas: 'Import Areas',
        categories: 'Import Categories',
        inventory: 'Import Inventory Items',
    };

    const descriptions = {
        areas: 'Upload a CSV file with columns: name, description, location',
        categories: 'Upload a CSV file with columns: name, description, color, icon',
        inventory: 'Upload a CSV file with columns: name, description, category, area, quantity, unit_price, min_stock_level, location, condition',
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        let importResult: CSVImportResult;

        switch (type) {
            case 'areas':
                importResult = await importAreas(file);
                break;
            case 'categories':
                importResult = await importCategories(file);
                break;
            case 'inventory':
                importResult = await importInventory(file);
                break;
        }

        setResult(importResult);

        if (importResult.success > 0 && onImportComplete) {
            onImportComplete();
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        setResult(null);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        {titles[type]}
                    </DialogTitle>
                    <DialogDescription>{descriptions[type]}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Download Template */}
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Download template</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTemplate(type)}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            CSV
                        </Button>
                    </div>

                    {/* Upload Area */}
                    <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileSelect}
                            disabled={importing}
                        />

                        {importing ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">Importing...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium">Click to upload CSV</p>
                                <p className="text-xs text-muted-foreground">or drag and drop</p>
                            </div>
                        )}
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="space-y-2 p-3 border rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">{result.success} imported</span>
                                </div>
                                {result.failed > 0 && (
                                    <div className="flex items-center gap-1 text-red-600">
                                        <XCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">{result.failed} failed</span>
                                    </div>
                                )}
                            </div>

                            {result.errors.length > 0 && (
                                <div className="max-h-32 overflow-y-auto text-xs text-muted-foreground">
                                    {result.errors.slice(0, 5).map((error, i) => (
                                        <p key={i} className="text-red-500">{error}</p>
                                    ))}
                                    {result.errors.length > 5 && (
                                        <p>...and {result.errors.length - 5} more errors</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" onClick={handleClose}>
                        {result ? 'Close' : 'Cancel'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
