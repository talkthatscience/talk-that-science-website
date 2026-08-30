#!/usr/bin/env node
/*
 * Regenerates content/events.json from data/episodes.jsonl.
 *
 * data/episodes.jsonl is the source of truth for core episode facts
 * (date, title, guests, faculties, topics). content/events.json is what
 * the live site actually fetches and renders, and also carries display
 * fields episodes.jsonl doesn't have (description, excerptAudioUrl,
 * slideUrl, episodeLink, venue, type) — those get added/edited later via
 * the /admin CMS, same as any other event.
 *
 * Run this after adding/editing a line in data/episodes.jsonl:
 *   node scripts/sync-episodes.js
 * then commit the resulting content/events.json change as usual.
 *
 * Safe to re-run any time:
 *   - Events whose id matches an episode from episodes.jsonl get their
 *     core fields (title/date/guest/tags) refreshed from episodes.jsonl,
 *     but any CMS-added extras (description, excerptAudioUrl, slideUrl,
 *     episodeLink) on that same id are preserved as-is.
 *   - Events in content/events.json that DON'T correspond to any
 *     episodes.jsonl record (e.g. hand-added live bar-night events, which
 *     have no episode_number) are left completely untouched.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const EPISODES_PATH = path.join(ROOT, "data", "episodes.jsonl");
const EVENTS_PATH = path.join(ROOT, "content", "events.json");

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCaseTopic(topic) {
  return topic
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function readEpisodes() {
  const raw = fs.readFileSync(EPISODES_PATH, "utf8");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function episodeToEvent(ep) {
  const tags = [];
  for (const f of ep.faculties || []) {
    if (!tags.includes(f)) tags.push(f);
  }
  for (const t of ep.topics || []) {
    const label = titleCaseTopic(t);
    if (!tags.includes(label)) tags.push(label);
  }
  return {
    id: `${ep.date}-${slugify(ep.title)}`,
    type: "broadcast",
    title: ep.title,
    guest: (ep.guests || []).join(", "),
    date: ep.date,
    tags,
  };
}

function main() {
  const episodes = readEpisodes();
  const generated = episodes.map(episodeToEvent);
  const generatedIds = new Set(generated.map((e) => e.id));

  let existing = { events: [] };
  if (fs.existsSync(EVENTS_PATH)) {
    existing = JSON.parse(fs.readFileSync(EVENTS_PATH, "utf8"));
  }
  const existingById = new Map((existing.events || []).map((e) => [e.id, e]));

  // Keep any existing event untouched if it's not sourced from episodes.jsonl
  // (e.g. a hand-added live bar-night event with no matching episode).
  const untouched = (existing.events || []).filter((e) => !generatedIds.has(e.id));

  // For events sourced from episodes.jsonl, refresh core fields but keep
  // any display extras a CMS edit may have added on top.
  const merged = generated.map((gen) => {
    const prev = existingById.get(gen.id);
    if (!prev) return gen;
    const { id, title, guest, date, tags, ...extras } = prev;
    return { ...gen, ...extras };
  });

  const events = [...merged, ...untouched].sort((a, b) => (a.date < b.date ? 1 : -1));

  fs.writeFileSync(EVENTS_PATH, JSON.stringify({ events }, null, 2) + "\n");
  console.log(
    `Wrote ${events.length} events to content/events.json ` +
      `(${generated.length} from episodes.jsonl, ${untouched.length} untouched).`
  );
}

main();
