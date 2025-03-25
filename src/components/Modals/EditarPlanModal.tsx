import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cliente } from "@/types/app";

interface Props {
  cliente: Cliente;
  onClose: () => void;
}

export default function EditarPlanModal({ cliente, onClose }: Props) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Plan - {cliente.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aquí puedes agregar campos para editar el plan */}
          <p className="text-muted-foreground">Aquí se editarán los datos del plan del cliente en futuras versiones.</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
