import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginForm from "@/pages/login";
import DashboardSuperadmin from "@/pages/DashboardSuperadmin";
import DashboardEntrenador from "@/pages/DashboardEntrenador";
import DashboardCliente from "@/pages/DashboardCliente";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import TerminosYCondiciones from "@/pages/terminosycondiciones"; // 🆕 Ruta pública añadida

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/terminosycondiciones" element={<TerminosYCondiciones />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
            <Route path="/superadmin" element={<DashboardSuperadmin />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["entrenador"]} />}>
            <Route path="/entrenador" element={<DashboardEntrenador />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["cliente"]} />}>
            <Route path="/cliente" element={<DashboardCliente />} />
          </Route>

          {/* Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </Router>
  );
}

export default App;
