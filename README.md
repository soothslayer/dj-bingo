# DJ Bingo — 50th Anniversary Edition

Music bingo for a party. Four rounds — 80s, 90s, 2000s, 2010s — with printable cards
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
their card. First to five in a row — across, down, or diagonally — shouts BINGO.

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
  someone gets bingo.
- Aim for **9–15 songs** per round (≈8–13 minutes each). Click **Find a well-paced
  seed** to search for a seed where every round lands in 10–14 songs with exactly one
  winner.

Typical result with 40 guests: first bingo after ~11 songs. Fewer than 7 happens about
3% of the time, which is why it's worth checking rather than guessing.

### 2. Add guest names (optional)

Paste names into the box, one per line — line 1 becomes card #1. Blank lines become
"Guest #7" and so on. Names make it much easier to hand out and reclaim cards.

### 3. Print

Click **Generate cards**, then **Print**.

- **2 cards per page** (default) with **Group by guest** on: each guest's four rounds
  come out together, so printing double-sided gives you **one sheet per guest** —
  40 sheets for 40 guests.
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

**Don't have the music?** Songs without a file still work: the console shows the title
and a YouTube search link, and you play it from your own deck, phone, or streaming app.
The bingo logic doesn't care where the sound comes from.

### 7. Check the snippet start times

Every song has a **Start** time — where its 30 seconds begins, chosen to land on the
chorus or the signature riff rather than a slow intro. These are estimates. Skim the
list, play a few, and edit any that land badly (the field is editable inline), then
click **Save hooks**. They're stored in the browser and survive a reload.

---

## Running the game

Open `dj.html`, click **Load config…**, pick your `dj-bingo-config.json`, and confirm
the seed matches the cards. Then, for each round:

1. Click the round tab (**Round 1 — The 80s** first).
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

- **✓ BINGO CONFIRMED** — names the winning line, and the exact song that completed it
  ("Diagonal / completed on song #13 — *Like a Prayer*").
- **✗ NOT A WINNER** — shows how close they were ("best line has 4 of 5 marked"), which
  is usually enough to end the argument on the spot.

If the number isn't in your printed range, it says so rather than inventing a result.

### If two people call bingo at once

It happens in roughly one round in six with 40 guests. Both cards can be genuinely
correct. Verify each one and compare the **completed on song #N** line:

1. **Lower song number wins** — that card had bingo first, even if they shouted second.
2. **Same song number?** Then compare total squares marked (shown under the verdict) —
   more marks means a fuller card.
3. **Still tied?** Both win. It's an anniversary party; hand out two prizes, or let the
   couple pick.

The **Round status** panel flags ties for you before you're standing there guessing.

---

## Customising the songs

All 160 songs live in [`data/songs.js`](data/songs.js) — 40 per decade. Each entry is:

```js
["Billie Jean", "Michael Jackson", 1983, 55]
//  title         artist            year  where the 30s snippet starts
```

Swap in the couple's own favourites, their wedding song, whatever. Two rules:

- Keep **at least 25 songs** per round (24 squares plus a spare). Around 40 is the
  sweet spot — fewer makes rounds end faster, more makes them drag.
- After editing, re-run **Simulate this seed** and **reprint the cards**. Changing the
  song list changes every card.

Cards are laid out with the FREE square in the centre and a `B I N G O` header, and
each round prints in its own colour so the piles don't get mixed up.

---

## Reprinting one card

Cards are regenerated from the seed, so a lost card is never a problem — the reprint is
identical to the original. `cards.html` accepts URL parameters:

```
cards.html?from=17&to=17            # just guest #17, all four rounds
cards.html?from=17&to=17&rounds=r2  # just guest #17's 90s card
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
data/songs.js    the 160 songs, 40 per decade
js/bingo.js      seeded card generation + win checking (shared by both pages)
audio/           drop your music here (git-ignored)
```

`js/bingo.js` is deliberately shared: the printer and the verifier must never be able
to disagree about what's on a card.
