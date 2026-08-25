
export const checkPasswordStrength = (password = '') => {
  return {
    hasMinLength: password.length >= 8 && password.length <= 128,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[@$!%*?&]/.test(password),
  };
};

export const isPasswordValid = (password = '') => {
  const checks = checkPasswordStrength(password);
  return (
    checks.hasMinLength &&
    checks.hasUppercase &&
    checks.hasLowercase &&
    checks.hasNumber &&
    checks.hasSpecial
  );
};

export default {
  checkPasswordStrength,
  isPasswordValid,
};
