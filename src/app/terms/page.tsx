import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Términos del Servicio — NuviaChat",
  description: "Términos y condiciones de uso de NuviaChat.",
};

export default function TermsPageRoute() {
  return (
    <LegalPage
      title="Términos del Servicio"
      updated="6 de septiembre de 2026"
      intro={
        "Al acceder o usar NuviaChat aceptas estos términos. Si no estás de acuerdo con ellos, no utilices el servicio."
      }
      blocks={[
        {
          title: "1. Aceptación y cambios",
          paragraphs: [
            "Al usar el servicio aceptas estos Términos y la Política de Privacidad. Podemos actualizarlos; la versión publicada en cada momento será la aplicable y se indicará la fecha de última actualización.",
          ],
        },
        {
          title: "2. Descripción del servicio",
          paragraphs: [
            "NuviaChat es un servicio de entretenimiento de compañía virtual para mayores de 18 años. Las llamadas, videollamadas, historias y conversaciones son simulaciones con personajes ficticios generados por inteligencia artificial. No hay personas reales detrás de los personajes.",
            "El servicio no es una aplicación de citas, ni una relación real, ni sustituye servicios profesionales (terapéuticos, médicos, legales o financieros).",
          ],
        },
        {
          title: "3. Requisito de edad",
          paragraphs: [
            "El contenido es exclusivo para mayores de 18 años. Al usarlo confirmas que tienes 18 años o más. Si eres menor de edad, no puedes acceder al servicio.",
          ],
        },
        {
          title: "4. Uso permitido y prohibiciones",
          paragraphs: [
            "El servicio se concede para tu uso personal y no comercial. Queda prohibido:",
          ],
          list: [
            "Usar el servicio para fines ilegales o contrarios a la ley.",
            "Intentar crear personajes que representen o se parezcan a personas reales (incluidas famosas, celebrities o personas conocidas).",
            "Solicitar contenido sexual explícito de menores o contenido que implique a menores.",
            "Acose, amenazas, violencia, odio, terrorismo o cualquier contenido que infrinja derechos de terceros (incluido el derecho a la propia imagen).",
            "Intentar vulnerar la seguridad, el código o los sistemas del servicio.",
            "Utilizar el contenido generado para suplantar personas reales (deepfakes) o con fines engañosos.",
          ],
        },
        {
          title: "5. Propiedad intelectual",
          paragraphs: [
            "La marca \"NuviaChat\", los personajes, imágenes, textos, diseños y el código del servicio son titularidad de Francisco Ortuño Payseo o se usan con autorización.",
            "Puedes usar los personajes e imágenes que generes para tu uso personal. No adquieres propiedad sobre ellos: el servicio se reserva una licencia sobre el contenido generado para poder ofrecértelo.",
          ],
        },
        {
          title: "6. Suscripciones y pagos",
          paragraphs: [
            "Actualmente el plan Premium se activa sin coste (versión demo) y puedes usarla libremente. Cuando se habilite una pasarela de pago real se aplicará lo siguiente:",
          ],
          list: [
            "El precio será el publicado en la página de planes en el momento de la contratación.",
            "El pago se realizará mediante pasarela segura (Stripe o PayPal) y nunca guardaremos datos de tarjeta nosotros.",
            "Las suscripciones podrán renovarse automáticamente; podrás cancelar en cualquier momento y el servicio seguirá disponible hasta el final del periodo pagado.",
            "Derecho de desistimiento de 14 días: tratándose de contenido digital de entrega inmediata, perderás el derecho de desistimiento cuando aceptes expresamente el inicio del servicio y reconozcas esta pérdida del derecho.",
            "Los periodos, créditos o contenidos ya consumidos no son reembolsables.",
          ],
        },
        {
          title: "7. Disponibilidad y responsabilidad",
          paragraphs: [
            "El servicio se ofrece \"tal cual\". Las respuestas de la IA pueden contener errores, inexactitudes o contenido inapropiado; el servicio es de entretenimiento y no debe tomarse como consejo.",
            "No garantizamos disponibilidad continua. Nuestra responsabilidad quedará limitada a lo previsto en la normativa vigente y no responderemos de daños indirectos o derivados del uso del servicio, salvo en los supuestos en que la ley no permita esta limitación.",
          ],
        },
        {
          title: "8. Suspensión del servicio",
          paragraphs: [
            "Podremos suspender o limitar el acceso al servicio si se incumplen estos Términos, se vulnera la ley o se pone en riesgo a otros usuarios o al propio servicio.",
          ],
        },
        {
          title: "9. Tus derechos",
          paragraphs: [
            "Puedes dejar de usar el servicio en cualquier momento y eliminar tus datos limpiando el almacenamiento del navegador o escribiéndonos a fortpay107@gmail.com.",
          ],
        },
        {
          title: "10. Ley aplicable y jurisdicción",
          paragraphs: [
            "Estos Términos se rigen por la legislación española. Para las controversias será competente el juzgado del domicilio del consumidor, conforme a la normativa de protección de consumidores y usuarios.",
          ],
        },
        {
          title: "11. Contacto",
          paragraphs: [
            "Para cualquier cuestión puedes escribir a: fortpay107@gmail.com.",
          ],
        },
      ]}
    />
  );
}