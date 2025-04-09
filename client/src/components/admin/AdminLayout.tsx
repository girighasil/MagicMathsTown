import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  MessageSquare,
  MessageCircle,
  HelpCircle,
  Users,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Site Configuration", href: "/admin/site-config", icon: Settings },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Test Series", href: "/admin/test-series", icon: FileText },
    { name: "Testimonials", href: "/admin/testimonials", icon: MessageCircle },
    { name: "Doubt Sessions", href: "/admin/doubt-sessions", icon: HelpCircle },
    { name: "Contact Messages", href: "/admin/contacts", icon: MessageSquare },
    { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    { name: "Promotions", href: "/admin/promotions", icon: MessageSquare },
    { name: "Users", href: "/admin/users", icon: Users },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex h-12 items-center border-b px-4">
                  <strong>Maths Magic Town</strong>
                </div>
                <nav className="flex flex-col gap-1 py-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant={location === item.href ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link href="/">
              <span className="font-semibold text-xl">Maths Magic Town</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex lg:items-center lg:gap-4">
              <span className="text-sm">{user?.fullName}</span>
              <Avatar>
                <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            ))}
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}