import {
  Headset,
  RotateCcw,
  Scissors,
  ShieldCheck,
  Shirt,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/lib/content";

const ICONS: Record<IconKey, LucideIcon> = {
  truck: Truck,
  return: RotateCcw,
  shield: ShieldCheck,
  headset: Headset,
  fabric: Shirt,
  needle: Scissors,
  hanger: Shirt,
};

export function ConfigIcon({ name, className }: { name: IconKey; className?: string }) {
  const Icon = ICONS[name] ?? Shirt;
  return <Icon className={className} strokeWidth={1.7} aria-hidden />;
}
