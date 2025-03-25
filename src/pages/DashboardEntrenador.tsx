import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";
import ReactQuill from "react-quill";
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
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false); // Nuevo Cliente
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false); // Editar Cliente
  const [mostrarModalDietaRutina, setMostrarModalDietaRutina] = useState(false); // Dieta/Rutina
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false); // Ajustes
  const [datosEntrenador, setDatosEntrenador] = useState<any>(null);
  const [estilo, setEstilo] = useState<any>({});

  useEffect(() => {
    if (!user) return;
    cargarClientes();
    cargarEntrenador();
    cargarEstilo();
  }, [user]);

  // Cargar clientes
  const cargarClientes = async () => {
    const { data } = await supabase.from("clientes").select("*").eq("entrenador_id", user?.id);
    setClientes(data || []);
    setClientesFiltrados(data || []);
  };

  // Cargar datos del entrenador
  const cargarEntrenador = async () => {
    const { data } = await supabase.from("entrenadores").select("*").eq("id", user?.id).single();
    setDatosEntrenador(data);
  };

  // Cargar estilo
  const cargarEstilo = async () => {
    const { data } = await supabase.from("estilos_entrenador").select("*").eq("id", user?.id).single();
    if (data) setEstilo(data);
  };

  // Guardar estilo
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
      cargarEstilo(); // Recargar el estilo actualizado
    } else {
      toast.error("Error al guardar el estilo");
    }
  };

  // Manejo de formulario de cliente
  const handleInput = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Crear nuevo cliente
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

  // Abrir modal de editar cliente
  const editarClienteHandler = (cliente: Cliente) => {
    setEditarCliente(cliente);
    setMostrarModalEditar(true); // Cambiar a modal de editar
  };

  // Abrir modal de Dieta/Rutina
  const dietaRutinaHandler = (cliente: Cliente) => {
    setModalDietaRutina(cliente);
    setMostrarModalDietaRutina(true); // Cambiar el estado del modal de dieta/rutina
  };

  // Cerrar modales
  const cerrarModal = () => {
    setMostrarModalNuevo(false); // Cerrar Nuevo Cliente
    setMostrarModalEditar(false); // Cerrar Editar Cliente
    setMostrarModalDietaRutina(false); // Cerrar Dieta/Rutina
    setModalDietaRutina(null);
    setEditarCliente(null);
  };

  // Filtro de clientes por nombre
  useEffect(() => {
    const filtrados = clientes.filter((cli) => cli.nombre.toLowerCase().includes(busqueda.toLowerCase()));
    setClientesFiltrados(filtrados);
  }, [busqueda, clientes]);

  // Cerrar sesión
  const cerrarSesion = () => {
    window.location.href = "/";
  };

  // Guardar la edición de cliente
  const guardarEdicion = async () => {
    if (!editarCliente) return;

    // Actualizar cliente en 'clientes' table
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

    if (errorCliente) {
      toast.error("Error al actualizar cliente.");
      return;
    }

    // Actualizar usuario en 'users' table
    const { error: errorUser } = await supabase
      .from("users")
      .update({
        nombre: editarCliente.nombre,
        usuario: editarCliente.usuario,
        password: editarCliente.password,
      })
      .eq("id", editarCliente.id);

    if (errorUser) {
      toast.error("Error al actualizar usuario.");
      return;
    }

    toast.success("Cliente actualizado correctamente");
    cargarClientes();
    setEditarCliente(null);
  };

  // Actualizar dieta y rutina del cliente
  const actualizarDietaRutina = async () => {
    if (!modalDietaRutina) return;

    const { error: errorDietaRutina } = await supabase
      .from("clientes")
      .update({
        dieta: modalDietaRutina.dieta,
        rutina: modalDietaRutina.rutina,
      })
      .eq("id", modalDietaRutina.id);

    if (errorDietaRutina) {
      toast.error("Error al actualizar dieta/rutina.");
      return;
    }

    toast.success("Dieta/Rutina actualizada correctamente");

    // Cerrar el modal de Dieta/Rutina después de la actualización
    setMostrarModalDietaRutina(false);  // Aquí se asegura de que el modal de dieta/rutina se cierre
    setModalDietaRutina(null);  // Limpiar la referencia al cliente

    cargarClientes();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen"
      style={{
        backgroundColor: estilo?.color_secundario || "#f9fafb",
        backgroundImage: estilo?.imagen_fondo ? `url(${estilo.imagen_fondo})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Menú lateral */}
      <aside className="hidden md:block w-64 bg-white border-r p-6 space-y-4">
        <h2 className="text-xl font-bold">Entrenador</h2>
        <Button className="w-full" onClick={() => setMostrarModalNuevo(true)}>+ Nuevo Cliente</Button>
        <Button className="w-full" onClick={() => setMostrarAjustes(true)}>Ajustes</Button>
        <Button className="w-full" onClick={cerrarSesion}>Cerrar sesión</Button>
      </aside>

      {/* Encabezado móvil */}
      <header className="bg-white p-4 flex justify-between items-center shadow md:hidden">
        <h1 className="text-xl font-bold">Entrenador</h1>
        <Button variant="outline" size="icon" onClick={() => setMostrarMenu(!mostrarMenu)}>
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {mostrarMenu && (
        <div className="bg-white p-4 shadow space-y-2 md:hidden">
          <Button className="w-full" onClick={() => setMostrarModalNuevo(true)}>+ Nuevo Cliente</Button>
          <Button className="w-full" onClick={() => setMostrarAjustes(true)}>Ajustes</Button>
          <Button className="w-full" onClick={cerrarSesion}>Cerrar sesión</Button>
        </div>
      )}

      {/* Contenido */}
      <main className="flex-1 p-4 space-y-4">
        <div className="rounded-xl p-6 text-white shadow"
          style={{
            backgroundColor: estilo?.color_primario || "#3b82f6",
            backgroundImage: estilo?.imagen_cabecera ? `url(${estilo.imagen_cabecera})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="text-3xl font-bold">{estilo?.mensaje_bienvenida || "Clientes del Entrenador"}</h1>
          <p className="text-sm text-white/80">Total clientes: {clientesFiltrados.length}</p>
        </div>

        <Input
          placeholder="Buscar cliente por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {clientesFiltrados.map((cli) => (
          <div key={cli.id} className="bg-white p-4 rounded shadow space-y-2">
            <p><strong>Nombre:</strong> {cli.nombre}</p>
            <p><strong>Teléfono:</strong> {cli.telefono || "-"}</p>
            <p><strong>Dirección:</strong> {cli.direccion || "-"}</p>
            <p><strong>Fecha inicio:</strong> {cli.fecha_inicio || "-"}</p>
            <div className="flex gap-2">
              <Button onClick={() => editarClienteHandler(cli)}>Editar</Button>
              <Button variant="secondary" onClick={() => dietaRutinaHandler(cli)}>Dieta/Rutina</Button>
            </div>
          </div>
        ))}
      </main>

      {/* Modal: Nuevo Cliente */}
      <Dialog open={mostrarModalNuevo} onOpenChange={setMostrarModalNuevo}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Cliente</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <label>Nombre</label>
            <Input name="nombre" onChange={handleInput} />
            <label>Usuario</label>
            <Input name="usuario" onChange={handleInput} />
            <label>Contraseña</label>
            <Input name="password" onChange={handleInput} />
            <label>Teléfono</label>
            <Input name="telefono" onChange={handleInput} />
            <label>Dirección</label>
            <Input name="direccion" onChange={handleInput} />
            <label>Fecha de inicio</label>
            <Input name="fecha_inicio" type="date" onChange={handleInput} />
            <label>Observaciones</label>
            <Input name="observaciones" onChange={handleInput} />
          </div>
          <DialogFooter><Button onClick={crearCliente}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Cliente */}
      <Dialog open={!!editarCliente} onOpenChange={() => setMostrarModalEditar(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
          {editarCliente && (
            <div className="grid gap-3">
              <label>Nombre</label>
              <Input value={editarCliente.nombre} onChange={(e) => setEditarCliente({ ...editarCliente, nombre: e.target.value })} />
              <label>Usuario</label>
              <Input value={editarCliente.usuario} onChange={(e) => setEditarCliente({ ...editarCliente, usuario: e.target.value })} />
              <label>Contraseña</label>
              <Input value={editarCliente.password || ""} onChange={(e) => setEditarCliente({ ...editarCliente, password: e.target.value })} />
              <label>Teléfono</label>
              <Input value={editarCliente.telefono || ""} onChange={(e) => setEditarCliente({ ...editarCliente, telefono: e.target.value })} />
              <label>Dirección</label>
              <Input value={editarCliente.direccion || ""} onChange={(e) => setEditarCliente({ ...editarCliente, direccion: e.target.value })} />
              <label>Fecha de inicio</label>
              <Input type="date" value={editarCliente.fecha_inicio || ""} onChange={(e) => setEditarCliente({ ...editarCliente, fecha_inicio: e.target.value })} />
              <label>Observaciones</label>
              <Input value={editarCliente.observaciones || ""} onChange={(e) => setEditarCliente({ ...editarCliente, observaciones: e.target.value })} />
            </div>
          )}
          <DialogFooter className="flex justify-between pt-4">
            <Button variant="destructive" onClick={async () => {
              if (!editarCliente) return;
              await supabase.from("clientes").delete().eq("id", editarCliente.id);
              await supabase.from("users").delete().eq("id", editarCliente.id);
              toast.success("Cliente eliminado correctamente");
              setEditarCliente(null);
              cargarClientes();
            }}>Eliminar</Button>
            <Button onClick={guardarEdicion}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Dieta/Rutina */}
      <Dialog open={mostrarModalDietaRutina} onOpenChange={() => setMostrarModalDietaRutina(false)}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Dieta y Rutina</DialogTitle></DialogHeader>
          {modalDietaRutina && (
            <div className="flex flex-col gap-4">
              <div>
                <label>Dieta</label>
                <ReactQuill value={modalDietaRutina.dieta || ""} onChange={(val) =>
                  setModalDietaRutina((prev) => prev ? { ...prev, dieta: val } : null)
                } />
              </div>
              <div>
                <label>Rutina</label>
                <ReactQuill value={modalDietaRutina.rutina || ""} onChange={(val) =>
                  setModalDietaRutina((prev) => prev ? { ...prev, rutina: val } : null)
                } />
              </div>
            </div>
          )}
          <DialogFooter><Button onClick={actualizarDietaRutina}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Ajustes (estilo de la app) */}
      <Dialog open={mostrarAjustes} onOpenChange={setMostrarAjustes}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajustes de Estética</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <label>Color Principal</label>
            <Input type="color" value={estilo?.color_primario} onChange={(e) => setEstilo({ ...estilo, color_primario: e.target.value })} />
            <label>Color Secundario</label>
            <Input type="color" value={estilo?.color_secundario} onChange={(e) => setEstilo({ ...estilo, color_secundario: e.target.value })} />
            <label>Mensaje de Bienvenida</label>
            <Input value={estilo?.mensaje_bienvenida} onChange={(e) => setEstilo({ ...estilo, mensaje_bienvenida: e.target.value })} />
            <label>Imagen Cabecera (URL)</label>
            <Input value={estilo?.imagen_cabecera} onChange={(e) => setEstilo({ ...estilo, imagen_cabecera: e.target.value })} />
            <label>Imagen Fondo (URL)</label>
            <Input value={estilo?.imagen_fondo} onChange={(e) => setEstilo({ ...estilo, imagen_fondo: e.target.value })} />
          </div>
          <DialogFooter><Button onClick={guardarEstilo}>Guardar Estilo</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
