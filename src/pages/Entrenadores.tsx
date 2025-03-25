import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface Entrenador {
  id: string;
  user_id: string;
  nombre: string;
  usuario: string;
  password: string;
}

export default function Entrenadores() {
  const [entrenadores, setEntrenadores] = useState<Entrenador[]>([]);
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Entrenador | null>(null);
  const [form, setForm] = useState({ nombre: "", usuario: "", password: "" });

  const navigate = useNavigate();

  const fetchEntrenadores = async () => {
    const { data, error } = await supabase.from("entrenadores").select("*");
    if (error) toast.error("Error cargando entrenadores");
    else setEntrenadores(data);
  };

  useEffect(() => {
    fetchEntrenadores();
  }, []);

  const handleOpenDialog = (entrenador?: Entrenador) => {
    if (entrenador) {
      setEditing(entrenador);
      setForm({
        nombre: entrenador.nombre,
        usuario: entrenador.usuario,
        password: entrenador.password,
      });
    } else {
      setEditing(null);
      setForm({ nombre: "", usuario: "", password: "" });
    }
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("entrenadores").delete().eq("id", id);
    if (error) toast.error("No se pudo eliminar");
    else {
      toast.success("Entrenador eliminado");
      fetchEntrenadores();
    }
  };

  const handleSubmit = async () => {
    const { nombre, usuario, password } = form;

    if (!nombre || !usuario || !password) {
      toast.warning("Rellena todos los campos");
      return;
    }

    if (editing) {
      // UPDATE
      const { error } = await supabase
        .from("entrenadores")
        .update({ nombre, usuario, password })
        .eq("id", editing.id);

      if (error) toast.error("Error al editar");
      else {
        toast.success("Entrenador actualizado");
        fetchEntrenadores();
        setShowDialog(false);
      }
    } else {
      // CREATE
      const { data: user, error: userError } = await supabase
        .from("users")
        .insert({ email: usuario, password, role: "entrenador" })
        .select()
        .single();

      if (userError) {
        toast.error("Error creando usuario");
        return;
      }

      const { error: entrenadorError } = await supabase
        .from("entrenadores")
        .insert({ user_id: user.id, nombre, usuario, password });

      if (entrenadorError) {
        toast.error("Error creando entrenador");
      } else {
        toast.success("Entrenador creado correctamente");
        fetchEntrenadores();
        setShowDialog(false);
      }
    }
  };

  const filtered = entrenadores.filter(e =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.usuario.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Entrenadores</h1>
          <p className="text-muted-foreground">Administra los entrenadores del sistema.</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Entrenador
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre o usuario"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <Card>
        <CardHeader>
          <CardTitle>Entrenadores Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No se encontraron entrenadores.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contraseña</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.nombre}</TableCell>
                    <TableCell>{e.usuario}</TableCell>
                    <TableCell>{e.password}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(e)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(e.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* DIALOGO */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
  <DialogHeader>
    <DialogTitle>{editing ? "Editar Entrenador" : "Nuevo Entrenador"}</DialogTitle>
  </DialogHeader>

  <div className="space-y-3 pt-2">
    <div>
      <label className="text-sm text-muted-foreground mb-1 block">
        {editing ? "Nuevo nombre" : "Nombre"}
      </label>
      <Input
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
      />
    </div>

    <div>
      <label className="text-sm text-muted-foreground mb-1 block">
        {editing ? "Nuevo usuario" : "Usuario"}
      </label>
      <Input
        placeholder="Usuario"
        value={form.usuario}
        onChange={(e) => setForm({ ...form, usuario: e.target.value })}
      />
    </div>

    <div>
      <label className="text-sm text-muted-foreground mb-1 block">
        {editing ? "Nueva contraseña" : "Contraseña"}
      </label>
      <Input
        placeholder="Contraseña"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        type="password"
      />
    </div>
  </div>

  <DialogFooter className="pt-4">
    <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
    <Button onClick={handleSubmit}>
      {editing ? "Guardar Cambios" : "Guardar"}
    </Button>
  </DialogFooter>
</DialogContent>

      </Dialog>
    </DashboardLayout>
  );
}
