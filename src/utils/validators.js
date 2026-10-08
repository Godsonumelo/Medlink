export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Must contain an uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Must contain a lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Must contain a number");
  return errors;
}

export function validatePhone(phone) {
  const regex = /^\+?[\d\s-]{10,}$/;
  return regex.test(phone);
}

export function validateName(name) {
  return name.trim().length >= 2;
}

export function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: "weak", color: "danger", percent: 33 };
  if (score <= 4) return { level: "medium", color: "warning", percent: 66 };
  return { level: "strong", color: "success", percent: 100 };
}
