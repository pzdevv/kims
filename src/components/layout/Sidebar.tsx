import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  ArrowRightLeft,
  BarChart3,
  Settings,
  Users,
  MapPin,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import kavyaLogo from '@/assets/kavya-logo.svg';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager', 'staff', 'viewer'] },
  { icon: Package, label: 'Inventory', path: '/inventory', roles: ['admin', 'manager', 'staff', 'viewer'] },
  { icon: Tags, label: 'Categories', path: '/categories', roles: ['admin', 'manager'] },
  { icon: MapPin, label: 'Areas', path: '/areas', roles: ['admin', 'manager'] },
  { icon: ArrowRightLeft, label: 'Transactions', path: '/transactions', roles: ['admin', 'manager', 'staff'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['admin', 'manager'] },
  { icon: Users, label: 'Users', path: '/users', roles: ['admin'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin', 'manager'] },
];

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, signOut, hasRole } = useAuth();

  const filteredNavItems = navItems.filter((item) =>
    hasRole(item.roles as any)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={kavyaLogo} alt="Kavya" className="h-8" />
            <span className="font-semibold text-sm">Inventory</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        {!isCollapsed && user && (
          <div className="mb-3 px-3 py-2">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-sidebar-primary/20 text-sidebar-primary capitalize">
              {user.role}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            'w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            isCollapsed ? 'justify-center' : 'justify-start'
          )}
          title={isCollapsed ? 'Sign out' : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
