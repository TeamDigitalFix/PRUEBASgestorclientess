import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!usuario || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    const user = await login(usuario, password);

    if (!user) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }

    if (user.role === "superadmin") {
      navigate("/superadmin");
    } else if (user.role === "entrenador") {
      navigate("/entrenador");
    } else if (user.role === "cliente") {
      navigate("/cliente");
    } else {
      setError("Rol desconocido. Contacta al administrador.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 space-y-4">
      <h2 className="text-2xl font-bold text-center">¡Bienvenido/a!</h2>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <input
        type="text"
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        className="w-full border px-4 py-2 rounded text-black placeholder-gray-400 dark:text-black dark:placeholder-gray-400"
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-4 py-2 rounded text-black placeholder-gray-400 dark:text-black dark:placeholder-gray-400"
      />

      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
        Entrar
      </button>
    </form>
  );
}
