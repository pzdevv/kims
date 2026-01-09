import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  MoreHorizontal,
  User,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsers, UserWithAreas } from '@/hooks/useUsers';
import { useAreas } from '@/hooks/useAreas';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/database';

const roleColors: Record<string, string> = {
  admin: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  general_manager: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  manager: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

export default function UsersPage() {
  const { hasRole } = useAuth();
  const { users, loading, fetchUsers, inviteUser, resetUserPassword, updateUser, toggleUserActive, assignAreasToUser } = useUsers();
  const { areas, fetchAreas } = useAreas();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithAreas | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'manager' as UserRole,
    department: '',
    phone: '',
    areas: [] as string[],
  });
  const [createFormData, setCreateFormData] = useState({
    email: '',
    role: 'manager' as UserRole,
    areaIds: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchAreas();
  }, [fetchUsers, fetchAreas]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenDialog = (user?: UserWithAreas) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        role: user.role,
        department: user.department || '',
        phone: user.phone || '',
        areas: user.areas.map((a) => a.id),
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', role: 'manager', department: '', phone: '', areas: [] });
    }
    setIsDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!createFormData.email) {
      return;
    }
    setSaving(true);
    try {
      await inviteUser(createFormData);
      setIsCreateDialogOpen(false);
      setCreateFormData({ email: '', role: 'manager', areaIds: [] });
    } finally {
      setSaving(false);
    }
  };

  const handleAreaToggle = (areaId: string) => {
    setFormData((prev) => ({
      ...prev,
      areas: prev.areas.includes(areaId)
        ? prev.areas.filter((a) => a !== areaId)
        : [...prev.areas, areaId],
    }));
  };

  const handleSave = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      // Update user profile
      await updateUser(editingUser.id, {
        name: formData.name,
        role: formData.role,
        department: formData.department || null,
        phone: formData.phone || null,
      });

      // Update area assignments
      await assignAreasToUser(editingUser.id, formData.areas);

      setIsDialogOpen(false);
      fetchUsers(); // Refresh the list
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    await toggleUserActive(userId, !currentStatus);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!hasRole(['admin'])) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            Only administrators can manage users.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">User Management</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${users.length} users`}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card glass>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/30 transition-all"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {loading ? (
        <Card className="p-12 text-center animate-fade-in">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading users...</p>
        </Card>
      ) : (
        <Card glass>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Department</th>
                  <th className="text-left p-4 font-medium">Areas</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-muted/30 transition-colors animate-fade-in opacity-0"
                    style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={roleColors[user.role] || roleColors.viewer}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {user.department || '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {user.areas.slice(0, 2).map((area) => (
                          <Badge key={area.id} variant="outline" className="text-xs">
                            {area.name}
                          </Badge>
                        ))}
                        {user.areas.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.areas.length - 2}
                          </Badge>
                        )}
                        {user.areas.length === 0 && (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(user.id, user.is_active)}
                          >
                            {user.is_active ? (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && filteredUsers.length === 0 && (
        <Card className="p-12 text-center animate-fade-in">
          <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editingUser?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="general_manager">General Manager</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Science Department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned Areas</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {areas.map((area) => (
                  <div key={area.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={area.id}
                      checked={formData.areas.includes(area.id)}
                      onCheckedChange={() => handleAreaToggle(area.id)}
                    />
                    <label htmlFor={area.id} className="text-sm cursor-pointer">
                      {area.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an invitation email. The user will set their name and password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                value={createFormData.email}
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                placeholder="user@kavyaschool.edu.np"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Role</Label>
              <Select
                value={createFormData.role}
                onValueChange={(value: UserRole) => setCreateFormData({ ...createFormData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="general_manager">General Manager</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned Areas</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {areas.map((area) => (
                  <div key={area.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`create-area-${area.id}`}
                      checked={createFormData.areaIds.includes(area.id)}
                      onCheckedChange={(checked) => {
                        setCreateFormData({
                          ...createFormData,
                          areaIds: checked
                            ? [...createFormData.areaIds, area.id]
                            : createFormData.areaIds.filter((id) => id !== area.id),
                        });
                      }}
                    />
                    <label htmlFor={`create-area-${area.id}`} className="text-sm cursor-pointer">
                      {area.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={saving || !createFormData.email}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
