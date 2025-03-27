import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Cliente } from '@/types/app';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, User } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function DetalleCliente() {
  const { id } = useParams<{ id: string }>();
  const { user, getCliente } = useAuth();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    if (user?.role === 'cliente') {
      navigate('/dashboard');
      return;
    }

    const clienteData = getCliente(id);
    if (clienteData) {
      setCliente(clienteData);
    } else {
      navigate('/clientes');
    }

    setLoading(false);
  }, [id, user, navigate, getCliente]);

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
          <h1 className="text-2xl font-bold mb-2">Cliente no encontrado</h1>
          <p className="text-muted-foreground mb-4">
            El cliente que buscas no existe o no tienes permisos para verlo.
          </p>
          <Button onClick={() => navigate('/clientes')}>Volver a clientes</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/clientes')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a clientes
        </Button>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{cliente.nombre}</h1>
            <p className="text-muted-foreground">
              Usuario: {cliente.usuario} | Creado:{' '}
              {new Date(cliente.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Plan Personalizado</CardTitle>
          <CardDescription>
            Visualiza la dieta y rutina personalizada asignada a este cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Dieta Personalizada</h2>
              <div
                className="prose max-w-none ql-editor bg-white p-4 rounded shadow"
                dangerouslySetInnerHTML={{ __html: cliente.dieta || "<p>Sin dieta asignada.</p>" }}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Rutina de Ejercicios</h2>
              <div
                className="prose max-w-none ql-editor bg-white p-4 rounded shadow"
                dangerouslySetInnerHTML={{ __html: cliente.rutina || "<p>Sin rutina asignada.</p>" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
