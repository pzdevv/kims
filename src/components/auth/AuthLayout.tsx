import { ReactNode } from 'react';
import kavyaLogo from '@/assets/kavya-logo.svg';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-success/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-background to-accent/5 flex-col justify-center items-center p-12 relative">
        <div className="max-w-md text-center animate-fade-in">
          <img
            src={kavyaLogo}
            alt="Kavya School Logo"
            className="h-20 mx-auto mb-8 animate-float"
          />
          <h1 className="text-3xl font-bold text-foreground mb-4 tracking-tight">
            Kavya Inventory Management
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Efficiently track, manage, and maintain your school's assets, equipment, and supplies.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            <div className="group bg-card/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20">
              <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Track Assets</h3>
              <p className="text-sm text-muted-foreground mt-1">Complete visibility of all inventory</p>
            </div>
            <div className="group bg-card/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Issue & Return</h3>
              <p className="text-sm text-muted-foreground mt-1">Streamlined checkout process</p>
            </div>
            <div className="group bg-card/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Reports</h3>
              <p className="text-sm text-muted-foreground mt-1">Detailed analytics & insights</p>
            </div>
            <div className="group bg-card/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Secure</h3>
              <p className="text-sm text-muted-foreground mt-1">Role-based access control</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src={kavyaLogo}
              alt="Kavya School Logo"
              className="h-16 animate-float"
            />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-premium">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
