export const theme = {
  bg: "#0d0d0f",
  bgSoft: "#16161a",
  panel: "#1a1a1f",
  border: "#2a2a31",
  text: "#f8f8f2",
  textMuted: "#a0a0ac",
  yellow: "#ffd166",
  green: "#06d6a0",
  blue: "#118ab2",
  pink: "#ef476f",
  purple: "#9b5de5",
  fontMono:
    "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Consolas, monospace",
  fontSans:
    "'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
} as const;

export const fps = 30;
export const width = 1920;
export const height = 1080;

export const sceneDurations = {
  intro: 90,
  whatIsIt: 180,
  install: 180,
  configure: 180,
  cliTour: 270,
  models: 210,
  workflow: 210,
  agents: 210,
  outro: 150,
} as const;

export const totalDuration = Object.values(sceneDurations).reduce(
  (a, b) => a + b,
  0,
);
