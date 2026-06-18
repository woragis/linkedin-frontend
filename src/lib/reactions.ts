import type { LucideIcon } from "lucide-react";
import {
  HandHeart,
  Heart,
  Lightbulb,
  PartyPopper,
  Smile,
  ThumbsUp,
} from "lucide-react";

export type ReactionKind =
  | "like"
  | "celebrate"
  | "support"
  | "love"
  | "insightful"
  | "funny";

export type ReactionConfig = {
  kind: ReactionKind;
  label: string;
  color: string;
  bg: string;
  Icon: LucideIcon;
};

export const REACTIONS: ReactionConfig[] = [
  {
    kind: "like",
    label: "Gostei",
    color: "#0a66c2",
    bg: "#e8f4fc",
    Icon: ThumbsUp,
  },
  {
    kind: "celebrate",
    label: "Parabéns",
    color: "#44712e",
    bg: "#eaf6e4",
    Icon: PartyPopper,
  },
  {
    kind: "support",
    label: "Apoio",
    color: "#715e86",
    bg: "#f0ecf4",
    Icon: HandHeart,
  },
  {
    kind: "love",
    label: "Amei",
    color: "#b24020",
    bg: "#fce8e4",
    Icon: Heart,
  },
  {
    kind: "insightful",
    label: "Genial",
    color: "#915907",
    bg: "#fdf0d8",
    Icon: Lightbulb,
  },
  {
    kind: "funny",
    label: "Divertido",
    color: "#1a707e",
    bg: "#e4f4f7",
    Icon: Smile,
  },
];

export function getReaction(kind: ReactionKind | string): ReactionConfig {
  return (
    REACTIONS.find((r) => r.kind === kind) ?? REACTIONS[0]
  );
}
