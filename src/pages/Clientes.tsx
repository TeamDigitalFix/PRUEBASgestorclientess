"use client";

import { useEffect, useRef, useState } from "react";
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
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";

interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  direccion?: string;
  fecha_inicio?: string;
  dieta?: string;
  rutina?: string;
}

// Convierte links de YouTube en iframes
function convertirYoutubeEnEmbeds(html: string): string {
  const regex = /https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/g;
  return html.replace(regex, (match, _, __, videoId) => {
    const src = `https://www.youtube.com/embed/${videoId}`;
    return `<iframe width="100%" height="315" src="${src}" frameborder="0" allowfullscreen></iframe>`;
  });
}

export default function Clientes() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = () => {
    const url = prompt("Pega el enlace de la imagen:");
    if (url) {
      const quill = quillRef.current?.getEditor();
      const range = quill?.getSelection();
      if (range) {
        quill?.insertEmbed(range.index, "image", url, "user");
      }
    }
  };

  const videoHandler = () => {
    const url = prompt("Pega el enlace de YouTube:");
    if (url) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w\-]+)/);
      if (match) {
        const videoId = match[1];
        const src = `https://www.youtube.com/embed/${videoId}`;
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection();
        if (range) {
          quill?.clipboard.dangerouslyPasteHTML(
            range.index,
            `<iframe width="100%" height="315" src="${src}" frameborder="0" allowfullscreen></iframe>`,
            "user"
          );
        }
      } else {
        alert("URL de YouTube no válida");
      }
    }
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
        ["customImage", "customVideo"], // botones personalizados
      ],
      handlers: {
        customImage: imageHandler,
        customVideo: videoHandler,
      },
    },
  };

  const formats = [
    "header",
    "bold", "italic", "underline", "strike",
    "list", "bullet",
    "link", "image", "video",
  ];

  const cargarClientes = async () => {
    if (!user?.nombre) return;
    setCargando(true);

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("nombre_entrenador", user.nombre);

    if (!error) setClientes(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarClientes();
  }, [user]);

  const guardarCambios = async () => {
    if (!clienteSeleccionado) return;

    const { error } = await supabase
      .from("clientes")
      .update({
        dieta: clienteSeleccionado.dieta,
        rutina: clienteSeleccionado.rutina,
      })
      .eq("id", clienteSeleccionado.id);

    if (error) {
      console.error("Error al guardar cambios:", error.message);
      return;
    }

    setClienteSeleccionado(null);
    cargarClientes();
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Mis Clientes</h1>

      <input
        type="text"
        placeholder="Buscar cliente por nombre"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-6"
      />

      {cargando ? (
        <p className="text-gray-500 text-center">Cargando clientes...</p>
      ) : (
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
                Ver / Editar Dieta y Rutina
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={!!clienteSeleccionado}
        onOpenChange={() => setClienteSeleccionado(null)}
      >
        <DialogContent className="w-full max-w-full md:max-w-5xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar dieta y rutina</DialogTitle>
          </DialogHeader>

          {clienteSeleccionado && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dieta */}
                <div>
                  <label className="block text-sm font-medium mb-1">Dieta</label>
                  <ReactQuill
                    ref={quillRef}
                    modules={modules}
                    formats={formats}
                    value={clienteSeleccionado.dieta || ""}
                    onChange={(val) =>
                      setClienteSeleccionado((prev) =>
                        prev ? { ...prev, dieta: val } : null
                      )
                    }
                  />
                  <p className="mt-3 font-medium">Vista previa:</p>
                  <div
                    className="prose max-w-none bg-gray-50 p-3 rounded mt-2"
                    dangerouslySetInnerHTML={{
                      __html: convertirYoutubeEnEmbeds(clienteSeleccionado.dieta || ""),
                    }}
                  />
                </div>

                {/* Rutina */}
                <div>
                  <label className="block text-sm font-medium mb-1">Rutina</label>
                  <ReactQuill
                    ref={quillRef}
                    modules={modules}
                    formats={formats}
                    value={clienteSeleccionado.rutina || ""}
                    onChange={(val) =>
                      setClienteSeleccionado((prev) =>
                        prev ? { ...prev, rutina: val } : null
                      )
                    }
                  />
                  <p className="mt-3 font-medium">Vista previa:</p>
                  <div
                    className="prose max-w-none bg-gray-50 p-3 rounded mt-2"
                    dangerouslySetInnerHTML={{
                      __html: convertirYoutubeEnEmbeds(clienteSeleccionado.rutina || ""),
                    }}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button onClick={guardarCambios}>Guardar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
