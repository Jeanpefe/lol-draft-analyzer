import allIcon from "./assets/roles/all.png";
import topIcon from "./assets/roles/top.png";
import jngIcon from "./assets/roles/jng.png";
import midIcon from "./assets/roles/mid.png";
import botIcon from "./assets/roles/bot.png";
import supIcon from "./assets/roles/sup.png";

export const ROLES = ["top", "jng", "mid", "bot", "sup"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  top: "TOP",
  jng: "JNG",
  mid: "MID",
  bot: "BOT",
  sup: "SUP",
};

export const ROLE_ICONS: Record<Role, string> = {
  top: topIcon,
  jng: jngIcon,
  mid: midIcon,
  bot: botIcon,
  sup: supIcon,
};

export const ALL_ROLES_ICON = allIcon;

export const SIDES = ["blue", "red"] as const;
export type Side = (typeof SIDES)[number];

export const VALID_SLOTS = SIDES.flatMap((side) =>
  ROLES.map((role) => `${side}_${role}` as const),
);

export const SIDE_CLASS_KEYS = ["blue", "red"] as const;
