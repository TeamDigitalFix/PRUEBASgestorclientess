import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut } from "lucide-react";

interface Entrenador {
  id: string;
  nombre: string;
  usuario: string;
  password: string;
  telefono?: string;
  direccion?: string;
  fecha_inicio?: string;
}

export default function DashboardSuperadmin() {
  const { logout, user } = useAuth();
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [filtrados, setFiltrados] = useState<Entrenador[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [totalClientes, setTotalClientes] = useState<number>(0);
  const [form, setForm] = useState<Partial<Entrenador>>({});
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [editarEntrenador, setEditarEntrenador] = useState<Entrenador | null>(null);

  useEffect(() => {
    if (!user) window.location.href = "/";
    cargarEntrenadores();
    contarClientes();
  }, [user]);

  useEffect(() => {
    const filtrados = entrenadores.filter((ent) =>
      ent.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
    setFiltrados(filtrados);
  }, [busqueda, entrenadores]);

  const cargarEntrenadores = async () => {
    const { data: users } = await supabase
      .from("users")
      .select("id, usuario, password")
      .eq("role", "entrenador");

    if (!users) return;

    const ids = users.map((u) => u.id);
    const { data: entrenadoresData } = await supabase
      .from("entrenadores")
      .select("*")
      .in("id", ids);

    const entrenadoresCompletos = users.map((user) => {
      const extra = entrenadoresData?.find((e) => e.id === user.id);
      return {
        id: user.id,
        usuario: user.usuario,
        password: user.password,
        nombre: extra?.nombre ?? "-",
        telefono: extra?.telefono ?? "-",
        direccion: extra?.direccion ?? "-",
        fecha_inicio: extra?.fecha_inicio ?? "-",
      };
    });

    setEntrenadores(entrenadoresCompletos);
    setFiltrados(entrenadoresCompletos);
  };

  const contarClientes = async () => {
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "cliente");

    setTotalClientes(count || 0);
  };

  const handleInput = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const crearEntrenador = async () => {
    if (!form.usuario || !form.password) return;

    const { data: userInsert, error } = await supabase
      .from("users")
      .insert({
        usuario: form.usuario,
        password: form.password,
        role: "entrenador",
      })
      .select("id")
      .single();

    if (error) return;

    await supabase.from("entrenadores").insert({
      id: userInsert.id,
      nombre: form.nombre ?? "-",
      usuario: form.usuario,
      password: form.password,
      telefono: form.telefono ?? "-",
      direccion: form.direccion ?? "-",
      fecha_inicio: form.fecha_inicio ?? null,
    });

    setForm({});
    setMostrarModalNuevo(false);
    cargarEntrenadores();
  };

  const guardarEdicion = async () => {
    if (!editarEntrenador) return;

    await supabase
      .from("users")
      .update({
        usuario: editarEntrenador.usuario,
        password: editarEntrenador.password,
      })
      .eq("id", editarEntrenador.id);

    await supabase
      .from("entrenadores")
      .update({
        nombre: editarEntrenador.nombre,
        usuario: editarEntrenador.usuario,
        password: editarEntrenador.password,
        telefono: editarEntrenador.telefono,
        direccion: editarEntrenador.direccion,
        fecha_inicio: editarEntrenador.fecha_inicio,
      })
      .eq("id", editarEntrenador.id);

    setEditarEntrenador(null);
    cargarEntrenadores();
  };

  const eliminarEntrenador = async () => {
    if (!editarEntrenador) return;

    await supabase.from("users").delete().eq("id", editarEntrenador.id);
    await supabase.from("entrenadores").delete().eq("id", editarEntrenador.id);

    setEditarEntrenador(null);
    cargarEntrenadores();
  };

  const cerrarSesion = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Panel del Superadmin</h1>
          <p className="text-gray-500 text-sm">
            Total entrenadores: {entrenadores.length} | Total clientes: {totalClientes}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={mostrarModalNuevo} onOpenChange={setMostrarModalNuevo}>
            <DialogTrigger asChild>
              <Button>+ Nuevo Entrenador</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Entrenador</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="nombre" placeholder="Nombre *" onChange={handleInput} />
                <Input name="usuario" placeholder="Usuario *" onChange={handleInput} />
                <Input name="password" placeholder="Contraseña *" onChange={handleInput} />
                <Input name="telefono" placeholder="Teléfono" onChange={handleInput} />
                <Input name="direccion" placeholder="Dirección" onChange={handleInput} />
                <Input name="fecha_inicio" type="date" onChange={handleInput} />
              </div>
              <DialogFooter className="pt-4">
                <Button onClick={crearEntrenador}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={cerrarSesion}>
            <LogOut className="h-5 w-5 mr-2" /> Cerrar sesión
          </Button>
        </div>
      </div>

      {/* 🔍 Buscador */}
      <Input
        placeholder="Buscar entrenador por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4"
      />

      {/* Lista en tarjetas */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="space-y-4">
          {filtrados.map((ent) => (
            <div key={ent.id} className="border rounded-lg p-4 space-y-2">
              <p><strong>Nombre:</strong> {ent.nombre}</p>
              <p><strong>Usuario:</strong> {ent.usuario}</p>
              <p><strong>Teléfono:</strong> {ent.telefono}</p>
              <p><strong>Dirección:</strong> {ent.direccion}</p>
              <p><strong>Fecha inicio:</strong> {ent.fecha_inicio}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setEditarEntrenador(ent)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => { setEditarEntrenador(ent); eliminarEntrenador(); }}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal editar entrenador */}
      <Dialog open={!!editarEntrenador} onOpenChange={() => setEditarEntrenador(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Entrenador</DialogTitle>
          </DialogHeader>
          {editarEntrenador && (
            <div className="grid gap-3">
              <Input
                placeholder="Nombre"
                value={editarEntrenador.nombre}
                onChange={(e) => setEditarEntrenador({ ...editarEntrenador, nombre: e.target.value })}
              />
              <Input
                placeholder="Usuario"
                value={editarEntrenador.usuario}
                onChange={(e) => setEditarEntrenador({ ...editarEntrenador, usuario: e.target.value })}
              />
              <Input
                placeholder="Contraseña"
                value={editarEntrenador.password}
                onChange={(e) => setEditarEntrenador({ ...editarEntrenador, password: e.target.value })}
              />
              <Input
                placeholder="Teléfono"
                value={editarEntrenador.telefono}
                onChange={(e) => setEditarEntrenador({ ...editarEntrenador, telefono: e.target.value })}
              />
              <Input
                placeholder="Dirección"
                value={editarEntrenador.direccion}
                onChange={(e) => setEditarEntrenador({ ...editarEntrenador, direccion: e.target.value })}
              />
              <Input
                type="date"
                value={editarEntrenador.fecha_inicio || ""}
                onChange={(e) => setEditarEntrenador({ ...editarEntrenador, fecha_inicio: e.target.value })}
              />
            </div>
          )}
          <DialogFooter className="pt-4 space-x-2">
            <Button variant="destructive" onClick={eliminarEntrenador}>Eliminar</Button>
            <Button onClick={guardarEdicion}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
