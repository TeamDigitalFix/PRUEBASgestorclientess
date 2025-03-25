import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  children: React.ReactNode;
  recargar: () => void;
}

export default function NuevoEntrenadorModal({ children, recargar }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    usuario: "",
    password: "",
    telefono: "",
    direccion: "",
    fecha_inicio: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const crearEntrenador = async () => {
    setError("");
    setSuccess(false);

    if (!form.nombre || !form.usuario || !form.password) {
      setError("Nombre, Usuario y Contraseña son obligatorios.");
      return;
    }

    const { data: userInsert, error: errorUser } = await supabase
      .from("users")
      .insert({
        usuario: form.usuario,
        password: form.password,
        role: "entrenador",
      })
      .select("id")
      .single();

    if (errorUser) {
      setError(errorUser.message);
      return;
    }

    await supabase.from("entrenadores").insert({
      id: userInsert.id,
      nombre: form.nombre,
      usuario: form.usuario,
      telefono: form.telefono || null,
      direccion: form.direccion || null,
      fecha_inicio: form.fecha_inicio || null,
    });

    setSuccess(true);
    setTimeout(() => {
      setForm({
        nombre: "",
        usuario: "",
        password: "",
        telefono: "",
        direccion: "",
        fecha_inicio: "",
      });
      setOpen(false);
      recargar();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Entrenador</DialogTitle>
        </DialogHeader>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm">Entrenador creado con éxito.</p>
        )}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Input name="nombre" placeholder="Nombre *" onChange={handleChange} />
          <Input name="usuario" placeholder="Usuario *" onChange={handleChange} />
          <Input name="password" type="password" placeholder="Contraseña *" onChange={handleChange} />
          <Input name="telefono" placeholder="Teléfono" onChange={handleChange} />
          <Input name="direccion" placeholder="Dirección" onChange={handleChange} />
          <Input name="fecha_inicio" type="date" onChange={handleChange} />
        </div>
        <DialogFooter className="pt-4">
          <Button onClick={crearEntrenador}>Crear</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
