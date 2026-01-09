import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-success/10 via-transparent to-transparent rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-md lg:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-out lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar isCollapsed={false} onToggle={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          'relative flex-1 flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Footer with glassmorphism */}
        <footer className="border-t border-border/30 bg-card/50 backdrop-blur-xl py-4 px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>
              © KIMS 2026 — Built by{' '}
              <a
                href="https://swayamdulal.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium transition-colors"
              >
                Swayam
              </a>
              {' '}&{' '}
              <a
                href="https://bandhanpokhrel.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium transition-colors"
              >
                Bandhan
              </a>
            </p>
            <p className="text-xs opacity-70">Kavya Inventory Management System</p>
          </div>
          {/* Hidden credits - visible in page source */}
          {/* <!-- 
            =====================================================
            KIMS - Kavya Inventory Management System
            Website built by Swayam (https://swayamdulal.tech)
            Developed with ❤️ for Kavya School
            =====================================================
          --> */}
        </footer>
      </div>

      {/* Hidden meta credit - truly invisible */}
      <meta name="author" content="Swayam Dulal - https://swayamdulal.tech" />
    </div>
  );
}
