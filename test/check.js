/* DJ Bingo — pre-deploy checks.
 *
 * Two jobs, deliberately separated:
 *
 *   Correctness   the song data is well formed and the win conditions do what
 *                 they claim. Any failure here FAILS the build, because a card
 *                 that cannot be verified is worse than no card at all.
 *
 *   Pacing        how long the night will run on the shipped seed. This only
 *                 REPORTS. Editing the song list is allowed to change the
 *                 timing, and a deploy should not be blocked because a round
 *                 got two songs longer — but you should be told, especially if
 *                 you made the edit from a phone and cannot check it yourself.
 *
 * Run: node test/check.js
 */
"use strict";

var path = require("path");
var root = path.join(__dirname, "..");
var S = require(path.join(root, "data/songs.js"));
global.SONGS = S.SONGS;
var b = require(path.join(root, "js/bingo.js"));

var SEED = "ANNIVERSARY-50-6";       // the seed the pages ship with
var GUESTS = 40;
var SNIPPET = 30, GAP = 10, OVERHEAD_MIN = 10, TARGET_MIN = 60;

var failures = [], checks = 0;
function ok(name, cond){
  checks++;
  if (!cond) failures.push(name);
}

/* ---------- the song data ---------- */

var seen = {};
S.ROUND_KEYS.forEach(function(rk){
  var round = SONGS[rk];
  ok(rk + ": exists", !!round);
  if (!round) return;
  ok(rk + ": has a label", typeof round.label === "string" && round.label.length > 0);
  ok(rk + ": names a goal that exists", !!b.GOALS[round.goal]);
  ok(rk + ": at least 25 songs (24 squares plus a spare)", round.songs.length >= 25);

  round.songs.forEach(function(s, i){
    var where = rk + "[" + i + "] " + (s && s[0]);
    ok(where + ": four fields", Array.isArray(s) && s.length === 4);
    if (!Array.isArray(s) || s.length !== 4) return;
    ok(where + ": title is a non-empty string", typeof s[0] === "string" && s[0].trim().length > 0);
    ok(where + ": artist is a non-empty string", typeof s[1] === "string" && s[1].trim().length > 0);
    ok(where + ": year looks like a year", typeof s[2] === "number" && s[2] > 1900 && s[2] < 2100);
    ok(where + ": hook is a sane number of seconds", typeof s[3] === "number" && s[3] >= 0 && s[3] < 600);

    /* The same song twice in a night means a guest marks one square and
       wonders why the other did not count. */
    var key = (s[0] + "|" + s[1]).toLowerCase();
    ok(where + ": not a duplicate of " + seen[key], !seen[key]);
    seen[key] = where;
  });
});

/* ---------- the win conditions ---------- */

Object.keys(b.GOALS).forEach(function(k){
  var g = b.GOALS[k];
  ok("goal " + k + ": fully described",
     g.label && g.call && g.rule && g.unit && g.diagram && g.patterns && g.need >= 1);
  ok("goal " + k + ": has a pacing window",
     g.pace && g.pace.ok[0] < g.pace.ok[1] && g.pace.ideal[0] < g.pace.ideal[1]);
  ok("goal " + k + ": enough patterns to need " + g.need, g.patterns.length >= g.need);
});

var grid = b.buildCard("r1", 7, "CHECK");
function songsIn(cells){
  return cells.map(function(c){ return grid[c[0]][c[1]]; })
              .filter(function(i){ return i !== b.FREE; });
}

ok("frame is the 16 edge squares", songsIn(b.FRAME_CELLS).length === 16);
ok("cover all is 24 songs plus the freebie", songsIn(b.ALL_CELLS).length === 24);
ok("four corners is 4 squares", songsIn(b.CORNER_CELLS).length === 4);
ok("the X is 8 songs", songsIn(b.X_CELLS).length === 8);
ok("there are 12 stamps", b.STAMP_BLOCKS.length === 12);
ok("no stamp leans on the free centre",
   b.STAMP_BLOCKS.every(function(p){ return songsIn(p.cells).length === 4; }));

/* A pattern must be won by its own squares and by nothing else. */
var row0 = songsIn([[0,0],[0,1],[0,2],[0,3],[0,4]]);
var row1 = songsIn([[1,0],[1,1],[1,2],[1,3],[1,4]]);
var row4 = songsIn([[4,0],[4,1],[4,2],[4,3],[4,4]]);
var frame = songsIn(b.FRAME_CELLS);
var stamp = songsIn(b.STAMP_BLOCKS[0].cells);

ok("a full line wins one line", b.checkCard(grid, row0, "line").won);
ok("a full line is not two lines", !b.checkCard(grid, row0, "twoLines").won);
ok("two full lines win two lines", b.checkCard(grid, row0.concat(row1), "twoLines").won);
ok("two full lines are not three", !b.checkCard(grid, row0.concat(row1), "threeLines").won);
ok("three full lines win three", b.checkCard(grid, row0.concat(row1).concat(row4), "threeLines").won);
ok("the last line decides when two are needed",
   b.checkCard(grid, row0.concat(row1), "twoLines").completedAt === row0.length + row1.length - 1);
ok("the frame wins the frame", b.checkCard(grid, frame, "frame").won);
ok("15 of 16 does not win the frame", !b.checkCard(grid, frame.slice(0, 15), "frame").won);
ok("the frame is not a full house", !b.checkCard(grid, frame, "blackout").won);
ok("a full card wins the full house", b.checkCard(grid, songsIn(b.ALL_CELLS), "blackout").won);
ok("a stamp wins a stamp", b.checkCard(grid, stamp, "stamp").won);
ok("3 of 4 does not win a stamp", !b.checkCard(grid, stamp.slice(0, 3), "stamp").won);
ok("a row is not a stamp", !b.checkCard(grid, row0, "stamp").won);
ok("the corners win the corners", b.checkCard(grid, songsIn(b.CORNER_CELLS), "corners").won);
ok("one diagonal is not an X", !b.checkCard(grid, songsIn([[0,0],[1,1],[2,2],[3,3],[4,4]]), "x").won);
ok("both diagonals win the X", b.checkCard(grid, songsIn(b.X_CELLS), "x").won);
ok("an untouched card has won nothing",
   S.ROUND_KEYS.every(function(rk){ return !b.checkCard(b.buildCard(rk,1,SEED), [], b.goalFor(rk)).won; }));

/* Two guests holding the same 24 songs cannot be told apart on the night. */
S.ROUND_KEYS.forEach(function(rk){
  ok(rk + ": no two cards share a song set on the shipped seed",
     b.findDuplicateCards(rk, GUESTS, SEED).length === 0);
});

/* ---------- pacing (reported, never fatal) ---------- */

function playOut(rk){
  var cards = [], n;
  for (n = 1; n <= GUESTS; n++) cards.push(b.buildCard(rk, n, SEED));
  var order = b.suggestedPlayOrder(rk, SEED), goal = b.goalFor(rk);
  for (var k = 1; k <= order.length; k++){
    var play = order.slice(0, k), winners = [];
    for (var j = 0; j < cards.length; j++) if (b.checkCard(cards[j], play, goal).won) winners.push(j + 1);
    if (winners.length) return { songs: k, winners: winners, goal: goal, ran: true };
  }
  return { songs: order.length, winners: [], goal: goal, ran: false };
}

var rows = [], totalSongs = 0, notes = [];
S.ROUND_KEYS.forEach(function(rk){
  var r = playOut(rk);
  totalSongs += r.songs;
  var mins = Math.round(r.songs * (SNIPPET + GAP) / 60);
  var flag = !r.ran ? "nobody finishes it"
           : (r.songs < r.goal.pace.ok[0] ? "faster than the usual " + r.goal.pace.ok.join("-")
           : (r.songs > r.goal.pace.ok[1] ? "slower than the usual " + r.goal.pace.ok.join("-")
           : (r.winners.length > 1 ? "ties between " + r.winners.length + " cards" : "")));
  if (flag) notes.push(SONGS[rk].label + ": " + flag);
  rows.push({ label: SONGS[rk].label, goal: r.goal.label, songs: r.songs, mins: mins,
              winners: r.winners.length, flag: flag });
});

var music = totalSongs * (SNIPPET + GAP) / 60, allIn = music + OVERHEAD_MIN;
if (allIn > TARGET_MIN) notes.push("the whole game runs about " + Math.round(allIn) +
  " min, past the " + TARGET_MIN + "-minute target");

/* ---------- output ---------- */

var lines = [];
lines.push("| Round | Won by | Songs | Time | Notes |");
lines.push("|---|---|---:|---:|---|");
rows.forEach(function(r){
  lines.push("| " + r.label + " | " + r.goal + " | " + r.songs + " | " + r.mins + " min | " +
             (r.flag || (r.winners === 1 ? "single winner" : "")) + " |");
});
lines.push("");
lines.push("**" + totalSongs + " songs — " + Math.round(music) + " min of music, about " +
  Math.round(allIn) + " min all in** on seed `" + SEED + "` at a " + SNIPPET + "-second snippet" +
  (allIn <= TARGET_MIN ? ", inside the " + TARGET_MIN + "-minute target." :
   ", **past the " + TARGET_MIN + "-minute target**."));

console.log("\nPacing on the shipped seed\n");
console.log(lines.join("\n"));
console.log("\n" + checks + " checks run.");

/* When this runs in Actions, put the table on the run's summary page so it can
   be read from a phone without opening the log. */
if (process.env.GITHUB_STEP_SUMMARY){
  require("fs").appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    "## DJ Bingo — pre-deploy check\n\n" + lines.join("\n") + "\n\n" +
    (failures.length ? "### Failed\n\n" + failures.map(function(f){ return "- " + f; }).join("\n") + "\n"
                     : "All " + checks + " correctness checks passed.\n") +
    (notes.length ? "\n### Worth a look\n\n" + notes.map(function(n){ return "- " + n; }).join("\n") + "\n" : ""));
}

if (notes.length){
  console.log("\nWorth a look:");
  notes.forEach(function(n){ console.log("  - " + n); });
}

if (failures.length){
  console.error("\n" + failures.length + " of " + checks + " checks FAILED:");
  failures.forEach(function(f){ console.error("  - " + f); });
  process.exit(1);
}
console.log("\nAll good.");
