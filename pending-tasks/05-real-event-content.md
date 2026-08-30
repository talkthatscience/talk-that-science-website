# Real event content

**Status:** Demo data in place — all fictional.

## Why it matters

- All 8 sample events in `content/events.json` (guest names, dates,
  descriptions) are fictional, just to prove the layout works end-to-end.
- Sample MP3 excerpts and PDF slide decks in `assets/media/` are generated
  placeholders (a soft tone + a labelled slide deck).

## What to do

Once the CMS OAuth backend is working (see
[02-cms-github-oauth.md](02-cms-github-oauth.md)):

1. Log into `/admin`, open "Events & Broadcasts".
2. Delete the fictional sample events, or edit each to real dates/guests/
   descriptions as they're confirmed.
3. Upload real excerpt audio and slide PDFs per event through the CMS's
   drag-and-drop fields (they land in `assets/media/` automatically).
