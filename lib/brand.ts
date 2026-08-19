/**
 * Grameenphone / Telenor brand tokens.
 *
 * `logoBlue` is sampled directly from the supplied logo.png (#19AAF8).
 * The remaining values follow the Telenor core palette sheet.
 * Verify each against your brand book before launch.
 */

export const BRAND = {
  // Core palette
  darkBlue: "#000C7B",
  midBlue: "#2B32E8",
  telenorBlue: "#00A9E0",
  logoBlue: "#19AAF8", // sampled from logo.png
  lightBlue: "#8FE1FF",
  offWhite: "#F3F5F7",
  white: "#FFFFFF",

  // Functional
  success: "#3ECF8E",
  surface: "#070B1C",
  void: "#03050E",
} as const;

/** Ordered stops used for the particle rim gradient (core -> edge). */
export const RIM_STOPS = [
  BRAND.darkBlue,
  BRAND.midBlue,
  BRAND.logoBlue,
  BRAND.lightBlue,
  BRAND.white,
] as const;

/** Text opacity ladder. Three levels only — keeps hierarchy disciplined. */
export const TEXT = {
  primary: "rgba(255,255,255,0.95)",
  secondary: "rgba(255,255,255,0.78)",
  tertiary: "rgba(255,255,255,0.58)",
  hairline: "rgba(255,255,255,0.10)",
} as const;
