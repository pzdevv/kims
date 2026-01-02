import { useState } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Users } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Demo areas data
const initialAreas = [
  { id: '1', name: 'Physics Lab', description: 'Physics laboratory and equipment storage', item_count: 145, user_count: 3 },
  { id: '2', name: 'Chemistry Lab', description: 'Chemistry laboratory with chemical storage', item_count: 234, user_count: 4 },
  { id: '3', name: 'Biology Lab', description: 'Biology laboratory and specimen storage', item_count: 178, user_count: 3 },
  { id: '4', name: 'Computer Lab', description: 'Computer lab with IT equipment', item_count: 89, user_count: 5 },
  { id: '5', name: 'Library', description: 'Main library and reading rooms', item_count: 456, user_count: 6 },
  { id: '6', name: 'Sports Room', description: 'Sports equipment storage and gym', item_count: 123, user_count: 2 },
  { id: '7', name: 'Admin Office', description: 'Administrative office supplies', item_count: 67, user_count: 8 },
  { id: '8', name: 'Storeroom', description: 'General storage and inventory', item_count: 289, user_count: 2 },
];

export default function AreasPage() {
  const [areas, setAreas] = useState(initialAreas);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<typeof initialAreas[0] | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();

  const filteredAreas = areas.filter((area) =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (area?: typeof initialAreas[0]) => {
    if (area) {
      setEditingArea(area);
      setFormData({ name: area.name, description: area.description });
    } else {
      setEditingArea(null);
      setFormData({ name: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Area name is required', variant: 'destructive' });
      return;
    }

    if (editingArea) {
      setAreas(areas.map(a => 
        a.id === editingArea.id ? { ...a, ...formData } : a
      ));
      toast({ title: 'Area Updated', description: `${formData.name} has been updated.` });
    } else {
      const newArea = {
        id: String(Date.now()),
        ...formData,
        item_count: 0,
        user_count: 0,
      };
      setAreas([...areas, newArea]);
      toast({ title: 'Area Added', description: `${formData.name} has been created.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const area = areas.find(a => a.id === id);
    if (area && area.item_count > 0) {
      toast({
        title: 'Cannot Delete',
        description: `${area.name} has ${area.item_count} items. Move items first.`,
        variant: 'destructive',
      });
      return;
    }
    setAreas(areas.filter(a => a.id !== id));
    toast({ title: 'Area Deleted', description: 'Area has been removed.' });
  };

  const totalItems = areas.reduce((sum, a) => sum + a.item_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Areas & Locations</h1>
          <p className="text-muted-foreground">{areas.length} areas · {totalItems} total items</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Area
            </Button>
          </DialogTrigger>
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingArea ? 'Update' : 'Create'}</Button>
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
              placeholder="Search areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Areas Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredAreas.map((area) => (
          <Card key={area.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleOpenDialog(area)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(area.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-foreground mb-1">{area.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {area.description}
              </p>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{area.item_count} items</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{area.user_count} users</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAreas.length === 0 && (
        <Card className="p-12 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No areas found</h3>
          <p className="text-muted-foreground mb-4">Create areas to organize your inventory locations</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Area
          </Button>
        </Card>
      )}
    </div>
  );
}
