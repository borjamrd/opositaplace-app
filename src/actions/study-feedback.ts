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
      .select('score, created_at, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10), // 4. Progreso del Temario (Solo estados)

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
    date: t.created_at, // Formato ISO es suficiente para el LLM
    title: t.title || 'Test general',
  })); // D. Progreso Temario (Conteo manual ya que SQL GROUP BY es complejo vía cliente JS)

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

  return {
    plannedDaysCount,
    actualStudyHours,
    recentTests,
    topicProgress,
    userName,
    weeklyStudyGoalHours,
    totalHistoricalHours,
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
  const isOverStudying = goal > 0 && context.actualStudyHours > goal * 1.5;
  const isLowHours = context.actualStudyHours < 5;
  const hasTopicInProgress = in_progress > 0;

  let specificInstruction = '';

  if (isOverStudying) {
    // Caso: Sobre-estudio
    const overagePercentage = ((context.actualStudyHours / goal - 1) * 100).toFixed(0);
    specificInstruction = `Tu compromiso es innegable al superar tu meta (${goal}h) en un ${overagePercentage}%. Es crucial que revises tu planificación para asegurar que tu ritmo es sostenible a largo plazo y evitar el agotamiento.`;
  } else if (isLowHours && hasTopicInProgress) {
    // Caso: Bajas horas + Tema a medias
    specificInstruction = `Tu ritmo de estudio ha sido bajo esta semana. Teniendo ${in_progress} tema(s) a medias, la prioridad debe ser **cerrar esa unidad** para consolidar el conocimiento antes de empezar un nuevo tema.`;
  }
  const systemPrompt = `
    Eres el entrenador personal de oposiciones de ${context.userName}.
Tu tono es: **Neutral, profesional, directo/a y motivador/a**. Tu objetivo es proporcionar un análisis constructivo de la última semana y animar a seguir estudiando.    
   OBJETIVO: Analizar los datos de estudio de la última semana y dar un feedback corto (MÍNIMO 3 FRASES Y MÁXIMO 4 FRASES).
    
    DATOS DEL ALUMNO (ÚLTIMOS 7 DÍAS):
    - Meta semanal planificada: ${goal}h
    - Horas estudiadas: ${context.actualStudyHours}h
    - Días de estudio planificados: ${context.plannedDaysCount}
    - Temario: ${completed} temas completados (${in_progress} en proceso). Total de temas: ${topicsLength}
    - Últimos 10 tests: Nota media aprox ${
      context.recentTests.length > 0
        ? (
            context.recentTests.reduce((a, b) => a + b.score, 0) / context.recentTests.length
          ).toFixed(1)
        : 0
    }
    
    INSTRUCCIONES DE RESPUESTA (Prioridad ALTA):
    1. **NO USES** términos de género explícitos como "campeón", "campeona", "crack", o "máquina". Mantén un lenguaje neutral y profesional.
    
    2. **SI el usuario se ha excedido significativamente (más de un 50%) de su Meta planificada** (Meta: ${goal}h, Estudiadas: ${context.actualStudyHours}h):
        * Felicita por el compromiso y el esfuerzo.
        * Añade una **recomendación explícita para reajustar su planificación semanal** en la configuración. (Ejemplo: "Tu ritmo es excelente, pero considera ajustar tu meta a X horas para que sea más realista.")

    3. **SI el usuario lleva pocas Horas estudiadas** (ej. < 5h) y **tiene temas "en proceso"** (${in_progress} > 0):
        * El feedback debe ser una recomendación amigable para **priorizar cerrar el tema o la unidad que tiene a medias** antes de distraerse o abrir nuevo material.
    
    INSTRUCCIONES DE RESPUESTA (Prioridad Normal - Usar si no aplican las anteriores):
    - Si ha estudiado poco (< 5h): Proporciona una recomendación constructiva y amigable animándole a recuperar el ritmo.
    - Si ha estudiado bien (> 15h) o tiene buenas notas: Felicítale por la constancia y la disciplina.
    - Si hay muchos temas "en proceso" pero pocos "completados": Recuérdale cerrar temas antes de abrir nuevos.
    - NO uses saludos tipo "Hola". Ve al grano.
    - NO uses markdown complejo, solo texto plano.
    - La respuesta debe ser concisa, no más de 4 frases.
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
