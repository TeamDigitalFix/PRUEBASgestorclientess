
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, Shield } from 'lucide-react';

export default function Configuracion() {
  const { user } = useAuth();

  const getRoleText = () => {
    switch (user?.role) {
      case 'superadmin':
        return 'Superadministrador';
      case 'entrenador':
        return 'Entrenador';
      case 'cliente':
        return 'Cliente';
      default:
        return 'Usuario';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tu cuenta y preferencias.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la cuenta</CardTitle>
            <CardDescription>Detalles de tu cuenta de usuario.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Nombre de usuario</h3>
                  <p className="text-muted-foreground">{user?.nombre}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Rol de usuario</h3>
                  <p className="text-muted-foreground">{getRoleText()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
