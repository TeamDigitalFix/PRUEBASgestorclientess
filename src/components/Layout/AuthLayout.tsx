import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/30 animate-fadeIn">
      <header className="w-full p-4 flex justify-end">
        {/* Botón de modo oscuro eliminado */}
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Gestor de Clientes. Todos los derechos reservados.
        <br />
        <a
          href="/terminosycondiciones"
          className="underline text-blue-600 hover:text-blue-800"
        >
          Ver términos y condiciones
        </a>
      </footer>
    </div>
  );
}
