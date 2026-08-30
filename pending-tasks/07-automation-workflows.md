# Editorial automation workflows

**Status:** Not built — intentionally left as internal workflows, not site
features.

## Why it matters

A few things from the original brief are automation/editorial workflows
rather than public-facing pages:

- **Pre-interview reminder emails** — a reminder with a calendar link + prep
  notes, sent ahead of each recorded interview.
- **Daily audio-excerpt suggestions** — surfacing candidate clips from a
  new recording for the "excerpt" field in `content/events.json`.
- **Auto-drafting episode descriptions** — from guest papers/prep notes,
  for the `description` field in `content/events.json`.

## What to do

Each of these is a small scheduled or triggered automation (e.g. a GitHub
Actions scheduled workflow, Zapier/Make triggered off changes to
`content/events.json`, or a Claude-driven workflow for the AI-drafting
piece) rather than something that lives in this static site's code. Pick a
calendar/email tool and revisit — happy to build any of these once that's
decided.
