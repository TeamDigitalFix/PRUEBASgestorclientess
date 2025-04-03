"use client";

import { useEffect, useState, useRef } from "react";
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

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dieta, setDieta] = useState("");
  const [rutina, setRutina] = useState("");
  const { user } = useAuth();
  const quillRef = useRef<any>(null);

  useEffect(() => {
    async function fetchClientes() {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("entrenador_id", user?.id);

      if (!error && data) {
        setClientes(data);
      }
    }
    if (user) fetchClientes();
  }, [user]);

  function abrirDialogo(cliente: Cliente) {
    setClienteSeleccionado(cliente);
    setDieta(cliente.dieta || "");
    setRutina(cliente.rutina || "");
    setIsDialogOpen(true);
  }

  async function guardarCambios() {
    if (!clienteSeleccionado) return;
    const { error } = await supabase
      .from("clientes")
      .update({ dieta, rutina })
      .eq("id", clienteSeleccionado.id);
    if (!error) setIsDialogOpen(false);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="border p-4 rounded shadow">
            <p><strong>Nombre:</strong> {cliente.nombre}</p>
            <p><strong>Teléfono:</strong> {cliente.telefono}</p>
            <p><strong>Dirección:</strong> {cliente.direccion}</p>
            <p><strong>Fecha inicio:</strong> {cliente.fecha_inicio}</p>
            <Button onClick={() => abrirDialogo(cliente)} className="mt-2">Dieta/Rutina</Button>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Dieta y Rutina</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="font-semibold">Dieta</label>
              <ReactQuill value={dieta} onChange={setDieta} theme="snow" />
            </div>
            <div>
              <label className="font-semibold">Rutina</label>
              <ReactQuill ref={quillRef} value={rutina} onChange={setRutina} theme="snow" />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={guardarCambios}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isDialogOpen && (
        <button
          onClick={() => {
            const url = prompt("Pega aquí el enlace de YouTube:");
            if (!url) return;
            const videoId = url.split("v=")[1]?.split("&")[0];
            if (videoId) {
              const embed = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
              const editor = quillRef.current?.getEditor?.();
              if (editor) {
                editor.clipboard.dangerouslyPasteHTML(editor.getSelection()?.index || 0, embed);
              } else {
                alert("Editor no disponible");
              }
            } else {
              alert("URL no válida");
            }
          }}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#ef4444",
            color: "white",
            borderRadius: "9999px",
            padding: "12px 16px",
            fontWeight: "bold",
            fontSize: "16px",
            zIndex: 9999,
          }}
        >
          + Video
        </button>
      )}
    </div>
  );
}
