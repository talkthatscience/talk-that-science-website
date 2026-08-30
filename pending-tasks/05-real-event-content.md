# Real event content

**Status:** 27 real episodes (2024–2026) with real descriptions are live.
Only excerpt audio and slide decks are still missing.

## Why it matters

- `content/events.json` holds all 27 real episodes from
  `data/episodes.jsonl` instead of the old fictional demo data. See
  `README.md` → "Episode data" for how the two files relate.
- ~~None of these 27 have a description~~ — **done**: every event now has
  a real one-sentence description, written from the full episode
  transcripts (summarized, not copied).
- ~~All 27 were defaulted to `type: "broadcast"`~~ — reviewed:
  `2026-06-10-tts-panel-oedipus-craft-space-housing-the-people` ("TTS
  Panel @Oedipus Craft Space") was confirmed as a real live event and
  fixed to `type: "live_event"` + `venue: "Oedipus Craft Space"`. It was
  the only one matching that pattern in the current 27 — re-check this
  whenever new episodes are added, since `episodes.jsonl` still has no
  field to distinguish broadcasts from live events automatically.
- No event has `excerptAudioUrl` or `slideUrl` yet — every card still
  shows the "Slides / audio coming after the show" fallback.
- Sample MP3 excerpts and PDF slide decks still sitting in `assets/media/`
  from the original demo are now fully unused (no event references them).

## What to do

Once the CMS OAuth backend is working (see
[02-cms-github-oauth.md](02-cms-github-oauth.md)):

1. Log into `/admin`, open "Events & Broadcasts".
2. Upload real excerpt audio / slide PDFs per event as they become
   available, through the CMS's drag-and-drop fields (they land in
   `assets/media/` automatically).
3. Delete the now-unused demo files in `assets/media/`
   (`excerpt-*.mp3`, `slides-*.pdf`) once nothing references them.

Going forward, add new episodes to `data/episodes.jsonl` first, run
`node scripts/sync-episodes.js`, commit — then add the description/
audio/slides for that new event via `/admin` as usual. If a new episode
was actually a live Oedipus event, set its `type`/`venue` via `/admin`
too — the sync script preserves both correctly on every re-run now (this
was previously a bug: `type` used to get silently reset to `"broadcast"`
on each sync; fixed in `scripts/sync-episodes.js`).
