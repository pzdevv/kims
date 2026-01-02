import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Package,
  Edit,
  Eye,
  Trash2,
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
import { ItemStatus, ItemCondition } from '@/types/inventory';

// Demo items data
const demoItems = [
  {
    id: '1',
    item_id: 'ITM-001',
    name: 'HP ProBook 450 G8 Laptop',
    category: { name: 'Electronics', color: '#76C044' },
    area: { name: 'Computer Lab' },
    quantity: 25,
    status: 'available' as ItemStatus,
    condition: 'good' as ItemCondition,
    location: 'Rack A-1',
    unit_price: 95000,
  },
  {
    id: '2',
    item_id: 'ITM-002',
    name: 'Digital Microscope 1000x',
    category: { name: 'Lab Equipment', color: '#3B82F6' },
    area: { name: 'Biology Lab' },
    quantity: 15,
    status: 'available' as ItemStatus,
    condition: 'new' as ItemCondition,
    location: 'Cabinet B-3',
    unit_price: 45000,
  },
  {
    id: '3',
    item_id: 'ITM-003',
    name: 'Projector Epson EB-X51',
    category: { name: 'Electronics', color: '#76C044' },
    area: { name: 'Admin Office' },
    quantity: 3,
    status: 'checked_out' as ItemStatus,
    condition: 'good' as ItemCondition,
    location: 'Storage Room',
    unit_price: 65000,
  },
  {
    id: '4',
    item_id: 'ITM-004',
    name: 'Chemistry Lab Set (Advanced)',
    category: { name: 'Lab Equipment', color: '#3B82F6' },
    area: { name: 'Chemistry Lab' },
    quantity: 8,
    status: 'available' as ItemStatus,
    condition: 'good' as ItemCondition,
    location: 'Cabinet C-1',
    unit_price: 35000,
  },
  {
    id: '5',
    item_id: 'ITM-005',
    name: 'Office Chair (Ergonomic)',
    category: { name: 'Furniture', color: '#8B5CF6' },
    area: { name: 'Admin Office' },
    quantity: 50,
    status: 'available' as ItemStatus,
    condition: 'good' as ItemCondition,
    location: 'Multiple',
    unit_price: 12000,
  },
  {
    id: '6',
    item_id: 'ITM-006',
    name: 'Basketball (Official Size)',
    category: { name: 'Sports Equipment', color: '#F59E0B' },
    area: { name: 'Sports Room' },
    quantity: 4,
    status: 'maintenance' as ItemStatus,
    condition: 'fair' as ItemCondition,
    location: 'Sports Cabinet',
    unit_price: 3500,
  },
];

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
  const { hasRole, userAreas } = useAuth();

  const filteredItems = demoItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.item_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category.name === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesArea = userAreas.length === 8 || userAreas.some((a) => a.name === item.area.name);
    return matchesSearch && matchesCategory && matchesStatus && matchesArea;
  });

  const getQuantityColor = (quantity: number) => {
    if (quantity > 20) return 'text-success';
    if (quantity > 5) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">
            {filteredItems.length} items found
          </p>
        </div>
        {hasRole(['admin', 'manager']) && (
          <Button asChild>
            <Link to="/inventory/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
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
                placeholder="Search by name or ID..."
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
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Sports Equipment">Sports Equipment</SelectItem>
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
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Image placeholder */}
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{item.item_id}</p>
                    <h3 className="font-semibold text-foreground line-clamp-1">{item.name}</h3>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {hasRole(['admin', 'manager']) && (
                        <>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
                  <Badge
                    variant="outline"
                    style={{ borderColor: item.category.color, color: item.category.color }}
                  >
                    {item.category.name}
                  </Badge>
                  <Badge className={statusColors[item.status]}>
                    {statusLabels[item.status]}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Area:</span>
                    <span>{item.area.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className={`font-medium ${getQuantityColor(item.quantity)}`}>
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{item.location}</span>
                  </div>
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
                        <p className="text-xs text-muted-foreground">{item.item_id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        style={{ borderColor: item.category.color, color: item.category.color }}
                      >
                        {item.category.name}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{item.area.name}</td>
                    <td className="p-4">
                      <span className={`font-medium ${getQuantityColor(item.quantity)}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={statusColors[item.status]}>
                        {statusLabels[item.status]}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {hasRole(['admin', 'manager']) && (
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
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

      {filteredItems.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          {hasRole(['admin', 'manager']) && (
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
