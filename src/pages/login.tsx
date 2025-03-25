import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/Layout/AuthLayout';
import LoginForm from '@/components/AuthForms/LoginForm';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error obteniendo sesión:", error.message);
      }
      if (data.session) {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-6xl mx-auto grid gap-8 lg:grid-cols-2 items-center min-h-screen px-4">
        {/* Zona izquierda - Texto e imagen */}
        <div className="order-2 lg:order-1 animate-fadeIn space-y-6 text-center lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <img
              src="https://cdn-icons-png.flaticon.com/128/3160/3160174.png"
              alt="cliente feliz"
              className="h-24 w-24"
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Bienvenido a tu espacio personal
          </h1>
          <p className="text-muted-foreground text-base">
            Consulta tus planes de dieta y entrenamiento. Realiza seguimiento y mejora tu bienestar con la ayuda de tu entrenador.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground max-w-md mx-auto lg:mx-0">
            <div className="bg-muted/40 p-4 rounded-lg shadow-sm">
              🥗 Dietas personalizadas
            </div>
            <div className="bg-muted/40 p-4 rounded-lg shadow-sm">
              🏋️ Rutinas guiadas
            </div>
            <div className="bg-muted/40 p-4 rounded-lg shadow-sm">
              📈 Progreso visible
            </div>
            <div className="bg-muted/40 p-4 rounded-lg shadow-sm">
              🤝 Apoyo continuo
            </div>
          </div>
        </div>

        {/* Zona derecha - Login */}
        <div className="order-1 lg:order-2 animate-fadeInUp bg-white p-8 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">Inicia sesión</h2>
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
}
