/** Domain types shared between client and server (no Prisma runtime dependency). */

export type Lang = "en" | "fr" | "de" | "es" | "ru" | "pt";

export type HistoryType =
  | "creation"
  | "war"
  | "trooperAdd"
  | "trooperUpdate"
  | "trooperAvailable"
  | "recruit";

export type FightResult = "win" | "lose";

export type MissionType = "exterminate" | "infiltrate" | "epic";

export interface User {
  id: string;
  lang: Lang;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
  lastConnexion: Date;
  admin: boolean;
  connexionToken?: string;
  gold: number;
  power: number;
  armyName: string;
  armyUrl: string;
  prefix: number;
  color: number;
  sponsoredById: string | null;
  referralGold: number;
  ratsCount: number;
  infiltrationOpponentArmy: string | null;
  infiltrationOpponentDate: Date | null;
  infiltrationUnlockAt: Date | null;
  exterminationUnlockAt: Date | null;
  epicUnlockAt: Date | null;
}

export interface Trooper {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  name: string;
  choices: number[];
  group: number;
  seed: number;
  targetSystem: number;
  targetType: number;
  reloadSystem: number;
  moveSystem: number;
  CBody: number;
  CWeapon: number | null;
  selectedItems: number[];
}

export interface TrooperDay {
  id: string;
  name: string;
  seed: number;
  choices: number[];
}

export interface Fight {
  id: string;
  userId: string;
  ts: Date;
  userName: string;
  userPrefix: number;
  opponentName: string;
  opponentPrefix: number;
  fightInputSWFData: string;
  result: FightResult;
}
