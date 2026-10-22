import { MIN_PASSWORD_LENGTH, isValidEmail } from '../../../shared/lib/validation';

// Prefijos de cédula/RIF venezolanos.
export const TAX_ID_PREFIXES = ['V', 'E', 'J', 'G', 'P'] as const;

export type TaxIdPrefix = (typeof TAX_ID_PREFIXES)[number];

export interface RegisterValues {
  fullName: string;
  email: string;
  taxIdPrefix: TaxIdPrefix;
  taxIdNumber: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

export const EMPTY_REGISTER_VALUES: RegisterValues = {
  fullName: '',
  email: '',
  taxIdPrefix: 'V',
  taxIdNumber: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
};

export function formatTaxId({ taxIdPrefix, taxIdNumber }: RegisterValues) {
  return `${taxIdPrefix}-${taxIdNumber.trim()}`;
}

export function validateRegister(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (values.fullName.trim().length < 3) {
    errors.fullName = 'Escribe tu nombre y apellido.';
  }

  if (!isValidEmail(values.email)) {
    errors.email = 'Escribe un correo válido.';
  }

  if (!/^\d{6,9}$/.test(values.taxIdNumber.trim())) {
    errors.taxIdNumber = 'Solo números, entre 6 y 9 dígitos.';
  }

  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Repite tu contraseña.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Debes aceptar los términos para continuar.';
  }

  return errors;
}
