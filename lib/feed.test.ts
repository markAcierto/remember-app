import assert from "node:assert/strict";

import { computeStreak, dayKey, relativeTime } from "@/lib/feed";

// Fixed reference point so the tests never depend on the real clock.
const NOW = "2026-08-26T12:00:00";

function at(date: string, time = "09:00:00"): string {
  // "HH:MM" gets zero seconds; "HH:MM:SS" is already complete.
  return time.length === 5 ? `${date}T${time}:00` : `${date}T${time}`;
}

// --- dayKey ----------------------------------------------------------------

assert.equal(dayKey(new Date(2026, 7, 26)), "2026-08-26");
assert.equal(dayKey(new Date(2026, 0, 5)), "2026-01-05");
console.log("ok: dayKey");

// --- relativeTime -----------------------------------------------------------

assert.equal(relativeTime(at("2026-08-26", "11:59:30"), NOW), "now");
assert.equal(relativeTime(at("2026-08-26", "11:45:00"), NOW), "15m");
assert.equal(relativeTime(at("2026-08-26", "02:00:00"), NOW), "10h");
assert.equal(relativeTime(at("2026-08-24", "12:00:00"), NOW), "2d");
assert.equal(relativeTime(at("2026-08-20", "12:00:00"), NOW), "6d");
assert.equal(relativeTime(at("2026-08-01", "12:00:00"), NOW), "Aug 1");
assert.equal(relativeTime(at("2025-08-01", "12:00:00"), NOW), "Aug 1, 2025");
assert.equal(relativeTime("not-a-date", NOW), "");
console.log("ok: relativeTime");

// --- computeStreak ----------------------------------------------------------

assert.equal(computeStreak([]), 0);
assert.equal(computeStreak(["garbage", "also-not-a-date"]), 0);

// Only today.
assert.equal(
  computeStreak([at("2026-08-26")], NOW),
  1,
  "today only"
);

// Today + yesterday.
assert.equal(
  computeStreak([at("2026-08-26"), at("2026-08-25")], NOW),
  2,
  "today + yesterday"
);

// Five consecutive days ending today.
assert.equal(
  computeStreak(
    [
      at("2026-08-26"),
      at("2026-08-25"),
      at("2026-08-24"),
      at("2026-08-23"),
      at("2026-08-22"),
    ],
    NOW
  ),
  5,
  "five-day chain"
);

// Nothing today, but a chain ending yesterday is still alive.
assert.equal(
  computeStreak([at("2026-08-25"), at("2026-08-24")], NOW),
  2,
  "yesterday + day before"
);

// Gap in the chain resets the streak.
assert.equal(
  computeStreak([at("2026-08-26"), at("2026-08-24")], NOW),
  1,
  "gap resets"
);

// Stale single entry from last week: no streak.
assert.equal(computeStreak([at("2026-08-20")], NOW), 0, "stale entry");

// Duplicate entries on the same day do not inflate the streak.
assert.equal(
  computeStreak(
    [at("2026-08-26", "08:00:00"), at("2026-08-26", "20:00:00")],
    NOW
  ),
  1,
  "duplicates ignored"
);

// Date objects work too.
assert.equal(
  computeStreak([new Date(2026, 7, 26), new Date(2026, 7, 25)], new Date(NOW)),
  2,
  "Date objects"
);

console.log("ok: computeStreak");
console.log("lib/feed.ts: all tests passed");
