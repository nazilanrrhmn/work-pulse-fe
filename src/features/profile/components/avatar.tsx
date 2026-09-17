import { User } from "lucide-react";

export default function Avatar({ name }: Readonly<{ name: string }>) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
  return (
    <div className="flex size-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-md">
      {initials || <User className="size-9" />}
    </div>
  );
}
