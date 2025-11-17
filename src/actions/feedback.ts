'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ai } from '@/ai/genkit'; //
import { z } from 'zod';

export interface FeedbackContextData {
  plannedDaysCount: number;
  actualStudyHours: number;
  recentTests: {
    score: number;
    date: string;
    title: string;
  }[];
  topicProgress: {
    completed: number;
    in_progress: number;
    not_started: number;
  };
  userName: string;
}

export async function getFeedbackContext(): Promise<FeedbackContextData | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Definir rango de tiempo (últimos 7 días) para métricas de actividad
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoIso = oneWeekAgo.toISOString();

  // Ejecutar todas las consultas en paralelo para minimizar latencia
  const [onboardingRes, sessionsRes, testsRes, topicsRes, profileRes] = await Promise.all([
    // 1. Planificación (Días objetivo)
    supabase.from('onboarding_info').select('study_days').eq('user_id', user.id).single(),

    // 2. Horas reales (Últimos 7 días)
    supabase
      .from('user_study_sessions')
      .select('duration_seconds')
      .eq('user_id', user.id)
      .gte('started_at', oneWeekAgoIso),

    // 3. Calidad (Últimos 10 tests)
    supabase
      .from('test_attempts')
      .select('score, created_at, title') // Asumiendo que existe 'title' o similar
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),

    // 4. Progreso del Temario (Solo estados)
    supabase.from('user_topic_status').select('status').eq('user_id', user.id),

    // 5. Nombre del usuario
    supabase.from('profiles').select('username, email').eq('id', user.id).single(),
  ]);

  // --- Procesamiento de Datos (Aggregations) ---

  // A. Días Planificados
  let plannedDaysCount = 0;
  const studyDays = onboardingRes.data?.study_days;
  if (Array.isArray(studyDays)) {
    plannedDaysCount = studyDays.length;
  } else if (typeof studyDays === 'object' && studyDays !== null) {
    // Si es un objeto tipo {monday: true}, contamos las keys
    plannedDaysCount = Object.keys(studyDays).length;
  }

  // B. Horas Reales
  const totalSeconds =
    sessionsRes.data?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
  const actualStudyHours = Number((totalSeconds / 3600).toFixed(1));

  // C. Tests Recientes (Limpiamos nulls y formatos)
  const recentTests = (testsRes.data || []).map((t) => ({
    score: t.score || 0,
    date: t.created_at, // Formato ISO es suficiente para el LLM
    title: t.title || 'Test general',
  }));

  // D. Progreso Temario (Conteo manual ya que SQL GROUP BY es complejo vía cliente JS)
  const topicProgress = {
    completed: 0,
    in_progress: 0,
    not_started: 0,
  };

  topicsRes.data?.forEach((t) => {
    const status = t.status as keyof typeof topicProgress;
    if (topicProgress[status] !== undefined) {
      topicProgress[status]++;
    }
  });

  // E. Nombre
  const meta = profileRes || {};
  const userName =
    (meta.data?.email as string)?.split(' ')[0] || profileRes.data?.username || 'Opositor';

  return {
    plannedDaysCount,
    actualStudyHours,
    recentTests,
    topicProgress,
    userName,
  };
}

export async function generateSmartFeedback(context: FeedbackContextData): Promise<string> {
  const systemPrompt = `
    Eres el entrenador personal de oposiciones de ${context.userName}.
    Tu tono es: Exigente pero motivador. Directo. Sin rodeos.
    
    OBJETIVO: Analizar los datos de estudio de la última semana y dar un feedback corto (MÁXIMO 2 FRASES).
    
    DATOS DEL ALUMNO:
    - Días planificados/semana: ${context.plannedDaysCount}
    - Horas estudiadas (últimos 7 días): ${context.actualStudyHours}h
    - Temario completado: ${context.topicProgress.completed} temas (${context.topicProgress.in_progress} en proceso).
    - Últimos 10 tests: Nota media aprox ${
      context.recentTests.length > 0
        ? (
            context.recentTests.reduce((a, b) => a + b.score, 0) / context.recentTests.length
          ).toFixed(1)
        : 0
    }
    
    INSTRUCCIONES DE RESPUESTA:
    - Si ha estudiado poco (< 5h): "Bronca" constructiva. Recuérdale que la plaza no se regala.
    - Si ha estudiado bien (> 15h) o tiene buenas notas: Felicítale por la constancia, ese es el camino.
    - Si hay muchos temas "en proceso" pero pocos "completados": Dile que cierre temas antes de abrir nuevos.
    - NO uses saludos tipo "Hola". Ve al grano.
    - NO uses markdown complejo, solo texto plano.
  `;

  try {
    // 2. Llamamos a Genkit (Gemini Flash Lite es perfecto para esto: rápido y barato)
    const { text } = await ai.generate({
      prompt: systemPrompt,
      config: {
        temperature: 0.7, 
      },
    });

    return text;
  } catch (error) {
    console.error('Error generando feedback con IA:', error);
    // Fallback en caso de error del LLM para que la UI no rompa
    return `Sigue estudiando, ${context.userName}. La constancia es la clave del éxito.`;
  }
}
