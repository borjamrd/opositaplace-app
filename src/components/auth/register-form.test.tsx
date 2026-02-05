// src/components/auth/register-form.test.tsx

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { RegisterForm } from './register-form';

vi.mock('@/actions/auth', () => ({
  signUp: vi.fn(),
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
      pending: false,
    }),
  };
});

describe('RegisterForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar los campos de contraseña y confirmación', () => {
    render(<RegisterForm />);

    const passwordInputs = screen.getAllByPlaceholderText(/^Contraseña$/i);
    expect(passwordInputs.length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Confirmar contraseña/i)).toBeInTheDocument();
  });
});
