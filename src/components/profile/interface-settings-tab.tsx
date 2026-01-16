'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TabsContent } from '@/components/ui/tabs';
import { DashboardSections, useUiStore } from '@/store/ui-store';

export function InterfaceSettingsTab() {
  const { dashboardSections, toggleDashboardSection } = useUiStore();

  const sections: { key: keyof DashboardSections; label: string; description: string }[] = [
    {
      key: 'studyFeedback',
      label: 'Feedback de estudio',
      description: 'Muestra un resumen de tu progreso y consejos personalizados.',
    },
    {
      key: 'selectiveProcessTimeline',
      label: 'Línea de tiempo del proceso',
      description: 'Visualiza las fechas importantes de tu oposición.',
    },
    {
      key: 'studySessionsChart',
      label: 'Gráfico de sesiones',
      description: 'Muestra tu actividad de estudio a lo largo del tiempo.',
    },
    {
      key: 'srsWidget',
      label: 'Repaso Espaciado (SRS)',
      description: 'Muestra las tarjetas que tienes pendientes de repasar.',
    },
    {
      key: 'failedQuestions',
      label: 'Preguntas falladas',
      description: 'Acceso rápido a las preguntas que has fallado recientemente.',
    },
  ];

  return (
    <TabsContent value="interface" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalizar Interfaz</CardTitle>
          <CardDescription>
            Elige qué secciones quieres ver en tu panel de control principal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections.map((section) => (
            <div key={section.key} className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor={section.key}>{section.label}</Label>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
              <Switch
                id={section.key}
                checked={dashboardSections[section.key]}
                onCheckedChange={() => toggleDashboardSection(section.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
