import {
  FightResult,
  HistoryType,
  MissionType,
  Trooper,
  User,
} from "./domain-types";

export type {
  FightResult,
  HistoryType,
  MissionType,
  Trooper,
  User,
} from "./domain-types";

export interface UserExtended extends User {
  troopers: Trooper[];
  history: { type: HistoryType; options: unknown; ts: Date }[];
  fights: {
    id: string;
    result: FightResult;
    ts: Date;
    opponentName?: string;
  }[];
  missions: {
    id: string;
    type: MissionType;
    result: FightResult;
    ts: Date;
  }[];
  raids: { id: string; result: FightResult; ts: Date; graveyard: string[] }[];
  ipAddressUser?: { ip: string }[];
}

export type PartialUserExtended = Omit<
  UserExtended,
  | "id"
  | "lang"
  | "name"
  | "invitedFrom"
  | "createdAt"
  | "lastConnexion"
  | "admin"
  | "connexionToken"
  | "referralGold"
  | "sponsoredById"
  | "ipAddressUser"
  | "ratsCount"
  | "infiltrationOpponentArmy"
  | "infiltrationOpponentDate"
>;

export const getReferralPrice = (recruit: number): number => {
  if (recruit >= 35) return 0;
  if (recruit >= 15) return 5;
  if (recruit >= 5) return 10;
  if (recruit >= 1) return 50;
  return 100;
};

export const parseToPartialUser = (user: UserExtended): PartialUserExtended => {
  return {
    armyName: user.armyName,
    armyUrl: user.armyUrl,
    color: user.color,
    gold: 0,
    power: user.power,
    prefix: user.prefix,
    history: [],
    fights: [],
    missions: [],
    raids: [],
    troopers: user.troopers ?? [],
    epicUnlockAt: user.epicUnlockAt,
    exterminationUnlockAt: user.exterminationUnlockAt,
    infiltrationUnlockAt: user.infiltrationUnlockAt,
  };
};

export interface UserRanking {
  rank: number | null;
  armyName: string;
  power: number;
  faction: number;
  size: number;
  recruits: number;
  gold: number | null;
  isOwner: boolean;
}
