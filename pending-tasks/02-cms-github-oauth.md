# Decap CMS GitHub OAuth backend

**Status:** Not started — `/admin` has no working login yet.

## Why it matters

`admin/config.yml`'s `backend:` block still has placeholder values for
`repo:` and `base_url:`. Until the OAuth proxy is deployed and configured,
visiting `/admin` won't be able to authenticate anyone.

## What to do

1. Create a GitHub OAuth App at
   [github.com/settings/applications/new](https://github.com/settings/applications/new)
   (do this under whichever GitHub account should own the CMS auth — likely
   `talkthatscience`, same as the repo).
   - Homepage URL: the URL the OAuth proxy will live at, e.g.
     `https://decap-auth.<subdomain>.workers.dev`.
   - Authorization callback URL: same URL + `/callback`.
   - Save the Client ID and Client Secret.
2. Deploy [sterlingwes/decap-proxy](https://github.com/sterlingwes/decap-proxy)
   as a free Cloudflare Worker:
   ```
   git clone https://github.com/sterlingwes/decap-proxy
   cd decap-proxy
   cp wrangler.toml.sample wrangler.toml
   npx wrangler secret put GITHUB_OAUTH_ID
   npx wrangler secret put GITHUB_OAUTH_SECRET
   npx wrangler deploy
   ```
3. Update `admin/config.yml` in this repo:
   ```yaml
   backend:
     name: github
     repo: talkthatscience/talk-that-science-website
     branch: main
     base_url: https://<name>.<subdomain>.workers.dev
     auth_endpoint: /auth
   ```
4. Add every content manager as a **GitHub collaborator** on
   `talkthatscience/talk-that-science-website` (Settings → Collaborators) —
   the `github` backend authenticates people as themselves, so they need
   push access to the repo itself.
5. Visit `/admin/`, log in with GitHub, confirm both collections ("Site
   Settings" and "Events & Broadcasts") load and save correctly.

See also: `README.md` → "Turning on the CMS".
