import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCategories, CategoryWithStats } from '@/hooks/useCategories';
import { useInventory, InventoryItemWithRelations } from '@/hooks/useInventory';

export default function CategoryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState<CategoryWithStats | null>(null);

    const { categories, fetchCategories, loading: categoriesLoading } = useCategories();
    const { items, fetchItems, loading: itemsLoading } = useInventory();

    useEffect(() => {
        fetchCategories(true);
        if (id) {
            fetchItems({ categoryId: id });
        }
    }, [id, fetchCategories, fetchItems]);

    useEffect(() => {
        if (categories.length > 0 && id) {
            const found = categories.find(c => c.id === id);
            setCategory(found || null);
        }
    }, [categories, id]);

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const loading = categoriesLoading || itemsLoading;

    const formatCurrency = (value: number) => {
        if (value >= 100000) return `NPR ${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `NPR ${(value / 1000).toFixed(0)}K`;
        return `NPR ${value.toLocaleString()}`;
    };

    if (loading && !category) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading category...</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/categories"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Category Not Found</h1>
                </div>
                <Card className="p-12 text-center">
                    <p className="text-muted-foreground">This category doesn't exist or was deleted.</p>
                    <Button asChild className="mt-4">
                        <Link to="/categories">Back to Categories</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="hover:bg-muted/50">
                    <Link to="/categories"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="flex items-center gap-4 flex-1">
                    <div
                        className="h-14 w-14 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ backgroundColor: (category.color || '#10B981') + '20' }}
                    >
                        {category.icon || '📦'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            {category.name}
                        </h1>
                        <p className="text-muted-foreground">
                            {filteredItems.length} items · {formatCurrency(category.total_value || 0)} total value
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link to={`/inventory/add?category=${id}`}>
                        <Package className="mr-2 h-4 w-4" />
                        Add Item
                    </Link>
                </Button>
            </div>

            {/* Search */}
            <Card glass>
                <CardContent className="p-4">
                    <div className="relative max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Search items in category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/30 transition-all"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Items Grid */}
            {itemsLoading ? (
                <Card className="p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading items...</p>
                </Card>
            ) : filteredItems.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item, index) => (
                        <Card
                            key={item.id}
                            className="group hover:shadow-xl transition-all duration-200 ease-out animate-fade-in opacity-0"
                            style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
                        >
                            <CardContent className="p-4">
                                <div className="aspect-video bg-muted rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="h-12 w-12 text-muted-foreground/50" />
                                    )}
                                </div>
                                <h3 className="font-semibold truncate">{item.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">{item.area?.name || 'No area'}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <Badge variant={item.quantity <= (item.min_stock_level || 5) ? 'destructive' : 'secondary'}>
                                        {item.quantity} in stock
                                    </Badge>
                                    <span className="text-sm font-medium">{formatCurrency(item.unit_price || 0)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center animate-fade-in">
                    <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                        <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No items in this category</h3>
                    <p className="text-muted-foreground mb-4">
                        {searchQuery ? 'Try a different search term' : 'Add items to see them here'}
                    </p>
                    <Button asChild>
                        <Link to={`/inventory/add?category=${id}`}>
                            <Package className="mr-2 h-4 w-4" />
                            Add First Item
                        </Link>
                    </Button>
                </Card>
            )}
        </div>
    );
}
