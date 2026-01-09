import { Search, Menu, Bell } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut, userAreas } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Search inventory..."
              className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary/30 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Current Area indicator */}
          {userAreas.length > 0 && userAreas.length < 8 && (
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-xs uppercase tracking-wider font-medium">Areas:</span>
              <div className="flex gap-1">
                {userAreas.slice(0, 3).map((area) => (
                  <span
                    key={area.id}
                    className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium transition-colors hover:bg-primary/20"
                  >
                    {area.name}
                  </span>
                ))}
                {userAreas.length > 3 && (
                  <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                    +{userAreas.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all duration-200">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 animate-scale-in" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer focus:text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
