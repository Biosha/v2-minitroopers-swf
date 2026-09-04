import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMissionState } from "./missions.model.js";
import { UserExtended } from "./user.model.js";

const mission = (
  type: UserExtended["missions"][number]["type"],
  result: UserExtended["missions"][number]["result"],
): UserExtended["missions"][number] => ({
  id: "m",
  type,
  result,
  ts: new Date(),
});

describe("getMissionState", () => {
  it("returns three pending slots when there are no missions of that type", () => {
    assert.deepEqual(getMissionState([], "exterminate"), [
      "pending",
      "pending",
      "pending",
    ]);
  });

  it("maps results for the requested mission type", () => {
    const states = getMissionState(
      [
        mission("exterminate", "lose"),
        mission("infiltrate", "win"),
        mission("exterminate", "win"),
      ],
      "exterminate",
    );

    assert.equal(states[0], "win");
    assert.equal(states[1], "lose");
  });

  it("hides remaining pending slots after a win", () => {
    const states = getMissionState(
      [mission("exterminate", "win")],
      "exterminate",
    );

    assert.equal(states[0], "win");
    assert.equal(states[1], "hidden");
    assert.equal(states[2], "hidden");
  });
});
