import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuth } from "@/context/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NuevoClienteModal({ open, onClose }: Props) {
  const { crearCliente, user } = useAuth();

  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCrear = async () => {
    if (!user) return;
    setLoading(true);

    await crearCliente({
      entrenador_id: user.id,
      nombre,
      usuario,
      contrasena,
      telefono,
      direccion,
      fecha_inicio: fechaInicio,
      observaciones,
    });

    setLoading(false);
    onClose();
    // Limpiar campos
    setNombre("");
    setUsuario("");
    setContrasena("");
    setTelefono("");
    setDireccion("");
    setFechaInicio("");
    setObservaciones("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Nombre del cliente</label>
            <Input
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Usuario</label>
            <Input
              placeholder="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Contraseña</label>
            <Input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Teléfono</label>
            <Input
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Dirección</label>
            <Input
              placeholder="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Fecha de inicio</label>
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Observaciones</label>
            <Input
              placeholder="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleCrear} disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
