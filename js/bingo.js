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

/* The 12 ways to win: 5 rows, 5 columns, 2 diagonals. */
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

/* playOrder: array of song indices in the order they were played this round.
 * Returns every completed line, each tagged with the play-position at which it
 * completed (0-based) — so if two guests both have bingo, the smaller
 * completedAt actually got there first. */
function winningLines(grid, playOrder) {
  var pos = {};
  for (var i = 0; i < playOrder.length; i++) {
    if (!(playOrder[i] in pos)) pos[playOrder[i]] = i;
  }
  var wins = [];
  for (var l = 0; l < LINES.length; l++) {
    var line = LINES[l], complete = true, latest = -1;
    for (var j = 0; j < line.cells.length; j++) {
      var idx = grid[line.cells[j][0]][line.cells[j][1]];
      if (idx === FREE) continue;
      if (!(idx in pos)) { complete = false; break; }
      if (pos[idx] > latest) latest = pos[idx];
    }
    if (complete) wins.push({ name: line.name, cells: line.cells, completedAt: latest });
  }
  wins.sort(function (a, b) { return a.completedAt - b.completedAt; });
  return wins;
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
    suggestedPlayOrder: suggestedPlayOrder, findDuplicateCards: findDuplicateCards };
}
