import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, BarChart3, BookOpen, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      icon: <CalendarCheck className="h-10 w-10 text-primary" />,
      title: "Planificación Personalizada",
      description: "Crea planes de estudio adaptados a tu ritmo y temario.",
      link: "#",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Seguimiento de Progreso",
      description: "Visualiza tu avance y identifica áreas de mejora.",
      link: "#",
    },
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: "Material de Estudio Centralizado",
      description: "Accede y organiza tu material de estudio en un solo lugar.",
      link: "#",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-primary">OpositaPlace:</span> Tu camino al éxito en las oposiciones.
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-10">
            Organiza tu estudio, sigue tu progreso y alcanza tus metas con nuestra plataforma integral diseñada para opositores como tú.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" asChild className="shadow-lg hover:shadow-primary/30 transition-shadow">
              <Link href="/register">
                Empezar Ahora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="shadow-sm hover:shadow-md transition-shadow">
              <Link href="#features">Más Información</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Placeholder Image Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="relative aspect-video max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden">
            <Image
              src="https://placehold.co/1200x675.png"
              alt="OpositaPlace platform preview"
              layout="fill"
              objectFit="cover"
              data-ai-hint="dashboard study"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Todo lo que necesitas para <span className="text-primary">aprobar</span>
          </h2>
          <p className="text-center text-foreground/70 max-w-2xl mx-auto mb-16 text-lg">
            Descubre las herramientas que te ayudarán a optimizar tu preparación y conseguir tu plaza.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader className="items-center text-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-foreground/70 flex-grow">
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para transformar tu estudio?
          </h2>
          <p className="text-lg text-foreground/80 max-w-xl mx-auto mb-10">
            Regístrate gratis y da el primer paso hacia tu futuro profesional.
          </p>
          <Button size="lg" asChild className="shadow-lg hover:shadow-primary/30 transition-shadow">
            <Link href="/register">
              Crear Cuenta Gratis <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-primary/5 border-t border-border/20">
        <div className="container mx-auto px-4 text-center text-foreground/60">
          <p>&copy; {new Date().getFullYear()} OpositaPlace. Todos los derechos reservados.</p>
          <p className="text-sm mt-2">
            Hecho con <span className="text-red-500">❤️</span> para los futuros funcionarios.
          </p>
        </div>
      </footer>
    </div>
  );
}
