import type { Side } from "./constants";

export interface SideStyles {
  bg: string;
  header: string;
  text: string;
  border: string;
  badge: string;
}

const sideStyles: Record<Side, SideStyles> = {
  blue: {
    bg: "bg-blue-900/20 border-blue-800",
    header: "bg-blue-900/40",
    text: "text-blue-400",
    border: "border-blue-600",
    badge: "bg-blue-900/40 text-blue-300",
  },
  red: {
    bg: "bg-red-900/20 border-red-800",
    header: "bg-red-900/40",
    text: "text-red-400",
    border: "border-red-600",
    badge: "bg-red-900/40 text-red-300",
  },
};

export function getSideStyles(side: Side): SideStyles {
  return sideStyles[side];
}

export function getWinrateColor(wr: number): string {
  if (wr >= 50) return "text-green-400";
  return "text-red-400";
}
