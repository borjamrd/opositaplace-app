---
applyTo: "**"
---
Directrices Generales de Codificación para OpositaPlace
Estas instrucciones aplican a todo el código en el repositorio de OpositaPlace para mantener la consistencia y la calidad.

1. Convenciones de Nomenclatura
   Componentes React, Interfaces y Tipos: Usar PascalCase.
   Ejemplo: UserProfileCard, SubscriptionInterface, StudyCycle
   Variables, Funciones y Métodos: Usar camelCase.
   Ejemplo: fetchUserData, calculateScore, activeOppositionId
   Constantes (globales): Usar ALL_CAPS con guiones bajos para separar palabras.
   Ejemplo: API_BASE_URL, MAX_HOURS_PER_WEEK
   Nombres de archivos: Usar kebab-case para archivos de componentes y rutas, y camelCase o snake_case para utilidades y acciones.
   Ejemplo: user-profile-card.tsx, submitOnboarding.ts, database_types.ts
2. Estructura del Código
   Modularidad: Dividir el código en módulos pequeños y reutilizables.
   Separación de Conceptos: Separar la lógica de negocio, la lógica de presentación y el acceso a datos.
   Rutas de Importación: Preferir aliases de ruta (@/) para importaciones absolutas para componentes, hooks, lib y stores.
   Ejemplo: import { Button } from '@/components/ui/button';
   Ejemplo: import { useToast } from '@/hooks/use-toast';
   Ejemplo: import { createClient } from '@/lib/supabase/client';
3. Comentarios y Documentación
   Mínima cantidad de comentarios: El código debe ser lo más autoexplicativo posible.
   Variables y métodos descriptivos: Los nombres de variables y métodos deben describir claramente su función.
   Comentarios solo para lógica compleja: Solo se deben añadir comentarios para explicar la lógica de negocio no obvia o decisiones de diseño específicas.
4. Gestión del Estado
   Zustand para estado global: Utilizar Zustand para la gestión del estado global de la aplicación.
   Ejemplo: useOppositionStore, useStudyCycleStore, useSubscriptionStore
   React Query para datos asíncronos: Utilizar React Query para la gestión del estado del servidor y el almacenamiento en caché de datos asíncronos.
   Ejemplo: useProfile, useUserSubscription
5. Prácticas de Frontend (React/Next.js)
   Componentes funcionales y Hooks: Preferir componentes funcionales con Hooks.
   Validación de formularios: Utilizar react-hook-form con zod para la validación de formularios.
   Ejemplo: Uso en RegisterForm, LoginForm, OnboardingPage
   UI Components: Utilizar los componentes UI de Shadcn/ui existentes en src/components/ui.
6. Manejo de Errores
   Server Actions: Las Server Actions deben retornar un objeto con message y opcionalmente errors para manejar la retroalimentación al usuario.
   Ejemplo: submitOnboarding, signUp, signIn
   Toasts para notificaciones: Utilizar el sistema de toast para mostrar notificaciones al usuario, incluyendo mensajes de éxito o error.
   Ejemplo: Uso de useToast en formularios y suscripciones
7. Supabase
   Creación de clientes: Usar createClient para operaciones del lado del cliente y createSupabaseServerClient, createSupabaseRouteHandlerClient para el lado del servidor/acciones.
   Consultas: Centralizar las consultas complejas a Supabase en archivos de queries bajo src/lib/supabase/queries.
8. Stripe
   Gestión de suscripciones: Las interacciones con Stripe deben pasar por las API Routes definidas en src/app/api/stripe/ y las acciones en src/lib/stripe/actions.ts.
   Configuración de planes: Los detalles de los planes de Stripe deben estar centralizados en src/lib/stripe/config.ts.
9. Inteligencia Artificial (AI)
   Flujos Genkit: Los flujos de IA para el asistente deben definirse en src/ai/flows/.
   Ejemplo: opositaplaceChatFlow
