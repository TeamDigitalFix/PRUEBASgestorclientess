import { useEffect, useState } from "react";
import { Cliente } from "@/types/app";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface Props {
  cliente: Cliente;
  onClose: () => void;
}

export default function EditarClienteModal({ cliente, onClose }: Props) {
  const { actualizarCliente } = useAuth();
  const [formData, setFormData] = useState({
    nombre: cliente.nombre,
    usuario: cliente.usuario,
    password: cliente.password,
    telefono: cliente.telefono || "",
    direccion: cliente.direccion || "",
    fecha_inicio: cliente.fecha_inicio || "",
    observaciones: cliente.observaciones || "",
  });

  useEffect(() => {
    setFormData({
      nombre: cliente.nombre,
      usuario: cliente.usuario,
      password: cliente.password,
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
      fecha_inicio: cliente.fecha_inicio || "",
      observaciones: cliente.observaciones || "",
    });
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await actualizarCliente(cliente.id, formData);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <Input
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
          <Input
            name="usuario"
            placeholder="Usuario"
            value={formData.usuario}
            onChange={handleChange}
          />
          <Input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
          />
          <Input
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
          />
          <Input
            name="direccion"
            placeholder="Dirección"
            value={formData.direccion}
            onChange={handleChange}
          />
          <Input
            name="fecha_inicio"
            type="date"
            placeholder="Fecha de inicio"
            value={formData.fecha_inicio}
            onChange={handleChange}
          />
          <textarea
            name="observaciones"
            placeholder="Observaciones"
            className="p-2 border rounded-md dark:bg-black"
            value={formData.observaciones}
            onChange={handleChange}
          />
        </div>

        <Button onClick={handleSubmit}>Guardar cambios</Button>
      </DialogContent>
    </Dialog>
  );
}
