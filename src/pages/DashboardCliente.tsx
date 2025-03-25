import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Settings,
  LogOut,
  Phone,
  MessageSquare,
} from "lucide-react";

export default function DashboardCliente() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const { user } = useAuth();
  const [cliente, setCliente] = useState<any>(null);
  const [estilo, setEstilo] = useState<any>({});
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [mostrarModalEntrenador, setMostrarModalEntrenador] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user?.id) return;

      const { data: datosCliente } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", user.id)
        .single();
      setCliente(datosCliente);
      setTelefono(datosCliente?.telefono || "");
      setDireccion(datosCliente?.direccion || "");

      // Cargar estilos del entrenador si existe ID
      if (datosCliente?.entrenador_id) {
        const { data: estilos } = await supabase
          .from("estilos_entrenador")
          .select("*")
          .eq("id", datosCliente.entrenador_id)
          .single();
        if (estilos) setEstilo(estilos);
      }
    };

    cargarDatos();
  }, [user]);

  const guardarCambios = async () => {
    if (!cliente) return;
    const { error } = await supabase
      .from("clientes")
      .update({ telefono, direccion })
      .eq("id", cliente.id);
    if (!error) {
      const actualizado = { ...cliente, telefono, direccion };
      setCliente(actualizado);
      toast.success("Cambios guardados correctamente");
    } else {
      toast.error("Error al guardar los cambios");
    }
  };

  const cerrarSesion = () => {
    window.location.href = "/";
  };

  if (!cliente) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-500 text-lg">Cargando tus datos...</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen p-4 max-w-7xl mx-auto space-y-6"
      style={{
        backgroundColor: estilo?.color_secundario || "#ffffff",
        backgroundImage: estilo?.imagen_fondo ? `url(${estilo.imagen_fondo})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Encabezado */}
      <div
        className="text-white p-6 rounded-2xl shadow-md flex justify-between items-center flex-wrap gap-4"
        style={{
          backgroundColor: estilo?.color_primario || "#22c55e",
          backgroundImage: estilo?.imagen_cabecera
            ? `url(${estilo.imagen_cabecera})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div>
          <h2 className="text-2xl font-bold">
            ¡Hola, {cliente.nombre}!
          </h2>
          <p className="text-sm mt-1">
            {estilo?.mensaje_bienvenida || "Tu panel de seguimiento personalizado"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setMostrarPerfil(!mostrarPerfil)}
            className="bg-white text-green-600 hover:bg-gray-100"
          >
            <Settings className="h-5 w-5 mr-2" />
            Ajustes
          </Button>
          <Button
            variant="destructive"
            onClick={cerrarSesion}
            className="bg-white text-red-600 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Ajustes del cliente */}
      {mostrarPerfil && (
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
            ✏️ Editar mi perfil
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <Button onClick={guardarCambios}>Guardar cambios</Button>
          </div>
        </div>
      )}

      {/* Información general + dieta/rutina */}
      {!mostrarPerfil && (
        <>
          <div className="bg-white p-5 rounded-2xl shadow space-y-3">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
              📋 Información general
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>📅 Fecha de inicio:</strong>{" "}
                {cliente.fecha_inicio || "Sin especificar"}
              </p>
              <p>
                <strong>👨‍🏫 Entrenador:</strong>{" "}
                <span
                  onClick={() => setMostrarModalEntrenador(true)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  {cliente.nombre_entrenador || "Sin asignar"}
                </span>
              </p>
            </div>
          </div>

         <Accordion type="multiple" className="space-y-4">
  <AccordionItem value="dieta">
    <AccordionTrigger className="bg-gray-100 px-4 py-3 rounded-md font-medium shadow-inner">
      🥗 <span className="ml-2 text-green-600">Tu dieta actual</span>
    </AccordionTrigger>
    <AccordionContent>
      {cliente.dieta ? (
        <div className="bg-gray-100 p-4 rounded-md mt-2 shadow-inner">
          <div
            className="text-sm text-gray-800 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: cliente.dieta }}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-400 mt-2">No hay dieta asignada aún.</p>
      )}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="rutina">
    <AccordionTrigger className="bg-gray-100 px-4 py-3 rounded-md font-medium shadow-inner">
      🏋️‍♀️ <span className="ml-2 text-indigo-600">Tu rutina de ejercicios</span>
    </AccordionTrigger>
    <AccordionContent>
      {cliente.rutina ? (
        <div className="bg-gray-100 p-4 rounded-md mt-2 shadow-inner">
          <div
            className="text-sm text-gray-800 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: cliente.rutina }}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-400 mt-2">No hay rutina asignada aún.</p>
      )}
    </AccordionContent>
  </AccordionItem>
</Accordion>


        </>
      )}

      {/* Modal Entrenador */}
      <Dialog open={mostrarModalEntrenador} onOpenChange={setMostrarModalEntrenador}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tu entrenador</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Nombre:</strong> {cliente.nombre_entrenador || "No disponible"}</p>
            <p><strong>Teléfono:</strong> {cliente.telefono_entrenador || "No disponible"}</p>
          </div>
          {cliente.telefono_entrenador && (
            <DialogFooter className="pt-4">
              <a
                href={`https://wa.me/${cliente.telefono_entrenador}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Escribir por WhatsApp
                </Button>
              </a>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
