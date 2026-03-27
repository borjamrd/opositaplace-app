import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { RegisterForm } from './register-form';

vi.mock('@/actions/auth', () => ({
  signUp: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('react', async (importOriginal) => {
  const actualReact = await importOriginal<typeof import('react')>();
  return {
    ...actualReact,
    useActionState: () => [null, vi.fn()],
  };
});

vi.mock('react-dom', async (importOriginal) => {
  const actualReactDom = await importOriginal<typeof import('react-dom')>();
  return {
    ...actualReactDom,
    useFormStatus: () => ({
      pending: false,
    }),
  };
});

it('should render password and confirmation fields', () => {
  render(<RegisterForm />);

  expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
  expect(screen.getAllByPlaceholderText('Contraseña')).toHaveLength(2);
  expect(screen.getByLabelText(/Confirmar contraseña/i)).toBeInTheDocument();
});
