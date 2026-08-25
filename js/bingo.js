/* DJ Bingo — shared card engine.
 *
 * Cards are never stored. They are DERIVED from (masterSeed, round, cardNumber)
 * by a seeded PRNG, so the printer and the DJ console independently compute the
 * exact same 25 squares. That is what makes winner verification trustworthy:
 * the DJ types a card number and the console rebuilds that guest's card from
 * scratch, then checks it against the songs actually played.
 *
 * Change the master seed and every card in the game changes. The seed is
 * printed in small type on each card so a mismatch is obvious.
 */

/* ---- seeded randomness (FNV-1a hash + mulberry32) ---- */

function hashString(str) {
  var h = 2166136261 >>> 0;
  for (var i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledCopy(arr, rng) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

/* ---- cards ---- */

var FREE = -1;              // centre square, always considered marked
var GRID = 5;

/* Returns a 5x5 array of song indices into SONGS[roundKey].songs, with FREE at 2,2. */
function buildCard(roundKey, cardNo, masterSeed) {
  var pool = SONGS[roundKey].songs;
  var rng = mulberry32(hashString(masterSeed + "|" + roundKey + "|" + cardNo));
  var order = shuffledCopy(pool.map(function (_, i) { return i; }), rng);
  var picks = order.slice(0, GRID * GRID - 1);   // 24 songs + 1 free square
  var grid = [], k = 0;
  for (var r = 0; r < GRID; r++) {
    var row = [];
    for (var c = 0; c < GRID; c++) {
      row.push(r === 2 && c === 2 ? FREE : picks[k++]);
    }
    grid.push(row);
  }
  return grid;
}

/* ---- win conditions ----
 *
 * Every round is won a different way, so the engine works in terms of PATTERNS
 * (a set of squares that must all be marked) plus how many of them a card needs.
 * One line and two lines share the same 12 patterns and differ only in the count;
 * the frame and the full house are one pattern each.
 */

/* The 12 ways to make a line: 5 rows, 5 columns, 2 diagonals. */
var LINES = (function () {
  var lines = [], r, c;
  for (r = 0; r < GRID; r++) {
    var row = [], col = [];
    for (c = 0; c < GRID; c++) { row.push([r, c]); col.push([c, r]); }
    lines.push({ name: "Row " + (r + 1), cells: row });
    lines.push({ name: "Column " + "ABCDE"[r], cells: col });
  }
  var d1 = [], d2 = [];
  for (r = 0; r < GRID; r++) { d1.push([r, r]); d2.push([r, GRID - 1 - r]); }
  lines.push({ name: "Diagonal \\", cells: d1 });
  lines.push({ name: "Diagonal /", cells: d2 });
  return lines;
})();

/* The outside edge — 16 squares, none of them the free centre. */
var FRAME_CELLS = (function () {
  var cells = [];
  for (var r = 0; r < GRID; r++) for (var c = 0; c < GRID; c++) {
    if (r === 0 || r === GRID - 1 || c === 0 || c === GRID - 1) cells.push([r, c]);
  }
  return cells;
})();

/* Every square — 24 songs plus the free centre. */
var ALL_CELLS = (function () {
  var cells = [];
  for (var r = 0; r < GRID; r++) for (var c = 0; c < GRID; c++) cells.push([r, c]);
  return cells;
})();

var CORNER_CELLS = [[0, 0], [0, GRID - 1], [GRID - 1, 0], [GRID - 1, GRID - 1]];

var X_CELLS = (function () {
  var cells = [];
  for (var r = 0; r < GRID; r++) for (var c = 0; c < GRID; c++) {
    if (r === c || r + c === GRID - 1) cells.push([r, c]);
  }
  return cells;
})();

/* Every 2x2 block that does NOT touch the free centre. Including those four
 * would let a "stamp" be won with three songs and a freebie, which both looks
 * wrong on the card and can end the round after three songs. Twelve blocks it
 * is, and every winning stamp is four songs the guest actually heard. */
var STAMP_BLOCKS = (function () {
  var out = [], cols = "BINGO";
  for (var r = 0; r < GRID - 1; r++) for (var c = 0; c < GRID - 1; c++) {
    var cells = [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]];
    var touchesFree = cells.some(function (x) { return x[0] === 2 && x[1] === 2; });
    if (touchesFree) continue;
    out.push({ name: "Stamp " + cols[c] + (r + 1), cells: cells });
  }
  return out;
})();

/* `diagram` is what the pattern looks like on a card, for the little 5x5 icon
 * printed next to the round name. For the line goals it is one representative
 * arrangement, not the only way to win.
 *
 * `pace` is how many songs the round should need before its first winner, with
 * 40 cards in play: `ok` is the range worth accepting, `ideal` what the seed
 * search aims for. These come from simulating 300 seeds per goal — a frame or a
 * full house needs most of the pool played, so those rounds are simply long. */
var GOALS = {
  line: {
    key: "line", pace: { ok: [8, 16], ideal: [10, 14] }, need: 1, patterns: LINES,
    label: "One line", call: "BINGO", unit: "line",
    rule: "One full line wins \u2014 any row, column or diagonal.",
    diagram: [[2,0],[2,1],[2,2],[2,3],[2,4]]
  },
  twoLines: {
    key: "twoLines", pace: { ok: [14, 22], ideal: [16, 20] }, need: 2, patterns: LINES,
    label: "Two lines", call: "DOUBLE BINGO", unit: "line",
    rule: "Two full lines win \u2014 any rows, columns or diagonals, and they may cross.",
    diagram: [[1,0],[1,1],[1,2],[1,3],[1,4],[3,0],[3,1],[3,2],[3,3],[3,4]]
  },
  threeLines: {
    key: "threeLines", pace: { ok: [18, 27], ideal: [20, 24] }, need: 3, patterns: LINES,
    label: "Three lines", call: "TRIPLE BINGO", unit: "line",
    rule: "Three full lines win \u2014 any rows, columns or diagonals.",
    diagram: [[0,0],[0,1],[0,2],[0,3],[0,4],[2,0],[2,1],[2,2],[2,3],[2,4],[4,0],[4,1],[4,2],[4,3],[4,4]]
  },
  stamp: {
    key: "stamp", pace: { ok: [5, 15], ideal: [7, 12] }, need: 1, patterns: STAMP_BLOCKS,
    label: "Postage stamp", call: "STAMP", unit: "stamp",
    rule: "Any 2\u00d72 block of four squares wins.",
    diagram: [[0,0],[0,1],[1,0],[1,1]]
  },
  corners: {
    key: "corners", pace: { ok: [10, 24], ideal: [14, 20] }, need: 1,
    patterns: [{ name: "Four corners", cells: CORNER_CELLS }],
    label: "Four corners", call: "CORNERS", unit: "shape",
    rule: "All four corner squares win.",
    diagram: CORNER_CELLS
  },
  x: {
    key: "x", pace: { ok: [20, 32], ideal: [23, 29] }, need: 1,
    patterns: [{ name: "The X", cells: X_CELLS }],
    label: "The X", call: "THE X", unit: "shape",
    rule: "Both diagonals \u2014 the X right across the card.",
    diagram: X_CELLS
  },
  frame: {
    key: "frame", pace: { ok: [28, 36], ideal: [30, 34] }, need: 1,
    patterns: [{ name: "Picture frame", cells: FRAME_CELLS }],
    label: "Picture frame", call: "FRAME", unit: "shape",
    rule: "The picture frame wins \u2014 all 16 squares around the outside edge.",
    diagram: FRAME_CELLS
  },
  blackout: {
    key: "blackout", pace: { ok: [32, 39], ideal: [34, 38] }, need: 1,
    patterns: [{ name: "Full house", cells: ALL_CELLS }],
    label: "Cover all", call: "FULL HOUSE", unit: "shape",
    rule: "Cover all wins \u2014 every square on the card.",
    diagram: ALL_CELLS
  }
};
var DEFAULT_GOAL = "line";

/* ---------- which goal a round is using ----------
 *
 * Three places are consulted, in order:
 *
 *   1. an override — the ?goals= URL parameter, or a config file loaded into
 *      the console;
 *   2. ROUND_GOALS in data/songs.js, which is the default night;
 *   3. a single line, the least surprising way to be wrong.
 *
 * Everything that prints, displays or judges a card goes through goalFor(), so
 * an override set once at load reaches the cards, the run sheet, the projector
 * and the winner check together. That matters more than it sounds: a console
 * checking a different pattern from the one printed on the card will happily
 * tell a real winner they have not won. */
var goalOverrides = {};
var goalsCameFromURL = false;

function goalKeyFor(roundKey) {
  return goalOverrides[roundKey]
      || (typeof ROUND_GOALS !== "undefined" && ROUND_GOALS[roundKey])
      || DEFAULT_GOAL;
}

function goalFor(roundKey) {
  return GOALS[goalKeyFor(roundKey)] || GOALS[DEFAULT_GOAL];
}

/* Every round's goal as plain keys — what gets written into an exported config
 * so the console can be handed the same night the cards were printed for. */
function roundGoalMap() {
  var out = {};
  (typeof ROUND_KEYS !== "undefined" ? ROUND_KEYS : []).forEach(function (rk) {
    out[rk] = goalKeyFor(rk);
  });
  return out;
}

/* Applies overrides, ignoring anything that isn't a real goal rather than
 * failing: a typo in a URL should cost you that one round, not the evening.
 * Returns what it actually applied. */
function setRoundGoals(map) {
  var applied = {};
  Object.keys(map || {}).forEach(function (rk) {
    var g = map[rk];
    if (GOALS[g]) { goalOverrides[rk] = g; applied[rk] = g; }
  });
  return applied;
}

function clearRoundGoals() { goalOverrides = {}; goalsCameFromURL = false; }

/* Accepts either shape, and a mix of the two:
 *
 *   ?goals=line,line,twoLines,blackout   positional, in ROUND_KEYS order
 *   ?goals=r4:frame                      keyed — leaves the other rounds alone
 *   ?goals=,,x                           an empty slot skips that round
 */
function parseGoals(text) {
  var out = {}, keys = (typeof ROUND_KEYS !== "undefined" ? ROUND_KEYS : []);
  String(text || "").split(",").forEach(function (raw, i) {
    var part = raw.trim();
    if (!part) return;
    var keyed = part.match(/^(\w+)\s*[:=]\s*(\w+)$/);
    if (keyed) out[keyed[1]] = keyed[2];
    else if (keys[i]) out[keys[i]] = part;
  });
  return out;
}

/* Runs on load in the browser, before any page has drawn anything, so no page
 * has to remember to ask. In node there is no location and this does nothing. */
function applyGoalsFromURL() {
  if (typeof location === "undefined" || !location.search) return {};
  var raw = new URLSearchParams(location.search).get("goals");
  if (!raw) return {};
  var applied = setRoundGoals(parseGoals(raw));
  goalsCameFromURL = Object.keys(applied).length > 0;
  return applied;
}
applyGoalsFromURL();

/* playOrder: array of song indices in the order they were played this round.
 *
 * Returns how a card stands against one goal:
 *   won         did it get there
 *   completedAt the play-position (0-based) at which it got there, so that if
 *               two guests both shout, the smaller number actually won
 *   done        every completed pattern, earliest first
 *   best        the nearest unfinished pattern, for "two squares to go" readouts
 *   cells       the squares to highlight when it has won
 */
function checkCard(grid, playOrder, goalOrKey) {
  var goal = (goalOrKey && goalOrKey.patterns) ? goalOrKey : (GOALS[goalOrKey] || GOALS[DEFAULT_GOAL]);
  var pos = {}, i;
  for (i = 0; i < playOrder.length; i++) {
    if (!(playOrder[i] in pos)) pos[playOrder[i]] = i;
  }

  var done = [], best = null;
  for (var p = 0; p < goal.patterns.length; p++) {
    var pat = goal.patterns[p], have = 0, of = 0, latest = -1;
    for (var j = 0; j < pat.cells.length; j++) {
      var idx = grid[pat.cells[j][0]][pat.cells[j][1]];
      if (idx === FREE) continue;          // the centre is marked for everyone
      of++;
      if (idx in pos) { have++; if (pos[idx] > latest) latest = pos[idx]; }
    }
    if (have === of) done.push({ name: pat.name, cells: pat.cells, completedAt: latest });
    else if (!best || of - have < best.missing) best = { name: pat.name, have: have, of: of, missing: of - have };
  }
  done.sort(function (a, b) { return a.completedAt - b.completedAt; });

  var won = done.length >= goal.need, cells = [];
  if (won) for (i = 0; i < goal.need; i++) cells = cells.concat(done[i].cells);
  return {
    goal: goal, won: won, completedAt: won ? done[goal.need - 1].completedAt : -1,
    done: done, have: done.length, need: goal.need, best: best, cells: cells
  };
}

/* Every completed line. Kept for the line-based rounds and anything that wants
 * the raw list rather than a verdict. */
function winningLines(grid, playOrder) {
  return checkCard(grid, playOrder, GOALS.line).done;
}

/* The 5x5 icon of a goal's pattern, drawn with currentColor so it takes the
 * round's accent on screen and prints in the same ink as its label. */
function goalDiagram(goal, px) {
  var g = (goal && goal.diagram) ? goal : (GOALS[goal] || GOALS[DEFAULT_GOAL]);
  var on = {};
  g.diagram.forEach(function (c) { on[c[0] + "," + c[1]] = 1; });
  var s = '<svg class="gd" viewBox="0 0 25 25" width="' + px + '" height="' + px + '" aria-hidden="true">';
  for (var r = 0; r < GRID; r++) for (var c = 0; c < GRID; c++) {
    s += '<rect x="' + (c * 5 + 0.7) + '" y="' + (r * 5 + 0.7) + '" width="3.6" height="3.6" rx="0.9" class="' +
         (on[r + "," + c] ? "on" : "off") + '"/>';
  }
  return s + '</svg>';
}

/* How many squares on this card are marked (free square included). */
function marksOnCard(grid, playedSet) {
  var n = 0;
  for (var r = 0; r < GRID; r++) {
    for (var c = 0; c < GRID; c++) {
      var idx = grid[r][c];
      if (idx === FREE || playedSet.has(idx)) n++;
    }
  }
  return n;
}

/* Deterministic suggested play order for a round, from the same master seed. */
function suggestedPlayOrder(roundKey, masterSeed) {
  var pool = SONGS[roundKey].songs;
  var rng = mulberry32(hashString(masterSeed + "|playorder|" + roundKey));
  return shuffledCopy(pool.map(function (_, i) { return i; }), rng);
}

/* Sanity check used by the generator: no two guests should get the same 24 songs. */
function findDuplicateCards(roundKey, cardCount, masterSeed) {
  var seen = {}, dupes = [];
  for (var n = 1; n <= cardCount; n++) {
    var grid = buildCard(roundKey, n, masterSeed);
    var flat = [];
    for (var r = 0; r < GRID; r++) for (var c = 0; c < GRID; c++) {
      if (grid[r][c] !== FREE) flat.push(grid[r][c]);
    }
    var key = flat.slice().sort(function (a, b) { return a - b; }).join(",");
    if (seen[key]) dupes.push([seen[key], n]); else seen[key] = n;
  }
  return dupes;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { hashString: hashString, mulberry32: mulberry32, buildCard: buildCard,
    winningLines: winningLines, marksOnCard: marksOnCard, LINES: LINES, FREE: FREE,
    suggestedPlayOrder: suggestedPlayOrder, findDuplicateCards: findDuplicateCards,
    GOALS: GOALS, DEFAULT_GOAL: DEFAULT_GOAL, goalFor: goalFor, checkCard: checkCard,
    goalKeyFor: goalKeyFor, roundGoalMap: roundGoalMap, setRoundGoals: setRoundGoals,
    clearRoundGoals: clearRoundGoals, parseGoals: parseGoals,
    goalDiagram: goalDiagram, FRAME_CELLS: FRAME_CELLS, ALL_CELLS: ALL_CELLS,
    CORNER_CELLS: CORNER_CELLS, X_CELLS: X_CELLS, STAMP_BLOCKS: STAMP_BLOCKS };
}
