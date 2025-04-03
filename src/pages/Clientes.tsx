import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cliente } from "@/types/app";
import { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  cliente: Cliente;
  onClose: () => void;
}

export default function EditarPlanModal({ cliente, onClose }: Props) {
  const [dieta, setDieta] = useState(cliente.dieta || "");
  const [rutina, setRutina] = useState(cliente.rutina || "");
  const quillRefDieta = useRef<ReactQuill>(null);
  const quillRefRutina = useRef<ReactQuill>(null);

  const insertarVideo = (quillRef: React.RefObject<ReactQuill>) => {
    const url = prompt("Pega el enlace de YouTube:");
    if (url) {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
      if (match) {
        const videoId = match[1];
        const src = `https://www.youtube.com/embed/${videoId}`;
        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection();
        if (range) {
          quill.clipboard.dangerouslyPasteHTML(
            range.index,
            `<iframe width="100%" height="315" src="${src}" frameborder="0" allowfullscreen></iframe>`
          );
        }
      } else {
        alert("URL de YouTube no válida");
      }
    }
  };

  const insertarImagen = (quillRef: React.RefObject<ReactQuill>) => {
    const url = prompt("Pega el enlace de la imagen:");
    if (url) {
      const quill = quillRef.current?.getEditor();
      const range = quill?.getSelection();
      if (range) {
        quill.insertEmbed(range.index, "image", url);
      }
    }
  };

  const guardarCambios = async () => {
    await supabase.from("clientes").update({ dieta, rutina }).eq("id", cliente.id);
    onClose();
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"]
    ]
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Dieta y Rutina - {cliente.nombre}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-1">Dieta</label>
            <div className="flex gap-2 mb-2">
              <Button variant="outline" onClick={() => insertarImagen(quillRefDieta)}>+ Imagen</Button>
              <Button variant="outline" onClick={() => insertarVideo(quillRefDieta)}>+ Video</Button>
            </div>
            <ReactQuill
              ref={quillRefDieta}
              value={dieta}
              onChange={setDieta}
              modules={modules}
              className="bg-white h-60"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Rutina</label>
            <div className="flex gap-2 mb-2">
              <Button variant="outline" onClick={() => insertarImagen(quillRefRutina)}>+ Imagen</Button>
              <Button variant="outline" onClick={() => insertarVideo(quillRefRutina)}>+ Video</Button>
            </div>
            <ReactQuill
              ref={quillRefRutina}
              value={rutina}
              onChange={setRutina}
              modules={modules}
              className="bg-white h-60"
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={guardarCambios}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
