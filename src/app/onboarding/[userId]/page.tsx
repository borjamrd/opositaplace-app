import OnboardingForm from '@/components/onboarding/onboarding-form';

// Esta página ahora es un Componente de Servidor limpio.
// Simplemente renderiza el formulario, que gestiona toda su propia lógica y estado.
export default function OnboardingPage() {
  return <OnboardingForm />;
}
