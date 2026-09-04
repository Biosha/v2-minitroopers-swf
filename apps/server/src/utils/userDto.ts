import { UserExtended } from "@minitroopers/shared";
import { omitSensitiveFields } from "./sanitizeUser.js";

type DbUser = UserExtended & {
  connexionToken?: string;
  ipAddressUser?: { ip: string }[];
};

const stripSensitive = <T extends DbUser>(user: T) => omitSensitiveFields(user);

/** Public army profile (no auth or viewing another player) */
export const toPublicUserDto = (user: {
  armyName: string;
  prefix: number;
  exterminationUnlockAt?: Date | null;
  infiltrationUnlockAt?: Date | null;
  epicUnlockAt?: Date | null;
}) => ({
  armyName: user.armyName,
  prefix: user.prefix,
  exterminationUnlockAt: user.exterminationUnlockAt ?? null,
  infiltrationUnlockAt: user.infiltrationUnlockAt ?? null,
  epicUnlockAt: user.epicUnlockAt ?? null,
});

/** Owner-only full profile */
export const toOwnerUserDto = <T extends DbUser>(user: T) =>
  stripSensitive(user);

/** Auth handshake: session token included once; admin only here for the owner */
export const toAuthUserDto = <T extends DbUser>(
  user: T,
  connexionToken: string,
) => ({
  ...stripSensitive(user),
  connexionToken,
  admin: Boolean(user.admin),
});
