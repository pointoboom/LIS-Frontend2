import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [, setLocation] = useLocation();
  const { toggleTheme, switchable } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setLocation('/login');
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-white hover:bg-white/10" />
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold leading-tight">Dashboard</h1>
                <p className="text-white/80 text-xs sm:text-sm">Welcome back, Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {switchable && (
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={toggleTheme}
                  title="Toggle theme"
                >
                  <Sun className="hidden dark:block" />
                  <Moon className="block dark:hidden" />
                </Button>
              )}
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={handleLogout}
              >
                <LogOut className="mr-2" /> Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 bg-background min-h-[calc(100svh-64px)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
