// src/pages/Clientes.tsx

import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { format } from "date-fns";

interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
  fecha_inicio: string;
  dieta: string;
  rutina: string;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
    ],
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    const { data, error } = await supabase.from("clientes").select("*");
    if (error) console.error("Error al obtener clientes", error);
    else setClientes(data || []);
  };

  const actualizarCliente = async () => {
    if (!clienteSeleccionado) return;

    const { error } = await supabase
      .from("clientes")
      .update({
        dieta: clienteSeleccionado.dieta,
        rutina: clienteSeleccionado.rutina,
      })
      .eq("id", clienteSeleccionado.id);

    if (error) console.error("Error al actualizar", error);
    else setMostrarModal(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Entrenador</h1>
      {clientes.map((cliente) => (
        <div key={cliente.id} className="mb-4 p-4 border rounded bg-white shadow">
          <p><strong>Nombre:</strong> {cliente.nombre}</p>
          <p><strong>Teléfono:</strong> {cliente.telefono}</p>
          <p><strong>Dirección:</strong> {cliente.direccion}</p>
          <p><strong>Fecha inicio:</strong> {format(new Date(cliente.fecha_inicio), "yyyy-MM-dd")}</p>
          <button
            onClick={() => {
              setClienteSeleccionado(cliente);
              setMostrarModal(true);
            }}
            className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
          >
            Editar Dieta/Rutina
          </button>
        </div>
      ))}

      {mostrarModal && clienteSeleccionado && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar Dieta y Rutina</h2>

            <label className="font-semibold">Dieta</label>
            <ReactQuill
              value={clienteSeleccionado.dieta || ""}
              onChange={(value) =>
                setClienteSeleccionado({ ...clienteSeleccionado, dieta: value })
              }
              className="bg-white mb-4"
              modules={modules}
            />

            <label className="font-semibold">Rutina</label>
            <ReactQuill
              value={clienteSeleccionado.rutina || ""}
              onChange={(value) =>
                setClienteSeleccionado({ ...clienteSeleccionado, rutina: value })
              }
              className="bg-white mb-4"
              modules={modules}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancelar
              </button>
              <button
                onClick={actualizarCliente}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
