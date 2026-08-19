# Ai&i · Grameenphone

Particle-formation experience. The Grameenphone mark assembles from a
scattered particle cloud, the copy staggers in, then the three-question
calibration runs. Single screen, no scrolling, mobile-first.

## Run

    npm install
    npm run dev     # http://localhost:3000

## How the logo formation works

`components/LogoParticles.tsx` loads `/public/logo.png` at runtime, reads its
alpha channel on an offscreen canvas, and emits one particle per opaque pixel.
Nothing about the mark is hard-coded — **replace `public/logo.png` with any
other artwork and the formation follows it automatically.** Use a
transparent-background PNG; alpha above 128 becomes a particle.

A neighbour probe measures how close each pixel sits to the silhouette edge.
That value drives the colour ramp (deep blue in the interior, light blue at the
rim) and the particle size, which is what produces the backlit rim-glow from
the reference image.

Formation, stagger and idle drift all run in the vertex shader, so particle
count barely affects frame rate.

## Brand

`lib/brand.ts` holds every colour. `logoBlue` (#19AAF8) is sampled directly
from the supplied logo; the rest follow the Telenor core palette. **Verify each
hex against your brand book before launch** — the palette sheet you supplied
was too low-resolution to read exact values.

### Typeface

Telenor specifies a licensed corporate typeface. `app/layout.tsx` currently
loads Inter + JetBrains Mono from Google as a stand-in so the project builds
without licensed files.

To switch to the real face, drop the `.woff2` files into `public/fonts` and
replace the `next/font/google` calls with `next/font/local`. No component
changes are needed — everything reads the `--font-sans` / `--font-mono` CSS
variables.

## Responsive behaviour

Camera distance is derived from the live viewport aspect ratio rather than
fixed breakpoints, so the mark frames identically on any screen. Below 640px
the sampling step coarsens (fewer, slightly larger particles) and the dust
field halves, which keeps mid-range Android above 50fps.

Buttons are minimum 48–52px tall. `viewportFit: "cover"` plus `100dvh` handles
iOS browser chrome.

## Accessibility

`prefers-reduced-motion` skips the formation entirely — the mark renders fully
assembled and all transitions become instant. The experience stays complete.

## Left to wire

- **AR handler.** The result screen's AR button opens a placeholder sheet.
  Connect your WebAR provider in the `arOpen` branch of `Experience.tsx`.
- **Invitation ID** is generated client-side for display. Issue it server-side
  if it needs to be verifiable at the venue.
- **Event date** is hard-coded as `19.08.2026 · DHAKA` in `lib/copy.ts`.
