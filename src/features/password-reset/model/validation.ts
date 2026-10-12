import { MIN_PASSWORD_LENGTH } from '../../../shared/lib/validation';

export interface NewPasswordValues {
  password: string;
  confirmation: string;
}

export type NewPasswordErrors = Partial<Record<keyof NewPasswordValues, string>>;

export function validateNewPassword({ password, confirmation }: NewPasswordValues): NewPasswordErrors {
  const errors: NewPasswordErrors = {};

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (confirmation !== password) {
    errors.confirmation = 'Las contraseñas no coinciden.';
  }

  return errors;
}
