// src/components/auth/login-form.test.tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { RegisterForm } from './register-form';

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

it('debería renderizar los campos de contraseña y confirmación', () => {
  render(<RegisterForm />);

  expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Confirmar contraseña/i)).toBeInTheDocument();
});
