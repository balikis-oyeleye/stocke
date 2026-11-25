export const hasExpired = (expiryDate: Date | null | undefined): boolean => {
  if (!expiryDate) return true;

  return Date.now() >= expiryDate.getTime();
};
