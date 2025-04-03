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
  const [modalAbierto, setModalAbierto] = useState<"dieta" | "rutina" | null>(null);

  const quillRefDieta = useRef<ReactQuill>(null);
  const quillRefRutina = useRef<ReactQuill>(null);

  const insertarImagen = (quillRef: React.RefObject<ReactQuill>) => {
    const url = prompt("Pega el enlace de la imagen:");
    if (url) {
      const quill = quillRef.current?.getEditor();
      const range = quill?.getSelection();
      if (range) {
        quill?.insertEmbed(range.index, "image", url, "user");
      }
    }
  };

  const insertarVideo = (quillRef: React.RefObject<ReactQuill>) => {
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
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
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
      .eq("entrenador_id", user.id);

    if (!error && data) setClientes(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarClientes();
  }, [user]);

  return (
    <div>
      {/* Tu buscador y lista de clientes... */}

      <Dialog open={!!modalAbierto} onOpenChange={() => setModalAbierto(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Dieta y Rutina</DialogTitle>
          </DialogHeader>

          {modalAbierto && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 mb-2">
                <Button
                  variant="secondary"
                  onClick={() => insertarImagen(
                    modalAbierto === "dieta" ? quillRefDieta : quillRefRutina
                  )}
                >
                  Imagen
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => insertarVideo(
                    modalAbierto === "dieta" ? quillRefDieta : quillRefRutina
                  )}
                >
                  Video
                </Button>
              </div>
              <ReactQuill
                ref={modalAbierto === "dieta" ? quillRefDieta : quillRefRutina}
                theme="snow"
                modules={modules}
                formats={formats}
                defaultValue={modalAbierto === "dieta" ? clienteSeleccionado?.dieta || "" : clienteSeleccionado?.rutina || ""}
              />
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setModalAbierto(null)}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
