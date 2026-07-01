const validatePassword = (pw) => {
  if (!pw || pw.length < 8) return "Password must be at least 8 characters long.";
  if (!/[a-z]/.test(pw)) return "Password must contain at least one lowercase letter.";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one number.";
  return null;
};

export default validatePassword;