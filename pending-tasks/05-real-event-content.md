# Real event content

**Status:** Real episode history is in (27 episodes, 2024–2026) — from
`data/episodes.jsonl` via `scripts/sync-episodes.js`. Per-episode display
fields (description, audio excerpt, slides) still need filling in.

## Why it matters

- `content/events.json` now holds all 27 real episodes from
  `data/episodes.jsonl` instead of the old fictional demo data. See
  `README.md` → "Episode data" for how the two files relate.
- None of these 27 have a `description`, `excerptAudioUrl`, or `slideUrl`
  yet — `episodes.jsonl` never had that data, so every event card
  currently shows the "Slides / audio coming after the show" fallback.
- All 27 were defaulted to `type: "broadcast"`, since `episodes.jsonl` has
  no field distinguishing broadcasts from live Oedipus bar nights. At
  least one — `2026-06-10-tts-panel-oedipus-craft-space-housing-the-people`
  ("TTS Panel @Oedipus Craft Space") — looks like it was actually a live
  event by its title. Worth reviewing the full list for others like it.
- Sample MP3 excerpts and PDF slide decks still sitting in `assets/media/`
  from the original demo are now fully unused (no event references them).

## What to do

Once the CMS OAuth backend is working (see
[02-cms-github-oauth.md](02-cms-github-oauth.md)):

1. Log into `/admin`, open "Events & Broadcasts".
2. Review the events that were actually live Oedipus bar nights (not
   broadcasts) and switch their `type` to "Live Bar Talk" + fill in
   `venue` — the sync script always defaults to broadcast.
3. Fill in `description`, and upload real excerpt audio / slide PDFs
   per event as they become available, through the CMS's drag-and-drop
   fields (they land in `assets/media/` automatically).
4. Delete the now-unused demo files in `assets/media/`
   (`excerpt-*.mp3`, `slides-*.pdf`) once nothing references them.

Going forward, add new episodes to `data/episodes.jsonl` first, run
`node scripts/sync-episodes.js`, commit — then add the description/
audio/slides for that new event via `/admin` as usual.
