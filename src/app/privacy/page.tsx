import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Política de Privacidad — NuviaChat",
  description: "Política de privacidad de NuviaChat conforme al RGPD.",
};

export default function PrivacyPageRoute() {
  return (
    <LegalPage
      title="Política de Privacidad"
      updated="6 de septiembre de 2026"
      intro={
        "En NuviaChat respetamos tu privacidad. Esta política explica qué datos se tratan, para qué, con qué base jurídica y qué derechos puedes ejercer, de acuerdo con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD)."
      }
      blocks={[
        {
          title: "1. Responsable del tratamiento",
          paragraphs: [
            "Responsable: Francisco Ortuño Payseo (persona física, independiente).",
            "Correo de contacto: fortpay107@gmail.com.",
          ],
        },
        {
          title: "2. Qué datos se tratan",
          list: [
            "Mensajes de texto que escribes en el chat.",
            "Notas de voz y audio de las llamadas (solo mientras dura la llamada, para entenderte y responderte).",
            "Capturas de tu cámara durante la videollamada (solo si activas la cámara, para que la IA reaccione a lo que haces). Te pediremos tu consentimiento la primera vez.",
            "Personalizaciones de los personajes (cabello, pose, fondo, personalidad) que elijas.",
            "Personajes que creas tú mismo.",
            "Preferencias y estado del plan, guardados en tu navegador (localStorage).",
            "Actualmente NO se tratan datos bancarios ni de pago: el plan Premium se activa sin coste hasta que se habilite una pasarela de pago.",
          ],
        },
        {
          title: "3. Finalidades y base jurídica",
          paragraphs: [
            "Tratamos tus datos para las siguientes finalidades y con las siguientes bases jurídicas (art. 6.1 RGPD):",
          ],
          list: [
            "Prestar el servicio de chat, voz y vídeo: ejecución del contrato (art. 6.1.b).",
            "Generar respuestas, voz e imágenes con IA: tu consentimiento (art. 6.1.a), que puedes revocar en cualquier momento.",
            "Envío de capturas de cámara al procesador de IA durante la videollamada: tu consentimiento explícito (art. 6.1.a), solicitado al activar la cámara.",
            "Mejorar la experiencia y evitar fraudes o abusos: interés legítimo (art. 6.1.f).",
          ],
        },
        {
          title: "4. Destinatarios: proveedores externos de IA y terceros",
          paragraphs: [
            "Para funcionar, algunos datos se envían a proveedores de inteligencia artificial de terceros (por ejemplo, OpenAI u otros) a través de las funciones del servidor (chat, voz e imagen). Esto significa que tu mensaje, tu audio o tu imagen pueden ser procesados por sistemas de IA externos y sus servidores, sujetos a sus propias políticas de privacidad y retención.",
          ],
          list: [
            "Mensajes y contexto de conversación → proveedor de IA de chat.",
            "Audio de las llamadas → servicio de transcripción y voz (STT/TTS).",
            "Capturas de cámara → proveedor de IA de visión.",
            "Prompt de creación de personajes → generador de imágenes por IA.",
            "Alojamiento de imágenes y de la web → Cloudinary y GitHub Pages.",
            "En el futuro, pagos → pasarelas como Stripe o PayPal, que solo recibirán los datos necesarios para cobrar.",
          ],
          paragraphsAfter: [
            "Estos proveedores pueden estar situados fuera de la Unión Europea (por ejemplo, en Estados Unidos). Las transferencias internacionales se realizan con las garantías adecuadas (marcos de adecuación de la UE o cláusulas contractuales tipo).",
          ],
        },
        {
          title: "5. Almacenamiento y cookies",
          paragraphs: [
            "La mayor parte de tus datos (conversaciones, personajes, personalizaciones, preferencias) se guarda localmente en tu navegador mediante localStorage y sessionStorage, y puedes borrarla tú mismo en cualquier momento desde los ajustes del navegador.",
            "Este sitio NO utiliza cookies de seguimiento, publicidad ni analítica de terceros. No compartimos datos personales con anunciantes.",
          ],
        },
        {
          title: "6. Conservación",
          paragraphs: [
            "Los datos se conservan únicamente mientras son necesarios para prestar el servicio. Los datos almacenados en tu navegador se eliminan cuando los borras o dejas de usar el servicio. Los datos que los proveedores de IA puedan retener se rigen por sus propias políticas; por eso te recomendamos no compartir datos personales sensibles o de terceros en tus conversaciones.",
          ],
        },
        {
          title: "7. Tus derechos",
          paragraphs: [
            "Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición escribiendo a fortpay107@gmail.com. También puedes revocar el consentimiento prestado.",
            "Si consideras que no hemos tratado tus datos correctamente, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).",
          ],
        },
        {
          title: "8. Menores de edad",
          paragraphs: [
            "Este servicio es exclusivo para mayores de 18 años. No recogemos deliberadamente datos de menores. Si detectamos que un usuario es menor de edad, dejaremos de prestarle el servicio y eliminaremos sus datos.",
          ],
        },
        {
          title: "9. Seguridad",
          paragraphs: [
            "Aplicamos medidas técnicas y organizativas razonables (HTTPS, cifrado en tránsito, minimización de datos). Ningún sistema es infalible; por eso no debes compartir información que pueda comprometerte a ti o a terceros.",
          ],
        },
        {
          title: "10. Cambios en esta política",
          paragraphs: [
            "Podemos actualizar esta política. Publicaremos la fecha de la última actualización en esta página.",
          ],
        },
      ]}
    />
  );
}