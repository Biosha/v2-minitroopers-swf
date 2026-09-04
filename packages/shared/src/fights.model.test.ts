import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getFightState } from "./fights.model.js";

const today = (hours = 12) => {
  const date = new Date();
  date.setHours(hours, 0, 0, 0);
  return date;
};

const yesterday = () => {
  const date = today();
  date.setDate(date.getDate() - 1);
  return date;
};

describe("getFightState", () => {
  it("returns five pending slots when there are no fights", () => {
    assert.deepEqual(getFightState([]), [
      "pending",
      "pending",
      "pending",
      "pending",
      "pending",
    ]);
  });

  it("maps today's fights oldest-first onto the first slots", () => {
    const states = getFightState([
      { ts: today(14), result: "lose" },
      { ts: today(10), result: "win" },
    ]);

    assert.equal(states[0], "win");
    assert.equal(states[1], "lose");
    assert.equal(states[2], "pending");
  });

  it("ignores fights from another day", () => {
    const states = getFightState([{ ts: yesterday(), result: "win" }]);
    assert.deepEqual(states, [
      "pending",
      "pending",
      "pending",
      "pending",
      "pending",
    ]);
  });
});
