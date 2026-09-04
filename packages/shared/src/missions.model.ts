import { MissionType } from "./domain-types";
import { ButtonState } from "./fights.model";
import { UserExtended } from "./user.model";

export const BuyingMissionCost = 5;

export const getMissionState = (
  missionHistories: UserExtended["missions"],
  missionType: MissionType,
) => {
  const states: ButtonState[] = ["pending", "pending", "pending"];

  missionHistories
    .filter((mission) => mission.type === missionType)
    .reverse()
    .forEach((previousFight, i) => {
      states[i] = previousFight.result as ButtonState;
    });

  if (states.includes("win")) {
    states.forEach((state, i) => {
      if (state === "pending") {
        states[i] = "hidden";
      }
    });
  }

  return states;
};
