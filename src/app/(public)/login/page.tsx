import { LoginForm } from '@/components/auth/login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/30">
      <Suspense fallback={<div>Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
