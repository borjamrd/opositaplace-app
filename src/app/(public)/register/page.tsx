import { RegisterForm } from '@/components/auth/register-form';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <div className="flex -mt-20 min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-radial from-amber-400/50 via-background to-secondary/20">
      <Suspense fallback={<div>Cargando formulario...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
