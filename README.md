# DJ Bingo — 50th Anniversary Edition

Music bingo for a party. Four rounds — Going to the Chapel, Songs of 1976, Golden Oldies,
Love Songs — each won a harder way than the last, with printable cards
for every guest, a DJ console that plays 30-second snippets, and winner verification
that actually proves the winner won.

Two files, no install, no internet needed:

| File | Who uses it | What it does |
|---|---|---|
| [`cards.html`](cards.html) | You, before the party | Generates and prints numbered bingo cards |
| [`dj.html`](dj.html) | The DJ, during the party | Plays snippets, tracks what's played, verifies winners |

Open either by double-clicking it, or serve the folder and visit
`http://localhost:8777` (see [Running from a server](#running-from-a-server)).

---

## How it works

Each guest gets a numbered card per round: a 5×5 grid of songs with a FREE centre
square. The DJ plays a 30-second snippet; guests mark the square if that song is on
their card.

**Each round is won a different way, and the game gets harder as the night goes on:**

| Round | Theme | To win | Squares | Typical length |
|---|---|---|---|---|
| 1 | Going to the Chapel | **One line** — any row, column or diagonal | 5 | ~11 songs, 8 min |
| 2 | Songs of 1976 | **Two lines** — any two, and they may cross | ~10 | ~18 songs, 12 min |
| 3 | Golden Oldies | **Picture frame** — every square around the outside edge | 16 | ~33 songs, 22 min |
| 4 | Love Songs | **Cover all** — every square on the card | 24 | ~36 songs, 24 min |

The win pattern is printed on every card, as a name and a little 5×5 icon beside the
round title, so nobody has to remember which round is which. It also shows on the DJ's
round tab, run sheet, and verification panel.

Rounds 3 and 4 are long by design — a frame needs 16 of a card's 24 songs and a full
house needs all 24, so most of the pool has to be played before anyone finishes. That
is the shape of those games, not a bad seed. Budget about an hour of music for the
four rounds, and consider dropping the snippet to 20 seconds for the last two.

**Cards are never stored anywhere.** They are *derived* from three things: the master
seed, the round, and the card number. The generator and the DJ console run the same
function, so the console can rebuild any guest's card from scratch and check it
against the songs actually played. That's what makes verification trustworthy — and
it's why the seed must match.

> The seed is printed in small type at the bottom of every card
> (`ANNIVERSARY-50 · R1 · card 18`). If the console's seed doesn't match that, the
> console will happily verify the *wrong* card. Check it once before you start.

---

## Before the party

### 1. Pick a seed and check the pacing

Open `cards.html`. Because the whole game is determined by the seed, you can simulate
it before printing a single page.

- Set the **master seed** and the card range (1–40 for 40 guests).
- Click **Simulate this seed** — it reports how many songs each round needs before
  someone wins it, how long that is in minutes, and the total for the night.
- Each round is judged against its own win condition, because they are not comparable:
  a one-line round should land in **8–16 songs**, two lines in **14–22**, the picture
  frame in **28–36**, and cover-all in **32–39**. A 33-song frame round is normal; a
  33-song one-line round would mean something is wrong.
- Click **Find a well-paced seed** to search for a seed where every round lands in its
  ideal range with exactly one winner.

**Ties get more likely the more of the card a round asks for.** Measured over 300
seeds with 40 guests: one line ties about 15% of the time, two lines 20%, the picture
frame 33%, and cover-all 38% — by the end of a cover-all round almost everyone is
waiting on the same last few songs. The seed search will often fail to find a
tie-free cover-all round no matter how long it looks; that is expected, and the
tiebreak below handles it.

### 2. Add guest names (optional)

Paste names into the box, one per line — line 1 becomes card #1. Blank lines become
"Guest #7" and so on. Names make it much easier to hand out and reclaim cards.

### 3. Print

Click **Generate cards**, then **Print**.

- **2 cards per page** (default) with **Group by guest** on: each guest's four rounds
  come out together, so printing double-sided gives you **two sheets per guest** —
  80 sheets for 40 guests.
- **1 per page (large print)** if your guests would rather not squint. That's 160
  pages, so consider printing one round at a time.

Print a single test page first and check it's readable at arm's length.

### 4. Click "Download game config"

This saves `dj-bingo-config.json` (seed + card range). Hand it to the DJ along with
the music — loading it in the console guarantees the seeds match.

### 5. Print the DJ run sheet

Click **DJ run sheet** in `cards.html`, then Print. You get one page per round listing
every song in the same order the console plays them, with a tick box and its snippet
start time.

This is the party's insurance policy. If the laptop dies, the DJ keeps playing from
their own phone and ticking boxes — and a winner can still be confirmed afterwards by
entering the ticked songs into the console (or by checking the card by hand against
the ticked list). Keep the order: verification depends on which song completed the line.

### 6. Get the music

The console plays audio files **from your own computer**. Nothing is uploaded and
nothing is streamed, so it works on venue wifi that barely exists.

Put your files anywhere — one folder is easiest — and drop that folder onto the
**Audio library** panel in `dj.html`. Files are matched to songs by filename, and
almost any normal naming works:

```
Michael Jackson - Billie Jean.mp3
04 Toto - Africa.mp3
a-ha_Take_On_Me.mp3
Africa.mp3
```

Whatever doesn't match shows `none` in the song list with an **Assign** button — click
it and pick the file yourself. Manual picks are remembered by filename, so next time
you drop the folder they match automatically.

**Don't have the music?** Songs with no local file fall back to a free 30-second
preview from Apple's public iTunes Search API — no account, no API key, no
subscription. Since the game plays 30-second snippets anyway, a preview is a
complete round.

Previews are fetched **as you play**, not up front. When a song starts, the console
looks up the *next* one in the background, so by the time you hit **Play next** it is
already in hand. A round only plays 10–15 songs, so a whole night is about 50 lookups
spread minutes apart — well inside Apple's rate limit, and nothing is fetched for a
song nobody hears.

Three things to know:

- **It needs internet during the party**, not just before. The previews stream from
  Apple's servers, so pre-fetching does *not* make you offline-proof — only local
  files do that. If the venue wifi is a rumour, bring the files.
- **The START column stops applying** to preview-backed songs. Apple picks the
  30 seconds, not you — usually the chorus, but you can't tune it. Assign a local file
  to any song where the preview lands badly.
- **A local file always wins over a preview**, so you can mix the two freely: drop the
  music you own, let the rest fall back. The list shows which is which — `file`,
  `itunes`, or `none`.

**Pre-fetch all (optional)** resolves all 200 up front. The only reason to bother is
to find out in advance which songs Apple has no match for, so you can source those
yourself. It takes about 10 minutes because Apple rate-limits to roughly 20 requests a
minute and enforces it harshly — go over and it returns 403 for your whole connection
for several minutes. Run it at home, keep the tab visible (browsers throttle timers in
background tabs), and if you do get 403s, wait ~15 minutes and click again — progress
is saved and it picks up where it stopped.

Songs that are still `none` work fine: the console shows the title and a YouTube search
link, and you play it from your own deck, phone, or streaming app. The bingo logic
doesn't care where the sound comes from.

### 7. Check the snippet start times

Every song has a **Start** time — where its 30 seconds begins, chosen to land on the
chorus or the signature riff rather than a slow intro. These are estimates. Skim the
list, play a few, and edit any that land badly (the field is editable inline), then
click **Save hooks**. They're stored in the browser and survive a reload.

---

## Running the game

Open `dj.html`, click **Load config…**, pick your `dj-bingo-config.json`, and confirm
the seed matches the cards. Then, for each round:

1. Click the round tab (**Round 1 — Going to the Chapel** first).
2. Hit **▶︎ Play next**. It plays the next song in a suggested shuffled order and marks
   it as played automatically.
3. Repeat. Give the room a beat between songs to find their squares.
4. When someone shouts BINGO, go to **Verify a winner**.

Keyboard, so you're not hunting for buttons in the dark:

| Key | Action |
|---|---|
| `space` | Play next / stop |
| `N` | Play next |
| `R` | Replay the current snippet |

Other controls worth knowing:

- **Mark / Unmark** — fix the record if you played something off-list or hit Next by
  accident. Verification uses this list, so keep it honest.
- **Snippet length** — 30 seconds by default; drop to 20 to speed a round up.
- **Round status** — shows how many cards currently have bingo. If it says a card has
  bingo and nobody has shouted, someone isn't paying attention.
- **Reset round** — clears the played list for that round only.

Everything is saved in the browser as you go, so a refresh (or a closed laptop lid)
doesn't lose the round.

### Verifying a winner

Type the card number from the **top-right corner of the card** and press Enter.

The console rebuilds that exact card and shows the grid with every marked square
highlighted, then gives one of two answers:

- **✓ CONFIRMED** — headed with what they actually achieved (**BINGO**, **DOUBLE
  BINGO**, **FRAME** or **FULL HOUSE**), naming the pattern and the exact song that
  completed it ("Diagonal / finished on song #13 — *Sweet Caroline*"). On a two-line
  round it names both lines and the one that finished last, since that is the moment
  the card actually won.
- **✗ NOT A WINNER** — shows how close they were, in the terms of that round ("15 of 16
  squares marked — 1 to go", or "1 of 2 lines complete; closest unfinished is Row 3, 4
  of 5 marked"), which is usually enough to end the argument on the spot.

The panel checks the round's *own* win condition, so a guest who shouts on one line
during the picture-frame round gets a clear no with the reason.

If the number isn't in your printed range, it says so rather than inventing a result.

### If two people call bingo at once

It happens in roughly one round in six for a one-line round, and far more often in the
later rounds — about a third of frame rounds and cover-all rounds end in a tie, because
everyone is waiting on the same last songs. Both cards can be genuinely correct. Verify
each one and compare the **finished on song #N** line:

1. **Lower song number wins** — that card completed the pattern first, even if they
   shouted second.
2. **Same song number?** Then compare total squares marked (shown under the verdict) —
   more marks means a fuller card. This one can't separate a cover-all tie, where both
   winners are on 25 of 25 by definition.
3. **Still tied?** Both win. It's an anniversary party; hand out two prizes, or let the
   couple pick. Worth having a spare prize for round 4 for exactly this reason.

The **Round status** panel flags ties for you before you're standing there guessing.

---

## Customising the songs

All 160 songs live in [`data/songs.js`](data/songs.js) — 40 per round. Each entry is:

```js
["Billie Jean", "Michael Jackson", 1983, 55]
//  title         artist            year  where the 30s snippet starts
```

Swap in the couple's own favourites, their wedding song, whatever. Two rules:

- Keep **at least 25 songs** per round (24 squares plus a spare). Around 40 is the
  sweet spot. For the frame and cover-all rounds a *smaller* pool doesn't save much
  time — a card still needs 16 or 24 specific squares — and it makes ties much more
  likely (a 26-song cover-all round ties about 72% of the time versus 38% at 40), so
  leave those at 40.
- After editing, re-run **Simulate this seed** and **reprint the cards**. Changing the
  song list changes every card.

### Changing how a round is won

Each round names its win condition in the same file:

```js
r3: { label: "Round 3 — Golden Oldies", tag: "oldies", goal: "frame", songs: [ ... ] }
```

`goal` takes `"line"`, `"twoLines"`, `"frame"` or `"blackout"`. The patterns, the
expected pacing for each, and the little 5×5 icon all live in
[`js/bingo.js`](js/bingo.js) — add a new goal there and any round can use it. The
cards, run sheet, console tabs and verification panel all read the goal, so changing
this one word updates every one of them.

Cards are laid out with the FREE square in the centre and a `B I N G O` header, and
each round prints in its own colour so the piles don't get mixed up.

---

## Reprinting one card

Cards are regenerated from the seed, so a lost card is never a problem — the reprint is
identical to the original. `cards.html` accepts URL parameters:

```
cards.html?from=17&to=17            # just guest #17, all four rounds
cards.html?from=17&to=17&rounds=r2  # just guest #17's 1976 card
cards.html?view=run                 # straight to the DJ run sheet
cards.html?per=1                    # large print
```

`seed`, `occasion`, and `group` work the same way. Anything you leave out keeps the
value shown in the form.

## Running from a server

Double-clicking the files works. If your browser gets fussy about local files, serve
the folder instead:

```bash
python3 -m http.server 8777
```

Then open `http://localhost:8777/cards.html` and `http://localhost:8777/dj.html`.

---

## Troubleshooting

**"Browser blocked autoplay"** — browsers require one real click before a page may play
sound. Click **Replay** once at the start of the night and it won't come back.

**A snippet starts in a boring part of the song** — edit the **Start** value on that row
and click **Save hooks**.

**Verification says NOT A WINNER but the guest is sure** — check the seed in the console
against the seed printed at the bottom of their card, and check you're on the right
round tab. A mismatch in either is the usual cause.

**The song list looks different from last time** — you changed the seed, the card range,
or `songs.js`. Any of those regenerates every card.

**Audio matched the wrong song** — click the button next to it (`↻`) and choose the
right file.

---

## Files

```
cards.html       card generator, DJ run sheet, print layout
dj.html          DJ console: player, tracking, verification
data/songs.js    the 200 songs, 40 per decade
js/bingo.js      seeded card generation + win checking (shared by both pages)
audio/           drop your music here (git-ignored)
```

`js/bingo.js` is deliberately shared: the printer and the verifier must never be able
to disagree about what's on a card.
