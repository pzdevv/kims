import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Demo categories data
const initialCategories = [
  { id: '1', name: 'Electronics', description: 'Laptops, projectors, tablets, etc.', color: '#76C044', icon: '💻', item_count: 342 },
  { id: '2', name: 'Lab Equipment', description: 'Microscopes, beakers, chemicals', color: '#3B82F6', icon: '🔬', item_count: 198 },
  { id: '3', name: 'Furniture', description: 'Desks, chairs, cabinets', color: '#8B5CF6', icon: '🪑', item_count: 256 },
  { id: '4', name: 'Sports Equipment', description: 'Balls, nets, uniforms', color: '#F59E0B', icon: '⚽', item_count: 87 },
  { id: '5', name: 'Books & Library', description: 'Textbooks, reference materials', color: '#EC4899', icon: '📚', item_count: 451 },
  { id: '6', name: 'Stationery', description: 'Pens, papers, office supplies', color: '#06B6D4', icon: '✏️', item_count: 124 },
  { id: '7', name: 'Maintenance Tools', description: 'Repair and maintenance equipment', color: '#64748B', icon: '🔧', item_count: 45 },
  { id: '8', name: 'Medical Supplies', description: 'First aid, health equipment', color: '#EF4444', icon: '🩺', item_count: 32 },
];

const colorOptions = [
  '#76C044', '#3B82F6', '#8B5CF6', '#F59E0B', 
  '#EC4899', '#06B6D4', '#64748B', '#EF4444',
  '#10B981', '#6366F1', '#F97316', '#14B8A6',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<typeof initialCategories[0] | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#76C044', icon: '📦' });
  const { toast } = useToast();

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (category?: typeof initialCategories[0]) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description, color: category.color, icon: category.icon });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#76C044', icon: '📦' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Category name is required', variant: 'destructive' });
      return;
    }

    if (editingCategory) {
      setCategories(categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, ...formData }
          : c
      ));
      toast({ title: 'Category Updated', description: `${formData.name} has been updated.` });
    } else {
      const newCategory = {
        id: String(Date.now()),
        ...formData,
        item_count: 0,
      };
      setCategories([...categories, newCategory]);
      toast({ title: 'Category Added', description: `${formData.name} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category && category.item_count > 0) {
      toast({
        title: 'Cannot Delete',
        description: `${category.name} has ${category.item_count} items. Move items first.`,
        variant: 'destructive',
      });
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
    toast({ title: 'Category Deleted', description: 'Category has been removed.' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">{categories.length} categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Update category details' : 'Create a new inventory category'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Electronics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📦"
                  className="w-20"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingCategory ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  {category.icon}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {category.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{category.item_count} items</Badge>
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card className="p-12 text-center">
          <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-muted-foreground mb-4">Create your first category to organize inventory</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Card>
      )}
    </div>
  );
}
