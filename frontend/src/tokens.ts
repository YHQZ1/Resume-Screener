export const tokens = {
  bg: "#f6f5f2",
  surface: "#ffffff",
  ink: "#1a1a18",
  inkMid: "#5a5a55",
  inkLight: "#9a9990",
  border: "#e8e7e2",
  borderMid: "#d4d3cd",
  tag: "#eceae5",
  tagText: "#4a4a45",
  accentSurface: "#f0ede8",
} as const;

export type Tokens = typeof tokens;
