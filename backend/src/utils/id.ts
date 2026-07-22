import { customAlphabet } from "nanoid";

const slugChars = "abcdefghijklmnopqrstuvwxyz0123456789";
export const generateSlug = customAlphabet(slugChars, 6);

const keyChars = "abcdefghijklmnopqrstuvwxyz0123456789";
export const generateApiKey = (): string => {
  const prefix = "snp_";
  const body = customAlphabet(keyChars, 32)();
  return prefix + body;
};
