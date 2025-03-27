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

interface HistorialItem {
  id: string;
  cliente_id: string;
  tipo: "dieta" | "rutina";
  contenido: string;
  fecha: string;
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
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);
  const [mostrarPapelera, setMostrarPapelera] = useState(false);
  const [datosEntrenador, setDatosEntrenador] = useState<any>(null);
  const [estilo, setEstilo] = useState<any>({});
  const [clientesEliminados, setClientesEliminados] = useState<Cliente[]>([]);
  const [historialDietasRutinas, setHistorialDietasRutinas] = useState<HistorialItem[]>([]);
  const [historialClienteActual, setHistorialClienteActual] = useState<HistorialItem[]>([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);

  useEffect(() => {
    if (!user) return;
    cargarClientes();
    cargarClientesEliminados();
    cargarEntrenador();
    cargarEstilo();
    cargarHistorial();
  }, [user]);

  const cargarClientes = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .eq("entrenador_id", user?.id)
      .eq("eliminado", false);
    setClientes(data || []);
    setClientesFiltrados(data || []);
  };

  const cargarClientesEliminados = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .eq("entrenador_id", user?.id)
      .eq("eliminado", true);
    setClientesEliminados(data || []);
  };

  const cargarHistorial = async () => {
    const { data } = await supabase
      .from("historial_dietas_rutinas")
      .select("*")
      .in("cliente_id", clientes.map((c) => c.id));
    setHistorialDietasRutinas(data || []);
  };

  const cargarEntrenador = async () => {
    const { data } = await supabase
      .from("entrenadores")
      .select("*")
      .eq("id", user?.id)
      .single();
    setDatosEntrenador(data);
  };

  const cargarEstilo = async () => {
    const { data } = await supabase
      .from("estilos_entrenador")
      .select("*")
      .eq("id", user?.id)
      .single();
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
      eliminado: false,
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

  const guardarEdicion = async () => {
    if (!editarCliente) return;

    const { error: error1 } = await supabase.from("clientes").update({
      nombre: editarCliente.nombre,
      usuario: editarCliente.usuario,
      password: editarCliente.password,
      telefono: editarCliente.telefono,
      direccion: editarCliente.direccion,
      fecha_inicio: editarCliente.fecha_inicio,
      observaciones: editarCliente.observaciones,
    }).eq("id", editarCliente.id);

    const { error: error2 } = await supabase.from("users").update({
      nombre: editarCliente.nombre,
      usuario: editarCliente.usuario,
      password: editarCliente.password,
    }).eq("id", editarCliente.id);

    if (!error1 && !error2) {
      toast.success("Cliente actualizado correctamente");
      setEditarCliente(null);
      cargarClientes();
    } else {
      toast.error("Error al guardar los cambios");
    }
  };

  const eliminarClienteLogico = async (id: string) => {
    await supabase.from("clientes").update({ eliminado: true }).eq("id", id);
    toast.success("Cliente enviado a la papelera");
    cargarClientes();
    cargarClientesEliminados();
  };

  const restaurarCliente = async (id: string) => {
    await supabase.from("clientes").update({ eliminado: false }).eq("id", id);
    toast.success("Cliente restaurado");
    cargarClientes();
    cargarClientesEliminados();
  };
  
const verHistorialCliente = async (clienteId: string) => {
  const { data } = await supabase
    .from("historial_dietas_rutinas")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });

  if (!data) return;

  // 🔁 Tomar solo la dieta más reciente y rutina más reciente
  const ultimaDieta = data.find((item) => item.tipo === "dieta");
  const ultimaRutina = data.find((item) => item.tipo === "rutina");

  const historialFiltrado: HistorialItem[] = [];
  if (ultimaDieta) historialFiltrado.push(ultimaDieta);
  if (ultimaRutina) historialFiltrado.push(ultimaRutina);

  setHistorialClienteActual(historialFiltrado);
  setMostrarHistorial(true);
};



  const eliminarClienteDefinitivo = async (id: string) => {
    await supabase.from("clientes").delete().eq("id", id);
    await supabase.from("users").delete().eq("id", id);
    toast.success("Cliente eliminado permanentemente");
    cargarClientesEliminados();
  };

 const actualizarDietaRutina = async () => {
  if (!modalDietaRutina) return;

  const clienteId = modalDietaRutina.id;

  // 1️⃣ Obtener dieta y rutina actuales antes de sobreescribir
  const { data: clienteActual } = await supabase
    .from("clientes")
    .select("dieta, rutina")
    .eq("id", clienteId)
    .single();

  if (!clienteActual) {
    toast.error("No se pudo obtener los datos actuales del cliente.");
    return;
  }

  // 2️⃣ Eliminar el historial anterior (solo uno por tipo)
  const { data: historial } = await supabase
    .from("historial_dietas_rutinas")
    .select("id, tipo")
    .eq("cliente_id", clienteId)
    .order("fecha", { ascending: false });

  const ultimaDieta = historial?.find((h) => h.tipo === "dieta");
  const ultimaRutina = historial?.find((h) => h.tipo === "rutina");

  if (ultimaDieta) {
    await supabase
      .from("historial_dietas_rutinas")
      .delete()
      .eq("id", ultimaDieta.id);
  }

  if (ultimaRutina) {
    await supabase
      .from("historial_dietas_rutinas")
      .delete()
      .eq("id", ultimaRutina.id);
  }

  // 3️⃣ Insertar como historial lo que tenía antes
  await supabase.from("historial_dietas_rutinas").insert([
    {
      cliente_id: clienteId,
      tipo: "dieta",
      contenido: clienteActual.dieta || "",
      fecha: new Date().toISOString(),
    },
    {
      cliente_id: clienteId,
      tipo: "rutina",
      contenido: clienteActual.rutina || "",
      fecha: new Date().toISOString(),
    },
  ]);

  // 4️⃣ Actualizar cliente con nueva dieta/rutina
  await supabase
    .from("clientes")
    .update({
      dieta: modalDietaRutina.dieta,
      rutina: modalDietaRutina.rutina,
    })
    .eq("id", clienteId);

  toast.success("Dieta y rutina actualizadas");
  setModalDietaRutina(null);
  setCambiosPendientes(false);
  cargarClientes();
  cargarHistorial();
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

  return (
    <div
      className="flex flex-col md:flex-row min-h-screen"
      style={{
        backgroundColor: estilo?.color_secundario || "#f9fafb",
        backgroundImage: estilo?.imagen_fondo
          ? `url(${estilo.imagen_fondo})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Menú lateral */}
      <aside className="hidden md:block w-64 bg-white border-r p-6 space-y-4">
        <h2 className="text-xl font-bold">Entrenador</h2>
        <Button className="w-full" onClick={() => setMostrarModalNuevo(true)}>
          + Nuevo Cliente
        </Button>
        <Button className="w-full" onClick={() => setMostrarPapelera(true)}>
          Papelera
        </Button>
        <Button className="w-full" onClick={() => setMostrarAjustes(true)}>
          Ajustes
        </Button>
        <Button className="w-full" onClick={cerrarSesion}>
          Cerrar sesión
        </Button>
      </aside>

      {/* Encabezado móvil */}
      <header className="bg-white p-4 flex justify-between items-center shadow md:hidden">
        <h1 className="text-xl font-bold">Entrenador</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMostrarMenu(!mostrarMenu)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {mostrarMenu && (
        <div className="bg-white p-4 shadow space-y-2 md:hidden">
          <Button className="w-full" onClick={() => setMostrarModalNuevo(true)}>
            + Nuevo Cliente
          </Button>
          <Button className="w-full" onClick={() => setMostrarPapelera(true)}>
            Papelera
          </Button>
          <Button className="w-full" onClick={() => setMostrarAjustes(true)}>
            Ajustes
          </Button>
          <Button className="w-full" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </div>
      )}

      {/* Contenido */}
      <main className="flex-1 p-4 space-y-4">
        <div
          className="rounded-xl p-6 text-white shadow"
          style={{
            backgroundColor: estilo?.color_primario || "#3b82f6",
            backgroundImage: estilo?.imagen_cabecera
              ? `url(${estilo.imagen_cabecera})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                {estilo?.mensaje_bienvenida || "Clientes del Entrenador"}
              </h1>
              <p className="text-sm text-white/80">
                Total clientes: {clientesFiltrados.length}
              </p>
            </div>
            {estilo?.imagen_logo && (
              <img
                src={estilo.imagen_logo}
                alt="Logo"
                className="h-20 w-auto mt-4 md:mt-0"
              />
            )}
          </div>
        </div>

        <Input
          placeholder="Buscar cliente por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {clientesFiltrados.map((cli) => (
          <div
            key={cli.id}
            className="bg-white p-4 rounded shadow space-y-2 relative"
          >
            <p>
              <strong>Nombre:</strong> {cli.nombre}
            </p>
            <p>
              <strong>Teléfono:</strong> {cli.telefono || "-"}
            </p>
            <p>
              <strong>Dirección:</strong> {cli.direccion || "-"}
            </p>
            <p>
              <strong>Fecha inicio:</strong> {cli.fecha_inicio || "-"}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setEditarCliente(cli)}>Editar</Button>
              <Button
                variant="secondary"
                onClick={() => setModalDietaRutina(cli)}
              >
                
                Dieta/Rutina
              </Button>
              <Button
  variant="outline"
  onClick={() => verHistorialCliente(cli.id)}
>
  Ver historial
</Button>

            </div>
          </div>
        ))}
      </main>

      {/* Modal: Papelera */}
      <Dialog open={mostrarPapelera} onOpenChange={setMostrarPapelera}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clientes eliminados</DialogTitle>
          </DialogHeader>

          {clientesEliminados.length === 0 && (
            <p className="text-gray-500 text-center py-4">No hay clientes eliminados.</p>
          )}

          {clientesEliminados.map((cli) => (
            <div key={cli.id} className="bg-white border p-4 rounded space-y-1 shadow-sm mb-2">
              <p><strong>{cli.nombre}</strong></p>
              <p className="text-xs text-gray-500">{cli.usuario}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="default" onClick={() => restaurarCliente(cli.id)}>
                  Restaurar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => eliminarClienteDefinitivo(cli.id)}
                >
                  Eliminar definitivamente
                </Button>
              </div>
            </div>
          ))}

        </DialogContent>
      </Dialog>
      {/* Modal: Nuevo Cliente */}
      <Dialog open={mostrarModalNuevo} onOpenChange={setMostrarModalNuevo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
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
          <DialogFooter>
            <Button onClick={crearCliente}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Cliente */}
      <Dialog open={!!editarCliente} onOpenChange={() => setEditarCliente(null)}>
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
              await eliminarClienteLogico(editarCliente.id);
              setEditarCliente(null);
              cargarClientes();
            }}>Eliminar</Button>
            <Button onClick={guardarEdicion}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      

     {/* Modal: Dieta y Rutina */}
<Dialog
  open={!!modalDietaRutina}
  onOpenChange={(open) => {
    if (!open) {
      setModalDietaRutina(null);
      setCambiosPendientes(false);
    }
  }}
>
  <DialogContent
    className="max-w-4xl max-h-screen overflow-y-auto"
    onInteractOutside={(e) => {
      if (cambiosPendientes) {
        e.preventDefault();
        toast.warning("Tienes cambios sin guardar.");
      }
    }}
  >
    <DialogHeader>
      <DialogTitle>Editar Dieta y Rutina</DialogTitle>
    </DialogHeader>

    {modalDietaRutina && (
      <div className="flex flex-col gap-4">
        <div>
          <label>Dieta</label>
          <ReactQuill
            value={modalDietaRutina.dieta || ""}
            onChange={(val) =>
              setModalDietaRutina((prev) => {
                setCambiosPendientes(true);
                return prev ? { ...prev, dieta: val } : null;
              })
            }
          />
        </div>
        <div>
          <label>Rutina</label>
          <ReactQuill
            value={modalDietaRutina.rutina || ""}
            onChange={(val) =>
              setModalDietaRutina((prev) => {
                setCambiosPendientes(true);
                return prev ? { ...prev, rutina: val } : null;
              })
            }
          />
        </div>
      </div>
    )}

    <DialogFooter>
      <Button
        onClick={async () => {
          await actualizarDietaRutina();
          setCambiosPendientes(false);
        }}
      >
        Guardar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      <Dialog open={mostrarHistorial} onOpenChange={setMostrarHistorial}>
  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Historial de Dieta y Rutina</DialogTitle>
    </DialogHeader>
    {historialClienteActual.length === 0 ? (
  <p className="text-gray-500">No hay registros anteriores.</p>
) : (
  historialClienteActual.map((item, idx) => (
    <div key={idx} className="mb-6">
      <p className="text-sm text-gray-600">
        {new Date(item.fecha).toLocaleString()}
      </p>
      <p className="font-semibold mb-1 capitalize">{item.tipo}:</p>
      <div
        className="prose prose-sm bg-gray-100 p-2 rounded"
        dangerouslySetInnerHTML={{ __html: item.contenido || "<em>Sin contenido</em>" }}
      />
    </div>
  ))
)}

  </DialogContent>
</Dialog>


      {/* Modal: Ajustes */}
      <Dialog open={mostrarAjustes} onOpenChange={setMostrarAjustes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personalización</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label>Color primario</label>
            <Input type="color" value={estilo?.color_primario} onChange={(e) => setEstilo({ ...estilo, color_primario: e.target.value })} />
            <label>Color secundario</label>
            <Input type="color" value={estilo?.color_secundario} onChange={(e) => setEstilo({ ...estilo, color_secundario: e.target.value })} />
            <label>Color texto</label>
            <Input type="color" value={estilo?.color_texto} onChange={(e) => setEstilo({ ...estilo, color_texto: e.target.value })} />
            <label>Imagen de cabecera (URL)</label>
            <Input placeholder="https://..." value={estilo?.imagen_cabecera} onChange={(e) => setEstilo({ ...estilo, imagen_cabecera: e.target.value })} />
            <label>Imagen de fondo (URL)</label>
            <Input placeholder="https://..." value={estilo?.imagen_fondo} onChange={(e) => setEstilo({ ...estilo, imagen_fondo: e.target.value })} />
            <label>Logo (URL)</label>
            <Input placeholder="https://..." value={estilo?.imagen_logo} onChange={(e) => setEstilo({ ...estilo, imagen_logo: e.target.value })} />
            <label>Mensaje de bienvenida</label>
            <Input value={estilo?.mensaje_bienvenida} onChange={(e) => setEstilo({ ...estilo, mensaje_bienvenida: e.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={guardarEstilo}>Guardar estilo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
