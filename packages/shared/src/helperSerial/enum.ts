export class Enum extends Array {
  constructor(...args: any[]) {
    super(...args);
  }

  static resolve(): void {
    Object.defineProperty(this, "name", {
      value: (this as any).__name__,
      configurable: false,
      writable: false,
    });

    if (typeof window !== "undefined") {
      const win = window;
      if (!(win as any).__enum__) {
        (win as any).__enum__ = {};
      }
      (win as any).__enum__[this.name] = this;
    } else {
      const glob = globalThis;
      if (typeof (glob as any).__enum__ === "undefined") {
        (glob as any).__enum__ = {};
      }
      (glob as any).__enum__[this.name] = this;
    }
  }

  override toString(): string {
    return this[0];
  }
}

export class ClientMode extends Enum {
  static __name__ = "ClientMode";
  static __construct__ = ["BATTLE", "BLOCKS", "NEW_TROOPER"];

  static BATTLE(arg0: any, arg1: any) {
    return new this("BATTLE", 0, arg0, arg1);
  }

  static BLOCKS(arg0: any) {
    return new this("BLOCKS", 4, arg0);
  }

  static NEW_TROOPER(arg0: any, arg1: any) {
    return new this("NEW_TROOPER", 2, arg0, arg1);
  }
}
ClientMode.resolve();

export class TrooperType extends Enum {
  static __name__ = "TrooperType";
  static __construct__ = ["HUMAN", "RAT"];
  static HUMAN = new this("HUMAN", 0);
  static RAT = new this("RAT", 2);
}
TrooperType.resolve();

export class MoveSystem extends Enum {
  static __name__ = "MoveSystem";
  static __construct__ = ["HUNTER", "STANDARD", "DEFENDER"];
  static HUNTER = new this("HUNTER", 0);
  static STANDARD = new this("STANDARD", 1);
  static DEFENDER = new this("DEFENDER", 2);
}
MoveSystem.resolve();

export class BodyLoc extends Enum {
  static __name__ = "BodyLoc";
  static __construct__ = [
    "HEAD",
    "TORSO_LEFT",
    "TORSO_RIGHT",
    "STOMACH",
    "ARM_LEFT",
    "ARM_RIGHT",
    "LEG_LEFT",
    "LEG_RIGHT",
  ];
  static HEAD = new this("HEAD", 0);
  static TORSO_LEFT = new this("TORSO_LEFT", 1);
  static TORSO_RIGHT = new this("TORSO_RIGHT", 2);
  static STOMACH = new this("STOMACH", 3);
  static ARM_LEFT = new this("ARM_LEFT", 4);
  static ARM_RIGHT = new this("ARM_RIGHT", 5);
  static LEG_LEFT = new this("LEG_LEFT", 6);
  static LEG_RIGHT = new this("LEG_RIGHT", 7);
}
BodyLoc.resolve();

export class TargetType extends Enum {
  static __name__ = "TargetType";
  static __construct__ = ["DEFAULT", "SPECIFIC_CLASS"];
  static DEFAULT = new this("DEFAULT", 0);

  static SPECIFIC_CLASS(arg0: number) {
    return new this("SPECIFIC_CLASS", 1, arg0);
  }
}
TargetType.resolve();

export class ReloadSystem extends Enum {
  static __name__ = "ReloadSystem";
  static __construct__ = ["RISKY", "CAUTIOUS", "DEFAULT", "FULL"];
  static RISKY = new this("RISKY", 0);
  static CAUTIOUS = new this("CAUTIOUS", 1);
  static DEFAULT = new this("DEFAULT", 2);
  static FULL = new this("FULL", 3);
}
ReloadSystem.resolve();

export class TargetSystem extends Enum {
  static __name__ = "TargetSystem";
  static __construct__ = ["CLOSEST", "EASIEST", "WEAKEST", "STRONGEST"];
  static CLOSEST = new this("CLOSEST", 0);
  static EASIEST = new this("EASIEST", 1);
  static WEAKEST = new this("WEAKEST", 2);
  static STRONGEST = new this("STRONGEST", 3);
}
TargetSystem.resolve();

export class BackgroundType extends Enum {
  static __name__ = "BackgroundType";
  static __construct__ = [
    "BG_GARDEN",
    "BG_ATTIC",
    "BG_SEWER",
    "BG_ROAD",
    "BG_WOOD",
  ];
  static BG_GARDEN = new this("BG_GARDEN", 0);
  static BG_ATTIC = new this("BG_ATTIC", 1);
  static BG_SEWER = new this("BG_SEWER", 2);
  static BG_ROAD = new this("BG_ROAD", 3);
  static BG_WOOD = new this("BG_WOOD", 4);
}
BackgroundType.resolve();

export class WeaponEnum extends Enum {
  static __name__ = "Weapon";
  static __construct__ = [
    "WEAPON_00",
    "WEAPON_01",
    "WEAPON_02",
    "WEAPON_03",
    "WEAPON_04",
    "WEAPON_05",
    "WEAPON_06",
    "WEAPON_07",
    "WEAPON_08",
    "WEAPON_09",
    "WEAPON_10",
    "WEAPON_11",
    "WEAPON_12",
    "WEAPON_13",
    "WEAPON_14",
    "WEAPON_15",
    "WEAPON_16",
    "WEAPON_17",
    "WEAPON_18",
    "WEAPON_19",
    "WEAPON_20",
    "WEAPON_21",
    "WEAPON_22",
    "WEAPON_23",
    "WEAPON_24",
    "WEAPON_25",
    "WEAPON_26",
    "WEAPON_27",
    "WEAPON_28",
    "WEAPON_29",
    "WEAPON_30",
    "WEAPON_31",
    "WEAPON_32",
    "WEAPON_33",
    "WEAPON_34",
    "WEAPON_35",
    "WEAPON_36",
    "WEAPON_37",
  ];
  static WEAPON_00 = new this("WEAPON_00", 0);
  static WEAPON_01 = new this("WEAPON_01", 1);
  static WEAPON_02 = new this("WEAPON_02", 2);
  static WEAPON_03 = new this("WEAPON_03", 3);
  static WEAPON_04 = new this("WEAPON_04", 4);
  static WEAPON_05 = new this("WEAPON_05", 5);
  static WEAPON_06 = new this("WEAPON_06", 6);
  static WEAPON_07 = new this("WEAPON_07", 7);
  static WEAPON_08 = new this("WEAPON_08", 8);
  static WEAPON_09 = new this("WEAPON_09", 9);
  static WEAPON_10 = new this("WEAPON_10", 10);
  static WEAPON_11 = new this("WEAPON_11", 11);
  static WEAPON_12 = new this("WEAPON_12", 12);
  static WEAPON_13 = new this("WEAPON_13", 13);
  static WEAPON_14 = new this("WEAPON_14", 14);
  static WEAPON_15 = new this("WEAPON_15", 15);
  static WEAPON_16 = new this("WEAPON_16", 16);
  static WEAPON_17 = new this("WEAPON_17", 17);
  static WEAPON_18 = new this("WEAPON_18", 18);
  static WEAPON_19 = new this("WEAPON_19", 19);
  static WEAPON_20 = new this("WEAPON_20", 20);
  static WEAPON_21 = new this("WEAPON_21", 21);
  static WEAPON_22 = new this("WEAPON_22", 22);
  static WEAPON_23 = new this("WEAPON_23", 23);
  static WEAPON_24 = new this("WEAPON_24", 24);
  static WEAPON_25 = new this("WEAPON_25", 25);
  static WEAPON_26 = new this("WEAPON_26", 26);
  static WEAPON_27 = new this("WEAPON_27", 27);
  static WEAPON_28 = new this("WEAPON_28", 28);
  static WEAPON_29 = new this("WEAPON_29", 29);
  static WEAPON_30 = new this("WEAPON_30", 30);
  static WEAPON_31 = new this("WEAPON_31", 31);
  static WEAPON_32 = new this("WEAPON_32", 32);
  static WEAPON_33 = new this("WEAPON_33", 33);
  static WEAPON_34 = new this("WEAPON_34", 34);
  static WEAPON_35 = new this("WEAPON_35", 35);
  static WEAPON_36 = new this("WEAPON_36", 36);
  static WEAPON_37 = new this("WEAPON_37", 37);
}
WeaponEnum.resolve();

export class SkillEnum extends Enum {
  static __name__ = "Skill";
  static __construct__ = [
    "SOLDIER",
    "DOCTOR",
    "PILOT",
    "MUNITIONS",
    "SCOUT",
    "SPY",
    "COMMS_OFFICIER",
    "SABOTEUR",
    "PISTOL",
    "REVOLVER",
    "DESERT_EAGLE",
    "BERETTA",
    "DUAL_PISTOLS",
    "SHOTGUN",
    "SEMI_AUTO_SHOTGUN",
    "DOUBLE_BARREL_SHOTGUN",
    "PUMP_ACTION_SHOTGUN",
    "SCATTERGUN",
    "ASSAULT_RIFLE",
    "M16",
    "AK47",
    "FAMAS",
    "THOMPSON",
    "UMP",
    "BAZOOKA_M1",
    "ROCKET_LAUNCHER",
    "BAZOOKA_M25",
    "INFERNAL_TUBE",
    "COMANCHE_AUTO",
    "HEAVY_MACHINE_GUN",
    "GATLING_GUN",
    "MINIGUN",
    "SNIPER",
    "MOS_TECK",
    "LIZARO_JUNGLE",
    "SPARROWHAWK",
    "CK_MAGELLAN",
    "KNIFE",
    "LIGHT_TANK",
    "MOTORCYCLE",
    "FIGHTER_JET",
    "HELICOPTER",
    "HEAVY_TANK",
    "ADRENALINE",
    "AMPHETAMINE_SHOT",
    "ANATOMY",
    "RUCKSACK",
    "BAIT",
    "BARREL_EXTENSION",
    "HUGE_CALVES",
    "BINOCULARS",
    "BIPED",
    "BLIND_FURY",
    "ON_POINT",
    "WIFE_BEATER",
    "BRICK_SHOUSE",
    "EXPLOSIVE_SHELLS",
    "HYDROSHOCK_SHELLS",
    "PARALYSING_SHELLS",
    "ARMOR_PIERCING_SHELLS",
    "TOXIC_SHELLS",
    "CAMOUFLAGE",
    "LOADER",
    "CHARGE",
    "SMART",
    "FISTS_OF_FURY",
    "THERMOS_COFFEE",
    "COLD_BLOODED",
    "SCAVENGER",
    "COMMANDER",
    "COMMANDO",
    "COMPENSATOR",
    "TAKE_COVER",
    "COVERING_FIRE",
    "INVINCIBLE",
    "SUSPICIOUS",
    "DODGER",
    "FIRST_AID",
    "OUT_OF_BOUNDS",
    "FRENETIC",
    "FRIENDLY_FIRE",
    "HEAVY_ARMOR",
    "GRENADE",
    "FLASHBANG",
    "GAS_GRENADE",
    "CLOWN_GRENADE",
    "FRAGMENTATION_GRENADE",
    "SHOCK_GRENADE",
    "GLUE_GRENADE",
    "GRENADE_BENIE",
    "HEALING_GRENADE",
    "BLACK_HOLE_GRENADE",
    "HARD_BOILED",
    "HEARTBREAKER",
    "HEAT_SENSOR",
    "HEAVYWEIGHT",
    "HURRY",
    "HYPERACTIF",
    "INTERCEPTION",
    "JUGGLER",
    "BULLETPROOF_VEST",
    "LASER_SIGHTS",
    "LAST_MOHICAN",
    "LUCKY_CHARM",
    "TAIL_GUNNER",
    "NIMBLE_FINGERS",
    "NERVOUS",
    "OCCUPATION",
    "KING_OF_BOULES",
    "RADIO",
    "REVERSE_ATTACK",
    "SAVIOUR",
    "BOUNCE_BACK",
    "RESTLESS",
    "RUSH",
    "EYE_OF_THE_TIGER",
    "UNFORGIVING",
    "SPRINTER",
    "FULL_METAL_BALACLAVA",
    "DEATH_GRIP",
    "FALL_GUY",
    "STURDY",
    "FACEBOOT",
    "SURVIVOR",
    "SURVIVAL_INSTINCT",
    "TALKY_WALKY",
    "STAMP",
    "TRIGGER_HAPPY",
    "TUCK_AND_ROLL",
    "TWINOID",
    "UNSHAKABLE",
    "VENDETTA",
    "VICIOUS",
    "VOODOO_DOLL",
    "BATTLE_READY",
    "CRYBABY",
    "WRESTLER",
    "ZIGZAG",
    "ENTHUSIASTIC",
    "MARTYR",
    "SEMELLES_DE_PLOMB",
  ];
  static SOLDIER = new this("SOLDIER", 0);
  static DOCTOR = new this("DOCTOR", 1);
  static PILOT = new this("PILOT", 2);
  static MUNITIONS = new this("MUNITIONS", 3);
  static SCOUT = new this("SCOUT", 4);
  static SPY = new this("SPY", 5);
  static COMMS_OFFICIER = new this("COMMS_OFFICIER", 6);
  static SABOTEUR = new this("SABOTEUR", 7);
  static PISTOL = new this("PISTOL", 8);
  static REVOLVER = new this("REVOLVER", 9);
  static DESERT_EAGLE = new this("DESERT_EAGLE", 10);
  static BERETTA = new this("BERETTA", 11);
  static DUAL_PISTOLS = new this("DUAL_PISTOLS", 12);
  static SHOTGUN = new this("SHOTGUN", 13);
  static SEMI_AUTO_SHOTGUN = new this("SEMI_AUTO_SHOTGUN", 14);
  static DOUBLE_BARREL_SHOTGUN = new this("DOUBLE_BARREL_SHOTGUN", 15);
  static PUMP_ACTION_SHOTGUN = new this("PUMP_ACTION_SHOTGUN", 16);
  static SCATTERGUN = new this("SCATTERGUN", 17);
  static ASSAULT_RIFLE = new this("ASSAULT_RIFLE", 18);
  static M16 = new this("M16", 19);
  static AK47 = new this("AK47", 20);
  static FAMAS = new this("FAMAS", 21);
  static THOMPSON = new this("THOMPSON", 22);
  static UMP = new this("UMP", 23);
  static BAZOOKA_M1 = new this("BAZOOKA_M1", 24);
  static ROCKET_LAUNCHER = new this("ROCKET_LAUNCHER", 25);
  static BAZOOKA_M25 = new this("BAZOOKA_M25", 26);
  static INFERNAL_TUBE = new this("INFERNAL_TUBE", 27);
  static COMANCHE_AUTO = new this("COMANCHE_AUTO", 28);
  static HEAVY_MACHINE_GUN = new this("HEAVY_MACHINE_GUN", 29);
  static GATLING_GUN = new this("GATLING_GUN", 30);
  static MINIGUN = new this("MINIGUN", 31);
  static SNIPER = new this("SNIPER", 32);
  static MOS_TECK = new this("MOS_TECK", 33);
  static LIZARO_JUNGLE = new this("LIZARO_JUNGLE", 34);
  static SPARROWHAWK = new this("SPARROWHAWK", 35);
  static CK_MAGELLAN = new this("CK_MAGELLAN", 36);
  static KNIFE = new this("KNIFE", 37);
  static LIGHT_TANK = new this("LIGHT_TANK", 38);
  static MOTORCYCLE = new this("MOTORCYCLE", 39);
  static FIGHTER_JET = new this("FIGHTER_JET", 40);
  static HELICOPTER = new this("HELICOPTER", 41);
  static HEAVY_TANK = new this("HEAVY_TANK", 42);
  static ADRENALINE = new this("ADRENALINE", 43);
  static AMPHETAMINE_SHOT = new this("AMPHETAMINE_SHOT", 44);
  static ANATOMY = new this("ANATOMY", 45);
  static RUCKSACK = new this("RUCKSACK", 46);
  static BAIT = new this("BAIT", 47);
  static BARREL_EXTENSION = new this("BARREL_EXTENSION", 48);
  static HUGE_CALVES = new this("HUGE_CALVES", 49);
  static BINOCULARS = new this("BINOCULARS", 50);
  static BIPED = new this("BIPED", 51);
  static BLIND_FURY = new this("BLIND_FURY", 52);
  static ON_POINT = new this("ON_POINT", 53);
  static WIFE_BEATER = new this("WIFE_BEATER", 54);
  static BRICK_SHOUSE = new this("BRICK_SHOUSE", 55);
  static EXPLOSIVE_SHELLS = new this("EXPLOSIVE_SHELLS", 56);
  static HYDROSHOCK_SHELLS = new this("HYDROSHOCK_SHELLS", 57);
  static PARALYSING_SHELLS = new this("PARALYSING_SHELLS", 58);
  static ARMOR_PIERCING_SHELLS = new this("ARMOR_PIERCING_SHELLS", 59);
  static TOXIC_SHELLS = new this("TOXIC_SHELLS", 60);
  static CAMOUFLAGE = new this("CAMOUFLAGE", 61);
  static LOADER = new this("LOADER", 62);
  static CHARGE = new this("CHARGE", 63);
  static SMART = new this("SMART", 64);
  static FISTS_OF_FURY = new this("FISTS_OF_FURY", 65);
  static THERMOS_COFFEE = new this("THERMOS_COFFEE", 66);
  static COLD_BLOODED = new this("COLD_BLOODED", 67);
  static SCAVENGER = new this("SCAVENGER", 68);
  static COMMANDER = new this("COMMANDER", 69);
  static COMMANDO = new this("COMMANDO", 70);
  static COMPENSATOR = new this("COMPENSATOR", 71);
  static TAKE_COVER = new this("TAKE_COVER", 72);
  static COVERING_FIRE = new this("COVERING_FIRE", 73);
  static INVINCIBLE = new this("INVINCIBLE", 74);
  static SUSPICIOUS = new this("SUSPICIOUS", 75);
  static DODGER = new this("DODGER", 76);
  static FIRST_AID = new this("FIRST_AID", 77);
  static OUT_OF_BOUNDS = new this("OUT_OF_BOUNDS", 78);
  static FRENETIC = new this("FRENETIC", 79);
  static FRIENDLY_FIRE = new this("FRIENDLY_FIRE", 80);
  static HEAVY_ARMOR = new this("HEAVY_ARMOR", 81);
  static GRENADE = new this("GRENADE", 82);
  static FLASHBANG = new this("FLASHBANG", 83);
  static GAS_GRENADE = new this("GAS_GRENADE", 84);
  static CLOWN_GRENADE = new this("CLOWN_GRENADE", 85);
  static FRAGMENTATION_GRENADE = new this("FRAGMENTATION_GRENADE", 86);
  static SHOCK_GRENADE = new this("SHOCK_GRENADE", 87);
  static GLUE_GRENADE = new this("GLUE_GRENADE", 88);
  static GRENADE_BENIE = new this("GRENADE_BENIE", 89);
  static HEALING_GRENADE = new this("HEALING_GRENADE", 90);
  static BLACK_HOLE_GRENADE = new this("BLACK_HOLE_GRENADE", 91);
  static HARD_BOILED = new this("HARD_BOILED", 92);
  static HEARTBREAKER = new this("HEARTBREAKER", 93);
  static HEAT_SENSOR = new this("HEAT_SENSOR", 94);
  static HEAVYWEIGHT = new this("HEAVYWEIGHT", 95);
  static HURRY = new this("HURRY", 96);
  static HYPERACTIF = new this("HYPERACTIF", 97);
  static INTERCEPTION = new this("INTERCEPTION", 98);
  static JUGGLER = new this("JUGGLER", 99);
  static BULLETPROOF_VEST = new this("BULLETPROOF_VEST", 100);
  static LASER_SIGHTS = new this("LASER_SIGHTS", 101);
  static LAST_MOHICAN = new this("LAST_MOHICAN", 102);
  static LUCKY_CHARM = new this("LUCKY_CHARM", 103);
  static TAIL_GUNNER = new this("TAIL_GUNNER", 104);
  static NIMBLE_FINGERS = new this("NIMBLE_FINGERS", 105);
  static NERVOUS = new this("NERVOUS", 106);
  static OCCUPATION = new this("OCCUPATION", 107);
  static KING_OF_BOULES = new this("KING_OF_BOULES", 108);
  static RADIO = new this("RADIO", 109);
  static REVERSE_ATTACK = new this("REVERSE_ATTACK", 110);
  static SAVIOUR = new this("SAVIOUR", 111);
  static BOUNCE_BACK = new this("BOUNCE_BACK", 112);
  static RESTLESS = new this("RESTLESS", 113);
  static RUSH = new this("RUSH", 114);
  static EYE_OF_THE_TIGER = new this("EYE_OF_THE_TIGER", 115);
  static UNFORGIVING = new this("UNFORGIVING", 116);
  static SPRINTER = new this("SPRINTER", 117);
  static FULL_METAL_BALACLAVA = new this("FULL_METAL_BALACLAVA", 118);
  static DEATH_GRIP = new this("DEATH_GRIP", 119);
  static FALL_GUY = new this("FALL_GUY", 120);
  static STURDY = new this("STURDY", 121);
  static FACEBOOT = new this("FACEBOOT", 122);
  static SURVIVOR = new this("SURVIVOR", 123);
  static SURVIVAL_INSTINCT = new this("SURVIVAL_INSTINCT", 124);
  static TALKY_WALKY = new this("TALKY_WALKY", 125);
  static STAMP = new this("STAMP", 126);
  static TRIGGER_HAPPY = new this("TRIGGER_HAPPY", 127);
  static TUCK_AND_ROLL = new this("TUCK_AND_ROLL", 128);
  static TWINOID = new this("TWINOID", 129);
  static UNSHAKABLE = new this("UNSHAKABLE", 130);
  static VENDETTA = new this("VENDETTA", 131);
  static VICIOUS = new this("VICIOUS", 132);
  static VOODOO_DOLL = new this("VOODOO_DOLL", 133);
  static BATTLE_READY = new this("BATTLE_READY", 134);
  static CRYBABY = new this("CRYBABY", 135);
  static WRESTLER = new this("WRESTLER", 136);
  static ZIGZAG = new this("ZIGZAG", 137);
  static ENTHUSIASTIC = new this("ENTHUSIASTIC", 138);
  static MARTYR = new this("MARTYR", 139);
  static SEMELLES_DE_PLOMB = new this("SEMELLES_DE_PLOMB", 140);
}
SkillEnum.resolve();
