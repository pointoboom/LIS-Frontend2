import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { LogOut, Sun, Moon, Bell, Search, ChevronDown, FlaskConical } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group';

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

  const [path] = useLocation();
  const title = (() => {
    if (path?.startsWith('/dashboard/reports')) return 'Reports';
    if (path?.startsWith('/dashboard/category')) return 'Category';
    if (path?.startsWith('/dashboard/blood')) return 'Blood';
    if (path?.startsWith('/dashboard/other')) return 'Other';
    return 'Dashboard';
  })();

  const isActive = (p: string) => (path || '').startsWith(p);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-40 border-b bg-gradient-to-br from-background/70 via-background/60 to-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-screen-2xl px-4">
            <div className="flex items-center gap-3 py-3">
              <SidebarTrigger className="hover:bg-muted" />

              {/* Brand */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white grid place-items-center shadow-sm">
                  <FlaskConical className="size-4" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold">LIS</div>
                  <div className="text-xs text-muted-foreground">Laboratory</div>
                </div>
              </div>

            

              {/* Right side */}
              <div className="ml-auto flex items-center gap-2">
                <div className="hidden md:flex items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9 rounded-full w-56" />
                  </div>
                </div>

                {switchable && (
                  <Button
                    variant="ghost"
                    className="hover:bg-muted rounded-full"
                    onClick={toggleTheme}
                    title="Toggle theme"
                  >
                    <Sun className="hidden dark:block" />
                    <Moon className="block dark:hidden" />
                  </Button>
                )}

                <Button variant="ghost" className="hover:bg-muted rounded-full" aria-label="Notifications">
                  <Bell />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hover:bg-muted px-2 rounded-full">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <ChevronDown className="size-4 text-muted-foreground" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Signed in as admin</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation('/dashboard')}>Dashboard</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/dashboard/reports')}>My Reports</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation('/dashboard/category')}>Categories</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 size-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
