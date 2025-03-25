
import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Menu, 
  X, 
  UserCircle, 
  Users, 
  Home, 
  FileText,
  Settings 
} from 'lucide-react';
import { useAuth } from "@/context/AuthContext";


interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavLinks = () => {
    const links = [
      { path: '/dashboard', label: 'Inicio', icon: <Home className="h-5 w-5" /> },
    ];

    if (user?.role === 'superadmin') {
      links.push({ 
        path: '/entrenadores', 
        label: 'Entrenadores', 
        icon: <Users className="h-5 w-5" /> 
      });
    }

    if (user?.role === 'entrenador') {
      links.push({ 
        path: '/clientes', 
        label: 'Clientes', 
        icon: <Users className="h-5 w-5" /> 
      });
    }

    if (user?.role === 'cliente') {
      links.push({ 
        path: '/perfil', 
        label: 'Mi Perfil', 
        icon: <UserCircle className="h-5 w-5" /> 
      });
      links.push({ 
        path: '/planes', 
        label: 'Mis Planes', 
        icon: <FileText className="h-5 w-5" /> 
      });
    }

    links.push({ 
      path: '/configuracion', 
      label: 'Configuración', 
      icon: <Settings className="h-5 w-5" /> 
    });

    return links;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background animate-fadeIn">
      {/* Mobile header */}
      <header className="md:hidden w-full bg-background border-b border-border p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="font-semibold text-lg">Gestor de Clientes</div>
        <ThemeToggle />
      </header>
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static inset-0 z-10 md:z-auto
          transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition-transform duration-300 ease-in-out
          w-64 h-full bg-sidebar border-r border-border flex flex-col
        `}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="font-bold text-xl">Gestor de Clientes</h1>
          <Button 
            className="md:hidden" 
            variant="ghost" 
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 border-b border-border">
          <div className="flex flex-col">
            <span className="text-sm text-sidebar-foreground/70">Bienvenido</span>
            <span className="font-semibold">{user?.nombre}</span>
            <span className="text-xs text-sidebar-foreground/70 capitalize">{user?.role}</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {getNavLinks().map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md 
                    transition-colors duration-200
                    ${
                      location.pathname === link.path 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-border">
          <Button 
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 min-h-screen md:min-h-0 p-4 overflow-y-auto">
        <div className="hidden md:flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {getNavLinks().find((link) => link.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Page content */}
        <div className="animate-fadeIn">{children}</div>
      </main>
      
      {/* Modal backdrop */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-0"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
