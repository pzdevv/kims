import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Loader2, Search, MapPin, Users, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAreas, AreaWithStats } from '@/hooks/useAreas';
import { useInventory, InventoryItemWithRelations } from '@/hooks/useInventory';
import { supabase } from '@/lib/supabase';

interface AreaUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function AreaDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [area, setArea] = useState<AreaWithStats | null>(null);
    const [areaUsers, setAreaUsers] = useState<AreaUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const { areas, fetchAreas, loading: areasLoading } = useAreas();
    const { items, fetchItems, loading: itemsLoading } = useInventory();

    useEffect(() => {
        fetchAreas(true);
        if (id) {
            fetchItems({ areaId: id });
            fetchAreaUsers(id);
        }
    }, [id, fetchAreas, fetchItems]);

    useEffect(() => {
        if (areas.length > 0 && id) {
            const found = areas.find(a => a.id === id);
            setArea(found || null);
        }
    }, [areas, id]);

    const fetchAreaUsers = async (areaId: string) => {
        setUsersLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_areas')
                .select(`
          user_id,
          profiles(id, name, email, role)
        `)
                .eq('area_id', areaId);

            if (error) throw error;

            const users = (data || [])
                .filter((row: any) => row.profiles)
                .map((row: any) => ({
                    id: row.profiles.id,
                    name: row.profiles.name,
                    email: row.profiles.email,
                    role: row.profiles.role,
                }));

            setAreaUsers(users);
        } catch (error) {
            console.error('Error fetching area users:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const loading = areasLoading || itemsLoading;

    const formatCurrency = (value: number) => {
        if (value >= 100000) return `NPR ${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `NPR ${(value / 1000).toFixed(0)}K`;
        return `NPR ${value.toLocaleString()}`;
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const roleColors: Record<string, string> = {
        admin: 'bg-rose-500/10 text-rose-600',
        general_manager: 'bg-violet-500/10 text-violet-600',
        manager: 'bg-sky-500/10 text-sky-600',
    };

    if (loading && !area) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading area...</p>
                </div>
            </div>
        );
    }

    if (!area) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to="/areas"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Area Not Found</h1>
                </div>
                <Card className="p-12 text-center">
                    <p className="text-muted-foreground">This area doesn't exist or was deleted.</p>
                    <Button asChild className="mt-4">
                        <Link to="/areas">Back to Areas</Link>
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
                    <Link to="/areas"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="flex items-center gap-4 flex-1">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <MapPin className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                            {area.name}
                        </h1>
                        <p className="text-muted-foreground">
                            {filteredItems.length} items · {areaUsers.length} users · {formatCurrency(area.total_value || 0)}
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link to={`/inventory/add?area=${id}`}>
                        <Package className="mr-2 h-4 w-4" />
                        Add Item
                    </Link>
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="items" className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="items" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Package className="h-4 w-4" />
                        Items ({filteredItems.length})
                    </TabsTrigger>
                    <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Users className="h-4 w-4" />
                        Users ({areaUsers.length})
                    </TabsTrigger>
                </TabsList>

                {/* Items Tab */}
                <TabsContent value="items" className="space-y-4 animate-fade-in">
                    {/* Search */}
                    <Card glass>
                        <CardContent className="p-4">
                            <div className="relative max-w-md group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="Search items in area..."
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
                                        <p className="text-sm text-muted-foreground truncate">{item.category?.name || 'Uncategorized'}</p>
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
                            <h3 className="text-lg font-semibold mb-2">No items in this area</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchQuery ? 'Try a different search term' : 'Add items to see them here'}
                            </p>
                            <Button asChild>
                                <Link to={`/inventory/add?area=${id}`}>
                                    <Package className="mr-2 h-4 w-4" />
                                    Add First Item
                                </Link>
                            </Button>
                        </Card>
                    )}
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="animate-fade-in">
                    {usersLoading ? (
                        <Card className="p-12 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">Loading users...</p>
                        </Card>
                    ) : areaUsers.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {areaUsers.map((user, index) => (
                                <Card
                                    key={user.id}
                                    className="hover:shadow-xl transition-all duration-200 ease-out animate-fade-in opacity-0"
                                    style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                                    {getInitials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{user.name}</h3>
                                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <Badge className={roleColors[user.role] || 'bg-muted'}>
                                                {user.role.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="p-12 text-center animate-fade-in">
                            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                                <Users className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No users assigned</h3>
                            <p className="text-muted-foreground">
                                Assign users to this area from the Users page
                            </p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
