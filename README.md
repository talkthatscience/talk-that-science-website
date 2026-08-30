# Talk That Science — website

A zero-server-maintenance site for the *Talk That Science* Echobox Radio show
and its live Science Bar Talks at Oedipus Brewery. Plain HTML/CSS/JS — no
build step, no framework, no backend to patch or pay for. Content is edited
through a Git-backed CMS (Decap CMS) at `/admin`, and forms are handled by
Formspree.

This is built to run entirely on **GitHub**: GitHub Pages for hosting, a
GitHub OAuth App for CMS login, and Formspree (a separate free service, since
GitHub itself has no form-handling) for the three forms. Because it's a
project-page GitHub Pages site (served at `yourusername.github.io/reponame/`,
not a custom domain at the root), every internal link, `<img src>`, script
tag, and JSON fetch in this repo uses a **relative path** (`assets/...`,
`content/...`) rather than a root-relative one (`/assets/...`) — if you later
move to a custom domain at the root, either shape works fine, so no changes
would be needed.

## What's real vs. placeholder right now

- **Real:**
  - The show's actual tagline, Echobox show URL, Spotify/Apple/SoundCloud
    links, and the "monthly show + live bar night" format.
  - **The visual design** — colour palette, logo, and hero illustration are
    now the real "Talk That Science" brand assets you provided:
    - The logo lockup (`assets/img/logo.png`) is used as-is in the header.
    - The hero illustration (`assets/img/hero-illustration.png`) is your
      actual show artwork.
    - The cream background (`--bg`, `--bg-alt`) and near-black ink
      (`--ink`) are colour-picked directly from those two assets.
    - The six accent colours (`--c-orange`, `--c-blue`, `--c-purple`,
      `--c-coral`, `--c-yellow`, `--c-teal`) are colour-picked from the
      rainbow stripe on the Echobox Radio site, reused here for badges,
      buttons, and the stripe under the header — a visual nod to where the
      show lives. Blue and purple were lightened slightly from Echobox's
      exact values so text sitting on them meets accessibility contrast
      guidelines (verified with WCAG contrast ratios); if you have official
      hex codes for the full brand palette, hand them over and I'll swap
      these estimates for the exact values.
    - Headings use **Archivo** (a bold geometric sans close to the logo's
      lettering); body text stays on **Inter** for readability.
  - All of this lives in `assets/css/style.css`'s `:root` block plus the
    two files in `assets/img/` — easy to hand-tune further or swap if you
    get an official style guide with exact specs later.
- **Still placeholder (replace when ready):**
  - The Echobox player on the homepage (`#echobox-player`) currently links
    out to the live stream — swap it for Echobox's official embed/widget
    code if/when they provide one.
  - The Oedipus Brewery / Echobox footer icons are generic line-icons, not
    official logos — swap them for the real marks if you have usage rights.
  - All 8 sample events in `content/events.json`, including guest names,
    are fictional so you can see the full layout working end-to-end. Delete
    or edit them from `/admin` once real dates are confirmed.
  - Sample MP3 excerpts and PDF slide decks in `assets/media/` are
    generated placeholders (a soft tone + a labelled slide deck), just so
    every "play excerpt" / "view slides" button actually works in the demo.
  - The four `action="https://formspree.io/f/YOUR_FORM_ID"` attributes (three
    forms in `get-involved.html`, the newsletter box in `index.html`) need
    your real Formspree form IDs — see "Forms" below.
  - The `backend:` block in `admin/config.yml` needs your GitHub
    username/repo and your deployed OAuth proxy URL — see "Turning on the
    CMS" below.

## Site structure

```
index.html              Homepage — Echobox player/stream link, next event,
                         latest episode, newsletter signup
events.html              Event & Slide Hub — every broadcast + bar night,
                         filterable, with excerpt audio + slide links
calendar.html            Chronological list of upcoming broadcasts + events
about.html                About Talk That Science
get-involved.html         3 forms: topic suggestion, event review, volunteer
admin/                   Decap CMS (config.yml + index.html)
content/
  settings.json           Site-wide text (tagline, venue, about copy, links)
  events.json             Every event/broadcast — edited via /admin
assets/
  css/style.css           All styling + the colour variables
  js/site.js              Fetches content/*.json and renders it into pages
  media/                  Uploaded slide PDFs + audio excerpts land here
.github/workflows/pages.yml  GitHub Actions workflow that deploys to Pages
.nojekyll                  Tells GitHub Pages not to run this through Jekyll
```

There's no templating engine and no build step on purpose: the CMS commits
plain JSON to `content/`, and a small script (`assets/js/site.js`) fetches
that JSON in the browser and renders it. Deploy = push these files as-is.

## Deploying (GitHub Pages, ~5 minutes)

1. Push this folder to a new GitHub repository.
2. In the repo: **Settings → Pages → Source**, choose **GitHub Actions**.
   (The workflow at `.github/workflows/pages.yml` is already in this repo —
   it just needs Pages pointed at it. No build command, it deploys the
   files as-is.)
3. Push to `main` (or run the workflow manually from the **Actions** tab).
   Your site goes live at `https://yourusername.github.io/reponame/`.
4. Optional: **Settings → Pages → Custom domain** to put it on your own
   domain instead. If you do, root-relative paths (`/assets/...`) would also
   work, but the relative paths already in this repo keep working too —
   nothing to change.

## Turning on the CMS (`/admin`)

Decap CMS needs a login system and a way to write back to your git repo.
Without Netlify, the `github` backend does this directly against the GitHub
API — but GitHub's OAuth flow requires one small server-side step Decap
can't do alone, so you need a tiny OAuth proxy in front of it. The easiest
option is a free Cloudflare Worker running an existing open-source proxy
([sterlingwes/decap-proxy](https://github.com/sterlingwes/decap-proxy)) —
no code to write, just deploy and configure:

1. **Create a GitHub OAuth App**: [github.com/settings/applications/new](https://github.com/settings/applications/new).
   - Homepage URL: the URL your Worker will live at, e.g.
     `https://decap-auth.yoursubdomain.workers.dev`.
   - Authorization callback URL: the same URL + `/callback`.
   - Save the **Client ID** and **Client Secret** it gives you.
2. **Deploy the OAuth proxy** as a Cloudflare Worker (needs a free
   Cloudflare account and `npx wrangler login` once):
   ```
   git clone https://github.com/sterlingwes/decap-proxy
   cd decap-proxy
   cp wrangler.toml.sample wrangler.toml
   npx wrangler secret put GITHUB_OAUTH_ID       # paste the Client ID
   npx wrangler secret put GITHUB_OAUTH_SECRET   # paste the Client Secret
   npx wrangler deploy
   ```
   This gives you a `https://<name>.<subdomain>.workers.dev` URL — visiting
   it should say "Hello 👋" if it worked.
3. **Update `admin/config.yml`** in this repo with your real values:
   ```yaml
   backend:
     name: github
     repo: yourusername/your-repo-name
     branch: main
     base_url: https://<name>.<subdomain>.workers.dev
     auth_endpoint: /auth
   ```
4. **Add content managers as GitHub collaborators** on this repo (**Settings
   → Collaborators**) — the `github` backend authenticates people as
   themselves, so anyone editing content needs push access to the repo
   itself (unlike Netlify Identity, there's no separate invite-only login
   system layered on top).
5. Visit `yoursite/admin/` — log in with GitHub, and you'll see the "Site
   Settings" and "Events & Broadcasts" collections, with drag-and-drop
   upload for PDFs and audio.

## Forms

`get-involved.html` (topic suggestions, event reviews, volunteer signup) and
the newsletter box on the homepage POST to **Formspree**, a free
form-backend service that works from any static host (GitHub Pages has no
built-in form handling of its own):

1. Sign up at [formspree.io](https://formspree.io) and create a form for
   each of the four use cases (topic suggestion, event review, volunteer
   signup, newsletter) — each gets its own form ID and its own submissions
   inbox/notifications.
2. Replace `YOUR_FORM_ID` in the matching `action="https://formspree.io/f/YOUR_FORM_ID"`
   attribute: three in `get-involved.html`, one in `index.html`.
3. That's it — `assets/js/site.js` already POSTs each form to its own
   `action` URL via `fetch`, shows the inline success message, and falls
   back to a normal form submit (Formspree's own confirmation page) if
   `fetch` fails for any reason.

The hidden `_gotcha` field in each form is Formspree's built-in honeypot —
real users never see or fill it; if a bot does, Formspree silently drops
the submission.

If you'd rather use a different form service later, only the `action=`
URLs and the `fetch` call in `assets/js/site.js`'s `initForms()` need to
change — the HTML structure itself doesn't.

## Extending into the workflows from the brief

A handful of things in the original brief are editorial/automation
workflows rather than website features, so they're intentionally left as
"next steps" rather than fake-built here:

- **Newsletter delivery** — the homepage signup form currently lands in
  Formspree. Connect it to an actual list provider (Buttondown, Mailchimp,
  etc.) by pointing the form's `action` at their API/embed endpoint instead,
  or by replacing the form with their embed snippet.
- **Pre-interview reminder emails** (with a calendar link + prep notes) and
  **daily audio-excerpt suggestions** are internal workflows, not public
  pages — a small scheduled automation (e.g. a GitHub Actions scheduled
  workflow, or Zapier/Make triggered off new rows in `content/events.json`)
  is the natural way to build these without standing up a server. Happy to
  build either once you tell me which calendar/email tool you use.
- **Auto-drafting episode descriptions** from guest papers and prep notes
  is an AI-assisted writing step best done as a Claude workflow when a new
  event is added, rather than static site code — ask any time you want that
  wired up.

## Adjusting the design further

Everything visual is controlled from a few places:

- `assets/css/style.css` → the `:root { ... }` block at the top holds every
  colour as a variable. Change one there and it updates everywhere it's used.
- `assets/img/logo.png` and `assets/img/hero-illustration.png` are your
  actual brand files — replace them with updated exports any time (keep the
  same filenames, or update the `<img src>` references in the `.html` files
  if you rename them).
- The Echobox-style rainbow stripe is the `.rainbow-bar` component in
  `style.css` — it's plain CSS (six flex children), not an image, so its
  colours follow the `--c-*` variables automatically.
- Footer icons (Echobox Radio / Oedipus Brewery chips) are inline SVG
  directly in each `.html` file (search for `<svg`) — swap for real logo
  marks as `<img>` tags whenever you have usage rights to them.
