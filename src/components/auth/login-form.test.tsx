import { render, screen } from '@testing-library/react';
import { LoginForm } from './login-form';
import { vi } from 'vitest';

vi.mock('@/actions/auth', () => ({
  signIn: vi.fn(),
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

describe('LoginForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
  });

  it('debe renderizar el botón de "Iniciar Sesión"', () => {
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });
});
