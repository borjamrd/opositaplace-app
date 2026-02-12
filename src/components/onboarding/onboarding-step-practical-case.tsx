'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookText, CheckCheckIcon } from 'lucide-react';
import { PracticalCaseView } from '@/components/practical/practical-case-view';
import { PracticalCase } from '@/lib/supabase/types';

const MOCK_CASE: PracticalCase = {
  id: 'mock-case-onboarding',
  title: 'Caso Práctico: El Dilema del Funcionario',
  statement: `
## Situación
Eres un funcionario recién nombrado en el Departamento de Asuntos Generales. Tu jefe, Don Severo, te pide que tramites un expediente de contratación para suministro de material de oficina. Sin embargo, observas que el proveedor propuesto es "Suministros Cuñado S.L.", propiedad del cuñado de Don Severo.

## Pregunta
¿Cómo debes proceder según el Estatuto Básico del Empleado Público y la Ley de Contratos del Sector Público? Razona tu respuesta basándote en los principios de imparcialidad y las causas de abstención.
  `,
  official_solution: 'La solución real aparecería aquí en el modo completo.',
  evaluation_criteria: {},
  difficulty: 'Baja',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  opposition_id: 'mock-opposition-id',
};

export default function OnboardingStepPracticalCase() {
  const [hasStarted, setHasStarted] = useState(false);

  if (!hasStarted) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center pt-8">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2">
          <BookText className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">Casos Prácticos con IA</h2>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
          Enfréntate a situaciones reales y recibe correcciones instantáneas. Nuestra IA analiza tu
          respuesta, evalúa tu fundamentación jurídica y te sugiere mejoras.
        </p>
        <div className="bg-muted/30 p-4 rounded-lg text-left max-w-lg mx-auto space-y-2">
          <div className="flex items-start gap-3">
            <CheckCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-sm">Feedback detallado en segundos.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-sm">Análisis de estructura, contenido y base legal.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCheckIcon className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-sm">Pon a prueba tus conocimientos teóricos.</p>
          </div>
        </div>

        <div className="pt-6">
          <Button
            onClick={() => setHasStarted(true)}
            size="lg"
            className="w-full md:w-auto px-8 py-6 text-lg"
          >
            Probar un caso práctico <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500">
      <PracticalCaseView
        caseData={MOCK_CASE}
        initialAttempt={null}
        showBackButton={false}
        isMock={true}
      />
    </div>
  );
}
