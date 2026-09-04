import { UserExtended } from "@minitroopers/shared";

type UserWithSensitiveFields = UserExtended & {
  connexionToken?: string;
  ipAddressUser?: { ip: string }[];
};

const SENSITIVE_KEYS = ["connexionToken", "ipAddressUser", "admin"] as const;

export const omitSensitiveFields = <T extends UserWithSensitiveFields>(
  user: T,
) => {
  const clone = { ...user } as Record<string, unknown>;
  for (const key of SENSITIVE_KEYS) {
    delete clone[key];
  }
  return clone as Omit<T, (typeof SENSITIVE_KEYS)[number]>;
};

/** Strip sensitive fields from user payloads sent to clients */
export const sanitizeUser = <T extends UserWithSensitiveFields>(
  user: T | null,
) => {
  if (!user) {
    return null;
  }
  return omitSensitiveFields(user);
};
