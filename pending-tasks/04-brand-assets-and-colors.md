# Brand assets & colours

**Status:** Working estimates in place, not officially confirmed.

## Why it matters

- The six accent colours (`--c-orange`, `--c-blue`, `--c-purple`,
  `--c-coral`, `--c-yellow`, `--c-teal` in `assets/css/style.css`'s `:root`
  block) were colour-picked from Echobox Radio's site, with blue/purple
  lightened slightly for WCAG contrast. They're close, not necessarily
  exact brand hex codes.
- ~~The Echobox Radio footer icon was a generic line-icon~~ — **done**:
  the real Echobox wordmark (`assets/img/Echobox.png`) is now used in the
  footer `.icon-chip` on every page.
- The Oedipus Brewery footer icon is still a generic line-icon, not their
  official logo mark.

## What to do

1. If an official Talk That Science / Echobox style guide exists, get the
   exact hex codes and swap the `--c-*` variables in `assets/css/style.css`.
2. Get usage rights + a real logo file for Oedipus Brewery, then replace
   the inline `<svg>` icon in its `.icon-chip` span (search each `.html`
   file for `Oedipus Brewery`) the same way the Echobox one was done —
   see `.icon-chip-echobox` in `assets/css/style.css` as the pattern to
   follow.
