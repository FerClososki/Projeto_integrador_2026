export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const re = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  return re.test(phone);
};