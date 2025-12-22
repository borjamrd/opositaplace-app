export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-20 md:py-28">
      <h1 className="text-3xl font-bold mb-6 text-primary">Política de Privacidad</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-sm text-muted-foreground mb-8">
          <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-ES')}
        </p>

        <p>
          En <strong>Opositaplace</strong> nos tomamos muy en serio la privacidad de tus datos. De
          conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), te
          informamos detalladamente sobre cómo tratamos tu información personal.
        </p>

        <h2>1. Responsable del Tratamiento</h2>
        <p>¿Quién es el responsable de tus datos?</p>
        <ul>
          <li>
            <strong>Identidad/Razón Social:</strong> Borja Muñoz Ruiz - Dana
          </li>
          <li>
            <strong>NIF/CIF:</strong> 78811773L
          </li>
          <li>
            <strong>Dirección Postal:</strong> Calle Pintor Juan Miguel Sánchez, 2, 41018, Sevilla
          </li>
          <li>
            <strong>Correo electrónico:</strong>soporte@opositaplace.com
          </li>
        </ul>

        <h2>2. Qué datos recopilamos</h2>
        <p>
          Basándonos en el funcionamiento de nuestra aplicación, recopilamos las siguientes
          categorías de datos:
        </p>

        <h3>Datos de Identificación y Contacto</h3>
        <ul>
          <li>Dirección de correo electrónico (necesario para el registro e inicio de sesión).</li>
          <li>Nombre de usuario y nombre completo (si se facilita en el perfil).</li>
          <li>Imagen de perfil o avatar.</li>
          <li>Datos de autenticación de terceros (si utilizas Google o GitHub para entrar).</li>
        </ul>

        <h3>Datos Académicos y de Actividad</h3>
        <ul>
          <li>Información sobre la oposición que preparas y tus objetivos de estudio.</li>
          <li>Historial de sesiones de estudio, fechas y duración.</li>
          <li>Resultados de tests, respuestas a preguntas y estadísticas de rendimiento.</li>
          <li>Casos prácticos realizados y sus correcciones.</li>
          <li>Tarjetas de memoria (Flashcards) y estado de repaso.</li>
        </ul>

        <h3>Datos Económicos</h3>
        <ul>
          <li>
            Historial de suscripciones y estado de los pagos.
            <br />
            <em>
              Nota: Opositaplace no almacena números de tarjeta completos; estos son gestionados de
              forma segura por Stripe.
            </em>
          </li>
        </ul>

        <h3>Datos Técnicos</h3>
        <ul>
          <li>
            Dirección IP, tipo de dispositivo y navegador para fines de seguridad y auditoría.
          </li>
        </ul>

        <h2>3. Finalidad del tratamiento y Legitimación</h2>
        <p>¿Para qué usamos tus datos y por qué es legal hacerlo?</p>

        <div className="overflow-x-auto my-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-2 px-4 font-semibold">Finalidad</th>
                <th className="py-2 px-4 font-semibold">Base Legal (Legitimación)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-800">
                <td className="py-2 px-4">Gestión de usuarios (registro, login)</td>
                <td className="py-2 px-4">Ejecución de un contrato (Términos del servicio).</td>
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="py-2 px-4">
                  Prestación del servicio (guardar progreso, corrección de tests)
                </td>
                <td className="py-2 px-4">Ejecución de un contrato.</td>
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="py-2 px-4">Pagos y Facturación</td>
                <td className="py-2 px-4">Ejecución de contrato y Obligación Legal.</td>
              </tr>
              <tr className="border-b dark:border-gray-800">
                <td className="py-2 px-4">Inteligencia Artificial (corrección casos prácticos)</td>
                <td className="py-2 px-4">Interés legítimo en mejorar el servicio.</td>
              </tr>
              <tr>
                <td className="py-2 px-4">Comunicaciones del servicio</td>
                <td className="py-2 px-4">Ejecución de contrato.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>4. Destinatarios de los datos</h2>
        <p>
          Para poder prestar el servicio, compartimos datos estrictamente necesarios con los
          siguientes proveedores tecnológicos:
        </p>
        <ul>
          <li>
            <strong>Supabase, Inc. (EE.UU.):</strong> Proveedor de autenticación y base de datos.
          </li>
          <li>
            <strong>Stripe, Inc. (EE.UU.):</strong> Gestión de cobros y suscripciones.
          </li>
          <li>
            <strong>Google LLC:</strong> Funcionalidades de IA (Google AI / Genkit) para corrección
            y generación de contenido.
          </li>
          <li>
            <strong>Resend (EE.UU.):</strong> Envío de correos electrónicos transaccionales.
          </li>
        </ul>
        <p>
          Opositaplace garantiza que dichas transferencias internacionales se realizan bajo marcos
          de seguridad adecuados, como el Data Privacy Framework (DPF) o Cláusulas Contractuales
          Tipo.
        </p>

        <h2>5. Conservación de los datos</h2>
        <p>
          Conservaremos tus datos personales mientras mantengas tu cuenta activa. Si decides
          eliminarla, bloquearemos tus datos y solo los conservaremos durante los plazos legalmente
          establecidos para atender posibles responsabilidades legales.
        </p>

        <h2>6. Tus Derechos</h2>
        <p>Como usuario, tienes derecho a:</p>
        <ul>
          <li>
            <strong>Acceder</strong> a tus datos para saber qué información tenemos.
          </li>
          <li>
            <strong>Rectificar</strong> datos inexactos o incompletos.
          </li>
          <li>
            <strong>Suprimir</strong> tus datos (derecho al olvido).
          </li>
          <li>
            <strong>Oponerte</strong> o <strong>Limitar</strong> el tratamiento de tus datos.
          </li>
          <li>
            Solicitar la <strong>Portabilidad</strong> de tus datos.
          </li>
        </ul>
        <p>
          Puedes ejercer estos derechos escribiendo a <strong>[Tu Email de Soporte]</strong>.
        </p>

        <h2>7. Seguridad</h2>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas, incluyendo el cifrado de
          contraseñas, el uso de conexiones seguras (SSL/TLS) y políticas de seguridad en base de
          datos (Row Level Security).
        </p>

        <h2>8. Cambios en la Política</h2>
        <p>
          Nos reservamos el derecho a modificar esta política para adaptarla a novedades
          legislativas. Te notificaremos cualquier cambio relevante.
        </p>
      </div>
    </div>
  );
}
