'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ai } from '@/ai/genkit';
import crypto from 'crypto';
import { z } from 'zod';

export interface FeedbackContextData {
  plannedDaysCount: number;
  actualStudyHours: number;
  recentTests: {
    score: number;
    netScore: number;
    unansweredQuestions: number;
    totalQuestions: number;
    date: string;
    title: string;
  }[];
  topicProgress: {
    completed: number;
    in_progress: number;
    not_started: number;
  };
  userName: string;
  weeklyStudyGoalHours: number;
  totalHistoricalHours: number;
  daysSinceLastSession: number;
  userId: string;
}

export async function getFeedbackContext(): Promise<FeedbackContextData | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // Definir rango de tiempo (últimos 7 días) para métricas de actividad

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoIso = oneWeekAgo.toISOString();

  // Se mueve esta consulta fuera del Promise.all para mantener tu estructura de codeo,
  // aunque es importante asegurar que esta consulta se ejecuta.
  const totalSessionsRes = await supabase
    .from('user_study_sessions')
    .select('duration_seconds')
    .eq('user_id', user.id); // F. Total Horas Históricas

  const totalHistoricalSeconds =
    totalSessionsRes.data?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
  const totalHistoricalHours = Number((totalHistoricalSeconds / 3600).toFixed(1)); // Ejecutar todas las consultas en paralelo para minimizar latencia

  const [onboardingRes, sessionsRes, testsRes, topicsRes, profileRes] = await Promise.all([
    // 1. Planificación (Días objetivo Y Horas Objetivo) - ¡CORREGIDO!
    supabase
      .from('onboarding_info')
      .select('study_days, weekly_study_goal_hours') // <--- ¡AÑADIDO weekly_study_goal_hours!
      .eq('user_id', user.id)
      .single(), // 2. Horas reales (Últimos 7 días)

    supabase
      .from('user_study_sessions')
      .select('duration_seconds')
      .eq('user_id', user.id)
      .gte('started_at', oneWeekAgoIso), // 3. Calidad (Últimos 10 tests)

    supabase
      .from('test_attempts')
      .select('score, net_score, unanswered_questions, total_questions, created_at, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .gte('finished_at', oneWeekAgoIso),

    supabase.from('user_topic_status').select('status').eq('user_id', user.id), // 5. Nombre del usuario

    supabase.from('profiles').select('username, email').eq('id', user.id).single(),
  ]); // --- Procesamiento de Datos (Aggregations) ---
  // A. Días Planificados

  let plannedDaysCount = 0;
  const studyDays = onboardingRes.data?.study_days;
  if (Array.isArray(studyDays)) {
    plannedDaysCount = studyDays.length;
  } else if (typeof studyDays === 'object' && studyDays !== null) {
    // Si es un objeto tipo {monday: true}, contamos las keys
    plannedDaysCount = Object.keys(studyDays).length;
  }

  // A.1. Horas Objetivo Semanales - ¡CORREGIDO!
  const weeklyStudyGoalHours = onboardingRes.data?.weekly_study_goal_hours || 0; // B. Horas Reales

  const totalSeconds =
    sessionsRes.data?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
  const actualStudyHours = Number((totalSeconds / 3600).toFixed(1)); // C. Tests Recientes (Limpiamos nulls y formatos)

  const recentTests = (testsRes.data || []).map((t) => ({
    score: t.score || 0,
    netScore: t.net_score ?? t.score ?? 0,
    unansweredQuestions: t.unanswered_questions || 0,
    totalQuestions: t.total_questions || 0,
    date: t.created_at,
    title: t.title || 'Test general',
  }));

  // D. Progreso Temario

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
  }); // E. Nombre

  const meta = profileRes || {};
  const userName =
    (meta.data?.email as string)?.split(' ')[0] || profileRes.data?.username || 'Opositor';

  // Días desde última sesión: consultamos la sesión más reciente (cualquier semana)
  const { data: lastSessionData } = await supabase
    .from('user_study_sessions')
    .select('started_at')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let daysSinceLastSession = 0;
  if (lastSessionData?.started_at) {
    const lastDate = new Date(lastSessionData.started_at);
    const now = new Date();
    daysSinceLastSession = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    plannedDaysCount,
    actualStudyHours,
    recentTests,
    topicProgress,
    userName,
    weeklyStudyGoalHours,
    totalHistoricalHours,
    daysSinceLastSession,
    userId: user.id,
  };
}

export async function generateSmartFeedback(context: FeedbackContextData): Promise<string> {
  const supabase = await createSupabaseServerClient();

  // 0. Calcular Hash del Contexto (para detectar cambios)
  const contextForHash = {
    ...context,
    userName: undefined,
  };
  const currentHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(contextForHash))
    .digest('hex');

  // 1. Verificar si ya existe feedback para este hash
  const { data: existingFeedback } = await supabase
    .from('ai_progress_feedback')
    .select('feedback_text, context_hash')
    .eq('user_id', context.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existingFeedback && existingFeedback.context_hash === currentHash) {
    return existingFeedback.feedback_text;
  }
  if (context.totalHistoricalHours < 2) {
    // Menos de 1 hora estudiada históricamente
    const plannedDays = context.plannedDaysCount;
    if (plannedDays > 0) {
      return `Este es tu apartado resumen. Como llevas menos de dos horas de estudio no tengo datos suficientes para darte feedback. Has planificado ${plannedDays} días de estudio a la semana. Registra sesiones y realiza tests para que pueda valorar tu progreso`;
    } else {
      return `Este es tu apartado resumen. Para empezar, te recomiendo que vayas al Panel de Onboarding para configurar tus días y horario de estudio. ¡A por tu plaza!`;
    }
  }
  const { completed, in_progress, not_started } = context.topicProgress;
  const topicsLength = completed + in_progress + not_started;
  const goal = context.weeklyStudyGoalHours || 0;

  // Métricas derivadas de tests
  const testsCount = context.recentTests.length;
  const avgScore =
    testsCount > 0
      ? Number((context.recentTests.reduce((a, b) => a + b.score, 0) / testsCount).toFixed(1))
      : 0;
  const avgNetScore =
    testsCount > 0
      ? Number((context.recentTests.reduce((a, b) => a + b.netScore, 0) / testsCount).toFixed(1))
      : 0;
  const avgUnansweredRatio =
    testsCount > 0
      ? Number(
          (
            (context.recentTests.reduce(
              (a, b) => a + (b.totalQuestions > 0 ? b.unansweredQuestions / b.totalQuestions : 0),
              0
            ) /
              testsCount) *
            100
          ).toFixed(0)
        )
      : 0;
  // Diferencia significativa net_score vs score => el usuario contesta a ciegas
  const netScoreGap = Number((avgScore - avgNetScore).toFixed(1));

  // Ausencia reciente de estudio (umbral: 3 días sin sesión)

  const systemPrompt = `
Eres el entrenador personal de oposiciones de ${context.userName}.
Tono: neutral, profesional, directo y motivador.
OBJETIVO: Análisis constructivo de la última semana. MÍNIMO 5 frases, MÁXIMO 6 frases. Sin saludos. Solo texto plano.

DATOS DEL ALUMNO (ÚLTIMOS 7 DÍAS):
- Meta semanal: ${goal}h | Horas estudiadas: ${context.actualStudyHours}h
- Racha: última sesión hace ${context.daysSinceLastSession} día(s)
- Temario: ${completed} completados, ${in_progress} en proceso, ${not_started} sin empezar (total: ${topicsLength})
- Tests realizados: ${testsCount}${testsCount > 0 ? ` | Nota media (bruta): ${avgScore}/10 | Nota media (penalizada): ${avgNetScore}/10 | Preguntas en blanco: ${avgUnansweredRatio}%` : ''}

INSTRUCCIONES DE RESPUESTA — PRIORIDAD ALTA (aplica el primero que corresponda):
1. INACTIVIDAD: Si lleva ${context.daysSinceLastSession} días sin estudiar (>= 3 días), DEBES comenzar el feedback alertando sobre la racha de inactividad y animar a retomar hoy mismo. Es la señal más urgente.
2. CONTESTAR A CIEGAS: Si la diferencia entre nota bruta (${avgScore}) y nota penalizada (${avgNetScore}) es >= 1.5 puntos (diferencia actual: ${netScoreGap} pts), advierte que en oposiciones las respuestas incorrectas restan puntos, y que es mejor dejar en blanco las preguntas dudosas. Solo aplica si hay tests esta semana.
3. SOBRE-ESTUDIO: Si supera la meta en >50% (meta: ${goal}h, real: ${context.actualStudyHours}h), felicita y recomienda ajustar la meta semanal en la configuración.
4. BAJAS HORAS + TEMA A MEDIAS: Si horas < 5 y hay temas en proceso (${in_progress}), recomienda cerrar el tema antes de abrir material nuevo.

INSTRUCCIONES DE RESPUESTA — PRIORIDAD NORMAL (si no aplica ninguna alta):
- Pocas horas (< 5h) pero sin inactividad extrema: animar a recuperar el ritmo.
- Buenas horas (> 15h) o buenas notas: felicitar por la constancia.
- Muchos temas en proceso pero pocos completados: recordar cerrar temas.

PROHIBIDO: términos de género ("campeón", "crack", etc.), saludos tipo "Hola", markdown complejo, más de 4 frases.
  `;

  try {
    const { text } = await ai.generate({
      prompt: systemPrompt,
      config: {
        temperature: 0.7,
      },
    });

    // 3. Guardar en DB el nuevo feedback generado
    await supabase.from('ai_progress_feedback').insert({
      user_id: context.userId,
      feedback_text: text,
      context_hash: currentHash,
    });

    return text;
  } catch (error) {
    console.error('Error generando feedback con IA:', error);
    return `Sigue estudiando, ${context.userName}. La constancia es la clave del éxito.`;
  }
}
