import test from "node:test";
import assert from "node:assert/strict";

import {
  getPasswordValidation,
  getPasswordValidationMessage,
  hasSequentialCharacters,
} from "./passwordValidation.js";

test("detects common keyboard and numeric sequences", () => {
  assert.equal(hasSequentialCharacters("safeQwe9!"), true);
  assert.equal(hasSequentialCharacters("Ticket123!"), true);
  assert.equal(hasSequentialCharacters("Route975!"), false);
});

test("validates required password rules", () => {
  const checks = getPasswordValidation("Support9!", {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: true,
  });

  assert.deepEqual(checks, {
    hasValue: true,
    minLength: true,
    uppercase: true,
    number: true,
    special: true,
    noSequence: true,
  });
});

test("returns the first actionable validation message", () => {
  const checks = getPasswordValidation("abc123", { minLength: 8 });

  assert.equal(getPasswordValidationMessage(checks, { minLength: 8 }), "Use at least 8 characters.");
});
