import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, MapPin, Users, Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAreas, AreaWithStats } from '@/hooks/useAreas';
import { useAuth } from '@/contexts/AuthContext';
import { CSVImportDialog } from '@/components/CSVImportDialog';

export default function AreasPage() {
  const { hasRole } = useAuth();
  const { areas, loading, fetchAreas, createArea, updateArea, deleteArea } = useAreas();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaWithStats | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', location: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAreas(true); // Fetch with stats
  }, [fetchAreas]);

  const filteredAreas = areas.filter((area) =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (area?: AreaWithStats) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        name: area.name,
        description: area.description || '',
        location: area.location || '',
      });
    } else {
      setEditingArea(null);
      setFormData({ name: '', description: '', location: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setSaving(true);
    try {
      if (editingArea) {
        await updateArea(editingArea.id, {
          name: formData.name,
          description: formData.description || null,
          location: formData.location || null,
        });
      } else {
        await createArea({
          name: formData.name,
          description: formData.description || undefined,
          location: formData.location || undefined,
        });
      }
      setIsDialogOpen(false);
      fetchAreas(true); // Refresh with stats
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const area = areas.find((a) => a.id === id);
    if (area && (area.item_count || 0) > 0) {
      return; // Toast is shown by the hook
    }
    await deleteArea(id);
  };

  const totalItems = areas.reduce((sum, a) => sum + (a.item_count || 0), 0);
  const canManage = hasRole(['admin']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Areas & Locations</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${areas.length} areas · ${totalItems} total items`}
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
              Add Area
            </Button>
          </div>
        )}
      </div>

      {/* CSV Import Dialog */}
      <CSVImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        type="areas"
        onImportComplete={() => fetchAreas(true)}
      />

      {/* Search */}
      <Card glass>
        <CardContent className="p-4">
          <div className="relative max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search areas..."
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
          <p className="text-muted-foreground">Loading areas...</p>
        </Card>
      )}

      {/* Areas Grid */}
      {!loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAreas.map((area, index) => (
            <Card
              key={area.id}
              className="group relative hover:shadow-xl transition-all duration-200 ease-out animate-fade-in opacity-0 cursor-pointer"
              style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
            >
              <Link to={`/areas/${area.id}`} className="block">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center transition-transform duration-200 ease-out group-hover:scale-110">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-foreground mb-1">{area.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                    {area.description || 'No description'}
                  </p>
                  {area.location && (
                    <p className="text-xs text-muted-foreground mb-3">
                      📍 {area.location}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{area.item_count || 0} items</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{area.user_count || 0} users</span>
                    </div>
                  </div>
                  {area.total_value !== undefined && area.total_value > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Value: NPR {area.total_value.toLocaleString()}
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
                      handleOpenDialog(area);
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
                      handleDelete(area.id);
                    }}
                    disabled={(area.item_count || 0) > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredAreas.length === 0 && (
        <Card className="p-12 text-center animate-fade-in">
          <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No areas found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try a different search term' : 'Create areas to organize your inventory locations'}
          </p>
          {canManage && !searchQuery && (
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Area
            </Button>
          )}
        </Card>
      )}

      {/* Area Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingArea ? 'Edit Area' : 'Add Area'}</DialogTitle>
            <DialogDescription>
              {editingArea ? 'Update area details' : 'Create a new area/location'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Physics Lab"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Building A, Floor 2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this area"
                rows={3}
              />
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
              ) : editingArea ? (
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
