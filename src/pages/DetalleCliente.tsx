
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Cliente, PlanInput } from '@/types/app';
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
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Schema for validation
const planSchema = z.object({
  dieta: z.string().optional(),
  rutina: z.string().optional(),
});

export default function DetalleCliente() {
  const { id } = useParams<{ id: string }>();
  const { user, getCliente, updateClientePlan } = useAuth();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const form = useForm<PlanInput>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      dieta: '',
      rutina: '',
    },
  });

  // Load cliente data
  useEffect(() => {
    if (!id) return;
    
    if (user?.role === 'cliente') {
      toast.error('No tienes permisos para acceder a esta página');
      navigate('/dashboard');
      return;
    }

    const clienteData = getCliente(id);
    if (clienteData) {
      setCliente(clienteData);
      form.reset({
        dieta: clienteData.dieta || '',
        rutina: clienteData.rutina || '',
      });
    } else {
      toast.error('Cliente no encontrado o no tienes permisos para verlo');
      navigate('/clientes');
    }
    
    setLoading(false);
  }, [id, user, navigate, getCliente, form]);

  const onSubmit = async (data: PlanInput) => {
    if (!id) return;

    try {
      await updateClientePlan(id, data);
      // Refresh client data
      const updatedCliente = getCliente(id);
      if (updatedCliente) {
        setCliente(updatedCliente);
      }
    } catch (error) {
      // Error is already handled in the context with toast
      console.error(error);
    }
  };

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
          <p className="text-muted-foreground mb-4">El cliente que buscas no existe o no tienes permisos para verlo.</p>
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
              Usuario: {cliente.usuario} | Creado: {new Date(cliente.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Personalizado</CardTitle>
          <CardDescription>Asigna una dieta y rutina personalizada para este cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="dieta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dieta Personalizada</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Escribe aquí la dieta personalizada para este cliente..." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rutina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rutina de Ejercicios</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Escribe aquí la rutina de ejercicios para este cliente..." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Plan
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
