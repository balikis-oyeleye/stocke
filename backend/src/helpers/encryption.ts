import bcrypt from "bcryptjs";

export const comparePassword = async (
  password: string,
  hashedPassword?: string | null,
): Promise<boolean> => {
  if (!hashedPassword) return false;

  return bcrypt.compare(password, hashedPassword);
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
