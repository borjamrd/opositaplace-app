import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCopy, CheckSquare, PieChart } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">¡Bienvenido a tu Dashboard!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Aquí podrás gestionar tu preparación para las oposiciones. ¡Mucho ánimo!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">
            Este es tu espacio personalizado en OpositaPlace. Próximamente encontrarás aquí herramientas para:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-foreground/90">
            <li>Organizar tus temas y materiales de estudio.</li>
            <li>Crear y seguir planes de estudio detallados.</li>
            <li>Realizar tests y simulacros de examen.</li>
            <li>Analizar tu progreso y estadísticas.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Temas Estudiados</CardTitle>
            <BookCopy className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 / 0</div>
            <p className="text-xs text-muted-foreground">Próximamente: gestiona tus temas</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Tareas Pendientes</CardTitle>
            <CheckSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Próximamente: organiza tus tareas</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Progreso General</CardTitle>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">Próximamente: visualiza tu avance</p>
          </CardContent>
        </Card>
      </div>
       <div className="text-center">
          <Image 
            src="https://placehold.co/800x400.png" 
            alt="Placeholder motivacional para opositores"
            width={800}
            height={400}
            className="mx-auto rounded-lg shadow-md"
            data-ai-hint="motivation study"
          />
          <p className="mt-4 text-muted-foreground italic">"El éxito es la suma de pequeños esfuerzos repetidos día tras día."</p>
        </div>
    </div>
  );
}
