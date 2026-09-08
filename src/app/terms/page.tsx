import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Términos del Servicio — NuviaChat",
  description: "Términos y condiciones de uso de NuviaChat.",
};

export default function TermsPageRoute() {
  return (
    <LegalPage
      title="Términos del Servicio"
      updated="8 de septiembre de 2026"
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
          title: "6. Pagos y suscripciones",
          paragraphs: [
            "El acceso Premium se contratará por el precio publicado en la página de planes en el momento de la contratación, en euros. El pago se realiza a través de la pasarela de pago PayPal; no almacenamos ni gestionamos ningún dato de tarjeta, y cualquier tratamiento de estos datos se realiza exclusivamente conforme a las condiciones de PayPal.",
          ],
          list: [
            "Pago único: un pago único da acceso durante el periodo contratado (un mes o un año) desde el momento de la activación.",
            "Suscripción mensual automática: se cobrará el importe correspondiente cada mes y la suscripción se renovará automáticamente hasta que la canceles. Podrás cancelarla en cualquier momento desde tu cuenta o escribiéndonos; el acceso seguirá disponible hasta el final del periodo ya pagado.",
            "Subida de plan con prorrateo: si ya dispones de un plan activo y contratas un plan superior, se descontará del precio del nuevo plan el valor proporcional del tiempo restante de tu plan actual, cobrándose únicamente la diferencia. En las suscripciones mensuales este descuento se aplica a la primera cuota y las cuotas posteriores se cobran al precio completo. El nuevo plan se activa por un periodo completo desde el momento de la contratación.",
            "Derecho de desistimiento de 14 días: tratándose de contenido digital de entrega inmediata, perderás el derecho de desistimiento cuando aceptes expresamente el inicio del servicio y reconozcas esta pérdida del derecho.",
            "Los periodos, créditos o contenidos ya consumidos no son reembolsables.",
            "Las anulaciones o devoluciones de pagos por PayPal tramitadas contra este servicio podrán conllevar la suspensión o revocación del acceso.",
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