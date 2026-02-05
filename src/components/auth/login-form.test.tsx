// src/components/auth/login-form.test.tsx

import { render, screen } from '@testing-library/react';
import { LoginForm } from './login-form';
import { vi } from 'vitest';

vi.mock('@/actions/auth', () => ({
  signIn: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const actualReact = await importOriginal<typeof import('react')>();
  return {
    ...actualReact,
    useActionState: () => [null, () => {}],
  };
});

vi.mock('react-dom', async (importOriginal) => {
  const actualReactDom = await importOriginal<typeof import('react-dom')>();
  return {
    ...actualReactDom,
    useFormStatus: () => ({
      pending: false, // El estado por defecto que queremos simular
    }),
  };
});

describe('LoginForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar los campos de email y contraseña', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText(/Correo electrónico/i)).toBeInTheDocument();
    const passwordInput = screen.getByPlaceholderText(/^Contraseña$/i);
    expect(passwordInput).toBeInTheDocument();
  });

  it('debe renderizar el botón de "Iniciar Sesión"', () => {
    render(<LoginForm />);

    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });
});
