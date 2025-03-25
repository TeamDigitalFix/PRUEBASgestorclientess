
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Cliente } from '@/types/app';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileText, Pizza, ActivitySquare, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Planes() {
  const { user, getCliente } = useAuth();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load cliente data
  useEffect(() => {
    if (user?.role !== 'cliente') {
      toast.error('Esta página es solo para clientes');
      navigate('/dashboard');
      return;
    }

    const clienteData = getCliente(user.id);
    if (clienteData) {
      setCliente(clienteData);
    } else {
      toast.error('No se pudo cargar la información del cliente');
    }
    
    setLoading(false);
  }, [user, navigate, getCliente]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!cliente) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">No se pudo cargar la información del cliente.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mis Planes</h1>
        <p className="text-muted-foreground">
          Aquí puedes ver tus planes personalizados de dieta y rutina de ejercicios.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Pizza className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Mi Dieta</CardTitle>
              <CardDescription>Plan alimenticio personalizado</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {cliente.dieta ? (
              <div className="bg-card border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Plan alimenticio</h3>
                </div>
                <div className="whitespace-pre-line">
                  {cliente.dieta}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Aún no tienes un plan de dieta asignado.</p>
                <p className="text-sm mt-2">Tu entrenador asignará uno pronto.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <ActivitySquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Mi Rutina</CardTitle>
              <CardDescription>Plan de ejercicios personalizado</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {cliente.rutina ? (
              <div className="bg-card border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">Plan de ejercicios</h3>
                </div>
                <div className="whitespace-pre-line">
                  {cliente.rutina}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Aún no tienes un plan de ejercicios asignado.</p>
                <p className="text-sm mt-2">Tu entrenador asignará uno pronto.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
