import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LogOut } from "lucide-react";

interface Cliente {
  id: string;
  nombre: string;
  usuario: string;
  fecha_inicio?: string;
  entrenador?: string;
  dieta?: string;
  rutina?: string;
  nombre_entrenador?: string;
  telefono_entrenador?: string;
  entrenador_id?: string;
}

interface Estilo {
  color_primario: string;
  color_secundario: string;
  color_texto: string;
  imagen_logo: string;
  imagen_fondo: string;
  imagen_cabecera: string;
  mensaje_bienvenida: string;
  icono_dieta_url?: string;
  icono_rutina_url?: string;
}


export default function DashboardCliente() {
  const { user } = useAuth();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [estilo, setEstilo] = useState<Estilo | null>(null);
  const [mostrarDieta, setMostrarDieta] = useState(false);
  const [mostrarRutina, setMostrarRutina] = useState(false);

  useEffect(() => {
    if (!user) return;
    cargarCliente();
  }, [user]);

  const cargarCliente = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (data) {
      setCliente(data);
      cargarEstilo(data.entrenador_id);
    }
  };

  const cargarEstilo = async (entrenadorId: string) => {
    const { data } = await supabase
      .from("estilos_entrenador")
      .select("*")
      .eq("id", entrenadorId)
      .single();

    if (data) {
      setEstilo(data);
    }
  };

  const cerrarSesion = () => {
    window.location.href = "https://rutinaydieta.vercel.app/";
  };

  const procesarHTML = (html: string | undefined) => {
    if (!html) return "<p>Sin contenido</p>";
    return html.replace(
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/g,
      (_match, videoId) =>
        `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
    );
  };

  return (
    <div
      className="min-h-screen w-full overflow-hidden"
      style={{
        backgroundImage: estilo?.imagen_fondo ? `url(${estilo.imagen_fondo})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Cabecera */}
      <div
        className="mx-6 mt-6 mb-10 rounded-xl text-white p-6 relative shadow-xl"
        style={{
          backgroundColor: estilo?.color_primario || "#3b82f6",
          backgroundImage: estilo?.imagen_cabecera ? `url(${estilo.imagen_cabecera})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <button
          onClick={cerrarSesion}
          className="absolute top-4 right-4 text-white hover:opacity-80 transition"
          title="Cerrar sesión"
        >
          <LogOut className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-start justify-start">
          <h1 className="text-3xl font-bold mb-1">
            ¡Hola {cliente?.nombre}!
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Entrenador: {cliente?.nombre_entrenador}
            </span>
            {cliente?.telefono_entrenador && (
              <a
                href={`https://wa.me/${cliente.telefono_entrenador}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/016/716/480/small/whatsapp-icon-free-png.png"
                  alt="WhatsApp"
                  className="h-5 w-5"
                />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Botones flotantes */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex gap-14 z-50">
        <div className="flex flex-col items-center">
          <span className="text-white text-sm font-semibold mb-2">DIETA</span>
          <button
            onClick={() => setMostrarDieta(true)}
            className="bg-white rounded-full p-3 shadow-lg hover:scale-105 transition"
          >
            <img
              src={estilo?.icono_dieta_url || "https://cdn-icons-png.flaticon.com/512/706/706195.png"}
              alt="Dieta"
              className="h-10 w-10"
            />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-white text-sm font-semibold mb-2">RUTINA</span>
          <button
            onClick={() => setMostrarRutina(true)}
            className="bg-white rounded-full p-3 shadow-lg hover:scale-105 transition"
          >
            <img
              src={estilo?.icono_rutina_url || "https://cdn-icons-png.flaticon.com/512/2780/2780119.png"}
              alt="Rutina"
              className="h-10 w-10"
            />
          </button>
        </div>
      </div>

      {/* Modal Dieta */}
      <Dialog open={mostrarDieta} onOpenChange={setMostrarDieta}>
        <DialogContent className="max-w-2xl rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Dieta actual</DialogTitle>
          </DialogHeader>
          <div
            className="prose max-w-full p-4 bg-white text-black rounded-lg shadow-inner overflow-y-auto max-h-[60vh] text-base [&_p]:my-1 [&_ul]:my-2 [&_li]:my-1 [&_h1]:mb-2 [&_h2]:mb-2"
            dangerouslySetInnerHTML={{ __html: procesarHTML(cliente?.dieta) }}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Rutina */}
      <Dialog open={mostrarRutina} onOpenChange={setMostrarRutina}>
        <DialogContent className="max-w-2xl rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Rutina actual</DialogTitle>
          </DialogHeader>
          <div
            className="prose max-w-full p-4 bg-white text-black rounded-lg shadow-inner overflow-y-auto max-h-[60vh] text-base [&_p]:my-1 [&_ul]:my-2 [&_li]:my-1 [&_h1]:mb-2 [&_h2]:mb-2"
            dangerouslySetInnerHTML={{ __html: procesarHTML(cliente?.rutina) }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
