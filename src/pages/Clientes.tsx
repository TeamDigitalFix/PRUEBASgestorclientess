import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  fecha_inicio?: string;
  dieta?: string;
  rutina?: string;
}

export default function Clientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const cargarClientes = async () => {
    if (!user?.nombre) return;

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("nombre_entrenador", user.nombre);

    if (!error) setClientes(data || []);
  };

  useEffect(() => {
    cargarClientes();
  }, [user]);

  const guardarCambios = async () => {
    if (!clienteSeleccionado) return;

    await supabase
      .from("clientes")
      .update({
        dieta: clienteSeleccionado.dieta,
        rutina: clienteSeleccionado.rutina,
      })
      .eq("id", clienteSeleccionado.id);

    setClienteSeleccionado(null);
    cargarClientes();
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mis Clientes</h1>
      <input
        type="text"
        placeholder="Buscar cliente por nombre"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientesFiltrados.map((cliente) => (
          <div
            key={cliente.id}
            className="border rounded-xl p-4 shadow bg-white space-y-2"
          >
            <p><strong>Nombre:</strong> {cliente.nombre}</p>
            <p><strong>Teléfono:</strong> {cliente.telefono || "No especificado"}</p>
            <p><strong>Dirección:</strong> {cliente.direccion || "No especificada"}</p>
            <p><strong>Fecha de inicio:</strong> {cliente.fecha_inicio || "No especificada"}</p>
            <Button
              onClick={() => setClienteSeleccionado(cliente)}
              className="mt-2"
            >
              Ver Dieta/Rutina
            </Button>
          </div>
        ))}
      </div>

      {/* Modal para editar dieta y rutina */}
      <Dialog open={!!clienteSeleccionado} onOpenChange={() => setClienteSeleccionado(null)}>
        <DialogContent className="w-full max-w-full md:max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar dieta y rutina</DialogTitle>
          </DialogHeader>

          {clienteSeleccionado && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dieta</label>
                <ReactQuill
                  value={clienteSeleccionado.dieta || ""}
                  onChange={(val) =>
                    setClienteSeleccionado((prev) =>
                      prev ? { ...prev, dieta: val } : null
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rutina</label>
                <ReactQuill
                  value={clienteSeleccionado.rutina || ""}
                  onChange={(val) =>
                    setClienteSeleccionado((prev) =>
                      prev ? { ...prev, rutina: val } : null
                    )
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button onClick={guardarCambios}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
