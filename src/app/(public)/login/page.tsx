import { LoginForm } from '@/components/auth/login-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section - Form */}
      <div className="flex w-full flex-col justify-center p-8 md:w-1/2 lg:p-12 relative bg-background">
        <div className="absolute top-8 left-8 md:top-12 md:left-12">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
          </Button>
        </div>

        <div className="mx-auto w-full max-w-sm flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-sm text-muted-foreground">
              Introduce tus credenciales para acceder a tu cuenta
            </p>
          </div>

          <Suspense fallback={<div>Cargando formulario...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="hidden w-1/2 relative lg:block bg-muted overflow-hidden">
        <div className="absolute inset-x-0 -top-10 -left-90 -bottom-20 rotate-12 -skew-y-3 scale-125 flex flex-col animate-scroll-up opacity-50">
          <div className="relative h-full min-h-[100vh]">
            <Image
              src="/roadmap-preview.png"
              alt="Roadmap Preview"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative h-full min-h-[100vh]">
            <Image
              src="/roadmap-preview.png"
              alt="Roadmap Preview"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Gradient Overlay for aesthetic fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/80 pointer-events-none" />
      </div>
    </div>
  );
}
