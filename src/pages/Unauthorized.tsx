export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-red-600">Acceso denegado</h1>
        <p className="text-lg text-gray-600">No tienes permisos para ver esta página.</p>
      </div>
    </div>
  );
}
