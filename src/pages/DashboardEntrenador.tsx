import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";
import ReactQuill from "react-quill";
import Quill from "quill";
import ImageResize from "quill-image-resize-module-react";
Quill.register("modules/imageResize", ImageResize);
import "react-quill/dist/quill.snow.css";

interface Cliente {
  id: string;
  nombre: string;
  usuario: string;
  password?: string;
  telefono?: string;
  direccion?: string;
  fecha_inicio?: string;
  observaciones?: string;
  dieta?: string;
  rutina?: string;
}

export default function DashboardEntrenador() {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState<Partial<Cliente>>({});
  const [editarCliente, setEditarCliente] = useState<Cliente | null>(null);
  const [modalDietaRutina, setModalDietaRutina] = useState<Cliente | null>(null);
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalDietaRutina, setMostrarModalDietaRutina] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [datosEntrenador, setDatosEntrenador] = useState<any>(null);
  const [estilo, setEstilo] = useState<any>({});

  useEffect(() => {
    if (!user) return;
    cargarClientes();
    cargarEntrenador();
    cargarEstilo();
  }, [user]);

  const cargarClientes = async () => {
    const { data } = await supabase.from("clientes").select("*").eq("entrenador_id", user?.id);
    setClientes(data || []);
    setClientesFiltrados(data || []);
  };

  const cargarEntrenador = async () => {
    const { data } = await supabase.from("entrenadores").select("*").eq("id", user?.id).single();
    setDatosEntrenador(data);
  };

  const cargarEstilo = async () => {
    const { data } = await supabase.from("estilos_entrenador").select("*").eq("id", user?.id).single();
    if (data) setEstilo(data);
  };

  const guardarEstilo = async () => {
    const { error } = await supabase.from("estilos_entrenador").upsert({
      id: user?.id,
      color_primario: estilo?.color_primario || "#3b82f6",
      color_secundario: estilo?.color_secundario || "#f9fafb",
      color_texto: estilo?.color_texto || "#000000",
      imagen_cabecera: estilo?.imagen_cabecera || "",
      imagen_fondo: estilo?.imagen_fondo || "",
      imagen_logo: estilo?.imagen_logo || "",
      mensaje_bienvenida: estilo?.mensaje_bienvenida || "",
    });
    if (!error) {
      toast.success("Estilo guardado correctamente");
      cargarEstilo();
    } else {
      toast.error("Error al guardar el estilo");
    }
  };

  const handleInput = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const crearCliente = async () => {
    if (!form.nombre || !form.usuario || !form.password) {
      toast.error("Faltan campos obligatorios.");
      return;
    }

    const { data: userInsert, error: errorUser } = await supabase
      .from("users")
      .insert({
        nombre: form.nombre,
        usuario: form.usuario,
        password: form.password,
        role: "cliente",
        nombre_entrenador: datosEntrenador?.nombre || null,
      })
      .select("id")
      .single();

    if (errorUser || !userInsert) {
      toast.error("Error al crear usuario.");
      return;
    }

    const { error: errorCliente } = await supabase.from("clientes").insert({
      id: userInsert.id,
      nombre: form.nombre,
      usuario: form.usuario,
      password: form.password,
      telefono: form.telefono || null,
      direccion: form.direccion || null,
      fecha_inicio: form.fecha_inicio || null,
      observaciones: form.observaciones || null,
      entrenador_id: user?.id,
      nombre_entrenador: datosEntrenador?.nombre || null,
    });

    if (errorCliente) {
      toast.error("Usuario creado, pero falló en 'clientes'.");
    } else {
      toast.success("Cliente creado correctamente.");
      setForm({});
      setMostrarModalNuevo(false);
      cargarClientes();
    }
  };

  const editarClienteHandler = (cliente: Cliente) => {
    setEditarCliente(cliente);
    setMostrarModalEditar(true);
  };

  const dietaRutinaHandler = (cliente: Cliente) => {
    setModalDietaRutina(cliente);
    setMostrarModalDietaRutina(true);
  };

  const cerrarModal = () => {
    setMostrarModalNuevo(false);
    setMostrarModalEditar(false);
    setMostrarModalDietaRutina(false);
    setModalDietaRutina(null);
    setEditarCliente(null);
  };

  useEffect(() => {
    const filtrados = clientes.filter((cli) =>
      cli.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setClientesFiltrados(filtrados);
  }, [busqueda, clientes]);

  const cerrarSesion = () => {
    window.location.href = "/";
  };

  const guardarEdicion = async () => {
    if (!editarCliente) return;

    const { error: errorCliente } = await supabase
      .from("clientes")
      .update({
        nombre: editarCliente.nombre,
        usuario: editarCliente.usuario,
        password: editarCliente.password,
        telefono: editarCliente.telefono,
        direccion: editarCliente.direccion,
        fecha_inicio: editarCliente.fecha_inicio,
        observaciones: editarCliente.observaciones,
      })
      .eq("id", editarCliente.id);

    const { error: errorUser } = await supabase
      .from("users")
      .update({
        nombre: editarCliente.nombre,
        usuario: editarCliente.usuario,
        password: editarCliente.password,
      })
      .eq("id", editarCliente.id);

    if (errorCliente || errorUser) {
      toast.error("Error al actualizar cliente.");
      return;
    }

    toast.success("Cliente actualizado correctamente");
    cargarClientes();
    setEditarCliente(null);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      ["clean"],
    ],
    imageResize: {
      parchment: Quill.import("parchment"),
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
    "image",
    "video",
  ];

  const actualizarDietaRutina = async () => {
    if (!modalDietaRutina) return;

    const { error } = await supabase
      .from("clientes")
      .update({
        dieta: modalDietaRutina.dieta,
        rutina: modalDietaRutina.rutina,
      })
      .eq("id", modalDietaRutina.id);

    if (error) {
      toast.error("Error al actualizar dieta/rutina.");
      return;
    }

    toast.success("Dieta/Rutina actualizada correctamente");
    setMostrarModalDietaRutina(false);
    setModalDietaRutina(null);
    cargarClientes();
  };
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      <Input
        placeholder="Buscar cliente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4"
      />

      {clientesFiltrados.map((cliente) => (
        <div key={cliente.id} className="border p-4 rounded mb-4">
          <h2 className="text-lg font-semibold">{cliente.nombre}</h2>
          <p><strong>Teléfono:</strong> {cliente.telefono || "-"}</p>
          <p><strong>Dirección:</strong> {cliente.direccion || "-"}</p>
          <p><strong>Fecha inicio:</strong> {cliente.fecha_inicio || "-"}</p>
          <div className="mt-2 flex gap-2">
            <Button onClick={() => editarClienteHandler(cliente)}>Editar</Button>
            <Button variant="secondary" onClick={() => dietaRutinaHandler(cliente)}>Dieta/Rutina</Button>
          </div>
        </div>
      ))}

      {/* Modal de Dieta/Rutina */}
      <Dialog open={mostrarModalDietaRutina} onOpenChange={setMostrarModalDietaRutina}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Dieta y Rutina</DialogTitle>
          </DialogHeader>
          {modalDietaRutina && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-semibold">Dieta</label>
                <ReactQuill
                  value={modalDietaRutina.dieta || ""}
                  modules={modules}
                  formats={formats}
                  onChange={(val) =>
                    setModalDietaRutina((prev) => prev ? { ...prev, dieta: val } : null)
                  }
                />
              </div>
              <div>
                <label className="font-semibold">Rutina</label>
                <ReactQuill
                  value={modalDietaRutina.rutina || ""}
                  modules={modules}
                  formats={formats}
                  onChange={(val) =>
                    setModalDietaRutina((prev) => prev ? { ...prev, rutina: val } : null)
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button onClick={actualizarDietaRutina}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
