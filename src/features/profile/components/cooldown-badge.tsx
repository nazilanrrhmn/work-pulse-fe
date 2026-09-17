import { Lock } from "lucide-react";

export default function CooldownBadge({ remaining }: Readonly<{ remaining: string }>) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
      <Lock className="size-3.5 shrink-0" />
      <span>
        NPP dapat diubah kembali dalam{" "}
        <span className="font-semibold">{remaining}</span>
      </span>
    </div>
  );
}
