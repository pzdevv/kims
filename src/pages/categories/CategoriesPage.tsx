import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Palette, Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCategories, CategoryWithStats } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { CSVImportDialog } from '@/components/CSVImportDialog';

const colorOptions = [
  '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B',
  '#EC4899', '#06B6D4', '#64748B', '#EF4444',
  '#F97316', '#6366F1', '#84CC16', '#14B8A6',
];

const iconOptions = ['📦', '💻', '🔬', '🪑', '⚽', '📚', '✏️', '🔧', '🩺', '🎨', '🎹', '🧪'];

export default function CategoriesPage() {
  const { hasRole } = useAuth();
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithStats | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#76C044', icon: '📦' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories(true); // Fetch with stats
  }, [fetchCategories]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (category?: CategoryWithStats) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#76C044',
        icon: category.icon || '📦',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#76C044', icon: '📦' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: formData.name,
          description: formData.description || null,
          color: formData.color,
          icon: formData.icon,
        });
      } else {
        await createCategory({
          name: formData.name,
          description: formData.description || undefined,
          color: formData.color,
          icon: formData.icon,
        });
      }
      setIsDialogOpen(false);
      fetchCategories(true); // Refresh with stats
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category && (category.item_count || 0) > 0) {
      return; // Toast is shown by the hook
    }
    await deleteCategory(id);
  };

  const canManage = hasRole(['admin', 'general_manager']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Categories</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${categories.length} categories`}
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        )}
      </div>

      {/* CSV Import Dialog */}
      <CSVImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        type="categories"
        onImportComplete={() => fetchCategories(true)}
      />

      {/* Search */}
      <Card glass>
        <CardContent className="p-4">
          <div className="relative max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/30 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading categories...</p>
        </Card>
      )}

      {/* Categories Grid */}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category, index) => (
            <Card
              key={category.id}
              className="group relative hover:shadow-xl transition-all duration-200 ease-out animate-fade-in opacity-0 cursor-pointer"
              style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
            >
              <Link to={`/categories/${category.id}`} className="block">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-200 ease-out group-hover:scale-110"
                      style={{ backgroundColor: (category.color || '#10B981') + '20' }}
                    >
                      {category.icon || '📦'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {category.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{category.item_count || 0} items</Badge>
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: category.color || '#76C044' }}
                    />
                  </div>
                  {category.total_value !== undefined && category.total_value > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Value: NPR {category.total_value.toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Link>
              {canManage && (
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenDialog(category);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive bg-background/80 backdrop-blur-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(category.id);
                    }}
                    disabled={(category.item_count || 0) > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredCategories.length === 0 && (
        <Card className="p-12 text-center animate-fade-in">
          <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
            <Palette className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No categories found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try a different search term' : 'Create your first category to organize inventory'}
          </p>
          {canManage && !searchQuery && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          )}
        </Card>
      )}

      {/* Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`h-10 w-10 rounded-lg border-2 text-xl transition-all ${formData.icon === icon ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                      }`}
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition-all ${formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                      }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingCategory ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
