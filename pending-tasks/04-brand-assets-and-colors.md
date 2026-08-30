# Brand assets & colours

**Status:** Working estimates in place, not officially confirmed.

## Why it matters

- The six accent colours (`--c-orange`, `--c-blue`, `--c-purple`,
  `--c-coral`, `--c-yellow`, `--c-teal` in `assets/css/style.css`'s `:root`
  block) were colour-picked from Echobox Radio's site, with blue/purple
  lightened slightly for WCAG contrast. They're close, not necessarily
  exact brand hex codes.
- The Echobox Radio / Oedipus Brewery footer icons (inline SVGs in every
  `.html` file, search for `<svg`) are generic line-icons, not official
  logo marks.

## What to do

1. If an official Talk That Science / Echobox style guide exists, get the
   exact hex codes and swap the `--c-*` variables in `assets/css/style.css`.
2. Get usage rights + real logo files for Echobox Radio and Oedipus
   Brewery, then replace the inline `<svg>` icon in the footer's
   `.icon-chip` spans with `<img>` tags pointing at the real marks.
