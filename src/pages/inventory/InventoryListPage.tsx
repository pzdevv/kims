import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Grid3X3,
  List,
  MoreHorizontal,
  Package,
  Edit,
  Eye,
  Trash2,
  Loader2,
  Upload,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory, InventoryItemWithRelations } from '@/hooks/useInventory';
import { CSVImportDialog } from '@/components/CSVImportDialog';
import type { ItemStatus, ItemCondition } from '@/types/database';

const statusColors: Record<ItemStatus, string> = {
  available: 'bg-success text-success-foreground',
  checked_out: 'bg-warning text-warning-foreground',
  maintenance: 'bg-info text-info-foreground',
  retired: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<ItemStatus, string> = {
  available: 'Available',
  checked_out: 'Checked Out',
  maintenance: 'Maintenance',
  retired: 'Retired',
};

export default function InventoryListPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { hasRole } = useAuth();

  const { items, categories, loading, fetchItems, fetchCategories, deleteItem } = useInventory();

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  // Apply client-side filters
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === 'all' || item.category?.name === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getQuantityColor = (quantity: number) => {
    if (quantity > 20) return 'text-success';
    if (quantity > 5) return 'text-warning';
    return 'text-destructive';
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CSV Import Dialog */}
      <CSVImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        type="inventory"
        onImportComplete={fetchItems}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Inventory</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${filteredItems.length} items found`}
          </p>
        </div>
        {hasRole(['admin', 'general_manager', 'manager']) && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button asChild>
              <Link to="/inventory/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="checked_out">Checked Out</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item, index) => (
            <Card
              key={item.id}
              className="hover:shadow-premium-lg transition-all duration-300 animate-fade-in opacity-0"
              style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
            >
              <CardContent className="p-4">
                {/* Image */}
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{item.serial_number || 'No S/N'}</p>
                    <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/inventory/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {hasRole(['admin', 'general_manager', 'manager']) && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to={`/inventory/${item.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.category && (
                    <Badge
                      variant="outline"
                      style={{ borderColor: item.category.color || '#76C044', color: item.category.color || '#76C044' }}
                    >
                      {item.category.name}
                    </Badge>
                  )}
                  <Badge className={statusColors[item.status as ItemStatus] || 'bg-muted'}>
                    {statusLabels[item.status as ItemStatus] || item.status}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Area:</span>
                    <span>{item.area?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className={`font-medium ${getQuantityColor(item.quantity)}`}>
                      {item.quantity}
                    </span>
                  </div>
                  {item.location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Item</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Area</th>
                  <th className="text-left p-4 font-medium">Quantity</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.serial_number || 'No S/N'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {item.category && (
                        <Badge
                          variant="outline"
                          style={{ borderColor: item.category.color || '#76C044', color: item.category.color || '#76C044' }}
                        >
                          {item.category.name}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">{item.area?.name || 'Unassigned'}</td>
                    <td className="p-4">
                      <span className={`font-medium ${getQuantityColor(item.quantity)}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[item.status as ItemStatus] || 'bg-muted'}>
                        {statusLabels[item.status as ItemStatus] || item.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/inventory/${item.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {hasRole(['admin', 'general_manager', 'manager']) && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/inventory/${item.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredItems.length === 0 && !loading && (
        <Card className="p-12 text-center animate-fade-in">
          <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first inventory item to get started'}
          </p>
          {hasRole(['admin', 'general_manager', 'manager']) && (
            <Button asChild>
              <Link to="/inventory/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Link>
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
