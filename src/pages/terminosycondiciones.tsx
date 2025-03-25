import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function TerminosYCondiciones() {
  useEffect(() => {
    window.scrollTo(0, 0); // Al cargar, ir arriba del todo
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Información Legal</h1>

      <Accordion type="multiple" className="space-y-4">

        <AccordionItem value="terminos">
          <AccordionTrigger className="text-lg font-semibold">📜 Términos y Condiciones</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Al utilizar esta aplicación, aceptas los siguientes términos y condiciones. Esta plataforma está destinada únicamente a entrenadores y clientes autorizados. Está prohibido el uso no autorizado, la copia del contenido, o cualquier forma de explotación sin consentimiento previo. Nos reservamos el derecho de modificar estos términos en cualquier momento.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="privacidad">
          <AccordionTrigger className="text-lg font-semibold">🔐 Política de Privacidad</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Los datos personales proporcionados por los usuarios se utilizarán exclusivamente para fines de gestión de entrenamientos, dietas y rutinas. No se compartirán con terceros sin consentimiento. Cumplimos con el RGPD y garantizamos medidas de seguridad adecuadas para proteger la información.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="aviso">
          <AccordionTrigger className="text-lg font-semibold">⚖️ Aviso Legal</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            Esta aplicación es propiedad de Digital Fix. Todos los derechos reservados. No se garantiza la disponibilidad permanente del servicio y no nos responsabilizamos por daños derivados del uso de la plataforma. Para cualquier consulta legal, puede contactarse con el administrador de la aplicación.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-center mt-10">
        <Button onClick={() => window.location.href = "https://gestorclientess-main2.vercel.app/"}>
          Volver a la web principal
        </Button>
      </div>
    </div>
  );
}
