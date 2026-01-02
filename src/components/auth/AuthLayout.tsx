import { ReactNode } from 'react';
import kavyaLogo from '@/assets/kavya-logo.svg';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 flex-col justify-center items-center p-12">
        <div className="max-w-md text-center">
          <img 
            src={kavyaLogo} 
            alt="Kavya School Logo" 
            className="h-20 mx-auto mb-8"
          />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Kavya Inventory Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Efficiently track, manage, and maintain your school's assets, equipment, and supplies.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6 text-left">
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Track Assets</h3>
              <p className="text-sm text-muted-foreground">Complete visibility of all inventory</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Issue & Return</h3>
              <p className="text-sm text-muted-foreground">Streamlined checkout process</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Reports</h3>
              <p className="text-sm text-muted-foreground">Detailed analytics & insights</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground">Secure</h3>
              <p className="text-sm text-muted-foreground">Role-based access control</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img 
              src={kavyaLogo} 
              alt="Kavya School Logo" 
              className="h-16"
            />
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
