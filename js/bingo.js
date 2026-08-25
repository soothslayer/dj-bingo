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
    label: "One line", call: "BINGO",
    rule: "One full line wins \u2014 any row, column or diagonal.",
    diagram: [[2,0],[2,1],[2,2],[2,3],[2,4]]
  },
  twoLines: {
    key: "twoLines", pace: { ok: [14, 22], ideal: [16, 20] }, need: 2, patterns: LINES,
    label: "Two lines", call: "DOUBLE BINGO",
    rule: "Two full lines win \u2014 any rows, columns or diagonals, and they may cross.",
    diagram: [[1,0],[1,1],[1,2],[1,3],[1,4],[3,0],[3,1],[3,2],[3,3],[3,4]]
  },
  frame: {
    key: "frame", pace: { ok: [28, 36], ideal: [30, 34] }, need: 1, patterns: [{ name: "Picture frame", cells: FRAME_CELLS }],
    label: "Picture frame", call: "FRAME",
    rule: "The picture frame wins \u2014 all 16 squares around the outside edge.",
    diagram: FRAME_CELLS
  },
  blackout: {
    key: "blackout", pace: { ok: [32, 39], ideal: [34, 38] }, need: 1, patterns: [{ name: "Full house", cells: ALL_CELLS }],
    label: "Cover all", call: "FULL HOUSE",
    rule: "Cover all wins \u2014 every square on the card.",
    diagram: ALL_CELLS
  }
};
var DEFAULT_GOAL = "line";

/* A round names its goal in data/songs.js; anything unrecognised falls back to
 * a single line, which is the least surprising way to be wrong. */
function goalFor(roundKey) {
  var g = (typeof SONGS !== "undefined" && SONGS[roundKey] && SONGS[roundKey].goal) || DEFAULT_GOAL;
  return GOALS[g] || GOALS[DEFAULT_GOAL];
}

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
    goalDiagram: goalDiagram, FRAME_CELLS: FRAME_CELLS, ALL_CELLS: ALL_CELLS };
}
