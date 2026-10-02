/**
 * User model and validation rules.
 * Mirrors User entity in backend.
 */

export const DEFAULT_USER = {
  name: '',
  email: '',
};

/**
 * Validates user creation input
 * @param {{ name: string, email: string }} user
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateUser(user) {
  const errors = {};

  if (!user.name || user.name.trim().length === 0) {
    errors.name = 'El nombre es obligatorio.';
  } else if (user.name.trim().length > 100) {
    errors.name = 'El nombre no puede exceder 100 caracteres.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const email = user.email?.trim() || '';
  if (email.length > 150) {
    errors.email = 'El correo no puede exceder 150 caracteres.';
  } else if (email.length > 0 && !emailRegex.test(email)) {
    errors.email = 'Por favor ingresa un correo electrónico válido.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
