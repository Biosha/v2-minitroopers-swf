import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getReferralPrice,
  parseToPartialUser,
  UserExtended,
} from "./user.model.js";

describe("getReferralPrice", () => {
  it("returns tiered referral rewards", () => {
    assert.equal(getReferralPrice(0), 100);
    assert.equal(getReferralPrice(1), 50);
    assert.equal(getReferralPrice(5), 10);
    assert.equal(getReferralPrice(15), 5);
    assert.equal(getReferralPrice(35), 0);
  });
});

describe("parseToPartialUser", () => {
  it("does not expose opponent gold", () => {
    const partial = parseToPartialUser({
      armyName: "TestArmy",
      armyUrl: "",
      color: 1,
      gold: 999,
      power: 10,
      prefix: 0,
      troopers: [],
      history: [],
      fights: [],
      missions: [],
      raids: [],
      epicUnlockAt: null,
      exterminationUnlockAt: null,
      infiltrationUnlockAt: null,
    } as unknown as UserExtended);

    assert.equal(partial.gold, 0);
  });
});
