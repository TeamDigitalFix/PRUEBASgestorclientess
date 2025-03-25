
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { ClienteInput, Entrenador } from '@/types/app';
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
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema for validation
const clienteSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  usuario: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().min(5, 'La contraseña debe tener al menos 5 caracteres'),
  entrenadorId: z.string().min(1, 'Debes seleccionar un entrenador'),
});

export default function NuevoCliente() {
  const { user, createCliente, getEntrenadores } = useAuth();
  const navigate = useNavigate();
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);

  const form = useForm<ClienteInput>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: '',
      usuario: '',
      password: '',
      entrenadorId: user?.role === 'entrenador' ? user.id : '',
    },
  });

  // Check if the user is authorized and load entrenadores for superadmin
  useEffect(() => {
    if (user?.role === 'cliente') {
      toast.error('No tienes permisos para acceder a esta página');
      navigate('/dashboard');
      return;
    }

    if (user?.role === 'superadmin') {
      setEntrenadores(getEntrenadores());
    }
  }, [user, navigate, getEntrenadores]);

  const onSubmit = async (data: ClienteInput) => {
    try {
      await createCliente(data);
      navigate('/clientes');
    } catch (error) {
      // Error is already handled in the context with toast
      console.error(error);
    }
  };

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
        <h1 className="text-3xl font-bold mb-2">Nuevo Cliente</h1>
        <p className="text-muted-foreground">
          Crea una nueva cuenta de cliente en el sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
          <CardDescription>Ingresa los datos del nuevo cliente.</CardDescription>
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
                      <Input placeholder="Ej: María López" {...field} />
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
                      <Input placeholder="Ej: cliente_maria" {...field} />
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
              
              {user?.role === 'superadmin' && (
                <FormField
                  control={form.control}
                  name="entrenadorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entrenador Asignado</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un entrenador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {entrenadores.map((entrenador) => (
                            <SelectItem key={entrenador.id} value={entrenador.id}>
                              {entrenador.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="flex justify-end">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Guardar Cliente
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
