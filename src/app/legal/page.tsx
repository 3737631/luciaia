import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Aviso Legal — NuviaChat",
  description: "Aviso legal e identificación del titular de NuviaChat.",
};

export default function LegalPageRoute() {
  return (
    <LegalPage
      title="Aviso Legal"
      updated="6 de septiembre de 2026"
      intro={
        "En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI), se informa de los siguientes datos del titular de este sitio web."
      }
      blocks={[
        {
          title: "Identificación del titular",
          list: [
            "Titular: Francisco Ortuño Payseo (persona física, independiente).",
            "Correo de contacto: fortpay107@gmail.com.",
            "Actividad: servicio de entretenimiento de compañía virtual para mayores de 18 años (chat, voz y vídeo con personajes ficticios generados por IA).",
          ],
        },
        {
          title: "Objeto del servicio y contenido",
          paragraphs: [
            "NuviaChat es un servicio de entretenimiento exclusivo para mayores de 18 años. Todos los personajes son ficticios y generados por IA; no representan personas reales.",
            "El servicio no constituye una relación sentimental, laboral, terapéutica, médica, legal ni financiera de ningún tipo. El contenido generado por la IA (texto, voz e imágenes) tiene carácter exclusivamente lúdico y no debe interpretarse como consejo profesional.",
          ],
        },
        {
          title: "Propiedad intelectual e industrial",
          paragraphs: [
            "La marca \"NuviaChat\", los textos, el diseño, el código fuente, los personajes y las imágenes generadas dentro del servicio son titularidad de Francisco Ortuño Payseo o se utilizan con la debida autorización. Quedan protegidos conforme a la normativa de propiedad intelectual e industrial vigente.",
            "El usuario no adquiere ningún derecho sobre dichos elementos más allá de la licencia de uso personal descrita en los Términos del Servicio. Queda prohibida la reproducción, distribución o explotación comercial de los contenidos sin autorización expresa.",
          ],
        },
        {
          title: "Responsabilidad",
          paragraphs: [
            "El titular no garantiza la disponibilidad continua o ininterrumpida del servicio, ni la exactitud, calidad o adecuación de las respuestas generadas por la IA.",
            "El contenido se ofrece \"tal cual\". La responsabilidad del titular se limita a lo establecido en la normativa vigente; no se responde de los daños que pudieran derivarse del uso indebido del servicio, de la información ofrecida o de los contenidos propios, salvo en los supuestos previstos por la ley.",
          ],
        },
        {
          title: "Transparencia sobre inteligencia artificial",
          paragraphs: [
            "Conforme a la normativa europea sobre inteligencia artificial (Reglamento (UE) 2024/1689), se informa de que todos los personajes, voces, imágenes y respuestas de este servicio están generados por sistemas de inteligencia artificial. No son personas reales.",
          ],
        },
        {
          title: "Ley aplicable y jurisdicción",
          paragraphs: [
            "Este sitio se rige por la legislación española. Para cualquier controversia derivada del uso del sitio será competente el juzgado correspondiente al domicilio del consumidor, de conformidad con la normativa de protección de consumidores y usuarios, sin perjuicio de otras normas imperativas aplicables.",
          ],
        },
        {
          title: "Modificaciones",
          paragraphs: [
            "El titular se reserva el derecho a modificar este aviso legal para adaptarlo a cambios normativos o técnicos. La versión publicada en cada momento será la aplicable.",
          ],
        },
        {
          title: "Contacto",
          paragraphs: [
            "Para cualquier cuestión relativa a este aviso legal, los Términos del Servicio o la Política de Privacidad, puedes escribir a: fortpay107@gmail.com.",
          ],
        },
      ]}
    />
  );
}