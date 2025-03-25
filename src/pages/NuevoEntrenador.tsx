
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { EntrenadorInput } from '@/types/app';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Schema for validation
const entrenadorSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  usuario: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().min(5, 'La contraseña debe tener al menos 5 caracteres'),
});

export default function NuevoEntrenador() {
  const { user, createEntrenador } = useAuth();
  const navigate = useNavigate();

  const form = useForm<EntrenadorInput>({
    resolver: zodResolver(entrenadorSchema),
    defaultValues: {
      nombre: '',
      usuario: '',
      password: '',
    },
  });

  // Check if the user is a superadmin
  useEffect(() => {
    if (user?.role !== 'superadmin') {
      toast.error('No tienes permisos para acceder a esta página');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const onSubmit = async (data: EntrenadorInput) => {
    try {
      await createEntrenador(data);
      navigate('/entrenadores');
    } catch (error) {
      // Error is already handled in the context with toast
      console.error(error);
    }
  };

  // Redirect if not superadmin
  if (user?.role !== 'superadmin') {
    return <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-4">No tienes permisos para acceder a esta página.</p>
        <Button onClick={() => navigate('/dashboard')}>Volver al Dashboard</Button>
      </div>
    </DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/entrenadores')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a entrenadores
        </Button>
        <h1 className="text-3xl font-bold mb-2">Nuevo Entrenador</h1>
        <p className="text-muted-foreground">
          Crea una nueva cuenta de entrenador en el sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Entrenador</CardTitle>
          <CardDescription>Ingresa los datos del nuevo entrenador.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="usuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: entrenador_juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Contraseña segura" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Entrenador
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
