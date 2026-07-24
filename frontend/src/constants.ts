export const ROLES = ["top", "jng", "mid", "bot", "sup"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  top: "TOP",
  jng: "JNG",
  mid: "MID",
  bot: "BOT",
  sup: "SUP",
};

export const SIDES = ["blue", "red"] as const;
export type Side = (typeof SIDES)[number];

export const VALID_SLOTS = SIDES.flatMap((side) =>
  ROLES.map((role) => `${side}_${role}` as const),
);

export const SIDE_CLASS_KEYS = ["blue", "red"] as const;
