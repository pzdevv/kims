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
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-out',
        'bg-sidebar/80 backdrop-blur-xl text-sidebar-foreground',
        'border-r border-white/10 dark:border-white/5',
        'shadow-xl shadow-black/5',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Gradient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none rounded-r-xl" />

      {/* Header */}
      <div className="relative flex h-16 items-center justify-between border-b border-white/10 dark:border-white/5 px-4">
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img
              src={kavyaLogo}
              alt="Kavya"
              className="h-8 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-semibold text-sm">
              Inventory
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-white/10 transition-all duration-200"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-1 p-3">
        {filteredNavItems.map((item, index) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                'animate-fade-in opacity-0',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'text-sidebar-foreground hover:bg-white/10 hover:translate-x-1',
                isCollapsed && 'justify-center'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                  !isActive && "group-hover:scale-110"
                )}
              />
              {!isCollapsed && <span>{item.label}</span>}
              {isActive && !isCollapsed && (
                <span className="ml-auto h-2 w-2 rounded-full bg-primary-foreground/60 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="relative border-t border-white/10 dark:border-white/5 p-3">
        {!isCollapsed && user && (
          <div className="mb-3 px-3 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
            <span className="inline-flex mt-1.5 px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary capitalize font-medium">
              {user.role}
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            'w-full text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200',
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
