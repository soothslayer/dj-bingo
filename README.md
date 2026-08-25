# DJ Bingo — 50th Anniversary Edition

Music bingo for a party. Four rounds — Going to the Chapel, Songs of 1976, Golden Oldies,
Love Songs — each won a harder way than the last, with printable cards
for every guest, a DJ console that plays 30-second snippets, and winner verification
that actually proves the winner won.

Four files, no install, no build step:

| File | Who uses it | What it does |
|---|---|---|
| [`index.html`](index.html) | Anyone | Landing page linking to the two tools |
| [`cards.html`](cards.html) | You, before the party | Generates and prints numbered bingo cards |
| [`dj.html`](dj.html) | The DJ, during the party | Plays snippets, tracks what's played, verifies winners |
| [`show.html`](show.html) | The room, on the projector | Counts down each snippet, then reveals the song |

Open any of them by double-clicking, or serve the folder and visit
`http://localhost:8777` (see [Running from a server](#running-from-a-server)). The
projector page needs the server if you want it to follow the console automatically —
or [publish the whole thing](#publishing-it-to-a-url), which solves that and lets you
reach the pages from any device.

There's also a hosted copy at **djbingo.hanlonmiller.com**, limited to an email
allowlist — see [DEPLOY.md](DEPLOY.md).

---

## How it works

Each guest gets a numbered card per round: a 5×5 grid of songs with a FREE centre
square. The DJ plays a 30-second snippet; guests mark the square if that song is on
their card.

**Each round is won a different way, and the game gets harder as the night goes on:**

| Round | Theme | To win | Squares | Typical length |
|---|---|---|---|---|
| 1 | Going to the Chapel | **One line** — any row, column or diagonal | 5 | ~9 songs, 6 min |
| 2 | Songs of 1976 | **One line** — any row, column or diagonal | 5 | ~11 songs, 7 min |
| 3 | Golden Oldies | **Two lines** — any two, and they may cross | ~10 | ~16 songs, 11 min |
| 4 | Love Songs | **Cover all** — every square on the card | 24 | ~36 songs, 24 min |

That comes to about **58 minutes all in** — 48 of music, plus ten for intros, verifying
winners and handing out prizes. Two easy rounds to warm the room up, then a step up,
then a long finale everyone is playing until the end.

That line-up is the *default*, not a fact about the program — see
[Changing how a round is won](#changing-how-a-round-is-won) to re-cut it, and
[Keeping it under an hour](#keeping-it-under-an-hour) for what each option costs.

The win pattern is printed on every card, as a name and a little 5×5 icon beside the
round title, so nobody has to remember which round is which. It also shows on the DJ's
round tab, run sheet, and verification panel.

Round 4 is long by design — a frame needs 16 of a card's 24 songs, so most of the pool
has to be played before anyone finishes. That's the shape of that game, not a bad seed.
It's the only long round in the line-up, which is what keeps the night inside the hour.

**Cards are never stored anywhere.** They are *derived* from three things: the master
seed, the round, and the card number. The generator and the DJ console run the same
function, so the console can rebuild any guest's card from scratch and check it
against the songs actually played. That's what makes verification trustworthy — and
it's why the seed must match.

> The seed is printed in small type at the bottom of every card
> (`ANNIVERSARY-50-6 · R1 · card 18`). If the console's seed doesn't match that, the
> console will happily verify the *wrong* card. Check it once before you start.

---

## Keeping it under an hour

The thing that decides how long a round runs is **not how many squares the pattern
needs — it's how many ways there are to make it.** Measured over 200 seeds with 40
guests, a 40-song pool, and the first winner ending the round:

| Win condition | Squares | Ways to make it | Songs | Time at 30s snippets |
|---|---|---|---|---|
| `stamp` — any 2×2 block | 4 | 12 | **10** | 7 min |
| `line` — row, column or diagonal | 5 | 12 | **11** | 7 min |
| `corners` — the four corners | 4 | 1 | **17** | 11 min |
| `twoLines` | ~10 | 12 (pick 2) | **18** | 12 min |
| `threeLines` | ~15 | 12 (pick 3) | **22** | 15 min |
| `x` — both diagonals | 8 | 1 | **26** | 17 min |
| `frame` — the outside edge | 16 | 1 | **34** | 23 min |
| `blackout` — cover all | 24 | 1 | **36** | 24 min |

Four corners needs *four* squares and takes 17 songs; the postage stamp also needs
four and takes 10, because there are twelve places to make one. Three lines needs 15
squares and is quicker than the X's 8. A single fixed shape is slow however small it
is, since every guest needs those exact squares.

The practical consequence: **you can afford one long round, not two.** A frame and a
cover-all cost the same ~23 minutes each, so a line-up with both runs to 76 minutes
however you seed it. This one spends its long round on the finale and keeps the other
three at the cheap end.

Three levers if you need to claw back time:

1. **Shorten the snippet.** It's editable in the console mid-party and takes effect on
   the next song, so it doubles as a safety valve: dropping the last round to 20
   seconds saves about 6 minutes on its own.
2. **Swap a win condition.** One word in the `ROUND_GOALS` block at the top of
   `data/songs.js`, or a URL parameter if you just want to try it — see
   [Changing how a round is won](#changing-how-a-round-is-won).
3. **Cut the overhead.** Verify the winner while the next round's title slide is
   already on the projector, and save prize-giving for the end.

One caveat: **fewer guests means longer rounds, not shorter.** Fewer cards in play
means fewer chances for any of them to complete the pattern. At 20 guests add roughly
two songs to most rounds — about five minutes across the night.

---

## Before the party

### 1. Pick a seed and check the pacing

Open `cards.html`. Because the whole game is determined by the seed, you can simulate
it before printing a single page.

- Set the **master seed** and the card range (1–40 for 40 guests).
- Click **Simulate this seed** — it reports how many songs each round needs before
  someone wins it, how long that is in minutes, and the total for the night.
- Each round is judged against its own win condition, because they are not comparable:
  a stamp round should land in **5–15 songs**, one line in **8–16**, two lines in
  **14–22** and the picture frame in **28–36**. A 33-song frame round is normal; a
  33-song one-line round would mean something is wrong.
- Set the **snippet length** there too and the estimate follows it, so the readout
  tells you what the night will actually cost in minutes — and says so plainly if it
  runs past an hour.
- Click **Find a well-paced seed** to search for a seed where every round lands in its
  ideal range with exactly one winner *and* the whole thing fits the hour.

**Ties get more likely the more of the card a round asks for.** Measured over 200
seeds with 40 guests: the stamp round ties about 14% of the time, one line 18%, two
lines 22% and the picture frame 25% — late in a long round most of the room is waiting
on the same few songs. The tiebreak below handles it.

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

## On the projector

`show.html` is the big screen: a countdown while the snippet plays, then a press to
reveal the song and artist to the room. It reads the same song list and the same
suggested play order as the console, so the screen and the speakers stay in step
without the two pages needing to talk to each other.

Open it, set the seed to match the console, pick your rounds, and hit **Start the
show**. It goes fullscreen and needs nothing else.

Each round runs as: a **title slide** with the round's name and how it's won (the
pattern icon, big, so the room can see what they're playing for), then per song a
**countdown** and a **reveal**, and finally a **recap** listing everything that round
played — handy while people check their cards.

Every slide carries the round number, the theme and the win condition: as a corner
header (`ROUND 3 · Golden Oldies · ▣ Two lines`) and again above the song itself,
so anyone glancing up mid-round knows where they are — and so it survives a projector
that crops the edges of the picture.

| Key | Action |
|---|---|
| `space` / `→` / `PageDown` / a presenter clicker | Reveal, then on to the next song |
| `←` / `PageUp` | Back |
| `X` or the **Someone called it!** button | Put the call up on the screen |
| `R` | Restart the countdown (use it if the music started late) |
| `P` | Pause the countdown |
| `B` | Blank the screen — for speeches, or between rounds |
| `F` | Fullscreen |
| `Esc` | Back to the setup screen |

Clicking or tapping anywhere also advances, so the show can be driven from a phone.

### When someone calls it

Press `X`, or click **Someone called it!** in the bottom-left corner (it appears with
the other controls when you move the mouse, and stays off the projection the rest of
the time). The screen fills with the call and **Card number, please**, which is the
DJ's cue to go and verify on the console.

The word is whatever *that round* is won by — **BINGO** in round 1, then **DOUBLE
BINGO**, **FRAME** and **FULL HOUSE** — so the room picks up the rule by seeing it.
Underneath sits the round, the theme, the win condition and how many songs are in.

It's an overlay, not a slide: the countdown freezes while it's up, and any key or
click dismisses it straight back to the song you were on with the clock running
again. A false alarm costs nothing — carry on with the same press.

### Letting it follow the DJ console

Tick **Follow the DJ console** and the projector drives itself: when the DJ hits
**Play next**, the screen jumps to that song's countdown and starts counting. The
reveal stays manual — that beat belongs to the DJ. It also picks up the console's
snippet length, so changing 30 to 20 seconds mid-party changes the countdown too.

This works through the browser's own storage, so it needs both pages open in the
**same browser** and served from the **same address** (`http://localhost:8777/dj.html`
and `http://localhost:8777/show.html`). Opened as `file://` the two pages can't see
each other, and the show simply stays manual.

The countdown starts when the console *marks* the song played, which is a moment
before the audio actually begins if it's still fetching a preview. If it drifts, press
`R` to restart the countdown in time with the music.

### Joining late

`show.html` takes the same URL parameters as the rest, plus a starting point:

```
show.html?round=r3                     # just the Golden Oldies round
show.html?round=r3&start=12            # pick up at song 12
show.html?snip=20&follow=1             # 20-second countdown, following the console
```

---

## Running the game

Open `dj.html`, click **Load config…**, pick your `dj-bingo-config.json`, and confirm
the seed matches the cards. Then, for each round:

1. Click the round tab (**Round 1 — Going to the Chapel** first).
2. Hit **▶︎ Play next**. It plays the next song in a suggested shuffled order and marks
   it as played automatically.
3. Repeat. Give the room a beat between songs to find their squares.
4. When someone shouts, go to **Verify a winner**.

If you're projecting, open [`show.html`](show.html) on the second screen — see
[On the projector](#on-the-projector).

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

It happens in roughly one round in six early on, and more often in the long rounds —
about a quarter of frame rounds end in a tie, because by then most of the room is
waiting on the same few songs. Both cards can be genuinely correct. Verify each one
and compare the **finished on song #N** line:

1. **Lower song number wins** — that card completed the pattern first, even if they
   shouted second.
2. **Same song number?** Then compare total squares marked (shown under the verdict) —
   more marks means a fuller card. (This one can't separate a `blackout` tie if you
   switch a round to it, since both winners are on 25 of 25 by definition.)
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
  sweet spot. Shrinking a pool is *not* a good way to shorten a long round: the card
  still needs its 16 or 24 specific squares, so you save little time and ties get much
  more likely (a 26-song cover-all round ties about 72% of the time versus 38% at 40).
  Change the win condition instead.
- After editing, re-run **Simulate this seed** and **reprint the cards**. Changing the
  song list changes every card.

### Changing how a round is won

All four live together at the top of [`data/songs.js`](data/songs.js), above the song
lists rather than buried inside them:

```js
var ROUND_GOALS = {
  r1: "line",
  r2: "line",
  r3: "twoLines",
  r4: "blackout"
};
```

Any of `"stamp"`, `"line"`, `"corners"`, `"twoLines"`, `"threeLines"`, `"x"`,
`"frame"` or `"blackout"` works. The table in
[Keeping it under an hour](#keeping-it-under-an-hour) says what each costs in songs and
minutes, so you can re-cut the night to a different length by swapping words.

#### Trying one without editing anything

All three pages take a `goals` parameter, which beats `ROUND_GOALS` for that visit:

```
?goals=line,line,twoLines,blackout   all four, in order
?goals=r4:frame                      just round 4, others unchanged
?goals=,,x                           just round 3 — an empty slot skips a round
```

Handy for pacing experiments: open
`cards.html?view=run&goals=stamp,line,twoLines,frame`, read the projected running time,
and try another line-up without touching a file. When you settle on one, write it into
`ROUND_GOALS` so it is what everybody gets.

A goal that does not exist is ignored rather than fatal — a typo costs you that one
round, not the evening. `node test/check.js` fails the build on a typo in `ROUND_GOALS`
itself, where it would otherwise go unnoticed.

#### Keeping the three pages agreed

This is the part worth understanding, because getting it wrong is quiet and expensive:
**a console checking a different pattern from the one printed on the card will tell a
real winner they have not won.**

So the goals travel with the game rather than being set three times:

- The console **remembers** them per seed, so a reload mid-party cannot lose them.
- **Export config** from the card generator writes them into the JSON, and **Load
  config…** in the console applies them — hand that file over and the console is
  judging exactly what you printed.
- The projector **adopts** whatever the console is using while it is following along.
- An explicit `?goals=` in the address bar beats all of the above, so you can always
  override by hand.

The win pattern is printed on every card and shown on the console's round tab, so a
mismatch is visible before it costs anyone a prize — check them against each other if a
verification ever looks wrong.

The patterns, the expected pacing for each, and the little 5×5 icon all live in
[`js/bingo.js`](js/bingo.js) — add a new goal there and any round can use it. Every
page resolves goals through the one `goalFor()` function, so nothing can be updated and
leave another page behind. Re-run **Simulate this seed** afterwards: a different win
condition changes how long the round runs, and the seed that suited the old one may not
suit the new.

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

`seed`, `occasion`, `group` and `goals` work the same way. Anything you leave out keeps
the value shown in the form. `goals` is covered under
[Changing how a round is won](#changing-how-a-round-is-won), and works on all three
pages rather than just this one.

## Publishing it to a URL

There is nothing to compile — the three pages *are* the program — so deploying means
serving them from an address. [`deploy.sh`](deploy.sh) stages the site files and
uploads them to Cloudflare Pages, where they live at **djbingo.hanlonmiller.com**
behind an email allowlist. [DEPLOY.md](DEPLOY.md) has the one-time setup and the
whole story.

```bash
./deploy.sh
```

Worth doing for three reasons:

- The party laptop, the projector laptop and your phone all reach the same pages, with
  no copying files onto a stick.
- **The projector can follow the console.** That needs both pages on one real origin,
  and it does not work over `file://`.
- Testers can open it from anywhere without you handing them the repository.

`deploy.sh` uploads only the files it stages, so nothing else in the repository — not
`audio/`, not the tests, not the deployment config — ever reaches the site.
`wrangler pages deploy` otherwise uploads *everything* in the directory it is given: it
skips only a hardcoded list, and reads neither `.gitignore` nor `.assetsignore`.

### Check before you publish

[`test/check.js`](test/check.js) validates the song data and the win conditions. Run it
before a deploy — especially after editing `songs.js`, where a mistake is invisible
until the night itself:

```bash
node test/check.js
```

It fails on

- a malformed song entry, a missing title or artist, a nonsense year or hook time;
- the same song appearing in two rounds — a guest would mark one square and wonder why
  the other didn't count;
- a round naming a `goal` that doesn't exist;
- a win condition that no longer holds (a stamp winnable on three songs, a frame
  satisfied by something that isn't the edge, and so on);
- two guests being dealt the same 24 songs on the shipped seed.

It also **reports the night's running time** — songs and minutes per round, and the
total against the hour. That part never fails: editing the songs is allowed to shift
the timing, but you should be told it moved.

### The site holds the answer key

`dj.html` shows the full song list *and* the suggested play order. That is why the
hosted copy sits behind Cloudflare Access with an email allowlist rather than on an
open URL — anyone who can reach the site can read the answers.

Two things to know about that. Every Pages deploy also gets an unguessable
`*.pages.dev` preview URL, which bypasses the policy on the custom domain unless you
protect previews too — DEPLOY.md covers it. And the allowlist is an honour system
against your testers, not a secret: they *can* look.

Your local music files are never uploaded — `audio/` is git-ignored and never staged,
and the hosted console falls back to iTunes previews or takes files you drop into it on
the night, exactly as it does locally.

## Running from a server

Double-clicking the files works. If your browser gets fussy about local files, serve
the folder instead:

```bash
python3 -m http.server 8777
```

Then open `http://localhost:8777/cards.html`, `http://localhost:8777/dj.html` and
`http://localhost:8777/show.html`. Serving them is what lets the projector page follow
the console — as `file://` they can't see each other.

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
index.html       landing page: links to the three, and the round list
cards.html       card generator, DJ run sheet, print layout
dj.html          DJ console: player, tracking, verification
show.html        the projector slideshow: countdown, reveal, round recap
data/songs.js    the 160 songs and each round's win condition, 40 per round
js/bingo.js      seeded card generation + win checking (shared by all three pages)
test/check.js    pre-deploy checks + the running-time report
audio/           drop your music here (git-ignored)
wrangler.toml    Cloudflare Pages config (see DEPLOY.md)
deploy.sh        stages the site files and uploads them to Cloudflare Pages
```

`js/bingo.js` is deliberately shared: the printer and the verifier must never be able
to disagree about what's on a card, and the projector must never disagree with either
about the order songs come in.
